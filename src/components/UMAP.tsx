import { forwardRef, ForwardRefRenderFunction, useMemo, useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as TooltipPlugin,
  Legend,
  ChartOptions,
  ChartData,
  ChartDataset,
  Point,
  TooltipModel,
} from 'chart.js';
import { Scatter } from 'react-chartjs-2';
import { CreditData, DashboardData } from '@/app/[locale]/(main)/dashboard/types';
import Tooltip from './Tooltip';
import zoomPlugin from 'chartjs-plugin-zoom';
import { ZoomPluginOptions } from 'chartjs-plugin-zoom/types/options';
import { useTranslations } from 'next-intl';
import { useDashboardStore } from '@/app/stores/dashboardStore';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  TooltipPlugin,
  Legend,
  zoomPlugin,
);

interface UMAPProps extends DashboardData {
  onScenarioSelect: (scenario: CreditData) => void;
  isInfoVisible: boolean;
}
export type CreditDataWithPoint = Point & { scenario: CreditData };

interface TooltipPosition extends Point {
  translateY: '5%' | '-105%';
  translateX: '-50%' | '-100%' | '0%';
}
const UMAP: ForwardRefRenderFunction<
  ChartJS<'scatter', CreditDataWithPoint[], unknown> | undefined,
  UMAPProps
> = ({ scenarios, profile, chosenScenario, onScenarioSelect, isInfoVisible }, chartRef) => {
  const t = useTranslations('dashboard');
  const likedScenarios = useDashboardStore((state) => state.likedScenarios);

  const [tooltipData, setTooltipData] = useState<CreditData | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition | null>(null);
  const [isOverTooltip, setIsOverTooltip] = useState(false);

  useEffect(() => {
    if (!isOverTooltip) {
      const timeout = setTimeout(() => {
        setTooltipData(null);
      }, 200); // small delay to allow hover over tooltip
      return () => clearTimeout(timeout);
    }
  }, [isOverTooltip]);

  const onMouseEnter = () => {
    setIsOverTooltip(true);
  };
  const onMouseLeave = () => {
    setIsOverTooltip(false);
  };

  const handleExternalTooltip = (tooltipModel: TooltipModel<'scatter'>) => {
    if (!tooltipModel || tooltipModel.opacity === 0) return;

    const item = tooltipModel.dataPoints?.[0];
    if (item) {
      const data = (item.raw as { scenario: CreditData }).scenario;

      // Only set data if it's a new point
      if (tooltipData?.id !== data.id) {
        const translateY: TooltipPosition['translateY'] =
          tooltipModel.caretY < tooltipModel.chart.height * 0.4 ? '5%' : '-105%';

        let translateX: TooltipPosition['translateX'] = '-50%';
        if (tooltipModel.caretX >= tooltipModel.chart.width - 200) {
          translateX = '-100%';
        } else if (tooltipModel.caretX < 200) {
          translateX = '0%';
        }
        setTooltipData(data);

        setTooltipPosition({
          x: tooltipModel.caretX,
          y: tooltipModel.caretY,
          translateY,
          translateX,
        });
      }
    }
  };

  // Separate scenarios by type: original vs counterfactual
  const originalScenarios = useMemo(
    () => scenarios.filter((s) => !s.counterfactual && s.id !== chosenScenario?.id),
    [chosenScenario?.id, scenarios],
  );
  const counterfactualScenarios = useMemo(
    () => scenarios.filter((s) => s.counterfactual && s.id !== chosenScenario?.id),
    [chosenScenario?.id, scenarios],
  );

  const datasets: ChartDataset<'scatter', CreditDataWithPoint[]>[] = useMemo(() => {
    const result: ChartDataset<'scatter', CreditDataWithPoint[]>[] = [
      {
        label: t('UMAP_legend_user_text'),
        data: [
          {
            x: profile.x * 100,
            y: profile.y * 100,
            scenario: profile,
          },
        ],
        pointBorderColor: '#FF5655', // Darker red border
        pointRadius: 5,
        pointHoverRadius: 6,
        pointBackgroundColor: '#FF8F8F',
        animation: false,
      },
      {
        label: t('UMAP_legend_public_loan_data_text'),
        data: originalScenarios.map((s) => ({
          x: s.x * 100,
          y: s.y * 100,
          scenario: s,
        })),
        borderColor: '#B0B0B0',
        pointRadius: 5,
        pointHoverRadius: 6,
        backgroundColor: '#DBDBDB',
        animation: false,
        pointStyle: originalScenarios.map((scenario) =>
          likedScenarios.includes(scenario) ? 'star' : 'circle',
        ),
      },
      {
        label: t('UMAP_legend_alternative_scenarios_text'),
        data: counterfactualScenarios.map((s) => ({
          x: s.x * 100,
          y: s.y * 100,
          scenario: s,
        })),
        borderColor: '#1E40AF',
        pointRadius: 5,
        pointHoverRadius: 6,
        backgroundColor: '#3B82F6',
        pointStyle: counterfactualScenarios.map((scenario) =>
          likedScenarios.includes(scenario) ? 'star' : 'circle',
        ),
        animation: false,
      },
    ];

    // Only add "Chosen Scenario" to legend if there's actually a chosen scenario
    if (chosenScenario) {
      result.push({
        label: t('UMAP_legend_chosen_scenario_text'),
        data: [
          {
            x: chosenScenario.x * 100,
            y: chosenScenario.y * 100,
            scenario: chosenScenario,
          },
        ], // Empty dataset, only for legend
        backgroundColor: '#14E9C0',
        borderColor: '#93F5E2',
        pointRadius: 5,
        pointHoverRadius: 6,
        showLine: false,
        animation: false,
        pointStyle: likedScenarios.includes(chosenScenario) ? 'star' : 'circle',
      });
    }
    return result;
  }, [t, profile, originalScenarios, counterfactualScenarios, chosenScenario, likedScenarios]); // Added chosenScenario back to dependencies

  const data: ChartData<'scatter', CreditDataWithPoint[], unknown> = {
    datasets: datasets,
  };

  const options: ChartOptions<'scatter'> = useMemo(() => {
    const zoomOptions: ZoomPluginOptions = {
      limits: {
        x: { min: -5, max: 105, minRange: 10 },
        y: { min: -10, max: 110, minRange: 10 },
      },
      pan: {
        enabled: true,
        onPanStart({ chart, point }) {
          const area = chart.chartArea;
          const w25 = area.width * 0.25;
          const h25 = area.height * 0.25;
          if (
            point.x < area.left + w25 ||
            point.x > area.right - w25 ||
            point.y < area.top + h25 ||
            point.y > area.bottom - h25
          ) {
            return false; // abort
          }
        },
        mode: 'xy',
      },
      zoom: {
        wheel: {
          enabled: true,
          speed: 0.015,
        },
        pinch: {
          enabled: true,
        },
      },
    };

    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'bottom' as const,
        },
        tooltip: {
          enabled: false,
          external: (context) => {
            const tooltipModel = context.tooltip;
            handleExternalTooltip(tooltipModel);
          },
        },
        zoom: zoomOptions,
      },
      scales: {
        x: {
          min: 0,
          max: 100,
          grid: {
            display: false,
          },
          ticks: {
            display: false,
          },
          border: {
            display: false,
          },
        },
        y: {
          min: 0,
          max: 100,
          grid: {
            display: false,
          },
          ticks: {
            display: false,
          },
          border: {
            display: false,
          },
        },
      },
      onClick: (event, _elements, chart) => {
        const points = chart.getElementsAtEventForMode(
          event as unknown as Event,
          'nearest',
          { intersect: true },
          false,
        );

        if (points.length) {
          const { datasetIndex, index } = points[0];
          const clickedPoint = chart.data.datasets[datasetIndex].data[index] as unknown as {
            scenario: CreditData;
          };
          const scenario = clickedPoint.scenario;

          // Prevent selecting user's own profile point
          if (chart.data.datasets[datasetIndex].label === 'User') {
            return; // Do nothing if user point is clicked
          }
          // The color changes will be handled by the useEffect when chosenScenario updates
          onScenarioSelect(scenario);
        }
      },
    };
  }, [onScenarioSelect]);

  const renderTooltip = () => {
    if (!tooltipData || !tooltipPosition) return null;
    return (
      <Tooltip
        data={tooltipData}
        position={tooltipPosition}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        isUser={tooltipData.id === profile.id}
      />
    );
  };

  return (
    <div
      className={`relative h-full w-full flex-1 cursor-move ${isInfoVisible ? 'blur-xs' : 'blue-none'}`}
    >
      <Scatter ref={chartRef} data={data} options={options} />
      {renderTooltip()}
    </div>
  );
};

export default forwardRef(UMAP);

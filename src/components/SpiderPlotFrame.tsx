'use client';
import { FC } from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  ChartData,
} from 'chart.js';

import { Radar } from 'react-chartjs-2';
import { CreditData } from '@/app/[locale]/(main)/dashboard/types';
import { savingCheckingAccountsConverter } from '@/utils/savingCheckingAccountsConverter';
import { useTranslations } from 'next-intl';
import { GRAPH_COLORS } from '@/utils/colors';
ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

interface SpiderPlotFrameProps {
  profile: CreditData;
  chosenScenario?: CreditData;
}

const normalize = (value: number, min: number, max: number): number =>
  max - min === 0 ? 0.5 : (value - min) / (max - min);

const FEATURE_RANGES = {
  duration: { min: 4, max: 72 },
  savings: { min: 1, max: 3 }, // depends on your converter
  checking: { min: 1, max: 3 }, // same here
  credit_amount: { min: 250, max: 15000 },
  age: { min: 18, max: 75 },
};

const SpiderPlotFrame: FC<SpiderPlotFrameProps> = ({ profile, chosenScenario }) => {
  const t = useTranslations('dashboard');
  const data: ChartData<'radar', number[], string | string[]> = {
    labels: [
      t('spider_plot_duration_axis_title'),
      t('spider_plot_savings_account_axis_title').split(' '),
      t('spider_plot_checking_account_axis_title').split(' '),
      t('spider_plot_credit_amount_axis_title').split(' '),
      t('spider_plot_age_axis_title'),
    ],
    datasets: [
      {
        label: t('spider_plot_legend_user_text'),
        data: [
          normalize(
            profile.features.duration,
            FEATURE_RANGES.duration.min,
            FEATURE_RANGES.duration.max,
          ),
          normalize(
            savingCheckingAccountsConverter(profile.features.saving_accounts),
            FEATURE_RANGES.savings.min,
            FEATURE_RANGES.savings.max,
          ),
          normalize(
            savingCheckingAccountsConverter(profile.features.checking_account),
            FEATURE_RANGES.checking.min,
            FEATURE_RANGES.checking.max,
          ),
          normalize(
            profile.features.credit_amount,
            FEATURE_RANGES.credit_amount.min,
            FEATURE_RANGES.credit_amount.max,
          ),
          normalize(profile.features.age, FEATURE_RANGES.age.min, FEATURE_RANGES.age.max),
        ],
        backgroundColor: `${GRAPH_COLORS.userProfile}33`,
        borderColor: GRAPH_COLORS.userProfile,
        borderWidth: 1,
      },
    ],
  };

  if (chosenScenario) {
    data.datasets.push({
      label: t('spider_plot_legend_chosen_scenario_text'),
      data: [
        normalize(
          chosenScenario.features.duration,
          FEATURE_RANGES.duration.min,
          FEATURE_RANGES.duration.max,
        ),
        normalize(
          savingCheckingAccountsConverter(chosenScenario.features.saving_accounts),
          FEATURE_RANGES.savings.min,
          FEATURE_RANGES.savings.max,
        ),
        normalize(
          savingCheckingAccountsConverter(chosenScenario.features.checking_account),
          FEATURE_RANGES.checking.min,
          FEATURE_RANGES.checking.max,
        ),
        normalize(
          chosenScenario.features.credit_amount,
          FEATURE_RANGES.credit_amount.min,
          FEATURE_RANGES.credit_amount.max,
        ),
        normalize(chosenScenario.features.age, FEATURE_RANGES.age.min, FEATURE_RANGES.age.max),
      ],
      backgroundColor: `${GRAPH_COLORS.selectedNode}33`,
      borderColor: GRAPH_COLORS.selectedNode,
      borderWidth: 1,
      borderDash: [4, 4],
    });
  }

  return (
    <div className="flex h-full flex-1 flex-col rounded-2xl bg-white p-[16px] drop-shadow-md">
      <p className="text-xl font-bold">{t('spider_plot_title')}</p>
      <div className="justify-centerx flex flex-1 items-center">
        <Radar
          data={data}
          options={{
            plugins: {
              legend: {
                position: 'bottom',
              },
            },
            scales: {
              r: {
                ticks: {
                  display: false,
                },
              },
            },
            maintainAspectRatio: false,
          }}
        />
      </div>
    </div>
  );
};

export default SpiderPlotFrame;

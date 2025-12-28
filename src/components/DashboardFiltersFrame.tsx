'use client';
import React from 'react';
import Slider, { SliderProps } from 'rc-slider';
import 'rc-slider/assets/index.css';
import ArrowRotateLeft from './Icons/ArrowRotateLeft';
import { useFormatter, useTranslations } from 'next-intl';
import { useDashboardStore } from '@/app/stores/dashboardStore';
import 'rc-tooltip/assets/bootstrap.css';
import TooltipSlider from './TooltipSlider';

const blue = '#2563eb';

const DashboardFiltersFrame = () => {
  const filters = useDashboardStore((state) => state.filters);
  const setFilter = useDashboardStore((state) => state.setFilter);
  const resetFilters = useDashboardStore((state) => state.resetFilters);
  const filterRanges = useDashboardStore((state) => state.filterRanges);
  const format = useFormatter();
  const t = useTranslations('dashboard_filters');

  // Helper to get current value or default
  const getRange = (key: string, def: [number, number]) =>
    (filters && filters[key as keyof typeof filters]) || def;

  // Helper to get min/max from store or fallback
  const getMin = (key: keyof typeof filterRanges, fallback: number) =>
    filterRanges[key]?.min ?? fallback;
  const getMax = (key: keyof typeof filterRanges, fallback: number) =>
    filterRanges[key]?.max ?? fallback;

  const sliderStyles: SliderProps<number[]>['styles'] = {
    track: {
      backgroundColor: 'black',
    },
    handle: {
      borderColor: 'black',
      backgroundColor: blue,
    },
  };
  const activeDotStyle = { borderColor: 'black', backgroundColor: 'black' };

  return (
    <div className="flex w-full flex-col items-center gap-[28px] px-[24px] py-[8px]">
      <div className="flex w-full items-center justify-between">
        <p className="text-sm font-bold text-blue-800">{t('title')}</p>
        <button
          className="flex cursor-pointer items-center gap-[4px] text-xs font-bold text-blue-800"
          onClick={resetFilters}
        >
          {t('reset_button')}
          <ArrowRotateLeft size="xs" color={blue} />
        </button>
      </div>

      {/* Duration */}
      <div className="w-full gap-[8px]">
        <p className="mb-[4px] text-sm font-semibold">{t('duration_label')}</p>

        <TooltipSlider
          range
          min={getMin('duration', 8)}
          max={getMax('duration', 48)}
          value={getRange('duration', [getMin('duration', 8), getMax('duration', 48)])}
          onChange={(val) => setFilter('duration', val as [number, number])}
          styles={sliderStyles}
          activeDotStyle={activeDotStyle}
          marks={{
            [getMin('duration', 8)]: getMin('duration', 8),
            [getMax('duration', 48)]: getMax('duration', 48),
          }}
          tipFormatter={(value) => `${value}`}
        />
      </div>

      {/* Savings Account */}
      <div className="w-full gap-[8px]">
        <p className="mb-[4px] text-sm font-semibold">{t('saving_accounts_label')}</p>
        <Slider
          range
          min={0}
          max={2}
          value={getRange('saving_accounts', [0, 2])}
          dots
          styles={sliderStyles}
          activeDotStyle={activeDotStyle}
          marks={{
            0: t('account_levels.little'),
            1: t('account_levels.moderate'),
            2: t('account_levels.rich'),
          }}
          onChange={(val) => setFilter('saving_accounts', val as [number, number])}
        />
      </div>

      {/* Checking Account */}
      <div className="w-full gap-[8px]">
        <p className="mb-[4px] text-sm font-semibold">{t('checking_account_label')}</p>
        <Slider
          range
          dots
          min={0}
          max={2}
          value={getRange('checking_account', [0, 2])}
          marks={{
            0: t('account_levels.little'),
            1: t('account_levels.moderate'),
            2: t('account_levels.rich'),
          }}
          onChange={(val) => setFilter('checking_account', val as [number, number])}
          styles={sliderStyles}
          activeDotStyle={activeDotStyle}
        />
      </div>

      {/* Credit Amount */}
      <div className="w-full gap-[8px]">
        <p className="mb-[4px] text-sm font-semibold">{t('credit_amount_label')}</p>
        <TooltipSlider
          range
          min={getMin('credit_amount', 450)}
          max={getMax('credit_amount', 15000)}
          value={getRange('credit_amount', [
            getMin('credit_amount', 450),
            getMax('credit_amount', 15000),
          ])}
          onChange={(val) => setFilter('credit_amount', val as [number, number])}
          styles={sliderStyles}
          activeDotStyle={activeDotStyle}
          marks={{
            [getMin('credit_amount', 450)]: format.number(getMin('credit_amount', 450), {
              style: 'currency',
              currency: 'EUR',
            }),
            [getMax('credit_amount', 15000)]: format.number(getMax('credit_amount', 15000), {
              style: 'currency',
              currency: 'EUR',
            }),
          }}
          tipFormatter={(value) =>
            format.number(value, {
              style: 'currency',
              currency: 'EUR',
            })
          }
        />
      </div>

      {/* Age */}
      <div className="w-full">
        <p className="mb-[4px] text-sm font-semibold">{t('age_label')}</p>
        <TooltipSlider
          range
          min={getMin('age', 18)}
          max={getMax('age', 75)}
          value={getRange('age', [getMin('age', 18), getMax('age', 75)])}
          onChange={(val) => setFilter('age', val as [number, number])}
          styles={sliderStyles}
          activeDotStyle={activeDotStyle}
          marks={{ [getMin('age', 18)]: getMin('age', 18), [getMax('age', 75)]: getMax('age', 75) }}
          tipFormatter={(value) => `${value}`}
        />
      </div>
    </div>
  );
};

export default DashboardFiltersFrame;

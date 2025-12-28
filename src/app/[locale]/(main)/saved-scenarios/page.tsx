'use client';

import React, { ButtonHTMLAttributes, DetailedHTMLProps, FC } from 'react';
import LikedScenarioCard from '@/components/LikedScenarioCard';
import { CreditData, LikedScenario } from '@/app/[locale]/(main)/dashboard/types';
import jsonData from '@/python-server/german_credit_umap_with_counterfactuals.json';
import { useDashboardStore } from '@/app/stores/dashboardStore';
import Slider, { Settings } from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import ArrowLeftContained from '@/components/Icons/ArrowLeftContained';
import ArrowRightContained from '@/components/Icons/ArrowRightContained';
import { useTranslations } from 'next-intl';

const generateChangesAndVariables = (
  userProfile: CreditData,
  scenario: CreditData,
  t: ReturnType<typeof import('next-intl').useTranslations>,
) => {
  const changes: { key: keyof typeof userProfile.features; label: string }[] = [];
  const fields: { key: keyof typeof userProfile.features; labelKey: string }[] = [
    { key: 'age', labelKey: 'age_change' },
    { key: 'sex', labelKey: 'gender_change' },
    { key: 'job', labelKey: 'job_change' },
    { key: 'housing', labelKey: 'housing_change' },
    { key: 'saving_accounts', labelKey: 'saving_accounts_change' },
    { key: 'checking_account', labelKey: 'checking_account_change' },
    { key: 'credit_amount', labelKey: 'credit_amount_change' },
    { key: 'duration', labelKey: 'duration_change' },
    { key: 'purpose', labelKey: 'purpose_change' },
  ];
  console.log({
    user: userProfile.features['saving_accounts'],
    alternative: scenario.features['saving_accounts'],
  });

  fields.forEach(({ key, labelKey }) => {
    const userValue = userProfile.features[key];
    const scenarioValue = scenario.features[key];
    const changed = userValue !== scenarioValue;

    if (changed) {
      changes.push({
        key: key,
        label: t(labelKey, { fromValue: userValue, toValue: scenarioValue }),
      });
    }
  });
  console.log(changes);

  return changes;
};

const LeftButton: FC<
  DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>
> = (props) => {
  return (
    <button {...props}>
      <ArrowLeftContained />
    </button>
  );
};

const RightButton: FC<
  DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>
> = (props) => {
  return (
    <button {...props}>
      <ArrowRightContained />
    </button>
  );
};

const SavedScenariosPage: React.FC = () => {
  const t = useTranslations('saved-scenarios-page');
  const likedScenarios = useDashboardStore((state) => state.likedScenarios);
  const removeLikedScenario = useDashboardStore((state) => state.removeLikedScenario);
  const userProfile = jsonData.find((item) => item.data_type === 'user') as CreditData;

  const renderSavedScenarios = () => {
    if (likedScenarios.length === 0) {
      return (
        <div className="flex size-full items-center justify-center">
          <p>{t('no_saved_scenarios', { default: 'You have not saved any scenarios!' })}</p>
        </div>
      );
    }

    const likedScenariosWithChanges: LikedScenario[] = likedScenarios.map((value) => ({
      id: value.id,
      changes: generateChangesAndVariables(userProfile, value, t),
    }));

    if (likedScenariosWithChanges.length <= 4) {
      return (
        <div className="flex size-full items-center justify-center">
          {likedScenariosWithChanges.map((likedScenario, index) => (
            <div className="m-4" key={likedScenario.id}>
              <LikedScenarioCard
                scenario={{ id: index + 1, changes: likedScenario.changes }}
                onToggle={() => removeLikedScenario(likedScenario.id)}
              />
            </div>
          ))}
        </div>
      );
    }

    const settings: Settings = {
      dots: likedScenarios.length <= 30,
      infinite: true,
      className: 'center',
      speed: 500,
      slidesToShow: 3,
      slidesToScroll: 1,
      centerMode: true,
      adaptiveHeight: true,
      nextArrow: <RightButton />,
      prevArrow: <LeftButton />,
    };

    return (
      <div className="w-[1200px] items-center justify-center">
        <Slider {...settings}>
          {likedScenariosWithChanges.map((likedScenario, index) => (
            <div className="m-4" key={likedScenario.id}>
              <LikedScenarioCard
                scenario={{ id: index + 1, changes: likedScenario.changes }}
                onToggle={() => removeLikedScenario(likedScenario.id)}
              />
            </div>
          ))}
        </Slider>
      </div>
    );
  };

  return (
    <div className="flex size-full flex-1 flex-col">
      <p className="mb-4 pl-[24px] text-3xl font-bold">{t('saved_scenarios_title')}</p>

      <div className="flex w-full flex-1 items-center justify-center rounded-2xl bg-white drop-shadow-md">
        {renderSavedScenarios()}
      </div>
    </div>
  );
};

export default SavedScenariosPage;

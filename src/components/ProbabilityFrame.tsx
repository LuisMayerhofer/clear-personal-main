'use client';
import { FC, useState } from 'react';
import Info from './Icons/Info';
import { useTranslations } from 'next-intl';

type Risk = number | 'good' | 'bad';
interface ProbabilityFrameProps {
  profile?: Risk;
  chosenScenario?: Risk;
}

const ProbabilityFrame: FC<ProbabilityFrameProps> = ({ profile, chosenScenario }) => {
  const [isInfoVisible, setInfoVisible] = useState<boolean>(false);
  const t = useTranslations('dashboard');

  const renderProbability = (type: 'profile' | 'chosenScenario', probability?: Risk) => {
    if (probability === undefined) return;

    if (probability === 'bad') probability = 0;
    if (probability === 'good') probability = 1;

    return (
      <>
        <div
          className="absolute -bottom-[26px] h-0 w-0"
          style={{
            left: `calc(${probability * 100}% - 12px)`,
            borderLeft: '12px solid transparent',
            borderRight: '12px solid transparent',
            borderBottom: `24px solid ${type === 'profile' ? '#f87171' : '#60a5fa'}`, // red-400
          }}
        />
        <div
          className="absolute h-full w-[1px] bg-black"
          style={{
            left: `calc(${probability * 100}% - 0.5px)`,
          }}
        />
      </>
    );
  };

  const renderInfoSheet = () => {
    if (!isInfoVisible) return null;

    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="m-[12px] flex flex-col items-center justify-center gap-[16px] rounded-xl bg-white/80 p-[12px]">
          <p className="text-xl font-bold">{t('probability_bar_info_title')}</p>
          <p>
            {t.rich('probability_bar_info_description', {
              important: (chunks) => <span className="font-bold">{chunks}</span>,
            })}
          </p>
          <ul className="list-inside list-disc">
            <li>
              {t.rich('probability_bar_info_item_1', {
                low: (chunks) => <span className="text-red-400">{chunks}</span>,
                high: (chunks) => <span className="text-blue-400">{chunks}</span>,
              })}
            </li>
            <li>
              {t.rich('probability_bar_info_item_2', {
                user: (chunks) => <span className="text-red-400">{chunks}</span>,
              })}
            </li>
            <li>
              {t.rich('probability_bar_info_item_3', {
                chosen: (chunks) => <span className="text-blue-400">{chunks}</span>,
              })}
            </li>
          </ul>
        </div>
      </div>
    );
  };

  const handleMouseEnter = () => {
    setInfoVisible(true);
  };

  const handleMouseLeave = () => {
    setInfoVisible(false);
  };
  return (
    <section className="relative flex h-full flex-1 flex-col justify-between rounded-2xl bg-white p-[16px] drop-shadow-md">
      <p className="text-xl font-bold">{t('probability_bar_title')}</p>
      <div
        className={`absolute inset-0 flex items-center justify-center ${isInfoVisible ? 'blur-xs' : 'blur-none'}`}
      >
        <div className="relative mx-[16px] h-[43px] w-[90%] rounded-xl bg-gradient-to-r from-red-400 to-blue-400">
          <p className="absolute -bottom-7 left-1">{t('probability_bar_low_text')}</p>
          <p className="absolute right-1 -bottom-7">{t('probability_bar_high_text')}</p>
          {renderProbability('profile', profile)}
          {renderProbability('chosenScenario', chosenScenario)}
        </div>
      </div>
      <div
        className={`flex flex-row items-center gap-[16px] self-center ${isInfoVisible ? 'blur-xs' : 'blur-none'}`}
      >
        <div className="flex min-w-[91px] flex-col items-center">
          <div
            className="h-0 w-0"
            style={{
              borderLeft: '12px solid transparent',
              borderRight: '12px solid transparent',
              borderBottom: '24px solid #f87171', // red-400
            }}
          />
          <p>{t('probability_bar_legend_user_text')}</p>
        </div>
        <div className="flex min-w-[91px] flex-col items-center">
          <div
            className="h-0 w-0"
            style={{
              borderLeft: '12px solid transparent',
              borderRight: '12px solid transparent',
              borderBottom: '24px solid #60a5fa', // blue-400
            }}
          />
          <p>{t('probability_bar_legend_chosen_scenario_text')}</p>
        </div>
      </div>
      {renderInfoSheet()}
      <button
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="absolute right-5 bottom-5"
      >
        <Info color="#B0B0B0" />
      </button>
    </section>
  );
};

export default ProbabilityFrame;

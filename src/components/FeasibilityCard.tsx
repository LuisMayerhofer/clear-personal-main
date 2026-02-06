import { useTranslations } from 'next-intl';
import React, { FC } from 'react';

interface FeasibilityCardProps {
	feasibility: 'easy' | 'moderate' | 'difficult';
}

const FeasibilityCard: FC<FeasibilityCardProps> = ({ feasibility }) => {
	const t = useTranslations('dashboard');
	const getFeasibilityDetails = () => {
		if (feasibility === 'easy') {
			return {
				text: t('feasibility_easy'),
				textColor: 'text-green-800',
				backgroundColor: 'bg-green-100',
			};
		}

		if (feasibility === 'moderate') {
			return {
				text: t('feasibility_moderate'),
				textColor: 'text-blue-800',
				backgroundColor: 'bg-blue-100',
			};
		}
		return {
			text: t('feasibility_difficult'),
			textColor: 'text-purple-800',
			backgroundColor: 'bg-purple-100',
		};
	};

	const { text, textColor, backgroundColor } = getFeasibilityDetails();
	return (
		<div
			className={`${backgroundColor} flex w-full max-w-[300px] flex-row items-center justify-between rounded-lg px-[12px] py-[8px]`}
		>
			<p>{t('feasibility_title')}</p>
			<p className={textColor}>{text}</p>
		</div>
	);
};

export default FeasibilityCard;

import { CreditData } from '@/app/[locale]/(main)/dashboard/types';
import React, { FC } from 'react';
import Heart from './Icons/Heart';
import { Point } from 'chart.js';
import { useTranslations } from 'next-intl';
import { useDashboardStore } from '@/app/stores/dashboardStore';

interface TooltipProps {
	data: CreditData;
	position: Point & { translateX: string; translateY: string };
	onMouseEnter: () => void;
	onMouseLeave: () => void;
	isUser: boolean;
}
const Tooltip: FC<TooltipProps> = ({ data, position, onMouseEnter, onMouseLeave, isUser }) => {
	const {
		age,
		sex,
		job,
		housing,
		saving_accounts,
		checking_account,
		credit_amount,
		duration,
		purpose,
	} = data.features;
	const t = useTranslations('dashboard');
	const isLiked = useDashboardStore((state) =>
		state.likedScenarios.find((value) => value.id === data.id),
	);
	const addLikedScenario = useDashboardStore((state) => state.addLikedScenario);
	const removeLikedScenario = useDashboardStore((state) => state.removeLikedScenario);

	const handleOnLikePress = () => {
		if (isLiked) {
			removeLikedScenario(data.id);
		} else {
			addLikedScenario(data);
		}
	};

	const renderHeart = () => {
		if (isUser) {
			return null;
		}

		return (
			<button
				className="absolute top-0 right-0 bottom-0"
				onClick={handleOnLikePress}
				aria-label={isLiked ? 'Unfavorite' : 'Favorite'}
			>
				<Heart
					size="xs"
					color={isLiked ? '#FF5655' : undefined}
					fill={isLiked ? '#FF5655' : '#FFFFFF00'}
				/>
			</button>
		);
	};

	return (
		<div
			onMouseEnter={onMouseEnter}
			onMouseLeave={onMouseLeave}
			className="absolute z-50 flex w-[200px] flex-col items-center rounded rounded-xl bg-white/70 p-3 shadow-lg"
			style={{
				left: position.x,
				top: position.y,
				transform: `translate(${position.translateX}, ${position.translateY})`,
			}}
		>
			<div className="relative w-full">
				<p className="text-center text-sm font-semibold">{t('tooltip_title')}</p>
				{renderHeart()}
			</div>
			<ul className="list-inside list-disc text-xs text-gray-800">
				<li>{t('tooltip_age_text', { age })}</li>
				<li>{t('tooltip_sex_text', { sex })}</li>
				<li>{t('tooltip_job_text', { job })}</li>
				<li>{t('tooltip_housing_text', { housing })}</li>
				<li>{t('tooltip_saving_accounts_text', { saving_accounts })}</li>
				<li>{t('tooltip_checking_account_text', { checking_account })}</li>
				<li>{t('tooltip_credit_amount_text', { credit_amount })}</li>
				<li>{t('tooltip_duration_text', { duration })}</li>
				<li>
					{t('tooltip_purpose_text', { purpose: purpose === 'radio/TV' ? 'radio' : purpose })}
				</li>
			</ul>
		</div>
	);
};

export default Tooltip;

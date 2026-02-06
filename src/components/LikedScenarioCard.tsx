'use client';
import React from 'react';
import { CreditData, LikedScenario } from '@/app/[locale]/(main)/dashboard/types';
import Heart from './Icons/Heart';
import { useTranslations } from 'next-intl';

export interface LikedScenarioCardProps {
	scenario: LikedScenario;
	onToggle: () => void;
}

const featureLabelKeys: { [k in keyof CreditData['features']]: string } = {
	age: 'age_changed_feature',
	sex: 'sex_changed_feature',
	job: 'job_changed_feature',
	housing: 'housing_changed_feature',
	checking_account: 'checking_account_changed_feature',
	saving_accounts: 'saving_accounts_changed_feature',
	credit_amount: 'credit_amount_changed_feature',
	duration: 'duration_changed_feature',
	purpose: 'purpose_changed_feature',
};

const features = Object.keys(featureLabelKeys) as (keyof CreditData['features'])[];

const LikedScenarioCard: React.FC<LikedScenarioCardProps> = ({ scenario, onToggle }) => {
	const t = useTranslations('saved-scenarios-page');

	return (
		<div className="relative flex min-h-[625px] w-[320px] flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-6 text-center drop-shadow-sm">
			<button type="button" onClick={onToggle} className="absolute top-4 right-4 cursor-pointer">
				<Heart color="#FF5655" fill="#FF5655" />
			</button>
			<p className="mb-1 text-lg font-medium">{t('option_label', { id: scenario.id })}</p>
			<p className="mb-4 text-sm text-gray-500">
				{t('things_to_change', { things: scenario.changes.length })}
			</p>
			<div className="mb-4">
				{scenario.changes.map(({ label }, i) => (
					<p key={i} className="text-base">
						{label}
					</p>
				))}
			</div>
			<hr className="w-full border border-gray-200" />
			<div className="flex flex-col space-y-2">
				{features.map((feature, i) => {
					const isChanged = scenario.changes.map(({ key }) => key).includes(feature);
					return (
						<p
							key={i}
							className={
								isChanged ? 'text-base font-medium text-gray-900' : 'text-base text-gray-300'
							}
						>
							{t(featureLabelKeys[feature])}
						</p>
					);
				})}
			</div>
		</div>
	);
};

export default LikedScenarioCard;

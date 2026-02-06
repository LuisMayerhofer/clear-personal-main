import { FC } from 'react';
import DoubleArrow from './Icons/DoubleArrow';
import FeasibilityCard from './FeasibilityCard';
import { CreditData } from '@/app/[locale]/(main)/dashboard/types';
import { useTranslations } from 'next-intl';

interface ActionablesFrameProps {
	profile: CreditData;
	chosenScenario?: CreditData;
}

interface Actionable {
	field: keyof CreditData['features'];
	currentValue: number | string;
	updatedValue: number | string;
}

const actionableLocalizationMapping: Record<
	keyof CreditData['features'],
	{ current: string; updated: string }
> = {
	age: { current: 'actionables_current_age_text', updated: 'actionables_age_solvency_text' },
	sex: { current: 'actionables_current_sex_text', updated: 'actionables_sex_solvency_text' },
	job: { current: 'actionables_current_job_text', updated: 'actionables_job_solvency_text' },
	credit_amount: {
		current: 'actionables_current_credit_amount_text',
		updated: 'actionables_credit_amount_solvency_text',
	},
	duration: {
		current: 'actionables_current_duration_text',
		updated: 'actionables_duration_solvency_text',
	},
	purpose: {
		current: 'actionables_current_purpose_text',
		updated: 'actionables_purpose_solvency_text',
	},
	housing: {
		current: 'actionables_current_housing_text',
		updated: 'actionables_housing_solvency_text',
	},
	saving_accounts: {
		current: 'actionables_current_saving_accounts_text',
		updated: 'actionables_saving_accounts_solvency_text',
	},
	checking_account: {
		current: 'actionables_current_checking_account_text',
		updated: 'actionables_checking_account_solvency_text',
	},
};
export const getFeasibility = (actionables: Actionable[]): 'easy' | 'moderate' | 'difficult' => {
	const featureDifficultyMap: Record<keyof CreditData['features'], number> = {
		sex: 3,
		age: 3,
		job: 2,
		housing: 2,
		duration: 2,
		credit_amount: 2,
		purpose: 1,
		saving_accounts: 1,
		checking_account: 1,
	};

	const ordinalMappings: Record<string, string[]> = {
		saving_accounts: ['little', 'moderate', 'rich'],
		checking_account: ['little', 'moderate', 'rich'],
	};

	const normalizeDifference = (field: string, oldVal: number, newVal: number): number => {
		const diff = Math.abs(newVal - oldVal);

		const normalizationFactors: Record<string, number> = {
			credit_amount: 1000, // e.g., 1000 units = 1 difficulty step
			duration: 6, // e.g., 6 months = 1 step
			age: 5, // 5 years = 1 step
		};

		const factor = normalizationFactors[field] || 1;
		return Math.min(diff / factor, 3); // cap magnitude to 3
	};

	const calculateMagnitude = (
		field: keyof CreditData['features'],
		oldVal: number | string,
		newVal: number | string,
	): number => {
		if (typeof oldVal === 'number' && typeof newVal === 'number') {
			return normalizeDifference(field, oldVal, newVal);
		}

		if (ordinalMappings[field]) {
			const order = ordinalMappings[field];
			const i1 = order.indexOf(String(oldVal));
			const i2 = order.indexOf(String(newVal));
			if (i1 !== -1 && i2 !== -1) {
				return Math.abs(i2 - i1);
			}
		}

		return oldVal === newVal ? 0 : 1;
	};

	const totalDifficulty = actionables.reduce((sum, { field, currentValue, updatedValue }) => {
		const base = featureDifficultyMap[field] ?? 2;
		const magnitude = calculateMagnitude(field, currentValue, updatedValue);
		return sum + base + magnitude;
	}, 0);

	if (totalDifficulty <= 4) return 'easy';
	if (totalDifficulty <= 8) return 'moderate';
	return 'difficult';
};

const ActionablesFrame: FC<ActionablesFrameProps> = ({ profile, chosenScenario }) => {
	const t = useTranslations('dashboard');
	const getActionables = (p: CreditData, c?: CreditData) => {
		type FeatureKey = keyof typeof p.features;

		if (!c) {
			return [];
		}

		return (Object.keys(p.features) as FeatureKey[]).flatMap((feature) => {
			if (p.features[feature] === c.features[feature]) {
				return [];
			}

			return [
				{
					field: feature,
					currentValue: p.features[feature],
					updatedValue: c.features[feature],
				},
			];
		});
	};

	const actionables = getActionables(profile, chosenScenario);

	const renderActionables = () => {
		return actionables.map(({ field, currentValue, updatedValue }) => (
			<li key={`actionable-${field}`}>
				{t(actionableLocalizationMapping[field].current, {
					currentValue,
				})}
				<span className="align-center flex flex-row gap-[8px]">
					<DoubleArrow size="s" />
					<p className="text-blue-500">
						{t(actionableLocalizationMapping[field].updated, {
							updatedValue,
						})}
					</p>
				</span>
			</li>
		));
	};

	const renderFeasbilityCard = () => {
		if (!chosenScenario) return null;
		const feasibility = getFeasibility(actionables);
		return <FeasibilityCard feasibility={feasibility} />;
	};

	return (
		<section className="flex max-h-full w-full flex-1 flex-col items-center justify-between rounded-2xl bg-white p-[16px] drop-shadow-md">
			<div className="w-full">
				<p className="text-xl font-bold">{t('actionables_title')}</p>
				<hr className="mb-[4px]" />
			</div>
			<div className="mb-[8px] flex w-full grow flex-col overflow-y-auto">
				<div className="flex min-h-0 w-full flex-1 grow flex-col">
					<ul className="flex h-full flex-1 list-inside list-disc flex-col gap-[8px]">
						{renderActionables()}
					</ul>
				</div>
			</div>
			{renderFeasbilityCard()}
		</section>
	);
};

export default ActionablesFrame;

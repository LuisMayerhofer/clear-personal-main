export interface CreditData {
	pred?: number;
	id: number;
	features: {
		age: number;
		sex: 'female' | 'male';
		job: number; // numeric: 0 - unskilled and non-resident, 1 - unskilled and resident, 2 - skilled, 3 - highly skilled
		credit_amount: number;
		duration: number;
		purpose: 'car' | 'furniture' | 'radio/TV' | 'others';
		housing: 'free' | 'own' | 'rent';
		saving_accounts: 'little' | 'moderate' | 'rich';
		checking_account: 'little' | 'moderate' | 'rich';
	};
	x: number; // UMAP x coordinate (0-1)
	y: number; // UMAP y coordinate (0-1)
	risk: number | 'good' | 'bad'; // Probability (0-1)
	counterfactual?: boolean; // Accept both for compatibility
	data_type?: string; // Optional, for user/counterfactual identification
}

export interface LikedScenario {
	id: number;
	changes: { key: keyof CreditData['features']; label: string }[];
}

export type DashboardData = {
	scenarios: CreditData[];
	profile: CreditData;
	chosenScenario?: CreditData;
};

type FilterValue = [number, number];

interface LikedScenarioCardProps {
	scenario: LikedScenario;
	onToggle: () => void;
	t: ReturnType<typeof import('next-intl').useTranslations>;
}

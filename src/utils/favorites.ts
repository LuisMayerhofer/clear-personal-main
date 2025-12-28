// You may need to import Scenario type if not already available
export type Variable = { label: string; active: boolean };
export type Scenario = {
  option: number;
  changesCount: number;
  changes: string[];
  variables: Variable[];
  favorited: boolean;
};

export const FAVORITES_KEY = 'favorites';

export function getFavorites(): Scenario[] {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
}

export function setFavorites(favorites: Scenario[]): void {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

export function generateChangesAndVariables(
  userProfile: { features: Record<string, unknown> },
  scenario: { features: Record<string, unknown> },
) {
  const changes: string[] = [];
  const variables: { label: string; active: boolean }[] = [];

  const fields = [
    { key: 'age', label: 'Age' },
    { key: 'sex', label: 'Gender' },
    { key: 'job', label: 'Job' },
    { key: 'housing', label: 'Housing' },
    { key: 'saving_accounts', label: 'Saving Accounts' },
    { key: 'checking_account', label: 'Checking Account' },
    { key: 'credit_amount', label: 'Credit Amount' },
    { key: 'duration', label: 'Duration' },
    { key: 'purpose', label: 'Purpose' },
  ];

  fields.forEach(({ key, label }) => {
    const userValue = userProfile.features[key];
    const scenarioValue = scenario.features[key];
    const changed = userValue !== scenarioValue;
    variables.push({ label, active: changed });
    if (changed) {
      changes.push(`${label}: ${userValue} → ${scenarioValue}`);
    }
  });

  return { changes, variables };
}

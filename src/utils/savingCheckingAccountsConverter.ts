export const savingCheckingAccountsConverter = (account: 'little' | 'moderate' | 'rich') => {
	if (account === 'little') return 1;
	if (account === 'moderate') return 2;
	return 3;
};

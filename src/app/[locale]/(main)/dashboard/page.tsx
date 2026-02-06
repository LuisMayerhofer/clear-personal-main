'use client';
import ActionablesFrame from '@/components/ActionablesFrame';
import ProbabilityFrame from '@/components/ProbabilityFrame';
import SpiderPlotFrame from '@/components/SpiderPlotFrame';
import DustAndMagnet from '@/components/DustAndMagnet';
import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { CreditData, DashboardData } from './types';
import ArrowExpand from '@/components/Icons/ArrowExpand';
import Info from '@/components/Icons/Info';
import { useTranslations } from 'next-intl';
import { useDashboardStore } from '@/app/stores/dashboardStore';
import jsonData from '@/python-server/german_credit_umap_with_counterfactuals.json';
import { GRAPH_COLORS } from '@/utils/colors';

// Helper to map categorical values to numbers
const categoryToNumber = (val: string) => {
	if (val === 'little') return 0;
	if (val === 'moderate') return 1;
	if (val === 'rich') return 2;
	return -1;
};

const filterScenarios = (
	scenarios: CreditData[],
	filters: Partial<Record<keyof CreditData['features'], [number, number]>>,
	onlyImproved: boolean,
	userRisk: number,
): CreditData[] => {
	return scenarios.filter((scenario) => {
		// Optional filter for only show counterfactuals with higher chance of sucesss
		if (onlyImproved) {
			const sRisk =
				typeof scenario.risk === 'number' ? scenario.risk : scenario.risk === 'good' ? 1 : 0;
			if (sRisk < userRisk) {
				return false;
			}
		}
		if (!filters) return true;
		for (const key in filters) {
			const typedKey = key as keyof CreditData['features'];
			const [min, max] = filters[typedKey]!;
			let value = scenario.features[typedKey];
			if (typedKey === 'saving_accounts' || typedKey === 'checking_account') {
				value = categoryToNumber(value as string);
			}
			if (typeof value === 'number') {
				if (value < min || value > max) return false;
			}
		}
		return true;
	});
};

const DashboardPage = () => {
	//#region states
	const [loading, setLoading] = useState(false);
	const [data, setData] = useState<DashboardData | null>(null);
	const [isInfoVisible, setInfoVisible] = useState<boolean>(false);
	const [isUMAPextended, setUMAPextended] = useState<boolean>(false);
	//#endregion states

	//#region refs
	const dataRef = useRef<DashboardData | null>(null);
	//#endregion refs

	const t = useTranslations('dashboard');
	const filters = useDashboardStore((state) => state.filters);
	const setFilterRanges = useDashboardStore((state) => state.setFilterRanges);
	const resetFilters = useDashboardStore((state) => state.resetFilters);
	const onlyImproved = useDashboardStore((state) => state.onlyImproved);

	useEffect(() => {
		const loadDashboardData = async () => {
			try {
				setLoading(true);

				// Try to load the dynamically generated UMAP data (with counterfactuals and user data)
				let rawData: CreditData[];
				let hasUserData = false;

				try {
					const dynamicData = (await jsonData) as CreditData[];

					// Check if there's actual user data in the dynamic file
					hasUserData = dynamicData.some(
						(item) =>
							item.data_type === 'user' ||
							(typeof item.counterfactual === 'number' && item.counterfactual === 2),
					);

					if (hasUserData) {
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						rawData = dynamicData.map((item: any) => ({
							...item,
							// Convert risk to number if it's a string
							risk: (() => {
								if (typeof item.risk === 'string') {
									if (item.risk === 'bad') return 0;
									if (item.risk === 'good') return 1;
									return 0.33;
								}
								return item.risk;
							})(),
						})) as CreditData[];
						console.log('✓ Loaded dynamic UMAP data with user data -', rawData.length, 'points');
					} else {
						throw new Error(
							'No user data found in dynamic file - user must submit an application first',
						);
					}
				} catch (error) {
					console.error('Failed to load user data:', error);
					throw error; // Re-throw to be handled by the outer catch
				}

				// Remove Historic Loan Data
				const activeData = rawData.filter((item: any) => item.counterfactual !== false);

				// Step 1: Compute min/max for x and y
				const xVals = activeData.map((item) => item.x);
				const yVals = activeData.map((item) => item.y);

				const xMin = Math.min(...xVals);
				const xMax = Math.max(...xVals);
				const yMin = Math.min(...yVals);
				const yMax = Math.max(...yVals);

				// Avoid division by zero
				const normalize = (val: number, min: number, max: number): number =>
					max - min === 0 ? 0.5 : (val - min) / (max - min);

				// Find user data point if it exists (only when we have user data)
				const userData = hasUserData
					? activeData.find((item) => {
							// Check for the data_type field first (new format)
							if (item.data_type === 'user') return true;
							// Fallback to checking counterfactual field as number
							if (typeof item.counterfactual === 'number' && item.counterfactual === 2) return true;
							return false;
						})
					: null;

				// Only proceed if we have actual user data
				if (!userData) {
					throw new Error('No user data found - user must submit an application first');
				}

				// Create profile from user data
				const profile: CreditData = {
					id: userData.id,
					x: normalize(userData.x, xMin, xMax),
					y: normalize(userData.y, yMin, yMax),
					features: {
						...userData.features,
						sex:
							userData.features.sex === 'male' || userData.features.sex === 'female'
								? userData.features.sex
								: 'female',
						purpose: ['car', 'furniture', 'radio/TV', 'others'].includes(userData.features.purpose)
							? userData.features.purpose
							: 'others',
						housing: ['free', 'own', 'rent'].includes(userData.features.housing)
							? userData.features.housing
							: 'own',
						saving_accounts: ['little', 'moderate', 'rich'].includes(
							userData.features.saving_accounts,
						)
							? userData.features.saving_accounts
							: 'moderate',
						checking_account: ['little', 'moderate', 'rich'].includes(
							userData.features.checking_account,
						)
							? userData.features.checking_account
							: 'little',
					},
					// Use prediction probability if available, otherwise fallback to risk conversion
					risk:
						userData.pred !== undefined
							? userData.pred
							: (() => {
									if (typeof userData.risk === 'string') {
										if (userData.risk === 'bad') return 0;
										if (userData.risk === 'good') return 1;
										return 0.33;
									}
									return userData.risk;
								})(),
				};

				// Transform the JSON data into the format expected by UMAP
				const transformedData: DashboardData = {
					scenarios: activeData.map((item) => ({
						...item,
						x: normalize(item.x, xMin, xMax),
						y: normalize(item.y, yMin, yMax),
						// Use prediction probability if available, otherwise fallback to risk conversion
						risk:
							item.pred !== undefined
								? item.pred
								: (() => {
										if (typeof item.risk === 'string') {
											if (item.risk === 'bad') return 0;
											if (item.risk === 'good') return 1;
											return 0.33;
										}
										return item.risk;
									})(),
						counterfactual: item.counterfactual || false, // Ensure counterfactual field is present for all data
					})),
					profile,
				};

				dataRef.current = transformedData;
				setData(transformedData);

				// Calculate min/max for each numerical filter
				const features = rawData.map((item) => item.features);
				const getMinMax = (key: keyof (typeof features)[0]) => {
					const values = features
						.map((f) => f[key])
						.filter((v) => typeof v === 'number') as number[];
					return { min: Math.min(...values), max: Math.max(...values) };
				};
				setFilterRanges({
					duration: getMinMax('duration'),
					credit_amount: getMinMax('credit_amount'),
					age: getMinMax('age'),
				});
				// Reset filters when new data is loaded
				resetFilters();
			} catch (error) {
				console.error('Error loading dashboard data:', error);
			} finally {
				setLoading(false);
			}
		};

		loadDashboardData();
	}, [setFilterRanges, resetFilters]);

	//#region functions
	const handleScenarioSelect = useCallback((scenario: CreditData) => {
		setData((prev) => {
			if (!prev) return prev;
			return {
				...prev,
				chosenScenario: scenario,
			};
		});
	}, []);

	const filteredScenarios = useMemo(() => {
		if (!data || !data.scenarios || !data.profile) return [];

		const currentRisk = data.profile.risk;
		const userRisk = typeof currentRisk === 'number' ? currentRisk : currentRisk === 'good' ? 1 : 0;

		return filterScenarios(data.scenarios, filters, onlyImproved, userRisk);
	}, [data, filters, onlyImproved]);

	// 3. Early returns now safely come AFTER the hooks
	if (loading) return <p>Loading your application data...</p>;
	if (!data)
		return (
			<div className="flex h-full flex-col items-center justify-center">
				<h2 className="mb-4 text-xl font-bold">No Application Data Available</h2>
				<p className="mb-4 text-gray-600">
					Please submit a credit application first to view your dashboard.
				</p>
				<p className="text-sm text-gray-500">
					The dashboard requires user data to display personalized insights.
				</p>
			</div>
		);

	const handleInfoButtonHoverIn = () => {
		setInfoVisible(true);
	};

	const handleInfoButtonHoverOut = () => {
		setInfoVisible(false);
	};

	const handleExpandClick = () => {
		setUMAPextended((prev) => !prev);
	};
	//#endregion functions

	//#region render functions
	const renderUMAPInfo = () => {
		if (!isInfoVisible) return null;

		return (
			<div className="absolute inset-0 flex items-center justify-center">
				<div className="flex flex-col items-center gap-[24px] rounded-xl bg-white/80 p-[24px] drop-shadow-md">
					<p className="text-xl font-bold">{t('UMAP_info_title')}</p>
					<p className="text-center">
						{t.rich('UMAP_info_description', {
							br: () => <br />,
							bold: (chunks) => <span className="font-bold">{chunks}</span>,
						})}
					</p>
					<ul className="list-inside list-disc">
						<li>
							{t.rich('UMAP_info_item_1', {
								red: (chunks) => <span style={{ color: GRAPH_COLORS.userProfile }}>{chunks}</span>,
								bold: (chunks) => <span className="font-bold">{chunks}</span>,
							})}
						</li>
						<li>
							{t.rich('UMAP_info_item_2', {
								blue: (chunks) => (
									<span style={{ color: GRAPH_COLORS.counterfactualNode }}>{chunks}</span>
								),
								bold: (chunks) => <span className="font-bold">{chunks}</span>,
							})}
						</li>
						<li>
							{t.rich('UMAP_info_item_3', {
								green: (chunks) => (
									<span style={{ color: GRAPH_COLORS.selectedNode }}>{chunks}</span>
								),
								bold: (chunks) => <span className="font-bold">{chunks}</span>,
							})}
						</li>
						<li>
							{t.rich('UMAP_info_item_4', {
								bold: (chunks) => <span className="font-bold">{chunks}</span>,
							})}
						</li>
						<li>
							{t.rich('UMAP_info_item_5', {
								bold: (chunks) => <span className="font-bold">{chunks}</span>,
							})}
						</li>
					</ul>
					<p>{t('UMAP_info_footer')}</p>
				</div>
			</div>
		);
	};
	//#endregion render functions

	return (
		<main className="flex h-full w-full flex-1 flex-col gap-[18px]">
			<h1 className="flex-none text-2xl font-bold">{t('dashboard_title')}</h1>
			<div className="flex flex-1 flex-col gap-[18px]">
				<section
					className={`relative z-2 flex min-h-0 flex-1 flex-col rounded-xl bg-white p-[16px] drop-shadow-md transition-all duration-300 ${!isUMAPextended ? 'max-h-[500px]' : 'grow'}`}
				>
					<div className="flex items-center justify-between">
						<h2 className="text-xl font-semibold">{t('UMAP_title')}</h2>
					</div>

					{/* Wrap the DnM component in a flex-1 min-h-0 container */}
					<div className="min-h-0 w-full flex-1 overflow-hidden">
						<DustAndMagnet
							scenarios={filteredScenarios}
							profile={data.profile}
							chosenScenario={data.chosenScenario}
							onScenarioSelect={handleScenarioSelect}
							isInfoVisible={isInfoVisible}
						/>
					</div>

					<div className="absolute right-[16px] bottom-[16px] flex flex-col items-center gap-[1px]">
						<button onClick={handleExpandClick} className="cursor-pointer">
							<ArrowExpand color="#B0B0B0" />
						</button>
					</div>

					{renderUMAPInfo()}

					<div className="absolute top-[16px] right-[16px]">
						<button onMouseEnter={handleInfoButtonHoverIn} onMouseLeave={handleInfoButtonHoverOut}>
							<Info color="#B0B0B0" />
						</button>
					</div>
				</section>
				{!isUMAPextended && (
					<div className="flex max-h-[400px] w-full flex-1 gap-[24px]">
						<ProbabilityFrame
							profile={data.profile.risk}
							chosenScenario={data.chosenScenario?.risk}
						/>
						<SpiderPlotFrame profile={data.profile} chosenScenario={data.chosenScenario} />
						<ActionablesFrame profile={data.profile} chosenScenario={data.chosenScenario} />
					</div>
				)}
			</div>
		</main>
	);
};

export default DashboardPage;

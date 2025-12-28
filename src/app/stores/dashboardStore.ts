import { create } from 'zustand';
import { CreditData, DashboardData, FilterValue } from '../[locale]/(main)/dashboard/types';

interface DashboardState {
  data: DashboardData | null;
  setData: (data: DashboardData) => void;
  isUMAPextended: boolean;
  toggleUMAP: () => void;
  selectedScenario: CreditData | null;
  selectScenario: (scenario: CreditData) => void;
  filters: Partial<Record<keyof CreditData['features'], FilterValue>>;
  setFilter: (filterKey: keyof CreditData['features'], filterValue: FilterValue) => void;
  resetFilters: () => void;
  filterRanges: Partial<Record<keyof CreditData['features'], { min: number; max: number }>>;
  setFilterRanges: (
    ranges: Partial<Record<keyof CreditData['features'], { min: number; max: number }>>,
  ) => void;
  likedScenarios: CreditData[];
  resetLikedScenarios: () => void;
  addLikedScenario: (scenario: CreditData) => void;
  removeLikedScenario: (id: number) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  data: null,
  setData: (data) => set({ data }),
  isUMAPextended: false,
  toggleUMAP: () => set((state) => ({ isUMAPextended: !state.isUMAPextended })),
  selectedScenario: null,
  selectScenario: (scenario) => set({ selectedScenario: scenario }),
  filters: {},
  setFilter: (filterKey, filterValue) =>
    set((state) => ({ filters: { ...state.filters, [filterKey]: filterValue } })),
  resetFilters: () => set({ filters: {} }),
  filterRanges: {},
  setFilterRanges: (ranges) => set({ filterRanges: ranges }),
  likedScenarios: [],
  resetLikedScenarios: () => set(() => ({ likedScenarios: [] })),
  addLikedScenario: (scenario) =>
    set((state) => {
      const exists = state.likedScenarios.some((s) => s.id === scenario.id);
      if (!exists) {
        return {
          likedScenarios: [...state.likedScenarios, scenario],
        };
      }
      return state;
    }),
  removeLikedScenario: (id) =>
    set((state) => ({ likedScenarios: state.likedScenarios.filter((value) => value.id !== id) })),
}));

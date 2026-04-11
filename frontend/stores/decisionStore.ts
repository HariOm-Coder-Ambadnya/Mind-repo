// stores/decisionStore.ts
import { create } from 'zustand';
import { Decision, DecisionDetail, DecisionSearchParams } from '@/lib/api';

interface DecisionState {
  // State
  decisions: Decision[];
  currentDecision: DecisionDetail | null;
  isLoading: boolean;
  error: string | null;
  filters: DecisionSearchParams;
  
  // Actions
  setDecisions: (decisions: Decision[]) => void;
  setCurrentDecision: (decision: DecisionDetail | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: Partial<DecisionSearchParams>) => void;
  updateDecisionInList: (decision: Decision) => void;
  clearError: () => void;
  reset: () => void;
}

export const useDecisionStore = create<DecisionState>((set: any, get: any) => ({
  // Initial state
  decisions: [],
  currentDecision: null,
  isLoading: false,
  error: null,
  filters: {
    page: 0,
    size: 20,
    sort: 'createdAt,desc'
  },

  // Actions
  setDecisions: (decisions: Decision[]) => set({ decisions }),
  
  setCurrentDecision: (decision: DecisionDetail | null) => set({ currentDecision: decision }),
  
  setLoading: (isLoading: boolean) => set({ isLoading }),
  
  setError: (error: string | null) => set({ error }),
  
  setFilters: (newFilters: Partial<DecisionSearchParams>) => {
    const currentFilters = get().filters;
    set({ 
      filters: { 
        ...currentFilters, 
        ...newFilters,
        // Reset to page 0 when filters change (except page itself)
        ...(newFilters.page === undefined ? { page: 0 } : {})
      }
    });
  },
  
  updateDecisionInList: (updatedDecision: Decision) => {
    const { decisions } = get();
    const updatedDecisions = decisions.map((decision: Decision) => 
      decision.id === updatedDecision.id ? updatedDecision : decision
    );
    set({ decisions: updatedDecisions });
  },
  
  clearError: () => set({ error: null }),
  
  reset: () => set({
    decisions: [],
    currentDecision: null,
    isLoading: false,
    error: null,
    filters: {
      page: 0,
      size: 20,
      sort: 'createdAt,desc'
    }
  })
}));

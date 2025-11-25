// ===========================================
// UYGULAMA STATE YÖNETİMİ - CONTEXT API
// ===========================================

import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import {
  Bank, Branch, POSDevice, CommissionRate, Transaction,
  FilterOptions, CardType
} from '../types';
import {
  mockBanks, mockBranches, mockPOSDevices,
  mockCommissionRates, mockTransactions
} from '../data/mockData';
import { calculateBatchTransactions } from '../services/calculationEngine';
import { ThemeMode, loadTheme, saveTheme, applyTheme } from '../utils/storage';

// State Tipi
interface AppState {
  banks: Bank[];
  branches: Branch[];
  posDevices: POSDevice[];
  commissionRates: CommissionRate[];
  transactions: Transaction[];
  filters: FilterOptions;
  activeView: 'dashboard' | 'transactions' | 'banks' | 'simulation' | 'reports' | 'settings';
  isLoading: boolean;
  notifications: { id: string; type: 'success' | 'error' | 'info'; message: string }[];
  theme: ThemeMode;
}

// Action Tipleri
type AppAction =
  | { type: 'SET_BANKS'; payload: Bank[] }
  | { type: 'ADD_BANK'; payload: Bank }
  | { type: 'UPDATE_BANK'; payload: Bank }
  | { type: 'DELETE_BANK'; payload: string }
  | { type: 'SET_BRANCHES'; payload: Branch[] }
  | { type: 'SET_POS_DEVICES'; payload: POSDevice[] }
  | { type: 'ADD_POS_DEVICE'; payload: POSDevice }
  | { type: 'SET_COMMISSION_RATES'; payload: CommissionRate[] }
  | { type: 'ADD_COMMISSION_RATE'; payload: CommissionRate }
  | { type: 'UPDATE_COMMISSION_RATE'; payload: CommissionRate }
  | { type: 'DELETE_COMMISSION_RATE'; payload: string }
  | { type: 'SET_TRANSACTIONS'; payload: Transaction[] }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_TRANSACTION'; payload: Transaction }
  | { type: 'SET_FILTERS'; payload: FilterOptions }
  | { type: 'SET_ACTIVE_VIEW'; payload: AppState['activeView'] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'ADD_NOTIFICATION'; payload: AppState['notifications'][0] }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'SET_THEME'; payload: ThemeMode };

// Başlangıç State'i
const initialState: AppState = {
  banks: mockBanks,
  branches: mockBranches,
  posDevices: mockPOSDevices,
  commissionRates: mockCommissionRates,
  transactions: calculateBatchTransactions(mockTransactions, mockBanks, mockPOSDevices, mockCommissionRates),
  filters: {},
  activeView: 'dashboard',
  isLoading: false,
  notifications: [],
  theme: loadTheme()
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_BANKS':
      return { ...state, banks: action.payload };

    case 'ADD_BANK':
      return { ...state, banks: [...state.banks, action.payload] };

    case 'UPDATE_BANK':
      return {
        ...state,
        banks: state.banks.map(b =>
          b.id === action.payload.id ? action.payload : b
        )
      };

    case 'DELETE_BANK':
      return {
        ...state,
        banks: state.banks.filter(b => b.id !== action.payload)
      };

    case 'SET_BRANCHES':
      return { ...state, branches: action.payload };

    case 'SET_POS_DEVICES':
      return { ...state, posDevices: action.payload };

    case 'ADD_POS_DEVICE':
      return { ...state, posDevices: [...state.posDevices, action.payload] };

    case 'SET_COMMISSION_RATES':
      return { ...state, commissionRates: action.payload };

    case 'ADD_COMMISSION_RATE':
      return {
        ...state,
        commissionRates: [...state.commissionRates, action.payload]
      };

    case 'UPDATE_COMMISSION_RATE':
      return {
        ...state,
        commissionRates: state.commissionRates.map(r =>
          r.id === action.payload.id ? action.payload : r
        )
      };

    case 'DELETE_COMMISSION_RATE':
      return {
        ...state,
        commissionRates: state.commissionRates.filter(r => r.id !== action.payload)
      };

    case 'SET_TRANSACTIONS':
      return { ...state, transactions: action.payload };

    case 'ADD_TRANSACTION':
      const newTransactions = [action.payload, ...state.transactions];
      return {
        ...state,
        transactions: calculateBatchTransactions(
          newTransactions,
          state.banks,
          state.posDevices,
          state.commissionRates
        )
      };

    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map(t =>
          t.id === action.payload.id ? action.payload : t
        )
      };

    case 'SET_FILTERS':
      return { ...state, filters: action.payload };

    case 'SET_ACTIVE_VIEW':
      return { ...state, activeView: action.payload };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [...state.notifications, action.payload]
      };

    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      };

    case 'SET_THEME':
      saveTheme(action.payload);
      applyTheme(action.payload);
      return {
        ...state,
        theme: action.payload
      };

    default:
      return state;
  }
}

// Context
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

// Provider
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Apply theme on mount and listen for system theme changes
  useEffect(() => {
    applyTheme(state.theme);

    // Listen for system theme changes when in auto mode
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (state.theme === 'auto') {
        applyTheme('auto');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [state.theme]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = React.useMemo(() => ({ state, dispatch }), [state, dispatch]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

// Custom Hook
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

// Yardımcı Hooks
export function useFilteredTransactions() {
  const { state } = useApp();
  const { transactions, filters } = state;

  return React.useMemo(() => {
    return transactions.filter(txn => {
      if (filters.dateFrom && new Date(txn.date) < filters.dateFrom) return false;
      if (filters.dateTo && new Date(txn.date) > filters.dateTo) return false;
      if (filters.bankIds?.length && !filters.bankIds.includes(txn.bankId)) return false;
      if (filters.branchIds?.length && !filters.branchIds.includes(txn.branchId)) return false;
      if (filters.posIds?.length && !filters.posIds.includes(txn.posId)) return false;
      if (filters.cardTypes?.length && !filters.cardTypes.includes(txn.cardType)) return false;
      if (filters.minAmount && txn.grossAmount < filters.minAmount) return false;
      if (filters.maxAmount && txn.grossAmount > filters.maxAmount) return false;
      return true;
    });
  }, [transactions, filters]);
}

export function useBankById(bankId: string) {
  const { state } = useApp();
  return React.useMemo(() => state.banks.find(b => b.id === bankId), [state.banks, bankId]);
}

export function usePOSById(posId: string) {
  const { state } = useApp();
  return React.useMemo(() => state.posDevices.find(p => p.id === posId), [state.posDevices, posId]);
}

export function useBranchById(branchId: string) {
  const { state } = useApp();
  return React.useMemo(() => state.branches.find(b => b.id === branchId), [state.branches, branchId]);
}

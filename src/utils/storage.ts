// ===========================================
// LOCALSTORAGE PERSISTENCE UTILITY
// ===========================================

import { Transaction, Bank, POSDevice, CommissionRate, Branch } from '../types';

const STORAGE_KEYS = {
  THEME: 'posum_theme',
  TRANSACTIONS: 'posum_transactions',
  BANKS: 'posum_banks',
  BRANCHES: 'posum_branches',
  POS_DEVICES: 'posum_pos_devices',
  COMMISSION_RATES: 'posum_commission_rates',
  SETTINGS: 'posum_settings',
  LANGUAGE: 'posum_language',
} as const;

export type ThemeMode = 'light' | 'dark' | 'auto';

interface AppSettings {
  currency: string;
  dateFormat: string;
  timezone: string;
  notificationsEnabled: boolean;
}

// Generic LocalStorage Functions
function saveToLocalStorage<T>(key: string, data: T): boolean {
  try {
    const serialized = JSON.stringify(data);
    localStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    console.error(`Error saving to localStorage (${key}):`, error);
    return false;
  }
}

function loadFromLocalStorage<T>(key: string): T | null {
  try {
    const serialized = localStorage.getItem(key);
    if (serialized === null) {
      return null;
    }
    return JSON.parse(serialized) as T;
  } catch (error) {
    console.error(`Error loading from localStorage (${key}):`, error);
    return null;
  }
}

function removeFromLocalStorage(key: string): boolean {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing from localStorage (${key}):`, error);
    return false;
  }
}

// Theme Functions
export function saveTheme(theme: ThemeMode): boolean {
  return saveToLocalStorage(STORAGE_KEYS.THEME, theme);
}

export function loadTheme(): ThemeMode {
  const theme = loadFromLocalStorage<ThemeMode>(STORAGE_KEYS.THEME);
  return theme || 'light';
}

export function applyTheme(theme: ThemeMode): void {
  const root = document.documentElement;

  if (theme === 'auto') {
    // Sistem tercihini kontrol et
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  } else if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

// Transaction Functions
export function saveTransactions(transactions: Transaction[]): boolean {
  return saveToLocalStorage(STORAGE_KEYS.TRANSACTIONS, transactions);
}

export function loadTransactions(): Transaction[] | null {
  return loadFromLocalStorage<Transaction[]>(STORAGE_KEYS.TRANSACTIONS);
}

// Bank Functions
export function saveBanks(banks: Bank[]): boolean {
  return saveToLocalStorage(STORAGE_KEYS.BANKS, banks);
}

export function loadBanks(): Bank[] | null {
  return loadFromLocalStorage<Bank[]>(STORAGE_KEYS.BANKS);
}

// Branch Functions
export function saveBranches(branches: Branch[]): boolean {
  return saveToLocalStorage(STORAGE_KEYS.BRANCHES, branches);
}

export function loadBranches(): Branch[] | null {
  return loadFromLocalStorage<Branch[]>(STORAGE_KEYS.BRANCHES);
}

// POS Device Functions
export function savePOSDevices(devices: POSDevice[]): boolean {
  return saveToLocalStorage(STORAGE_KEYS.POS_DEVICES, devices);
}

export function loadPOSDevices(): POSDevice[] | null {
  return loadFromLocalStorage<POSDevice[]>(STORAGE_KEYS.POS_DEVICES);
}

// Commission Rate Functions
export function saveCommissionRates(rates: CommissionRate[]): boolean {
  return saveToLocalStorage(STORAGE_KEYS.COMMISSION_RATES, rates);
}

export function loadCommissionRates(): CommissionRate[] | null {
  return loadFromLocalStorage<CommissionRate[]>(STORAGE_KEYS.COMMISSION_RATES);
}

// Settings Functions
export function saveSettings(settings: AppSettings): boolean {
  return saveToLocalStorage(STORAGE_KEYS.SETTINGS, settings);
}

export function loadSettings(): AppSettings | null {
  return loadFromLocalStorage<AppSettings>(STORAGE_KEYS.SETTINGS);
}

// Language Functions
export function saveLanguage(language: string): boolean {
  return saveToLocalStorage(STORAGE_KEYS.LANGUAGE, language);
}

export function loadLanguage(): string | null {
  return loadFromLocalStorage<string>(STORAGE_KEYS.LANGUAGE);
}

// Clear All Data
export function clearAllStorage(): boolean {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
}

// Export/Import Functions
export function exportData(): string {
  const data = {
    theme: loadTheme(),
    transactions: loadTransactions(),
    banks: loadBanks(),
    branches: loadBranches(),
    posDevices: loadPOSDevices(),
    commissionRates: loadCommissionRates(),
    settings: loadSettings(),
    language: loadLanguage(),
    exportDate: new Date().toISOString(),
  };
  return JSON.stringify(data, null, 2);
}

export function importData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);

    if (data.theme) saveTheme(data.theme);
    if (data.transactions) saveTransactions(data.transactions);
    if (data.banks) saveBanks(data.banks);
    if (data.branches) saveBranches(data.branches);
    if (data.posDevices) savePOSDevices(data.posDevices);
    if (data.commissionRates) saveCommissionRates(data.commissionRates);
    if (data.settings) saveSettings(data.settings);
    if (data.language) saveLanguage(data.language);

    return true;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
}

// Storage Info
export function getStorageInfo(): {
  used: number;
  available: number;
  percentage: number;
} {
  let used = 0;
  try {
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        used += localStorage[key].length + key.length;
      }
    }
  } catch (error) {
    console.error('Error calculating storage size:', error);
  }

  // LocalStorage limit is typically 5-10MB, we'll assume 5MB
  const available = 5 * 1024 * 1024; // 5MB in bytes
  const percentage = (used / available) * 100;

  return {
    used,
    available,
    percentage: Math.round(percentage * 100) / 100,
  };
}

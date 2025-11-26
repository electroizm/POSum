// ===========================================
// BANKA POS MUTABAKAT SİSTEMİ - TİP TANIMLAMALARI
// ===========================================

// Kullanıcı Bilgileri
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'viewer';
  avatar?: string;
  createdAt: Date;
  lastLogin?: Date;
}

// Auth State
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Login Credentials
export interface LoginCredentials {
  email: string;
  password: string;
}

// Register Data
export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

// Banka Bilgileri
export interface Bank {
  id: string;
  name: string;
  logo: string;
  defaultEftFee: number; // TL cinsinden EFT ücreti
  agreementType: 'standart' | 'ozel' | 'kurumsal';
  color: string; // UI için renk kodu
}

// Şube (Mağaza) Bilgileri
export interface Branch {
  id: string;
  name: string;
  location: string;
  city: string;
  posDevices: string[]; // POS cihaz ID'leri
}

// POS Cihazı
export interface POSDevice {
  id: string;
  bankId: string;
  branchId: string;
  terminalNo: string;
  settlementType: 'nextDay' | 'blocked' | 'hybrid';
  blockedDays?: number; // Bloke gün sayısı
  hybridRatio?: { nextDay: number; blocked: number }; // Hibrit oran
  monthlyMaintenanceFee: number; // Aylık bakım ücreti
  isActive: boolean;
}

// Kart Tipi
export type CardType = 'bireysel' | 'ticari';

// Komisyon Matrisi
export interface CommissionRate {
  id: string;
  bankId: string;
  posId?: string; // Belirli POS için özel oran (opsiyonel)
  cardType: CardType;
  installmentCount: number; // 1 = tek çekim, 2-12 = taksit
  rate: number; // Yüzde olarak komisyon oranı
  validFrom: Date;
  validTo?: Date;
}

// İşlem (Transaction)
export interface Transaction {
  id: string;
  date: Date;
  grossAmount: number; // Brüt tutar
  cardType: CardType;
  installmentCount: number;
  posId: string;
  branchId: string;
  bankId: string;
  // Hesaplanan değerler
  commissionRate?: number;
  commissionAmount?: number;
  netAmount?: number;
  eftFee?: number;
  finalAmount?: number;
  valueDate?: Date; // Paranın hesaba geçeceği tarih
  status: 'beklemede' | 'islendi' | 'transfer_edildi';
  cardLastFour?: string;
  authCode?: string;
}

// Hesaplama Sonucu
export interface CalculationResult {
  grossAmount: number;
  commissionRate: number;
  commissionAmount: number;
  netAmount: number;
  eftFee: number;
  maintenanceFee: number;
  finalAmount: number;
  valueDate: Date;
  breakdownText: string;
}

// Simülasyon Karşılaştırma
export interface SimulationComparison {
  scenario1: CalculationResult & { bankName: string; posInfo: string };
  scenario2: CalculationResult & { bankName: string; posInfo: string };
  difference: number;
  betterOption: 1 | 2;
  savingsPercentage: number;
}

// Rapor Verileri
export interface DailyReport {
  date: Date;
  totalGross: number;
  totalCommission: number;
  totalEftFee: number;
  totalNet: number;
  transactionCount: number;
  byBank: {
    bankId: string;
    bankName: string;
    gross: number;
    commission: number;
    net: number;
    count: number;
  }[];
}

export interface MonthlyReport {
  month: string;
  year: number;
  dailyReports: DailyReport[];
  totalGross: number;
  totalCommission: number;
  totalEftFee: number;
  totalMaintenanceFee: number;
  totalNet: number;
  expectedCashFlow: { date: Date; amount: number }[];
  costBreakdown: {
    category: string;
    amount: number;
    percentage: number;
  }[];
}

// Nakit Akışı Tahmini
export interface CashFlowForecast {
  date: Date;
  expectedAmount: number;
  transactions: Transaction[];
  bankBreakdown: {
    bankId: string;
    bankName: string;
    amount: number;
  }[];
}

// Filtre Seçenekleri
export interface FilterOptions {
  dateFrom?: Date;
  dateTo?: Date;
  bankIds?: string[];
  branchIds?: string[];
  posIds?: string[];
  cardTypes?: CardType[];
  minAmount?: number;
  maxAmount?: number;
}

// Form Verileri
export interface TransactionFormData {
  date: string;
  grossAmount: number;
  cardType: CardType;
  installmentCount: number;
  posId: string;
  cardLastFour?: string;
  authCode?: string;
}

export interface BankFormData {
  name: string;
  logo: string;
  defaultEftFee: number;
  agreementType: 'standart' | 'ozel' | 'kurumsal';
  color: string;
}

export interface CommissionRateFormData {
  bankId: string;
  posId?: string;
  cardType: CardType;
  installmentCount: number;
  rate: number;
}

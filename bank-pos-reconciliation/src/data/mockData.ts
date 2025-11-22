// ===========================================
// MOCK DATA - TÜRK BANKALARI VE POS SİSTEMİ
// ===========================================

import { Bank, Branch, POSDevice, CommissionRate, Transaction, CardType } from '../types';

// Türk Bankaları
export const mockBanks: Bank[] = [
  {
    id: 'ziraat',
    name: 'Ziraat Bankası',
    logo: '🏛️',
    defaultEftFee: 12.80,
    agreementType: 'kurumsal',
    color: '#00a651'
  },
  {
    id: 'garanti',
    name: 'Garanti BBVA',
    logo: '🏦',
    defaultEftFee: 15.00,
    agreementType: 'ozel',
    color: '#00854d'
  },
  {
    id: 'akbank',
    name: 'Akbank',
    logo: '🔴',
    defaultEftFee: 14.50,
    agreementType: 'standart',
    color: '#e31e24'
  },
  {
    id: 'yapikredi',
    name: 'Yapı Kredi',
    logo: '🔵',
    defaultEftFee: 13.75,
    agreementType: 'ozel',
    color: '#004990'
  },
  {
    id: 'isbank',
    name: 'İş Bankası',
    logo: '🌟',
    defaultEftFee: 14.00,
    agreementType: 'kurumsal',
    color: '#00529c'
  },
  {
    id: 'halkbank',
    name: 'Halkbank',
    logo: '🏠',
    defaultEftFee: 11.50,
    agreementType: 'standart',
    color: '#003b7c'
  }
];

// Şubeler (Mağazalar)
export const mockBranches: Branch[] = [
  {
    id: 'branch-1',
    name: 'Kadıköy Mağaza',
    location: 'Kadıköy Çarşı',
    city: 'İstanbul',
    posDevices: ['pos-ziraat-1', 'pos-garanti-1', 'pos-akbank-1']
  },
  {
    id: 'branch-2',
    name: 'Beşiktaş Mağaza',
    location: 'Beşiktaş Merkez',
    city: 'İstanbul',
    posDevices: ['pos-ziraat-2', 'pos-yapikredi-1']
  },
  {
    id: 'branch-3',
    name: 'Ankara Kızılay',
    location: 'Kızılay AVM',
    city: 'Ankara',
    posDevices: ['pos-isbank-1', 'pos-halkbank-1', 'pos-garanti-2']
  },
  {
    id: 'branch-4',
    name: 'İzmir Alsancak',
    location: 'Alsancak Kordon',
    city: 'İzmir',
    posDevices: ['pos-akbank-2', 'pos-yapikredi-2']
  }
];

// POS Cihazları
export const mockPOSDevices: POSDevice[] = [
  // Ziraat POS'ları
  {
    id: 'pos-ziraat-1',
    bankId: 'ziraat',
    branchId: 'branch-1',
    terminalNo: 'ZRT001',
    settlementType: 'nextDay',
    monthlyMaintenanceFee: 150,
    isActive: true
  },
  {
    id: 'pos-ziraat-2',
    bankId: 'ziraat',
    branchId: 'branch-2',
    terminalNo: 'ZRT002',
    settlementType: 'blocked',
    blockedDays: 7,
    monthlyMaintenanceFee: 120,
    isActive: true
  },
  // Garanti POS'ları
  {
    id: 'pos-garanti-1',
    bankId: 'garanti',
    branchId: 'branch-1',
    terminalNo: 'GRT001',
    settlementType: 'nextDay',
    monthlyMaintenanceFee: 175,
    isActive: true
  },
  {
    id: 'pos-garanti-2',
    bankId: 'garanti',
    branchId: 'branch-3',
    terminalNo: 'GRT002',
    settlementType: 'hybrid',
    hybridRatio: { nextDay: 70, blocked: 30 },
    blockedDays: 14,
    monthlyMaintenanceFee: 160,
    isActive: true
  },
  // Akbank POS'ları
  {
    id: 'pos-akbank-1',
    bankId: 'akbank',
    branchId: 'branch-1',
    terminalNo: 'AKB001',
    settlementType: 'nextDay',
    monthlyMaintenanceFee: 165,
    isActive: true
  },
  {
    id: 'pos-akbank-2',
    bankId: 'akbank',
    branchId: 'branch-4',
    terminalNo: 'AKB002',
    settlementType: 'blocked',
    blockedDays: 5,
    monthlyMaintenanceFee: 140,
    isActive: true
  },
  // Yapı Kredi POS'ları
  {
    id: 'pos-yapikredi-1',
    bankId: 'yapikredi',
    branchId: 'branch-2',
    terminalNo: 'YKB001',
    settlementType: 'nextDay',
    monthlyMaintenanceFee: 180,
    isActive: true
  },
  {
    id: 'pos-yapikredi-2',
    bankId: 'yapikredi',
    branchId: 'branch-4',
    terminalNo: 'YKB002',
    settlementType: 'hybrid',
    hybridRatio: { nextDay: 60, blocked: 40 },
    blockedDays: 10,
    monthlyMaintenanceFee: 155,
    isActive: true
  },
  // İş Bankası POS
  {
    id: 'pos-isbank-1',
    bankId: 'isbank',
    branchId: 'branch-3',
    terminalNo: 'ISB001',
    settlementType: 'nextDay',
    monthlyMaintenanceFee: 170,
    isActive: true
  },
  // Halkbank POS
  {
    id: 'pos-halkbank-1',
    bankId: 'halkbank',
    branchId: 'branch-3',
    terminalNo: 'HLK001',
    settlementType: 'blocked',
    blockedDays: 3,
    monthlyMaintenanceFee: 100,
    isActive: true
  }
];

// Komisyon Matrisi - KRİTİK HESAPLAMA VERİSİ
export const mockCommissionRates: CommissionRate[] = [
  // ============ ZİRAAT BANKASI ============
  // Bireysel Kartlar
  { id: 'cr-z-b-1', bankId: 'ziraat', cardType: 'bireysel', installmentCount: 1, rate: 1.69, validFrom: new Date('2024-01-01') },
  { id: 'cr-z-b-2', bankId: 'ziraat', cardType: 'bireysel', installmentCount: 2, rate: 2.49, validFrom: new Date('2024-01-01') },
  { id: 'cr-z-b-3', bankId: 'ziraat', cardType: 'bireysel', installmentCount: 3, rate: 2.99, validFrom: new Date('2024-01-01') },
  { id: 'cr-z-b-4', bankId: 'ziraat', cardType: 'bireysel', installmentCount: 4, rate: 3.49, validFrom: new Date('2024-01-01') },
  { id: 'cr-z-b-5', bankId: 'ziraat', cardType: 'bireysel', installmentCount: 5, rate: 3.99, validFrom: new Date('2024-01-01') },
  { id: 'cr-z-b-6', bankId: 'ziraat', cardType: 'bireysel', installmentCount: 6, rate: 4.29, validFrom: new Date('2024-01-01') },
  { id: 'cr-z-b-9', bankId: 'ziraat', cardType: 'bireysel', installmentCount: 9, rate: 5.29, validFrom: new Date('2024-01-01') },
  { id: 'cr-z-b-12', bankId: 'ziraat', cardType: 'bireysel', installmentCount: 12, rate: 6.29, validFrom: new Date('2024-01-01') },
  // Ticari Kartlar (daha yüksek oranlar)
  { id: 'cr-z-t-1', bankId: 'ziraat', cardType: 'ticari', installmentCount: 1, rate: 2.29, validFrom: new Date('2024-01-01') },
  { id: 'cr-z-t-2', bankId: 'ziraat', cardType: 'ticari', installmentCount: 2, rate: 4.50, validFrom: new Date('2024-01-01') },
  { id: 'cr-z-t-3', bankId: 'ziraat', cardType: 'ticari', installmentCount: 3, rate: 5.10, validFrom: new Date('2024-01-01') },
  { id: 'cr-z-t-6', bankId: 'ziraat', cardType: 'ticari', installmentCount: 6, rate: 6.50, validFrom: new Date('2024-01-01') },
  { id: 'cr-z-t-12', bankId: 'ziraat', cardType: 'ticari', installmentCount: 12, rate: 8.50, validFrom: new Date('2024-01-01') },

  // ============ GARANTİ BBVA ============
  // Bireysel Kartlar
  { id: 'cr-g-b-1', bankId: 'garanti', cardType: 'bireysel', installmentCount: 1, rate: 1.79, validFrom: new Date('2024-01-01') },
  { id: 'cr-g-b-2', bankId: 'garanti', cardType: 'bireysel', installmentCount: 2, rate: 2.69, validFrom: new Date('2024-01-01') },
  { id: 'cr-g-b-3', bankId: 'garanti', cardType: 'bireysel', installmentCount: 3, rate: 3.19, validFrom: new Date('2024-01-01') },
  { id: 'cr-g-b-6', bankId: 'garanti', cardType: 'bireysel', installmentCount: 6, rate: 4.49, validFrom: new Date('2024-01-01') },
  { id: 'cr-g-b-9', bankId: 'garanti', cardType: 'bireysel', installmentCount: 9, rate: 5.49, validFrom: new Date('2024-01-01') },
  { id: 'cr-g-b-12', bankId: 'garanti', cardType: 'bireysel', installmentCount: 12, rate: 6.49, validFrom: new Date('2024-01-01') },
  // Ticari Kartlar
  { id: 'cr-g-t-1', bankId: 'garanti', cardType: 'ticari', installmentCount: 1, rate: 2.39, validFrom: new Date('2024-01-01') },
  { id: 'cr-g-t-3', bankId: 'garanti', cardType: 'ticari', installmentCount: 3, rate: 5.29, validFrom: new Date('2024-01-01') },
  { id: 'cr-g-t-6', bankId: 'garanti', cardType: 'ticari', installmentCount: 6, rate: 6.79, validFrom: new Date('2024-01-01') },
  { id: 'cr-g-t-12', bankId: 'garanti', cardType: 'ticari', installmentCount: 12, rate: 8.79, validFrom: new Date('2024-01-01') },

  // ============ AKBANK ============
  // Bireysel Kartlar
  { id: 'cr-a-b-1', bankId: 'akbank', cardType: 'bireysel', installmentCount: 1, rate: 1.59, validFrom: new Date('2024-01-01') },
  { id: 'cr-a-b-2', bankId: 'akbank', cardType: 'bireysel', installmentCount: 2, rate: 2.39, validFrom: new Date('2024-01-01') },
  { id: 'cr-a-b-3', bankId: 'akbank', cardType: 'bireysel', installmentCount: 3, rate: 2.89, validFrom: new Date('2024-01-01') },
  { id: 'cr-a-b-6', bankId: 'akbank', cardType: 'bireysel', installmentCount: 6, rate: 4.19, validFrom: new Date('2024-01-01') },
  { id: 'cr-a-b-12', bankId: 'akbank', cardType: 'bireysel', installmentCount: 12, rate: 6.19, validFrom: new Date('2024-01-01') },
  // Ticari Kartlar
  { id: 'cr-a-t-1', bankId: 'akbank', cardType: 'ticari', installmentCount: 1, rate: 2.19, validFrom: new Date('2024-01-01') },
  { id: 'cr-a-t-3', bankId: 'akbank', cardType: 'ticari', installmentCount: 3, rate: 4.99, validFrom: new Date('2024-01-01') },
  { id: 'cr-a-t-6', bankId: 'akbank', cardType: 'ticari', installmentCount: 6, rate: 6.39, validFrom: new Date('2024-01-01') },
  { id: 'cr-a-t-12', bankId: 'akbank', cardType: 'ticari', installmentCount: 12, rate: 8.39, validFrom: new Date('2024-01-01') },

  // ============ YAPI KREDİ ============
  // Bireysel Kartlar
  { id: 'cr-y-b-1', bankId: 'yapikredi', cardType: 'bireysel', installmentCount: 1, rate: 1.75, validFrom: new Date('2024-01-01') },
  { id: 'cr-y-b-3', bankId: 'yapikredi', cardType: 'bireysel', installmentCount: 3, rate: 3.09, validFrom: new Date('2024-01-01') },
  { id: 'cr-y-b-6', bankId: 'yapikredi', cardType: 'bireysel', installmentCount: 6, rate: 4.39, validFrom: new Date('2024-01-01') },
  { id: 'cr-y-b-12', bankId: 'yapikredi', cardType: 'bireysel', installmentCount: 12, rate: 6.39, validFrom: new Date('2024-01-01') },
  // Ticari Kartlar
  { id: 'cr-y-t-1', bankId: 'yapikredi', cardType: 'ticari', installmentCount: 1, rate: 2.35, validFrom: new Date('2024-01-01') },
  { id: 'cr-y-t-3', bankId: 'yapikredi', cardType: 'ticari', installmentCount: 3, rate: 5.19, validFrom: new Date('2024-01-01') },
  { id: 'cr-y-t-6', bankId: 'yapikredi', cardType: 'ticari', installmentCount: 6, rate: 6.69, validFrom: new Date('2024-01-01') },

  // ============ İŞ BANKASI ============
  // Bireysel Kartlar
  { id: 'cr-i-b-1', bankId: 'isbank', cardType: 'bireysel', installmentCount: 1, rate: 1.65, validFrom: new Date('2024-01-01') },
  { id: 'cr-i-b-3', bankId: 'isbank', cardType: 'bireysel', installmentCount: 3, rate: 2.95, validFrom: new Date('2024-01-01') },
  { id: 'cr-i-b-6', bankId: 'isbank', cardType: 'bireysel', installmentCount: 6, rate: 4.25, validFrom: new Date('2024-01-01') },
  { id: 'cr-i-b-12', bankId: 'isbank', cardType: 'bireysel', installmentCount: 12, rate: 6.25, validFrom: new Date('2024-01-01') },
  // Ticari Kartlar
  { id: 'cr-i-t-1', bankId: 'isbank', cardType: 'ticari', installmentCount: 1, rate: 2.25, validFrom: new Date('2024-01-01') },
  { id: 'cr-i-t-3', bankId: 'isbank', cardType: 'ticari', installmentCount: 3, rate: 5.05, validFrom: new Date('2024-01-01') },
  { id: 'cr-i-t-6', bankId: 'isbank', cardType: 'ticari', installmentCount: 6, rate: 6.55, validFrom: new Date('2024-01-01') },

  // ============ HALKBANK ============
  // Bireysel Kartlar
  { id: 'cr-h-b-1', bankId: 'halkbank', cardType: 'bireysel', installmentCount: 1, rate: 1.55, validFrom: new Date('2024-01-01') },
  { id: 'cr-h-b-3', bankId: 'halkbank', cardType: 'bireysel', installmentCount: 3, rate: 2.85, validFrom: new Date('2024-01-01') },
  { id: 'cr-h-b-6', bankId: 'halkbank', cardType: 'bireysel', installmentCount: 6, rate: 4.15, validFrom: new Date('2024-01-01') },
  { id: 'cr-h-b-12', bankId: 'halkbank', cardType: 'bireysel', installmentCount: 12, rate: 6.15, validFrom: new Date('2024-01-01') },
  // Ticari Kartlar
  { id: 'cr-h-t-1', bankId: 'halkbank', cardType: 'ticari', installmentCount: 1, rate: 2.15, validFrom: new Date('2024-01-01') },
  { id: 'cr-h-t-3', bankId: 'halkbank', cardType: 'ticari', installmentCount: 3, rate: 4.95, validFrom: new Date('2024-01-01') },
  { id: 'cr-h-t-6', bankId: 'halkbank', cardType: 'ticari', installmentCount: 6, rate: 6.45, validFrom: new Date('2024-01-01') },
];

// Örnek İşlemler Üreteci
export function generateMockTransactions(count: number = 100): Transaction[] {
  const transactions: Transaction[] = [];
  const cardTypes: CardType[] = ['bireysel', 'ticari'];
  const installments = [1, 2, 3, 6, 9, 12];
  const statuses: Transaction['status'][] = ['beklemede', 'islendi', 'transfer_edildi'];

  for (let i = 0; i < count; i++) {
    const pos = mockPOSDevices[Math.floor(Math.random() * mockPOSDevices.length)];
    const daysAgo = Math.floor(Math.random() * 30);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);

    // Gerçekçi tutar dağılımı
    const amounts = [150, 250, 500, 750, 1000, 1500, 2000, 3000, 5000, 7500, 10000, 15000, 20000];
    const grossAmount = amounts[Math.floor(Math.random() * amounts.length)] + Math.random() * 100;

    transactions.push({
      id: `txn-${i + 1}`,
      date: date,
      grossAmount: Math.round(grossAmount * 100) / 100,
      cardType: cardTypes[Math.floor(Math.random() * cardTypes.length)],
      installmentCount: installments[Math.floor(Math.random() * installments.length)],
      posId: pos.id,
      branchId: pos.branchId,
      bankId: pos.bankId,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      cardLastFour: String(Math.floor(1000 + Math.random() * 9000)),
      authCode: String(Math.floor(100000 + Math.random() * 900000))
    });
  }

  return transactions.sort((a, b) => b.date.getTime() - a.date.getTime());
}

// Varsayılan işlemler
export const mockTransactions = generateMockTransactions(150);

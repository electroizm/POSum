// ===========================================
// HESAPLAMA MOTORU - SİSTEMİN BEYNİ
// ===========================================

import {
  Bank, POSDevice, CommissionRate, Transaction,
  CalculationResult, SimulationComparison, CardType,
  CashFlowForecast, DailyReport
} from '../types';
import { mockBanks, mockPOSDevices, mockCommissionRates } from '../data/mockData';
import { addBusinessDays, format, startOfDay, isSameDay, isWeekend } from 'date-fns';
import { tr } from 'date-fns/locale';

// ===========================================
// RATE FINDER - KOMİSYON ORANI BULUCU
// ===========================================

/**
 * Dinamik komisyon oranı bulucu
 * Banka, kart tipi ve taksit sayısına göre doğru oranı bulur
 */
export function findCommissionRate(
  bankId: string,
  cardType: CardType,
  installmentCount: number,
  posId?: string,
  rates: CommissionRate[] = mockCommissionRates
): number {
  // Önce POS'a özel oran var mı kontrol et
  if (posId) {
    const posSpecificRate = rates.find(
      r => r.posId === posId &&
           r.cardType === cardType &&
           r.installmentCount === installmentCount
    );
    if (posSpecificRate) return posSpecificRate.rate;
  }

  // Banka geneli oranı bul
  let rate = rates.find(
    r => r.bankId === bankId &&
         r.cardType === cardType &&
         r.installmentCount === installmentCount &&
         !r.posId
  );

  // Eğer tam eşleşme yoksa, en yakın taksit sayısını bul
  if (!rate) {
    const bankRates = rates.filter(
      r => r.bankId === bankId && r.cardType === cardType && !r.posId
    );

    // En yakın taksit sayısını bul (yukarı yuvarla)
    const sortedRates = bankRates.sort((a, b) => a.installmentCount - b.installmentCount);
    rate = sortedRates.find(r => r.installmentCount >= installmentCount) ||
           sortedRates[sortedRates.length - 1];
  }

  return rate?.rate || 2.50; // Varsayılan oran
}

// ===========================================
// VALÖR (DEĞER TARİHİ) HESAPLAYICI
// ===========================================

/**
 * İş günü hesaplayıcı (hafta sonu ve tatilleri atlar)
 */
function addBusinessDaysCustom(date: Date, days: number): Date {
  let result = new Date(date);
  let addedDays = 0;

  while (addedDays < days) {
    result.setDate(result.getDate() + 1);
    // Hafta sonu kontrolü (0 = Pazar, 6 = Cumartesi)
    if (result.getDay() !== 0 && result.getDay() !== 6) {
      addedDays++;
    }
  }

  return result;
}

/**
 * Valör tarihi hesapla
 * POS'un settlement tipine göre paranın hesaba geçeceği tarihi belirler
 */
export function calculateValueDate(
  transactionDate: Date,
  pos: POSDevice
): Date {
  const txDate = startOfDay(transactionDate);

  switch (pos.settlementType) {
    case 'nextDay':
      // Ertesi iş günü
      return addBusinessDaysCustom(txDate, 1);

    case 'blocked':
      // Bloke gün sayısı kadar bekle
      return addBusinessDaysCustom(txDate, pos.blockedDays || 7);

    case 'hybrid':
      // Hibrit: Ağırlıklı ortalama hesapla (basitleştirilmiş - ana kısmı al)
      if (pos.hybridRatio && pos.hybridRatio.nextDay >= pos.hybridRatio.blocked) {
        return addBusinessDaysCustom(txDate, 1);
      } else {
        return addBusinessDaysCustom(txDate, pos.blockedDays || 7);
      }

    default:
      return addBusinessDaysCustom(txDate, 1);
  }
}

// ===========================================
// ANA HESAPLAMA FONKSİYONU
// ===========================================

/**
 * Tek bir işlem için tam hesaplama yapar
 */
export function calculateTransaction(
  grossAmount: number,
  cardType: CardType,
  installmentCount: number,
  posId: string,
  transactionDate: Date = new Date(),
  banks: Bank[] = mockBanks,
  posDevices: POSDevice[] = mockPOSDevices,
  rates: CommissionRate[] = mockCommissionRates
): CalculationResult {
  // POS ve Banka bilgilerini bul
  const pos = posDevices.find(p => p.id === posId);
  if (!pos) {
    throw new Error(`POS bulunamadı: ${posId}`);
  }

  const bank = banks.find(b => b.id === pos.bankId);
  if (!bank) {
    throw new Error(`Banka bulunamadı: ${pos.bankId}`);
  }

  // 1. Komisyon Oranını Bul
  const commissionRate = findCommissionRate(
    pos.bankId,
    cardType,
    installmentCount,
    posId,
    rates
  );

  // 2. Komisyon Tutarını Hesapla
  const commissionAmount = (grossAmount * commissionRate) / 100;

  // 3. Net Tutarı Hesapla
  const netAmount = grossAmount - commissionAmount;

  // 4. EFT Ücretini Al (transfer başına, işlem başına değil)
  const eftFee = bank.defaultEftFee;

  // 5. Aylık Bakım Ücretini Hesapla (günlük orantılı)
  const maintenanceFee = pos.monthlyMaintenanceFee / 30;

  // 6. Final Tutarı Hesapla
  const finalAmount = netAmount - eftFee - maintenanceFee;

  // 7. Valör Tarihini Hesapla
  const valueDate = calculateValueDate(transactionDate, pos);

  // 8. Detaylı Açıklama Oluştur
  const breakdownText = `
📊 İşlem Hesaplama Detayı
━━━━━━━━━━━━━━━━━━━━━━━
Brüt Tutar: ${formatCurrency(grossAmount)}
Kart Tipi: ${cardType === 'bireysel' ? 'Bireysel' : 'Ticari'}
Taksit: ${installmentCount === 1 ? 'Tek Çekim' : `${installmentCount} Taksit`}

📉 Kesintiler:
• Komisyon (%${commissionRate.toFixed(2)}): -${formatCurrency(commissionAmount)}
• EFT Ücreti: -${formatCurrency(eftFee)}
• POS Bakım (günlük): -${formatCurrency(maintenanceFee)}

💰 Net Tutar: ${formatCurrency(finalAmount)}
📅 Valör Tarihi: ${format(valueDate, 'dd MMMM yyyy', { locale: tr })}
  `.trim();

  return {
    grossAmount,
    commissionRate,
    commissionAmount,
    netAmount,
    eftFee,
    maintenanceFee,
    finalAmount,
    valueDate,
    breakdownText
  };
}

// ===========================================
// SİMÜLASYON KARŞILAŞTIRMA
// ===========================================

/**
 * İki farklı POS/Banka senaryosunu karşılaştırır
 */
export function compareScenarios(
  grossAmount: number,
  cardType: CardType,
  installmentCount1: number,
  posId1: string,
  installmentCount2: number,
  posId2: string,
  transactionDate: Date = new Date(),
  banks: Bank[] = mockBanks,
  posDevices: POSDevice[] = mockPOSDevices
): SimulationComparison {
  // Senaryo 1 hesapla
  const result1 = calculateTransaction(
    grossAmount, cardType, installmentCount1, posId1, transactionDate, banks, posDevices
  );
  const pos1 = posDevices.find(p => p.id === posId1)!;
  const bank1 = banks.find(b => b.id === pos1.bankId)!;

  // Senaryo 2 hesapla
  const result2 = calculateTransaction(
    grossAmount, cardType, installmentCount2, posId2, transactionDate, banks, posDevices
  );
  const pos2 = posDevices.find(p => p.id === posId2)!;
  const bank2 = banks.find(b => b.id === pos2.bankId)!;

  // Farkı hesapla
  const difference = result1.finalAmount - result2.finalAmount;
  const betterOption = difference >= 0 ? 1 : 2;
  const savingsPercentage = Math.abs(difference) / grossAmount * 100;

  return {
    scenario1: {
      ...result1,
      bankName: bank1.name,
      posInfo: `${bank1.name} - ${pos1.terminalNo}`
    },
    scenario2: {
      ...result2,
      bankName: bank2.name,
      posInfo: `${bank2.name} - ${pos2.terminalNo}`
    },
    difference: Math.abs(difference),
    betterOption,
    savingsPercentage
  };
}

// ===========================================
// TOPLU İŞLEM HESAPLAYICI
// ===========================================

/**
 * Birden fazla işlemi toplu hesaplar
 */
export function calculateBatchTransactions(
  transactions: Transaction[],
  banks: Bank[] = mockBanks,
  posDevices: POSDevice[] = mockPOSDevices,
  rates: CommissionRate[] = mockCommissionRates
): Transaction[] {
  return transactions.map(txn => {
    const result = calculateTransaction(
      txn.grossAmount,
      txn.cardType,
      txn.installmentCount,
      txn.posId,
      txn.date,
      banks,
      posDevices,
      rates
    );

    return {
      ...txn,
      commissionRate: result.commissionRate,
      commissionAmount: result.commissionAmount,
      netAmount: result.netAmount,
      eftFee: result.eftFee,
      finalAmount: result.finalAmount,
      valueDate: result.valueDate
    };
  });
}

// ===========================================
// NAKİT AKIŞI TAHMİNİ
// ===========================================

/**
 * Belirli bir tarih aralığı için nakit akışı tahmini oluşturur
 */
export function generateCashFlowForecast(
  transactions: Transaction[],
  days: number = 14,
  banks: Bank[] = mockBanks
): CashFlowForecast[] {
  const forecast: CashFlowForecast[] = [];
  const today = startOfDay(new Date());

  // İşlemleri hesapla (eğer henüz hesaplanmamışsa)
  const calculatedTxns = calculateBatchTransactions(transactions, banks);

  for (let i = 0; i < days; i++) {
    const targetDate = new Date(today);
    targetDate.setDate(targetDate.getDate() + i);

    // Bu tarihte gelecek ödemeleri bul
    const dayTransactions = calculatedTxns.filter(txn =>
      txn.valueDate && isSameDay(txn.valueDate, targetDate)
    );

    // Banka bazlı dağılım
    const bankBreakdown = banks.map(bank => {
      const bankTxns = dayTransactions.filter(t => t.bankId === bank.id);
      const amount = bankTxns.reduce((sum, t) => sum + (t.finalAmount || 0), 0);
      return {
        bankId: bank.id,
        bankName: bank.name,
        amount
      };
    }).filter(b => b.amount > 0);

    const totalAmount = dayTransactions.reduce((sum, t) => sum + (t.finalAmount || 0), 0);

    forecast.push({
      date: targetDate,
      expectedAmount: totalAmount,
      transactions: dayTransactions,
      bankBreakdown
    });
  }

  return forecast;
}

// ===========================================
// GÜNLÜK RAPOR OLUŞTURUCU
// ===========================================

/**
 * Günlük rapor oluşturur
 */
export function generateDailyReport(
  transactions: Transaction[],
  date: Date,
  banks: Bank[] = mockBanks
): DailyReport {
  const targetDate = startOfDay(date);
  const dayTransactions = transactions.filter(txn =>
    isSameDay(startOfDay(txn.date), targetDate)
  );

  // İşlemleri hesapla
  const calculatedTxns = calculateBatchTransactions(dayTransactions, banks);

  // Toplamları hesapla
  const totalGross = calculatedTxns.reduce((sum, t) => sum + t.grossAmount, 0);
  const totalCommission = calculatedTxns.reduce((sum, t) => sum + (t.commissionAmount || 0), 0);
  const totalEftFee = calculatedTxns.reduce((sum, t) => sum + (t.eftFee || 0), 0);
  const totalNet = calculatedTxns.reduce((sum, t) => sum + (t.finalAmount || 0), 0);

  // Banka bazlı dağılım
  const byBank = banks.map(bank => {
    const bankTxns = calculatedTxns.filter(t => t.bankId === bank.id);
    return {
      bankId: bank.id,
      bankName: bank.name,
      gross: bankTxns.reduce((sum, t) => sum + t.grossAmount, 0),
      commission: bankTxns.reduce((sum, t) => sum + (t.commissionAmount || 0), 0),
      net: bankTxns.reduce((sum, t) => sum + (t.finalAmount || 0), 0),
      count: bankTxns.length
    };
  }).filter(b => b.count > 0);

  return {
    date: targetDate,
    totalGross,
    totalCommission,
    totalEftFee,
    totalNet,
    transactionCount: calculatedTxns.length,
    byBank
  };
}

// ===========================================
// EN İYİ POS ÖNERİCİ
// ===========================================

/**
 * Verilen parametreler için en düşük maliyetli POS'u önerir
 */
export function recommendBestPOS(
  grossAmount: number,
  cardType: CardType,
  installmentCount: number,
  availablePosIds: string[],
  banks: Bank[] = mockBanks,
  posDevices: POSDevice[] = mockPOSDevices
): { posId: string; bankName: string; finalAmount: number; savings: number }[] {
  const results = availablePosIds.map(posId => {
    const result = calculateTransaction(
      grossAmount, cardType, installmentCount, posId, new Date(), banks, posDevices
    );
    const pos = posDevices.find(p => p.id === posId)!;
    const bank = banks.find(b => b.id === pos.bankId)!;

    return {
      posId,
      bankName: bank.name,
      terminalNo: pos.terminalNo,
      finalAmount: result.finalAmount,
      commissionRate: result.commissionRate
    };
  });

  // En yüksek net tutara göre sırala
  const sorted = results.sort((a, b) => b.finalAmount - a.finalAmount);
  const best = sorted[0];

  return sorted.map(r => ({
    posId: r.posId,
    bankName: `${r.bankName} (${r.terminalNo})`,
    finalAmount: r.finalAmount,
    savings: r.finalAmount - best.finalAmount
  }));
}

// ===========================================
// YARDIMCI FONKSİYONLAR
// ===========================================

/**
 * Para birimi formatla
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2
  }).format(amount);
}

/**
 * Yüzde formatla
 */
export function formatPercentage(value: number): string {
  return `%${value.toFixed(2)}`;
}

/**
 * Tarih formatla
 */
export function formatDate(date: Date): string {
  return format(date, 'dd.MM.yyyy', { locale: tr });
}

/**
 * Tarih ve saat formatla
 */
export function formatDateTime(date: Date): string {
  return format(date, 'dd.MM.yyyy HH:mm', { locale: tr });
}

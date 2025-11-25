// ===========================================
// SİMÜLASYON SAYFASI - KARŞILAŞTIRMA MODU
// ===========================================

import React, { useState, useMemo } from 'react';
import {
  Calculator, ArrowRight, TrendingUp, TrendingDown,
  CheckCircle, XCircle, Zap, AlertTriangle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../contexts/AppContext';
import {
  compareScenarios, calculateTransaction, recommendBestPOS,
  formatCurrency, formatPercentage, formatDate
} from '../services/calculationEngine';
import { CardType, SimulationComparison } from '../types';

export default function SimulationPage() {
  const { t } = useTranslation();
  const { state } = useApp();

  // Form state
  const [amount, setAmount] = useState<number>(10000);
  const [cardType, setCardType] = useState<CardType>('bireysel');
  const [installment1, setInstallment1] = useState<number>(3);
  const [posId1, setPosId1] = useState<string>(state.posDevices[0]?.id || '');
  const [installment2, setInstallment2] = useState<number>(1);
  const [posId2, setPosId2] = useState<string>(state.posDevices[1]?.id || '');

  // Karşılaştırma sonucu
  const comparison = useMemo<SimulationComparison | null>(() => {
    if (!posId1 || !posId2 || amount <= 0) return null;
    try {
      return compareScenarios(
        amount, cardType, installment1, posId1,
        installment2, posId2, new Date(),
        state.banks, state.posDevices
      );
    } catch (error) {
      return null;
    }
  }, [amount, cardType, installment1, posId1, installment2, posId2, state.banks, state.posDevices]);

  // En iyi POS önerisi
  const recommendations = useMemo(() => {
    if (amount <= 0) return [];
    const availablePosIds = state.posDevices.filter(p => p.isActive).map(p => p.id);
    return recommendBestPOS(amount, cardType, installment1, availablePosIds, state.banks, state.posDevices);
  }, [amount, cardType, installment1, state.posDevices, state.banks]);

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('simulation.title')}</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {t('simulation.subtitle')}
        </p>
      </div>

      {/* Ana Karşılaştırma Formu */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Ortak Parametreler */}
          <div className="md:col-span-2 lg:col-span-1 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Calculator size={20} className="text-primary-600 dark:text-primary-400" />
              {t('simulation.breakdown')}
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('simulation.amount')} (TL)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('transactions.cardType')}
              </label>
              <select
                value={cardType}
                onChange={(e) => setCardType(e.target.value as CardType)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 min-h-[44px]"
              >
                <option value="bireysel">{t('transactions.personal')}</option>
                <option value="ticari">{t('transactions.commercialFull')}</option>
              </select>
            </div>

            <div className="pt-2 md:pt-4">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('simulation.compareScenarios')}
              </p>
            </div>
          </div>

          {/* Senaryo 1 */}
          <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="font-semibold text-blue-900 dark:text-blue-300">{t('simulation.scenario1')}</h4>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('simulation.selectPOS')}
              </label>
              <select
                value={posId1}
                onChange={(e) => setPosId1(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 dark:text-white min-h-[44px]"
              >
                {state.posDevices.map(pos => {
                  const bank = state.banks.find(b => b.id === pos.bankId);
                  return (
                    <option key={pos.id} value={pos.id}>
                      {bank?.name} - {pos.terminalNo}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('transactions.installments')}
              </label>
              <select
                value={installment1}
                onChange={(e) => setInstallment1(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 dark:text-white min-h-[44px]"
              >
                <option value={1}>{t('transactions.addForm.singlePayment')}</option>
                <option value={2}>2 {t('transactions.installments')}</option>
                <option value={3}>3 {t('transactions.installments')}</option>
                <option value={6}>6 {t('transactions.installments')}</option>
                <option value={9}>9 {t('transactions.installments')}</option>
                <option value={12}>12 {t('transactions.installments')}</option>
              </select>
            </div>
          </div>

          {/* Senaryo 2 */}
          <div className="space-y-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <h4 className="font-semibold text-green-900 dark:text-green-300">{t('simulation.scenario2')}</h4>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('simulation.selectPOS')}
              </label>
              <select
                value={posId2}
                onChange={(e) => setPosId2(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 dark:text-white min-h-[44px]"
              >
                {state.posDevices.map(pos => {
                  const bank = state.banks.find(b => b.id === pos.bankId);
                  return (
                    <option key={pos.id} value={pos.id}>
                      {bank?.name} - {pos.terminalNo}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('transactions.installments')}
              </label>
              <select
                value={installment2}
                onChange={(e) => setInstallment2(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 dark:text-white min-h-[44px]"
              >
                <option value={1}>{t('transactions.addForm.singlePayment')}</option>
                <option value={2}>2 {t('transactions.installments')}</option>
                <option value={3}>3 {t('transactions.installments')}</option>
                <option value={6}>6 {t('transactions.installments')}</option>
                <option value={9}>9 {t('transactions.installments')}</option>
                <option value={12}>12 {t('transactions.installments')}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Karşılaştırma Sonuçları */}
      {comparison && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Senaryo 1 Sonuç */}
          <div className={`
            bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 p-6
            ${comparison.betterOption === 1 ? 'border-green-500 dark:border-green-400' : 'border-gray-200 dark:border-gray-700'}
          `}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                {comparison.scenario1.bankName}
              </h4>
              {comparison.betterOption === 1 && (
                <span className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm font-medium">
                  <CheckCircle size={16} />
                  {t('simulation.recommended')}
                </span>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">{t('dashboard.gross')}:</span>
                <span className="font-medium dark:text-white">{formatCurrency(comparison.scenario1.grossAmount)}</span>
              </div>
              <div className="flex justify-between text-red-600 dark:text-red-400">
                <span>{t('dashboard.commission')} ({formatPercentage(comparison.scenario1.commissionRate)}):</span>
                <span>-{formatCurrency(comparison.scenario1.commissionAmount)}</span>
              </div>
              <div className="flex justify-between text-orange-600 dark:text-orange-400">
                <span>{t('dashboard.eftFees')}:</span>
                <span>-{formatCurrency(comparison.scenario1.eftFee)}</span>
              </div>
              <div className="flex justify-between text-gray-500 dark:text-gray-400">
                <span>POS Bakım:</span>
                <span>-{formatCurrency(comparison.scenario1.maintenanceFee)}</span>
              </div>
              <div className="border-t dark:border-gray-700 pt-3 flex justify-between">
                <span className="font-semibold dark:text-white">{t('dashboard.net')}:</span>
                <span className="text-xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(comparison.scenario1.finalAmount)}
                </span>
              </div>
              <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>{t('transactions.tableHeaders.valueDate')}:</span>
                <span>{formatDate(comparison.scenario1.valueDate)}</span>
              </div>
            </div>
          </div>

          {/* Senaryo 2 Sonuç */}
          <div className={`
            bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 p-6
            ${comparison.betterOption === 2 ? 'border-green-500 dark:border-green-400' : 'border-gray-200 dark:border-gray-700'}
          `}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                {comparison.scenario2.bankName}
              </h4>
              {comparison.betterOption === 2 && (
                <span className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm font-medium">
                  <CheckCircle size={16} />
                  {t('simulation.recommended')}
                </span>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">{t('dashboard.gross')}:</span>
                <span className="font-medium dark:text-white">{formatCurrency(comparison.scenario2.grossAmount)}</span>
              </div>
              <div className="flex justify-between text-red-600 dark:text-red-400">
                <span>{t('dashboard.commission')} ({formatPercentage(comparison.scenario2.commissionRate)}):</span>
                <span>-{formatCurrency(comparison.scenario2.commissionAmount)}</span>
              </div>
              <div className="flex justify-between text-orange-600 dark:text-orange-400">
                <span>{t('dashboard.eftFees')}:</span>
                <span>-{formatCurrency(comparison.scenario2.eftFee)}</span>
              </div>
              <div className="flex justify-between text-gray-500 dark:text-gray-400">
                <span>POS Bakım:</span>
                <span>-{formatCurrency(comparison.scenario2.maintenanceFee)}</span>
              </div>
              <div className="border-t dark:border-gray-700 pt-3 flex justify-between">
                <span className="font-semibold dark:text-white">{t('dashboard.net')}:</span>
                <span className="text-xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(comparison.scenario2.finalAmount)}
                </span>
              </div>
              <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>{t('transactions.tableHeaders.valueDate')}:</span>
                <span>{formatDate(comparison.scenario2.valueDate)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fark Özeti */}
      {comparison && (
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 dark:from-primary-600 dark:to-primary-700 rounded-xl p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Zap size={24} />
            <h3 className="text-xl font-bold">{t('simulation.comparison')}</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm opacity-80">{t('simulation.savings')}</p>
              <p className="text-3xl font-bold">{formatCurrency(comparison.difference)}</p>
            </div>
            <div>
              <p className="text-sm opacity-80">{t('simulation.savings')} %</p>
              <p className="text-3xl font-bold">{formatPercentage(comparison.savingsPercentage)}</p>
            </div>
            <div>
              <p className="text-sm opacity-80">{t('simulation.recommended')}</p>
              <p className="text-xl font-bold">
                {comparison.betterOption === 1 ? t('simulation.scenario1') : t('simulation.scenario2')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tüm POS'ların Sıralaması */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <TrendingUp size={20} className="text-primary-600 dark:text-primary-400" />
          {t('simulation.recommended')}
        </h3>

        <div className="space-y-3">
          {recommendations.slice(0, 5).map((rec, index) => (
            <div
              key={rec.posId}
              className={`
                flex items-center justify-between p-4 rounded-lg
                ${index === 0 ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700' : 'bg-gray-50 dark:bg-gray-700/50'}
              `}
            >
              <div className="flex items-center gap-3">
                <span className={`
                  w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                  ${index === 0 ? 'bg-green-500 text-white' : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300'}
                `}>
                  {index + 1}
                </span>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{rec.bankName}</p>
                  {index === 0 && (
                    <p className="text-xs text-green-600 dark:text-green-400">{t('simulation.recommended')}</p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900 dark:text-white">{formatCurrency(rec.finalAmount)}</p>
                {rec.savings < 0 && (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {formatCurrency(rec.savings)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

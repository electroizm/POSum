// ===========================================
// SİMÜLASYON SAYFASI - KARŞILAŞTIRMA MODU
// ===========================================

import React, { useState, useMemo } from 'react';
import {
  Calculator, ArrowRight, TrendingUp, TrendingDown,
  CheckCircle, XCircle, Zap, AlertTriangle
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import {
  compareScenarios, calculateTransaction, recommendBestPOS,
  formatCurrency, formatPercentage, formatDate
} from '../services/calculationEngine';
import { CardType, SimulationComparison } from '../types';

export default function SimulationPage() {
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
        <h2 className="text-2xl font-bold text-gray-900">Simülasyon Modu</h2>
        <p className="text-gray-500 mt-1">
          Farklı POS ve taksit seçeneklerini karşılaştırarak en avantajlı seçeneği bulun
        </p>
      </div>

      {/* Ana Karşılaştırma Formu */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ortak Parametreler */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Calculator size={20} className="text-primary-600" />
              İşlem Detayları
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tutar (TL)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kart Tipi
              </label>
              <select
                value={cardType}
                onChange={(e) => setCardType(e.target.value as CardType)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="bireysel">Bireysel</option>
                <option value="ticari">Ticari / Kurumsal</option>
              </select>
            </div>

            <div className="pt-4">
              <p className="text-xs text-gray-500">
                Aşağıda iki farklı senaryo belirleyerek net tutarları karşılaştırabilirsiniz.
              </p>
            </div>
          </div>

          {/* Senaryo 1 */}
          <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900">Senaryo 1</h4>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                POS Seçimi
              </label>
              <select
                value={posId1}
                onChange={(e) => setPosId1(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Taksit
              </label>
              <select
                value={installment1}
                onChange={(e) => setInstallment1(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white"
              >
                <option value={1}>Tek Çekim</option>
                <option value={2}>2 Taksit</option>
                <option value={3}>3 Taksit</option>
                <option value={6}>6 Taksit</option>
                <option value={9}>9 Taksit</option>
                <option value={12}>12 Taksit</option>
              </select>
            </div>
          </div>

          {/* Senaryo 2 */}
          <div className="space-y-4 p-4 bg-green-50 rounded-lg">
            <h4 className="font-semibold text-green-900">Senaryo 2</h4>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                POS Seçimi
              </label>
              <select
                value={posId2}
                onChange={(e) => setPosId2(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Taksit
              </label>
              <select
                value={installment2}
                onChange={(e) => setInstallment2(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white"
              >
                <option value={1}>Tek Çekim</option>
                <option value={2}>2 Taksit</option>
                <option value={3}>3 Taksit</option>
                <option value={6}>6 Taksit</option>
                <option value={9}>9 Taksit</option>
                <option value={12}>12 Taksit</option>
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
            bg-white rounded-xl shadow-sm border-2 p-6
            ${comparison.betterOption === 1 ? 'border-green-500' : 'border-gray-200'}
          `}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">
                {comparison.scenario1.bankName}
              </h4>
              {comparison.betterOption === 1 && (
                <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                  <CheckCircle size={16} />
                  En İyi Seçenek
                </span>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Brüt Tutar:</span>
                <span className="font-medium">{formatCurrency(comparison.scenario1.grossAmount)}</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>Komisyon ({formatPercentage(comparison.scenario1.commissionRate)}):</span>
                <span>-{formatCurrency(comparison.scenario1.commissionAmount)}</span>
              </div>
              <div className="flex justify-between text-orange-600">
                <span>EFT Ücreti:</span>
                <span>-{formatCurrency(comparison.scenario1.eftFee)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>POS Bakım (günlük):</span>
                <span>-{formatCurrency(comparison.scenario1.maintenanceFee)}</span>
              </div>
              <div className="border-t pt-3 flex justify-between">
                <span className="font-semibold">Net Tutar:</span>
                <span className="text-xl font-bold text-green-600">
                  {formatCurrency(comparison.scenario1.finalAmount)}
                </span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Valör Tarihi:</span>
                <span>{formatDate(comparison.scenario1.valueDate)}</span>
              </div>
            </div>
          </div>

          {/* Senaryo 2 Sonuç */}
          <div className={`
            bg-white rounded-xl shadow-sm border-2 p-6
            ${comparison.betterOption === 2 ? 'border-green-500' : 'border-gray-200'}
          `}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">
                {comparison.scenario2.bankName}
              </h4>
              {comparison.betterOption === 2 && (
                <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                  <CheckCircle size={16} />
                  En İyi Seçenek
                </span>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Brüt Tutar:</span>
                <span className="font-medium">{formatCurrency(comparison.scenario2.grossAmount)}</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>Komisyon ({formatPercentage(comparison.scenario2.commissionRate)}):</span>
                <span>-{formatCurrency(comparison.scenario2.commissionAmount)}</span>
              </div>
              <div className="flex justify-between text-orange-600">
                <span>EFT Ücreti:</span>
                <span>-{formatCurrency(comparison.scenario2.eftFee)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>POS Bakım (günlük):</span>
                <span>-{formatCurrency(comparison.scenario2.maintenanceFee)}</span>
              </div>
              <div className="border-t pt-3 flex justify-between">
                <span className="font-semibold">Net Tutar:</span>
                <span className="text-xl font-bold text-green-600">
                  {formatCurrency(comparison.scenario2.finalAmount)}
                </span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Valör Tarihi:</span>
                <span>{formatDate(comparison.scenario2.valueDate)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fark Özeti */}
      {comparison && (
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Zap size={24} />
            <h3 className="text-xl font-bold">Karşılaştırma Özeti</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm opacity-80">Kazanç Farkı</p>
              <p className="text-3xl font-bold">{formatCurrency(comparison.difference)}</p>
            </div>
            <div>
              <p className="text-sm opacity-80">Tasarruf Oranı</p>
              <p className="text-3xl font-bold">{formatPercentage(comparison.savingsPercentage)}</p>
            </div>
            <div>
              <p className="text-sm opacity-80">Önerilen Seçenek</p>
              <p className="text-xl font-bold">
                Senaryo {comparison.betterOption}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tüm POS'ların Sıralaması */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp size={20} className="text-primary-600" />
          Bu İşlem İçin En İyi POS Sıralaması
        </h3>

        <div className="space-y-3">
          {recommendations.slice(0, 5).map((rec, index) => (
            <div
              key={rec.posId}
              className={`
                flex items-center justify-between p-4 rounded-lg
                ${index === 0 ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}
              `}
            >
              <div className="flex items-center gap-3">
                <span className={`
                  w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                  ${index === 0 ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-700'}
                `}>
                  {index + 1}
                </span>
                <div>
                  <p className="font-medium text-gray-900">{rec.bankName}</p>
                  {index === 0 && (
                    <p className="text-xs text-green-600">En avantajlı seçenek</p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900">{formatCurrency(rec.finalAmount)}</p>
                {rec.savings < 0 && (
                  <p className="text-xs text-red-600">
                    {formatCurrency(rec.savings)} kayıp
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

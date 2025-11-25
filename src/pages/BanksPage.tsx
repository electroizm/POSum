// ===========================================
// BANKALAR VE KOMİSYON MATRİSİ SAYFASI
// ===========================================

import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Building2, Percent, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../contexts/AppContext';
import { formatCurrency } from '../services/calculationEngine';
import { Bank, CommissionRate, CardType } from '../types';

export default function BanksPage() {
  const { t } = useTranslation();
  const { state, dispatch } = useApp();
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [showBankForm, setShowBankForm] = useState(false);
  const [showRateForm, setShowRateForm] = useState(false);

  // Banka form state
  const [bankForm, setBankForm] = useState<Partial<Bank>>({
    name: '',
    logo: '🏦',
    defaultEftFee: 12.80,
    agreementType: 'standart',
    color: '#3b82f6'
  });

  // Komisyon oranı form state
  const [rateForm, setRateForm] = useState({
    bankId: '',
    cardType: 'bireysel' as CardType,
    installmentCount: 1,
    rate: 1.69
  });

  const handleAddBank = (e: React.FormEvent) => {
    e.preventDefault();
    const newBank: Bank = {
      id: `bank-${Date.now()}`,
      name: bankForm.name || '',
      logo: bankForm.logo || '🏦',
      defaultEftFee: bankForm.defaultEftFee || 12.80,
      agreementType: bankForm.agreementType || 'standart',
      color: bankForm.color || '#3b82f6'
    };
    dispatch({ type: 'ADD_BANK', payload: newBank });
    setShowBankForm(false);
    setBankForm({ name: '', logo: '🏦', defaultEftFee: 12.80, agreementType: 'standart', color: '#3b82f6' });
  };

  const handleAddRate = (e: React.FormEvent) => {
    e.preventDefault();
    const newRate: CommissionRate = {
      id: `cr-${Date.now()}`,
      bankId: rateForm.bankId || selectedBank || '',
      cardType: rateForm.cardType,
      installmentCount: rateForm.installmentCount,
      rate: rateForm.rate,
      validFrom: new Date()
    };
    dispatch({ type: 'ADD_COMMISSION_RATE', payload: newRate });
    setShowRateForm(false);
    setRateForm({ bankId: '', cardType: 'bireysel', installmentCount: 1, rate: 1.69 });
  };

  // Seçili bankanın komisyon oranları
  const selectedBankRates = selectedBank
    ? state.commissionRates.filter(r => r.bankId === selectedBank)
    : [];

  // Oranları grupla (kart tipi bazında)
  const groupedRates = {
    bireysel: selectedBankRates.filter(r => r.cardType === 'bireysel').sort((a, b) => a.installmentCount - b.installmentCount),
    ticari: selectedBankRates.filter(r => r.cardType === 'ticari').sort((a, b) => a.installmentCount - b.installmentCount)
  };

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('banks.title')}</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{t('banks.subtitle')}</p>
        </div>
        <button
          onClick={() => setShowBankForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600"
        >
          <Plus size={20} />
          {t('banks.addBank')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Banka Listesi */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Building2 size={20} className="text-primary-600 dark:text-primary-400" />
              {t('nav.banks')}
            </h3>

            <div className="space-y-2">
              {state.banks.map(bank => (
                <button
                  key={bank.id}
                  onClick={() => setSelectedBank(bank.id)}
                  className={`
                    w-full text-left p-3 rounded-lg transition-colors min-h-[44px]
                    ${selectedBank === bank.id
                      ? 'bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-700'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700 border border-transparent'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{bank.logo}</span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">{bank.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {t('banks.eftFee')}: {formatCurrency(bank.defaultEftFee)}
                      </p>
                    </div>
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: bank.color }}
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Komisyon Matrisi */}
        <div className="lg:col-span-2">
          {selectedBank ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Percent size={20} className="text-primary-600 dark:text-primary-400" />
                  {t('banks.commissionRates')}
                </h3>
                <button
                  onClick={() => {
                    setRateForm({ ...rateForm, bankId: selectedBank });
                    setShowRateForm(true);
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-lg hover:bg-primary-200 dark:hover:bg-primary-900/50"
                >
                  <Plus size={16} />
                  {t('banks.addRate')}
                </button>
              </div>

              {/* Bireysel Kartlar */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">{t('transactions.personal')}</h4>

                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-gray-700">
                        <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400">{t('transactions.installments')}</th>
                        <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400">{t('dashboard.commission')}</th>
                        <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400">{t('transactions.actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupedRates.bireysel.map(rate => (
                        <tr key={rate.id} className="border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="py-2 px-3 text-sm dark:text-gray-300">
                            {rate.installmentCount === 1 ? t('transactions.addForm.singlePayment') : `${rate.installmentCount} ${t('transactions.installments')}`}
                          </td>
                          <td className="py-2 px-3 text-sm text-right font-medium text-primary-600 dark:text-primary-400">
                            %{rate.rate.toFixed(2)}
                          </td>
                          <td className="py-2 px-3 text-right">
                            <button
                              onClick={() => dispatch({ type: 'DELETE_COMMISSION_RATE', payload: rate.id })}
                              className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {groupedRates.bireysel.length === 0 && (
                        <tr>
                          <td colSpan={3} className="py-4 text-center text-gray-400 dark:text-gray-500 text-sm">
                            {t('common.noData')}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-2">
                  {groupedRates.bireysel.map(rate => (
                    <div key={rate.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 min-h-[44px]">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {rate.installmentCount === 1 ? t('transactions.addForm.singlePayment') : `${rate.installmentCount} ${t('transactions.installments')}`}
                          </p>
                          <p className="text-lg font-bold text-primary-600 dark:text-primary-400">
                            %{rate.rate.toFixed(2)}
                          </p>
                        </div>
                        <button
                          onClick={() => dispatch({ type: 'DELETE_COMMISSION_RATE', payload: rate.id })}
                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {groupedRates.bireysel.length === 0 && (
                    <div className="py-8 text-center text-gray-400 dark:text-gray-500 text-sm">
                      {t('common.noData')}
                    </div>
                  )}
                </div>
              </div>

              {/* Ticari Kartlar */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">{t('transactions.commercialFull')}</h4>

                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-gray-700">
                        <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400">{t('transactions.installments')}</th>
                        <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400">{t('dashboard.commission')}</th>
                        <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400">{t('transactions.actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupedRates.ticari.map(rate => (
                        <tr key={rate.id} className="border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="py-2 px-3 text-sm dark:text-gray-300">
                            {rate.installmentCount === 1 ? t('transactions.addForm.singlePayment') : `${rate.installmentCount} ${t('transactions.installments')}`}
                          </td>
                          <td className="py-2 px-3 text-sm text-right font-medium text-orange-600 dark:text-orange-400">
                            %{rate.rate.toFixed(2)}
                          </td>
                          <td className="py-2 px-3 text-right">
                            <button
                              onClick={() => dispatch({ type: 'DELETE_COMMISSION_RATE', payload: rate.id })}
                              className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {groupedRates.ticari.length === 0 && (
                        <tr>
                          <td colSpan={3} className="py-4 text-center text-gray-400 dark:text-gray-500 text-sm">
                            {t('common.noData')}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-2">
                  {groupedRates.ticari.map(rate => (
                    <div key={rate.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 min-h-[44px]">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {rate.installmentCount === 1 ? t('transactions.addForm.singlePayment') : `${rate.installmentCount} ${t('transactions.installments')}`}
                          </p>
                          <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                            %{rate.rate.toFixed(2)}
                          </p>
                        </div>
                        <button
                          onClick={() => dispatch({ type: 'DELETE_COMMISSION_RATE', payload: rate.id })}
                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {groupedRates.ticari.length === 0 && (
                    <div className="py-8 text-center text-gray-400 dark:text-gray-500 text-sm">
                      {t('common.noData')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center">
              <Building2 className="mx-auto text-gray-300 dark:text-gray-600" size={48} />
              <p className="mt-4 text-gray-500 dark:text-gray-400">
                {t('simulation.selectBank')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Banka Ekleme Modal */}
      {showBankForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('banks.addBank')}</h3>
            </div>
            <form onSubmit={handleAddBank} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('banks.bankName')}</label>
                <input
                  type="text"
                  value={bankForm.name}
                  onChange={(e) => setBankForm({...bankForm, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Logo (Emoji)</label>
                  <input
                    type="text"
                    value={bankForm.logo}
                    onChange={(e) => setBankForm({...bankForm, logo: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('settings.theme')}</label>
                  <input
                    type="color"
                    value={bankForm.color}
                    onChange={(e) => setBankForm({...bankForm, color: e.target.value})}
                    className="w-full h-10 border border-gray-200 dark:border-gray-600 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('banks.eftFee')} (TL)</label>
                <input
                  type="number"
                  step="0.01"
                  value={bankForm.defaultEftFee}
                  onChange={(e) => setBankForm({...bankForm, defaultEftFee: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowBankForm(false)} className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                  {t('common.cancel')}
                </button>
                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600">
                  {t('common.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Oran Ekleme Modal */}
      {showRateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('banks.addRate')}</h3>
            </div>
            <form onSubmit={handleAddRate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('transactions.cardType')}</label>
                <select
                  value={rateForm.cardType}
                  onChange={(e) => setRateForm({...rateForm, cardType: e.target.value as CardType})}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="bireysel">{t('transactions.personal')}</option>
                  <option value="ticari">{t('transactions.commercialFull')}</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('transactions.installments')}</label>
                  <select
                    value={rateForm.installmentCount}
                    onChange={(e) => setRateForm({...rateForm, installmentCount: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value={1}>{t('transactions.addForm.singlePayment')}</option>
                    <option value={2}>2 {t('transactions.installments')}</option>
                    <option value={3}>3 {t('transactions.installments')}</option>
                    <option value={6}>6 {t('transactions.installments')}</option>
                    <option value={9}>9 {t('transactions.installments')}</option>
                    <option value={12}>12 {t('transactions.installments')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('dashboard.commission')} (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={rateForm.rate}
                    onChange={(e) => setRateForm({...rateForm, rate: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowRateForm(false)} className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                  {t('common.cancel')}
                </button>
                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600">
                  {t('common.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

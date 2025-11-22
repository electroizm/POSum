// ===========================================
// BANKALAR VE KOMİSYON MATRİSİ SAYFASI
// ===========================================

import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Building2, Percent, Settings } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { formatCurrency } from '../services/calculationEngine';
import { Bank, CommissionRate, CardType } from '../types';

export default function BanksPage() {
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
          <h2 className="text-2xl font-bold text-gray-900">Bankalar & Komisyon Matrisi</h2>
          <p className="text-gray-500 mt-1">Banka bilgilerini ve komisyon oranlarını yönetin</p>
        </div>
        <button
          onClick={() => setShowBankForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <Plus size={20} />
          Yeni Banka Ekle
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Banka Listesi */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Building2 size={20} className="text-primary-600" />
              Bankalar
            </h3>

            <div className="space-y-2">
              {state.banks.map(bank => (
                <button
                  key={bank.id}
                  onClick={() => setSelectedBank(bank.id)}
                  className={`
                    w-full text-left p-3 rounded-lg transition-colors
                    ${selectedBank === bank.id
                      ? 'bg-primary-50 border border-primary-200'
                      : 'hover:bg-gray-50 border border-transparent'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{bank.logo}</span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{bank.name}</p>
                      <p className="text-xs text-gray-500">
                        EFT: {formatCurrency(bank.defaultEftFee)}
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Percent size={20} className="text-primary-600" />
                  Komisyon Oranları
                </h3>
                <button
                  onClick={() => {
                    setRateForm({ ...rateForm, bankId: selectedBank });
                    setShowRateForm(true);
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200"
                >
                  <Plus size={16} />
                  Oran Ekle
                </button>
              </div>

              {/* Bireysel Kartlar */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Bireysel Kartlar</h4>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500">Taksit</th>
                        <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500">Oran</th>
                        <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500">İşlem</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupedRates.bireysel.map(rate => (
                        <tr key={rate.id} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="py-2 px-3 text-sm">
                            {rate.installmentCount === 1 ? 'Tek Çekim' : `${rate.installmentCount} Taksit`}
                          </td>
                          <td className="py-2 px-3 text-sm text-right font-medium text-primary-600">
                            %{rate.rate.toFixed(2)}
                          </td>
                          <td className="py-2 px-3 text-right">
                            <button
                              onClick={() => dispatch({ type: 'DELETE_COMMISSION_RATE', payload: rate.id })}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {groupedRates.bireysel.length === 0 && (
                        <tr>
                          <td colSpan={3} className="py-4 text-center text-gray-400 text-sm">
                            Henüz oran tanımlanmamış
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Ticari Kartlar */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Ticari / Kurumsal Kartlar</h4>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500">Taksit</th>
                        <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500">Oran</th>
                        <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500">İşlem</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupedRates.ticari.map(rate => (
                        <tr key={rate.id} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="py-2 px-3 text-sm">
                            {rate.installmentCount === 1 ? 'Tek Çekim' : `${rate.installmentCount} Taksit`}
                          </td>
                          <td className="py-2 px-3 text-sm text-right font-medium text-orange-600">
                            %{rate.rate.toFixed(2)}
                          </td>
                          <td className="py-2 px-3 text-right">
                            <button
                              onClick={() => dispatch({ type: 'DELETE_COMMISSION_RATE', payload: rate.id })}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {groupedRates.ticari.length === 0 && (
                        <tr>
                          <td colSpan={3} className="py-4 text-center text-gray-400 text-sm">
                            Henüz oran tanımlanmamış
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <Building2 className="mx-auto text-gray-300" size={48} />
              <p className="mt-4 text-gray-500">
                Komisyon oranlarını görüntülemek için bir banka seçin
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Banka Ekleme Modal */}
      {showBankForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">Yeni Banka Ekle</h3>
            </div>
            <form onSubmit={handleAddBank} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Banka Adı</label>
                <input
                  type="text"
                  value={bankForm.name}
                  onChange={(e) => setBankForm({...bankForm, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Logo (Emoji)</label>
                  <input
                    type="text"
                    value={bankForm.logo}
                    onChange={(e) => setBankForm({...bankForm, logo: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Renk</label>
                  <input
                    type="color"
                    value={bankForm.color}
                    onChange={(e) => setBankForm({...bankForm, color: e.target.value})}
                    className="w-full h-10 border border-gray-200 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">EFT Ücreti (TL)</label>
                <input
                  type="number"
                  step="0.01"
                  value={bankForm.defaultEftFee}
                  onChange={(e) => setBankForm({...bankForm, defaultEftFee: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowBankForm(false)} className="px-4 py-2 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50">
                  İptal
                </button>
                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Oran Ekleme Modal */}
      {showRateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">Komisyon Oranı Ekle</h3>
            </div>
            <form onSubmit={handleAddRate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kart Tipi</label>
                <select
                  value={rateForm.cardType}
                  onChange={(e) => setRateForm({...rateForm, cardType: e.target.value as CardType})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="bireysel">Bireysel</option>
                  <option value="ticari">Ticari / Kurumsal</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Taksit</label>
                  <select
                    value={rateForm.installmentCount}
                    onChange={(e) => setRateForm({...rateForm, installmentCount: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value={1}>Tek Çekim</option>
                    <option value={2}>2 Taksit</option>
                    <option value={3}>3 Taksit</option>
                    <option value={6}>6 Taksit</option>
                    <option value={9}>9 Taksit</option>
                    <option value={12}>12 Taksit</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Oran (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={rateForm.rate}
                    onChange={(e) => setRateForm({...rateForm, rate: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowRateForm(false)} className="px-4 py-2 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50">
                  İptal
                </button>
                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ===========================================
// İŞLEMLER SAYFASI
// ===========================================

import React, { useState } from 'react';
import { Plus, Search, Filter, Download, CreditCard } from 'lucide-react';
import { useApp, useFilteredTransactions } from '../contexts/AppContext';
import { formatCurrency, formatDate } from '../services/calculationEngine';
import { Transaction, CardType } from '../types';
import { format } from 'date-fns';

export default function TransactionsPage() {
  const { state, dispatch } = useApp();
  const transactions = useFilteredTransactions();
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    grossAmount: '',
    cardType: 'bireysel' as CardType,
    installmentCount: 1,
    posId: state.posDevices[0]?.id || '',
    cardLastFour: '',
    authCode: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const pos = state.posDevices.find(p => p.id === formData.posId);
    if (!pos) return;

    const newTransaction: Transaction = {
      id: `txn-${Date.now()}`,
      date: new Date(formData.date),
      grossAmount: parseFloat(formData.grossAmount),
      cardType: formData.cardType,
      installmentCount: formData.installmentCount,
      posId: formData.posId,
      branchId: pos.branchId,
      bankId: pos.bankId,
      status: 'beklemede',
      cardLastFour: formData.cardLastFour,
      authCode: formData.authCode
    };

    dispatch({ type: 'ADD_TRANSACTION', payload: newTransaction });
    setShowAddForm(false);
    setFormData({
      date: format(new Date(), 'yyyy-MM-dd'),
      grossAmount: '',
      cardType: 'bireysel',
      installmentCount: 1,
      posId: state.posDevices[0]?.id || '',
      cardLastFour: '',
      authCode: ''
    });

    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: `notif-${Date.now()}`,
        type: 'success',
        message: 'İşlem başarıyla eklendi!'
      }
    });
  };

  // Filtrelenmiş işlemler
  const filteredTransactions = transactions.filter(txn => {
    if (!searchTerm) return true;
    const bank = state.banks.find(b => b.id === txn.bankId);
    return (
      bank?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.cardLastFour?.includes(searchTerm) ||
      txn.authCode?.includes(searchTerm)
    );
  });

  return (
    <div className="space-y-6">
      {/* Başlık ve Aksiyonlar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">İşlemler</h2>
          <p className="text-gray-500 mt-1">Tüm POS işlemlerinizi görüntüleyin ve yönetin</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus size={20} />
          Yeni İşlem Ekle
        </button>
      </div>

      {/* Arama ve Filtre */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Banka, kart no veya onay kodu ile ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
          <Filter size={20} />
          Filtrele
        </button>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
          <Download size={20} />
          Dışa Aktar
        </button>
      </div>

      {/* İşlem Listesi */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-4 px-4 text-xs font-semibold text-gray-500 uppercase">Tarih</th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-gray-500 uppercase">Banka / POS</th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-gray-500 uppercase">Kart</th>
                <th className="text-center py-4 px-4 text-xs font-semibold text-gray-500 uppercase">Taksit</th>
                <th className="text-right py-4 px-4 text-xs font-semibold text-gray-500 uppercase">Brüt</th>
                <th className="text-right py-4 px-4 text-xs font-semibold text-gray-500 uppercase">Komisyon</th>
                <th className="text-right py-4 px-4 text-xs font-semibold text-gray-500 uppercase">Net</th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-gray-500 uppercase">Valör</th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-gray-500 uppercase">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTransactions.map(txn => {
                const bank = state.banks.find(b => b.id === txn.bankId);
                const pos = state.posDevices.find(p => p.id === txn.posId);
                return (
                  <tr key={txn.id} className="hover:bg-gray-50">
                    <td className="py-4 px-4 text-sm text-gray-600">
                      {format(new Date(txn.date), 'dd.MM.yyyy HH:mm')}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{bank?.logo}</span>
                        <div>
                          <p className="text-sm font-medium text-gray-700">{bank?.name}</p>
                          <p className="text-xs text-gray-400">{pos?.terminalNo}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          {txn.cardType === 'bireysel' ? 'Bireysel' : 'Ticari'}
                        </p>
                        {txn.cardLastFour && (
                          <p className="text-xs text-gray-400">****{txn.cardLastFour}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`
                        inline-flex px-2 py-1 text-xs font-medium rounded
                        ${txn.installmentCount === 1
                          ? 'bg-green-100 text-green-700'
                          : 'bg-blue-100 text-blue-700'}
                      `}>
                        {txn.installmentCount === 1 ? 'Tek' : `${txn.installmentCount}T`}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-right font-medium text-gray-900">
                      {formatCurrency(txn.grossAmount)}
                    </td>
                    <td className="py-4 px-4 text-sm text-right">
                      <div>
                        <p className="text-red-600">-{formatCurrency(txn.commissionAmount || 0)}</p>
                        <p className="text-xs text-gray-400">%{txn.commissionRate?.toFixed(2)}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-right font-medium text-green-600">
                      {formatCurrency(txn.finalAmount || 0)}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">
                      {txn.valueDate && formatDate(txn.valueDate)}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`
                        inline-flex px-2 py-1 text-xs font-medium rounded-full
                        ${txn.status === 'beklemede' ? 'bg-yellow-100 text-yellow-700' : ''}
                        ${txn.status === 'islendi' ? 'bg-blue-100 text-blue-700' : ''}
                        ${txn.status === 'transfer_edildi' ? 'bg-green-100 text-green-700' : ''}
                      `}>
                        {txn.status === 'beklemede' && 'Beklemede'}
                        {txn.status === 'islendi' && 'İşlendi'}
                        {txn.status === 'transfer_edildi' && 'Transfer Edildi'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredTransactions.length === 0 && (
          <div className="text-center py-12">
            <CreditCard className="mx-auto text-gray-300" size={48} />
            <p className="mt-4 text-gray-500">Henüz işlem bulunmuyor</p>
          </div>
        )}
      </div>

      {/* İşlem Ekleme Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">Yeni İşlem Ekle</h3>
              <p className="text-sm text-gray-500 mt-1">Manuel işlem girişi (OCR simülasyonu)</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tarih
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tutar (TL)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.grossAmount}
                    onChange={(e) => setFormData({...formData, grossAmount: e.target.value})}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  POS Cihazı
                </label>
                <select
                  value={formData.posId}
                  onChange={(e) => setFormData({...formData, posId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                  required
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kart Tipi
                  </label>
                  <select
                    value={formData.cardType}
                    onChange={(e) => setFormData({...formData, cardType: e.target.value as CardType})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="bireysel">Bireysel</option>
                    <option value="ticari">Ticari / Kurumsal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Taksit
                  </label>
                  <select
                    value={formData.installmentCount}
                    onChange={(e) => setFormData({...formData, installmentCount: parseInt(e.target.value)})}
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kart Son 4 Hane
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    value={formData.cardLastFour}
                    onChange={(e) => setFormData({...formData, cardLastFour: e.target.value})}
                    placeholder="1234"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Onay Kodu
                  </label>
                  <input
                    type="text"
                    value={formData.authCode}
                    onChange={(e) => setFormData({...formData, authCode: e.target.value})}
                    placeholder="123456"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  İşlemi Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

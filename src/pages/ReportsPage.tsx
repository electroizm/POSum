// ===========================================
// RAPORLAR SAYFASI
// ===========================================

import React, { useState, useMemo } from 'react';
import { Calendar, Download, TrendingUp, PieChart, BarChart3 } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart as RPieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { useApp, useFilteredTransactions } from '../contexts/AppContext';
import {
  formatCurrency, generateDailyReport, generateCashFlowForecast
} from '../services/calculationEngine';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function ReportsPage() {
  const { state } = useApp();
  const transactions = useFilteredTransactions();
  const [reportType, setReportType] = useState<'daily' | 'monthly' | 'cost'>('daily');
  const [selectedPeriod, setSelectedPeriod] = useState(7); // Gün sayısı

  // Günlük raporlar
  const dailyReports = useMemo(() => {
    const reports = [];
    for (let i = selectedPeriod - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      reports.push(generateDailyReport(transactions, date, state.banks));
    }
    return reports;
  }, [transactions, state.banks, selectedPeriod]);

  // Maliyet dağılımı
  const costBreakdown = useMemo(() => {
    const totalCommission = transactions.reduce((sum, t) => sum + (t.commissionAmount || 0), 0);
    const totalEft = transactions.reduce((sum, t) => sum + (t.eftFee || 0), 0);
    const totalMaintenance = state.posDevices.reduce((sum, p) => sum + p.monthlyMaintenanceFee, 0);

    const total = totalCommission + totalEft + totalMaintenance;

    return [
      { name: 'Komisyon', value: totalCommission, color: '#ef4444', percentage: (totalCommission / total) * 100 },
      { name: 'EFT Ücreti', value: totalEft, color: '#f97316', percentage: (totalEft / total) * 100 },
      { name: 'POS Bakım', value: totalMaintenance, color: '#eab308', percentage: (totalMaintenance / total) * 100 }
    ];
  }, [transactions, state.posDevices]);

  // Banka bazlı maliyet
  const bankCosts = useMemo(() => {
    return state.banks.map(bank => {
      const bankTxns = transactions.filter(t => t.bankId === bank.id);
      return {
        name: bank.name,
        komisyon: bankTxns.reduce((sum, t) => sum + (t.commissionAmount || 0), 0),
        eft: bankTxns.reduce((sum, t) => sum + (t.eftFee || 0), 0),
        color: bank.color
      };
    }).filter(b => b.komisyon > 0 || b.eft > 0);
  }, [transactions, state.banks]);

  // Nakit akışı tahmini
  const cashFlow = useMemo(() => {
    return generateCashFlowForecast(transactions, 14, state.banks);
  }, [transactions, state.banks]);

  // Toplam istatistikler
  const totals = useMemo(() => {
    const gross = dailyReports.reduce((sum, r) => sum + r.totalGross, 0);
    const commission = dailyReports.reduce((sum, r) => sum + r.totalCommission, 0);
    const eft = dailyReports.reduce((sum, r) => sum + r.totalEftFee, 0);
    const net = dailyReports.reduce((sum, r) => sum + r.totalNet, 0);
    const count = dailyReports.reduce((sum, r) => sum + r.transactionCount, 0);
    return { gross, commission, eft, net, count };
  }, [dailyReports]);

  return (
    <div className="space-y-6">
      {/* Başlık ve Kontroller */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Raporlar</h2>
          <p className="text-gray-500 mt-1">Finansal analizler ve maliyet dağılımları</p>
        </div>
        <div className="flex gap-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value={7}>Son 7 Gün</option>
            <option value={14}>Son 14 Gün</option>
            <option value={30}>Son 30 Gün</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
            <Download size={20} />
            Rapor İndir
          </button>
        </div>
      </div>

      {/* Rapor Tipi Seçimi */}
      <div className="flex gap-2">
        <button
          onClick={() => setReportType('daily')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            reportType === 'daily' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Calendar size={18} />
          Günlük Rapor
        </button>
        <button
          onClick={() => setReportType('cost')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            reportType === 'cost' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <PieChart size={18} />
          Maliyet Analizi
        </button>
        <button
          onClick={() => setReportType('monthly')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            reportType === 'monthly' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <TrendingUp size={18} />
          Nakit Akışı
        </button>
      </div>

      {/* Özet Kartları */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <p className="text-xs text-gray-500">Toplam Brüt</p>
          <p className="text-lg font-bold text-gray-900">{formatCurrency(totals.gross)}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <p className="text-xs text-gray-500">Toplam Komisyon</p>
          <p className="text-lg font-bold text-red-600">{formatCurrency(totals.commission)}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <p className="text-xs text-gray-500">Toplam EFT</p>
          <p className="text-lg font-bold text-orange-600">{formatCurrency(totals.eft)}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <p className="text-xs text-gray-500">Net Tutar</p>
          <p className="text-lg font-bold text-green-600">{formatCurrency(totals.net)}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <p className="text-xs text-gray-500">İşlem Sayısı</p>
          <p className="text-lg font-bold text-gray-900">{totals.count}</p>
        </div>
      </div>

      {/* Günlük Rapor */}
      {reportType === 'daily' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Günlük Ciro ve Net Tutar</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyReports.map(r => ({
                  date: format(r.date, 'dd MMM', { locale: tr }),
                  brut: r.totalGross,
                  net: r.totalNet
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" fontSize={11} />
                  <YAxis fontSize={11} tickFormatter={(v) => `₺${(v/1000).toFixed(0)}K`} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Bar dataKey="brut" name="Brüt" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="net" name="Net" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Günlük İşlem Sayısı</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyReports.map(r => ({
                  date: format(r.date, 'dd MMM', { locale: tr }),
                  islem: r.transactionCount
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip />
                  <Line type="monotone" dataKey="islem" name="İşlem" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Maliyet Analizi */}
      {reportType === 'cost' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Maliyet Dağılımı</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RPieChart>
                  <Pie
                    data={costBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {costBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </RPieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {costBreakdown.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-gray-600">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium">{formatCurrency(item.value)}</span>
                    <span className="text-xs text-gray-400 ml-2">({item.percentage.toFixed(1)}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Banka Bazlı Maliyet</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bankCosts} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" fontSize={11} tickFormatter={(v) => `₺${(v/1000).toFixed(0)}K`} />
                  <YAxis type="category" dataKey="name" fontSize={11} width={80} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Bar dataKey="komisyon" name="Komisyon" fill="#ef4444" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="eft" name="EFT" fill="#f97316" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Nakit Akışı */}
      {reportType === 'monthly' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Önümüzdeki 14 Gün Nakit Akışı Tahmini</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashFlow.map(cf => ({
                date: format(cf.date, 'dd MMM', { locale: tr }),
                beklenen: cf.expectedAmount
              }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" fontSize={11} />
                <YAxis fontSize={11} tickFormatter={(v) => `₺${(v/1000).toFixed(0)}K`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="beklenen" name="Beklenen Tutar" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Detaylı Liste */}
          <div className="mt-6 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500">Tarih</th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500">Beklenen Tutar</th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500">İşlem Sayısı</th>
                </tr>
              </thead>
              <tbody>
                {cashFlow.slice(0, 7).map((cf, index) => (
                  <tr key={index} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2 px-3 text-sm">{format(cf.date, 'dd MMMM yyyy', { locale: tr })}</td>
                    <td className="py-2 px-3 text-sm text-right font-medium text-green-600">
                      {formatCurrency(cf.expectedAmount)}
                    </td>
                    <td className="py-2 px-3 text-sm text-right text-gray-500">
                      {cf.transactions.length}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

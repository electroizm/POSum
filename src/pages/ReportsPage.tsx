// ===========================================
// RAPORLAR SAYFASI
// ===========================================

import React, { useState, useMemo } from 'react';
import { Calendar, Download, TrendingUp, PieChart, BarChart3 } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart as RPieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { useTranslation } from 'react-i18next';
import { useApp, useFilteredTransactions } from '../contexts/AppContext';
import {
  formatCurrency, generateDailyReport, generateCashFlowForecast
} from '../services/calculationEngine';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function ReportsPage() {
  const { t } = useTranslation();
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('reports.title')}</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{t('reports.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value={7}>Son 7 Gün</option>
            <option value={14}>Son 14 Gün</option>
            <option value={30}>Son 30 Gün</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
            <Download size={20} />
            {t('common.export')}
          </button>
        </div>
      </div>

      {/* Rapor Tipi Seçimi */}
      <div className="flex gap-2">
        <button
          onClick={() => setReportType('daily')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            reportType === 'daily' ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          <Calendar size={18} />
          {t('reports.dailyReport')}
        </button>
        <button
          onClick={() => setReportType('cost')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            reportType === 'cost' ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          <PieChart size={18} />
          {t('reports.costBreakdown')}
        </button>
        <button
          onClick={() => setReportType('monthly')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            reportType === 'monthly' ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          <TrendingUp size={18} />
          {t('reports.monthlyReport')}
        </button>
      </div>

      {/* Özet Kartları */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">{t('dashboard.totalGross')}</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(totals.gross)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">{t('dashboard.totalCommission')}</p>
          <p className="text-lg font-bold text-red-600 dark:text-red-400">{formatCurrency(totals.commission)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">{t('dashboard.eftFees')}</p>
          <p className="text-lg font-bold text-orange-600 dark:text-orange-400">{formatCurrency(totals.eft)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">{t('dashboard.netAmount')}</p>
          <p className="text-lg font-bold text-green-600 dark:text-green-400">{formatCurrency(totals.net)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">{t('sidebar.totalTransactions')}</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{totals.count}</p>
        </div>
      </div>

      {/* Günlük Rapor */}
      {reportType === 'daily' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('reports.dailyReport')}</h3>
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

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('sidebar.totalTransactions')}</h3>
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
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('reports.costBreakdown')}</h3>
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
                    <span className="text-sm text-gray-600 dark:text-gray-300">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium dark:text-white">{formatCurrency(item.value)}</span>
                    <span className="text-xs text-gray-400 ml-2">({item.percentage.toFixed(1)}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('reports.bankAnalysis')}</h3>
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
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('dashboard.cashFlowForecast')}</h3>
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
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400">{t('dashboard.date')}</th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400">{t('dashboard.expected')}</th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400">{t('sidebar.totalTransactions')}</th>
                </tr>
              </thead>
              <tbody>
                {cashFlow.slice(0, 7).map((cf, index) => (
                  <tr key={index} className="border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="py-2 px-3 text-sm dark:text-gray-300">{format(cf.date, 'dd MMMM yyyy', { locale: tr })}</td>
                    <td className="py-2 px-3 text-sm text-right font-medium text-green-600 dark:text-green-400">
                      {formatCurrency(cf.expectedAmount)}
                    </td>
                    <td className="py-2 px-3 text-sm text-right text-gray-500 dark:text-gray-400">
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

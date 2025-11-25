// ===========================================
// KONTROL PANELİ (DASHBOARD)
// ===========================================

import React from 'react';
import {
  Wallet, TrendingDown, Calendar, CreditCard,
  ArrowUpRight, ArrowDownRight, Building2
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { useApp, useFilteredTransactions } from '../contexts/AppContext';
import {
  formatCurrency, generateCashFlowForecast
} from '../services/calculationEngine';
import StatCard from '../components/StatCard';
import { format } from 'date-fns';
import { tr, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

export default function Dashboard() {
  const { state } = useApp();
  const { t, i18n } = useTranslation();
  const transactions = useFilteredTransactions();
  const locale = i18n.language === 'tr' ? tr : enUS;

  // Toplam hesaplamalar
  const totals = React.useMemo(() => {
    const gross = transactions.reduce((sum, t) => sum + t.grossAmount, 0);
    const commission = transactions.reduce((sum, t) => sum + (t.commissionAmount || 0), 0);
    const eft = transactions.reduce((sum, t) => sum + (t.eftFee || 0), 0);
    const net = transactions.reduce((sum, t) => sum + (t.finalAmount || 0), 0);
    return { gross, commission, eft, net };
  }, [transactions]);

  // Banka bazlı dağılım (Pie Chart için)
  const bankDistribution = React.useMemo(() => {
    const distribution = state.banks.map(bank => {
      const bankTxns = transactions.filter(t => t.bankId === bank.id);
      const total = bankTxns.reduce((sum, t) => sum + (t.commissionAmount || 0), 0);
      return {
        name: bank.name,
        value: total,
        color: bank.color
      };
    }).filter(d => d.value > 0);

    return distribution;
  }, [transactions, state.banks]);

  // Günlük işlem hacmi (Bar Chart için)
  const dailyVolume = React.useMemo(() => {
    const last7Days: { date: string; gross: number; net: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStr = format(date, 'dd MMM', { locale });

      const dayTxns = transactions.filter(t => {
        const txDate = new Date(t.date);
        return txDate.toDateString() === date.toDateString();
      });

      last7Days.push({
        date: dayStr,
        gross: dayTxns.reduce((sum, t) => sum + t.grossAmount, 0),
        net: dayTxns.reduce((sum, t) => sum + (t.finalAmount || 0), 0)
      });
    }
    return last7Days;
  }, [transactions]);

  // Nakit akışı tahmini
  const cashFlow = React.useMemo(() => {
    return generateCashFlowForecast(transactions, 7, state.banks);
  }, [transactions, state.banks]);

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{t('dashboard.title')}</h2>
        <p className="text-gray-500 mt-1">{t('dashboard.subtitle')}</p>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t('dashboard.totalGross')}
          value={formatCurrency(totals.gross)}
          subtitle={`${transactions.length} ${t('dashboard.transactions')}`}
          icon={Wallet}
          color="blue"
          trend={{ value: 12.5, isPositive: true }}
        />
        <StatCard
          title={t('dashboard.totalCommission')}
          value={formatCurrency(totals.commission)}
          subtitle={t('dashboard.commissionCut')}
          icon={TrendingDown}
          color="red"
        />
        <StatCard
          title={t('dashboard.eftFees')}
          value={formatCurrency(totals.eft)}
          subtitle={t('dashboard.transferFees')}
          icon={ArrowUpRight}
          color="yellow"
        />
        <StatCard
          title={t('dashboard.netAmount')}
          value={formatCurrency(totals.net)}
          subtitle={t('dashboard.toYourAccount')}
          icon={ArrowDownRight}
          color="green"
          trend={{ value: 8.3, isPositive: true }}
        />
      </div>

      {/* Grafikler */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Günlük Hacim Grafiği */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">
            {t('dashboard.last7Days')}
          </h3>
          <div className="h-72 md:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyVolume}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis fontSize={12} tickFormatter={(v) => `₺${(v/1000).toFixed(0)}K`} />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), '']}
                  labelStyle={{ color: '#374151' }}
                />
                <Bar dataKey="gross" name={t('dashboard.gross')} fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="net" name={t('dashboard.net')} fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Banka Dağılımı (Komisyon) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">
            {t('dashboard.bankCommissionDist')}
          </h3>
          <div className="h-72 md:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={bankDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {bankDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            {bankDistribution.map((entry, index) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-xs text-gray-600">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Nakit Akışı Tahmini */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
        <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">
          {t('dashboard.cashFlowForecast')}
        </h3>
        <div className="h-72 md:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={cashFlow.map(cf => ({
              date: format(cf.date, 'dd MMM', { locale }),
              tutar: cf.expectedAmount
            }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis fontSize={12} tickFormatter={(v) => `₺${(v/1000).toFixed(0)}K`} />
              <Tooltip formatter={(value: number) => [formatCurrency(value), t('dashboard.expected')]} />
              <Line
                type="monotone"
                dataKey="tutar"
                stroke="#8b5cf6"
                strokeWidth={3}
                dot={{ fill: '#8b5cf6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Son İşlemler */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
        <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">
          {t('dashboard.recentTransactions')}
        </h3>

        {/* Desktop - Tablo Görünümü */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">{t('dashboard.date')}</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">{t('dashboard.bank')}</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">{t('dashboard.gross')}</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">{t('dashboard.commission')}</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">{t('dashboard.net')}</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">{t('dashboard.status')}</th>
              </tr>
            </thead>
            <tbody>
              {transactions.slice(0, 10).map(txn => {
                const bank = state.banks.find(b => b.id === txn.bankId);
                return (
                  <tr key={txn.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {format(new Date(txn.date), 'dd.MM.yyyy HH:mm')}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span>{bank?.logo}</span>
                        <span className="text-sm font-medium text-gray-700">{bank?.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-right font-medium text-gray-900">
                      {formatCurrency(txn.grossAmount)}
                    </td>
                    <td className="py-3 px-4 text-sm text-right text-red-600">
                      -{formatCurrency(txn.commissionAmount || 0)}
                    </td>
                    <td className="py-3 px-4 text-sm text-right font-medium text-green-600">
                      {formatCurrency(txn.finalAmount || 0)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`
                        inline-flex px-2 py-1 text-xs font-medium rounded-full
                        ${txn.status === 'beklemede' ? 'bg-yellow-100 text-yellow-700' : ''}
                        ${txn.status === 'islendi' ? 'bg-blue-100 text-blue-700' : ''}
                        ${txn.status === 'transfer_edildi' ? 'bg-green-100 text-green-700' : ''}
                      `}>
                        {txn.status === 'beklemede' && t('dashboard.pending')}
                        {txn.status === 'islendi' && t('dashboard.processed')}
                        {txn.status === 'transfer_edildi' && t('dashboard.transferred')}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile - Kart Görünümü */}
        <div className="md:hidden space-y-3">
          {transactions.slice(0, 10).map(txn => {
            const bank = state.banks.find(b => b.id === txn.bankId);
            return (
              <div key={txn.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors">
                {/* Üst Kısım: Banka ve Durum */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{bank?.logo}</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{bank?.name}</p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(txn.date), 'dd.MM.yyyy HH:mm')}
                      </p>
                    </div>
                  </div>
                  <span className={`
                    inline-flex px-2.5 py-1 text-xs font-medium rounded-full
                    ${txn.status === 'beklemede' ? 'bg-yellow-100 text-yellow-700' : ''}
                    ${txn.status === 'islendi' ? 'bg-blue-100 text-blue-700' : ''}
                    ${txn.status === 'transfer_edildi' ? 'bg-green-100 text-green-700' : ''}
                  `}>
                    {txn.status === 'beklemede' && t('dashboard.pending')}
                    {txn.status === 'islendi' && t('dashboard.processed')}
                    {txn.status === 'transfer_edildi' && t('dashboard.transferred')}
                  </span>
                </div>

                {/* Alt Kısım: Tutarlar */}
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">{t('dashboard.gross')}</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatCurrency(txn.grossAmount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">{t('dashboard.commission')}</p>
                    <p className="text-sm font-semibold text-red-600">
                      -{formatCurrency(txn.commissionAmount || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">{t('dashboard.net')}</p>
                    <p className="text-sm font-semibold text-green-600">
                      {formatCurrency(txn.finalAmount || 0)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

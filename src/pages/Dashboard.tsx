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
import { tr } from 'date-fns/locale';

export default function Dashboard() {
  const { state } = useApp();
  const transactions = useFilteredTransactions();

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
      const dayStr = format(date, 'dd MMM', { locale: tr });

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
        <h2 className="text-2xl font-bold text-gray-900">Kontrol Paneli</h2>
        <p className="text-gray-500 mt-1">POS işlemlerinizin genel özeti</p>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Toplam Brüt Ciro"
          value={formatCurrency(totals.gross)}
          subtitle={`${transactions.length} işlem`}
          icon={Wallet}
          color="blue"
          trend={{ value: 12.5, isPositive: true }}
        />
        <StatCard
          title="Toplam Komisyon"
          value={formatCurrency(totals.commission)}
          subtitle="Kesilen komisyon"
          icon={TrendingDown}
          color="red"
        />
        <StatCard
          title="EFT Ücretleri"
          value={formatCurrency(totals.eft)}
          subtitle="Transfer masrafları"
          icon={ArrowUpRight}
          color="yellow"
        />
        <StatCard
          title="Net Tutar"
          value={formatCurrency(totals.net)}
          subtitle="Hesabınıza geçecek"
          icon={ArrowDownRight}
          color="green"
          trend={{ value: 8.3, isPositive: true }}
        />
      </div>

      {/* Grafikler */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Günlük Hacim Grafiği */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Son 7 Gün İşlem Hacmi
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyVolume}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis fontSize={12} tickFormatter={(v) => `₺${(v/1000).toFixed(0)}K`} />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), '']}
                  labelStyle={{ color: '#374151' }}
                />
                <Bar dataKey="gross" name="Brüt" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="net" name="Net" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Banka Dağılımı (Komisyon) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Banka Bazlı Komisyon Dağılımı
          </h3>
          <div className="h-64">
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Önümüzdeki 7 Gün Nakit Akışı Tahmini
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={cashFlow.map(cf => ({
              date: format(cf.date, 'dd MMM', { locale: tr }),
              tutar: cf.expectedAmount
            }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis fontSize={12} tickFormatter={(v) => `₺${(v/1000).toFixed(0)}K`} />
              <Tooltip formatter={(value: number) => [formatCurrency(value), 'Beklenen']} />
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Son İşlemler
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Tarih</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Banka</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Brüt</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Komisyon</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Net</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Durum</th>
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
      </div>
    </div>
  );
}

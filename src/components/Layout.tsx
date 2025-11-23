// ===========================================
// ANA LAYOUT BİLEŞENİ
// ===========================================

import React from 'react';
import {
  LayoutDashboard, Receipt, Building2, Calculator,
  BarChart3, Settings, Menu, X, CreditCard
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { state, dispatch } = useApp();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  const menuItems = [
    { id: 'dashboard', label: 'Kontrol Paneli', icon: LayoutDashboard },
    { id: 'transactions', label: 'İşlemler', icon: Receipt },
    { id: 'banks', label: 'Bankalar & Komisyon', icon: Building2 },
    { id: 'simulation', label: 'Simülasyon', icon: Calculator },
    { id: 'reports', label: 'Raporlar', icon: BarChart3 },
    { id: 'settings', label: 'Ayarlar', icon: Settings },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="flex items-center gap-2">
              <CreditCard className="text-primary-600" size={28} />
              <h1 className="text-xl font-bold text-gray-800">
                POS Mutabakat Sistemi
              </h1>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            {new Date().toLocaleDateString('tr-TR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`
        fixed top-14 left-0 bottom-0 w-64 bg-white border-r border-gray-200
        transform transition-transform duration-200 ease-in-out z-40
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <nav className="p-4 space-y-1">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = state.activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => dispatch({ type: 'SET_ACTIVE_VIEW', payload: item.id as any })}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg
                  transition-colors duration-150
                  ${isActive
                    ? 'bg-primary-50 text-primary-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Özet Bilgiler */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg p-4 text-white">
            <p className="text-xs opacity-80">Toplam İşlem</p>
            <p className="text-2xl font-bold">{state.transactions.length}</p>
            <p className="text-xs opacity-80 mt-2">Aktif POS</p>
            <p className="text-lg font-semibold">
              {state.posDevices.filter(p => p.isActive).length}
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`
        pt-14 transition-all duration-200
        ${sidebarOpen ? 'lg:ml-64' : ''}
      `}>
        <div className="p-6">
          {children}
        </div>
      </main>

      {/* Notifications */}
      <div className="fixed bottom-4 right-4 space-y-2 z-50">
        {state.notifications.map(notification => (
          <div
            key={notification.id}
            className={`
              px-4 py-3 rounded-lg shadow-lg text-white
              ${notification.type === 'success' ? 'bg-green-500' : ''}
              ${notification.type === 'error' ? 'bg-red-500' : ''}
              ${notification.type === 'info' ? 'bg-blue-500' : ''}
            `}
          >
            {notification.message}
          </div>
        ))}
      </div>
    </div>
  );
}

// ===========================================
// ANA LAYOUT BİLEŞENİ
// ===========================================

import React from 'react';
import {
  LayoutDashboard, Receipt, Building2, Calculator,
  BarChart3, Settings, Menu, X, CreditCard, Globe
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useTranslation } from 'react-i18next';
import ThemeToggle from './ThemeToggle';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { state, dispatch } = useApp();
  const { t, i18n } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [languageMenuOpen, setLanguageMenuOpen] = React.useState(false);
  const languageMenuRef = React.useRef<HTMLDivElement>(null);

  // Dil menüsünü dışarı tıklandığında kapat
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target as Node)) {
        setLanguageMenuOpen(false);
      }
    }
    if (languageMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [languageMenuOpen]);

  const menuItems = [
    { id: 'dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { id: 'transactions', label: t('nav.transactions'), icon: Receipt },
    { id: 'banks', label: t('nav.banks'), icon: Building2 },
    { id: 'simulation', label: t('nav.simulation'), icon: Calculator },
    { id: 'reports', label: t('nav.reports'), icon: BarChart3 },
    { id: 'settings', label: t('nav.settings'), icon: Settings },
  ] as const;

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setLanguageMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 fixed top-0 left-0 right-0 z-50 transition-colors">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden transition-colors"
              aria-label={sidebarOpen ? `${t('common.close')} ${t('common.menu')}` : `${t('common.open')} ${t('common.menu')}`}
              aria-expanded={sidebarOpen}
              aria-controls="sidebar-navigation"
            >
              {sidebarOpen ? <X size={20} className="text-gray-700 dark:text-gray-300" /> : <Menu size={20} className="text-gray-700 dark:text-gray-300" />}
            </button>
            <div className="flex items-center gap-2">
              <CreditCard className="text-primary-600 dark:text-primary-400" size={28} />
              <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100 hidden sm:block">
                {t('header.title')}
              </h1>
              <h1 className="text-lg font-bold text-gray-800 dark:text-gray-100 sm:hidden">
                POSum
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-sm text-gray-500 dark:text-gray-400 hidden md:block">
              {new Date().toLocaleDateString(i18n.language === 'tr' ? 'tr-TR' : 'en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
            {/* Theme Toggle */}
            <ThemeToggle />
            {/* Dil Seçici */}
            <div className="relative" ref={languageMenuRef}>
              <button
                onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 transition-colors min-h-[44px]"
                title={t('settings.language')}
                aria-label={`${t('settings.language')}: ${i18n.language === 'tr' ? 'Türkçe' : 'English'}`}
                aria-expanded={languageMenuOpen}
                aria-haspopup="true"
              >
                <Globe size={20} className="text-gray-600 dark:text-gray-300" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase hidden sm:inline">
                  {i18n.language}
                </span>
              </button>
              {languageMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                  <button
                    onClick={() => changeLanguage('tr')}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600 transition-colors min-h-[44px] ${
                      i18n.language === 'tr' ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium' : 'text-gray-700 dark:text-gray-300'
                    }`}
                    aria-label="Türkçe dili seç"
                    aria-current={i18n.language === 'tr' ? 'true' : undefined}
                    role="menuitem"
                  >
                    🇹🇷 Türkçe
                  </button>
                  <button
                    onClick={() => changeLanguage('en')}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600 transition-colors min-h-[44px] ${
                      i18n.language === 'en' ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium' : 'text-gray-700 dark:text-gray-300'
                    }`}
                    aria-label="Select English language"
                    aria-current={i18n.language === 'en' ? 'true' : undefined}
                    role="menuitem"
                  >
                    🇬🇧 English
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        id="sidebar-navigation"
        className={`
          fixed top-14 left-0 bottom-0 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
          transform transition-all duration-200 ease-in-out z-40
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
        aria-label="Main navigation"
      >
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
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
                  }
                `}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Özet Bilgiler */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 dark:from-primary-600 dark:to-primary-700 rounded-lg p-4 text-white shadow-md">
            <p className="text-xs opacity-80">{t('sidebar.totalTransactions')}</p>
            <p className="text-2xl font-bold">{state.transactions.length}</p>
            <p className="text-xs opacity-80 mt-2">{t('sidebar.activePOS')}</p>
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

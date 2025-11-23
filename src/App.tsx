// ===========================================
// ANA UYGULAMA BİLEŞENİ
// ===========================================

import React from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import TransactionsPage from './pages/TransactionsPage';
import BanksPage from './pages/BanksPage';
import SimulationPage from './pages/SimulationPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';

// Sayfa Yönlendiricisi
function PageRouter() {
  const { state } = useApp();

  switch (state.activeView) {
    case 'dashboard':
      return <Dashboard />;
    case 'transactions':
      return <TransactionsPage />;
    case 'banks':
      return <BanksPage />;
    case 'simulation':
      return <SimulationPage />;
    case 'reports':
      return <ReportsPage />;
    case 'settings':
      return <SettingsPage />;
    default:
      return <Dashboard />;
  }
}

// Ana Uygulama
function App() {
  return (
    <AppProvider>
      <Layout>
        <PageRouter />
      </Layout>
    </AppProvider>
  );
}

export default App;

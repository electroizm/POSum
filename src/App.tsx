// ===========================================
// ANA UYGULAMA BİLEŞENİ
// ===========================================

import React, { Suspense, lazy } from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import Layout from './components/Layout';
import Loading from './components/Loading';

// Lazy load all page components for better performance
const Dashboard = lazy(() => import('./pages/Dashboard'));
const TransactionsPage = lazy(() => import('./pages/TransactionsPage'));
const BanksPage = lazy(() => import('./pages/BanksPage'));
const SimulationPage = lazy(() => import('./pages/SimulationPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

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
        <Suspense fallback={<Loading message="Sayfa yukleniyor" />}>
          <PageRouter />
        </Suspense>
      </Layout>
    </AppProvider>
  );
}

export default App;

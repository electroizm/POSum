// ===========================================
// ANA UYGULAMA BİLEŞENİ
// ===========================================

import React, { Suspense, lazy, useState } from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import ToastContainer from './components/ToastContainer';
import Layout from './components/Layout';
import Loading from './components/Loading';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

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

// Auth Router - handles login/register vs main app
function AuthRouter() {
  const { authState } = useAuth();
  const [showRegister, setShowRegister] = useState(false);

  // Show loading while checking auth
  if (authState.isLoading) {
    return <Loading message="Loading..." />;
  }

  // If not authenticated, show login/register
  if (!authState.isAuthenticated) {
    if (showRegister) {
      return <RegisterPage onLoginClick={() => setShowRegister(false)} />;
    }
    return <LoginPage onRegisterClick={() => setShowRegister(true)} />;
  }

  // User is authenticated, show main app
  return (
    <AppProvider>
      <Layout>
        <Suspense fallback={<Loading message="Sayfa yukleniyor" />}>
          <PageRouter />
        </Suspense>
      </Layout>
      <ToastContainer />
    </AppProvider>
  );
}

// Ana Uygulama
function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AuthRouter />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;

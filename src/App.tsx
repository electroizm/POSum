// ===========================================
// ANA UYGULAMA BİLEŞENİ
// ===========================================

import React, { Suspense, lazy, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './contexts/AppContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import ToastContainer from './components/ToastContainer';
import Layout from './components/Layout';
import Loading from './components/Loading';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

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

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { authState } = useAuth();

  if (authState.isLoading) {
    return <Loading message="Loading..." />;
  }

  if (!authState.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Auth Router - handles login/register vs main app
function AuthRouter() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Protected Routes */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AppProvider>
              <Layout>
                <Suspense fallback={<Loading message="Sayfa yukleniyor" />}>
                  <PageRouter />
                </Suspense>
              </Layout>
              <ToastContainer />
            </AppProvider>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

// Ana Uygulama
function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <AuthRouter />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;

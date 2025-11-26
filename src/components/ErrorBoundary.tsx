// ===========================================
// ERROR BOUNDARY COMPONENT
// ===========================================

import React, { Component, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, RefreshCw, Flag } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

// Error fallback UI component
function ErrorFallback({
  error,
  errorInfo,
  onReset,
  onReport
}: {
  error: Error;
  errorInfo: React.ErrorInfo;
  onReset: () => void;
  onReport: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
        {/* Error Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
        </div>

        {/* Error Title */}
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
          {t('errors.boundary.title')}
        </h1>

        {/* Error Message */}
        <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
          {t('errors.boundary.message')}
        </p>

        {/* Error Details (Development) */}
        {import.meta.env.DEV && (
          <div className="mb-6">
            <details className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
              <summary className="cursor-pointer font-medium text-gray-900 dark:text-white mb-2">
                Error Details
              </summary>
              <div className="mt-2 space-y-2">
                <div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Error:
                  </p>
                  <pre className="text-xs text-red-600 dark:text-red-400 overflow-auto">
                    {error.toString()}
                  </pre>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Stack Trace:
                  </p>
                  <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-auto max-h-40">
                    {errorInfo.componentStack}
                  </pre>
                </div>
              </div>
            </details>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onReset}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            {t('errors.boundary.reload')}
          </button>
          <button
            onClick={onReport}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition-colors"
          >
            <Flag className="w-5 h-5" />
            {t('errors.boundary.report')}
          </button>
        </div>

        {/* Additional Info */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            {t('errors.boundary.description')}
          </p>
        </div>
      </div>
    </div>
  );
}

// Error Boundary Class Component
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error('Error Boundary caught an error:', error);
      console.error('Error Info:', errorInfo);
    }

    // Update state with error details
    this.setState({
      error,
      errorInfo
    });

    // Here you could send error to logging service
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    // Reset error state and reload page
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    window.location.reload();
  };

  handleReport = () => {
    const { error, errorInfo } = this.state;

    // Create error report
    const report = {
      error: error?.toString(),
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    };

    // Log to console
    console.log('Error Report:', report);

    // Here you could:
    // 1. Send to error tracking service (Sentry, LogRocket, etc.)
    // 2. Show a modal to collect user feedback
    // 3. Copy to clipboard
    // 4. Open email client with error details

    // For now, just copy to clipboard
    const reportText = JSON.stringify(report, null, 2);
    navigator.clipboard.writeText(reportText).then(() => {
      alert('Error details copied to clipboard');
    });
  };

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { children } = this.props;

    if (hasError && error && errorInfo) {
      return (
        <ErrorFallback
          error={error}
          errorInfo={errorInfo}
          onReset={this.handleReset}
          onReport={this.handleReport}
        />
      );
    }

    return children;
  }
}

export default ErrorBoundary;

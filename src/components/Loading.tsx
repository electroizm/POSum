// ===========================================
// LOADING COMPONENT - SUSPENSE FALLBACK
// ===========================================

import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
}

export default function Loading({
  message = 'Yukleniyor...',
  fullScreen = true
}: LoadingProps) {
  const containerClasses = fullScreen
    ? 'fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-900'
    : 'flex items-center justify-center p-8';

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center gap-4">
        {/* Animated Spinner */}
        <Loader2
          className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin"
          strokeWidth={2.5}
        />

        {/* Loading Message */}
        <div className="text-center">
          <p className="text-base font-medium text-gray-700 dark:text-gray-300">
            {message}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Lutfen bekleyin...
          </p>
        </div>

        {/* Loading Bar Animation */}
        <div className="w-48 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-blue-600 dark:bg-blue-400 rounded-full animate-loading-bar" />
        </div>
      </div>
    </div>
  );
}

// Skeleton Loader Component for More Detailed Loading States
export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2" />
          <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-32 mb-2" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20" />
        </div>
        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg" />
      </div>
    </div>
  );
}

// Table Skeleton Loader
export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4 animate-pulse" />
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4 animate-pulse">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded flex-1" />
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-24" />
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}

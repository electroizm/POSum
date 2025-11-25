// ===========================================
// TOAST NOTIFICATION COMPONENT
// ===========================================

import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastProps {
  id: string;
  type: ToastType;
  message: string;
  duration?: number; // in milliseconds, default 5000
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({
  id,
  type,
  message,
  duration = 5000,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    const enterTimer = setTimeout(() => setIsVisible(true), 10);

    // Auto-dismiss after duration
    const dismissTimer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(dismissTimer);
    };
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    // Wait for animation to complete before removing
    setTimeout(() => {
      onClose(id);
    }, 300);
  };

  // Toast type configurations
  const config = {
    success: {
      icon: CheckCircle,
      bgClass: 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800',
      iconClass: 'text-green-600 dark:text-green-400',
      textClass: 'text-green-900 dark:text-green-100'
    },
    error: {
      icon: XCircle,
      bgClass: 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800',
      iconClass: 'text-red-600 dark:text-red-400',
      textClass: 'text-red-900 dark:text-red-100'
    },
    info: {
      icon: Info,
      bgClass: 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800',
      iconClass: 'text-blue-600 dark:text-blue-400',
      textClass: 'text-blue-900 dark:text-blue-100'
    },
    warning: {
      icon: AlertTriangle,
      bgClass: 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800',
      iconClass: 'text-yellow-600 dark:text-yellow-400',
      textClass: 'text-yellow-900 dark:text-yellow-100'
    }
  };

  const { icon: Icon, bgClass, iconClass, textClass } = config[type];

  return (
    <div
      className={`
        flex items-start gap-3 p-4 rounded-lg border shadow-lg
        min-w-[300px] max-w-md
        transition-all duration-300 ease-in-out
        ${bgClass}
        ${isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${isLeaving ? 'scale-95' : 'scale-100'}
      `}
      role="alert"
    >
      {/* Icon */}
      <div className="flex-shrink-0">
        <Icon className={`w-5 h-5 ${iconClass}`} />
      </div>

      {/* Message */}
      <div className={`flex-1 text-sm font-medium ${textClass}`}>
        {message}
      </div>

      {/* Close Button */}
      <button
        onClick={handleClose}
        className={`
          flex-shrink-0 p-1 rounded-md
          hover:bg-black/10 dark:hover:bg-white/10
          transition-colors
          ${textClass}
        `}
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;

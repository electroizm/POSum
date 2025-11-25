// ===========================================
// TOAST CONTAINER COMPONENT
// ===========================================

import React from 'react';
import { useApp } from '../contexts/AppContext';
import Toast from './Toast';

const ToastContainer: React.FC = () => {
  const { state, dispatch } = useApp();
  const { notifications } = state;

  // Maximum number of toasts to show at once
  const MAX_TOASTS = 3;

  // Only show the most recent toasts
  const visibleNotifications = notifications.slice(-MAX_TOASTS);

  const handleClose = (id: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
  };

  if (visibleNotifications.length === 0) {
    return null;
  }

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-3"
      aria-live="polite"
      aria-atomic="true"
    >
      {visibleNotifications.map((notification) => (
        <Toast
          key={notification.id}
          id={notification.id}
          type={notification.type}
          message={notification.message}
          duration={5000}
          onClose={handleClose}
        />
      ))}
    </div>
  );
};

export default ToastContainer;

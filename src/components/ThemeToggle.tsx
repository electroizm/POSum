// ===========================================
// THEME TOGGLE COMPONENT
// ===========================================

import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useTranslation } from 'react-i18next';
import { ThemeMode } from '../utils/storage';

export default function ThemeToggle() {
  const { state, dispatch } = useApp();
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [menuOpen]);

  const changeTheme = (theme: ThemeMode) => {
    dispatch({ type: 'SET_THEME', payload: theme });
    setMenuOpen(false);
  };

  const getCurrentIcon = () => {
    switch (state.theme) {
      case 'dark':
        return <Moon size={20} />;
      case 'auto':
        return <Monitor size={20} />;
      default:
        return <Sun size={20} />;
    }
  };

  const getThemeLabel = (theme: ThemeMode): string => {
    switch (theme) {
      case 'light':
        return t('theme.light') || 'Light';
      case 'dark':
        return t('theme.dark') || 'Dark';
      case 'auto':
        return t('theme.auto') || 'Auto';
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 transition-colors min-h-[44px]"
        title={t('theme.toggle') || 'Toggle theme'}
        aria-label={`${t('theme.current') || 'Current theme'}: ${getThemeLabel(state.theme)}`}
        aria-expanded={menuOpen}
        aria-haspopup="true"
      >
        <span className="text-gray-600 dark:text-gray-300">
          {getCurrentIcon()}
        </span>
      </button>

      {menuOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
          <button
            onClick={() => changeTheme('light')}
            className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600 transition-colors min-h-[44px] ${
              state.theme === 'light'
                ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium'
                : 'text-gray-700 dark:text-gray-300'
            }`}
            aria-label={getThemeLabel('light')}
            aria-current={state.theme === 'light' ? 'true' : undefined}
            role="menuitem"
          >
            <Sun size={20} />
            <span>{getThemeLabel('light')}</span>
          </button>

          <button
            onClick={() => changeTheme('dark')}
            className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600 transition-colors min-h-[44px] ${
              state.theme === 'dark'
                ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium'
                : 'text-gray-700 dark:text-gray-300'
            }`}
            aria-label={getThemeLabel('dark')}
            aria-current={state.theme === 'dark' ? 'true' : undefined}
            role="menuitem"
          >
            <Moon size={20} />
            <span>{getThemeLabel('dark')}</span>
          </button>

          <button
            onClick={() => changeTheme('auto')}
            className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600 transition-colors min-h-[44px] ${
              state.theme === 'auto'
                ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium'
                : 'text-gray-700 dark:text-gray-300'
            }`}
            aria-label={getThemeLabel('auto')}
            aria-current={state.theme === 'auto' ? 'true' : undefined}
            role="menuitem"
          >
            <Monitor size={20} />
            <span>{getThemeLabel('auto')}</span>
          </button>
        </div>
      )}
    </div>
  );
}

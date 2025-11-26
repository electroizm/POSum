import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

interface LanguageSwitcherProps {
  variant?: 'default' | 'compact';
  className?: string;
}

export default function LanguageSwitcher({ variant = 'default', className = '' }: LanguageSwitcherProps) {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 transition-colors min-h-[44px]"
        title={i18n.language === 'tr' ? 'Dil Seçimi' : 'Language Selection'}
        aria-label={`${i18n.language === 'tr' ? 'Dil' : 'Language'}: ${i18n.language === 'tr' ? 'Türkçe' : 'English'}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Globe size={20} className="text-gray-600 dark:text-gray-300" />
        {variant === 'default' && (
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase hidden sm:inline">
            {i18n.language}
          </span>
        )}
      </button>
      {isOpen && (
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
  );
}

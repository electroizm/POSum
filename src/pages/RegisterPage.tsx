// ===========================================
// REGISTER SAYFASI
// ===========================================

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, AlertCircle, Eye, EyeOff, UserPlus, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { RegisterData } from '../types';
import LanguageSwitcher from '../components/LanguageSwitcher';
import Dialog from '../components/Dialog';

export default function RegisterPage() {
  const { t } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError(t('auth.passwordMismatch'));
      return;
    }

    if (formData.password.length < 6) {
      setError(t('auth.passwordTooShort'));
      return;
    }

    setIsLoading(true);

    try {
      const registerData: RegisterData = {
        name: formData.name,
        email: formData.email,
        password: formData.password
      };

      console.log('📝 Starting registration for:', registerData.email);
      await register(registerData);
      console.log('✅ Registration successful! Navigating to dashboard...');
      navigate('/dashboard');
    } catch (err) {
      console.error('❌ Registration failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'auth.errors.registrationFailed';
      // Check if error message is a translation key
      const translatedError = errorMessage.startsWith('auth.') ? t(errorMessage) : errorMessage;
      console.error('❌ Translated error:', translatedError);
      setError(translatedError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Language Switcher */}
        <div className="flex justify-end mb-4">
          <LanguageSwitcher variant="compact" />
        </div>

        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 dark:bg-primary-500 rounded-2xl mb-4">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('auth.createAccount')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('auth.registerSubtitle')}
          </p>
        </div>

        {/* Register Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900 dark:text-red-300">
                  {t('auth.registerError')}
                </p>
                <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                  {error}
                </p>
              </div>
            </div>
          )}

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('auth.fullName')}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder={t('auth.fullNamePlaceholder')}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('auth.email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder={t('auth.emailPlaceholder')}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('auth.password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder={t('auth.passwordPlaceholder')}
                  required
                  disabled={isLoading}
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {t('auth.passwordRequirement')}
              </p>
            </div>

            {/* Confirm Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('auth.confirmPassword')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder={t('auth.confirmPasswordPlaceholder')}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start">
              <input
                type="checkbox"
                id="terms"
                className="w-4 h-4 mt-1 text-primary-600 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500"
                required
                disabled={isLoading}
              />
              <label htmlFor="terms" className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                {t('auth.agreeToTerms')}{' '}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowTerms(true);
                  }}
                  className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 underline"
                >
                  {t('auth.termsOfService')}
                </button>{' '}
                {t('auth.and')}{' '}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowPrivacy(true);
                  }}
                  className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 underline"
                >
                  {t('auth.privacyPolicy')}
                </button>
              </label>
            </div>

            {/* Register Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t('auth.creatingAccount')}
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  {t('auth.createAccount')}
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                {t('auth.or')}
              </span>
            </div>
          </div>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('auth.haveAccount')}{' '}
              <Link
                to="/login"
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors"
              >
                {t('auth.login')}
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © 2024 POSum. {t('auth.allRightsReserved')}
          </p>
        </div>

        {/* Terms of Service Dialog */}
        <Dialog
          isOpen={showTerms}
          onClose={() => setShowTerms(false)}
          title={t('auth.termsOfServiceContent.title')}
          maxWidth="2xl"
        >
          <div className="space-y-6 text-gray-700 dark:text-gray-300">
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">
              {t('auth.termsOfServiceContent.lastUpdated')}
            </p>
            <p>{t('auth.termsOfServiceContent.introduction')}</p>

            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                {t('auth.termsOfServiceContent.section1.title')}
              </h3>
              <p>{t('auth.termsOfServiceContent.section1.content')}</p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                {t('auth.termsOfServiceContent.section2.title')}
              </h3>
              <p>{t('auth.termsOfServiceContent.section2.content')}</p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                {t('auth.termsOfServiceContent.section3.title')}
              </h3>
              <p>{t('auth.termsOfServiceContent.section3.content')}</p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                {t('auth.termsOfServiceContent.section4.title')}
              </h3>
              <p>{t('auth.termsOfServiceContent.section4.content')}</p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                {t('auth.termsOfServiceContent.section5.title')}
              </h3>
              <p>{t('auth.termsOfServiceContent.section5.content')}</p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                {t('auth.termsOfServiceContent.section6.title')}
              </h3>
              <p>{t('auth.termsOfServiceContent.section6.content')}</p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                {t('auth.termsOfServiceContent.section7.title')}
              </h3>
              <p>{t('auth.termsOfServiceContent.section7.content')}</p>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                {t('auth.termsOfServiceContent.contact.title')}
              </h3>
              <p>{t('auth.termsOfServiceContent.contact.content')}</p>
            </div>
          </div>
        </Dialog>

        {/* Privacy Policy Dialog */}
        <Dialog
          isOpen={showPrivacy}
          onClose={() => setShowPrivacy(false)}
          title={t('auth.privacyPolicyContent.title')}
          maxWidth="2xl"
        >
          <div className="space-y-6 text-gray-700 dark:text-gray-300">
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">
              {t('auth.privacyPolicyContent.lastUpdated')}
            </p>
            <p>{t('auth.privacyPolicyContent.introduction')}</p>

            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                {t('auth.privacyPolicyContent.section1.title')}
              </h3>
              <p>{t('auth.privacyPolicyContent.section1.content')}</p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                {t('auth.privacyPolicyContent.section2.title')}
              </h3>
              <p className="whitespace-pre-line">{t('auth.privacyPolicyContent.section2.content')}</p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                {t('auth.privacyPolicyContent.section3.title')}
              </h3>
              <p className="whitespace-pre-line">{t('auth.privacyPolicyContent.section3.content')}</p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                {t('auth.privacyPolicyContent.section4.title')}
              </h3>
              <p className="whitespace-pre-line">{t('auth.privacyPolicyContent.section4.content')}</p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                {t('auth.privacyPolicyContent.section5.title')}
              </h3>
              <p className="whitespace-pre-line">{t('auth.privacyPolicyContent.section5.content')}</p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                {t('auth.privacyPolicyContent.section6.title')}
              </h3>
              <p className="whitespace-pre-line">{t('auth.privacyPolicyContent.section6.content')}</p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                {t('auth.privacyPolicyContent.section7.title')}
              </h3>
              <p className="whitespace-pre-line">{t('auth.privacyPolicyContent.section7.content')}</p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                {t('auth.privacyPolicyContent.section8.title')}
              </h3>
              <p>{t('auth.privacyPolicyContent.section8.content')}</p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                {t('auth.privacyPolicyContent.section9.title')}
              </h3>
              <p>{t('auth.privacyPolicyContent.section9.content')}</p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                {t('auth.privacyPolicyContent.section10.title')}
              </h3>
              <p>{t('auth.privacyPolicyContent.section10.content')}</p>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                {t('auth.privacyPolicyContent.contact.title')}
              </h3>
              <p className="whitespace-pre-line">{t('auth.privacyPolicyContent.contact.content')}</p>
            </div>
          </div>
        </Dialog>
      </div>
    </div>
  );
}

// ===========================================
// AYARLAR SAYFASI
// ===========================================

import React from 'react';
import { Settings, Database, Bell, Shield, HelpCircle } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

export default function SettingsPage() {
  const { state } = useApp();

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Ayarlar</h2>
        <p className="text-gray-500 mt-1">Uygulama ayarlarını yönetin</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Veritabanı Durumu */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Database size={20} className="text-primary-600" />
            Veritabanı Durumu
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-sm text-gray-700">Bağlantı Durumu</span>
              <span className="text-sm font-medium text-green-600">Mock Data Aktif</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-700">Toplam Banka</span>
              <span className="text-sm font-medium">{state.banks.length}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-700">Toplam POS</span>
              <span className="text-sm font-medium">{state.posDevices.length}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-700">Toplam İşlem</span>
              <span className="text-sm font-medium">{state.transactions.length}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-700">Komisyon Oranları</span>
              <span className="text-sm font-medium">{state.commissionRates.length}</span>
            </div>
          </div>
          <p className="mt-4 text-xs text-gray-400">
            Supabase entegrasyonu için services klasöründeki dosyaları güncelleyin.
          </p>
        </div>

        {/* Bildirim Ayarları */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Bell size={20} className="text-primary-600" />
            Bildirim Ayarları
          </h3>
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Günlük Rapor</p>
                <p className="text-xs text-gray-400">Her gün özet rapor gönder</p>
              </div>
              <input type="checkbox" className="w-5 h-5 text-primary-600 rounded" defaultChecked />
            </label>
            <label className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Yüksek Komisyon Uyarısı</p>
                <p className="text-xs text-gray-400">Belirlenen oranın üzerinde uyar</p>
              </div>
              <input type="checkbox" className="w-5 h-5 text-primary-600 rounded" defaultChecked />
            </label>
            <label className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Nakit Akışı Tahmini</p>
                <p className="text-xs text-gray-400">Haftalık nakit akışı bildirimi</p>
              </div>
              <input type="checkbox" className="w-5 h-5 text-primary-600 rounded" />
            </label>
          </div>
        </div>

        {/* Güvenlik */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Shield size={20} className="text-primary-600" />
            Güvenlik
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Oturum Zaman Aşımı (dakika)
              </label>
              <input
                type="number"
                defaultValue={30}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Veri Saklama Süresi (gün)
              </label>
              <input
                type="number"
                defaultValue={365}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Yardım */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <HelpCircle size={20} className="text-primary-600" />
            Yardım & Destek
          </h3>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Bu uygulama POS işlemlerinin takibi ve komisyon maliyetlerinin
              analizi için tasarlanmıştır.
            </p>
            <div className="pt-2">
              <p className="text-xs font-semibold text-gray-500 mb-2">Özellikler:</p>
              <ul className="text-xs text-gray-500 space-y-1 list-disc list-inside">
                <li>Dinamik komisyon matrisi</li>
                <li>Valör tarihi hesaplama</li>
                <li>Çoklu banka/POS karşılaştırma</li>
                <li>Nakit akışı tahmini</li>
                <li>Detaylı raporlama</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">Versiyon: 1.0.0</p>
            <p className="text-xs text-gray-400">React + TypeScript + Tailwind CSS</p>
          </div>
        </div>
      </div>

      {/* Kaydet Butonu */}
      <div className="flex justify-end">
        <button className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
          Ayarları Kaydet
        </button>
      </div>
    </div>
  );
}

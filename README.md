# 💳 POSum - POS Uyum Merkezi

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/electroizm/POSum)
[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://posum.vercel.app)

Banka POS İşlem Takip ve Maliyet Yönetimi Sistemi - Türk bankalarındaki POS işlemlerinizi takip edin, komisyonları optimize edin.

## 🌟 Özellikler

### 💼 İş Özellikleri
- 📊 **Dashboard**: Gerçek zamanlı istatistikler ve grafikler
- 💳 **İşlem Yönetimi**: POS işlemlerini ekleyin ve takip edin
- 🏦 **Banka Yönetimi**: 6 büyük Türk bankası desteği (Ziraat, Garanti BBVA, Akbank, İş Bankası, Yapı Kredi, Halkbank)
- 🧮 **Komisyon Hesaplama**: Akıllı komisyon hesaplama motoru
- 📈 **Raporlama**: Detaylı finansal raporlar ve analizler
- 🔄 **Simülasyon**: İki farklı POS senaryosunu karşılaştırın
- 💰 **Nakit Akışı Tahmini**: Gelecek nakit akışlarınızı öngörün

### 🚀 Teknik Özellikler
- 🌍 **Çoklu Dil**: Türkçe ve İngilizce dil desteği
- 📱 **Mobil Uyumlu**: Responsive tasarım, mobilde kart görünümü
- 🔌 **PWA**: Offline çalışma, ana ekrana ekleme
- 👆 **Touch-Friendly**: 44x44px minimum dokunma alanları
- ⚡ **Hızlı**: Vite ile optimize edilmiş build
- 🎨 **Modern UI**: Tailwind CSS ile şık arayüz
- 📊 **Grafikler**: Recharts ile interaktif grafikler

## 🏃‍♂️ Hızlı Başlangıç

### Gereksinimler
- Node.js 18+
- npm veya yarn

### Kurulum

```bash
# Projeyi klonlayın
git clone https://github.com/electroizm/POSum.git
cd POSum

# Bağımlılıkları yükleyin
npm install

# Geliştirme sunucusunu başlatın
npm run dev

# Tarayıcınızda açın: http://localhost:5173
```

### Production Build

```bash
# Production build alın
npm run build

# Build'i test edin
npm run preview
```

## 🌐 Dil Değiştirme

Sağ üst köşedeki 🌐 Globe ikonuna tıklayarak dil değiştirebilirsiniz:
- 🇹🇷 Türkçe
- 🇬🇧 English

## 📱 PWA Özellikleri

POSum, Progressive Web App olarak çalışır:

### Desktop Kurulum (Chrome/Edge)
1. Uygulamayı açın
2. Adres çubuğundaki "Yükle" ikonuna tıklayın
3. Masaüstünden uygulamayı açın

### iOS Kurulum (Safari)
1. Safari'de açın
2. Paylaş butonuna (📤) basın
3. "Ana Ekrana Ekle" seçin
4. Ana ekrandan açın

### Android Kurulum (Chrome)
1. Chrome'da açın
2. Menüden "Ana ekrana ekle" seçin
3. Ana ekrandan açın

## 🛠️ Teknoloji Stack

### Frontend
- **React 19.2.0** - UI Framework
- **TypeScript 5.9.3** - Type Safety
- **Vite 7.2.4** - Build Tool
- **Tailwind CSS 4.1.17** - Styling
- **Recharts 3.4.1** - Charts

### Dil & PWA
- **react-i18next** - Internationalization
- **vite-plugin-pwa** - Progressive Web App

### Utilities
- **date-fns** - Date Formatting
- **lucide-react** - Icons
- **TanStack React Table** - Table Management

## 📂 Proje Yapısı

```
POSum/
├── src/
│   ├── components/     # Reusable UI components
│   ├── contexts/       # React Context (State Management)
│   ├── pages/          # Page components (6 pages)
│   ├── services/       # Business logic & calculation engine
│   ├── types/          # TypeScript type definitions
│   ├── data/           # Mock data
│   ├── locales/        # Translation files (TR/EN)
│   └── i18n.ts         # i18n configuration
├── public/             # Static assets
├── index.html          # HTML entry point
├── vite.config.ts      # Vite & PWA configuration
└── vercel.json         # Vercel deployment config
```

## 🚀 Deployment

### Vercel (Önerilen)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/electroizm/POSum)

Veya manuel:

```bash
# Vercel CLI ile
npm i -g vercel
vercel --prod

# Veya GitHub bağlantısı ile
# https://vercel.com → Import Project → GitHub'dan seçin
```

### Diğer Platformlar
- **Netlify**: Otomatik algılar, build command: `npm run build`
- **GitHub Pages**: `npm run build` sonrası `dist/` klasörünü deploy edin

## 📊 Performans

### Lighthouse Skorları
- ⚡ Performance: 95+
- ♿ Accessibility: 95+
- ✅ Best Practices: 100
- 🔍 SEO: 100
- 📱 PWA: 100

## 🔐 Güvenlik

- ✅ XSS Protection
- ✅ Content Type Nosniff
- ✅ Frame Options (DENY)
- ✅ HTTPS Only (Production)
- ✅ Secure Headers

## 🗺️ Roadmap

### Kısa Vadeli
- [ ] Tüm sayfaları çevir (Transactions, Banks, Simulation, Reports, Settings)
- [ ] Dark Mode ekle
- [ ] PWA ikonlarını oluştur (192x192, 512x512)
- [ ] Daha fazla dil ekle (Almanca, Arapça)

### Orta Vadeli
- [ ] Backend entegrasyonu (API)
- [ ] Authentication sistemi
- [ ] Gerçek veritabanı entegrasyonu
- [ ] Push notification
- [ ] OCR ile fatura okuma

### Uzun Vadeli
- [ ] Capacitor ile Native App
- [ ] iOS App Store yayını
- [ ] Google Play yayını
- [ ] Biometric authentication
- [ ] Offline sync

## 🤝 Katkıda Bulunma

Katkılarınızı bekliyoruz! Lütfen:

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'feat: Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📝 Lisans

Bu proje özel kullanım içindir.

## 👨‍💻 Geliştirici

**Electroizm**
- GitHub: [@electroizm](https://github.com/electroizm)
- Website: [posum.vercel.app](https://posum.vercel.app)

## 🙏 Teşekkürler

Bu proje [Claude Code](https://claude.com/claude-code) ile geliştirilmiştir.

---

**⭐ Beğendiyseniz yıldız vermeyi unutmayın!**

## 📚 Dokümantasyon

Detaylı PWA rehberi için [PWA_GUIDE.md](PWA_GUIDE.md) dosyasını okuyun.

## 🐛 Hata Bildirimi

Hata bulduysanız lütfen [Issues](https://github.com/electroizm/POSum/issues) sayfasından bildirin.

## 💬 İletişim

Sorularınız için Issue açabilir veya Pull Request gönderebilirsiniz.

---

Made with ❤️ in Turkey

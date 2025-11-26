# Supabase Kurulum Rehberi

Bu rehber POSum projesini Supabase ile entegre etmek için gerekli adımları açıklar.

## 📋 Gereksinimler

- [Supabase hesabı](https://supabase.com) (ücretsiz)
- Node.js 18+ yüklü olmalı

## 🚀 Adım Adım Kurulum

### 1. Supabase Projesi Oluştur

1. [Supabase Dashboard](https://app.supabase.com)'a git
2. "New Project" butonuna tıkla
3. Proje ayarlarını yapılandır:
   - **Name**: POSum
   - **Database Password**: Güçlü bir şifre seç (kaydet!)
   - **Region**: En yakın bölgeyi seç (örn: Frankfurt)
4. "Create new project" butonuna tıkla

### 2. Environment Variables Ayarla

1. Supabase projeniz hazır olduğunda, **Settings** > **API** bölümüne git
2. Aşağıdaki değerleri kopyala:
   - `Project URL`
   - `anon public` key

3. Proje kök dizininde `.env` dosyası oluştur:

https://apgsgnudjczctrzsotbi.supabase.co


```bash
cp .env.example .env
```

4. `.env` dosyasını aç ve değerleri gir:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Database Schema Oluştur

1. Supabase Dashboard'da **SQL Editor** bölümüne git
2. "New query" butonuna tıkla
3. `supabase/schema.sql` dosyasının içeriğini kopyala ve yapıştır
4. "Run" butonuna tıkla (veya Cmd/Ctrl + Enter)
5. İşlem başarılı olduğunda "Success. No rows returned" mesajını göreceksiniz

### 4. Email Authentication Ayarla

1. **Authentication** > **Providers** > **Email** bölümüne git
2. Aşağıdaki ayarları yap:
   - **Enable Email provider**: ✅ Açık
   - **Confirm email**: ✅ Açık (production için)
   - **Secure email change**: ✅ Açık

3. **Email Templates** bölümünden email şablonlarını özelleştirebilirsiniz

### 5. URL Configuration (Opsiyonel)

1. **Authentication** > **URL Configuration** bölümüne git
2. **Site URL** olarak production domain'inizi girin:
   ```
   https://posum.vercel.app
   ```
3. **Redirect URLs** ekleyin:
   ```
   http://localhost:5173/**
   https://posum.vercel.app/**
   ```

## ✅ Kurulumu Test Et

### 1. Development Server Başlat

```bash
npm run dev
```

### 2. Yeni Hesap Oluştur

1. Tarayıcıda `http://localhost:5173` adresine git
2. "Sign Up" butonuna tıkla
3. Bilgilerinizi girin ve hesap oluşturun

### 3. Email Onayı (Production)

- Development modda email onayı devre dışıdır
- Production'da kullanıcılar email onayı yapmalıdır

### 4. Veritabanını Kontrol Et

1. Supabase Dashboard'da **Table Editor** > **users** tablosuna git
2. Yeni oluşturduğunuz kullanıcıyı görmelisiniz

## 🔒 Row Level Security (RLS)

Schema'da RLS otomatik olarak aktif edilmiştir:

- ✅ Kullanıcılar sadece kendi verilerini görebilir
- ✅ Admin rolü tüm verileri görebilir
- ✅ Kullanıcılar kendi profil bilgilerini güncelleyebilir

## 📊 Database Tabloları

Oluşturulan tablolar:

| Tablo | Açıklama |
|-------|----------|
| `users` | Kullanıcı profilleri |
| `banks` | Banka bilgileri |
| `branches` | Şube bilgileri |
| `pos_devices` | POS cihaz bilgileri |
| `commission_rates` | Komisyon oranları matrisi |
| `transactions` | POS işlemleri |

## 🔐 Admin Kullanıcı Oluşturma

İlk admin kullanıcısını oluşturmak için:

1. Normal bir hesap oluşturun
2. **Table Editor** > **users** tablosuna gidin
3. Kullanıcınızı bulun ve `role` sütununu `admin` olarak değiştirin

## 🌐 Production Deployment

### Vercel/Netlify

1. Environment variables'ı ekleyin:
   ```
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   ```

2. Deploy edin:
   ```bash
   npm run build
   ```

### Domain Ayarları

1. Production domain'inizi Supabase'de **Authentication** > **URL Configuration** bölümüne ekleyin
2. **Redirect URLs**'e domain'inizi ekleyin

## 🔄 Veri Migrasyonu (Opsiyonel)

Mevcut mock data'yı Supabase'e aktarmak için:

1. Mock data'yı Supabase formatına dönüştürün
2. **Table Editor**'de manuel olarak ekleyin veya
3. SQL INSERT komutları ile toplu ekleyin

## 📱 Real-time Features

Supabase otomatik olarak real-time subscriptions sağlar:

```typescript
// Örnek: Transactions tablosunu dinle
supabase
  .channel('transactions')
  .on('postgres_changes',
    { event: '*', schema: 'public', table: 'transactions' },
    (payload) => console.log('Change received!', payload)
  )
  .subscribe()
```

## 🐛 Sorun Giderme

### "Invalid API key" hatası
- `.env` dosyasındaki key'leri kontrol edin
- Development server'ı yeniden başlatın (`npm run dev`)

### "Policy violation" hatası
- RLS policies'leri kontrol edin
- Kullanıcının doğru yetkilere sahip olduğundan emin olun

### Loading ekranında takılı kalma / "User already registered" hatası
Eğer login/register sırasında sorun yaşıyorsanız:

1. **Browser Console**'u açın (F12)
2. Console'da şunu çalıştırın:
   ```javascript
   localStorage.clear(); sessionStorage.clear(); location.reload();
   ```
3. Sayfayı yenileyin ve tekrar deneyin

Bu sorun genellikle:
- Profili olmayan auth kullanıcılarından kaynaklanır
- Önceki başarısız kayıt denemelerinden kalan session'lardan kaynaklanır

### Orphaned Users (Profili olmayan kullanıcılar)
Eğer `auth.users` tablosunda kullanıcı var ama `public.users` tablosunda profil yoksa:

1. Supabase SQL Editor'da `supabase/cleanup-orphaned-users.sql` dosyasını çalıştırın
2. Önce preview query'sini çalıştırarak hangi kullanıcıların etkileneceğini görün
3. Sonra silmek veya profil oluşturmak için ilgili SQL'i uncomment edin

### Email gönderilmiyor
- **Authentication** > **Email Templates** kontrol edin
- SMTP ayarlarını yapılandırın (production için)

## 📚 Ek Kaynaklar

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

## 🆘 Destek

Sorularınız için:
- [GitHub Issues](https://github.com/yourusername/posum/issues)
- [Supabase Discord](https://discord.supabase.com)


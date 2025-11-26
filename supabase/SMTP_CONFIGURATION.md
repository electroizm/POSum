# 📧 SMTP Configuration - Supabase E-posta Hızlandırma

Supabase varsayılan olarak kendi e-posta servisini kullanır ve bu yavaş olabilir (2-5 saniye). Production ortamında özel SMTP servisi kullanarak e-posta gönderimini hızlandırabilirsiniz.

## 🎯 Neden SMTP Gerekli?

- ✅ Daha hızlı e-posta gönderimi (saniyeler yerine milisaniyeler)
- ✅ Daha güvenilir delivery rate
- ✅ Özel e-posta domain'i (@posum.com gibi)
- ✅ E-posta analytics ve tracking
- ✅ Daha yüksek gönderim limitleri

## 📋 Önerilen SMTP Servisleri

### 1. **Resend** (Önerilen - En Kolay)
- ✅ Modern, developer-friendly API
- ✅ Ücretsiz tier: 3,000/ay
- ✅ Çok hızlı setup
- 💰 Fiyat: $0 - $20/ay
- 🔗 [resend.com](https://resend.com)

### 2. **SendGrid** (Popüler)
- ✅ Büyük ölçeklenebilirlik
- ✅ Ücretsiz tier: 100/gün
- ✅ Detaylı analytics
- 💰 Fiyat: $0 - $19.95/ay
- 🔗 [sendgrid.com](https://sendgrid.com)

### 3. **Mailgun** (Güçlü)
- ✅ Enterprise-grade
- ✅ Ücretsiz tier: 5,000/ay (3 ay)
- ✅ Mailjet'e göre daha iyi API
- 💰 Fiyat: $0 - $35/ay
- 🔗 [mailgun.com](https://www.mailgun.com)

### 4. **AWS SES** (En Ucuz - İleri Seviye)
- ✅ Çok ucuz ($0.10 per 1,000 emails)
- ⚠️ Daha karmaşık setup
- ⚠️ AWS hesabı gerektirir
- 💰 Fiyat: ~$0.10/1000 email
- 🔗 [aws.amazon.com/ses](https://aws.amazon.com/ses/)

## 🚀 Resend ile Kurulum (Önerilen)

### Adım 1: Resend Hesabı Oluştur

1. [resend.com](https://resend.com) adresine git
2. "Get Started" ile hesap oluştur
3. Email adresinizi verify et

### Adım 2: API Key Oluştur

1. Resend Dashboard → **API Keys** sekmesi
2. "Create API Key" butonuna tıkla
3. Name: "POSum Production"
4. Permission: "Sending access"
5. API key'i kopyala (sadece bir kez gösterilir!)

### Adım 3: Domain Verify (Opsiyonel)

**Kendi domain'inizi kullanmak istiyorsanız:**

1. Resend Dashboard → **Domains** sekmesi
2. "Add Domain" butonuna tıkla
3. Domain gir (örn: `posum.com`)
4. DNS kayıtlarını domain sağlayıcınıza ekle:
   - SPF record
   - DKIM records
   - DMARC record (opsiyonel)
5. "Verify" butonuna tıkla

**Domain yoksa:** `onboarding@resend.dev` üzerinden gönderim yapabilirsiniz (test için yeterli)

### Adım 4: Supabase'e SMTP Ekle

1. **Supabase Dashboard** → Projenizi seç
2. **Settings** → **Auth** sekmesi
3. **SMTP Settings** bölümünü bul
4. "Enable Custom SMTP" aktif et

**SMTP Bilgileri:**
```
SMTP Host:        smtp.resend.com
SMTP Port:        465
SMTP User:        resend
SMTP Password:    [Resend API Key'inizi buraya yapıştırın]
Sender email:     noreply@posum.com (veya verify ettiğiniz domain)
Sender name:      POSum
```

5. "Save" butonuna tıkla

### Adım 5: E-posta Şablonlarını Güncelle (Opsiyonel)

1. **Supabase Dashboard** → **Authentication** → **Email Templates**
2. Her şablon için custom HTML/CSS ekleyebilirsiniz:
   - Confirm signup
   - Invite user
   - Magic link
   - **Change email address**
   - **Reset password** ⭐ (Şifre sıfırlama için)

**Reset Password Şablonu Örneği:**
```html
<h2>Şifre Sıfırlama</h2>
<p>Merhaba,</p>
<p>Şifrenizi sıfırlamak için aşağıdaki linke tıklayın:</p>
<a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 8px;">
  Şifremi Sıfırla
</a>
<p>Bu link 1 saat geçerlidir.</p>
<p>Eğer bu isteği siz yapmadıysanız, bu e-postayı göz ardı edebilirsiniz.</p>
<br>
<p>Saygılarımızla,<br>POSum Ekibi</p>
```

### Adım 6: Test Et

1. Uygulamanızda "Şifremi Unuttum" tıklayın
2. E-posta adresinizi girin
3. **Artık e-posta 1-2 saniye içinde gelecek** ⚡

## 🔧 SendGrid ile Kurulum

### Adım 1: SendGrid Hesabı

1. [sendgrid.com](https://sendgrid.com) → Sign Up
2. Email verify et

### Adım 2: API Key Oluştur

1. Settings → **API Keys**
2. "Create API Key"
3. Name: "POSum SMTP"
4. Full Access seç
5. API key'i kopyala

### Adım 3: Sender Identity

1. Settings → **Sender Authentication**
2. "Single Sender Verification" seç
3. E-posta adresinizi ekle ve verify et

### Adım 4: Supabase SMTP Config

```
SMTP Host:        smtp.sendgrid.net
SMTP Port:        465
SMTP User:        apikey
SMTP Password:    [SendGrid API Key]
Sender email:     [Verify ettiğiniz e-posta]
Sender name:      POSum
```

## 🔧 Mailgun ile Kurulum

### Adım 1: Mailgun Hesabı

1. [mailgun.com](https://www.mailgun.com) → Sign Up
2. Free tier seç (5,000/ay)

### Adım 2: Domain Setup

1. Sending → **Domains**
2. "Add New Domain" veya sandbox domain kullan

### Adım 3: SMTP Credentials

1. Sending → **Domain Settings** → **SMTP credentials**
2. "Reset password" ile SMTP şifresi oluştur

### Adım 4: Supabase SMTP Config

```
SMTP Host:        smtp.mailgun.org
SMTP Port:        465
SMTP User:        [Mailgun SMTP username]
SMTP Password:    [Mailgun SMTP password]
Sender email:     [Mailgun domain'i]
Sender name:      POSum
```

## 🧪 Test Adımları

1. **Supabase'de SMTP'yi kaydet**
2. **Uygulamanızda test edin:**
   ```
   1. Şifremi Unuttum → E-posta gir
   2. E-posta kutusunu kontrol et (spam dahil)
   3. Şifre sıfırlama linkine tıkla
   4. Yeni şifre belirle
   ```

3. **Console'da kontrol:**
   ```javascript
   // Browser console'da
   // E-posta gelme süresi: < 2 saniye olmalı
   ```

## 🚨 Sorun Giderme

### E-posta gelmiyor

1. **Spam klasörünü kontrol edin**
2. **Supabase logs:** Dashboard → Logs → Edge Functions
3. **SMTP credentials doğru mu kontrol edin**
4. **Sender email verify edildi mi?**

### "Authentication failed" hatası

- SMTP password'ünü tekrar kontrol edin
- API key'in doğru izinlere sahip olduğundan emin olun
- SMTP User doğru mu? (SendGrid için "apikey", Resend için "resend")

### E-posta yavaş geliyor

- SMTP doğru yapılandırıldıysa 1-3 saniye içinde gelmeli
- Hala yavaşsa, SMTP servisi değiştirin (Resend en hızlısı)

## 📊 Performans Karşılaştırması

| Servis | Hız | Ücretsiz Limit | Kullanım Kolaylığı |
|--------|-----|----------------|-------------------|
| Supabase Default | 🐌 2-5 saniye | Sınırsız | ⭐⭐⭐⭐⭐ |
| **Resend** | ⚡ 200-500ms | 3,000/ay | ⭐⭐⭐⭐⭐ |
| SendGrid | ⚡ 500ms-1s | 100/gün | ⭐⭐⭐⭐ |
| Mailgun | ⚡ 500ms-1s | 5,000/ay | ⭐⭐⭐ |
| AWS SES | ⚡ 300-800ms | 62,000/ay (free tier) | ⭐⭐ |

## 💡 Öneriler

✅ **Development:** Supabase default (kurulum gerektirmez)
✅ **Production (Küçük-Orta):** Resend veya Mailgun
✅ **Production (Büyük Ölçek):** AWS SES veya SendGrid

## 🔐 Güvenlik

- ⚠️ API key'leri asla GitHub'a commit etmeyin
- ✅ Environment variables kullanın
- ✅ SMTP credentials'ı güvenli saklayın
- ✅ SPF/DKIM/DMARC records ekleyin (domain reputation için)

## 📚 Ek Kaynaklar

- [Supabase SMTP Docs](https://supabase.com/docs/guides/auth/auth-smtp)
- [Resend Documentation](https://resend.com/docs)
- [SendGrid SMTP Guide](https://docs.sendgrid.com/for-developers/sending-email/integrating-with-the-smtp-api)
- [Mailgun SMTP Setup](https://documentation.mailgun.com/en/latest/user_manual/sending_messages.html#smtp)

---

**Not:** SMTP yapılandırması yapıldıktan sonra e-posta gönderimi 10-20x daha hızlı olacaktır! 🚀

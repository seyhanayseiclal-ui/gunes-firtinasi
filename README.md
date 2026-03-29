# ☀️ SolarWatch — Güneş Fırtınası Uyarı Sistemi

**SolarWatch**, NASA verilerini kullanarak gerçek zamanlı güneş fırtınası uyarısı veren, bilimsel doğruluk ve estetik tasarımı birleştiren modern bir web uygulamasıdır. 

---

## 🚀 Proje Vizyonu
Kozmik olayları sadece verilerle değil, etkileyici bir görsel deneyimle sunmayı amaçlıyoruz. Derin uzay teması, güneş enerjisi vurguları ve anlık uyarı mekanizmaları ile kullanıcıyı bilgilendirirken büyülemeyi hedefliyoruz.

### 🎨 Tasarım Sistemi
| Amaç | Renk | Kod |
|---|---|---|
| **Arkaplan** | Uzay Siyahı | `#020818` |
| **Birincil Vurgu** | Güneş Turuncusu | `#FF6B35` |
| **İkincil Vurgu** | Plasma Sarısı | `#FFB347` |
| **Tehlike** | Kırmızı Uyarı | `#FF2D55` |
| **Güvenli** | Teal/Yeşil | `#00D4A8` |
| **Metin** | Soğuk Beyaz | `#E8EAF0` |

- **Tipografi:** Başlıklarda `Orbitron` (Teknik/Bilim-kurgu), gövde metinlerinde `Inter` (Modern/Okunabilir).
- **Efektler:** Glassmorphism kartlar, animasyonlu yıldız arka planı, güneş corona parlamaları ve dinamik pulse efektleri.

---

## 🛠️ Teknik Altyapı
- **Framework:** Next.js 15+ (App Router)
- **Styling:** Tailwind CSS / Vanilla CSS (Custom Properties)
- **Veri Kaynağı:** NASA DONKI API (İlk aşamada Mock verilerle)
- **Fonts:** [Google Fonts](https://fonts.google.com/) (Orbitron & Inter)

---

## 🗺️ Sayfa Yapısı & Bölümler
- **Navbar:** Şeffaf, glassmorphism efektli navigasyon.
- **Hero Section:** "GÜNEŞ FIRTINASI ERKEN UYARI SİSTEMİ" başlığı ve anlık tehlike seviyesi (Kp-index).
- **Status Dashboard:** Jeomanyetik fırtına, Solar Flare ve Güneş Rüzgarı değerlerini içeren 3'lü panel.
- **Alert Timeline:** Kronolojik son güneş olayları listesi.
- **Impact Map:** Dünya üzerindeki olası aurora ve sinyal kesintisi bölgelerinin görsel temsili.
- **Info Cards:** CME nedir, nasıl korunulur gibi eğitici içerikler.

---

## 🚦 Kurulum ve Çalıştırma

Öncelikle bağımlılıkları yükleyin:

```bash
npm install
```

Geliştirme sunucusunu başlatın:

```bash
npm run dev
```

Uygulamaya [http://localhost:3000](http://localhost:3000) adresinden erişebilirsiniz.

---

## ⚠️ Önemli Notlar
> [!IMPORTANT]
> **API Bağlantısı:** Mevcut sürümde NASA DONKI API entegrasyonu hazırlık aşamasında olup, veriler `mock` (sahte) olarak sunulmaktadır.
> 
> **Terminoloji:** Bilimsel hassasiyet için "Solar Flare", "CME", "Kp Index" gibi terimler teknik bağlamda korunmuştur.

---

## 📜 Lisans & Katkı
Bu proje bir Hackathon kapsamında geliştirilmektedir. NASA Open Data portalı kaynaklı veriler kullanılmıştır.

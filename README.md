# M365 DLP Rehberi

Microsoft 365 Data Loss Prevention adım adım yapılandırma rehberi.  
UnifyTech MSP ekibi için — her müşteri tenantında DLP kurulumunu takip et.

## Özellikler

- **6 aşama, 39+ görev** — Ön hazırlık → SIT → Duyarlılık etiketleri → DLP politikaları → Test → İzleme
- **Çoklu müşteri** — Her tenant için ayrı oturum, sonsuz müşteri kaydı
- **Otomatik kayıt** — Tüm ilerleme tarayıcıda localStorage'da saklanır
- **Lisans filtresi** — E3 / E5 / Business Premium seçimine göre görevler otomatik filtrelenir
- **Rapor export** — Tamamlanan/kalan görevleri metin rapor olarak kopyala
- **Dark mode** — Sistem temasını otomatik takip eder

## Kurulum

```bash
npm install
npm run dev
```

## Vercel'e Deploy

```bash
git init
git add .
git commit -m "feat: M365 DLP rehberi v1"
git remote add origin https://github.com/KULLANICI/m365-dlp-guide.git
git push -u origin main
```

Ardından [vercel.com](https://vercel.com) → Import Project → GitHub repo seç → Deploy.

## Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- localStorage (veri kalıcılığı)

## Geliştirme Notları

- Görev verileri `src/data/phases.ts` dosyasında — kolayca düzenlenebilir
- Yeni aşama eklemek için `PHASES` dizisine nesne ekle
- `tags: ['e5']` ile E5-only görev işaretle

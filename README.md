# M365 DLP Rehberi v2

Microsoft 365 Data Loss Prevention adım adım yapılandırma rehberi.  
UnifyTech MSP ekibi — multi-tenant, Supabase Auth, dark theme.

## Kurulum

### 1. Supabase projesi oluştur

[supabase.com](https://supabase.com) → New project

**SQL Editor'da çalıştır:**
```sql
-- supabase-schema.sql dosyasının içeriğini kopyala yapıştır
```

**Google OAuth (opsiyonel):**
Supabase Dashboard → Authentication → Providers → Google → Enable
Client ID ve Secret'ı Google Cloud Console'dan al.

**Redirect URL'i ekle:**
Supabase → Authentication → URL Configuration →
`https://PROJE.supabase.co/auth/v1/callback` zaten var.
Site URL: `https://dlp-guide.vercel.app` ekle.

### 2. .env.local oluştur

```bash
cp .env.local.example .env.local
# SUPABASE_URL ve ANON_KEY değerlerini doldur
# Supabase → Settings → API
```

### 3. Geliştirme

```bash
npm install
npm run dev
```

## Deploy (Vercel)

```bash
git add .
git commit -m "feat: v2 — Supabase auth + dark theme + PDF export"
git push
```

Vercel Dashboard → Project Settings → Environment Variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Stack

- Next.js 14 (App Router)
- TypeScript  
- Tailwind CSS (dark theme)
- Supabase Auth (email/password + Google)
- Supabase DB (tenants, task_checks, task_notes)
- jsPDF + jspdf-autotable (PDF export)

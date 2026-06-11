# Deploy ke Vercel

## Struktur project ini
```
stock-watchlist/          ← root (ini yang di-push ke GitHub)
├── api/                  ← Vercel Serverless Functions
│   ├── _yahoo.js         ← shared helper (prefix _ = tidak jadi route)
│   ├── summary/[ticker].js
│   ├── dividends/[ticker].js
│   └── search/[query].js
├── src/                  ← React source
├── index.html
├── package.json
├── vite.config.js
└── vercel.json           ← routing config
```

---

## Cara Deploy

### Opsi A — Via GitHub (Recommended)

1. **Push ke GitHub**
   ```bash
   git init
   git add .
   git commit -m "initial commit"
   git remote add origin https://github.com/USERNAME/stock-watchlist.git
   git push -u origin main
   ```

2. **Import di Vercel**
   - Buka [vercel.com/new](https://vercel.com/new)
   - Klik **"Import Git Repository"**
   - Pilih repo `stock-watchlist`
   - Settings sudah otomatis terdeteksi dari `vercel.json`:
     - Framework: **Vite**
     - Build Command: `npm run build`
     - Output Directory: `dist`
   - Klik **Deploy**

3. Selesai! Vercel akan beri URL seperti `https://stock-watchlist-xxx.vercel.app`

---

### Opsi B — Via Vercel CLI

```bash
# Install CLI
npm i -g vercel

# Di folder project ini
vercel

# Ikuti prompt:
# - Set up and deploy? Y
# - Which scope? (pilih akun kamu)
# - Link to existing project? N
# - Project name: stock-watchlist
# - In which directory is your code? ./
# - Want to override settings? N
```

---

### Opsi C — Local dev dengan Vercel CLI

Untuk dev lokal yang mirip production (API functions berjalan juga):
```bash
npm i -g vercel
vercel dev
# Buka http://localhost:3000
```

> **Catatan:** Tanpa `vercel dev`, jalankan `vite` saja tidak akan bisa hit `/api/*`
> karena tidak ada proxy. Gunakan project lama (`stock-tracker/`) untuk dev dengan Express.

---

## Environment Variables

Tidak diperlukan — Yahoo Finance public API tidak butuh API key.

## Catatan Penting

- **Crumb cache tidak persistent** antar cold start serverless function.
  Ini normal — crumb akan di-fetch ulang otomatis saat diperlukan (~1-2 detik tambahan sekali).
- **Free tier Vercel** sudah cukup untuk personal watchlist (100GB bandwidth/bulan).

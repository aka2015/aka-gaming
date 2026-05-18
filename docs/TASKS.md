# Task & Roadmap — AKA Gaming Portal Rebuild

> Daftar pekerjaan untuk rebuild portal AKA Gaming dengan Next.js + AI Game Builder.

## Phase 1: Setup Project & Fondasi

- [x] Init project Next.js 16+ dengan TypeScript
- [x] Setup Tailwind CSS 4
- [x] Setup ESLint
- [x] Konfigurasi environment variables (.env.local)
- [x] Setup Firebase project (Auth + Firestore)
- [x] Integrasi NextAuth.js v5 + Google Provider
- [x] Buat layout dasar (Navbar, Footer) — design colorful seperti portal lama
- [x] Integrasi LLM lokal (port 20128, model deepseek-3.2)
- [x] Deploy ke branch dev

## Phase 2: Portal Game (Core)

- [ ] Halaman homepage — daftar game dari Firestore (grid cards)
- [ ] Komponen GameCard (thumbnail, judul, author, plays)
- [ ] Halaman game/[id] — iframe player + info game
- [ ] Sistem komentar (Firestore subcollection)
- [ ] Pencarian & filter berdasarkan kategori
- [ ] Like/play counter

## Phase 3: AI Game Builder

- [x] Setup LLM API (lokal port 20128, deepseek-3.2)
- [x] API route: POST /api/generate (proxy ke LLM lokal)
- [ ] Halaman /create — form input prompt + preview iframe
- [ ] Prompt template/contoh untuk user
- [ ] Simpan game HTML ke VPS filesystem
- [ ] Regenerate / edit prompt iteratif
- [ ] Enforce limit 3 game per user

## Phase 4: User Dashboard

- [ ] Halaman /my-games — list game milik user
- [ ] Status game: draft / published
- [ ] Publish game (ubah status, muncul di portal)
- [ ] Hapus game (free slot untuk buat baru)
- [ ] Edit metadata game (judul, deskripsi, kategori)

## Phase 5: Admin Panel

- [ ] Halaman /admin (protected, role-based)
- [ ] List semua game (filter by status)
- [ ] Moderasi: approve / reject / takedown game
- [ ] Kelola komentar (hapus komentar inappropriate)
- [ ] User management (ban user jika perlu)

## Phase 6: Deploy & Optimasi

- [ ] Setup Nginx reverse proxy di VPS
- [ ] Konfigurasi PM2 ecosystem file
- [ ] Setup domain + SSL (Let's Encrypt)
- [ ] Nginx config untuk serve game files langsung
- [ ] Gzip compression
- [ ] Setup swap file (1-2 GB)
- [ ] Testing load & performance

## Phase 7: Polish & Nice-to-Have

- [ ] Responsive design (mobile-friendly)
- [ ] Loading states & skeleton UI
- [ ] Error handling & toast notifications
- [ ] SEO meta tags
- [ ] Rating system untuk game
- [ ] Fork game (user lain bisa fork & modifikasi)
- [ ] Analytics sederhana (game paling populer)

---

## Prioritas Eksekusi

```
Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6 → Phase 7
  Setup     Portal     AI       User      Admin     Deploy    Polish
```

Phase 1-3 adalah **MVP** (Minimum Viable Product).
Phase 4-5 diperlukan sebelum launch.
Phase 6 untuk production.
Phase 7 bisa dikerjakan bertahap setelah launch.

## Estimasi Waktu

| Phase | Estimasi |
|-------|----------|
| Phase 1 | 1-2 hari |
| Phase 2 | 2-3 hari |
| Phase 3 | 3-4 hari |
| Phase 4 | 1-2 hari |
| Phase 5 | 1-2 hari |
| Phase 6 | 1 hari |
| Phase 7 | Ongoing |
| **Total MVP (1-3)** | **~1-2 minggu** |

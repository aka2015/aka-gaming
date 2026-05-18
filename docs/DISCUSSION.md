# Ringkasan Diskusi — AKA Gaming Portal Rebuild

> Catatan percakapan perencanaan untuk konteks sesi berikutnya.
> Tanggal: 19 Mei 2026

---

## Konteks Awal

Project AKA Gaming sudah ada sebagai portal game static (HTML + vanilla JS + Firebase). Fitur existing: daftar game, login Google, komentar, pencarian, admin panel.

## Rencana Baru: AI Game Builder

**Konsep**: User yang login bisa membuat game sendiri lewat prompt AI.

### Keputusan yang Disepakati

| Topik | Keputusan |
|-------|-----------|
| AI Provider | OpenRouter (free model) |
| Limit per user | Max 3 project aktif (bisa hapus lalu buat baru) |
| Output game | Single HTML file (HTML + CSS + JS inline) |
| Keamanan game | Sandbox iframe, CSP ketat |
| API key handling | Server-side proxy via Next.js API route |
| Publish flow | Buat → Preview → Publish → Bisa dimainkan semua |

## Keputusan: Rebuild dengan Framework

### Alasan Rebuild
- Portal static HTML sulit di-maintain untuk fitur kompleks
- Butuh server-side logic (proxy AI, auth, dll)

### Framework: Next.js (dipilih)
Alasan memilih Next.js dibanding Laravel:
- Satu bahasa (JS/TS) untuk frontend + backend
- API Routes built-in untuk proxy OpenRouter
- Firebase SDK langsung kompatibel
- NextAuth.js untuk Google login
- Ecosystem React yang kaya

## Keputusan: Storage & Hosting

### Masalah Firebase Storage
- Free tier: 5 GB storage, tapi **1 GB download/hari** bisa jadi bottleneck

### Solusi: Pakai VPS Sendiri
- VPS spec: **2 GB RAM / 2 CPU / 40 GB Disk / Ubuntu**
- Game HTML files disimpan di filesystem VPS
- Nginx serve langsung (bypass Next.js, hemat RAM)
- Firebase tetap dipakai untuk Auth + Firestore (free tier)

### Arsitektur Final
- **VPS**: Next.js (PM2) + Nginx + game files
- **Cloud (free)**: Firebase Auth, Firestore, OpenRouter

## Fitur yang Direncanakan (Nice-to-Have)

- Regenerate game (kalau hasil AI kurang bagus)
- Template prompt (contoh untuk user)
- Rating/like dari user lain
- Fork game (opsional, nanti)

## Keputusan: LLM untuk AI Game Builder

### Awalnya: OpenRouter (cloud, free model)
### Final: LLM Lokal (9Router/LM Studio-like)

- Endpoint: `http://localhost:20128/v1`
- Model yang dipakai: `kr/deepseek-3.2`
- Format: OpenAI-compatible API
- Keuntungan: gratis, tidak ada rate limit, privacy data terjaga
- Model lain tersedia: Claude, GPT, Gemini, Qwen (bisa switch kapan saja)

## Langkah Selanjutnya

Mulai eksekusi dari Phase 1 (Setup Project). Lihat `docs/TASKS.md` untuk detail.

---

## Referensi Dokumen

- **Arsitektur lengkap**: `docs/ARCHITECTURE.md`
- **Task & Roadmap**: `docs/TASKS.md`

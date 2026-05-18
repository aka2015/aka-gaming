# Arsitektur AKA Gaming Portal

> Dokumen perancangan teknis untuk rebuild portal AKA Gaming dengan fitur AI Game Builder.

## Gambaran Umum

Portal game untuk anak-anak yang memungkinkan user membuat game sendiri via prompt AI, lalu publish supaya bisa dimainkan semua orang.

## Fitur Utama

1. **Portal Game** — Daftar game yang bisa dimainkan di browser
2. **Google Login** — Autentikasi via Google Account
3. **AI Game Builder** — User buat game dari prompt teks (max 3 project/user)
4. **Publish & Play** — Game yang dipublish bisa dimainkan semua orang
5. **Komentar** — Sistem komentar pada setiap game
6. **Admin Panel** — Kelola game dan komentar

## Tech Stack

| Layer | Teknologi | Lokasi |
|-------|-----------|--------|
| Frontend + API | Next.js 14+ (App Router) | VPS |
| Web Server | Nginx (reverse proxy + static files) | VPS |
| Process Manager | PM2 | VPS |
| Auth | Firebase Auth (Google Provider) | Cloud (free) |
| Database | Firestore | Cloud (free) |
| Game Storage | Filesystem + Nginx | VPS |
| AI | OpenRouter (free model) | Cloud (free) |
| Styling | Tailwind CSS | - |
| Language | TypeScript | - |

## Infrastruktur

### VPS Spec (saat ini)
- **RAM**: 2 GB
- **CPU**: 2 core
- **Disk**: 40 GB
- **OS**: Ubuntu

### Arsitektur Deployment

```
┌─────────────────────────────────────────┐
│              VPS Ubuntu                  │
│  2 CPU / 2 GB RAM / 40 GB Disk          │
│                                         │
│  ┌─────────┐     ┌──────────────────┐   │
│  │  Nginx  │────▶│  Next.js (PM2)   │   │
│  │  :80/443│     │  :3000           │   │
│  └────┬────┘     └──────────────────┘   │
│       │                                 │
│       ▼                                 │
│  /var/www/games/{user_id}/{game_id}.html│
│  (static files, serve langsung Nginx)   │
└─────────────────────────────────────────┘
         │
         ▼ (external, free tier)
┌─────────────────────┐
│  Firebase Auth      │ ← Google Login
│  Firestore          │ ← Metadata, komentar
│  OpenRouter         │ ← AI generate game
└─────────────────────┘
```

### Kenapa Arsitektur Ini

1. **Nginx serve game files langsung** — tidak lewat Next.js, hemat RAM
2. **Firebase Auth + Firestore di cloud** — gratis, tidak makan resource VPS
3. **Next.js hanya handle**: UI portal, API proxy ke OpenRouter, CRUD metadata
4. **Tidak perlu DB di VPS** — Firestore cukup, hemat RAM

## Struktur Project (Next.js)

```
aka-gaming/
├── app/
│   ├── page.tsx                    ← Homepage (daftar game)
│   ├── game/[id]/page.tsx          ← Main game + komentar
│   ├── create/page.tsx             ← AI Game Builder
│   ├── my-games/page.tsx           ← Dashboard user (max 3 game)
│   ├── admin/page.tsx              ← Panel admin
│   └── api/
│       ├── generate/route.ts       ← Proxy ke OpenRouter
│       ├── games/route.ts          ← CRUD game
│       └── auth/[...nextauth]/route.ts
├── components/
│   ├── GameCard.tsx
│   ├── GameIframe.tsx
│   ├── CommentSection.tsx
│   └── Navbar.tsx
├── lib/
│   ├── firebase.ts                 ← Firebase client config
│   ├── firebase-admin.ts           ← Firebase admin (server-side)
│   └── openrouter.ts               ← OpenRouter helper
├── public/
├── docs/                           ← Dokumentasi project
└── tailwind.config.ts
```

## Data Model (Firestore)

### Collection: `users`
```json
{
  "uid": "google-uid",
  "displayName": "Nama User",
  "email": "user@gmail.com",
  "photoURL": "https://...",
  "role": "user | admin",
  "gamesCount": 0,
  "createdAt": "timestamp"
}
```

### Collection: `games`
```json
{
  "id": "auto-generated",
  "title": "Nama Game",
  "description": "Deskripsi game",
  "prompt": "Prompt yang digunakan untuk generate",
  "authorId": "user-uid",
  "authorName": "Nama User",
  "status": "draft | published",
  "filePath": "/games/{userId}/{gameId}.html",
  "category": "arcade | puzzle | quiz | ...",
  "likes": 0,
  "plays": 0,
  "createdAt": "timestamp",
  "publishedAt": "timestamp | null"
}
```

### Collection: `comments`
```json
{
  "id": "auto-generated",
  "gameId": "game-id",
  "authorId": "user-uid",
  "authorName": "Nama User",
  "authorPhoto": "https://...",
  "text": "Isi komentar",
  "createdAt": "timestamp"
}
```

## Keamanan

### Game Sandbox (iframe)
```html
<iframe
  src="https://games.akagaming.com/{userId}/{gameId}.html"
  sandbox="allow-scripts allow-same-origin"
  referrerpolicy="no-referrer"
></iframe>
```

- `sandbox` attribute mencegah game akses parent window
- Game files di-serve dari subdomain/path terpisah
- CSP header ketat pada game files

### API Key Security
- OpenRouter API key disimpan di environment variable server
- User tidak pernah akses API key langsung
- Request ke OpenRouter lewat Next.js API route (proxy)

### Rate Limiting
- Max 3 game per user (enforced di Firestore rules + API)
- Rate limit pada API generate (mencegah spam)

## Optimasi untuk 2 GB RAM

- `next build` + `next start` (production mode)
- PM2 dengan 1 instance (bukan cluster)
- Nginx gzip compression
- Swap file 1-2 GB sebagai safety net
- Game files di-serve langsung Nginx (bypass Next.js)

## Kapan Upgrade VPS

| Kondisi | Upgrade ke |
|---------|-----------|
| RAM sering penuh / swap tinggi | 4 GB RAM |
| Traffic tinggi, response lambat | 4 CPU |
| Game files > 30 GB | Tambah disk |

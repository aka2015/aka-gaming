# Session Notes — 13 May 2026

## Game: Tower Defense (`games/tower-defense/`)
### Fitur yang Ditambahkan
1. **Boss serang tower** — Semua boss (boss, eliteBoss) bisa menyerang tower pemain seperti destroyerBoss
   - `boss`: attackPower 30, attackRange 50
   - `eliteBoss`: attackPower 40, attackRange 55
2. **Reward diturunkan** — Semua reward enemy dikurangi ~50% (basic 5→3, fast 8→4, dst)
3. **Destroyer boss** — Icon diubah ⚔️→🔥, speed 0.3→0.6
4. **Layout mobile responsive**
   - Grid size dinamis berdasarkan viewport (`resize()`)
   - Touch events (`touchstart`, `touchmove`)
   - CSS breakpoints: 768px, 480px, 360px + landscape tablet
   - Body fixed + overscroll-behavior none
   - AudioContext resume via user gesture
5. **Item buff area** (3 item)
   - 💚 **Heal** (30 gold): Heal 50 HP tower dalam radius
   - 🛡️ **Defense Up** (50 gold): Tower tahan damage 50% lebih kecil, 12 detik
   - ⚡ **Attack Up** (40 gold): Damage tower +50%, 12 detik
   - Drop item di grid → effect area 120px
   - Visual: preview lingkaran + crosshair, particle burst, buff ring indicator

### File Berubah
- `games/tower-defense/script.js` — 267 line added
- `games/tower-defense/index.html` — 57 line added
- `games/tower-defense/style.css` — 183 line added

### Status Git
- Commit: `ac54a8a` — Tambah fitur tower defense: boss serang tower, item buff area, layout mobile
- Belum push (SSH key belum terdaftar di GitHub)

### SSH Key
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIFzS+vn6gr8omw6rDdQ6p78xG50Gzer6BHtDDQZmrc56 zukelabs25@gmail.com
```
- Username GitHub: `sanzuke`
- Remote: `git@github.com:aka2015/aka-gaming.git`
- Perlu daftarkan pub key di GitHub Settings > SSH & GPG keys

## Game Plan (`game-plan.md`)
### Ide Game Membaca untuk Anak 5 Tahun
1. 🫧 **Bubble Pop ABC** — Pop balon huruf urut sesuai kata
2. 🧩 **Suku Kata** — Gabung dua suku kata
3. 🔤 **Huruf Hilang** — Isi huruf kosong di kata
4. 🐛 **Ulat Kata** — Tap huruf sebelum ulat sampai ujung

## Game Baru: Bubble Pop ABC (`games/bubble-pop-abc/`)
- Game edukasi membaca untuk anak 5 tahun
- 20 kata bahasa Indonesia (baju, api, ibu, bola, dll) dengan emoji petunjuk
- Bubble huruf floating random, bisa di-drag/geser, tap urut sesuai kata
- Skor +10 per huruf, bonus per kata, bintang untuk motivasi
- 10 soal per ronde, result screen dengan statistik
- Layout mobile-friendly dengan touch events

### Perubahan Selama Development
1. **Font** → Fredoka (bundar, jelas untuk anak)
2. **Bubble bisa digeser** — drag dengan mouse/touch, kalau bertumpuk bisa dipindah
3. **Resize handler** — bubble tetap dalam area saat layar diubah ukurannya
4. **Overlay sukses** — pindah dari bubble-area ke fixed fullscreen, pake card putih
5. **Tombol Lanjut** — warna hijau gradien (`#00b894`), efek tekan scale(0.93)
6. **Bug CSS** — duplikasi aturan `.word-complete .btn-next` sudah dibersihkan

### Status
- CSS sudah rapi, overlay di tengah, tombol hijau
- Siap dilanjutkan next session

## TODO Next
- Push tower defense & bubble-pop-abc setelah SSH key terdaftar
- Implementasi game lanjutan: 🧩 Suku Kata, 🔤 Huruf Hilang, 🐛 Ulat Kata

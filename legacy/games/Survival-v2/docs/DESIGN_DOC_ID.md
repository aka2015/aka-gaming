# Game Survival - Dokumen Design (Gaya Survival.io)

## 1. Ringkasan Game

**Jenis Game:** Survival Roguelike 2D  
**Inspirasi:** Survival.io / Vampire Survivors  
**Loop Inti:** Selamat dari gelombang musuh → Dapat XP → Naik Level → Pilih Upgrade → Makin Kuat → Selamat Lebih Lama  

---

## 2. Desain Karakter

### 2.1 Karakter Pemain

**Nama:** Dapat dikustomisasi (default: "Survivor")

**Stat Dasar:**
- **HP (Health Points/Darah):** 100
- **Kecepatan Gerak:** 200 pikel/detik
- **Kecepatan Serang:** 1.0 serang/detik (dasar)
- **Damage (Kerusakan):** 10 (damage senjata dasar)
- **Defense (Pertahanan):** 0 (armor dasar)
- **Jangkauan Pick-up:** 50 piksel (untuk mengumpulkan orb XP)

**Kemampuan Karakter:**
1. **Gerak Pasif:** WASD/Tombol Panah untuk bergerak
2. **Serang Otomatis:** Karakter otomatis menyerang musuh terdekat dalam jangkauan
3. **Tidak Ada Serang Manual:** Pemain fokus pada posisi dan menghindar

**Desain Visual Karakter:**
- Bentuk geometris sederhana (lingkaran/bujur sangkar bundar)
- Garis tepi neon bercahaya sesuai warna tema
- Bar darah di atas karakter
- Indikator level di bawah karakter
- Visualisasi senjata (menunjukkan jenis senjata yang dilengkapi)

### 2.2 Progresi Karakter

**Sistem Level:**
- XP yang dibutuhkan per level: `Level * 100`
- Level Maks: 50
- Saat naik level: Game berhenti, pemain memilih dari 3-4 upgrade acak

**Sistem XP:**
- Musuh menjatuhkan orb XP saat dikalahkan
- Nilai orb XP:
  - Musuh biasa: 10 XP
  - Musuh elit: 25 XP
  - Musuh bos: 100 XP
- Orb XP otomatis dikumpulkan saat pemain dalam jangkauan pick-up

---

## 3. Sistem Senjata

### 3.1 Jenis Senjata

**Senjata Awal:** Pedang Dasar

| Senjata | Tipe | Damage | Kecepatan Serang | Jangkauan | Khusus |
|---------|------|--------|------------------|-----------|--------|
| Pedang Dasar | Jarak Dekat | 10 | 1.0/dtk | 60px | Serangan busur depan |
| Orb Sihir | Jarak Jauh | 8 | 0.8/dtk | 300px | Proyektil pencari |
| Panah | Jarak Jauh | 15 | 0.6/dtk | 400px | Proyektil tembus |
| Tongkat Api | Area (AoE) | 12 | 0.5/dtk | 250px | Damage area seiring waktu |
| Tongkat Petir | Rantai | 9 | 0.9/dtk | 200px | Menyebar ke 3 musuh |
| Tongkat Es | Jarak Jauh + Perlambatan | 7 | 0.7/dtk | 280px | Memperlambat musuh 30% |

### 3.2 Upgrade Senjata

Setiap senjata dapat di-upgrade:
- **Level 1 → 2:** +20% damage, butuh 1 pilihan upgrade
- **Level 2 → 3:** +20% damage, +1 proyektil, butuh 1 pilihan upgrade
- **Level 3 → 4:** +20% damage, +efek khusus, butuh 1 pilihan upgrade
- **Level 4 → 5 (Maks):** +40% damage, upgrade visual, butuh 1 pilihan upgrade

**Sistem Multi-Senjata:**
- Pemain dapat melengkapi hingga 3 senjata sekaligus
- Setiap senjata menyerang secara independen
- Senjata menembak secara berurutan (tidak bersamaan)

---

## 4. Sistem Musuh

### 4.1 Jenis Musuh

**Musuh Dasar:**
| Tipe | HP | Kecepatan | Damage | Warna | Perilaku |
|------|-----|-------|--------|-------|----------|
| Slime | 20 | 80px/dtk | 10 | Hijau | Bergerak langsung ke pemain |
| Tengkorak | 30 | 100px/dtk | 15 | Putih/Abu-abu | Bergerak langsung ke pemain |
| Kelelawar | 15 | 150px/dtk | 8 | Ungu | Gerakan tidak teratur |

**Musuh Elit:**
| Tipe | HP | Kecepatan | Damage | Warna | Perilaku |
|------|-----|-------|--------|-------|----------|
| Slime Baja | 60 | 70px/dtk | 20 | Hijau Tua | HP tinggi, lambat |
| Pejuang Tengkorak | 50 | 90px/dtk | 25 | Berona Merah | Stat seimbang |
| Hantu | 35 | 130px/dtk | 18 | Biru Transparan | Menembus rintangan |

**Musuh Bos (Setiap 5 gelombang):**
| Gelombang | Nama Bos | HP | Kecepatan | Damage | Kemampuan Khusus |
|-----------|----------|-----|-------|--------|-----------------|
| 5 | Slime Raksasa | 300 | 60px/dtk | 30 | Spawn 3 slime saat mati |
| 10 | Raja Tengkorak | 500 | 80px/dtk | 40 | Memanggil 5 tengkorak berkala |
| 15 | Naga Gelap | 800 | 100px/dtk | 50 | Napas api ke arah pemain |
| 20 | Dewa Kematian | 1200 | 90px/dtk | 60 | Teleport dekat pemain |
| 25+ | Bos Skala | 1000 + (gelombang * 100) | 100px/dtk | 50 + (gelombang * 5) | Kemampuan khusus acak |

### 4.2 Sistem Gelombang

**Mekanik Gelombang:**
- Setiap gelombang berlangsung **90 detik**
- **Istirahat 10 detik** antar gelombang (musuh berhenti spawn, musuh tetap ada)
- Gelombang 1-5: Hanya musuh dasar
- Gelombang 6-10: Dasar + sesekali musuh elit
- Gelombang 11+: Campuran dasar dan elit, kesulitan meningkat
- **Gelombang bos:** 5, 10, 15, 20, 25, dst.

**Laju Spawn Musuh:**
```
Gelombang 1-3: 1 musuh setiap 2 detik
Gelombang 4-6: 1 musuh setiap 1.5 detik
Gelombang 7-10: 1 musuh setiap 1 detik
Gelombang 11-15: 1 musuh setiap 0.8 detik
Gelombang 16+: 1 musuh setiap 0.5 detik
```

**Skala Musuh:**
- HP musuh meningkat **10% per gelombang**
- Damage musuh meningkat **5% per gelombang**
- Kecepatan musuh meningkat **2% per gelombang**

---

## 5. Sistem Upgrade

### 5.1 Kategori Upgrade

**Upgrade Senjata:**
- Damage +20%
- Kecepatan Serang +15%
- Jumlah Proyektil +1
- Jangkauan +25%
- Peluang Kritis +10%
- Kecepatan Proyektil +20%

**Upgrade Pertahanan:**
- HP Maks +20
- Defense +5
- Regenerasi HP +2/dtk
- Pengurangan Damage +10%
- Frame Invincibility saat Kena +0.5dtk (cooldown)

**Upgrade Gerakan:**
- Kecepatan Gerak +10%
- Jangkauan Pick-up +30%
- Peluang Menghindar +5%

**Upgrade Khusus:**
- Magnet (auto-kumpulkan XP dalam radius lebih besar)
- Damage Area of Effect +25%
- Lifesteal +10% (heal saat kill)
- Perolehan XP +20%
- Nyawa Tambahan (revive sekali per run)

### 5.2 Pemilihan Upgrade

**Saat Naik Level:**
1. Game berhenti
2. Tampilkan layar pemilihan upgrade dengan 3-4 pilihan
3. Pemain memilih SATU upgrade
4. Game dilanjutkan

**Logika Pool Upgrade:**
- Tidak pernah menawarkan upgrade yang sama dua kali dalam satu pemilihan
- Acak berbobot (prioritaskan upgrade yang belum dimiliki pemain)
- Upgrade khusus senjata hanya muncul jika pemain punya senjata itu
- Dijamin menawarkan minimal satu senjata baru setelah gelombang 3

---

## 6. Mekanik Game

### 6.1 Loop Inti

```
MULAI GAME
    ↓
Gelombang Dimulai → Musuh Spawn → Serang Otomatis Musuh
    ↓                                    ↓
Musuh Jatuhkan Orb XP ← Musuh Mati      ↓
    ↓                                    ↓
Pemain Kumpulkan XP → Naik Level → Pilih Upgrade
    ↓
Gelombang Berikut (kesulitan meningkat)
    ↓
GELOMBANG BOS (setiap 5 gelombang)
    ↓
Lanjutkan sampai HP mencapai 0
    ↓
GAME OVER → Tampilkan Skor → Simpan ke Skor Tertinggi
```

### 6.2 Sistem Skor

**Perhitungan Skor:**
- Kill musuh: `HP Musuh / 2` poin
- Selamat 1 detik: `1` poin
- Kill bos: `HP Bos` poin (bonus)
- Skor akhir: `Poin kill + Poin selamat + Bonus bos`

**Fitur Skor Tertinggi:**
- 10 skor teratas disimpan
- Termasuk: Skor, Waktu selamat, Gelombang dicapai, Kesulitan
- Urutkan berdasarkan skor (menurun)

### 6.3 Damage & Kesehatan

**Perhitungan Damage:**
```
Damage Aktual = Damage Dasar Musuh × Pengali Kesulitan - Defense Pemain
Damage Minimum = 1 (selalu kena minimal 1 damage)
```

**Sistem Kesehatan:**
- Mulai dengan 100 HP (dapat dimodifikasi oleh upgrade)
- Kena damage saat musuh menyentuh pemain
- **I-frames (Frame Invincibility):** 0.5dtk setelah kena damage (visual: pemain berkedip)
- Regenerasi HP dari upgrade berlaku setiap detik

**Kematian:**
- Saat HP mencapai 0 → Game Over
- Tampilkan stat akhir (skor, waktu, gelombang, kill)
- Opsi untuk main lagi atau kembali ke menu

---

## 7. Desain UI/UX

### 7.1 HUD Dalam Game

**Kiri Atas:**
- Bar darah (visual + angka HP)
- Indikator level (mis. "Level 12")
- Bar XP (menunjukkan progres ke level berikutnya)

**Kanan Atas:**
- Penghitung skor
- Nomor gelombang
- Timer (format MM:SS)

**Tengah Bawah:**
- Tampilan senjata yang dilengkapi (ikon kecil dengan level)
- Buff/debuff aktif (ikon dengan timer)

### 7.2 Layar Naik Level

**Tampilan:**
- Header "NAIK LEVEL!" (animasi, bercahaya)
- Nomor level saat ini
- 3-4 kartu upgrade untuk dipilih:
  - Nama upgrade
  - Ikon upgrade
  - Deskripsi singkat
  - Level saat ini → Level baru (jika ada)

### 7.3 Layar Game Over

**Tampilan:**
- Header "GAME OVER"
- Skor akhir
- Waktu selamat
- Gelombang dicapai
- Musuh dikalahkan
- Level dicapai
- Notifikasi skor tertinggi (jika ada)
- Tombol: Main Lagi, Menu Utama

---

## 8. Efek Visual

### 8.1 Efek Pemain
- **Jejak gerak:** Jejak bercahaya halus saat bergerak
- **Flash damage:** Flash putih singkat saat kena damage
- **Glow naik level:** Aura emas saat naik level
- **Efek senjata:** Indikator visual untuk senjata yang dilengkapi

### 8.2 Efek Musuh
- **Animasi mati:** Fade out + ledakan partikel
- **Flash damage:** Warna merah saat kena hit
- **Aura bos:** Efek glow/pulse khusus untuk bos
- **Efek status:** Indikator visual (lambat = biru, bakar = oranye, dll.)

### 8.3 Efek Proyektil
- **Tebasan pedang:** Animasi busur di depan pemain
- **Orb sihir:** Orb bercahaya dengan jejak
- **Panah:** Proyektil cepat dengan jejak
- **Api:** Lingkaran AoE dengan damage over time
- **Petir:** Efek petir rantai antar musuh
- **Es:** Proyektil bergerak lambat dengan efek embun beku

### 8.4 Orb XP
- Orb bercahaya melayang ke arah pemain
- Warna berdasarkan nilai:
  - Hijau (10 XP)
  - Biru (25 XP)
  - Ungu (100 XP)
- Animasi kumpulkan (terbang ke pemain + hilang)

---

## 9. Desain Audio

### 9.1 Musik
- **Menu:** Melodi tenang dan santai (sudah diimplementasikan)
- **Game:** Lagu energik dan bersemangat (sudah diimplementasikan)
- **Pertarungan bos:** Musik intens dan dramatis
- **Naik level:** Jingle perayaan singkat

### 9.2 Efek Suara
- **Musuh kena:** Suara "thwack" memuaskan
- **Musuh mati:** Suara mati cepat
- **XP kumpulkan:** Suara "ding" lembut
- **Naik level:** Progresi akor triumfan
- **Pemain kena damage:** Suara peringatan
- **Bos spawn:** Boom dramatis
- **Gelombang selesai:** Fanfare

---

## 10. Implementasi Teknis

### 10.1 Arsitektur Game

**Objek Game Utama:**
```javascript
player = {
    x, y, width, height,
    hp, maxHp, speed,
    level, xp, xpToNextLevel,
    weapons: [],
    upgrades: {},
    defense, pickupRange,
    invincibleTimer, blinkTimer
}

enemies = [] // Array objek musuh
projectiles = [] // Array objek proyektil
xpOrbs = [] // Array objek orb XP
upgradeChoices = [] // Array upgrade tersedia saat naik level
```

**Loop Game:**
```javascript
function gameLoop() {
    if (gamePaused) return;
    
    updatePlayer();
    updateEnemies();
    updateProjectiles();
    updateXpOrbs();
    checkCollisions();
    updateUI();
    render();
    
    requestAnimationFrame(gameLoop);
}
```

**Spawn Musuh:**
```javascript
function spawnEnemy() {
    // Posisi acak di tepi layar
    // Berdasarkan gelombang saat ini, tentukan jenis musuh
    // Terapkan skala gelombang ke stat
    // Tambahkan ke array musuh
}
```

**Sistem Serang Otomatis:**
```javascript
function autoAttack() {
    // Cari musuh terdekat dalam jangkauan senjata
    // Tembak proyektil berdasarkan stat senjata
    // Hormati cooldown kecepatan serang
    // Siklus melalui senjata yang dilengkapi
}
```

### 10.2 Optimasi Performa
- Gunakan object pooling untuk musuh, proyektil, dan orb XP
- Batasi proyektil aktif untuk mencegah lag
- Gunakan partisi spasial untuk deteksi tabrakan (berbasis grid)
- Batasi jumlah musuh di layar secara bersamaan di 100

---

## 11. Fase Implementasi

### Fase 1: Mekanik Inti
- [ ] Sistem XP (musuh jatuhkan XP, pemain kumpulkan)
- [ ] Sistem naik level (hentikan game, tampilkan UI)
- [ ] Sistem upgrade dasar (3-5 upgrade)
- [ ] Sistem serang otomatis (musuh terdekat)
- [ ] Sistem proyektil dasar

### Fase 2: Sistem Senjata
- [ ] Beberapa jenis senjata (3 senjata)
- [ ] Level upgrade senjata
- [ ] Dukungan multi-senjata (hingga 3)
- [ ] Proyektil khusus senjata

### Fase 3: Sistem Musuh
- [ ] Beberapa jenis musuh (dasar + elit)
- [ ] Sistem gelombang dengan jeda
- [ ] Skala musuh per gelombang
- [ ] Musuh bos (setiap 5 gelombang)
- [ ] Kemampuan khusus bos

### Fase 4: Peningkatan UI/UX
- [ ] HUD yang ditingkatkan (level, bar XP, senjata)
- [ ] Layar pemilihan naik level
- [ ] Layar game over yang ditingkatkan
- [ ] Efek visual (partikel, jejak)

### Fase 5: Polish & Balance
- [ ] Efek suara untuk semua aksi
- [ ] Polish visual (glow, animasi)
- [ ] Balance game (damage, HP, upgrade)
- [ ] Optimasi performa
- [ ] Perbaikan bug dan testing

---

## 12. Peningkatan Masa Depan (Post-MVP)

- **Multi Karakter:** Karakter yang dapat di-openlock dengan senjata awal unik
- **Tantangan Harian:** Mode game harian khusus dengan modifier
- **Achievement:** Tonggak sejarah yang dapat di-openlock
- **Sistem Crafting:** Gabungkan item untuk peralatan kuat
- **Pohon Skill:** Upgrade permanen antar run (meta-progression)
- **Multiplayer:** Mode survival co-op
- **Papan Peringkat:** Peringkat skor online
- **Lebih Banyak Senjata:** 10+ senjata unik
- **Lebih Banyak Musuh:** 15+ jenis musuh dengan perilaku bervariasi
- **Fitur Peta:** Rintangan, air mancur penyembuhan, dll.

---

## 13. Filosofi Desain

**Tetap Sederhana:**
- Mudah dipelajari (cukup bergerak)
- Sulit dikuasai (posisi adalah kunci)
- Loop feedback memuaskan

**Otonomi Pemain:**
- Pilihan upgrade bermakna
- Beberapa strategi viable
- Tidak ada build "salah", hanya pendekatan berbeda

**Kesulitan Adil:**
- Menantang tapi tidak membuat frustrasi
- Skill pemain lebih penting daripada RNG
- Penyebab dan akibat jelas (kematian terasa adil)

**Progresi Menguntungkan:**
- Pertumbuhan konstan terasa
- Lonjakan kekuatan rutin (naik level)
- Peningkatan terlihat seiring waktu

---

## 14. Panduan Balance

**Early Game (Gelombang 1-5):**
- Pemain harus merasa kuat
- Fokus pada pembelajaran mekanik
- Bangun fondasi dengan upgrade

**Mid Game (Gelombang 6-15):**
- Kesulitan meningkat
- Pemain butuh pilihan upgrade bagus
- Pertarungan bos uji posisi

**Late Game (Gelombang 16+):**
- Aksi bullet-hell intens
- Hanya karakter build bagus yang selamat
- Skor tinggi butuh skill + strategi

**Durasi Run yang Diharapkan:**
- Pemain baru: 3-5 menit
- Pemain rata-rata: 8-12 menit  
- Pemain terampil: 15-25 menit
- Pemain ahli: 30+ menit

---

## 15. Metrik Kesuksesan

**Engagement:**
- Waktu sesi rata-rata > 10 menit
- Pemain retry berkali-kali
- Perasaan progresi jelas

**Faktor Menyenangkan:**
- Feedback combat memuaskan
- Momen naik level mengasyikkan
- Mentalitas "satu run lagi"

**Aksesibilitas:**
- Mudah dipahami
- Feedback visual jelas
- Kesulitan dapat disesuaikan

---

*Versi Dokumen: 1.0*  
*Terakhir Diperbarui: 2026-04-04*  
*Status: Siap untuk Implementasi*

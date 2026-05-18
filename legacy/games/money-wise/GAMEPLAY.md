# Gameplay Design: Money Wise

## Overview
- **Genre**: Educational Simulation
- **Target**: Anak SD kelas 1-3 (usia 7-9 tahun)
- **Goal**: Jadi kasir handal, kumpulkan coins 最大

## Inti Gameplay

### Mekanik Utama
1. Customer datang dengan barang
2. Total harga muncul di layar
3. Customer kasih uang → player hitung kembalian
4. Benar = dapat coins, Streak bonus
5. Salah = coba lagi (tanpa penalti)

### Sample Scenario
```
📦 Belanjaan:
- Roti 🍞    Rp 3.000
- Susu 🥛    Rp 5.000
- Total: Rp 8.000

💵 Customer kasih: Rp 10.000
❓ Kembalian: ?
```

## Sistem Poin

### Coins (Koin)
- **Betul**: +10 coins
- **Cepat (<5 detik)**: +5 bonus
- **Streak benar**:
  - 3x streak: 1.5x multiplier
  - 5x streak: 2x multiplier
  - 10x streak: 3x multiplier

### Mistakes
- Tidak ada penalti, langsung retry
- Streak reset waktu salah

## Item Shop

### Item yang Bisa Dibeli

| Item | Harga | Efek |
|------|-------|------|
| 🔢 Kalkulator | 50 coins | 1x per hari,自动 hitung kembalian |
| ⏰ Time Shield | 80 coins | +10 detik saat customer datang |
| 💰 Lucky Coin | 100 coins | Kembalian boleh salah 10% (1x) |
| 🎯 Quick Eyes | 120 coins | Lihat harga barang sebentar sebelum lupa |
| 📊 Price Guide | 150 coins | Bisa lihat daftar harga kapanpun |
| 💎 Auto Save | 200 coins | Kalau salah,simpan streak |

### Cara Pakai
- Semua item single-use, aktivasi saat gameplay
- Tinggal click sebelum mulai level

## Level Progression

### Level Info
```
Level 1-3  : Easy     - Belanjaan 1-2 barang, kelipatan 1000
Level 4-6  : Medium  - Belanjaan 2-3 barang, kelipatan 500
Level 7-10 : Hard    - Belanjaan 3-4 barang, kelipatan 100
Level 11+  : Expert - Campur uang recehan + uang kertas
```

### Rank System
```
Junior Cashier    → Lvl 1
Cashier         → Lvl 5
Senior Cashier  → Lvl 10
Head Cashier    → Lvl 15
Manager         → Lvl 20
```

## Unit Mata Uang

### Rupiah (IDR)
- Rp 1.000, Rp 2.000, Rp 5.000, Rp 10.000, Rp 20.000, Rp 50.000, Rp 100.000

### Cash yang Diberikan Customer
```
Level Easy   : Kelipatan 1000
Level Medium: Kelipatan 500
Level Hard  : Boleh lebih (bukan kelipatan)
```

## UI Concept

### Layar Utama Game
```
┌─────────────────────────────┐
│ 💰 Coins: 120  🔥 Streak: 3 │
├─────────────────────────────┤
│                             │
│  📦 KERANJANG BELANJA      │
│  ┌─────────────────────┐    │
│  │ 🍞 Roti     Rp 3.000│    │
│  │ 🥛 Susu     Rp 5.000│    │
│  │ Total      Rp 8.000 │    │
│  └─────────────────────┘    │
│                             │
│  💵 Customer kasih:        │
│  ┌─────────────────────┐    │
│  │  Rp 10.000          │    │
│  └─────────────────────┘    │
│                             │
│  ➕ [-] Ketik kembalian    │
│                             │
│  [✓] KIRIM              │
├─────────────────────────────┤
│ [🛒 Shop] [❓ Help] [🏠]  │
└─────────────────────────────┘
```

### Shop Screen
```
┌─────────────────────────────┐
│ 🛒 TOKO ITEM                │
│                             │
│  💰 120 coins              │
│                             │
│  [🔢 Kalkulator    50 ]     │
│  [⏰ Time Shield   80 ]     │
│  [💰 Lucky Coin  100 ]      │
│  [🎯 Quick Eyes  120 ]      │
│  [📊 Price Guide 150 ]      │
│  [💎 Auto Save   200 ]      │
│                             │
│         [KEMBALI]          │
└─────────────────────────────┘
```

## Audio/Sound

- ✅ Benar: "kasir success" chime
- ❌ Salah: "coba lagi" soft buzzer
- 💰 Dapet coins: koin jatuh
- 🔥 Streak: powerup sound
- 🛒 Buy item: purchase confirmation

## Visual Style

- Warna dominan: Green (uang), Orange (energi)
- Karakter customer随机 (emoji/human-like)
- Feedback visual: particles coins, shake waktu salah
- Animasi: uang kembalian flying ke player

## Game Flow

```
Main Menu → Select Difficulty → Choose Item (opt)
       → Gameplay Loop (10 level)
       → Summary Screen → Coins Added
       → Main Menu
```

## Catatan Design

1. **Tidak ada Game Over** - Always fun, no stress
2. **Progressive Difficulty** - Tidak terasa susah
3. **Instant Feedback** - Langsung tau benar/salah
4. **Reward Often** - Dapet coins sering agar memotivasi
5. **Item meaningful** - Setiap item berguna, bukan optional
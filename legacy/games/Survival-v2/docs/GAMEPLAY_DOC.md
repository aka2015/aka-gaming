# Dokumentasi Gameplay - Game Survival (Gaya Survival.io)

## 1. Alur Permainan Utama

### 1.1 Dari Menu Hingga Game Over

```
┌─────────────┐
│  MAIN MENU  │
└──────┬──────┘
       │ klik "PLAY"
       ↓
┌──────────────────────┐
│ CHARACTER SELECT     │
│ (Pilih 1 karakter)   │
└──────┬───────────────┘
       │ klik "PILIH"
       ↓
┌──────────────────────┐
│ START SCREEN         │
│ (Tombol START GAME)  │
└──────┬───────────────┘
       │ klik "START"
       ↓
┌──────────────────────┐
│ COUNTDOWN (3-2-1)    │
└──────┬───────────────┘
       │
       ↓
╔══════════════════════╗
║   GAMEPLAY UTAMA     ║
║                      ║
║  ┌────────────────┐  ║
║  │ Wave 1 Dimulai │  ║
║  │ (90 detik)     │  ║
║  └────────┬───────┘  ║
║           │          ║
║           ↓          ║
║  ┌────────────────┐  ║
║  │ Musuh Spawn    │  ║
║  │ secara berkala │  ║
║  └────────┬───────┘  ║
║           │          ║
║           ↓          ║
║  ┌────────────────┐  ║
║  │ Auto-Attack    │  ║
║  │ musuh terdekat │  ║
║  └────────┬───────┘  ║
║           │          ║
║           ↓          ║
║  ┌────────────────┐  ║
║  │ Musuh Mati →   │  ║
║  │ Jatuhkan XP &  │  ║
║  │ Koin           │  ║
║  └────────┬───────┘  ║
║           │          ║
║           ↓          ║
║  ┌────────────────┐  ║
║  │ Kumpulkan XP → │  ║
║  │ Level Up!      │  ║
║  └────────┬───────┘  ║
║           │          ║
║           ↓          ║
║  ┌────────────────┐  ║
║  │ Pilih 1 Upgrade│  ║
║  │ dari 3-4 opsi  │  ║
║  └────────┬───────┘  ║
║           │          ║
║           ↓          ║
║  ┌────────────────┐  ║
║  │ Wave Selesai   │  ║
║  │ Buka Toko atau │  ║
║  │ Istirahat 10dtk│  ║
║  └────────┬───────┘  ║
║           │          ║
║           ↓          ║
║  ┌────────────────┐  ║
║  │ Wave Berikutnya│  ║
║  │ (lebih sulit)  │  ║
║  └────────────────┘  ║
║                      ║
║  Setiap 5 Wave:      ║
║  ┌────────────────┐  ║
║  │  BOSS FIGHT!   │  ║
║  └────────────────┘  ║
╚════════════╤═════════╝
             │ HP = 0
             ↓
    ┌────────────────┐
    │  GAME OVER     │
    │ - Skor akhir   │
    │ - Wave dicapai │
    │ - Waktu        │
    │ - Level        │
    └────────┬───────┘
             │
             ↓
    ┌────────────────┐
    │ HIGH SCORE?    │
    │ (Simpan skor)  │
    └────────┬───────┘
             │
             ↓
    ┌────────────────┐
    │ PLAY AGAIN /   │
    │ MAIN MENU      │
    └────────────────┘
```

---

## 2. Kontrol Permainan

### 2.1 Kontrol Keyboard

| Tombol | Fungsi | Deskripsi |
|--------|--------|-----------|
| **W / ↑** | Gerak Atas | Bergerak ke atas |
| **S / ↓** | Gerak Bawah | Bergerak ke bawah |
| **A / ←** | Gerak Kiri | Bergerak ke kiri |
| **D / →** | Gerak Kanan | Bergerak ke kanan |
| **SPACE** | Pause | Jeda/permainan lanjut |
| **ESC** | Menu | Kembali ke menu utama (saat pause) |

### 2.2 Kontrol Mouse

| Aksi | Fungsi |
|------|--------|
| **Klik** | Pilih upgrade, navigasi menu |
| **Hover** | Highlight tombol/kartu upgrade |

### 2.3 Kontrol Layar Sentuh (Opsional - Mobile)

| Area Layar | Fungsi |
|------------|--------|
| **Virtual Joystick (kiri bawah)** | Gerakkan karakter |
| **Tombol Pause (kanan atas)** | Pause game |

### 2.4 Diagonal Movement

Saat menekan 2 tombol sekaligus (misal W+D), karakter bergerak diagonal dengan kecepatan sama (tidak lebih cepat).

**Implementasi:**
```javascript
// Normalisasi vektor gerak
let dx = 0, dy = 0;
if (keys['w'] || keys['arrowup']) dy -= 1;
if (keys['s'] || keys['arrowdown']) dy += 1;
if (keys['a'] || keys['arrowleft']) dx -= 1;
if (keys['d'] || keys['arrowright']) dx += 1;

// Normalisasi agar tidak lebih cepat saat diagonal
if (dx !== 0 && dy !== 0) {
    dx *= 0.7071; // 1/√2
    dy *= 0.7071;
}

player.x += dx * player.speed * deltaTime;
player.y += dy * player.speed * deltaTime;
```

---

## 3. Sistem Wave (Gelombang)

### 3.1 Detail Wave

**Durasi:**
- Setiap wave: **90 detik**
- Istirahat antar wave: **10 detik**
- Total per wave: **100 detik** (termasuk istirahat)

**Apa yang terjadi saat wave:**
1. **Wave dimulai** → Spawn musuh secara berkala
2. **Musuh terus muncul** hingga wave selesai
3. **Musuh yang sudah spawn tetap ada** (tidak hilang)
4. **Saat wave selesai** → Berhenti spawn musuh baru
5. **Istirahat 10 detik** → Bunuh musuh tersisa atau biarkan
6. **Wave berikutnya** → Mulai dengan kesulitan lebih tinggi

### 3.2 Spawn System

**Mekanisme Spawn:**
- Musuh muncul dari **4 sisi layar** (atas, bawah, kiri, kanan)
- Posisi spawn **acak** di sepanjang sisi layar
- Musuh **tidak spawn** di luar area permainan
- Jarak spawn dari pemain: **minimal 100px** dari tepi layar

**Spawn Points:**
```javascript
function getRandomSpawnPosition() {
    const side = Math.floor(Math.random() * 4); // 0=atas, 1=kanan, 2=bawah, 3=kiri
    const padding = 50;
    
    switch(side) {
        case 0: // Atas
            return {
                x: Math.random() * canvas.width,
                y: -padding
            };
        case 1: // Kanan
            return {
                x: canvas.width + padding,
                y: Math.random() * canvas.height
            };
        case 2: // Bawah
            return {
                x: Math.random() * canvas.width,
                y: canvas.height + padding
            };
        case 3: // Kiri
            return {
                x: -padding,
                y: Math.random() * canvas.height
            };
    }
}
```

### 3.3 Spawn Rate Per Wave

| Wave | Spawn Rate | Musuh/Menit | Catatan |
|------|------------|-------------|---------|
| 1-3 | 1 per 2.0 detik | 30 | Hanya musuh dasar |
| 4-6 | 1 per 1.5 detik | 40 | Mulai ada elite (10%) |
| 7-10 | 1 per 1.0 detik | 60 | Elite 20% |
| 11-15 | 1 per 0.8 detik | 75 | Elite 30% |
| 16-20 | 1 per 0.6 detik | 100 | Elite 40% |
| 21+ | 1 per 0.5 detik | 120 | Elite 50% |

**Catatan:** Boss wave tidak mengikuti spawn rate ini (lihat bagian Boss).

### 3.4 Wave Composition

**Wave 1-5 (Early Game):**
- 100% musuh dasar (Slime, Skeleton, Bat)
- Distribusi: 50% Slime, 30% Skeleton, 20% Bat
- Tidak ada musuh elite
- Boss di wave 5: Giant Slime

**Wave 6-10 (Mid Game Awal):**
- 80-90% musuh dasar
- 10-20% musuh elite
- Boss di wave 10: Skeleton King

**Wave 11-20 (Mid Game Lanjut):**
- 60-70% musuh dasar
- 30-40% musuh elite
- Boss di wave 15: Dark Dragon
- Boss di wave 20: Death Lord

**Wave 21+ (Late Game):**
- 50% musuh dasar
- 50% musuh elite
- Boss setiap 5 wave (25, 30, 35, dst.)
- Boss stats scaling

---

## 4. Sistem Musuh

### 4.1 Enemy AI Behavior

**Semua musuh memiliki behavior yang sama:**
- **Mengejar pemain** secara langsung (shortest path)
- **Tidak ada pathfinding** kompleks (tidak ada obstacle)
- **Tidak ada avoidance** antar musuh (bisa overlap)
- **Sangat agresif** (selalu menuju pemain)

**Movement Formula:**
```javascript
function moveEnemy(enemy, player, deltaTime) {
    // Hitung vektor ke pemain
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Normalisasi
    const dirX = dx / distance;
    const dirY = dy / distance;
    
    // Gerakkan musuh
    enemy.x += dirX * enemy.speed * deltaTime;
    enemy.y += dirY * enemy.speed * deltaTime;
}
```

### 4.2 Enemy Types Detail

#### **MUSUH DASAR**

**1. Slime**
```javascript
{
    type: 'slime',
    name: 'Slime',
    hp: 20,
    speed: 80, // piksel per detik
    damage: 10,
    xpValue: 10,
    color: '#22C55E', // hijau
    size: 25, // radius
    behavior: 'chase',
    description: 'Lambat tapi banyak'
}
```
- **Visual:** Bulat, hijau, bergoyang saat bergerak
- **Animasi:** Squash & stretch, bounce lembut
- **Spawn:** Wave 1+

**2. Skeleton**
```javascript
{
    type: 'skeleton',
    name: 'Tengkorak',
    hp: 30,
    speed: 100,
    damage: 15,
    xpValue: 10,
    color: '#E5E7EB', // abu-abu/putih
    size: 28,
    behavior: 'chase',
    description: 'Seimbang'
}
```
- **Visual:** Tulang tengkorak, mata merah menyala
- **Animasi:** Jalan tegak, tangan berayun
- **Spawn:** Wave 1+

**3. Bat (Kelelawar)**
```javascript
{
    type: 'bat',
    name: 'Kelelawar',
    hp: 15,
    speed: 150,
    damage: 8,
    xpValue: 10,
    color: '#A855F7', // ungu
    size: 20,
    behavior: 'erratic',
    description: 'Cepat, gerakan tidak teratur'
}
```
- **Visual:** Kelelawar kecil dengan sayap
- **Animasi:** Terbang dengan gerakan gelombang (sinusoidal)
- **Movement:** Tambahkan osilasi sinus pada posisi Y
```javascript
enemy.y += Math.sin(time * 0.005) * 30 * deltaTime;
```
- **Spawn:** Wave 2+

#### **MUSUH ELITE**

**4. Armored Slime (Slime Baja)**
```javascript
{
    type: 'armored_slime',
    name: 'Slime Baja',
    hp: 60,
    speed: 70,
    damage: 20,
    xpValue: 25,
    color: '#15803D', // hijau tua
    size: 35,
    behavior: 'chase',
    isElite: true,
    description: 'HP tinggi, lambat'
}
```
- **Visual:** Slime besar dengan armor besi
- **Efek:** Aura merah tipis (indikator elite)
- **Spawn:** Wave 6+

**5. Skeleton Warrior (Pejuang Tengkorak)**
```javascript
{
    type: 'skeleton_warrior',
    name: 'Pejuang Tengkorak',
    hp: 50,
    speed: 90,
    damage: 25,
    xpValue: 25,
    color: '#DC2626', // merah
    size: 32,
    behavior: 'chase',
    isElite: true,
    description: 'Berbahaya dan seimbang'
}
```
- **Visual:** Tengkorak dengan armor perang merah
- **Efek:** Aura merah, mata merah terang
- **Spawn:** Wave 6+

**6. Ghost (Hantu)**
```javascript
{
    type: 'ghost',
    name: 'Hantu',
    hp: 35,
    speed: 130,
    damage: 18,
    xpValue: 25,
    color: 'rgba(59, 130, 246, 0.6)', // biru transparan
    size: 30,
    behavior: 'phase',
    isElite: true,
    description: 'Cepat, transparan'
}
```
- **Visual:** Hantu transparan, melayang
- **Efek:** Opacity 60%, gerakan smooth
- **Spawn:** Wave 8+

### 4.3 Enemy Scaling

Setiap wave, musuh menjadi lebih kuat:

**Scaling Formula:**
```javascript
function getScaledEnemyStats(baseStats, wave) {
    return {
        hp: baseStats.hp * (1 + (wave - 1) * 0.10),      // +10% per wave
        damage: baseStats.damage * (1 + (wave - 1) * 0.05), // +5% per wave
        speed: baseStats.speed * (1 + (wave - 1) * 0.02),   // +2% per wave
        xpValue: baseStats.xpValue // tetap
    };
}
```

**Contoh: Slime di Wave 10**
- HP: 20 × (1 + 9 × 0.10) = 20 × 1.9 = **38 HP**
- Damage: 10 × (1 + 9 × 0.05) = 10 × 1.45 = **14.5 damage**
- Speed: 80 × (1 + 9 × 0.02) = 80 × 1.18 = **94.4 px/dtk**

### 4.4 Enemy Damage Player

**Saat musuh menyentuh pemain:**
```javascript
function enemyHitsPlayer(enemy, player) {
    // Cek collision (circle-circle)
    const dx = enemy.x - player.x;
    const dy = enemy.y - player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < enemy.size + player.width / 2) {
        // Hitung damage
        let damage = enemy.damage - player.defense;
        damage = Math.max(1, damage); // minimum 1 damage
        
        // Apply damage
        player.hp -= damage;
        
        // Invincibility frames
        player.invincibleTimer = 0.5; // 500ms
        
        // Visual feedback
        player.blinkTimer = 0.5;
        showDamageNumber(player.x, player.y - 30, damage);
        
        // Sound effect
        playHitSound();
        
        // Check death
        if (player.hp <= 0) {
            gameOver();
        }
        
        return true;
    }
    return false;
}
```

**Invincibility Frames (i-frames):**
- Setelah kena damage: **0.5 detik** invincible
- Visual: Karakter **blink/berkedip** (opacity 50% ↔ 100%)
- Tidak bisa kena damage lagi selama i-frames
- Timer reset setiap kali kena damage baru

### 4.5 Enemy Death

**Saat musuh mati:**
1. **Play death animation** (fade out + scale down)
2. **Drop XP orb** (1 orb per musuh)
3. **Play death sound**
4. **Remove from array** setelah animasi selesai (0.3 detik)

```javascript
function killEnemy(enemy) {
    enemy.isDying = true;
    enemy.deathTimer = 0.3; // 300ms animasi
    
    // Drop XP orb
    xpOrbs.push({
        x: enemy.x,
        y: enemy.y,
        value: enemy.xpValue,
        size: enemy.isElite ? 8 : 6,
        color: enemy.isElite ? '#3B82F6' : '#22C55E'
    });
    
    // Update score
    score += Math.floor(enemy.hp / 2);
}
```

---

## 5. Sistem Boss

### 5.1 Boss Schedule

**Boss muncul setiap 5 wave:**
- Wave 5, 10, 15, 20, 25, 30, dst.

**Boss Fight Mechanics:**
- Boss spawn **setelah wave biasa selesai**
- Tidak ada musuh lain saat boss fight
- Boss punya **HP bar khusus** di atas layar
- **Boss music** bermain (lebih intens)

### 5.2 Boss Types Detail

#### **BOSS 1: Giant Slime (Wave 5)**

```javascript
{
    type: 'boss_giant_slime',
    name: 'Slime Raksasa',
    hp: 300,
    speed: 60,
    damage: 30,
    xpValue: 100,
    color: '#16A34A',
    size: 60, // 2x ukuran musuh biasa
    isBoss: true,
    wave: 5,
    specialAbility: 'spawn_on_death',
    abilityDescription: 'Spawn 3 slime saat mati',
    abilityData: {
        spawnCount: 3,
        spawnType: 'slime'
    }
}
```

**Behavior:**
- Mengejar pemain seperti musuh biasa
- Ukuran besar (60px radius)
- HP sangat tinggi (300)
- **Kemampuan khusus:** Saat mati, spawn 3 Slime biasa di posisi boss

**Visual:**
- Slime raksasa dengan mahkota kecil
- Aura hijau terang
- HP bar besar di atas layar
- Shadow lebih besar

**Strategy:**
- Boss ini test positioning
- Setelah boss mati, hati-hati dengan 3 slime spawn

---

#### **BOSS 2: Skeleton King (Wave 10)**

```javascript
{
    type: 'boss_skeleton_king',
    name: 'Raja Tengkorak',
    hp: 500,
    speed: 80,
    damage: 40,
    xpValue: 100,
    color: '#FBBF24', // emas
    size: 65,
    isBoss: true,
    wave: 10,
    specialAbility: 'summon_minions',
    abilityDescription: 'Memanggil 5 tengkorak setiap 10 detik',
    abilityData: {
        summonCount: 5,
        summonType: 'skeleton',
        summonInterval: 10 // detik
    }
}
```

**Behavior:**
- Mengejar pemain
- **Kemampuan khusus:** Setiap 10 detik, summon 5 Skeleton
- Skeleton summon muncul dari sisi layar

**Visual:**
- Tengkorak dengan mahkota emas besar
- Jubah raja merah
- Tongkat kerajaan
- Aura emas bercahaya

**Strategy:**
- Fokus damage ke boss
- Hindari skeleton summon (abaikan atau bunuh cepat)
- Jangan terpojok

**Summon Logic:**
```javascript
function bossSummonMinions(boss) {
    if (boss.lastSummonTime && currentTime - boss.lastSummonTime < 10000) {
        return; // Belum 10 detik
    }
    
    boss.lastSummonTime = currentTime;
    
    for (let i = 0; i < 5; i++) {
        const skeleton = createEnemy('skeleton');
        skeleton.x = getRandomSpawnPosition().x;
        skeleton.y = getRandomSpawnPosition().y;
        enemies.push(skeleton);
    }
    
    // Warning indicator
    showWarningText('⚠ Raja Tengkorak memanggil bala bantuan!');
}
```

---

#### **BOSS 3: Dark Dragon (Wave 15)**

```javascript
{
    type: 'boss_dark_dragon',
    name: 'Naga Gelap',
    hp: 800,
    speed: 100,
    damage: 50,
    xpValue: 100,
    color: '#7C3AED', // ungu gelap
    size: 70,
    isBoss: true,
    wave: 15,
    specialAbility: 'fire_breath',
    abilityDescription: 'Menyemburkan api ke arah pemain setiap 8 detik',
    abilityData: {
        fireInterval: 8, // detik
        fireWidth: 120, // lebar area api
        fireLength: 250, // panjang api
        fireDuration: 2, // detik api aktif
        fireDamage: 20 // damage per detik
    }
}
```

**Behavior:**
- Mengejar pemain
- **Kemampuan khusus:** Fire breath setiap 8 detik
- Api menyambar area cone di depan boss

**Visual:**
- Naga ungu gelap dengan sayap
- Mata merah menyala
- Api ungu saat attack
- Aura gelap

**Fire Breath Mechanics:**
```javascript
function bossFireBreath(boss) {
    if (boss.lastFireTime && currentTime - boss.lastFireTime < 8000) {
        return;
    }
    
    boss.lastFireTime = currentTime;
    
    // Hitung arah ke pemain
    const angle = Math.atan2(player.y - boss.y, player.x - boss.x);
    
    // Buat area api (cone)
    fireZones.push({
        x: boss.x,
        y: boss.y,
        angle: angle,
        width: 120, // derajat
        length: 250, // piksel
        duration: 2, // detik
        damage: 20, // per detik
        timer: 2
    });
    
    // Warning
    showWarningText('🔥 Naga Gelap menyemburkan api!');
    playBossAbilitySound();
}
```

**Fire Zone Damage:**
```javascript
function checkFireZoneDamage(player, fireZones) {
    fireZones.forEach(zone => {
        // Cek apakah pemain dalam area cone
        const dx = player.x - zone.x;
        const dy = player.y - zone.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        
        let angleDiff = angle - zone.angle;
        // Normalize angle
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        
        if (distance < zone.length && Math.abs(angleDiff) < zone.width / 2) {
            // Player dalam fire zone
            player.hp -= zone.damage * deltaTime;
        }
    });
}
```

**Strategy:**
- Perhatikan warning indicator sebelum api
- Segera hindari area cone api
- Tetap damage boss dari samping/belakang

---

#### **BOSS 4: Death Lord (Wave 20)**

```javascript
{
    type: 'boss_death_lord',
    name: 'Dewa Kematian',
    hp: 1200,
    speed: 90,
    damage: 60,
    xpValue: 100,
    color: '#1F2937', // abu-abu gelap/hitam
    size: 75,
    isBoss: true,
    wave: 20,
    specialAbility: 'teleport',
    abilityDescription: 'Teleport dekat pemain setiap 6 detik',
    abilityData: {
        teleportInterval: 6, // detik
        teleportDistance: 150 // jarak teleport dari pemain
    }
}
```

**Behavior:**
- Mengejar pemain
- **Kemampuan khusus:** Teleport setiap 6 detik
- Teleport ke posisi acak dalam radius 150px dari pemain

**Visual:**
- Armor hitam gelap dengan jubah
- Mata merah terang
- Aura gelap berputar
- Efek teleport (fade out → fade in)

**Teleport Mechanics:**
```javascript
function bossTeleport(boss) {
    if (boss.lastTeleportTime && currentTime - boss.lastTeleportTime < 6000) {
        return;
    }
    
    boss.lastTeleportTime = currentTime;
    
    // Fade out
    boss.isFading = true;
    
    setTimeout(() => {
        // Posisi baru: radius 150px dari pemain
        const angle = Math.random() * Math.PI * 2;
        const distance = 150;
        
        boss.x = player.x + Math.cos(angle) * distance;
        boss.y = player.y + Math.sin(angle) * distance;
        
        // Fade in
        boss.isFading = false;
        
        // Warning
        showWarningText('💀 Dewa Kematian teleport!');
    }, 500); // 500ms fade out
}
```

**Strategy:**
- Boss sangat berbahaya saat teleport dekat
- Selalu siap menghindar setelah teleport
- Manfaatkan waktu antara teleport untuk damage

---

#### **BOSS 5+ (Wave 25+): Scaling Boss**

**Boss untuk wave 25 ke atas menggunakan scaling:**

```javascript
function createScalingBoss(wave) {
    return {
        type: 'boss_scaling',
        name: `Dewa Kegelapan Lv.${wave}`,
        hp: 1000 + (wave * 100),
        speed: 100,
        damage: 50 + (wave * 5),
        xpValue: 100 + (wave * 10),
        color: '#991B1B', // merah gelap
        size: 75 + (wave * 2),
        isBoss: true,
        wave: wave,
        specialAbility: getRandomAbility(), // Random dari pool ability
        abilityData: getAbilityDataForWave(wave)
    };
}
```

**Scaling:**
- HP: 1000 + (wave × 100)
- Damage: 50 + (wave × 5)
- Size: 75 + (wave × 2)
- XP: 100 + (wave × 10)

**Special Ability Pool (Wave 25+):**
- Random pick dari: `spawn_on_death`, `summon_minions`, `fire_breath`, `teleport`
- Semakin tinggi wave, semakin berbahaya ability-nya

### 5.3 Boss Visual Indicators

**Semua boss memiliki:**
1. **HP Bar besar** di atas layar
2. **Boss name** di atas HP bar
3. **Aura effect** bercahaya
4. **Warning text** saat menggunakan ability
5. **Boss music** lebih intens

**Boss HP Bar:**
```
┌────────────────────────────────────────┐
│  BOSS: Slime Raksasa                   │
│  ████████████████░░░░░░░░  300/300 HP │
└────────────────────────────────────────┘
```

### 5.4 Boss Death

**Saat boss mati:**
1. **Slow motion** (0.5x speed) selama 1 detik
2. **Explosion effect** (partikel besar)
3. **Drop 100 XP orb** (besar, ungu)
4. **Boss defeated message**
5. **Bonus score** = Boss HP
6. **Lanjutkan ke wave berikutnya**

---

## 6. Sistem Auto-Attack

### 6.1 Cara Kerja Auto-Attack

**Pemain TIDAK perlu menekan tombol attack.** Karakter akan menyerang otomatis.

**Mekanisme:**
1. Sistem mencari **musuh terdekat** dalam jangkauan senjata
2. Jika ada musuh dalam range → **Fire weapon**
3. Attack mengikuti **attack speed** senjata
4. **Cycle through weapons** jika punya banyak senjata

### 6.2 Target Priority

**Prioritas target:**
```javascript
function findTarget(player, enemies, weaponRange) {
    let closestEnemy = null;
    let closestDistance = weaponRange;
    
    enemies.forEach(enemy => {
        const dx = enemy.x - player.x;
        const dy = enemy.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < closestDistance) {
            closestDistance = distance;
            closestEnemy = enemy;
        }
    });
    
    return closestEnemy;
}
```

**Prioritas:**
1. Musuh **terdekat** dalam range
2. Jika ada banyak musuh dengan jarak sama → **HP terendah**
3. Jika masih sama → **Random**

### 6.3 Attack Cooldown

**Setiap senjata punya cooldown:**
```javascript
let weaponCooldowns = {
    basic_sword: 0,
    magic_orb: 0,
    arrow_bow: 0
};

const ATTACK_SPEEDS = {
    basic_sword: 1.0,    // 1 serangan per detik
    magic_orb: 0.8,      // 0.8 serangan per detik
    arrow_bow: 0.6       // 0.6 serangan per detik
};

function canAttack(weaponType, currentTime) {
    const cooldown = 1000 / ATTACK_SPEEDS[weaponType]; // ms
    return currentTime - weaponCooldowns[weaponType] >= cooldown;
}

function attackWithWeapon(weaponType, target) {
    if (!canAttack(weaponType, currentTime)) return;
    
    // Fire weapon
    fireProjectile(weaponType, target);
    
    // Set cooldown
    weaponCooldowns[weaponType] = currentTime;
}
```

### 6.4 Weapon Fire Modes

**1. Basic Sword (Melee Arc):**
- **Range:** 60px
- **Arc:** 90° di depan pemain
- **Animation:** Slash effect
- **Hit:** Semua musuh dalam arc

```javascript
function fireSword(player, target) {
    // Hitung arah ke target
    const angle = Math.atan2(target.y - player.y, target.x - player.x);
    
    // Slash effect
    slashEffects.push({
        x: player.x,
        y: player.y,
        angle: angle,
        arc: Math.PI / 2, // 90°
        range: 60,
        duration: 0.2,
        timer: 0.2,
        damage: player.damage
    });
    
    // Hit enemies dalam arc
    enemies.forEach(enemy => {
        if (isInSlashArc(player, enemy, angle, Math.PI / 2, 60)) {
            damageEnemy(enemy, player.damage);
        }
    });
    
    playSwordSound();
}
```

**2. Magic Orb (Homing Projectile):**
- **Range:** 300px
- **Behavior:** Mencari musuh terdekat
- **Speed:** 250px/detik
- **Piercing:** Tidak (hit 1 musuh lalu hilang)

```javascript
function fireMagicOrb(player, target) {
    const angle = Math.atan2(target.y - player.y, target.x - player.x);
    
    projectiles.push({
        x: player.x,
        y: player.y,
        vx: Math.cos(angle) * 250,
        vy: Math.sin(angle) * 250,
        damage: player.damage,
        range: 300,
        traveled: 0,
        isHoming: true,
        target: target,
        homingStrength: 2, // seberapa kuat mencari target
        color: '#06B6D4',
        size: 8,
        trail: []
    });
    
    playMagicSound();
}
```

**Homing Logic:**
```javascript
function updateHomingProjectile(proj, enemies) {
    // Cari target baru jika target mati
    if (!enemies.includes(proj.target)) {
        proj.target = findClosestEnemy(proj, enemies);
    }
    
    if (proj.target) {
        // Adjust velocity menuju target
        const angle = Math.atan2(proj.target.y - proj.y, proj.target.x - proj.x);
        proj.vx += Math.cos(angle) * proj.homingStrength;
        proj.vy += Math.sin(angle) * proj.homingStrength;
        
        // Normalize speed
        const speed = Math.sqrt(proj.vx * proj.vx + proj.vy * proj.vy);
        const maxSpeed = 250;
        if (speed > maxSpeed) {
            proj.vx = (proj.vx / speed) * maxSpeed;
            proj.vy = (proj.vy / speed) * maxSpeed;
        }
    }
}
```

**3. Arrow Bow (Piercing Projectile):**
- **Range:** 400px
- **Behavior:** Lurus, tembus musuh
- **Speed:** 400px/detik
- **Piercing:** Ya (bisa hit banyak musuh)

```javascript
function fireArrow(player, target) {
    const angle = Math.atan2(target.y - player.y, target.x - player.x);
    
    projectiles.push({
        x: player.x,
        y: player.y,
        vx: Math.cos(angle) * 400,
        vy: Math.sin(angle) * 400,
        damage: player.damage,
        range: 400,
        traveled: 0,
        isPiercing: true,
        hitEnemies: [], // sudah hit siapa saja
        color: '#92400E',
        size: 4,
        trail: []
    });
    
    playBowSound();
}
```

**Piercing Logic:**
```javascript
function updateProjectile(proj, enemies) {
    // Move projectile
    proj.x += proj.vx * deltaTime;
    proj.y += proj.vy * deltaTime;
    proj.traveled += Math.sqrt(proj.vx * proj.vx + proj.vy * proj.vy) * deltaTime;
    
    // Trail effect
    proj.trail.push({ x: proj.x, y: proj.y, timer: 0.3 });
    
    // Check if exceeded range
    if (proj.traveled > proj.range) {
        removeProjectile(proj);
        return;
    }
    
    // Check collision with enemies
    enemies.forEach(enemy => {
        if (proj.isPiercing && proj.hitEnemies.includes(enemy)) return;
        
        const dx = enemy.x - proj.x;
        const dy = enemy.y - proj.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < enemy.size + proj.size) {
            // Hit!
            damageEnemy(enemy, proj.damage);
            
            if (proj.isPiercing) {
                proj.hitEnemies.push(enemy);
                // Projectile terus terbang
            } else {
                removeProjectile(proj);
            }
        }
    });
}
```

### 6.5 Multi-Weapon System

**Jika pemain punya 3 senjata:**
- Fire secara **berurutan** (rotate)
- **Weapon 1** → cooldown → **Weapon 2** → cooldown → **Weapon 3** → cooldown → repeat

```javascript
let currentWeaponIndex = 0;
let weapons = ['basic_sword', 'magic_orb', 'arrow_bow'];

function autoAttackCycle() {
    const weaponType = weapons[currentWeaponIndex];
    const target = findTarget(player, enemies, getWeaponRange(weaponType));
    
    if (target && canAttack(weaponType, currentTime)) {
        attackWithWeapon(weaponType, target);
        
        // Move to next weapon
        currentWeaponIndex = (currentWeaponIndex + 1) % weapons.length;
    }
}
```

**Contoh Timeline:**
```
0.0s  → Sword attack (cooldown 1.0s)
0.0s  → Magic orb fires (cooldown 1.25s)
0.0s  → Arrow fires (cooldown 1.67s)
---
1.0s  → Sword attack again
1.25s → Magic orb fires again
1.67s → Arrow fires again
---
2.0s  → Sword (cycle 2)
2.5s  → Magic orb (cycle 2)
3.34s → Arrow (cycle 2)
```

---

## 7. Sistem XP & Level Up

### 7.1 XP Orb System

**Saat musuh mati:**
```javascript
function dropXpOrb(enemy) {
    xpOrbs.push({
        x: enemy.x,
        y: enemy.y,
        value: enemy.xpValue,
        size: enemy.isElite ? 8 : (enemy.isBoss ? 12 : 6),
        color: enemy.isBoss ? '#A855F7' : (enemy.isElite ? '#3B82F6' : '#22C55E'),
        lifetime: 30, // hilang setelah 30 detik
        timer: 30,
        magnetized: false // apakah sudah ditarik ke pemain
    });
}
```

**XP Orb Values:**
- Musuh dasar: **10 XP** (hijau)
- Musuh elit: **25 XP** (biru)
- Boss: **100 XP** (ungu)

**XP Orb Visual:**
- Bulat, bercahaya
- Warna berdasarkan value
- Berkedip pelan (pulse)
- Mengambang naik-turun (bobbing)

### 7.2 XP Collection

**Auto-collect saat dalam pickup range:**
```javascript
function collectXpOrbs(player, xpOrbs) {
    xpOrbs.forEach((orb, index) => {
        const dx = player.x - orb.x;
        const dy = player.y - orb.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < player.pickupRange) {
            // Magnetize orb
            orb.magnetized = true;
            orb.targetX = player.x;
            orb.targetY = player.y;
        }
        
        if (orb.magnetized) {
            // Fly to player
            const speed = 300;
            const angle = Math.atan2(player.y - orb.y, player.x - orb.x);
            orb.x += Math.cos(angle) * speed * deltaTime;
            orb.y += Math.sin(angle) * speed * deltaTime;
            
            // Check if reached player
            const newDistance = Math.sqrt((player.x - orb.x) ** 2 + (player.y - orb.y) ** 2);
            if (newDistance < 10) {
                // Collected!
                player.xp += orb.value;
                xpOrbs.splice(index, 1);
                playXpCollectSound();
                
                // Check level up
                checkLevelUp();
            }
        }
    });
}
```

**Pickup Range Upgrade:**
- Base: **50px**
- Upgrade: +30% → **65px**
- Upgrade lagi: +30% → **84.5px**
- Magnet item: **150px** (radius besar)

### 7.3 Level Up System

**XP Required:**
```javascript
function getXpForNextLevel(level) {
    return level * 100;
}
```

**Contoh:**
- Level 1 → 2: butuh **100 XP**
- Level 2 → 3: butuh **200 XP** (total 300 XP)
- Level 3 → 4: butuh **300 XP** (total 600 XP)
- Level 10 → 11: butuh **1000 XP**

**Check Level Up:**
```javascript
function checkLevelUp() {
    const xpNeeded = getXpForNextLevel(player.level);
    
    if (player.xp >= xpNeeded) {
        // Level up!
        player.xp -= xpNeeded;
        player.level++;
        
        // Pause game
        gamePaused = true;
        
        // Generate upgrade choices
        generateUpgradeChoices();
        
        // Show level up screen
        showLevelUpScreen();
        
        // Play level up sound
        playLevelUpSound();
    }
}
```

### 7.4 Upgrade Choice System

**Generate 3-4 Random Upgrades:**
```javascript
function generateUpgradeChoices() {
    const allUpgrades = getAllAvailableUpgrades();
    const choices = [];
    
    // Pick 3-4 random unique upgrades
    const numChoices = 3 + (player.level >= 10 ? 1 : 0); // 4 choices di level 10+
    
    while (choices.length < numChoices && allUpgrades.length > 0) {
        const randomIndex = Math.floor(Math.random() * allUpgrades.length);
        const upgrade = allUpgrades[randomIndex];
        
        // Don't add duplicates
        if (!choices.find(u => u.id === upgrade.id)) {
            choices.push(upgrade);
        }
        
        // Remove from pool
        allUpgrades.splice(randomIndex, 1);
    }
    
    upgradeChoices = choices;
}
```

**Upgrade Pool Logic:**
```javascript
function getAllAvailableUpgrades() {
    const upgrades = [];
    
    // Weapon upgrades (jika punya weapon tersebut)
    player.weapons.forEach(weapon => {
        if (weapon.level < 5) {
            upgrades.push({
                id: `upgrade_${weapon.type}`,
                type: 'weapon_upgrade',
                name: `${weapon.name} Lv.${weapon.level + 1}`,
                description: `Damage +20%${weapon.level === 2 ? ', +1 projectile' : ''}${weapon.level === 3 ? ', +special effect' : ''}`,
                weaponType: weapon.type,
                rarity: weapon.level >= 3 ? 'rare' : 'common'
            });
        }
    });
    
    // New weapon (jika belum punya 3 weapon)
    if (player.weapons.length < 3) {
        const availableWeapons = getUnownedWeapons();
        availableWeapons.forEach(weapon => {
            upgrades.push({
                id: `new_${weapon.type}`,
                type: 'new_weapon',
                name: weapon.name,
                description: weapon.description,
                weaponType: weapon.type,
                rarity: 'epic'
            });
        });
    }
    
    // Stat upgrades
    STAT_UPGRADES.forEach(upgrade => {
        const currentLevel = player.upgrades[upgrade.id] || 0;
        if (currentLevel < upgrade.maxLevel) {
            upgrades.push({
                id: upgrade.id,
                type: 'stat_upgrade',
                name: upgrade.name,
                description: upgrade.getDescription(currentLevel),
                statId: upgrade.id,
                currentLevel: currentLevel,
                maxLevel: upgrade.maxLevel,
                rarity: currentLevel >= 5 ? 'rare' : 'common'
            });
        }
    });
    
    return upgrades;
}
```

### 7.5 Upgrade Cards Display

**Level Up Screen Layout:**
```
┌─────────────────────────────────────────┐
│         ⭐ LEVEL UP! ⭐                 │
│           Level 5 → 6                   │
├──────────┬──────────┬──────────────────┤
│          │          │                  │
│  Card 1  │  Card 2  │    Card 3        │
│          │          │                  │
│ [Icon]   │ [Icon]   │    [Icon]        │
│ Name     │ Name     │    Name          │
│ Desc     │ Desc     │    Desc          │
│ Lv.2→3   │ NEW!     │    Lv.1→2        │
│          │          │                  │
│ [PILIH]  │ [PILIH]  │    [PILIH]       │
└──────────┴──────────┴──────────────────┘
```

**Setiap Upgrade Card Menampilkan:**
- **Icon** (visual upgrade)
- **Nama** upgrade
- **Deskripsi** singkat
- **Current Level → New Level** (jika upgrade existing)
- **Rarity indicator** (common/green, rare/blue, epic/purple)
- **Tombol "PILIH"**

---

## 7.5A Sistem Koin (Gold)

### 7.5A.1 Koin Drop

**Saat musuh mati, mereka juga menjatuhkan koin:**
```javascript
function dropCoins(enemy) {
    // Tentukan jumlah koin berdasarkan tipe musuh
    let coinCount = 0;
    if (enemy.isBoss) {
        coinCount = 50; // Boss selalu drop 50 koin
    } else if (enemy.isElite) {
        coinCount = 10; // Elite selalu drop 10 koin
    } else {
        // Musuh biasa: 30% chance drop 5 koin
        coinCount = Math.random() < 0.3 ? 5 : 0;
    }
    
    if (coinCount > 0) {
        // Drop 1-3 koin sekaligus (untuk visual lebih bagus)
        const dropCount = enemy.isBoss ? 5 : (enemy.isElite ? 2 : Math.floor(Math.random() * 3) + 1);
        const coinValue = Math.ceil(coinCount / dropCount);
        
        for (let i = 0; i < dropCount; i++) {
            coins.push({
                x: enemy.x + (Math.random() - 0.5) * 30,
                y: enemy.y + (Math.random() - 0.5) * 30,
                value: coinValue,
                size: 8,
                lifetime: 45, // hilang setelah 45 detik
                timer: 45,
                magnetized: false
            });
        }
    }
}
```

**Coin Values:**
| Musuh Type | Coin Drop | Chance | Total Expected |
|------------|-----------|--------|----------------|
| **Musuh Dasar** | 5 koin | 30% | 1.5 koin/musuh |
| **Musuh Elit** | 10 koin | 100% | 10 koin/musuh |
| **Boss** | 50 koin | 100% | 50 koin/boss |

**Contoh Coin per Wave:**
- Wave 1-3 (30 enemies, all basic): ~45 koin
- Wave 5 (boss fight): 50 koin dari boss + ~30 koin dari minions = ~80 koin
- Wave 10 (boss + elites): 50 + 100 + ~50 = ~200 koin

**Coin Visual:**
- Bentuk: Bulat dengan efek glow
- Warna: Emas (#FBBF24) dengan outline coklat (#92400E)
- Animasi: Berputar perlahan (rotation), bercahaya (pulse), mengambang (bobbing)
- Symbol: Dollar sign ($) atau diamond di tengah
- Size: 8px radius

**Coin Bobbing Animation:**
```javascript
function drawCoin(coin, time) {
    ctx.save();
    ctx.translate(coin.x, coin.y);
    
    // Bobbing effect
    const bobY = Math.sin(time * 0.005) * 3;
    ctx.translate(0, bobY);
    
    // Rotation effect
    const scaleX = Math.abs(Math.cos(time * 0.003));
    ctx.scale(scaleX, 1);
    
    // Glow effect
    ctx.shadowColor = '#FBBF24';
    ctx.shadowBlur = 10;
    
    // Coin body
    ctx.fillStyle = '#FBBF24';
    ctx.beginPath();
    ctx.arc(0, 0, coin.size, 0, Math.PI * 2);
    ctx.fill();
    
    // Coin outline
    ctx.strokeStyle = '#92400E';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Dollar sign
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#92400E';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('$', 0, 0);
    
    ctx.restore();
}
```

### 7.5A.2 Coin Collection

**Mekanik pengambilan koin (mirip XP orb):**
```javascript
function collectCoins(player, coins) {
    coins.forEach((coin, index) => {
        const dx = player.x - coin.x;
        const dy = player.y - coin.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Auto-collect dalam pickup range
        if (distance < player.pickupRange) {
            coin.magnetized = true;
        }
        
        // Magnetized coins fly to player
        if (coin.magnetized) {
            const speed = 300;
            const angle = Math.atan2(player.y - coin.y, player.x - coin.x);
            coin.x += Math.cos(angle) * speed * deltaTime;
            coin.y += Math.sin(angle) * speed * deltaTime;
            
            // Check if reached player
            const newDistance = Math.sqrt((player.x - coin.x) ** 2 + (player.y - coin.y) ** 2);
            if (newDistance < 10) {
                player.coins += coin.value;
                coins.splice(index, 1);
                playCoinCollectSound();
                showCoinNumber(player.x, player.y - 20, coin.value);
            }
        }
    });
}
```

**Coin Lifetime:**
- Koin hilang setelah **45 detik** (lebih lama dari XP orb yang 30 detik)
- Warning blink saat timer < 10 detik
- Fade out 3 detik sebelum hilang
- Reminder text: "⚠️ Koin akan hilang!"

**Coin Collection Sound:**
- Sound: "Cha-ching!" atau "Ding!" lembut
- Pitch naik berdasarkan jumlah koin

### 7.5A.3 Coin Display (HUD)

**Tampilkan koin di HUD (atas kiri, sebelum XP bar):**
```
┌──────────────────────────────────────────────────────────────┐
│ ❤️ 100/100    ⭐ Lv.12    💰 125    ⬛░░░░░ 250/400 XP       │
└──────────────────────────────────────────────────────────────┘
```

**Code:**
```javascript
function drawCoinHUD(x, y) {
    // Coin icon
    ctx.fillStyle = '#FBBF24';
    ctx.shadowColor = '#FBBF24';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    ctx.strokeStyle = '#92400E';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Dollar sign
    ctx.fillStyle = '#92400E';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('$', x, y);
    
    // Coin count
    ctx.fillStyle = '#FBBF24';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(player.coins.toString(), x + 15, y - 8);
}
```

---

## 7.5B Sistem Toko (Shop)

### 7.5B.1 Kapan Toko Bisa Diakses

**Toko bisa dibuka saat:**
1. **Wave rest phase** (10 detik istirahat antar wave)
2. **Setelah boss defeated** (bonus time 15 detik)
3. Kapan saja saat game tidak dalam pertarungan intensif

**Shop Access UI (saat wave rest):**
```
┌─────────────────────────────────────────┐
│  ⏰ Istirahat: 8 detik                  │
│  💰 Koin: 125                           │
│                                         │
│  [🛒 BUKA TOKO]                         │
│  atau tekan tombol [B]                  │
└─────────────────────────────────────────┘
```

**Toko otomatis tutup saat:**
- Wave baru dimulai
- Player menutup manual (klik tombol X atau ESC)
- Player menekan [B] lagi

**Shop Button (selalu ada di HUD):**
```
┌──────────────────────┐
│  [🛒 Toko (B)]       │
└──────────────────────┘
```

### 7.5B.2 Shop Interface

**Shop Screen Layout:**
```
┌──────────────────────────────────────────────────────────────┐
│              🛒 TOKO SENJATA & ARMOR 🛒                      │
│                       💰 Koin Anda: 125                      │
├──────────────────────────────────────────────────────────────┤
│  [⚔️ Senjata]  [🛡️ Armor]  [⭐ Upgrade Khusus]               │
├──────────────┬──────────────┬────────────────────────────────┤
│              │              │                                │
│  ┌────────┐  │  ┌────────┐  │  ┌──────────────────────────┐  │
│  │  ⚔️    │  │  │  🛡️    │  │  │  ❤️‍🔥                    │  │
│  │Pedang  │  │  │Armor   │  │  │  Lifesteal Lv.1          │  │
│  │Lv.2    │  │  │Lv.1    │  │  │  Heal 10% damage         │  │
│  │💰 50   │  │  │💰 80   │  │  │  💰 100                  │  │
│  └────────┘  │  └────────┘  │  └──────────────────────────┘  │
│              │              │                                │
│  ┌────────┐  │  ┌────────┐  │  ┌──────────────────────────┐  │
│  │  🏹    │  │  │  🔰    │  │  │  🧲                     │  │
│  │Busur   │  │  │Shield  │  │  │  Magnet Lv.1             │  │
│  │Lv.2    │  │  │Lv.1    │  │  │  +50% pickup range       │  │
│  │💰 60   │  │  │💰 70   │  │  │  💰 50                   │  │
│  └────────┘  │  └────────┘  │  └──────────────────────────┘  │
│              │              │                                │
├──────────────┴──────────────┴────────────────────────────────┤
│  ℹ️ Klik item untuk melihat detail & beli                    │
│  [TUTUP TOKO (B/ESC)]                                        │
└──────────────────────────────────────────────────────────────┘
```

**Shop Categories:**

**1. ⚔️ Senjata (Weapons)**
- Upgrade damage senjata yang sudah dimiliki
- Unlock senjata baru
- Attack speed upgrades
- Projectile upgrades

**2. 🛡️ Armor (Defense)**
- Defense upgrades (armor)
- Damage reduction (shield)
- Max HP upgrades (helmet)
- Movement speed (boots)

**3. ⭐ Upgrade Khusus (Special)**
- Lifesteal
- Magnet (pickup range)
- XP Boost
- Critical Hit
- HP Regeneration
- Extra Life (1x per run)
- Area Damage

### 7.5B.3 Shop Items - Senjata

**Tabel Harga Senjata:**

| Item | Upgrade | Efek | Harga | Max Lv |
|------|---------|------|-------|--------|
| **Pedang Lv.2** | Damage +20% | 10 → 12 dmg | 💰 50 | 5 |
| **Pedang Lv.3** | Damage +20%, +1 projectile | 12 → 14.4 dmg | 💰 100 | 5 |
| **Pedang Lv.4** | Damage +20%, +slash effect | 14.4 → 17.3 dmg | 💰 150 | 5 |
| **Pedang Lv.5** | Damage +40%, visual upgrade | 17.3 → 24.2 dmg | 💰 250 | 5 |
| **Busur Lv.2** | Damage +20% | 15 → 18 dmg | 💰 60 | 5 |
| **Busur Lv.3** | Damage +20%, +1 arrow | 18 → 21.6 dmg | 💰 120 | 5 |
| **Busur Lv.4** | Damage +20%, faster arrows | 21.6 → 25.9 dmg | 💰 180 | 5 |
| **Busur Lv.5** | Damage +40%, piercing +2 | 25.9 → 36.3 dmg | 💰 280 | 5 |
| **Orb Sihir Lv.2** | Damage +20% | 8 → 9.6 dmg | 💰 55 | 5 |
| **Orb Sihir Lv.3** | Damage +20%, faster homing | 9.6 → 11.5 dmg | 💰 110 | 5 |
| **Orb Sihir Lv.4** | Damage +20%, +1 orb | 11.5 → 13.8 dmg | 💰 165 | 5 |
| **Orb Sihir Lv.5** | Damage +40%, explosive | 13.8 → 19.3 dmg | 💰 260 | 5 |
| **🆕 Tongkat Api** | NEW - AoE damage | 12 dmg, area | 💰 200 | 5 |
| **🆕 Tongkat Petir** | NEW - Chain lightning | 9 dmg, chain 3 | 💰 220 | 5 |
| **🆕 Tongkat Es** | NEW - Slow enemies 30% | 7 dmg, slow | 💰 180 | 5 |

**Catatan:**
- Item bertanda **🆕** adalah senjata baru (bukan upgrade)
- Harga meningkat exponential: `basePrice × (scaling ^ currentLevel)`
- Hanya bisa beli upgrade jika sudah punya senjata base
- Senjata baru bisa langsung dibeli kapan saja

### 7.5B.4 Shop Items - Armor

**Tabel Harga Armor:**

| Item | Upgrade | Efek | Harga | Max Lv |
|------|---------|------|-------|--------|
| **Armor Lv.1** | Defense +5 | 0 → 5 def | 💰 80 | 10 |
| **Armor Lv.2** | Defense +5 | 5 → 10 def | 💰 120 | 10 |
| **Armor Lv.3** | Defense +5 | 10 → 15 def | 💰 180 | 10 |
| **Armor Lv.4-10** | Defense +5 per level | ... | 💰 200+ | 10 |
| **Shield Lv.1** | Damage Reduction +5% | 0 → 5% | 💰 70 | 5 |
| **Shield Lv.2** | Damage Reduction +5% | 5 → 10% | 💰 140 | 5 |
| **Shield Lv.3** | Damage Reduction +5% | 10 → 15% | 💰 210 | 5 |
| **Shield Lv.4-5** | Damage Reduction +5% | ... | 💰 280+ | 5 |
| **Boots Lv.1** | Movement Speed +10% | 200 → 220 px/s | 💰 45 | 5 |
| **Boots Lv.2** | Movement Speed +10% | 220 → 242 px/s | 💰 90 | 5 |
| **Boots Lv.3-5** | Movement Speed +10% | ... | 💰 135+ | 5 |
| **Helmet Lv.1** | Max HP +20 | +20 HP | 💰 60 | 10 |
| **Helmet Lv.2** | Max HP +20 | +40 HP total | 💰 120 | 10 |
| **Helmet Lv.3-10** | Max HP +20 per level | ... | 💰 180+ | 10 |

**Contoh Armor Benefits:**

**Defense System:**
```javascript
// Defense reduces flat damage
function calculateDamageAfterDefense(player, enemyDamage) {
    let damageAfterDefense = enemyDamage - player.defense;
    return Math.max(1, damageAfterDefense); // Minimum 1 damage
}

// Contoh:
// Enemy damage: 20
// Player defense: 15 (Armor Lv.3)
// Damage taken: 20 - 15 = 5 HP
```

**Damage Reduction System:**
```javascript
// Damage reductionpercentage
function calculateDamageReduction(player) {
    return (player.upgrades['shield'] || 0) * 0.05; // 5% per level
}

// Final damage calculation
function calculateFinalDamageTaken(player, enemyDamage) {
    // Step 1: Apply defense (flat reduction)
    let damage = enemyDamage - player.defense;
    damage = Math.max(1, damage);
    
    // Step 2: Apply damage reduction (percentage)
    const reduction = calculateDamageReduction(player);
    damage = damage * (1 - reduction);
    
    return Math.ceil(damage);
}

// Contoh:
// Enemy damage: 30
// Player defense: 10, damage reduction: 10% (Shield Lv.2)
// Step 1: 30 - 10 = 20
// Step 2: 20 × 0.90 = 18
// Final damage: 18 HP
```

### 7.5B.5 Shop Items - Upgrade Khusus

| Item | Efek | Harga | Max Lv | Deskripsi |
|------|------|-------|--------|-----------|
| **❤️‍🔥 Lifesteal Lv.1** | Heal 10% damage | 💰 100 | 3 | Heal saat damage musuh |
| **❤️‍🔥 Lifesteal Lv.2** | Heal 15% damage | 💰 200 | 3 | Lebih banyak heal |
| **❤️‍🔥 Lifesteal Lv.3** | Heal 20% damage | 💰 300 | 3 | Maximum lifesteal |
| **🧲 Magnet Lv.1** | Pickup Range +50% | 💰 50 | 3 | Auto-collect lebih jauh |
| **🧲 Magnet Lv.2** | Pickup Range +50% | 💰 100 | 3 | Jangkauan lebih jauh |
| **🧲 Magnet Lv.3** | Pickup Range +50% | 💰 150 | 3 | Jangkauan maksimal |
| **⭐ XP Boost** | XP Gain +20% | 💰 40 | 5 | Level lebih cepat |
| **💥 Crit Chance +10%** | Critical hit rate | 💰 80 | 5 | 10% → 50% crit chance |
| **💥 Crit Damage +50%** | Crit multiplier | 💰 120 | 3 | 1.5x → 3x crit damage |
| **💚 HP Regen Lv.1** | Regen 2 HP/detik | 💰 90 | 5 | Healing pasif |
| **💚 HP Regen Lv.2** | Regen 4 HP/detik | 💰 180 | 5 | Lebih cepat |
| **💚 HP Regen Lv.3-5** | Regen +2 HP/detik | 💰 270+ | 5 | Sustain lebih baik |
| **💀 Extra Life** | Revive 1x (50% HP) | 💰 500 | 1 | Nyawa tambahan (1x/run) |
| **🔥 Area Damage +25%** | AoE bonus | 💰 110 | 5 | Damage area lebih besar |

**Lifesteal Implementation:**
```javascript
// Saat player damage musuh
function applyLifesteal(player, damageDealt) {
    const lifestealPercent = (player.upgrades['lifesteal'] || 0) * 0.10;
    const healAmount = damageDealt * lifestealPercent;
    
    player.hp = Math.min(player.maxHp, player.hp + healAmount);
}

// Contoh:
// Damage dealt: 50
// Lifesteal Lv.2: 15%
// Heal: 50 × 0.15 = 7.5 HP
```

**Critical Hit Implementation:**
```javascript
function calculateCriticalHit(player, baseDamage) {
    const critChance = (player.upgrades['crit_chance'] || 0) * 0.10;
    const critMultiplier = 1.5 + ((player.upgrades['crit_damage'] || 0) * 0.50);
    
    const isCritical = Math.random() < critChance;
    
    if (isCritical) {
        return {
            damage: baseDamage * critMultiplier,
            isCritical: true
        };
    }
    
    return {
        damage: baseDamage,
        isCritical: false
    };
}

// Contoh:
// Base damage: 50
// Crit chance: 30% (Lv.3)
// Crit damage: 2.0x (Lv.1)
// Result: 30% chance deal 100 damage, 70% chance deal 50 damage
```

### 7.5B.6 Shop UI Implementation

**HTML Structure:**
```html
<div id="shopScreen" class="screen hidden">
    <div class="shop-header">
        <h1>🛒 Toko Senjata & Armor</h1>
        <div class="shop-coins">
            <span class="coin-icon">💰</span>
            <span id="shopCoinCount">125</span>
        </div>
        <button id="closeShopBtn" class="close-btn">✕</button>
    </div>
    
    <div class="shop-tabs">
        <button class="tab-btn active" data-tab="weapons">⚔️ Senjata</button>
        <button class="tab-btn" data-tab="armor">🛡️ Armor</button>
        <button class="tab-btn" data-tab="special">⭐ Khusus</button>
    </div>
    
    <div class="shop-container">
        <div class="shop-grid" id="shopGrid">
            <!-- Items akan di-render di sini oleh JavaScript -->
        </div>
    </div>
    
    <div class="shop-footer">
        <p class="shop-info">💡 Klik item untuk melihat detail & beli</p>
        <p class="shop-hint">Tekan [B] atau [ESC] untuk tutup toko</p>
    </div>
</div>

<!-- Purchase Confirmation Modal -->
<div id="purchaseConfirmation" class="modal hidden">
    <div class="modal-content shop-modal">
        <h2>Konfirmasi Pembelian</h2>
        <div class="item-preview">
            <div class="item-icon" id="confirmItemIcon">⚔️</div>
            <div class="item-info">
                <div class="item-name" id="confirmItemName">Upgrade Pedang</div>
                <div class="item-effect" id="confirmItemEffect">Damage +20%</div>
                <div class="item-price" id="confirmItemPrice">💰 50</div>
                <div class="item-level" id="confirmItemLevel">Level: 0 → 1</div>
            </div>
        </div>
        <div class="modal-buttons">
            <button id="confirmPurchase" class="modal-btn confirm">✅ BELI</button>
            <button id="cancelPurchase" class="modal-btn cancel">❌ BATAL</button>
        </div>
    </div>
</div>
```

**CSS Styles:**
```css
/* Shop Screen Styles */
#shopScreen {
    background: rgba(0, 0, 0, 0.9);
    overflow-y: auto;
}

.shop-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 25px 50px;
    background: linear-gradient(90deg, #FBBF24 0%, #F59E0B 100%);
    border-bottom: 3px solid #D97706;
}

.shop-header h1 {
    color: #000;
    font-size: 32px;
    text-shadow: none;
}

.shop-coins {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 28px;
    font-weight: bold;
    color: #000;
}

.coin-icon {
    font-size: 32px;
}

.shop-tabs {
    display: flex;
    gap: 15px;
    padding: 20px 50px;
    background: rgba(0, 0, 0, 0.6);
    border-bottom: 2px solid #FBBF24;
}

.tab-btn {
    padding: 15px 35px;
    font-size: 20px;
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid #FBBF24;
    border-radius: 10px;
    color: #FFF;
    cursor: pointer;
    transition: all 0.3s;
    font-weight: bold;
}

.tab-btn:hover {
    background: rgba(251, 191, 36, 0.2);
}

.tab-btn.active {
    background: #FBBF24;
    color: #000;
    box-shadow: 0 0 20px rgba(251, 191, 36, 0.5);
}

.shop-container {
    padding: 30px 50px;
}

.shop-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 25px;
    max-height: 60vh;
    overflow-y: auto;
}

.shop-item-card {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%);
    border: 2px solid #FBBF24;
    border-radius: 15px;
    padding: 25px;
    cursor: pointer;
    transition: all 0.3s;
    position: relative;
}

.shop-item-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 15px 40px rgba(251, 191, 36, 0.5);
    border-color: #FCD34D;
}

.shop-item-card.cannot-afford {
    opacity: 0.4;
    border-color: #6B7280;
    cursor: not-allowed;
}

.shop-item-card.cannot-afford:hover {
    transform: none;
    box-shadow: none;
}

.shop-item-card.max-level {
    border-color: #22C55E;
    background: linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.1) 100%);
}

.shop-item-icon {
    font-size: 56px;
    text-align: center;
    margin-bottom: 15px;
}

.shop-item-name {
    font-size: 22px;
    font-weight: bold;
    color: #FBBF24;
    margin-bottom: 8px;
    text-align: center;
}

.shop-item-description {
    font-size: 15px;
    color: #DDD;
    margin-bottom: 12px;
    text-align: center;
    min-height: 40px;
}

.shop-item-price {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 20px;
    font-weight: bold;
    color: #FBBF24;
    margin-bottom: 8px;
}

.shop-item-level {
    font-size: 13px;
    color: #888;
    text-align: center;
}

.shop-item-card.max-level .shop-item-level {
    color: #22C55E;
    font-weight: bold;
}

.shop-footer {
    padding: 20px 50px;
    background: rgba(0, 0, 0, 0.6);
    border-top: 2px solid #FBBF24;
    text-align: center;
}

.shop-info {
    color: #FFF;
    font-size: 16px;
    margin-bottom: 10px;
}

.shop-hint {
    color: #888;
    font-size: 14px;
    font-style: italic;
}

/* Shop Modal Styles */
.shop-modal {
    background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%);
    border: 3px solid #FBBF24;
    min-width: 400px;
}

.item-preview {
    display: flex;
    gap: 20px;
    margin: 25px 0;
    padding: 20px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
}

.item-icon {
    font-size: 64px;
}

.item-info {
    flex: 1;
}

.item-name {
    font-size: 24px;
    font-weight: bold;
    color: #FBBF24;
    margin-bottom: 10px;
}

.item-effect {
    font-size: 16px;
    color: #DDD;
    margin-bottom: 10px;
}

.item-price {
    font-size: 22px;
    font-weight: bold;
    color: #FBBF24;
    margin-bottom: 5px;
}

.item-level {
    font-size: 14px;
    color: #888;
}
```

### 7.5B.7 Shop Logic JavaScript

**Shop Data Structure:**
```javascript
const SHOP_ITEMS = {
    weapons: [
        {
            id: 'sword_upgrade',
            name: 'Upgrade Pedang',
            icon: '⚔️',
            description: 'Damage +20% per level',
            basePrice: 50,
            priceScaling: 1.5,
            maxLevel: 5,
            category: 'weapon',
            weaponType: 'basic_sword',
            effect: (level) => ({ damageMultiplier: 0.20 })
        },
        {
            id: 'bow_upgrade',
            name: 'Upgrade Busur',
            icon: '🏹',
            description: 'Damage +20%, +1 projectile di Lv.3',
            basePrice: 60,
            priceScaling: 1.6,
            maxLevel: 5,
            category: 'weapon',
            weaponType: 'arrow_bow',
            effect: (level) => ({ damageMultiplier: 0.20 })
        },
        {
            id: 'magic_orb_upgrade',
            name: 'Upgrade Orb Sihir',
            icon: '🔮',
            description: 'Damage +20%, faster homing',
            basePrice: 55,
            priceScaling: 1.5,
            maxLevel: 5,
            category: 'weapon',
            weaponType: 'magic_orb',
            effect: (level) => ({ damageMultiplier: 0.20 })
        },
        {
            id: 'new_fire_wand',
            name: 'Tongkat Api',
            icon: '🔥',
            description: 'Senjata baru - AoE damage over time',
            basePrice: 200,
            priceScaling: 1.8,
            maxLevel: 5,
            category: 'weapon',
            weaponType: 'fire_wand',
            isNewWeapon: true,
            effect: (level) => ({ damage: 12 })
        },
        {
            id: 'new_lightning_rod',
            name: 'Tongkat Petir',
            icon: '⚡',
            description: 'Senjata baru - Chain lightning ke 3 musuh',
            basePrice: 220,
            priceScaling: 1.8,
            maxLevel: 5,
            category: 'weapon',
            weaponType: 'lightning_rod',
            isNewWeapon: true,
            effect: (level) => ({ damage: 9 })
        },
        {
            id: 'new_ice_staff',
            name: 'Tongkat Es',
            icon: '❄️',
            description: 'Senjata baru - Slow enemies 30%',
            basePrice: 180,
            priceScaling: 1.8,
            maxLevel: 5,
            category: 'weapon',
            weaponType: 'ice_staff',
            isNewWeapon: true,
            effect: (level) => ({ damage: 7 })
        }
    ],
    armor: [
        {
            id: 'armor_upgrade',
            name: 'Upgrade Armor',
            icon: '🛡️',
            description: 'Defense +5 per level (reduce damage)',
            basePrice: 80,
            priceScaling: 1.4,
            maxLevel: 10,
            category: 'armor',
            effect: (level) => ({ defense: 5 })
        },
        {
            id: 'shield_upgrade',
            name: 'Upgrade Shield',
            icon: '🔰',
            description: 'Damage Reduction +5% per level',
            basePrice: 70,
            priceScaling: 1.5,
            maxLevel: 5,
            category: 'armor',
            effect: (level) => ({ damageReduction: 0.05 })
        },
        {
            id: 'boots_upgrade',
            name: 'Upgrade Boots',
            icon: '👢',
            description: 'Movement Speed +10% per level',
            basePrice: 45,
            priceScaling: 1.4,
            maxLevel: 5,
            category: 'armor',
            effect: (level) => ({ speedMultiplier: 0.10 })
        },
        {
            id: 'helmet_upgrade',
            name: 'Upgrade Helmet',
            icon: '⛑️',
            description: 'Max HP +20 per level',
            basePrice: 60,
            priceScaling: 1.4,
            maxLevel: 10,
            category: 'armor',
            effect: (level) => ({ maxHp: 20 })
        }
    ],
    special: [
        {
            id: 'lifesteal',
            name: 'Lifesteal',
            icon: '❤️‍🔥',
            description: 'Heal 10% damage dealt per level',
            basePrice: 100,
            priceScaling: 2,
            maxLevel: 3,
            category: 'special',
            effect: (level) => ({ lifesteal: 0.10 })
        },
        {
            id: 'magnet',
            name: 'Magnet',
            icon: '🧲',
            description: 'Pickup Range +50% per level',
            basePrice: 50,
            priceScaling: 1.5,
            maxLevel: 3,
            category: 'special',
            effect: (level) => ({ pickupRangeMultiplier: 0.50 })
        },
        {
            id: 'xp_boost',
            name: 'XP Boost',
            icon: '⭐',
            description: 'XP Gain +20% per level',
            basePrice: 40,
            priceScaling: 1.5,
            maxLevel: 5,
            category: 'special',
            effect: (level) => ({ xpMultiplier: 0.20 })
        },
        {
            id: 'crit_chance',
            name: 'Critical Chance',
            icon: '💥',
            description: 'Critical Hit Chance +10% per level',
            basePrice: 80,
            priceScaling: 1.6,
            maxLevel: 5,
            category: 'special',
            effect: (level) => ({ critChance: 0.10 })
        },
        {
            id: 'crit_damage',
            name: 'Critical Damage',
            icon: '💢',
            description: 'Critical Damage +50% per level',
            basePrice: 120,
            priceScaling: 1.7,
            maxLevel: 3,
            category: 'special',
            effect: (level) => ({ critMultiplier: 0.50 })
        },
        {
            id: 'hp_regen',
            name: 'HP Regeneration',
            icon: '💚',
            description: 'Regenerate 2 HP per second per level',
            basePrice: 90,
            priceScaling: 1.6,
            maxLevel: 5,
            category: 'special',
            effect: (level) => ({ hpRegen: 2 })
        },
        {
            id: 'extra_life',
            name: 'Extra Life',
            icon: '💀',
            description: 'Revive once with 50% HP when you die',
            basePrice: 500,
            priceScaling: 1,
            maxLevel: 1,
            category: 'special',
            effect: (level) => ({ extraLife: true })
        },
        {
            id: 'area_damage',
            name: 'Area Damage',
            icon: '🔥',
            description: 'AoE Damage +25% per level',
            basePrice: 110,
            priceScaling: 1.5,
            maxLevel: 5,
            category: 'special',
            effect: (level) => ({ areaDamageMultiplier: 0.25 })
        }
    ]
};
```

**Shop Functions:**
```javascript
let currentShopTab = 'weapons';
let pendingPurchase = null;

function openShop() {
    gamePaused = true;
    currentState = 'shop';
    
    // Show shop screen
    hideAllScreens();
    document.getElementById('shopScreen').classList.remove('hidden');
    
    // Update coin display
    updateShopCoinDisplay();
    
    // Render items
    renderShopItems();
    
    // Setup event listeners
    setupShopEventListeners();
}

function closeShop() {
    gamePaused = false;
    currentState = 'playing';
    
    // Hide shop screen
    document.getElementById('shopScreen').classList.add('hidden');
    
    // Remove event listeners
    removeShopEventListeners();
}

function updateShopCoinDisplay() {
    document.getElementById('shopCoinCount').textContent = player.coins;
}

function renderShopItems() {
    const grid = document.getElementById('shopGrid');
    grid.innerHTML = '';
    
    const items = SHOP_ITEMS[currentShopTab];
    
    items.forEach(item => {
        const currentLevel = player.upgrades[item.id] || 0;
        const price = Math.floor(item.basePrice * Math.pow(item.priceScaling, currentLevel));
        const canAfford = player.coins >= price;
        const isMaxLevel = currentLevel >= item.maxLevel;
        
        // Check if player already has this weapon (for new weapons)
        if (item.isNewWeapon && player.weapons.find(w => w.type === item.weaponType)) {
            return; // Don't show if already owned
        }
        
        const card = document.createElement('div');
        card.className = `shop-item-card ${!canAfford && !isMaxLevel ? 'cannot-afford' : ''} ${isMaxLevel ? 'max-level' : ''}`;
        
        card.innerHTML = `
            <div class="shop-item-icon">${item.icon}</div>
            <div class="shop-item-name">${item.name}</div>
            <div class="shop-item-description">${item.description}</div>
            <div class="shop-item-price">
                ${isMaxLevel ? '✅ MAX LEVEL' : `💰 ${price}`}
            </div>
            <div class="shop-item-level">
                ${isMaxLevel ? 'Sudah maksimal' : `Level: ${currentLevel}/${item.maxLevel}`}
            </div>
        `;
        
        if (!isMaxLevel && canAfford) {
            card.addEventListener('click', () => showPurchaseConfirmation(item, price, currentLevel));
        }
        
        grid.appendChild(card);
    });
}

function showPurchaseConfirmation(item, price, currentLevel) {
    pendingPurchase = { item, price, currentLevel };
    
    const modal = document.getElementById('purchaseConfirmation');
    modal.classList.remove('hidden');
    
    document.getElementById('confirmItemIcon').textContent = item.icon;
    document.getElementById('confirmItemName').textContent = item.name;
    document.getElementById('confirmItemEffect').textContent = item.description;
    document.getElementById('confirmItemPrice').textContent = `💰 ${price}`;
    document.getElementById('confirmItemLevel').textContent = `Level: ${currentLevel} → ${currentLevel + 1}`;
    
    document.getElementById('confirmPurchase').onclick = () => {
        completePurchase();
        modal.classList.add('hidden');
    };
    
    document.getElementById('cancelPurchase').onclick = () => {
        pendingPurchase = null;
        modal.classList.add('hidden');
    };
}

function completePurchase() {
    if (!pendingPurchase) return;
    
    const { item, price, currentLevel } = pendingPurchase;
    
    if (player.coins < price) {
        alert('❌ Koin tidak cukup!');
        return;
    }
    
    // Deduct coins
    player.coins -= price;
    
    // Apply upgrade
    player.upgrades[item.id] = currentLevel + 1;
    applyShopUpgrade(item, currentLevel + 1);
    
    // If new weapon, add to player weapons
    if (item.isNewWeapon) {
        player.weapons.push(createWeapon(item.weaponType));
    }
    
    // Update UI
    updateShopCoinDisplay();
    renderShopItems();
    
    // Play sound
    playShopPurchaseSound();
    
    // Show notification
    showNotification(`✅ ${item.name} upgraded to Lv.${currentLevel + 1}!`);
    
    pendingPurchase = null;
}

function applyShopUpgrade(item, level) {
    const effect = item.effect(level);
    
    if (effect.damageMultiplier) {
        const weapon = player.weapons.find(w => w.type === item.weaponType);
        if (weapon) {
            weapon.damage *= (1 + effect.damageMultiplier);
        }
    }
    
    if (effect.defense) {
        player.defense += effect.defense;
    }
    
    if (effect.damageReduction) {
        player.damageReduction = (player.damageReduction || 0) + effect.damageReduction;
    }
    
    if (effect.speedMultiplier) {
        player.speed *= (1 + effect.speedMultiplier);
    }
    
    if (effect.maxHp) {
        player.maxHp += effect.maxHp;
        player.hp += effect.maxHp; // Also heal the amount gained
    }
    
    if (effect.lifesteal) {
        player.lifesteal = (player.lifesteal || 0) + effect.lifesteal;
    }
    
    if (effect.pickupRangeMultiplier) {
        player.pickupRange *= (1 + effect.pickupRangeMultiplier);
    }
    
    if (effect.xpMultiplier) {
        player.xpMultiplier = (player.xpMultiplier || 1) + effect.xpMultiplier;
    }
    
    if (effect.critChance) {
        player.critChance = (player.critChance || 0) + effect.critChance;
    }
    
    if (effect.critMultiplier) {
        player.critMultiplier = (player.critMultiplier || 1.5) + effect.critMultiplier;
    }
    
    if (effect.hpRegen) {
        player.hpRegen = (player.hpRegen || 0) + effect.hpRegen;
    }
    
    if (effect.extraLife) {
        player.hasExtraLife = true;
    }
    
    if (effect.areaDamageMultiplier) {
        player.areaDamageMultiplier = (player.areaDamageMultiplier || 1) + effect.areaDamageMultiplier;
    }
}

function setupShopEventListeners() {
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentShopTab = btn.dataset.tab;
            renderShopItems();
        };
    });
    
    // Close shop
    document.getElementById('closeShopBtn').onclick = closeShop;
    
    // Keyboard shortcut
    window.addEventListener('keydown', handleShopKeyDown);
}

function removeShopEventListeners() {
    window.removeEventListener('keydown', handleShopKeyDown);
}

function handleShopKeyDown(e) {
    if (e.key === 'b' || e.key === 'B' || e.key === 'Escape') {
        closeShop();
    }
}

function createWeapon(weaponType) {
    const weaponData = {
        basic_sword: { name: 'Pedang Dasar', damage: 10, attackSpeed: 1.0, range: 60 },
        arrow_bow: { name: 'Busur Panah', damage: 15, attackSpeed: 0.6, range: 400 },
        magic_orb: { name: 'Orb Sihir', damage: 8, attackSpeed: 0.8, range: 300 },
        fire_wand: { name: 'Tongkat Api', damage: 12, attackSpeed: 0.5, range: 250 },
        lightning_rod: { name: 'Tongkat Petir', damage: 9, attackSpeed: 0.9, range: 200 },
        ice_staff: { name: 'Tongkat Es', damage: 7, attackSpeed: 0.7, range: 280 }
    };
    
    const data = weaponData[weaponType];
    return {
        type: weaponType,
        name: data.name,
        damage: data.damage,
        attackSpeed: data.attackSpeed,
        range: data.range,
        level: 1
    };
}
```

### 7.5B.8 Shop Restock System (Opsional)

**Shop restock setiap 5 wave untuk variasi:**
```javascript
let shopRestocked = false;

function checkShopRestock() {
    // Restock setiap 5 wave
    if (currentWave > 1 && currentWave % 5 === 0 && !shopRestocked) {
        restockShop();
        shopRestocked = true;
        showNotification('🛒 Toko telah di-restock! Item baru tersedia!');
    }
    
    // Reset flag saat wave bukan kelipatan 5
    if (currentWave % 5 !== 0) {
        shopRestocked = false;
    }
}

function restockShop() {
    // Tambah diskon 20% untuk semua item
    // Atau unlock special items
    // Atau tambah item baru
}
```

### 7.5B.9 Shop Strategy Tips

**Rekomendasi untuk pemain:**

**Early Game (Wave 1-5):**
1. ⚔️ Upgrade senjata utama (damage +20%)
2. 🛡️ Armor Lv.1-2 (defense +5-10)
3. 💚 HP Regen Lv.1 (sustain)
4. **Total biaya:** ~200-300 koin

**Mid Game (Wave 6-15):**
1. ⚔️ Max out senjata utama (sampai Lv.3-4)
2. 🛡️ Shield Lv.1-2 (damage reduction)
3. ❤️‍🔥 Lifesteal Lv.1-2 (healing)
4. 👢 Boots Lv.1-2 (mobility)
5. **Total biaya:** ~500-800 koin

**Late Game (Wave 16+):**
1. ⚔️ Max semua senjata (Lv.5)
2. 🛡️ Max armor & shield
3. 💥 Critical hit upgrades
4. 💀 Extra life (jika belum)
5. **Total biaya:** ~1500-2000 koin

**Priority Purchase Order:**
```
Priority 1: Weapon damage (kill lebih cepat)
Priority 2: Armor/Defense (survive lebih lama)
Priority 3: Lifesteal/HP Regen (sustain)
Priority 4: Movement speed (dodge easier)
Priority 5: Critical hit/area damage (burst)
Priority 6: Extra life (insurance)
```

**Tips Hemat Koin:**
- Jangan boros di early game, save untuk upgrade penting
- Fokus upgrade 1-2 senjata dulu, bukan semua
- Armor lebih penting dari offense di awal
- Lifesteal sangat worth it di mid-late game
- Extra life hanya beli jika sering mati di boss

---

## 7.6 Apply Upgrade (Level Up System)

**Saat pemain pilih upgrade:**
```javascript
function applyUpgrade(upgrade) {
    switch(upgrade.type) {
        case 'weapon_upgrade':
            upgradeWeapon(upgrade);
            break;
        case 'new_weapon':
            addNewWeapon(upgrade);
            break;
        case 'stat_upgrade':
            upgradeStat(upgrade);
            break;
    }
    
    // Resume game
    gamePaused = false;
    hideLevelUpScreen();
}

function upgradeWeapon(upgrade) {
    const weapon = player.weapons.find(w => w.type === upgrade.weaponType);
    if (weapon) {
        weapon.level++;
        weapon.damage *= 1.2; // +20% damage
        
        if (weapon.level === 3) {
            weapon.projectileCount++; // +1 projectile
        }
        
        if (weapon.level === 4) {
            addSpecialEffect(weapon);
        }
        
        if (weapon.level === 5) {
            weapon.damage *= 1.4; // +40% more damage
            weapon.visualUpgrade = true;
        }
    }
}

function upgradeStat(upgrade) {
    const statId = upgrade.statId;
    player.upgrades[statId] = (player.upgrades[statId] || 0) + 1;
    
    switch(statId) {
        case 'max_hp':
            player.maxHp += 20;
            player.hp += 20;
            break;
        case 'damage':
            player.baseDamage *= 1.2;
            break;
        case 'attack_speed':
            player.attackSpeed *= 1.15;
            break;
        case 'speed':
            player.speed *= 1.1;
            break;
        case 'defense':
            player.defense += 5;
            break;
        // ... dst
    }
}
```

---

## 8. Sistem Skor

### 8.1 Score Calculation

**Cara dapat skor:**
```javascript
function calculateScore() {
    // Kill score
    killScore = 0;
    enemiesKilled.forEach(enemy => {
        killScore += Math.floor(enemy.maxHp / 2);
    });
    
    // Survival score
    survivalScore = Math.floor(survivalTime); // 1 poin per detik
    
    // Boss bonus
    bossBonus = bossesDefeated.reduce((sum, boss) => {
        return sum + boss.maxHp;
    }, 0);
    
    // Total score
    totalScore = killScore + survivalScore + bossBonus;
    
    return totalScore;
}
```

**Contoh:**
- Kill 100 musuh (rata-rata 30 HP): 100 × 15 = **1500 poin**
- Selamat 600 detik (10 menit): **600 poin**
- Kill 2 boss (300 + 500 HP): **800 poin**
- **Total: 2900 poin**

### 8.2 High Score System

**Simpan Top 10 Scores:**
```javascript
function saveHighScore(score, time, wave, level, difficulty, character) {
    const highScores = loadHighScores();
    
    highScores.push({
        score: score,
        time: time,
        wave: wave,
        level: level,
        difficulty: difficulty,
        character: character,
        date: new Date().toISOString()
    });
    
    // Sort by score (descending)
    highScores.sort((a, b) => b.score - a.score);
    
    // Keep top 10
    highScores.splice(10);
    
    // Save to localStorage
    localStorage.setItem('survivalGameHighScores', JSON.stringify(highScores));
    
    return highScores.findIndex(s => s.score === score) < 10; // isNewHighScore
}
```

**High Score Display:**
```
┌──────────────────────────────────────┐
│       🏆 HIGH SCORES 🏆              │
├────┬────────┬──────┬─────┬───────────┤
│ #  │ Score  │ Wave │ Lv  │ Tanggal   │
├────┼────────┼──────┼─────┼───────────┤
│ 1  │ 5200   │  18  │ 25  │ 2026-04-01│
│ 2  │ 4800   │  16  │ 22  │ 2026-04-02│
│ 3  │ 4100   │  14  │ 20  │ 2026-04-03│
│... │        │      │     │           │
└────┴────────┴──────┴─────┴───────────┘
```

---

## 9. HUD (Heads-Up Display)

### 9.1 Layout HUD

```
┌────────────────────────────────────────────────────────┐
│ ❤️ 100/100    ⭐ Lv.12    ⬛░░░░░ 250/400 XP            │
│                                                        │
│                                    Skor: 1500  Wave: 8 │
│                                    05:23               │
│                                                        │
│                                                        │
│                     GAME AREA                          │
│                                                        │
│                                                        │
│                                                        │
│                                                        │
│  ┌──────┐ ┌──────┐ ┌──────┐                           │
│  │ ⚔️ Lv3│ │ 🔮 Lv2│ │      │                           │
│  └──────┘ └──────┘ └──────┘                           │
└────────────────────────────────────────────────────────┘
```

### 9.2 HUD Elements

**Top-Left:**
```javascript
// Health Bar
drawHealthBar(x, y, width, height) {
    const healthPercent = player.hp / player.maxHp;
    
    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    roundRect(ctx, x, y, width, height, 5);
    ctx.fill();
    
    // Health fill
    const gradient = ctx.createLinearGradient(x, y, x + width * healthPercent, y);
    gradient.addColorStop(0, '#FF4444');
    gradient.addColorStop(1, '#44FF44');
    ctx.fillStyle = gradient;
    roundRect(ctx, x, y, width * healthPercent, height, 5);
    ctx.fill();
    
    // Text
    ctx.fillStyle = '#FFF';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.ceil(player.hp)}/${player.maxHp}`, x + width/2, y + height/2 + 5);
}

// Level Indicator
drawLevelIndicator(x, y) {
    ctx.fillStyle = '#FBBF24';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`⭐ Lv.${player.level}`, x, y);
}

// XP Bar
drawXpBar(x, y, width, height) {
    const xpPercent = player.xp / getXpForNextLevel(player.level);
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    roundRect(ctx, x, y, width, height, 5);
    ctx.fill();
    
    ctx.fillStyle = '#8B5CF6';
    roundRect(ctx, x, y, width * xpPercent, height, 5);
    ctx.fill();
    
    ctx.fillStyle = '#FFF';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${player.xp}/${getXpForNextLevel(player.level)} XP`, x + width/2, y + height/2 + 4);
}
```

**Top-Right:**
```javascript
// Score
drawScore(x, y) {
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(`Skor: ${score}`, x, y);
}

// Wave
drawWave(x, y) {
    ctx.fillStyle = '#00FFFF';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(`Wave: ${currentWave}`, x, y + 25);
}

// Timer
drawTimer(x, y) {
    const minutes = Math.floor(survivalTime / 60);
    const seconds = Math.floor(survivalTime % 60);
    const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 22px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(timeStr, x, y + 55);
}
```

**Bottom-Center (Weapon Display):**
```javascript
drawWeaponDisplay(x, y) {
    player.weapons.forEach((weapon, index) => {
        const weaponX = x + index * 80;
        
        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        roundRect(ctx, weaponX, y, 70, 50, 10);
        ctx.fill();
        
        // Weapon icon
        drawWeaponIcon(weaponX + 35, y + 20, weapon.type);
        
        // Level
        ctx.fillStyle = '#FBBF24';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Lv.${weapon.level}`, weaponX + 35, y + 42);
    });
}
```

### 9.3 Boss HP Bar

**Saat boss fight, tampilkan HP bar besar di atas:**
```javascript
drawBossHpBar(boss) {
    const width = 400;
    const height = 30;
    const x = (canvas.width - width) / 2;
    const y = 60;
    
    const hpPercent = boss.hp / boss.maxHp;
    
    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    roundRect(ctx, x - 5, y - 5, width + 10, height + 35, 10);
    ctx.fill();
    
    // Boss name
    ctx.fillStyle = '#FBBF24';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(boss.name, canvas.width / 2, y + 10);
    
    // HP bar background
    ctx.fillStyle = '#374151';
    roundRect(ctx, x, y + 15, width, height, 5);
    ctx.fill();
    
    // HP bar fill
    const gradient = ctx.createLinearGradient(x, y, x + width * hpPercent, y);
    gradient.addColorStop(0, '#DC2626');
    gradient.addColorStop(1, '#FBBF24');
    ctx.fillStyle = gradient;
    roundRect(ctx, x, y + 15, width * hpPercent, height, 5);
    ctx.fill();
    
    // HP text
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 14px Arial';
    ctx.fillText(`${Math.ceil(boss.hp)}/${boss.maxHp}`, canvas.width / 2, y + 35);
}
```

---

## 10. Sistem Damage Numbers

### 10.1 Damage Number Display

**Saat musuh kena damage:**
```javascript
function showDamageNumber(x, y, damage, isCritical = false) {
    damageNumbers.push({
        x: x,
        y: y,
        value: Math.floor(damage),
        timer: 0.8, // 800ms
        vy: -50, // float up
        color: isCritical ? '#FBBF24' : '#FFF',
        size: isCritical ? 24 : 18,
        isCritical: isCritical
    });
}

function updateDamageNumbers(deltaTime) {
    damageNumbers.forEach((num, index) => {
        num.y += num.vy * deltaTime;
        num.timer -= deltaTime;
        
        if (num.timer <= 0) {
            damageNumbers.splice(index, 1);
        }
    });
}

function drawDamageNumbers() {
    damageNumbers.forEach(num => {
        ctx.fillStyle = num.color;
        ctx.font = `bold ${num.size}px Arial`;
        ctx.textAlign = 'center';
        ctx.globalAlpha = num.timer / 0.8; // fade out
        ctx.fillText(num.value, num.x, num.y);
        ctx.globalAlpha = 1;
    });
}
```

**Visual:**
- Damage numbers **float up** dan **fade out**
- **Critical hit**: Warna emas, ukuran lebih besar
- Muncul di atas posisi musuh

---

## 11. Sistem Warning & Notifications

### 11.1 Warning Text

**Tampilkan warning untuk event penting:**
```javascript
let activeWarnings = [];

function showWarningText(text, duration = 3) {
    activeWarnings.push({
        text: text,
        timer: duration,
        y: canvas.height / 2 - 100
    });
}

function updateWarnings(deltaTime) {
    activeWarnings.forEach((warning, index) => {
        warning.timer -= deltaTime;
        warning.y -= 20 * deltaTime; // float up
        
        if (warning.timer <= 0) {
            activeWarnings.splice(index, 1);
        }
    });
}

function drawWarnings() {
    activeWarnings.forEach(warning => {
        ctx.fillStyle = '#FBBF24';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.globalAlpha = Math.min(1, warning.timer);
        ctx.fillText(warning.text, canvas.width / 2, warning.y);
        ctx.globalAlpha = 1;
    });
}
```

**Contoh Warning:**
- "🔥 Naga Gelap menyemburkan api!"
- "💀 Dewa Kematian teleport!"
- "⚠ Raja Tengkorak memanggil bala bantuan!"
- "⏰ Wave 5 selesai! Istirahat 10 detik..."

### 11.2 Wave Notification

**Wave transition:**
```javascript
function showWaveTransition(oldWave, newWave) {
    // Fade to black
    showOverlayScreen('rgba(0, 0, 0, 0.7)', 1);
    
    // Show text
    if (newWave % 5 === 0) {
        showWarningText(`⚠️ BOSS WAVE ${newWave}! ⚠️`, 3);
    } else {
        showWarningText(`Wave ${newWave}`, 2);
    }
    
    // Show rest timer
    if (isRestPhase) {
        showRestTimer(10); // countdown 10 detik
    }
}
```

---

## 12. Game States

### 12.1 State Machine

```javascript
const GAME_STATES = {
    MENU: 'menu',
    CHARACTER_SELECT: 'character_select',
    COUNTDOWN: 'countdown',
    PLAYING: 'playing',
    WAVE_REST: 'wave_rest', // 10 detik istirahat
    LEVEL_UP: 'level_up', // pause untuk pilih upgrade
    BOSS_FIGHT: 'boss_fight',
    GAME_OVER: 'game_over',
    PAUSED: 'paused'
};

let currentState = GAME_STATES.MENU;

function updateGameState(deltaTime) {
    switch(currentState) {
        case GAME_STATES.PLAYING:
            updatePlayer();
            updateEnemies();
            updateProjectiles();
            updateXpOrbs();
            checkCollisions();
            updateWaveTimer();
            break;
            
        case GAME_STATES.WAVE_REST:
            updateRestTimer();
            break;
            
        case GAME_STATES.LEVEL_UP:
            // Game paused, waiting for player input
            break;
            
        case GAME_STATES.BOSS_FIGHT:
            updateBossAbilities();
            updatePlayer();
            updateEnemies(); // only boss
            updateProjectiles();
            checkCollisions();
            break;
            
        case GAME_STATES.GAME_OVER:
            // Show game over screen
            break;
            
        case GAME_STATES.PAUSED:
            // Game paused, waiting for resume
            break;
    }
}
```

### 12.2 State Transitions

```
MENU → CHARACTER_SELECT (klik PLAY)
CHARACTER_SELECT → COUNTDOWN (pilih karakter + klik START)
COUNTDOWN → PLAYING (setelah 3-2-1)
PLAYING → WAVE_REST (wave selesai)
WAVE_REST → PLAYING (istirahat selesai, wave baru)
PLAYING → LEVEL_UP (XP cukup)
LEVEL_UP → PLAYING (pilih upgrade)
PLAYING → BOSS_FIGHT (wave kelipatan 5)
BOSS_FIGHT → WAVE_REST (boss mati)
PLAYING → GAME_OVER (HP = 0)
BOSS_FIGHT → GAME_OVER (HP = 0)
PLAYING → PAUSED (tekan SPACE)
PAUSED → PLAYING (tekan SPACE lagi)
PAUSED → MENU (klik Main Menu)
GAME_OVER → MENU (klik Main Menu)
GAME_OVER → CHARACTER_SELECT (klik Play Again)
```

---

## 13. Game Balance

### 13.1 Expected Progression

**Early Game (Wave 1-5):**
```
Wave 1:  100 HP, 10 damage, 1 weapon
Wave 2:  ~150 HP, 12 damage, dapat weapon ke-2
Wave 3:  ~200 HP, 15 damage, beberapa upgrade
Wave 4:  ~250 HP, 18 damage
Wave 5:  ~300 HP, 20 damage, BOSS FIGHT (easy)
```

**Mid Game (Wave 6-15):**
```
Wave 6:   ~350 HP, 25 damage, 3 weapons complete
Wave 8:   ~450 HP, 35 damage
Wave 10:  ~600 HP, 50 damage, BOSS FIGHT (medium)
Wave 12:  ~750 HP, 65 damage
Wave 15:  ~900 HP, 80 damage, BOSS FIGHT (hard)
```

**Late Game (Wave 16+):**
```
Wave 20:  ~1200 HP, 120 damage, BOSS FIGHT (very hard)
Wave 25:  ~1500 HP, 150 damage
Wave 30:  ~2000 HP, 200+ damage
```

### 13.2 Difficulty Curve

**Player Power vs Enemy Power:**
```
Wave
 1 │ Player ██████████░░░░░░░░░░ Enemy ███░░░░░░░░░░░░░░░░░░░
 5 │ Player ██████████████░░░░░░ Enemy ██████░░░░░░░░░░░░░░░░
10 │ Player ██████████████████░░ Enemy ██████████░░░░░░░░░░░░
15 │ Player ███████████████████░ Enemy ██████████████░░░░░░░░
20 │ Player ████████████████████ Enemy ████████████████░░░░░░
25 │ Player ████████████████████ Enemy ██████████████████░░░░
30 │ Player ████████████████████ Enemy ████████████████████░░
```

**Target:**
- Wave 1-5: Player merasa kuat (80% HP tersisa)
- Wave 6-10: Mulai tertekan (50-70% HP tersisa)
- Wave 11-15: Intens (20-50% HP tersisa)
- Wave 16+: Survival mode (<30% HP, bergantung healing)

### 13.3 Upgrade Balance

**Upgrade Power Scaling:**
```
Level 1-5:  Basic upgrades (+20% damage, +20 HP, dll)
Level 6-10: Mulai dapat upgrade signifikan
Level 11-15: Core build mulai terbentuk
Level 16-20: Build complete
Level 21+:  Min-maxing (pilih upgrade terbaik)
```

**Recommended Upgrade Priority:**
1. **Damage** → Kill lebih cepat
2. **Attack Speed** → DPS lebih tinggi
3. **Max HP** → Survival lebih lama
4. **Weapon baru** → Coverage lebih baik
5. **Movement Speed** → Dodge lebih mudah
6. **Defense/Regen** → Sustain

---

## 14. Visual Effects Detail

### 14.1 Player Effects

**Movement Trail:**
```javascript
let playerTrail = [];

function updatePlayerTrail() {
    playerTrail.push({
        x: player.x,
        y: player.y,
        timer: 0.3
    });
    
    // Keep last 10 positions
    if (playerTrail.length > 10) {
        playerTrail.shift();
    }
}

function drawPlayerTrail() {
    playerTrail.forEach((pos, index) => {
        const alpha = (index / playerTrail.length) * 0.3;
        ctx.fillStyle = player.colors.primary;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, player.width / 2, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1;
}
```

**Level Up Glow:**
```javascript
let levelUpGlow = {
    active: false,
    timer: 0,
    radius: 100
};

function activateLevelUpGlow() {
    levelUpGlow.active = true;
    levelUpGlow.timer = 2;
}

function drawLevelUpGlow() {
    if (!levelUpGlow.active) return;
    
    const alpha = levelUpGlow.timer / 2;
    const gradient = ctx.createRadialGradient(
        player.x, player.y, 0,
        player.x, player.y, levelUpGlow.radius
    );
    gradient.addColorStop(0, `rgba(255, 215, 0, ${alpha * 0.5})`);
    gradient.addColorStop(1, `rgba(255, 215, 0, 0)`);
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(player.x, player.y, levelUpGlow.radius, 0, Math.PI * 2);
    ctx.fill();
}
```

### 14.2 Projectile Effects

**Sword Slash:**
```javascript
function drawSlashEffect(slash) {
    ctx.save();
    ctx.translate(slash.x, slash.y);
    ctx.rotate(slash.angle);
    
    const alpha = slash.timer / slash.duration;
    
    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, slash.range, -slash.arc / 2, slash.arc / 2);
    ctx.stroke();
    
    ctx.restore();
}
```

**Magic Orb Trail:**
```javascript
function drawProjectileTrail(trail) {
    trail.forEach((pos, index) => {
        const alpha = pos.timer / 0.3;
        ctx.fillStyle = `rgba(6, 182, 212, ${alpha * 0.5})`;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 4 * alpha, 0, Math.PI * 2);
        ctx.fill();
    });
}
```

### 14.3 Enemy Death Animation

```javascript
function drawDyingEnemy(enemy) {
    const progress = 1 - (enemy.deathTimer / 0.3);
    const alpha = 1 - progress;
    const scale = 1 - progress * 0.5;
    
    ctx.save();
    ctx.translate(enemy.x, enemy.y);
    ctx.scale(scale, scale);
    ctx.globalAlpha = alpha;
    
    // Draw enemy normally
    drawEnemy(enemy);
    
    // Particle explosion
    for (let i = 0; i < 10; i++) {
        const angle = (Math.PI * 2 / 10) * i;
        const distance = progress * 40;
        const px = Math.cos(angle) * distance;
        const py = Math.sin(angle) * distance;
        
        ctx.fillStyle = enemy.color;
        ctx.globalAlpha = alpha * 0.8;
        ctx.beginPath();
        ctx.arc(px, py, 5 * (1 - progress), 0, Math.PI * 2);
        ctx.fill();
    }
    
    ctx.restore();
}
```

---

## 15. Audio Design

### 15.1 Sound Effects

**SFX List:**
| Sound | Trigger | Deskripsi |
|-------|---------|-----------|
| `sword_swing` | Sword attack | Whoosh pedang |
| `magic_cast` | Magic orb fire | Sihir cast |
| `arrow_fire` | Arrow shoot | Panah lepas |
| `enemy_hit` | Musuh kena damage | Thwack/thud |
| `enemy_death` | Musuh mati | Death sound pendek |
| `xp_collect` | XP orb collected | Ding lembut |
| `level_up` | Naik level | Fanfare pendek |
| `player_hit` | Player kena damage | Warning sound |
| `boss_spawn` | Boss muncul | Boom dramatis |
| `boss_ability` | Boss pakai ability | Warning sound |
| `boss_death` | Boss mati | Explosion besar |
| `wave_complete` | Wave selesai | Fanfare |
| `game_over` | Player mati | Game over melody |
| `ui_click` | Klik UI | Click pendek |
| `ui_hover` | Hover button | Soft click |

### 15.2 Music

| Music | Saat | Deskripsi |
|-------|------|-----------|
| `menu_music` | Main menu | Calm, relaxing |
| `game_music` | Gameplay | Upbeat, energetic |
| `boss_music` | Boss fight | Intense, dramatic |
| `level_up_jingle` | Level up | Celebratory |

---

## 16. Performance Optimization

### 16.1 Object Pooling

**Gunakan object pooling untuk:**
```javascript
// Enemy pool
const enemyPool = [];
const MAX_ENEMIES = 100;

function getEnemyFromPool() {
    for (let i = 0; i < enemyPool.length; i++) {
        if (!enemyPool[i].active) {
            enemyPool[i].active = true;
            return enemyPool[i];
        }
    }
    
    if (enemyPool.length < MAX_ENEMIES) {
        const enemy = createEnemy();
        enemyPool.push(enemy);
        return enemy;
    }
    
    return null; // Pool exhausted
}

// Projectile pool
const projectilePool = [];
const MAX_PROJECTILES = 50;

// XP orb pool
const xpOrbPool = [];
const MAX_XP_ORBS = 200;
```

### 16.2 Collision Detection Optimization

**Grid-based spatial partitioning:**
```javascript
const CELL_SIZE = 100; // piksel
let grid = {};

function updateGrid() {
    grid = {};
    
    // Insert enemies into grid
    enemies.forEach(enemy => {
        const cellX = Math.floor(enemy.x / CELL_SIZE);
        const cellY = Math.floor(enemy.y / CELL_SIZE);
        const key = `${cellX},${cellY}`;
        
        if (!grid[key]) grid[key] = [];
        grid[key].push(enemy);
    });
    
    // Only check collision with player's cell
    const playerCellX = Math.floor(player.x / CELL_SIZE);
    const playerCellY = Math.floor(player.y / CELL_SIZE);
    const playerKey = `${playerCellX},${playerCellY}`;
    
    const nearbyEnemies = grid[playerKey] || [];
    // Check collision only with nearby enemies
}
```

### 16.3 Render Optimization

**Cull off-screen objects:**
```javascript
function isInViewport(x, y, margin = 100) {
    return x > -margin && 
           x < canvas.width + margin && 
           y > -margin && 
           y < canvas.height + margin;
}

function render() {
    // Only draw objects in viewport
    enemies.forEach(enemy => {
        if (isInViewport(enemy.x, enemy.y)) {
            drawEnemy(enemy);
        }
    });
    
    projectiles.forEach(proj => {
        if (isInViewport(proj.x, proj.y, 50)) {
            drawProjectile(proj);
        }
    });
}
```

---

## 17. Checklist Fitur

### Phase 1: Core Mechanics
- [ ] Sistem XP (orb drop, collect, magnetize)
- [ ] Sistem level up (pause, show choices)
- [ ] Upgrade system (3-5 upgrade types)
- [ ] Auto-attack (nearest enemy targeting)
- [ ] Basic projectiles (arrow, orb)

### Phase 2: Weapon System
- [ ] 3 weapon types (sword, orb, bow)
- [ ] Weapon upgrade levels (1-5)
- [ ] Multi-weapon support (up to 3)
- [ ] Weapon-specific projectiles

### Phase 3: Enemy System
- [ ] 3 basic enemy types (slime, skeleton, bat)
- [ ] 3 elite enemy types
- [ ] Wave system with breaks
- [ ] Enemy scaling per wave
- [ ] 2 boss types (Giant Slime, Skeleton King)

### Phase 4: UI/UX
- [ ] Complete HUD (HP, XP, level, score, wave, timer)
- [ ] Level up selection screen
- [ ] Boss HP bar
- [ ] Damage numbers
- [ ] Warning notifications
- [ ] Enhanced game over screen

### Phase 5: Polish
- [ ] Visual effects (trails, particles, glows)
- [ ] Sound effects for all actions
- [ ] Music transitions
- [ ] Performance optimization
- [ ] Bug fixes and testing

---

## 18. Troubleshooting Umum

### Masalah: Game Lag saat Banyak Musuh
**Solusi:**
- Implement object pooling
- Gunakan spatial partitioning
- Cull off-screen objects
- Batasi max enemies on screen (100)

### Masalah: Terlalu Mudah/Sulit
**Solusi:**
- Adjust enemy scaling formula
- Tambah/kurangi upgrade power
- Modifikasi spawn rate

### Masalah: Upgrade Tidak Seimbang
**Solusi:**
- Implement weighted random (prioritize weaker upgrades)
- Track upgrade pick rates
- Adjust upgrade availability

---

*Dokumen Versi: 1.0*  
*Terakhir Diperbarui: 2026-04-04*  
*Status: Siap untuk Implementasi*

---

## Lampiran: Complete Game Data

### A. Complete Enemy Data
```javascript
const ALL_ENEMIES = {
    // Basic Enemies
    slime: { hp: 20, speed: 80, damage: 10, xp: 10, size: 25 },
    skeleton: { hp: 30, speed: 100, damage: 15, xp: 10, size: 28 },
    bat: { hp: 15, speed: 150, damage: 8, xp: 10, size: 20 },
    
    // Elite Enemies
    armored_slime: { hp: 60, speed: 70, damage: 20, xp: 25, size: 35 },
    skeleton_warrior: { hp: 50, speed: 90, damage: 25, xp: 25, size: 32 },
    ghost: { hp: 35, speed: 130, damage: 18, xp: 25, size: 30 },
    
    // Bosses
    boss_giant_slime: { hp: 300, speed: 60, damage: 30, xp: 100, size: 60 },
    boss_skeleton_king: { hp: 500, speed: 80, damage: 40, xp: 100, size: 65 },
    boss_dark_dragon: { hp: 800, speed: 100, damage: 50, xp: 100, size: 70 },
    boss_death_lord: { hp: 1200, speed: 90, damage: 60, xp: 100, size: 75 }
};
```

### B. Complete Upgrade List
```javascript
const STAT_UPGRADES = [
    { id: 'max_hp', name: 'Max HP', baseEffect: 20, maxLevel: 10 },
    { id: 'damage', name: 'Damage', baseEffect: 0.20, maxLevel: 10 },
    { id: 'attack_speed', name: 'Attack Speed', baseEffect: 0.15, maxLevel: 8 },
    { id: 'speed', name: 'Movement Speed', baseEffect: 0.10, maxLevel: 5 },
    { id: 'defense', name: 'Defense', baseEffect: 5, maxLevel: 10 },
    { id: 'pickup_range', name: 'Pickup Range', baseEffect: 0.30, maxLevel: 5 },
    { id: 'hp_regen', name: 'HP Regeneration', baseEffect: 2, maxLevel: 5 },
    { id: 'crit_chance', name: 'Critical Hit Chance', baseEffect: 0.10, maxLevel: 5 },
    { id: 'lifesteal', name: 'Lifesteal', baseEffect: 0.10, maxLevel: 3 },
    { id: 'area_damage', name: 'Area Damage', baseEffect: 0.25, maxLevel: 5 }
];
```

### C. Complete Weapon Data
```javascript
const ALL_WEAPONS = {
    basic_sword: {
        name: 'Pedang Dasar',
        damage: 10,
        attackSpeed: 1.0,
        range: 60,
        type: 'melee',
        description: 'Serangan jarak dekat'
    },
    magic_orb: {
        name: 'Orb Sihir',
        damage: 8,
        attackSpeed: 0.8,
        range: 300,
        type: 'homing',
        description: 'Proyektil pencari musuh'
    },
    arrow_bow: {
        name: 'Busur Panah',
        damage: 15,
        attackSpeed: 0.6,
        range: 400,
        type: 'piercing',
        description: 'Panah tembus musuh'
    },
    fire_wand: {
        name: 'Tongkat Api',
        damage: 12,
        attackSpeed: 0.5,
        range: 250,
        type: 'aoe',
        description: 'Damage area seiring waktu'
    },
    lightning_rod: {
        name: 'Tongkat Petir',
        damage: 9,
        attackSpeed: 0.9,
        range: 200,
        type: 'chain',
        description: 'Menyebar ke 3 musuh'
    },
    ice_staff: {
        name: 'Tongkat Es',
        damage: 7,
        attackSpeed: 0.7,
        range: 280,
        type: 'slow',
        description: 'Memperlambat musuh 30%'
    }
};
```

---

*Dokumen ini akan menjadi panduan lengkap untuk implementasi gameplay game Survival.io style. Semua mekanik, sistem, dan detail teknis sudah dijelaskan untuk memudahkan development.*

#!/usr/bin/env node
/**
 * generate-game-list.js
 * Otomatis generate games/index.json berdasarkan subfolder di dalam games/
 * yang memiliki file info.json.
 *
 * Cara pakai:
 *   node generate-game-list.js
 *
 * Tambahkan game baru: buat folder di games/<nama-game>/info.json,
 * lalu jalankan script ini. File games/index.json akan terupdate otomatis.
 */

const fs   = require("fs");
const path = require("path");

const gamesDir  = path.join(__dirname, "games");
const indexFile = path.join(gamesDir, "index.json");

// Baca semua subfolder di dalam games/
const entries = fs.readdirSync(gamesDir, { withFileTypes: true });

const gameIds = entries
  .filter(e => e.isDirectory())
  .map(e => e.name)
  .filter(name => {
    const infoPath = path.join(gamesDir, name, "info.json");
    return fs.existsSync(infoPath);
  })
  .sort(); // urutkan alphabetically

fs.writeFileSync(indexFile, JSON.stringify(gameIds, null, 2) + "\n");

console.log(`games/index.json diperbarui (${gameIds.length} game):`);
gameIds.forEach(id => console.log(`  - ${id}`));

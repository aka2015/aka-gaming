import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

const GAMES_DIR = "/var/www/games";

const saJson = JSON.parse(readFileSync("/opt/aka-gaming/service-account.json", "utf-8"));

initializeApp({
  credential: cert({
    projectId: saJson.project_id,
    clientEmail: saJson.client_email,
    privateKey: saJson.private_key.replace(/\\n/g, "\n"),
  }),
});

const db = getFirestore();

function getEmoji(name: string): string {
  const map: Record<string, string> = {
    "bubble-pop-abc": "🎈",
    "siapa-alien": "👽",
    "circuit-builder": "⚡",
    "robot-builder": "🤖",
    "math-quest": "🔢",
    "memory-card": "🃏",
    "animal-rescue": "🐾",
    "battle-royale-arena": "⚔️",
    "kingdom-adventure": "🏰",
    "tower-defense": "🗼",
    "sortir-sampah": "♻️",
    "money-wise": "💰",
    "power-the-city": "🏙️",
    "treasure-quest": "🗺️",
    "word-match-adventure": "📝",
    "take-your-money": "💵",
    "spelling-bee-junior": "🐝",
    "listen-and-choose": "👂",
    "catch-the-box": "📦",
    "Survival-v1": "🏃",
    "Survival-v2": "🏃",
  };
  return map[name] || "🎮";
}

async function migrate() {
  const gameDirs = readdirSync(GAMES_DIR).filter((d) => {
    const full = join(GAMES_DIR, d);
    return statSync(full).isDirectory() && readdirSync(full).includes("info.json");
  });

  console.log(`Found ${gameDirs.length} games to migrate`);

  for (const dir of gameDirs) {
    const infoPath = join(GAMES_DIR, dir, "info.json");
    const info = JSON.parse(readFileSync(infoPath, "utf-8"));

    const docRef = db.collection("games").doc(info.id);
    const existing = await docRef.get();

    if (existing.exists) {
      console.log(`⏭️  ${info.name} already exists`);
      continue;
    }

    await docRef.set({
      title: info.name,
      description: info.description || "",
      prompt: info.description || "",
      authorId: info.author || "Abi AKA",
      authorName: info.author || "AKA Gaming",
      status: "published",
      category: info.category || "educational",
      emoji: getEmoji(dir),
      likes: 0,
      plays: 0,
      createdAt: Date.now(),
      publishedAt: Date.now(),
    });

    console.log(`✅ ${info.name} migrated`);
  }

  console.log("\nMigration complete!");
  process.exit(0);
}

migrate().catch((e) => {
  console.error(e);
  process.exit(1);
});

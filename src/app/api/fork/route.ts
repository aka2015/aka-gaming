import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { getAdminDb } from "@/lib/firebase-admin";
import { sanitizeHtml } from "@/lib/sanitize";

const GAMES_DIR = process.env.GAMES_DIR || "/var/www/games";
const MAX_GAMES_PER_USER = 3;

function generateThumbnail(emoji: string, title: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#a855f7;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#ec4899;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="400" height="300" fill="url(#bg)" rx="16"/>
  <text x="200" y="140" font-size="80" text-anchor="middle" dominant-baseline="middle">${emoji}</text>
  <text x="200" y="210" font-family="Arial,sans-serif" font-size="24" fill="white" text-anchor="middle" font-weight="bold">${title.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</text>
</svg>`;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Login diperlukan" }, { status: 401 });
  }

  const { gameId, newTitle, newEmoji, iteratePrompt } = await req.json();
  if (!gameId || typeof gameId !== "string") {
    return NextResponse.json({ error: "Game ID diperlukan" }, { status: 400 });
  }

  const userId = session.user.email;
  const adminDb = getAdminDb();

  // Check user game limit
  const userGames = await adminDb.collection("games").where("authorId", "==", userId).get();
  if (userGames.size >= MAX_GAMES_PER_USER) {
    return NextResponse.json(
      { error: `Maksimal ${MAX_GAMES_PER_USER} game per user. Hapus game lama untuk fork.` },
      { status: 403 }
    );
  }

  // Get original game
  const originalRef = adminDb.collection("games").doc(gameId);
  const originalSnap = await originalRef.get();
  if (!originalSnap.exists) {
    return NextResponse.json({ error: "Game asli tidak ditemukan" }, { status: 404 });
  }

  const original = originalSnap.data()!;
  const title = newTitle?.trim() || `${original.title} (Fork)`;
  const emoji = newEmoji || original.emoji || "🎮";
  const description = iteratePrompt?.trim() || original.description || "";
  const prompt = iteratePrompt?.trim()
    ? `Fork dari "${original.title}" dengan perubahan: ${iteratePrompt}`
    : `Fork dari "${original.title}"`;

  // Read original HTML
  let html: string;
  try {
    html = await readFile(join(GAMES_DIR, gameId, "index.html"), "utf-8");
  } catch {
    return NextResponse.json({ error: "File game asli tidak ditemukan" }, { status: 404 });
  }

  const cleanHtml = sanitizeHtml(html);

  // Save new Firestore doc
  const newGameDoc = await adminDb.collection("games").add({
    title,
    description,
    prompt,
    authorId: userId,
    authorName: session.user.name || "Anonim",
    status: "draft",
    category: original.category || "puzzle",
    emoji,
    likes: 0,
    plays: 0,
    createdAt: Date.now(),
    publishedAt: null,
    forkedFrom: gameId,
    forkedFromTitle: original.title,
  });

  // Save game files
  const gameDir = join(GAMES_DIR, newGameDoc.id);
  await mkdir(gameDir, { recursive: true });

  await writeFile(join(gameDir, "index.html"), cleanHtml, "utf-8");

  const infoJson = JSON.stringify({
    id: newGameDoc.id,
    name: title,
    description,
    category: original.category || "puzzle",
    badge: "new",
    gameFile: "index.html",
    thumbnail: "thumbnail.svg",
    createdAt: new Date().toISOString().split("T")[0],
    author: session.user.name || "AKA Gaming",
    forkedFrom: gameId,
  }, null, 2);
  await writeFile(join(gameDir, "info.json"), infoJson, "utf-8");

  const thumbnailSvg = generateThumbnail(emoji, title);
  await writeFile(join(gameDir, "thumbnail.svg"), thumbnailSvg, "utf-8");

  return NextResponse.json({ id: newGameDoc.id, title });
}

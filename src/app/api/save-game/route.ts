import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
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

  const { title, description, emoji, category, html } = await req.json();

  if (!title || !html) {
    return NextResponse.json({ error: "Judul dan HTML diperlukan" }, { status: 400 });
  }

  // Sanitize HTML to prevent XSS
  const cleanHtml = sanitizeHtml(html);

  const userId = session.user.email;
  const adminDb = getAdminDb();

  // Check limit 3 games per user
  const userGames = await adminDb
    .collection("games")
    .where("authorId", "==", userId)
    .get();

  if (userGames.size >= MAX_GAMES_PER_USER) {
    return NextResponse.json(
      { error: `Maksimal ${MAX_GAMES_PER_USER} game per user. Hapus game lama untuk membuat baru.` },
      { status: 403 }
    );
  }

  // Save to Firestore
  const gameDoc = await adminDb.collection("games").add({
    title,
    description: description || "",
    prompt: description || "",
    authorId: userId,
    authorName: session.user.name || "Anonim",
    status: "draft",
    category: category || "puzzle",
    emoji: emoji || "🎮",
    likes: 0,
    plays: 0,
    createdAt: Date.now(),
    publishedAt: null,
  });

  // Save game files
  const gameDir = join(GAMES_DIR, gameDoc.id);
  await mkdir(gameDir, { recursive: true });

  // index.html (sanitized)
  await writeFile(join(gameDir, "index.html"), cleanHtml, "utf-8");

  // info.json
  const infoJson = JSON.stringify({
    id: gameDoc.id,
    name: title,
    description: description || "",
    category: category || "puzzle",
    badge: "new",
    gameFile: "index.html",
    thumbnail: "thumbnail.svg",
    createdAt: new Date().toISOString().split("T")[0],
    author: session.user.name || "AKA Gaming",
  }, null, 2);
  await writeFile(join(gameDir, "info.json"), infoJson, "utf-8");

  // thumbnail.svg
  const thumbnailSvg = generateThumbnail(emoji || "🎮", title);
  await writeFile(join(gameDir, "thumbnail.svg"), thumbnailSvg, "utf-8");

  return NextResponse.json({ id: gameDoc.id });
}

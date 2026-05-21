import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { getAdminDb } from "@/lib/firebase-admin";

const GAMES_DIR = process.env.GAMES_DIR || "/var/www/games";
const MAX_GAMES_PER_USER = 3;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Login diperlukan" }, { status: 401 });
  }

  const { title, description, emoji, category, html } = await req.json();

  if (!title || !html) {
    return NextResponse.json({ error: "Judul dan HTML diperlukan" }, { status: 400 });
  }

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

  // Save HTML file
  await mkdir(GAMES_DIR, { recursive: true });
  const gameDir = join(GAMES_DIR, gameDoc.id);
  await mkdir(gameDir, { recursive: true });
  const filePath = join(gameDir, "index.html");
  await writeFile(filePath, html, "utf-8");

  return NextResponse.json({ id: gameDoc.id });
}

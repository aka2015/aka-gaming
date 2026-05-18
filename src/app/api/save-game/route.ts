import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Firebase Admin init
if (!getApps().length && process.env.FIREBASE_PRIVATE_KEY) {
  initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL || "",
      privateKey: (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
    }),
  });
}

function getAdminDb() {
  if (!getApps().length) {
    throw new Error("Firebase Admin belum dikonfigurasi. Isi FIREBASE_PRIVATE_KEY di .env.local");
  }
  return getFirestore();
}

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
  const filePath = join(GAMES_DIR, `${gameDoc.id}.html`);
  await writeFile(filePath, html, "utf-8");

  return NextResponse.json({ id: gameDoc.id });
}

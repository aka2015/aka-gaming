import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { Game } from "@/lib/types";
import { existsSync } from "fs";
import { join } from "path";

const GAMES_DIR = process.env.GAMES_DIR || "/var/www/games";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const safeId = id.replace(/[^a-zA-Z0-9_-]/g, "");

  try {
    const db = getAdminDb();
    const snap = await db.collection("games").doc(safeId).get();

    if (!snap.exists) {
      return NextResponse.json({ error: "Game tidak ditemukan" }, { status: 404 });
    }

    const data = snap.data()!;
    const game: Game = { id: snap.id, ...data } as Game;

    const fileExists = existsSync(join(GAMES_DIR, safeId, "index.html"));

    return NextResponse.json({ game, fileExists });
  } catch (error) {
    console.error("Error fetching game:", error);
    return NextResponse.json({ error: "Gagal memuat game" }, { status: 500 });
  }
}

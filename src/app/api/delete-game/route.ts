import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAdminDb } from "@/lib/firebase-admin";
import { rm } from "fs/promises";
import { join } from "path";

const GAMES_DIR = process.env.GAMES_DIR || "/var/www/games";

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json(
            { error: "Login diperlukan" },
            { status: 401 },
        );
    }

    const { id } = await req.json();
    if (!id)
        return NextResponse.json({ error: "ID diperlukan" }, { status: 400 });

    const adminDb = getAdminDb();
    const docRef = adminDb.collection("games").doc(id);
    const snap = await docRef.get();

    if (!snap.exists || snap.data()?.authorId !== session.user.email) {
        return NextResponse.json(
            { error: "Game tidak ditemukan" },
            { status: 404 },
        );
    }

    // Delete Firestore doc
    await docRef.delete();

    // Delete game files
    const safeId = id.replace(/[^a-zA-Z0-9_-]/g, "");

    // Try flat file (old format)
    try {
        await rm(join(GAMES_DIR, `${safeId}.html`), { force: true });
    } catch {
        // File mungkin sudah tidak ada
    }

    // Try directory structure (new format)
    try {
        await rm(join(GAMES_DIR, safeId), { recursive: true, force: true });
    } catch {
        // Direktori mungkin sudah tidak ada
    }

    return NextResponse.json({ ok: true });
}

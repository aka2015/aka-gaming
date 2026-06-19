import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAdminDb } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Login diperlukan" }, { status: 401 });
    }

    const { gameId, title, description, emoji, category, html } = await req.json();

    if (!gameId || !title) {
        return NextResponse.json({ error: "Game ID dan judul diperlukan" }, { status: 400 });
    }

    const safeId = gameId.replace(/[^a-zA-Z0-9_-]/g, "");
    const adminDb = getAdminDb();
    const gameRef = adminDb.collection("games").doc(safeId);
    const snap = await gameRef.get();

    if (!snap.exists) {
        return NextResponse.json({ error: "Game tidak ditemukan" }, { status: 404 });
    }

    const data = snap.data()!;
    if (data.authorId !== session.user.email) {
        return NextResponse.json({ error: "Anda tidak punya akses" }, { status: 403 });
    }

    const updateData: Record<string, unknown> = {
        title,
        description: description || "",
        emoji: emoji || "🎮",
        category: category || "puzzle",
    };

    if (html) {
        updateData.html = html;
    }

    await gameRef.update(updateData);

    return NextResponse.json({ ok: true });
}

export async function GET(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Login diperlukan" }, { status: 401 });
    }

    const gameId = req.nextUrl.searchParams.get("gameId");
    if (!gameId) {
        return NextResponse.json({ error: "Game ID diperlukan" }, { status: 400 });
    }

    const safeId = gameId.replace(/[^a-zA-Z0-9_-]/g, "");
    const adminDb = getAdminDb();
    const snap = await adminDb.collection("games").doc(safeId).get();

    if (!snap.exists) {
        return NextResponse.json({ error: "Game tidak ditemukan" }, { status: 404 });
    }

    const data = snap.data()!;
    if (data.authorId !== session.user.email) {
        return NextResponse.json({ error: "Anda tidak punya akses" }, { status: 403 });
    }

    return NextResponse.json({ id: snap.id, ...data });
}

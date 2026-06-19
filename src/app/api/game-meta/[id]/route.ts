import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const safeId = id.replace(/[^a-zA-Z0-9_-]/g, "");

  const adminDb = getAdminDb();
  const snap = await adminDb.collection("games").doc(safeId).get();

  if (!snap.exists) {
    return NextResponse.json({ error: "Game tidak ditemukan" }, { status: 404 });
  }

  const data = snap.data()!;
  return NextResponse.json({
    id: snap.id,
    title: data.title,
    description: data.description,
    prompt: data.prompt,
    category: data.category,
    emoji: data.emoji,
    authorId: data.authorId,
    authorName: data.authorName,
    status: data.status,
  });
}

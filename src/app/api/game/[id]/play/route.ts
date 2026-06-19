import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const safeId = id.replace(/[^a-zA-Z0-9_-]/g, "");

  try {
    const db = getAdminDb();
    await db.collection("games").doc(safeId).update({
      plays: FieldValue.increment(1),
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Gagal mencatat play" }, { status: 500 });
  }
}

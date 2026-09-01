import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAdminDb } from "@/lib/firebase-admin";
import type { Game } from "@/lib/types";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Login diperlukan" }, { status: 401 });
    }

    const adminDb = getAdminDb();
    const snap = await adminDb
      .collection("games")
      .where("authorId", "==", session.user.email)
      .get();

    const games = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Game));
    games.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    return NextResponse.json({ games });
  } catch (err) {
    console.error("[API my-games] Error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

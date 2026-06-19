import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { Game } from "@/lib/types";

export async function GET() {
  try {
    const db = getAdminDb();
    const snap = await db.collection("games").where("status", "==", "published").get();
    const games: Game[] = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Game));
    games.sort((a, b) => (b.publishedAt || 0) - (a.publishedAt || 0));
    return NextResponse.json({ games });
  } catch (error) {
    console.error("Error fetching games:", error);
    return NextResponse.json({ error: "Failed to fetch games" }, { status: 500 });
  }
}

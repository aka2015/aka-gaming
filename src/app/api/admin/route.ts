import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAdminDb } from "@/lib/firebase-admin";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim());

export function isAdmin(email: string | null | undefined): boolean {
  return !!email && ADMIN_EMAILS.includes(email);
}

// GET: list all games
export async function GET() {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const adminDb = getAdminDb();
  const snap = await adminDb.collection("games").orderBy("createdAt", "desc").get();
  const games = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return NextResponse.json({ games });
}

// POST: admin actions (takedown, approve, delete-comment)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { action, gameId, commentId } = await req.json();
  const adminDb = getAdminDb();

  switch (action) {
    case "takedown": {
      await adminDb.collection("games").doc(gameId).update({ status: "draft" });
      return NextResponse.json({ ok: true });
    }
    case "approve": {
      await adminDb.collection("games").doc(gameId).update({ status: "published", publishedAt: Date.now() });
      return NextResponse.json({ ok: true });
    }
    case "delete-game": {
      await adminDb.collection("games").doc(gameId).delete();
      return NextResponse.json({ ok: true });
    }
    case "delete-comment": {
      await adminDb.collection("games").doc(gameId).collection("comments").doc(commentId).delete();
      return NextResponse.json({ ok: true });
    }
    default:
      return NextResponse.json({ error: "Action tidak valid" }, { status: 400 });
  }
}

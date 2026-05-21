import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAdminDb } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Login diperlukan" }, { status: 401 });
  }

  const adminDb = getAdminDb();
  const userRef = adminDb.collection("users").doc(session.user.email);

  await userRef.set(
    {
      uid: session.user.email,
      email: session.user.email,
      displayName: session.user.name || "",
      photoURL: session.user.image || "",
      lastSeen: Date.now(),
      role: "user",
    },
    { merge: true }
  );

  return NextResponse.json({ ok: true });
}

export async function GET() {
  const adminDb = getAdminDb();
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;

  const snap = await adminDb
    .collection("users")
    .where("lastSeen", ">=", fiveMinutesAgo)
    .get();

  const users = snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));

  return NextResponse.json({ users, count: users.length });
}

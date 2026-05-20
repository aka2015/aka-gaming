import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAdminDb } from "@/lib/firebase-admin";

function isAdmin(email: string | null | undefined): boolean {
  const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim());
  return !!email && adminEmails.includes(email);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { userId, amount } = await req.json();

  if (!userId || !amount || amount <= 0) {
    return NextResponse.json({ error: "User ID dan jumlah credit diperlukan" }, { status: 400 });
  }

  const adminDb = getAdminDb();
  const userRef = adminDb.collection("users").doc(userId);

  return adminDb.runTransaction(async (transaction) => {
    const snap = await transaction.get(userRef);

    if (!snap.exists) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    const data = snap.data() || {};
    const currentCredits = data.credits ?? 0;
    transaction.update(userRef, { credits: currentCredits + amount });

    return NextResponse.json({ ok: true, newCredits: currentCredits + amount });
  });
}

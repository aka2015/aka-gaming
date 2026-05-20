import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserCredits, addCreditsFromAd } from "@/lib/credits";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Login diperlukan" }, { status: 401 });
  }

  const credits = await getUserCredits(session.user.email);
  return NextResponse.json(credits);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Login diperlukan" }, { status: 401 });
  }

  const { action } = await req.json();

  if (action === "watch-ad") {
    const result = await addCreditsFromAd(session.user.email);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ credits: result.credits, adsWatchedToday: result.adsWatchedToday });
  }

  return NextResponse.json({ error: "Action tidak valid" }, { status: 400 });
}

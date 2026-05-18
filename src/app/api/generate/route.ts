import { NextRequest, NextResponse } from "next/server";
import { generateGame } from "@/lib/llm";

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();

  if (!prompt || typeof prompt !== "string") {
    return NextResponse.json({ error: "Prompt diperlukan" }, { status: 400 });
  }

  try {
    const html = await generateGame(prompt);
    return NextResponse.json({ html });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Gagal generate game";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

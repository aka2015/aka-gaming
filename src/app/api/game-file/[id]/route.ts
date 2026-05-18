import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";

const GAMES_DIR = process.env.GAMES_DIR || "/var/www/games";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Sanitize id to prevent path traversal
  const safeId = id.replace(/[^a-zA-Z0-9_-]/g, "");
  const filePath = join(GAMES_DIR, `${safeId}.html`);

  try {
    const html = await readFile(filePath, "utf-8");
    return new NextResponse(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch {
    return new NextResponse("<h1>Game tidak ditemukan</h1>", {
      status: 404,
      headers: { "Content-Type": "text/html" },
    });
  }
}

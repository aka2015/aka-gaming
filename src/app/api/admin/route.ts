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
    case "add-game": {
      if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
      const { title, description, emoji, category, html, gameId } = await req.json();
      if (!title || !html || !gameId) {
        return NextResponse.json({ error: "Title, html, and gameId required" }, { status: 400 });
      }
      
      // Add to Firestore
      await adminDb.collection("games").doc(gameId).set({
        title,
        description: description || "",
        prompt: description || "",
        authorId: session.user.email,
        authorName: session.user.name || "Admin",
        status: "published",
        category: category || "strategy",
        emoji: emoji || "🎮",
        likes: 0,
        plays: 0,
        createdAt: Date.now(),
        publishedAt: Date.now()
      });
      
      // Save game files
      const { writeFile, mkdir } = await import("fs/promises");
      const { join } = await import("path");
      const GAMES_DIR = process.env.GAMES_DIR || "/var/www/games";
      const gameDir = join(GAMES_DIR, gameId);
      await mkdir(gameDir, { recursive: true });
      await writeFile(join(gameDir, "index.html"), html, "utf-8");
      
      const infoJson = JSON.stringify({
        id: gameId,
        name: title,
        description: description || "",
        category: category || "strategy",
        badge: "new",
        gameFile: "index.html",
        thumbnail: "thumbnail.svg",
        createdAt: new Date().toISOString().split("T")[0],
        author: session.user.name || "AKA Gaming",
      }, null, 2);
      await writeFile(join(gameDir, "info.json"), infoJson, "utf-8");
      
      // Generate thumbnail
      const thumbnailSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#a855f7;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#ec4899;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="400" height="300" fill="url(#bg)" rx="16"/>
  <text x="200" y="140" font-size="80" text-anchor="middle" dominant-baseline="middle">${emoji || "🎮"}</text>
  <text x="200" y="210" font-family="Arial,sans-serif" font-size="24" fill="white" text-anchor="middle" font-weight="bold">${title.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</text>
</svg>`;
      await writeFile(join(gameDir, "thumbnail.svg"), thumbnailSvg, "utf-8");
      
      return NextResponse.json({ ok: true, gameId });
    }
    default:
      return NextResponse.json({ error: "Action tidak valid" }, { status: 400 });
  }
}

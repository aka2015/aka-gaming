import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";

const GAMES_DIR = process.env.GAMES_DIR || "/var/www/games";

const MIME_TYPES: Record<string, string> = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".ico": "image/x-icon",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".ttf": "font/ttf",
    ".mp3": "audio/mpeg",
    ".wav": "audio/wav",
    ".ogg": "audio/ogg",
};

function getContentType(fileName: string): string {
    const ext = fileName.substring(fileName.lastIndexOf(".")).toLowerCase();
    return MIME_TYPES[ext] || "application/octet-stream";
}

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ slug: string[] }> },
) {
    const { slug } = await params;
    const { searchParams } = new URL(_req.url);
    const type = searchParams.get("type") || "html";

    if (!slug || slug.length === 0) {
        return new NextResponse("Not found", { status: 404 });
    }

    // slug[0] is the game ID; rest is sub-path (e.g., style.css)
    const gameId = slug[0];
    const safeId = gameId.replace(/[^a-zA-Z0-9_-]/g, "");
    const subPath = slug.slice(1).join("/");

    // Determine file name
    let fileName: string;
    if (type === "thumbnail") {
        fileName = "thumbnail.svg";
    } else if (subPath) {
        fileName = subPath;
    } else {
        fileName = "index.html";
    }

    const filePath = join(GAMES_DIR, safeId, fileName);
    const flatFilePath = join(GAMES_DIR, `${safeId}.html`);

    try {
        if (type === "thumbnail") {
            try {
                const content = await readFile(filePath, "utf-8");
                return new NextResponse(content, {
                    headers: { "Content-Type": "image/svg+xml; charset=utf-8" },
                });
            } catch {
                const fallback = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="#a855f7" rx="16"/><text x="200" y="150" font-size="80" text-anchor="middle" dominant-baseline="middle">🎮</text></svg>`;
                return new NextResponse(fallback, {
                    status: 404,
                    headers: { "Content-Type": "image/svg+xml" },
                });
            }
        }

        // Asset file (e.g., style.css, script.js)
        if (subPath) {
            const content = await readFile(filePath);
            const contentType = getContentType(fileName);
            return new NextResponse(content, {
                headers: {
                    "Content-Type": contentType,
                    "Cache-Control": "public, max-age=31536000, immutable",
                },
            });
        }

        // Main HTML file
        let content: string;
        try {
            content = await readFile(filePath, "utf-8");
        } catch {
            content = await readFile(flatFilePath, "utf-8");
        }
        return new NextResponse(content, {
            headers: { "Content-Type": "text/html; charset=utf-8" },
        });
    } catch {
        return new NextResponse("<h1>Game tidak ditemukan</h1>", {
            status: 404,
            headers: { "Content-Type": "text/html" },
        });
    }
}

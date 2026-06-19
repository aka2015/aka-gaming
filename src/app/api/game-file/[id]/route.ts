import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";

const GAMES_DIR = process.env.GAMES_DIR || "/var/www/games";

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const { id } = await params;
    const { searchParams } = new URL(_req.url);
    const type = searchParams.get("type") || "html";

    // Sanitize id to prevent path traversal
    const safeId = id.replace(/[^a-zA-Z0-9_-]/g, "");
    const fileName = type === "thumbnail" ? "thumbnail.svg" : "index.html";
    const filePath = join(GAMES_DIR, safeId, fileName);
    const flatFilePath = join(GAMES_DIR, `${safeId}.html`);

    try {
        // Try directory structure first, then flat file
        let content: string;
        let contentType: string;
        if (type === "thumbnail") {
            try {
                content = await readFile(filePath, "utf-8");
                contentType = "image/svg+xml; charset=utf-8";
            } catch {
                const fallbackContent = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="#a855f7" rx="16"/><text x="200" y="150" font-size="80" text-anchor="middle" dominant-baseline="middle">🎮</text></svg>`;
                return new NextResponse(fallbackContent, {
                    status: 404,
                    headers: { "Content-Type": "image/svg+xml" },
                });
            }
        } else {
            try {
                content = await readFile(filePath, "utf-8");
            } catch {
                try {
                    content = await readFile(flatFilePath, "utf-8");
                } catch {
                    return new NextResponse("<h1>Game tidak ditemukan</h1>", {
                        status: 404,
                        headers: { "Content-Type": "text/html" },
                    });
                }
            }
            contentType = "text/html; charset=utf-8";
        }

        return new NextResponse(content, {
            headers: { "Content-Type": contentType },
        });
    } catch {
        return new NextResponse("<h1>Game tidak ditemukan</h1>", {
            status: 404,
            headers: { "Content-Type": "text/html" },
        });
    }
}

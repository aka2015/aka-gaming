import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAdminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json(
            { error: "Login diperlukan" },
            { status: 401 },
        );
    }

    const { gameId } = await req.json();
    if (!gameId || typeof gameId !== "string") {
        return NextResponse.json(
            { error: "Game ID diperlukan" },
            { status: 400 },
        );
    }

    const userId = session.user.email;
    const adminDb = getAdminDb();
    const gameRef = adminDb.collection("games").doc(gameId);
    const likeRef = gameRef.collection("likes").doc(userId);

    try {
        const result = await adminDb.runTransaction(async (transaction) => {
            const gameSnap = await transaction.get(gameRef);
            if (!gameSnap.exists) {
                return { error: "Game tidak ditemukan" };
            }

            const likeSnap = await transaction.get(likeRef);
            const isLiked = likeSnap.exists;

            if (isLiked) {
                transaction.delete(likeRef);
                transaction.update(gameRef, {
                    likes: FieldValue.increment(-1),
                });
                return {
                    liked: false,
                    likes: (gameSnap.data()?.likes || 1) - 1,
                };
            } else {
                transaction.set(likeRef, {
                    userId,
                    createdAt: Date.now(),
                });
                transaction.update(gameRef, { likes: FieldValue.increment(1) });
                return {
                    liked: true,
                    likes: (gameSnap.data()?.likes || 0) + 1,
                };
            }
        });

        if ("error" in result) {
            return NextResponse.json({ error: result.error }, { status: 404 });
        }

        return NextResponse.json(result);
    } catch (e) {
        const message = e instanceof Error ? e.message : "Gagal memproses like";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    const session = await auth();
    const userId = session?.user?.email;
    const gameId = req.nextUrl.searchParams.get("gameId");

    if (!gameId) {
        return NextResponse.json(
            { error: "Game ID diperlukan" },
            { status: 400 },
        );
    }

    const adminDb = getAdminDb();
    const gameRef = adminDb.collection("games").doc(gameId);

    try {
        const [gameSnap, likeSnap] = await Promise.all([
            gameRef.get(),
            userId
                ? gameRef.collection("likes").doc(userId).get()
                : Promise.resolve(null),
        ]);

        return NextResponse.json({
            likes: gameSnap.data()?.likes || 0,
            liked: !!likeSnap?.exists,
        });
    } catch (e) {
        const message = e instanceof Error ? e.message : "Gagal memuat like";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

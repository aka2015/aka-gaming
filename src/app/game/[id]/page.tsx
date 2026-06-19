"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { useSession } from "next-auth/react";
import { db } from "@/lib/firebase";
import { Game, Comment } from "@/lib/types";
import Link from "next/link";

export default function GamePage() {
    const { id } = useParams<{ id: string }>();
    const { data: session } = useSession();
    const [game, setGame] = useState<Game | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [commentText, setCommentText] = useState("");
    const [loading, setLoading] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [likes, setLikes] = useState(0);
    const [liked, setLiked] = useState(false);
    const [liking, setLiking] = useState(false);
    const [forking, setForking] = useState(false);
    const [forkError, setForkError] = useState("");
    const wrapperRef = useRef<HTMLDivElement>(null);

    const toggleFullscreen = useCallback(() => {
        const el = wrapperRef.current;
        if (!document.fullscreenElement) {
            el?.requestFullscreen?.();
        } else {
            document.exitFullscreen?.();
        }
    }, []);

    useEffect(() => {
        const handler = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener("fullscreenchange", handler);
        return () => document.removeEventListener("fullscreenchange", handler);
    }, []);

    useEffect(() => {
        async function load() {
            try {
                // Load game via API (server-side)
                const res = await fetch(`/api/game/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setGame(data.game);
                    setLikes(data.game?.likes || 0);

                    // Track play
                    if (data.fileExists) {
                        fetch(`/api/game/${id}/play`, { method: "POST" }).catch(
                            () => {},
                        );
                    }
                }

                // Load comments from Firestore
                const cSnap = await getDocs(
                    collection(db, "games", id, "comments"),
                );
                const commentsData = cSnap.docs.map(
                    (d) => ({ id: d.id, ...d.data() }) as Comment,
                );
                commentsData.sort(
                    (a, b) => (b.createdAt || 0) - (a.createdAt || 0),
                );
                setComments(commentsData);

                // Load like status from server
                if (session?.user?.email) {
                    try {
                        const likeRes = await fetch(`/api/like?gameId=${id}`);
                        if (likeRes.ok) {
                            const likeData = await likeRes.json();
                            setLikes(likeData.likes ?? 0);
                            setLiked(likeData.liked ?? false);
                        }
                    } catch {
                        // ignore
                    }
                }
            } catch {
                // Error fetching game
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [id, session?.user?.email]);

    async function toggleLike() {
        if (!session?.user?.email) return;
        setLiking(true);
        try {
            const res = await fetch("/api/like", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ gameId: id }),
            });
            if (res.ok) {
                const data = await res.json();
                setLikes(data.likes ?? 0);
                setLiked(data.liked ?? false);
            }
        } catch {
            // ignore
        } finally {
            setLiking(false);
        }
    }

    async function handleFork() {
        if (!session?.user?.email) return;
        setForking(true);
        setForkError("");
        try {
            const res = await fetch("/api/fork", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ gameId: id }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Gagal fork game");
            window.location.href = `/create?forkId=${data.id}`;
        } catch (e) {
            setForkError(e instanceof Error ? e.message : "Gagal fork game");
        } finally {
            setForking(false);
        }
    }

    async function submitComment() {
        if (!commentText.trim() || !session?.user) return;
        await addDoc(collection(db, "games", id, "comments"), {
            gameId: id,
            authorId: session.user.email,
            authorName: session.user.name || "Anonim",
            authorPhoto: session.user.image || "",
            text: commentText.trim(),
            createdAt: Date.now(),
        });
        setComments((prev) => [
            {
                id: Date.now().toString(),
                gameId: id,
                authorId: "",
                authorName: session.user!.name || "Anonim",
                authorPhoto: session.user!.image || "",
                text: commentText.trim(),
                createdAt: Date.now(),
            },
            ...prev,
        ]);
        setCommentText("");
    }

    if (loading)
        return (
            <div className="text-center py-20 text-gray-400">
                ⏳ Memuat game...
            </div>
        );
    if (!game)
        return (
            <div className="text-center py-20 text-gray-400">
                ❌ Game tidak ditemukan
            </div>
        );

    const isOwnGame = session?.user?.email === game.authorId;

    return (
        <div className="max-w-[1200px] mx-auto px-5 py-8">
            {/* Game Info */}
            <div className="mb-4">
                <h1 className="font-head text-3xl text-gray-800">
                    {game.emoji} {game.title}
                </h1>
                <p className="text-gray-500 mt-1">{game.description}</p>
                <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-400 items-center">
                    <span>👤 {game.authorName}</span>
                    <span>▶ {game.plays} plays</span>
                    <span className="bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full text-xs font-bold">
                        {game.category}
                    </span>
                    {game.forkedFrom && (
                        <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full text-xs font-bold">
                            🍴 Fork dari{" "}
                            <Link
                                href={`/game/${game.forkedFrom}`}
                                className="hover:underline"
                            >
                                {game.forkedFromTitle || "game lain"}
                            </Link>
                        </span>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 mb-4">
                {session ? (
                    <button
                        onClick={toggleLike}
                        disabled={liking}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition disabled:opacity-50 ${
                            liked
                                ? "bg-pink-100 text-pink-600"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                    >
                        {liked ? "❤️" : "🤍"} {likes} Like
                    </button>
                ) : (
                    <span className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold bg-gray-100 text-gray-400">
                        ❤️ {likes} Like
                    </span>
                )}

                {!isOwnGame && session && (
                    <button
                        onClick={handleFork}
                        disabled={forking}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold bg-blue-100 text-blue-600 hover:bg-blue-200 transition disabled:opacity-50"
                    >
                        {forking ? "⏳ Forking..." : "🍴 Fork Game"}
                    </button>
                )}
            </div>
            {forkError && (
                <p className="text-red-500 text-sm mb-4">❌ {forkError}</p>
            )}

            {/* Game iframe */}
            <div
                ref={wrapperRef}
                className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8"
            >
                <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-100">
                    <span className="text-sm text-gray-500 font-medium">
                        {game.title}
                    </span>
                    <button
                        onClick={toggleFullscreen}
                        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition px-3 py-1.5 rounded-lg hover:bg-gray-200/50"
                    >
                        {isFullscreen ? (
                            <>
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                                Exit Fullscreen
                            </>
                        ) : (
                            <>
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                                    />
                                </svg>
                                Fullscreen
                            </>
                        )}
                    </button>
                </div>
                <iframe
                    src={`/api/game-file/${game.id}`}
                    sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                    className={`w-full border-0 ${isFullscreen ? "h-screen" : "h-[700px]"}`}
                    title={game.title}
                />
            </div>

            {/* Comments */}
            <section className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="font-head text-xl text-gray-800 mb-4">
                    💬 Komentar ({comments.length})
                </h2>

                {session ? (
                    <div className="flex gap-3 mb-6">
                        <input
                            type="text"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            onKeyDown={(e) =>
                                e.key === "Enter" && submitComment()
                            }
                            placeholder="Tulis komentar..."
                            className="flex-1 bg-gray-50 border-2 border-gray-100 rounded-full px-5 py-2 outline-none font-semibold text-sm focus:border-purple-300"
                        />
                        <button
                            onClick={submitComment}
                            className="bg-purple-600 text-white px-5 py-2 rounded-full font-bold text-sm hover:bg-purple-700 transition"
                        >
                            Kirim
                        </button>
                    </div>
                ) : (
                    <p className="text-sm text-gray-400 mb-4">
                        🔐 Login untuk berkomentar dan like
                    </p>
                )}

                <div className="space-y-4">
                    {comments.length === 0 && (
                        <p className="text-gray-400 text-sm">
                            Belum ada komentar. Jadilah yang pertama!
                        </p>
                    )}
                    {comments.map((c) => (
                        <div key={c.id} className="flex gap-3">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            {c.authorPhoto && (
                                <img
                                    src={c.authorPhoto}
                                    alt=""
                                    width="32"
                                    height="32"
                                    className="rounded-full w-8 h-8"
                                />
                            )}
                            <div>
                                <span className="font-bold text-sm text-gray-700">
                                    {c.authorName}
                                </span>
                                <p className="text-sm text-gray-600">
                                    {c.text}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}

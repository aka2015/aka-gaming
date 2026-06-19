"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, updateDoc, increment, collection, getDocs, addDoc } from "firebase/firestore";
import { useSession } from "next-auth/react";
import { db } from "@/lib/firebase";
import { Game, Comment } from "@/lib/types";

export default function GamePage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();
  const [game, setGame] = useState<Game | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/game/${id}`);
        if (res.ok) {
          const data = await res.json();
          setGame(data.game);

          if (data.fileExists) {
            fetch(`/api/game/${id}/play`, { method: "POST" }).catch(() => {});
          }
        }

        const cSnap = await getDocs(
          collection(db, "games", id, "comments")
        );
        const commentsData = cSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Comment));
        commentsData.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setComments(commentsData);
      } catch {
        // Error fetching game
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

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
      { id: Date.now().toString(), gameId: id, authorId: "", authorName: session.user!.name || "Anonim", authorPhoto: session.user!.image || "", text: commentText.trim(), createdAt: Date.now() },
      ...prev,
    ]);
    setCommentText("");
  }

  if (loading) return <div className="text-center py-20 text-gray-400">⏳ Memuat game...</div>;
  if (!game) return <div className="text-center py-20 text-gray-400">❌ Game tidak ditemukan</div>;

  return (
    <div className="max-w-[1200px] mx-auto px-5 py-8">
      {/* Game Info */}
      <div className="mb-4">
        <h1 className="font-head text-3xl text-gray-800">{game.emoji} {game.title}</h1>
        <p className="text-gray-500 mt-1">{game.description}</p>
        <div className="flex gap-3 mt-2 text-sm text-gray-400">
          <span>👤 {game.authorName}</span>
          <span>▶ {game.plays} plays</span>
          <span className="bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full text-xs font-bold">{game.category}</span>
        </div>
      </div>

      {/* Game iframe */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
        <iframe
          src={`/games/${game.id}/index.html`}
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          className="w-full h-[700px] border-0"
          title={game.title}
        />
      </div>

      {/* Comments */}
      <section className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="font-head text-xl text-gray-800 mb-4">💬 Komentar ({comments.length})</h2>

        {session ? (
          <div className="flex gap-3 mb-6">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitComment()}
              placeholder="Tulis komentar..."
              className="flex-1 bg-gray-50 border-2 border-gray-100 rounded-full px-5 py-2 outline-none font-semibold text-sm focus:border-purple-300"
            />
            <button onClick={submitComment} className="bg-purple-600 text-white px-5 py-2 rounded-full font-bold text-sm hover:bg-purple-700 transition">
              Kirim
            </button>
          </div>
        ) : (
          <p className="text-sm text-gray-400 mb-4">🔐 Login untuk berkomentar</p>
        )}

        <div className="space-y-4">
          {comments.length === 0 && <p className="text-gray-400 text-sm">Belum ada komentar. Jadilah yang pertama!</p>}
          {comments.map((c) => (
            <div key={c.id} className="flex gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {c.authorPhoto && <img src={c.authorPhoto} alt="" width="32" height="32" className="rounded-full w-8 h-8" />}
              <div>
                <span className="font-bold text-sm text-gray-700">{c.authorName}</span>
                <p className="text-sm text-gray-600">{c.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

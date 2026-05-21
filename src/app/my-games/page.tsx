"use client";

import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Game } from "@/lib/types";
import Link from "next/link";

export default function MyGames() {
  const { data: session } = useSession();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.email) return;
    async function fetch() {
      try {
        const q = query(
          collection(db, "games"),
          where("authorId", "==", session!.user!.email)
        );
        const snap = await getDocs(q);
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Game));
        data.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setGames(data);
      } catch {
        setGames([]);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [session]);

  async function publishGame(id: string) {
    const res = await window.fetch("/api/publish-game", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setGames((prev) => prev.map((g) => g.id === id ? { ...g, status: "published", publishedAt: Date.now() } : g));
    }
  }

  async function deleteGame(id: string) {
    if (!confirm("Yakin hapus game ini?")) return;
    const res = await window.fetch("/api/delete-game", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setGames((prev) => prev.filter((g) => g.id !== id));
    }
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-white rounded-2xl p-8 shadow-lg text-center max-w-sm">
          <div className="text-5xl mb-4">🔐</div>
          <h2 className="font-head text-xl text-gray-800 mb-2">Login Dulu!</h2>
          <p className="text-gray-500 mb-6 text-sm">Masuk untuk melihat game kamu</p>
          <button onClick={() => signIn("google")} className="btn-primary-custom">Masuk dengan Google</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[900px] mx-auto px-5 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-head text-3xl text-gray-800">🎮 Game Saya</h1>
          <p className="text-gray-500 text-sm mt-1">Maksimal 3 game ({games.length}/3)</p>
        </div>
        {games.length < 3 && (
          <Link href="/create" className="btn-primary-custom no-underline text-sm">
            + Buat Game Baru
          </Link>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">⏳ Memuat...</div>
      ) : games.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
          <div className="text-5xl mb-3">🎮</div>
          <h3 className="font-bold text-gray-600 mb-2">Belum ada game</h3>
          <p className="text-gray-400 mb-4">Buat game pertamamu dengan AI!</p>
          <Link href="/create" className="btn-primary-custom no-underline">🤖 Buat Game</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {games.map((game) => (
            <div key={game.id} className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4 border border-gray-100">
              <div className="text-4xl">{game.emoji || "🎮"}</div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-800 truncate">{game.title}</h3>
                <div className="flex gap-2 mt-1">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${game.status === "published" ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-600"}`}>
                    {game.status === "published" ? "✅ Published" : "📝 Draft"}
                  </span>
                  <span className="text-xs text-gray-400">▶ {game.plays} plays</span>
                </div>
              </div>
              <div className="flex gap-2">
                {game.status === "draft" && (
                  <button onClick={() => publishGame(game.id)} className="px-3 py-1.5 bg-green-500 text-white rounded-full text-xs font-bold hover:bg-green-600 transition">
                    🚀 Publish
                  </button>
                )}
                <Link href={`/game/${game.id}`} className="px-3 py-1.5 bg-purple-100 text-purple-600 rounded-full text-xs font-bold no-underline hover:bg-purple-200 transition">
                  👁 Lihat
                </Link>
                <button onClick={() => deleteGame(game.id)} className="px-3 py-1.5 bg-red-100 text-red-500 rounded-full text-xs font-bold hover:bg-red-200 transition">
                  🗑 Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Game } from "@/lib/types";

export default function AdminPage() {
  const { data: session } = useSession();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"all" | "published" | "draft">("all");

  useEffect(() => {
    fetchGames();
  }, []);

  async function fetchGames() {
    setLoading(true);
    const res = await fetch("/api/admin");
    if (!res.ok) {
      setError("Akses ditolak. Kamu bukan admin.");
      setLoading(false);
      return;
    }
    const data = await res.json();
    setGames(data.games);
    setLoading(false);
  }

  async function adminAction(action: string, gameId: string, commentId?: string) {
    await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, gameId, commentId }),
    });
    if (action === "delete-game") {
      setGames((prev) => prev.filter((g) => g.id !== gameId));
    } else {
      fetchGames();
    }
  }

  if (!session) {
    return <div className="text-center py-20 text-gray-400">🔐 Login diperlukan</div>;
  }

  if (error) {
    return <div className="text-center py-20 text-red-400">❌ {error}</div>;
  }

  const filtered = tab === "all" ? games : games.filter((g) => g.status === tab);

  return (
    <div className="max-w-[1100px] mx-auto px-5 py-10">
      <h1 className="font-head text-3xl text-gray-800 mb-2">👨‍💼 Admin Panel</h1>
      <p className="text-gray-500 text-sm mb-6">Kelola semua game dan komentar</p>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(["all", "published", "draft"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`cat-btn ${tab === t ? "active" : ""}`}
          >
            {t === "all" ? `📋 Semua (${games.length})` : t === "published" ? `✅ Published` : `📝 Draft`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">⏳ Memuat...</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((game) => (
            <div key={game.id} className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4 border border-gray-100">
              <div className="text-3xl">{game.emoji || "🎮"}</div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-800 text-sm truncate">{game.title}</h3>
                <div className="flex gap-2 mt-1 text-xs text-gray-400">
                  <span>👤 {game.authorName}</span>
                  <span>▶ {game.plays}</span>
                  <span className={`font-bold px-2 py-0.5 rounded-full ${game.status === "published" ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-600"}`}>
                    {game.status}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                {game.status === "published" ? (
                  <button onClick={() => adminAction("takedown", game.id)} className="px-3 py-1 bg-yellow-100 text-yellow-600 rounded-full text-xs font-bold hover:bg-yellow-200">
                    ⬇ Takedown
                  </button>
                ) : (
                  <button onClick={() => adminAction("approve", game.id)} className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-xs font-bold hover:bg-green-200">
                    ✅ Approve
                  </button>
                )}
                <button onClick={() => { if (confirm("Hapus game ini permanen?")) adminAction("delete-game", game.id); }} className="px-3 py-1 bg-red-100 text-red-500 rounded-full text-xs font-bold hover:bg-red-200">
                  🗑 Hapus
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p className="text-center text-gray-400 py-8">Tidak ada game</p>}
        </div>
      )}
    </div>
  );
}

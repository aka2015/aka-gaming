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
  const [creditEmail, setCreditEmail] = useState("");
  const [creditAmount, setCreditAmount] = useState(100);
  const [creditMsg, setCreditMsg] = useState("");
  const [search, setSearch] = useState("");
  const [onlineUsers, setOnlineUsers] = useState<{ email: string; displayName: string; photoURL: string; lastSeen: number }[]>([]);

  useEffect(() => {
    fetchGames();
    fetchOnlineUsers();
    const interval = setInterval(fetchOnlineUsers, 30000);
    return () => clearInterval(interval);
  }, []);

  async function fetchOnlineUsers() {
    try {
      const res = await fetch("/api/online");
      if (res.ok) {
        const data = await res.json();
        setOnlineUsers(data.users);
      }
    } catch {
      // ignore
    }
  }

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

  async function handleAddCredits(e: React.FormEvent) {
    e.preventDefault();
    setCreditMsg("");
    if (!creditEmail.trim() || creditAmount <= 0) return;

    const res = await fetch("/api/admin/add-credits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: creditEmail, amount: creditAmount }),
    });
    const data = await res.json();
    if (!res.ok) {
      setCreditMsg(`❌ ${data.error}`);
    } else {
      setCreditMsg(`✅ Berhasil! Credit baru user: ${data.newCredits}`);
      setCreditEmail("");
      setCreditAmount(100);
    }
  }

  if (!session) {
    return <div className="text-center py-20 text-gray-400">🔐 Login diperlukan</div>;
  }

  if (error) {
    return <div className="text-center py-20 text-red-400">❌ {error}</div>;
  }

  const filtered = (tab === "all" ? games : games.filter((g) => g.status === tab))
    .filter((g) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return g.title.toLowerCase().includes(q) || g.authorName.toLowerCase().includes(q) || g.id.toLowerCase().includes(q);
    });

  return (
    <div className="max-w-[1100px] mx-auto px-5 py-10">
      <h1 className="font-head text-3xl text-gray-800 mb-2">👨‍💼 Admin Panel</h1>
      <p className="text-gray-500 text-sm mb-6">Kelola semua game dan komentar</p>

      {/* Online Users */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl shadow-sm p-5 mb-6 border border-green-100">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-800">🟢 User Online</h2>
          <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">{onlineUsers.length} online</span>
        </div>
        {onlineUsers.length === 0 ? (
          <p className="text-sm text-gray-400">Tidak ada user online</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {onlineUsers.map((u) => (
              <div key={u.email} className="flex items-center gap-2 bg-white rounded-full px-3 py-1.5 border border-green-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {u.photoURL ? <img src={u.photoURL} alt="" width="24" height="24" className="rounded-full w-6 h-6" /> : <span className="text-sm">👤</span>}
                <span className="text-sm font-semibold text-gray-700 truncate max-w-[150px]">{u.displayName || u.email}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Credits Section */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl shadow-sm p-5 mb-6 border border-purple-100">
        <h2 className="font-bold text-gray-800 mb-3">💎 Tambah Credit User</h2>
        <form onSubmit={handleAddCredits} className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs font-bold text-gray-500 mb-1 block">Email User</label>
            <input
              type="email"
              value={creditEmail}
              onChange={(e) => setCreditEmail(e.target.value)}
              placeholder="user@gmail.com"
              className="w-full bg-white border-2 border-gray-200 rounded-lg px-3 py-2 outline-none text-sm focus:border-purple-400"
              required
            />
          </div>
          <div className="w-32">
            <label className="text-xs font-bold text-gray-500 mb-1 block">Jumlah Credit</label>
            <input
              type="number"
              value={creditAmount}
              onChange={(e) => setCreditAmount(parseInt(e.target.value) || 0)}
              min="1"
              className="w-full bg-white border-2 border-gray-200 rounded-lg px-3 py-2 outline-none text-sm focus:border-purple-400"
              required
            />
          </div>
          <button type="submit" className="bg-purple-600 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-purple-700 transition">
            💎 Kirim Credit
          </button>
        </form>
        {creditMsg && <p className="text-sm mt-2 font-bold">{creditMsg}</p>}
      </div>

      {/* Search & Tabs */}
      <div className="flex flex-wrap gap-3 mb-6 items-center">
        <div className="flex-1 min-w-[200px]">
          <div className="flex items-center gap-2 bg-white border-2 border-gray-100 rounded-full px-4 py-2">
            <span>🔍</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari game berdasarkan judul, author..."
              className="flex-1 bg-transparent outline-none text-sm font-semibold text-gray-700 placeholder:text-gray-400"
            />
          </div>
        </div>
        <div className="flex gap-2">
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

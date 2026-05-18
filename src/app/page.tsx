"use client";

import { useEffect, useState } from "react";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Game } from "@/lib/types";
import GameCard from "@/components/GameCard";

const categories = [
  { id: "all", label: "🎮 Semua" },
  { id: "action", label: "⚔️ Aksi" },
  { id: "puzzle", label: "🧩 Puzzle" },
  { id: "educational", label: "📚 Edukasi" },
  { id: "adventure", label: "🗺️ Petualangan" },
  { id: "strategy", label: "🏰 Strategi" },
];

export default function Home() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    async function fetchGames() {
      try {
        const q = query(
          collection(db, "games"),
          where("status", "==", "published"),
          orderBy("publishedAt", "desc")
        );
        const snap = await getDocs(q);
        const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Game));
        setGames(data);
      } catch {
        // Firestore belum dikonfigurasi — tampilkan kosong
        setGames([]);
      } finally {
        setLoading(false);
      }
    }
    fetchGames();
  }, []);

  const filtered = games.filter((g) => {
    const matchCat = activeCategory === "all" || g.category === activeCategory;
    const matchSearch = g.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden hero-gradient py-20 px-5 text-center text-white">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-[200px] h-[200px] bg-white/15 rounded-full -top-12 -left-15 animate-float" />
          <div className="absolute w-[150px] h-[150px] bg-white/15 rounded-full top-8 right-[10%] animate-float [animation-delay:1s]" />
          <div className="absolute w-[100px] h-[100px] bg-white/15 rounded-full bottom-5 left-[20%] animate-float [animation-delay:2s]" />
          <div className="absolute w-[250px] h-[250px] bg-white/15 rounded-full -bottom-20 -right-15 animate-float [animation-delay:0.5s]" />
        </div>
        <div className="relative z-10 max-w-[600px] mx-auto">
          <div className="inline-block bg-white/25 border-2 border-white/50 rounded-full px-4 py-1 text-sm font-bold mb-4 backdrop-blur-sm">
            ✨ Platform Game Anak Terbaik
          </div>
          <h1 className="font-head text-[clamp(2.2rem,6vw,3.5rem)] leading-tight mb-3 drop-shadow-lg">
            Selamat Datang di<br />
            <span className="gradient-text">AKA GAMING!</span>
          </h1>
          <p className="text-lg opacity-90 font-semibold mb-8">
            Mainkan game seru, atau buat game sendiri dengan AI! 🤖
          </p>
          <div className="text-3xl opacity-80 tracking-[8px] animate-bounce-art">
            🕹️ 🎯 🏆 🎲 ⭐
          </div>
        </div>
      </section>

      {/* Search & Filter */}
      <section className="max-w-[1200px] mx-auto px-5 -mt-6 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 bg-gray-50 rounded-full px-5 py-3 mb-4 border-2 border-gray-100">
            <span>🔍</span>
            <input
              type="text"
              placeholder="Cari game..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent outline-none font-semibold text-gray-700 placeholder:text-gray-400"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`cat-btn ${cat.id === activeCategory ? "active" : ""}`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Games Grid */}
      <section className="max-w-[1200px] mx-auto px-5 py-10">
        <h2 className="font-head text-2xl text-gray-800 mb-6">🕹️ Daftar Game</h2>

        {loading ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-3 animate-spin">⏳</div>
            <p>Memuat game...</p>
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-5xl mb-3">🎮</div>
            <h3 className="font-bold text-gray-600 mb-2">Belum ada game</h3>
            <p className="text-gray-400">Jadilah yang pertama membuat game dengan AI!</p>
          </div>
        )}
      </section>
    </>
  );
}

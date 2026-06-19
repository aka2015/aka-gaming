"use client";

import { useEffect, useState } from "react";
import { Game } from "@/lib/types";
import GameCard from "@/components/GameCard";
import DailyCheckin from "@/components/DailyCheckin";
import { useSession } from "next-auth/react";

const categories = [
  { id: "all", label: "🎮 Semua" },
  { id: "action", label: "⚔️ Aksi" },
  { id: "puzzle", label: "🧩 Puzzle" },
  { id: "educational", label: "📚 Edukasi" },
  { id: "adventure", label: "🗺️ Petualangan" },
  { id: "strategy", label: "🏰 Strategi" },
];

export default function Home() {
  const { data: session } = useSession();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [onlineEmails, setOnlineEmails] = useState<Set<string>>(new Set());
  const [showCheckin, setShowCheckin] = useState(false);
  const [checkinStreak, setCheckinStreak] = useState(0);
  const [canCheckin, setCanCheckin] = useState(false);

  useEffect(() => {
    if (!session?.user?.email) return;
    async function fetchCheckinStatus() {
      try {
        const res = await fetch("/api/credits");
        if (res.ok) {
          const data = await res.json();
          setCheckinStreak(data.checkinStreak || 0);
          setCanCheckin(data.canCheckin);
          if (data.canCheckin) {
            setShowCheckin(true);
          }
        }
      } catch {
        // ignore
      }
    }
    fetchCheckinStatus();
  }, [session?.user?.email]);

  useEffect(() => {
    async function fetchOnline() {
      try {
        const res = await fetch("/api/online");
        if (res.ok) {
          const data = await res.json();
          setOnlineEmails(new Set(data.users.map((u: { email: string }) => u.email)));
        }
      } catch {
        // ignore
      }
    }
    fetchOnline();
    const interval = setInterval(fetchOnline, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function fetchGames() {
      try {
        const res = await fetch("/api/games");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setGames(data.games || []);
      } catch {
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
              <GameCard key={game.id} game={game} isOnline={onlineEmails.has(game.authorId)} />
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

      {/* Info Section */}
      <section className="max-w-[1200px] mx-auto px-5 py-14">
        <div className="text-center mb-10">
          <h2 className="font-head text-3xl text-gray-800 mb-3">🎯 Mengapa Game Edukasi?</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Game edukasi membantu anak-anak mengembangkan keterampilan kognitif, kreativitas, dan 
            pemecahan masalah sambil bersenang-senang. Di AKA Gaming, setiap game dirancang untuk 
            memberikan manfaat belajar yang nyata.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 text-center">
            <div className="text-5xl mb-4">🧠</div>
            <h3 className="font-bold text-gray-800 mb-2">Melatih Logika</h3>
            <p className="text-sm text-gray-500">
              Game puzzle dan strategi melatih kemampuan berpikir logis, perencanaan, dan pengambilan 
              keputusan pada anak-anak.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 text-center">
            <div className="text-5xl mb-4">🎨</div>
            <h3 className="font-bold text-gray-800 mb-2">Mengembangkan Kreativitas</h3>
            <p className="text-sm text-gray-500">
              Dengan AI Game Builder, anak-anak bisa menuangkan imajinasi mereka menjadi game 
              interaktif yang bisa dimainkan bersama teman.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 text-center">
            <div className="text-5xl mb-4">📖</div>
            <h3 className="font-bold text-gray-800 mb-2">Belajar Sambil Bermain</h3>
            <p className="text-sm text-gray-500">
              Setiap game mengandung elemen edukatif seperti matematika, bahasa, sains, dan 
              keterampilan hidup yang dikemas dalam format menyenangkan.
            </p>
          </div>
        </div>
      </section>

      {/* AI Game Builder Section */}
      <section className="bg-gradient-to-r from-purple-600 to-pink-500 py-14 px-5 text-center text-white">
        <div className="max-w-[700px] mx-auto">
          <div className="text-6xl mb-4">🤖</div>
          <h2 className="font-head text-3xl mb-3">Buat Game Sendiri dengan AI!</h2>
          <p className="text-white/90 text-lg mb-2">
            Tidak punya kemampuan coding? Tidak masalah! Cukup tulis deskripsi game yang kamu 
            inginkan, dan AI kami akan membuatkannya secara instan.
          </p>
          <p className="text-white/80 text-sm mb-6">
            Dari game puzzle, petualangan, aksi, hingga edukasi — semua bisa dibuat dalam hitungan detik. 
            Kreasikan ide game-mu sekarang juga!
          </p>
          <a
            href="/create"
            className="inline-block bg-white text-purple-700 font-head text-lg px-8 py-4 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"
          >
            🚀 Mulai Buat Game
          </a>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-[1200px] mx-auto px-5 py-14">
        <h2 className="font-head text-3xl text-gray-800 text-center mb-10">📋 Cara Kerja</h2>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center text-2xl font-head text-purple-600 mx-auto mb-3">1</div>
            <h3 className="font-bold text-gray-800 mb-1">Login</h3>
            <p className="text-sm text-gray-500">Masuk dengan akun Google kamu</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center text-2xl font-head text-pink-600 mx-auto mb-3">2</div>
            <h3 className="font-bold text-gray-800 mb-1">Deskripsikan</h3>
            <p className="text-sm text-gray-500">Tulis ide game yang kamu inginkan</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center text-2xl font-head text-yellow-600 mx-auto mb-3">3</div>
            <h3 className="font-bold text-gray-800 mb-1">Generate</h3>
            <p className="text-sm text-gray-500">AI membuat game-mu secara otomatis</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-2xl font-head text-green-600 mx-auto mb-3">4</div>
            <h3 className="font-bold text-gray-800 mb-1">Mainkan!</h3>
            <p className="text-sm text-gray-500">Publikasikan dan bagikan ke teman-teman</p>
          </div>
        </div>
      </section>

      {showCheckin && session && (
        <DailyCheckin
          streak={checkinStreak}
          canCheckin={canCheckin}
          onClaim={() => {
            setCanCheckin(false);
            setCheckinStreak((s) => s + 1);
          }}
          onClose={() => setShowCheckin(false)}
        />
      )}
    </>
  );
}

"use client";

import { useState } from "react";
import { useSession, signIn } from "next-auth/react";

const TEMPLATES = [
  { label: "🐍 Snake Game", prompt: "Buatkan game snake klasik dengan kontrol arrow keys, skor, dan game over" },
  { label: "🏓 Pong", prompt: "Buatkan game pong 1 player melawan AI, dengan skor dan level" },
  { label: "🧠 Quiz", prompt: "Buatkan game quiz 10 soal pengetahuan umum untuk anak, dengan skor akhir" },
  { label: "🎯 Clicker", prompt: "Buatkan game clicker dimana pemain klik target yang muncul random, ada timer 30 detik dan skor" },
  { label: "🔢 Math", prompt: "Buatkan game matematika dimana pemain menjawab soal tambah/kurang/kali, ada timer dan level makin susah" },
  { label: "🃏 Memory", prompt: "Buatkan game memory card matching dengan emoji, 4x4 grid, hitung jumlah percobaan" },
];

const COST_GENERATE = 10;

interface CreditInfo {
  credits: number;
  adsWatchedToday: number;
  canWatchAds: boolean;
}

export default function CreateGame() {
  const { data: session } = useSession();
  const [prompt, setPrompt] = useState("");
  const [title, setTitle] = useState("");
  const [emoji, setEmoji] = useState("🎮");
  const [category, setCategory] = useState("puzzle");
  const [generating, setGenerating] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [credits, setCredits] = useState<CreditInfo>({ credits: 0, adsWatchedToday: 0, canWatchAds: false });
  const [loadingCredits, setLoadingCredits] = useState(true);
  const [watchingAd, setWatchingAd] = useState(false);

  const [creditsLoaded, setCreditsLoaded] = useState(false);

  async function loadCredits() {
    if (!session || creditsLoaded) return;
    setCreditsLoaded(true);
    try {
      const res = await fetch("/api/credits");
      if (res.ok) {
        const data = await res.json();
        setCredits({ credits: data.credits, adsWatchedToday: data.adsWatchedToday, canWatchAds: data.canWatchAds });
      }
    } catch {
      // ignore
    } finally {
      setLoadingCredits(false);
    }
  }

  if (session && !creditsLoaded) {
    void loadCredits();
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-white rounded-2xl p-8 shadow-lg text-center max-w-sm">
          <div className="text-5xl mb-4">🤖</div>
          <h2 className="font-head text-xl text-gray-800 mb-2">Login Dulu!</h2>
          <p className="text-gray-500 mb-6 text-sm">Masuk untuk membuat game dengan AI</p>
          <button onClick={() => signIn("google")} className="btn-primary-custom">
            Masuk dengan Google
          </button>
        </div>
      </div>
    );
  }

  async function handleWatchAd() {
    setWatchingAd(true);
    setError("");
    try {
      // Tunggu 15 detik (user lihat banner ad)
      await new Promise((r) => setTimeout(r, 15000));

      const res = await fetch("/api/credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "watch-ad" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCredits({ credits: data.credits, adsWatchedToday: data.adsWatchedToday, canWatchAds: data.adsWatchedToday < 5 });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal claim credit");
    } finally {
      setWatchingAd(false);
    }
  }

  async function handleGenerate(isRegenerate = false) {
    if (!prompt.trim()) return;
    if (credits.credits < COST_GENERATE) {
      setError("Credit tidak cukup! Tonton ads untuk dapat credit tambahan.");
      return;
    }
    setGenerating(true);
    setError("");
    setPreview(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, isRegenerate }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPreview(data.html);
      if (data.credits !== undefined) {
        setCredits((prev) => ({ ...prev, credits: data.credits }));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal generate game");
    } finally {
      setGenerating(false);
    }
  }

  async function handleSave() {
    if (!preview || !title.trim()) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/save-game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description: prompt, emoji, category, html: preview }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan game");
    } finally {
      setSaving(false);
    }
  }

  if (saved) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-white rounded-2xl p-8 shadow-lg text-center max-w-sm">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="font-head text-xl text-gray-800 mb-2">Game Tersimpan!</h2>
          <p className="text-gray-500 mb-6 text-sm">Game kamu sudah disimpan sebagai draft. Publish dari halaman &quot;Game Saya&quot;.</p>
          <a href="/my-games" className="btn-primary-custom no-underline">Lihat Game Saya</a>
        </div>
      </div>
    );
  }

  const creditPercent = Math.min((credits.credits / 200) * 100, 100);
  const creditColor = credits.credits <= 20 ? "bg-red-500" : credits.credits <= 50 ? "bg-yellow-500" : "bg-green-500";

  return (
    <div className="max-w-[900px] mx-auto px-5 py-10">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h1 className="font-head text-3xl text-gray-800 mb-1">🤖 Buat Game dengan AI</h1>
          <p className="text-gray-500 text-sm">Deskripsikan game yang ingin kamu buat, AI akan membuatkannya!</p>
        </div>

        {/* Credit display */}
        {!loadingCredits && (
          <div className="bg-white rounded-xl shadow-md px-4 py-3 min-w-[180px]">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">💎</span>
              <span className="font-bold text-sm text-gray-700">{credits.credits} Credit</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
              <div className={`${creditColor} h-2 rounded-full transition-all`} style={{ width: `${creditPercent}%` }} />
            </div>
            <p className="text-xs text-gray-400">Generate: {COST_GENERATE} credit</p>
            {credits.canWatchAds ? (
              <>
                <button
                  onClick={handleWatchAd}
                  disabled={watchingAd}
                  className="mt-2 w-full text-xs font-bold py-1.5 rounded-lg bg-gradient-to-r from-yellow-400 to-orange-400 text-white hover:from-yellow-500 hover:to-orange-500 transition disabled:opacity-50"
                >
                  {watchingAd ? "⏳ Nonton Ads..." : "📺 Tonton Ads (+20)"}
                </button>
                {watchingAd && (
                  <div className="mt-2 bg-gray-50 rounded-lg p-2 border border-gray-100">
                    <ins
                      className="adsbygoogle"
                      style={{ display: "block", textAlign: "center" }}
                      data-ad-layout="in-article"
                      data-ad-format="fluid"
                      data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
                      data-ad-slot={process.env.NEXT_PUBLIC_ADSENSE_BANNER_SLOT || ""}
                    />
                    <p className="text-center text-xs text-gray-400 mt-1">Tunggu 15 detik untuk dapat credit...</p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-xs text-gray-400 mt-1 text-center">Batas ads hari ini tercapai</p>
            )}
          </div>
        )}
      </div>

      {/* Template */}
      <div className="mb-6">
        <p className="text-sm font-bold text-gray-600 mb-2">💡 Template cepat:</p>
        <div className="flex flex-wrap gap-2">
          {TEMPLATES.map((t) => (
            <button key={t.label} onClick={() => setPrompt(t.prompt)} className="cat-btn text-xs">
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Prompt input */}
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Contoh: Buatkan game flappy bird dengan karakter burung emoji, ada skor dan pipe yang bergerak..."
        className="w-full h-32 bg-white border-2 border-gray-200 rounded-xl p-4 outline-none font-semibold text-gray-700 resize-none focus:border-purple-400 mb-4"
      />

      <button
        onClick={() => handleGenerate(false)}
        disabled={generating || !prompt.trim() || credits.credits < COST_GENERATE}
        className="btn-primary-custom disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {generating ? "⏳ Generating..." : `🚀 Generate Game (${COST_GENERATE} 💎)`}
      </button>

      {error && <p className="text-red-500 text-sm mt-3">❌ {error}</p>}

      {/* Preview */}
      {preview && (
        <div className="mt-8">
          <h2 className="font-head text-xl text-gray-800 mb-4">👀 Preview Game</h2>
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
            <iframe
              srcDoc={preview}
              sandbox="allow-scripts"
              className="w-full h-[450px] border-0"
              title="Game Preview"
            />
          </div>

          {/* Save form */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="font-bold text-gray-800 mb-4">💾 Simpan Game</h3>
            <div className="grid grid-cols-[auto_1fr] gap-3 items-center mb-4">
              <label className="text-sm font-bold text-gray-600">Judul:</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nama game kamu"
                className="bg-gray-50 border-2 border-gray-100 rounded-full px-4 py-2 outline-none text-sm font-semibold focus:border-purple-300"
              />
              <label className="text-sm font-bold text-gray-600">Emoji:</label>
              <input
                type="text"
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                className="bg-gray-50 border-2 border-gray-100 rounded-full px-4 py-2 outline-none text-sm w-20"
              />
              <label className="text-sm font-bold text-gray-600">Kategori:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-gray-50 border-2 border-gray-100 rounded-full px-4 py-2 outline-none text-sm font-semibold"
              >
                <option value="action">⚔️ Aksi</option>
                <option value="puzzle">🧩 Puzzle</option>
                <option value="educational">📚 Edukasi</option>
                <option value="adventure">🗺️ Petualangan</option>
                <option value="strategy">🏰 Strategi</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving || !title.trim()}
                className="btn-primary-custom disabled:opacity-50"
              >
                {saving ? "⏳ Menyimpan..." : "💾 Simpan Game"}
              </button>
              <button
                onClick={() => handleGenerate(true)}
                disabled={generating || credits.credits < COST_GENERATE}
                className="cat-btn disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🔄 Regenerate ({COST_GENERATE} 💎)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

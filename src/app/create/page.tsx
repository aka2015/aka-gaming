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

  async function handleGenerate() {
    if (!prompt.trim()) return;
    setGenerating(true);
    setError("");
    setPreview(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPreview(data.html);
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

  return (
    <div className="max-w-[900px] mx-auto px-5 py-10">
      <h1 className="font-head text-3xl text-gray-800 mb-2">🤖 Buat Game dengan AI</h1>
      <p className="text-gray-500 mb-8">Deskripsikan game yang ingin kamu buat, AI akan membuatkannya!</p>

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
        onClick={handleGenerate}
        disabled={generating || !prompt.trim()}
        className="btn-primary-custom disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {generating ? "⏳ Generating..." : "🚀 Generate Game"}
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
              <button onClick={handleGenerate} disabled={generating} className="cat-btn">
                🔄 Regenerate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

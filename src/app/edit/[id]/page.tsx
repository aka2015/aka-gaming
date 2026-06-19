"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";

const COST_REGENERATE = 10;

export default function EditGamePage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { data: session } = useSession();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [emoji, setEmoji] = useState("🎮");
    const [category, setCategory] = useState("puzzle");
    const [status, setStatus] = useState<"draft" | "published">("draft");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [regenerating, setRegenerating] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [error, setError] = useState("");
    const [credits, setCredits] = useState(0);
    const [prompt, setPrompt] = useState("");
    const [previewHtml, setPreviewHtml] = useState<string | null>(null);
    const [showRegenInput, setShowRegenInput] = useState(false);
    const [step, setStep] = useState("");
    const regenSteps = ["🧠 Membaca ide...", "✍️ Menulis ulang kode...", "🎨 Memperbaiki tampilan...", "✨ Menyelesaikan..."];
    const stepTimer = useRef<ReturnType<typeof setInterval>>(undefined);

    useEffect(() => {
        if (!session?.user?.email) return;
        async function load() {
            try {
                const [gameRes, creditRes] = await Promise.all([
                    fetch(`/api/update-game?gameId=${id}`),
                    fetch("/api/credits"),
                ]);
                if (!gameRes.ok) {
                    const d = await gameRes.json();
                    throw new Error(d.error || "Gagal load");
                }
                const game = await gameRes.json();
                setTitle(game.title || "");
                setDescription(game.description || "");
                setEmoji(game.emoji || "🎮");
                setCategory(game.category || "puzzle");
                setStatus(game.status || "draft");
                if (creditRes.ok) {
                    const c = await creditRes.json();
                    setCredits(c.credits || 0);
                }
            } catch (e) {
                setError(e instanceof Error ? e.message : "Gagal memuat game");
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [session?.user?.email, id]);

    useEffect(() => {
        return () => { if (stepTimer.current) clearInterval(stepTimer.current); };
    }, []);

    async function handleSave() {
        if (!title.trim()) return;
        setSaving(true);
        setError("");
        try {
            const res = await fetch("/api/update-game", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ gameId: id, title, description, emoji, category }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            router.refresh();
        } catch (e) {
            setError(e instanceof Error ? e.message : "Gagal menyimpan");
        } finally {
            setSaving(false);
        }
    }

    async function handleRegenerate() {
        if (!prompt.trim() || credits < COST_REGENERATE) return;
        setRegenerating(true);
        setError("");
        setStep(regenSteps[0]);
        let si = 0;
        stepTimer.current = setInterval(() => {
            si = (si + 1) % regenSteps.length;
            setStep(regenSteps[si]);
        }, 3000);
        try {
            const res = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt, isRegenerate: true, previousHtml: "" }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setPreviewHtml(data.html);
            if (data.credits !== undefined) setCredits(data.credits);
            setShowRegenInput(false);
            setPrompt("");
        } catch (e) {
            setError(e instanceof Error ? e.message : "Gagal regenerate");
        } finally {
            clearInterval(stepTimer.current);
            setRegenerating(false);
            setStep("");
        }
    }

    async function handleSaveHtml() {
        if (!previewHtml) return;
        setSaving(true);
        setError("");
        try {
            const res = await fetch("/api/update-game", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ gameId: id, title, description, emoji, category, html: previewHtml }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setPreviewHtml(null);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Gagal menyimpan");
        } finally {
            setSaving(false);
        }
    }

    async function handlePublish() {
        setPublishing(true);
        setError("");
        try {
            const newStatus = status === "published" ? "draft" : "published";
            const res = await fetch("/api/publish-game", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Gagal");
            setStatus(newStatus);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Gagal publish");
        } finally {
            setPublishing(false);
        }
    }

    if (!session) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="bg-white rounded-2xl p-8 shadow-lg text-center max-w-sm">
                    <div className="text-5xl mb-4">🔐</div>
                    <h2 className="font-head text-xl text-gray-800 mb-2">Login Dulu!</h2>
                    <button onClick={() => signIn("google")} className="btn-primary-custom">Masuk dengan Google</button>
                </div>
            </div>
        );
    }

    if (loading) {
        return <div className="text-center py-20 text-gray-400">⏳ Memuat...</div>;
    }

    if (error && !title) {
        return (
            <div className="text-center py-20 text-gray-400">
                <div className="text-5xl mb-3">❌</div>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="max-w-[800px] mx-auto px-5 py-10">
            <div className="flex items-center justify-between mb-6">
                <h1 className="font-head text-2xl text-gray-800">✏️ Edit Game</h1>
                <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-400">💎 {credits}</span>
                    <button
                        onClick={handlePublish}
                        disabled={publishing}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition disabled:opacity-50 ${
                            status === "published"
                                ? "bg-green-100 text-green-600 hover:bg-green-200"
                                : "bg-yellow-100 text-yellow-600 hover:bg-yellow-200"
                        }`}
                    >
                        {publishing ? "⏳..." : status === "published" ? "✅ Published" : "📝 Draft — Publish"}
                    </button>
                </div>
            </div>

            {error && <p className="text-red-500 text-sm mb-4">❌ {error}</p>}

            {/* Form */}
            <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4 mb-6">
                <div>
                    <label className="text-sm font-bold text-gray-600 block mb-1">Judul</label>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-gray-50 border-2 border-gray-100 rounded-full px-4 py-2 outline-none text-sm font-semibold focus:border-purple-300" />
                </div>
                <div>
                    <label className="text-sm font-bold text-gray-600 block mb-1">Deskripsi</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-2 outline-none text-sm text-gray-600 resize-none focus:border-purple-300" />
                </div>
                <div className="flex gap-4">
                    <div>
                        <label className="text-sm font-bold text-gray-600 block mb-1">Emoji</label>
                        <input type="text" value={emoji} onChange={(e) => setEmoji(e.target.value)} className="bg-gray-50 border-2 border-gray-100 rounded-full px-4 py-2 outline-none text-sm w-20 text-center" />
                    </div>
                    <div className="flex-1">
                        <label className="text-sm font-bold text-gray-600 block mb-1">Kategori</label>
                        <select value={category} onChange={(e) => setCategory(e.target.value)} className="bg-gray-50 border-2 border-gray-100 rounded-full px-4 py-2 outline-none text-sm font-semibold w-full">
                            <option value="action">⚔️ Aksi</option>
                            <option value="puzzle">🧩 Puzzle</option>
                            <option value="educational">📚 Edukasi</option>
                            <option value="adventure">🗺️ Petualangan</option>
                            <option value="strategy">🏰 Strategi</option>
                        </select>
                    </div>
                </div>
                <div className="flex gap-3 pt-2">
                    <button onClick={handleSave} disabled={saving || !title.trim()} className="btn-primary-custom !py-2 !px-6 !text-sm disabled:opacity-50">
                        {saving ? "⏳ Menyimpan..." : "💾 Simpan Perubahan"}
                    </button>
                    <button onClick={() => setShowRegenInput(!showRegenInput)} className="cat-btn text-sm">
                        🔄 Regenerate dengan AI
                    </button>
                    <a href={`/game/${id}`} className="cat-btn text-sm no-underline inline-flex items-center gap-1">
                        👁 Lihat Game
                    </a>
                </div>
            </div>

            {/* Regenerate input */}
            {showRegenInput && (
                <div className="bg-purple-50 rounded-2xl p-6 border border-purple-100 mb-6">
                    <h3 className="font-bold text-purple-800 mb-2">🔄 Regenerate Game dengan AI</h3>
                    <p className="text-xs text-purple-600 mb-3">Deskripsikan perubahan yang kamu inginkan. Biaya: {COST_REGENERATE} 💎</p>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Contoh: Buat game ini lebih seru dengan tambahan level 2, warna lebih cerah, dan efek suara..."
                        rows={3}
                        className="w-full bg-white border-2 border-purple-200 rounded-xl p-3 outline-none text-sm text-gray-700 resize-none focus:border-purple-400 mb-3"
                    />
                    <div className="flex gap-2">
                        <button onClick={handleRegenerate} disabled={regenerating || !prompt.trim() || credits < COST_REGENERATE} className="btn-primary-custom !text-sm disabled:opacity-50">
                            {regenerating ? "⏳ Meregenerasi..." : `🚀 Regenerate (${COST_REGENERATE} 💎)`}
                        </button>
                        <button onClick={() => setShowRegenInput(false)} className="cat-btn text-sm">Batal</button>
                    </div>
                </div>
            )}

            {/* Regenerating overlay */}
            {regenerating && (
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-12 flex flex-col items-center justify-center mb-6 border border-gray-100">
                    <div className="text-5xl mb-4 animate-bounce">🤖</div>
                    <div className="flex gap-1.5 mb-4">
                        <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce [animation-delay:0ms]" />
                        <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce [animation-delay:150ms]" />
                        <div className="w-3 h-3 bg-yellow-500 rounded-full animate-bounce [animation-delay:300ms]" />
                    </div>
                    <p className="text-gray-700 font-bold text-lg">{step}</p>
                </div>
            )}

            {/* Preview regenerated HTML */}
            {previewHtml && (
                <div className="mb-6">
                    <h3 className="font-head text-lg text-gray-800 mb-3">👀 Preview Hasil Regenerasi</h3>
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-3">
                        <iframe srcDoc={previewHtml} sandbox="allow-scripts" className="w-full h-[500px] border-0" title="Preview" />
                    </div>
                    <div className="flex gap-3">
                        <button onClick={handleSaveHtml} disabled={saving} className="btn-primary-custom !text-sm disabled:opacity-50">
                            {saving ? "⏳..." : "💾 Simpan Hasil"}
                        </button>
                        <button onClick={() => setPreviewHtml(null)} className="cat-btn text-sm">Batalkan</button>
                    </div>
                </div>
            )}

            <div className="text-center">
                <a href="/my-games" className="text-sm text-gray-400 hover:text-purple-600 transition">← Kembali ke Game Saya</a>
            </div>
        </div>
    );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession, signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

const TEMPLATES = [
    {
        category: "🎮 Klasik",
        items: [
            {
                label: "🐍 Snake",
                prompt: "Buatkan game snake klasik dengan kontrol arrow keys, skor, dan game over. Tema warna-warni untuk anak.",
            },
            {
                label: "🏓 Pong",
                prompt: "Buatkan game pong 1 player melawan AI, dengan skor dan level.",
            },
            {
                label: "🎯 Clicker",
                prompt: "Buatkan game clicker dimana pemain klik target yang muncul random, ada timer 30 detik dan skor.",
            },
        ],
    },
    {
        category: "🧠 Edukasi",
        items: [
            {
                label: "🔢 Math Challenge",
                prompt: "Buatkan game matematika dimana pemain menjawab soal tambah/kurang/kali, ada timer dan level makin susah.",
            },
            {
                label: "🧠 Quiz",
                prompt: "Buatkan game quiz 10 soal pengetahuan umum untuk anak, dengan skor akhir.",
            },
            {
                label: "🃏 Memory",
                prompt: "Buatkan game memory card matching dengan emoji, 4x4 grid, hitung jumlah percobaan.",
            },
            {
                label: "🔤 Huruf Hilang",
                prompt: "Buatkan game melengkapi huruf hilang dalam kata bergambar untuk anak. 5 level, visual cerah.",
            },
        ],
    },
    {
        category: "🚀 Petualangan",
        items: [
            {
                label: "🚀 Space Shooter",
                prompt: "Buatkan game space shooter sederhana: pemain mengendalikan pesawat, tembak asteroid, kumpulkan skor.",
            },
            {
                label: "🏃 Runner",
                prompt: "Buatkan game endless runner: karakter lompat menghindari rintangan, kumpulkan koin dan skor.",
            },
            {
                label: "🌍 Petualangan Pilih Jalan",
                prompt: "Buatkan game cerita petualangan pilih jalan (choose your own adventure) untuk anak dengan 3 ending.",
            },
        ],
    },
];

const COST_GENERATE = 10;
const COST_REGENERATE = 10;
const COST_ITERATE = 5;

interface CreditInfo {
    credits: number;
    adsWatchedToday: number;
    canWatchAds: boolean;
}

export default function CreateGame() {
    const { data: session } = useSession();
    const searchParams = useSearchParams();
    const forkId = searchParams.get("forkId");
    const [forkSource, setForkSource] = useState<{
        id: string;
        title: string;
        authorName: string;
    } | null>(null);

    const [prompt, setPrompt] = useState("");
    const [title, setTitle] = useState("");
    const [emoji, setEmoji] = useState("🎮");
    const [category, setCategory] = useState("puzzle");
    const [generating, setGenerating] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [saved, setSaved] = useState(false);
    const [credits, setCredits] = useState<CreditInfo>({
        credits: 0,
        adsWatchedToday: 0,
        canWatchAds: false,
    });
    const [loadingCredits, setLoadingCredits] = useState(true);
    const [watchingAd, setWatchingAd] = useState(false);
    const [iterateNotes, setIterateNotes] = useState("");
    const [showIterate, setShowIterate] = useState(false);
    const [selectedTemplateCategory, setSelectedTemplateCategory] = useState<
        string | null
    >(null);

    useEffect(() => {
        if (!session?.user?.email) return;
        async function loadCredits() {
            try {
                const res = await fetch("/api/credits");
                if (res.ok) {
                    const data = await res.json();
                    setCredits({
                        credits: data.credits,
                        adsWatchedToday: data.adsWatchedToday,
                        canWatchAds: data.canWatchAds,
                    });
                }
            } catch {
                // ignore
            } finally {
                setLoadingCredits(false);
            }
        }
        loadCredits();
    }, [session?.user?.email]);

    useEffect(() => {
        if (!forkId) return;
        async function loadForkSource() {
            try {
                const res = await fetch(`/api/game-meta/${forkId!}`);
                if (res.ok) {
                    const data = await res.json();
                    setForkSource({
                        id: forkId!,
                        title: data.title || "Game",
                        authorName: data.authorName || "Anonim",
                    });
                    setPrompt(data.prompt || "");
                    setTitle(`${data.title || "Game"} (Fork)`);
                    setEmoji(data.emoji || "🎮");
                    setCategory(data.category || "puzzle");
                }
            } catch {
                // ignore
            }
        }
        loadForkSource();
    }, [forkId]);

    const handleWatchAd = useCallback(async () => {
        setWatchingAd(true);
        setError("");
        try {
            await new Promise((r) => setTimeout(r, 15000));
            const res = await fetch("/api/credits", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "watch-ad" }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setCredits({
                credits: data.credits,
                adsWatchedToday: data.adsWatchedToday,
                canWatchAds: data.adsWatchedToday < 5,
            });
        } catch (e) {
            setError(e instanceof Error ? e.message : "Gagal claim credit");
        } finally {
            setWatchingAd(false);
        }
    }, []);

    const handleGenerate = useCallback(
        async (mode: "generate" | "regenerate" | "iterate") => {
            if (!prompt.trim()) return;
            const cost =
                mode === "iterate"
                    ? COST_ITERATE
                    : mode === "regenerate"
                      ? COST_REGENERATE
                      : COST_GENERATE;
            if (credits.credits < cost) {
                setError(
                    "Credit tidak cukup! Tonton ads untuk dapat credit tambahan.",
                );
                return;
            }
            setGenerating(true);
            setError("");
            if (mode === "generate") setPreview(null);
            try {
                const body: Record<string, unknown> = { prompt };
                if (mode === "regenerate") {
                    body.isRegenerate = true;
                    body.previousHtml = preview;
                }
                if (mode === "iterate") {
                    body.mode = "iterate";
                    body.previousHtml = preview;
                    body.iterateNotes = iterateNotes;
                }
                const res = await fetch("/api/generate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error);
                setPreview(data.html);
                if (data.credits !== undefined) {
                    setCredits((prev) => ({ ...prev, credits: data.credits }));
                }
            } catch (e) {
                setError(
                    e instanceof Error ? e.message : "Gagal generate game",
                );
            } finally {
                setGenerating(false);
            }
        },
        [prompt, credits.credits, preview, iterateNotes],
    );

    // eslint-disable-next-line react-compiler/react-compiler
    const handleSave = useCallback(async () => {
        if (!preview || !title.trim()) return;
        setSaving(true);
        setError("");
        try {
            const body: Record<string, unknown> = {
                title,
                description: forkId ? prompt : prompt,
                emoji,
                category,
                html: preview,
            };
            if (forkId) {
                body.forkedFrom = forkId;
                body.forkedFromTitle = forkSource?.title || "";
            }
            const res = await fetch("/api/save-game", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setSaved(true);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Gagal menyimpan game");
        } finally {
            setSaving(false);
        }
    }, [
        preview,
        title,
        emoji,
        category,
        prompt,
        forkId,
        forkSource?.title ?? "",
    ]);

    if (!session) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="bg-white rounded-2xl p-8 shadow-lg text-center max-w-sm">
                    <div className="text-5xl mb-4">🤖</div>
                    <h2 className="font-head text-xl text-gray-800 mb-2">
                        Login Dulu!
                    </h2>
                    <p className="text-gray-500 mb-6 text-sm">
                        Masuk untuk membuat game dengan AI
                    </p>
                    <button
                        onClick={() => signIn("google")}
                        className="btn-primary-custom"
                    >
                        Masuk dengan Google
                    </button>
                </div>
            </div>
        );
    }

    if (saved) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="bg-white rounded-2xl p-8 shadow-lg text-center max-w-sm">
                    <div className="text-5xl mb-4">🎉</div>
                    <h2 className="font-head text-xl text-gray-800 mb-2">
                        Game Tersimpan!
                    </h2>
                    <p className="text-gray-500 mb-6 text-sm">
                        Game kamu sudah disimpan sebagai draft. Publish dari
                        halaman &quot;Game Saya&quot;.
                    </p>
                    <a
                        href="/my-games"
                        className="btn-primary-custom no-underline"
                    >
                        Lihat Game Saya
                    </a>
                </div>
            </div>
        );
    }

    const creditPercent = Math.min((credits.credits / 200) * 100, 100);
    const creditColor =
        credits.credits <= 20
            ? "bg-red-500"
            : credits.credits <= 50
              ? "bg-yellow-500"
              : "bg-green-500";

    return (
        <div className="max-w-[900px] mx-auto px-5 py-10">
            <div className="flex items-start justify-between mb-2">
                <div>
                    <h1 className="font-head text-3xl text-gray-800 mb-1">
                        {forkId ? "🍴 Fork Game" : "🤖 Buat Game dengan AI"}
                    </h1>
                    <p className="text-gray-500 text-sm">
                        {forkSource
                            ? `Fork dari "${forkSource.title}" oleh ${forkSource.authorName}. Ubah prompt untuk membuat variasi.`
                            : "Deskripsikan game yang ingin kamu buat, AI akan membuatkannya!"}
                    </p>
                </div>

                {!loadingCredits && (
                    <div className="bg-white rounded-xl shadow-md px-4 py-3 min-w-[180px]">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">💎</span>
                            <span className="font-bold text-sm text-gray-700">
                                {credits.credits} Credit
                            </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                            <div
                                className={`${creditColor} h-2 rounded-full transition-all`}
                                style={{ width: `${creditPercent}%` }}
                            />
                        </div>
                        <p className="text-xs text-gray-400">
                            Generate: {COST_GENERATE} credit
                        </p>
                        {credits.canWatchAds ? (
                            <>
                                <button
                                    onClick={handleWatchAd}
                                    disabled={watchingAd}
                                    className="mt-2 w-full text-xs font-bold py-1.5 rounded-lg bg-gradient-to-r from-yellow-400 to-orange-400 text-white hover:from-yellow-500 hover:to-orange-500 transition disabled:opacity-50"
                                >
                                    {watchingAd
                                        ? "⏳ Nonton Ads..."
                                        : "📺 Tonton Ads (+20)"}
                                </button>
                                {watchingAd && (
                                    <div className="mt-2 bg-gray-50 rounded-lg p-2 border border-gray-100">
                                        <p className="text-center text-xs text-gray-400 mt-1">
                                            Tunggu 15 detik untuk dapat
                                            credit...
                                        </p>
                                    </div>
                                )}
                            </>
                        ) : (
                            <p className="text-xs text-gray-400 mt-1 text-center">
                                Batas ads hari ini tercapai
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Template */}
            {!forkId && (
                <div className="mb-6">
                    <p className="text-sm font-bold text-gray-600 mb-2">
                        💡 Pilih template cepat:
                    </p>
                    <div className="flex flex-wrap gap-2 mb-3">
                        <button
                            onClick={() =>
                                setSelectedTemplateCategory(
                                    selectedTemplateCategory ? null : "open",
                                )
                            }
                            className="cat-btn text-xs"
                        >
                            {selectedTemplateCategory
                                ? "🔼 Tutup Template"
                                : "📂 Lihat Semua Template"}
                        </button>
                    </div>
                    {selectedTemplateCategory && (
                        <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
                            {TEMPLATES.map((group) => (
                                <div
                                    key={group.category}
                                    className="mb-4 last:mb-0"
                                >
                                    <p className="text-xs font-bold text-purple-600 mb-2">
                                        {group.category}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {group.items.map((t) => (
                                            <button
                                                key={t.label}
                                                onClick={() => {
                                                    setPrompt(t.prompt);
                                                    setSelectedTemplateCategory(
                                                        null,
                                                    );
                                                }}
                                                className="cat-btn text-xs"
                                            >
                                                {t.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {!selectedTemplateCategory &&
                        TEMPLATES.flatMap((g) => g.items)
                            .slice(0, 4)
                            .map((t) => (
                                <button
                                    key={t.label}
                                    onClick={() => setPrompt(t.prompt)}
                                    className="cat-btn text-xs mr-2 mb-2"
                                >
                                    {t.label}
                                </button>
                            ))}
                </div>
            )}

            {/* Prompt input */}
            <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Contoh: Buatkan game flappy bird dengan karakter burung emoji, ada skor dan pipe yang bergerak..."
                className="w-full h-32 bg-white border-2 border-gray-200 rounded-xl p-4 outline-none font-semibold text-gray-700 resize-none focus:border-purple-400 mb-4"
            />

            <button
                onClick={() => handleGenerate("generate")}
                disabled={
                    generating ||
                    !prompt.trim() ||
                    credits.credits < COST_GENERATE
                }
                className="btn-primary-custom disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {generating
                    ? "⏳ Generating..."
                    : `🚀 Generate Game (${COST_GENERATE} 💎)`}
            </button>

            {error && <p className="text-red-500 text-sm mt-3">❌ {error}</p>}

            {/* Preview */}
            {preview && (
                <div className="mt-8">
                    <h2 className="font-head text-xl text-gray-800 mb-4">
                        👀 Preview Game
                    </h2>
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
                        <iframe
                            srcDoc={preview}
                            sandbox="allow-scripts"
                            className="w-full h-[450px] border-0"
                            title="Game Preview"
                        />
                    </div>

                    {/* Iterate notes */}
                    {showIterate && (
                        <div className="bg-purple-50 rounded-2xl p-4 mb-4 border border-purple-100">
                            <h3 className="font-bold text-purple-800 mb-2">
                                ✏️ Iterasi / Perbaiki
                            </h3>
                            <p className="text-xs text-purple-600 mb-2">
                                Tulis perubahan spesifik yang diinginkan (biaya{" "}
                                {COST_ITERATE} 💎). Contoh: "Tambahkan level 2",
                                "Buat warna lebih cerah", "Perbaiki bug skor".
                            </p>
                            <textarea
                                value={iterateNotes}
                                onChange={(e) =>
                                    setIterateNotes(e.target.value)
                                }
                                placeholder="Tulis perubahan yang diinginkan..."
                                className="w-full h-24 bg-white border-2 border-purple-200 rounded-xl p-3 outline-none font-semibold text-gray-700 resize-none focus:border-purple-400 mb-3"
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleGenerate("iterate")}
                                    disabled={
                                        generating ||
                                        !iterateNotes.trim() ||
                                        credits.credits < COST_ITERATE
                                    }
                                    className="btn-primary-custom disabled:opacity-50 text-sm"
                                >
                                    {generating
                                        ? "⏳ Iterating..."
                                        : `🛠 Iterasi (${COST_ITERATE} 💎)`}
                                </button>
                                <button
                                    onClick={() => setShowIterate(false)}
                                    className="cat-btn text-sm"
                                >
                                    Batal
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Save form */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h3 className="font-bold text-gray-800 mb-4">
                            💾 Simpan Game
                        </h3>
                        <div className="grid grid-cols-[auto_1fr] gap-3 items-center mb-4">
                            <label className="text-sm font-bold text-gray-600">
                                Judul:
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Nama game kamu"
                                className="bg-gray-50 border-2 border-gray-100 rounded-full px-4 py-2 outline-none text-sm font-semibold focus:border-purple-300"
                            />
                            <label className="text-sm font-bold text-gray-600">
                                Emoji:
                            </label>
                            <input
                                type="text"
                                value={emoji}
                                onChange={(e) => setEmoji(e.target.value)}
                                className="bg-gray-50 border-2 border-gray-100 rounded-full px-4 py-2 outline-none text-sm w-20"
                            />
                            <label className="text-sm font-bold text-gray-600">
                                Kategori:
                            </label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="bg-gray-50 border-2 border-gray-100 rounded-full px-4 py-2 outline-none text-sm font-semibold"
                            >
                                <option value="action">⚔️ Aksi</option>
                                <option value="puzzle">🧩 Puzzle</option>
                                <option value="educational">📚 Edukasi</option>
                                <option value="adventure">
                                    🗺️ Petualangan
                                </option>
                                <option value="strategy">🏰 Strategi</option>
                            </select>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={handleSave}
                                disabled={saving || !title.trim()}
                                className="btn-primary-custom disabled:opacity-50"
                            >
                                {saving ? "⏳ Menyimpan..." : "💾 Simpan Game"}
                            </button>
                            <button
                                onClick={() => handleGenerate("regenerate")}
                                disabled={
                                    generating ||
                                    credits.credits < COST_REGENERATE
                                }
                                className="cat-btn disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                🔄 Regenerate ({COST_REGENERATE} 💎)
                            </button>
                            {!showIterate && (
                                <button
                                    onClick={() => setShowIterate(true)}
                                    disabled={generating}
                                    className="cat-btn disabled:opacity-50"
                                >
                                    🛠 Iterasi ({COST_ITERATE} 💎)
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSession, signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

const TEMPLATES = [
    {
        category: "🎮 Klasik",
        items: [
            { label: "🐍 Snake", prompt: "Buatkan game snake klasik dengan kontrol arrow keys, skor, dan game over. Tema warna-warni untuk anak." },
            { label: "🏓 Pong", prompt: "Buatkan game pong 1 player melawan AI, dengan skor dan level." },
            { label: "🎯 Clicker", prompt: "Buatkan game clicker dimana pemain klik target yang muncul random, ada timer 30 detik dan skor." },
        ],
    },
    {
        category: "🧠 Edukasi",
        items: [
            { label: "🔢 Math Challenge", prompt: "Buatkan game matematika dimana pemain menjawab soal tambah/kurang/kali, ada timer dan level makin susah." },
            { label: "🧠 Quiz", prompt: "Buatkan game quiz 10 soal pengetahuan umum untuk anak, dengan skor akhir." },
            { label: "🃏 Memory", prompt: "Buatkan game memory card matching dengan emoji, 4x4 grid, hitung jumlah percobaan." },
            { label: "🔤 Huruf Hilang", prompt: "Buatkan game melengkapi huruf hilang dalam kata bergambar untuk anak. 5 level, visual cerah." },
        ],
    },
    {
        category: "🚀 Petualangan",
        items: [
            { label: "🚀 Space Shooter", prompt: "Buatkan game space shooter sederhana: pemain mengendalikan pesawat, tembak asteroid, kumpulkan skor." },
            { label: "🏃 Runner", prompt: "Buatkan game endless runner: karakter lompat menghindari rintangan, kumpulkan koin dan skor." },
            { label: "🌍 Petualangan Pilih Jalan", prompt: "Buatkan game cerita petualangan pilih jalan (choose your own adventure) untuk anak dengan 3 ending." },
        ],
    },
];

const COST_GENERATE = 10;
const COST_REGENERATE = 10;
const COST_ITERATE = 5;

const GENERATING_STEPS = [
    { icon: "🧠", text: "AI membaca ide game kamu..." },
    { icon: "💭", text: "Membayangkan gameplay seru..." },
    { icon: "✍️", text: "Menulis kode HTML..." },
    { icon: "🎨", text: "Menambahkan warna dan gaya..." },
    { icon: "⚡", text: "Menambahkan animasi keren..." },
    { icon: "🧪", text: "Menguji coba game..." },
    { icon: "✨", text: "Memastikan semua berfungsi..." },
    { icon: "🎀", text: "Mempercantik tampilan..." },
    { icon: "🛡️", text: "Memeriksa keamanan..." },
];

function GeneratingOverlay() {
    const [stepIndex, setStepIndex] = useState(0);
    const [dots, setDots] = useState("");

    useEffect(() => {
        const stepTimer = setInterval(() => {
            setStepIndex((prev) => (prev + 1) % GENERATING_STEPS.length);
        }, 3000);
        const dotTimer = setInterval(() => {
            setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
        }, 500);
        return () => {
            clearInterval(stepTimer);
            clearInterval(dotTimer);
        };
    }, []);

    const step = GENERATING_STEPS[stepIndex];

    return (
        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center z-20">
            <div className="text-6xl mb-4 animate-bounce">{step.icon}</div>
            <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce [animation-delay:0ms]" />
                <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce [animation-delay:150ms]" />
                <div className="w-3 h-3 bg-yellow-500 rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
            <p className="text-gray-700 font-bold text-lg mt-4">
                {step.text}
                <span className="text-purple-600">{dots}</span>
            </p>
            <p className="text-gray-400 text-sm mt-1">
                Lagi serius bikin game terbaik buat kamu!
            </p>
        </div>
    );
}

interface CreditInfo {
    credits: number;
    adsWatchedToday: number;
    canWatchAds: boolean;
}

interface ChatEntry {
    id: string;
    type: "user" | "ai";
    prompt?: string;
    notes?: string;
    mode: "generate" | "regenerate" | "iterate";
    timestamp: number;
}

export default function CreateGame() {
    return (
        <Suspense fallback={<div className="text-center py-12 text-gray-400">⏳ Memuat...</div>}>
            <CreateGameContent />
        </Suspense>
    );
}

function CreateGameContent() {
    const { data: session } = useSession();
    const searchParams = useSearchParams();
    const forkId = searchParams.get("forkId");
    const [forkSource, setForkSource] = useState<{ id: string; title: string; authorName: string } | null>(null);

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
    const [iterateNotes, setIterateNotes] = useState("");
    const [showSaveForm, setShowSaveForm] = useState(false);
    const [chatHistory, setChatHistory] = useState<ChatEntry[]>([]);
    const [selectedTemplateCategory, setSelectedTemplateCategory] = useState<string | null>(null);
    const [showIterate, setShowIterate] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const promptRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (!session?.user?.email) return;
        async function loadCredits() {
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
        loadCredits();
    }, [session?.user?.email]);

    useEffect(() => {
        if (!forkId) return;
        async function loadForkSource() {
            try {
                const res = await fetch(`/api/game-meta/${forkId!}`);
                if (res.ok) {
                    const data = await res.json();
                    setForkSource({ id: forkId!, title: data.title || "Game", authorName: data.authorName || "Anonim" });
                    setPrompt(data.prompt || "");
                    setTitle(`${data.title || "Game"} (Fork)`);
                    setEmoji(data.emoji || "🎮");
                    setCategory(data.category || "puzzle");
                }
            } catch { /* ignore */ }
        }
        loadForkSource();
    }, [forkId]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatHistory]);

    const handleWatchAd = useCallback(async () => {
        setWatchingAd(true);
        setError("");
        try {
            await new Promise((r) => setTimeout(r, 15000));
            const res = await fetch("/api/credits", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "watch-ad" }) });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setCredits({ credits: data.credits, adsWatchedToday: data.adsWatchedToday, canWatchAds: data.adsWatchedToday < 5 });
            window.dispatchEvent(new Event("credits-updated"));
        } catch (e) {
            setError(e instanceof Error ? e.message : "Gagal claim credit");
        } finally {
            setWatchingAd(false);
        }
    }, []);

    const handleGenerate = useCallback(async (mode: "generate" | "regenerate" | "iterate") => {
        if (!prompt.trim()) return;
        const cost = mode === "iterate" ? COST_ITERATE : mode === "regenerate" ? COST_REGENERATE : COST_GENERATE;
        if (credits.credits < cost) {
            setError("Credit tidak cukup! Tonton ads untuk dapat credit tambahan.");
            return;
        }
        setGenerating(true);
        setError("");
        if (mode === "generate") {
            setPreview(null);
            setShowSaveForm(false);
        }
        try {
            const body: Record<string, unknown> = { prompt };
            if (mode === "regenerate") { body.isRegenerate = true; body.previousHtml = preview; }
            if (mode === "iterate") { body.mode = "iterate"; body.previousHtml = preview; body.iterateNotes = iterateNotes; }
            const res = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setPreview(data.html);

            setChatHistory((prev) => [
                ...prev,
                { id: Date.now().toString(), type: "user", prompt, notes: mode === "iterate" ? iterateNotes : undefined, mode, timestamp: Date.now() },
                { id: (Date.now() + 1).toString(), type: "ai", mode, timestamp: Date.now() },
            ]);

            if (data.credits !== undefined) {
                setCredits((prev) => ({ ...prev, credits: data.credits }));
                window.dispatchEvent(new Event("credits-updated"));
            }

            setPrompt("");
            if (mode === "iterate") setIterateNotes("");
        } catch (e) {
            setError(e instanceof Error ? e.message : "Gagal generate game");
        } finally {
            setGenerating(false);
        }
    }, [prompt, credits.credits, preview, iterateNotes]);

    const handleSave = useCallback(async () => {
        if (!preview || !title.trim()) return;
        setSaving(true);
        setError("");
        try {
            const body: Record<string, unknown> = { title, description: forkId ? prompt : prompt, emoji, category, html: preview };
            if (forkId) { body.forkedFrom = forkId; body.forkedFromTitle = forkSource?.title || ""; }
            const res = await fetch("/api/save-game", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setSaved(true);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Gagal menyimpan game");
        } finally {
            setSaving(false);
        }
    }, [preview, title, emoji, category, prompt, forkId, forkSource?.title ?? ""]);

    const submitPrompt = () => {
        if (generating || !prompt.trim()) return;
        if (preview) {
            handleGenerate("iterate");
        } else {
            handleGenerate("generate");
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submitPrompt();
        }
    };

    if (!session) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="bg-white rounded-2xl p-8 shadow-lg text-center max-w-sm">
                    <div className="text-5xl mb-4">🤖</div>
                    <h2 className="font-head text-xl text-gray-800 mb-2">Login Dulu!</h2>
                    <p className="text-gray-500 mb-6 text-sm">Masuk untuk membuat game dengan AI</p>
                    <button onClick={() => signIn("google")} className="btn-primary-custom">Masuk dengan Google</button>
                </div>
            </div>
        );
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
        <div className="h-[calc(100vh-64px)] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-white shrink-0">
                <div className="flex items-center gap-4">
                    <h1 className="font-head text-xl text-gray-800">
                        {forkId ? "🍴 Fork Game" : "🤖 Buat Game"}
                    </h1>
                    {forkSource && (
                        <span className="text-xs text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                            Fork dari &quot;{forkSource.title}&quot;
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    {/* Templates toggle */}
                    <button
                        onClick={() => setSelectedTemplateCategory(selectedTemplateCategory ? null : "open")}
                        className="cat-btn text-xs"
                    >
                        {selectedTemplateCategory ? "🔼 Tutup" : "📂 Template"}
                    </button>

                    {/* Credit */}
                    {!loadingCredits && (
                        <div className="flex items-center gap-2 bg-purple-50 px-3 py-1.5 rounded-full border border-purple-100">
                            <span className="text-sm">💎</span>
                            <span className="font-bold text-sm text-purple-700">{credits.credits}</span>
                            <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                <div className={`${creditColor} h-1.5 rounded-full transition-all`} style={{ width: `${creditPercent}%` }} />
                            </div>
                            {credits.canWatchAds && (
                                <button onClick={handleWatchAd} disabled={watchingAd} className="text-xs font-bold text-yellow-600 hover:text-yellow-700 ml-1 disabled:opacity-50">
                                    {watchingAd ? "⏳" : "📺 +20"}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Templates panel */}
            {selectedTemplateCategory && (
                <div className="bg-white border-b border-gray-100 px-5 py-3 shrink-0">
                    <div className="flex gap-4 overflow-x-auto">
                        {TEMPLATES.map((group) => (
                            <div key={group.category} className="shrink-0">
                                <p className="text-xs font-bold text-purple-600 mb-2">{group.category}</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {group.items.map((t) => (
                                        <button key={t.label} onClick={() => { setPrompt(t.prompt); setSelectedTemplateCategory(null); promptRef.current?.focus(); }} className="cat-btn text-xs">
                                            {t.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Main area: chat + preview */}
            <div className="flex-1 flex overflow-hidden">
                {/* Chat history sidebar */}
                {chatHistory.length > 0 && (
                    <div className="w-72 bg-white border-r border-gray-100 overflow-y-auto shrink-0 hidden lg:block">
                        <div className="p-4">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Riwayat</h3>
                            <div className="space-y-2">
                                {chatHistory.filter((e) => e.type === "user").map((entry) => (
                                    <div key={entry.id} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <span className="text-xs">{entry.mode === "iterate" ? "🛠" : entry.mode === "regenerate" ? "🔄" : "🚀"}</span>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase">
                                                {entry.mode === "iterate" ? "Iterasi" : entry.mode === "regenerate" ? "Regenerate" : "Generate"}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-600 line-clamp-3">{entry.prompt}</p>
                                        {entry.notes && (
                                            <p className="text-[10px] text-purple-500 mt-1 italic line-clamp-2">✏️ {entry.notes}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Preview area */}
                <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
                    {preview ? (
                        <div className="flex-1 relative">
                            <iframe
                                srcDoc={preview}
                                sandbox="allow-scripts"
                                className="absolute inset-0 w-full h-full border-0"
                                title="Game Preview"
                            />
                            {generating && <GeneratingOverlay />}
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-center p-8 relative">
                            {generating ? (
                                <GeneratingOverlay />
                            ) : (
                                <div>
                                    <div className="text-7xl mb-4 animate-float">🤖</div>
                                    <h2 className="font-head text-2xl text-gray-800 mb-2">Buat Game dengan AI</h2>
                                    <p className="text-gray-500 max-w-md mx-auto">
                                        Deskripsikan game yang kamu inginkan di kolom bawah, lalu klik Generate. AI akan membuatkannya secara instan!
                                    </p>
                                    <div className="mt-6 flex flex-wrap justify-center gap-2">
                                        {TEMPLATES.flatMap((g) => g.items).slice(0, 6).map((t) => (
                                            <button key={t.label} onClick={() => { setPrompt(t.prompt); promptRef.current?.focus(); }} className="cat-btn text-xs">
                                                {t.label}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-400 mt-4">
                                        💰 Biaya: Generate {COST_GENERATE} 💎 | Regenerate {COST_REGENERATE} 💎 | Iterasi {COST_ITERATE} 💎
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Mobile chat history toggle */}
                    {chatHistory.length > 0 && preview && (
                        <div className="lg:hidden border-t border-gray-100 bg-white max-h-32 overflow-y-auto">
                            <div className="px-4 py-2 flex gap-2 overflow-x-auto">
                                {chatHistory.filter((e) => e.type === "user").map((entry) => (
                                    <div key={entry.id} className="bg-gray-50 rounded-lg px-3 py-2 border border-gray-100 shrink-0 min-w-[160px]">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">
                                            {entry.mode === "iterate" ? "🛠 Iterasi" : entry.mode === "regenerate" ? "🔄 Regenerate" : "🚀 Generate"}
                                        </p>
                                        <p className="text-xs text-gray-600 truncate">{entry.prompt}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Save form collapsible */}
                    {preview && showSaveForm && (
                        <div className="bg-white border-t border-gray-100 px-5 py-4 shrink-0">
                            <div className="max-w-3xl mx-auto">
                                <div className="flex items-center gap-3 mb-3">
                                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nama game kamu" className="flex-1 bg-gray-50 border-2 border-gray-100 rounded-full px-4 py-2 outline-none text-sm font-semibold focus:border-purple-300" />
                                    <input type="text" value={emoji} onChange={(e) => setEmoji(e.target.value)} className="bg-gray-50 border-2 border-gray-100 rounded-full px-4 py-2 outline-none text-sm w-20 text-center" />
                                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="bg-gray-50 border-2 border-gray-100 rounded-full px-4 py-2 outline-none text-sm font-semibold">
                                        <option value="action">⚔️ Aksi</option>
                                        <option value="puzzle">🧩 Puzzle</option>
                                        <option value="educational">📚 Edukasi</option>
                                        <option value="adventure">🗺️ Petualangan</option>
                                        <option value="strategy">🏰 Strategi</option>
                                    </select>
                                    <button onClick={handleSave} disabled={saving || !title.trim()} className="btn-primary-custom !py-2 !px-5 !text-sm disabled:opacity-50 shrink-0">
                                        {saving ? "⏳..." : "💾 Simpan"}
                                    </button>
                                    <button onClick={() => setShowSaveForm(false)} className="cat-btn text-sm">Batal</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Floating input bar */}
                    <div className="bg-white border-t border-gray-100 px-5 py-3 shrink-0">
                        <div className="max-w-4xl mx-auto">
                            {error && <p className="text-red-500 text-xs mb-2">❌ {error}</p>}

                            <div className="flex items-center gap-2">
                                <div className="flex-1 relative">
                                    <textarea
                                        ref={promptRef}
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Deskripsikan game yang kamu inginkan..."
                                        rows={2}
                                        className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3.5 outline-none text-sm font-semibold text-gray-700 resize-none focus:border-purple-400 pr-12"
                                    />
                                    {preview && !showSaveForm && (
                                        <button
                                            onClick={() => setShowSaveForm(true)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 hover:text-purple-600 transition px-2 py-1 rounded-lg hover:bg-gray-100"
                                            title="Simpan Game"
                                        >
                                            💾
                                        </button>
                                    )}
                                </div>

                                {/* Action buttons */}
                                <div className="flex gap-1.5 shrink-0">
                                    {preview && (
                                        <button
                                            onClick={() => handleGenerate("regenerate")}
                                            disabled={generating || credits.credits < COST_REGENERATE}
                                            className="px-3.5 py-3.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-200 transition disabled:opacity-50"
                                            title="Regenerate (10 💎)"
                                        >
                                            🔄
                                        </button>
                                    )}
                                    <button
                                        onClick={submitPrompt}
                                        disabled={generating || !prompt.trim() || credits.credits < (preview ? COST_ITERATE : COST_GENERATE)}
                                        className="px-5 py-3.5 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl text-sm font-bold hover:from-purple-700 hover:to-pink-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {generating ? (
                                            <>⏳ Generating...</>
                                        ) : preview ? (
                                            <>🛠 Iterasi ({COST_ITERATE}💎)</>
                                        ) : (
                                            <>🚀 Generate ({COST_GENERATE}💎)</>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 mt-1.5">
                                <p className="text-[10px] text-gray-400">
                                    {generating ? "⏳ AI sedang membuat game..." : "Enter untuk kirim, Shift+Enter untuk baris baru"}
                                </p>
                                {preview && (
                                    <button
                                        onClick={() => setShowIterate(!showIterate)}
                                        className="text-[10px] text-purple-500 font-bold hover:text-purple-700 transition"
                                    >
                                        {showIterate ? "✕ Tutup catatan iterasi" : "✏️ + Catatan iterasi"}
                                    </button>
                                )}
                            </div>

                            {/* Iterate notes */}
                            {showIterate && preview && (
                                <div className="mt-2 bg-purple-50 rounded-xl p-3 border border-purple-100">
                                    <p className="text-xs text-purple-600 mb-2 font-bold">✏️ Catatan Perubahan</p>
                                    <textarea
                                        value={iterateNotes}
                                        onChange={(e) => setIterateNotes(e.target.value)}
                                        placeholder="Contoh: Tambahkan level 2, buat warna lebih cerah..."
                                        rows={2}
                                        className="w-full bg-white border-2 border-purple-200 rounded-xl p-3 outline-none text-sm text-gray-700 resize-none focus:border-purple-400 mb-2"
                                    />
                                    <p className="text-[10px] text-purple-400">Catatan ini akan dikirim bersama prompt ke AI</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div ref={chatEndRef} />
        </div>
    );
}

"use client";

import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { useState, useEffect, useCallback } from "react";

export default function Navbar() {
  const { data: session } = useSession();
  const [credits, setCredits] = useState(0);

  const fetchCredits = useCallback(() => {
    if (!session) return;
    fetch("/api/credits")
      .then((r) => r.json())
      .then((d) => setCredits(d.credits))
      .catch(() => {});
  }, [session]);

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  useEffect(() => {
    window.addEventListener("credits-updated", fetchCredits);
    return () => window.removeEventListener("credits-updated", fetchCredits);
  }, [fetchCredits]);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b-2 border-purple-100 shadow-sm">
      <div className="max-w-[1200px] mx-auto px-5 h-16 flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2 no-underline">
          <span className="text-3xl animate-wobble">🎮</span>
          <span className="font-head text-2xl text-purple-600">AKA GAMING</span>
        </Link>

        <nav className="flex gap-2 flex-1">
          <Link href="/" className="font-bold text-purple-600 bg-purple-50 px-4 py-1.5 rounded-full text-sm">
            Beranda
          </Link>
          <Link href="/create" className="font-bold text-gray-500 hover:text-purple-600 hover:bg-purple-50 px-4 py-1.5 rounded-full text-sm transition">
            🤖 Buat Game
          </Link>
          {session && (
            <Link href="/my-games" className="font-bold text-gray-500 hover:text-purple-600 hover:bg-purple-50 px-4 py-1.5 rounded-full text-sm transition">
              🎮 Game Saya
            </Link>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          {session && credits > 0 && (
            <div className="flex items-center gap-1 bg-gradient-to-r from-purple-50 to-pink-50 px-3 py-1 rounded-full border border-purple-100">
              <span className="text-sm">💎</span>
              <span className="font-bold text-sm text-purple-700">{credits}</span>
            </div>
          )}

          {session ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={session.user?.image || ""} alt="avatar" width="32" height="32" className="rounded-full border-2 border-purple-500" />
              <span className="font-bold text-sm text-gray-700 max-w-[100px] truncate">{session.user?.name}</span>
              <button onClick={() => signOut()} className="px-3 py-1 border-2 border-red-400 text-red-500 rounded-full text-xs font-bold hover:bg-red-500 hover:text-white transition">
                Keluar
              </button>
            </>
          ) : (
            <button onClick={() => signIn("google")} className="flex items-center gap-2 px-5 py-2 bg-white border-2 border-gray-200 rounded-full font-bold text-sm cursor-pointer hover:border-purple-600 hover:text-purple-600 hover:shadow-md transition">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width="18" height="18" />
              Masuk
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

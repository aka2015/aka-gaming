"use client";

import Link from "next/link";

export default function Navbar() {
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
        </nav>

        <div className="ml-auto">
          <button className="flex items-center gap-2 px-5 py-2 bg-white border-2 border-gray-200 rounded-full font-bold text-sm cursor-pointer hover:border-purple-600 hover:text-purple-600 hover:shadow-md transition">
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width={18} />
            Masuk
          </button>
        </div>
      </div>
    </header>
  );
}

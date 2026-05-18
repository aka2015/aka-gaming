import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-gray-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-yellow-400">
          🎮 AKA Gaming
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/create" className="hover:text-yellow-400 transition">
            Buat Game
          </Link>
          <Link href="/my-games" className="hover:text-yellow-400 transition">
            Game Saya
          </Link>
        </div>
      </div>
    </nav>
  );
}

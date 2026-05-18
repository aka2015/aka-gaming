import Link from "next/link";
import { Game } from "@/lib/types";

export default function GameCard({ game }: { game: Game }) {
  return (
    <Link href={`/game/${game.id}`} className="game-card block no-underline">
      <div className="h-40 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-5xl">
        {game.emoji || "🎮"}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-gray-800 mb-1">{game.title}</h3>
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{game.description}</p>
        <div className="flex items-center justify-between">
          <span className="inline-block bg-purple-50 text-purple-600 text-xs font-bold px-3 py-1 rounded-full">
            {game.category}
          </span>
          <span className="text-xs text-gray-400">▶ {game.plays} plays</span>
        </div>
        <div className="mt-2 text-xs text-gray-400">
          👤 {game.authorName}
        </div>
      </div>
    </Link>
  );
}

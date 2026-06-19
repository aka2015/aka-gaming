import Link from "next/link";
import { Game } from "@/lib/types";

export default function GameCard({
    game,
    isOnline,
}: {
    game: Game;
    isOnline?: boolean;
}) {
    return (
        <Link
            href={`/game/${game.id}`}
            className="game-card block no-underline"
        >
            <div className="h-40 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center overflow-hidden relative">
                <img
                    src={`/api/game-file/${game.id}?type=thumbnail`}
                    alt={game.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                        const parent = (e.target as HTMLImageElement)
                            .parentElement;
                        if (parent) {
                            const fallback = document.createElement("span");
                            fallback.className = "text-5xl";
                            fallback.textContent = game.emoji || "🎮";
                            parent.appendChild(fallback);
                        }
                    }}
                />
            </div>
            <div className="p-4">
                <h3 className="font-bold text-gray-800 mb-1">{game.title}</h3>
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                    {game.description}
                </p>
                <div className="flex items-center justify-between">
                    <span className="inline-block bg-purple-50 text-purple-600 text-xs font-bold px-3 py-1 rounded-full">
                        {game.category}
                    </span>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span>❤️ {game.likes || 0}</span>
                        <span>▶ {game.plays} plays</span>
                    </div>
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                    {isOnline ? (
                        <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    ) : (
                        <span className="inline-block w-2 h-2 rounded-full bg-gray-300" />
                    )}
                    <span>{game.authorName}</span>
                    {game.forkedFrom && (
                        <span className="bg-blue-50 text-blue-500 px-1.5 py-0.5 rounded">
                            🍴 fork
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
}

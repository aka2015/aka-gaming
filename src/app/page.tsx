export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">
          🎮 Selamat Datang di <span className="text-yellow-400">AKA Gaming</span>
        </h1>
        <p className="text-gray-400 text-lg">
          Buat game sendiri dengan AI, atau mainkan game buatan teman-teman!
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-6">Game Terbaru</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Placeholder cards */}
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-gray-800 rounded-lg p-6 border border-gray-700"
            >
              <div className="h-32 bg-gray-700 rounded mb-4 flex items-center justify-center text-gray-500">
                Game #{i}
              </div>
              <h3 className="font-semibold">Game Placeholder</h3>
              <p className="text-sm text-gray-400">Belum ada game</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

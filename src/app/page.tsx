export default function Home() {
  const categories = [
    { id: "all", label: "🎮 Semua" },
    { id: "action", label: "⚔️ Aksi" },
    { id: "puzzle", label: "🧩 Puzzle" },
    { id: "educational", label: "📚 Edukasi" },
    { id: "adventure", label: "🗺️ Petualangan" },
    { id: "strategy", label: "🏰 Strategi" },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden hero-gradient py-20 px-5 text-center text-white">
        {/* Bubbles */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-[200px] h-[200px] bg-white/15 rounded-full -top-12 -left-15 animate-float" />
          <div className="absolute w-[150px] h-[150px] bg-white/15 rounded-full top-8 right-[10%] animate-float [animation-delay:1s]" />
          <div className="absolute w-[100px] h-[100px] bg-white/15 rounded-full bottom-5 left-[20%] animate-float [animation-delay:2s]" />
          <div className="absolute w-[250px] h-[250px] bg-white/15 rounded-full -bottom-20 -right-15 animate-float [animation-delay:0.5s]" />
          <div className="absolute w-[80px] h-[80px] bg-white/15 rounded-full top-1/2 left-1/2 animate-float [animation-delay:1.5s]" />
        </div>

        <div className="relative z-10 max-w-[600px] mx-auto">
          <div className="inline-block bg-white/25 border-2 border-white/50 rounded-full px-4 py-1 text-sm font-bold mb-4 backdrop-blur-sm">
            ✨ Platform Game Anak Terbaik
          </div>
          <h1 className="font-head text-[clamp(2.2rem,6vw,3.5rem)] leading-tight mb-3 drop-shadow-lg">
            Selamat Datang di<br />
            <span className="gradient-text">AKA GAMING!</span>
          </h1>
          <p className="text-lg opacity-90 font-semibold mb-8">
            Mainkan game seru, atau buat game sendiri dengan AI! 🤖
          </p>
          <button className="btn-primary-custom">
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width={22} />
            Masuk &amp; Main Sekarang!
          </button>
          <div className="text-3xl mt-10 opacity-80 tracking-[8px] animate-bounce-art">
            🕹️ 🎯 🏆 🎲 ⭐
          </div>
        </div>
      </section>

      {/* Search & Filter */}
      <section className="max-w-[1200px] mx-auto px-5 -mt-6 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 bg-gray-50 rounded-full px-5 py-3 mb-4 border-2 border-gray-100">
            <span>🔍</span>
            <input
              type="text"
              placeholder="Cari game..."
              className="flex-1 bg-transparent outline-none font-semibold text-gray-700 placeholder:text-gray-400"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`cat-btn ${cat.id === "all" ? "active" : ""}`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Games Grid */}
      <section className="max-w-[1200px] mx-auto px-5 py-10">
        <h2 className="font-head text-2xl text-gray-800 mb-6">🕹️ Daftar Game</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: "Tower Defense", cat: "🏰 Strategi", desc: "Pertahankan kastil dari serangan musuh!" },
            { title: "Catch The Box", cat: "⚔️ Aksi", desc: "Tangkap kotak sebanyak mungkin!" },
            { title: "Math Quest", cat: "📚 Edukasi", desc: "Petualangan matematika yang seru!" },
            { title: "Memory Card", cat: "🧩 Puzzle", desc: "Latih ingatanmu dengan kartu!" },
            { title: "Spelling Bee", cat: "📚 Edukasi", desc: "Eja kata dengan benar!" },
            { title: "Kingdom Adventure", cat: "🗺️ Petualangan", desc: "Jelajahi kerajaan yang luas!" },
          ].map((game, i) => (
            <div key={i} className="game-card">
              <div className="h-40 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-5xl">
                {["🏰", "📦", "🔢", "🃏", "🐝", "👑"][i]}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-800 mb-1">{game.title}</h3>
                <p className="text-sm text-gray-500 mb-3">{game.desc}</p>
                <span className="inline-block bg-purple-50 text-purple-600 text-xs font-bold px-3 py-1 rounded-full">
                  {game.cat}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

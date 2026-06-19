export default function AboutPage() {
  return (
    <div className="max-w-[800px] mx-auto px-5 py-16">
      <h1 className="font-head text-3xl text-gray-800 mb-8">Tentang AKA Gaming</h1>

      <div className="prose prose-gray max-w-none space-y-6 text-gray-600 leading-relaxed">
        <section className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-100">
          <h2 className="font-head text-2xl text-purple-700 mb-4">🎮 Portal Game Edukasi Anak Indonesia</h2>
          <p className="text-lg">
            AKA Gaming adalah platform game edukasi online yang dirancang khusus untuk anak-anak Indonesia. 
            Kami menggabungkan keseruan bermain game dengan pembelajaran interaktif berbasis teknologi 
            Artificial Intelligence (AI).
          </p>
        </section>

        <section>
          <h2 className="font-head text-xl text-gray-700 mb-3">🎯 Misi Kami</h2>
          <p>
            Misi kami adalah menyediakan pengalaman belajar yang menyenangkan melalui game interaktif. 
            Kami percaya bahwa anak-anak belajar lebih baik ketika mereka bersenang-senang. 
            Setiap game di platform kami dirancang untuk mengembangkan:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li><strong>Kreativitas</strong> — game builder, puzzle, dan petualangan</li>
            <li><strong>Logika dan Matematika</strong> — game puzzle, strategi, dan math quest</li>
            <li><strong>Kosa Kata dan Bahasa</strong> — game kata, spelling bee, dan cerita interaktif</li>
            <li><strong>Kesadaran Lingkungan</strong> — game daur ulang dan edukasi lingkungan</li>
            <li><strong>Keterampilan Digital</strong> — pengenalan teknologi melalui game builder</li>
          </ul>
        </section>

        <section>
          <h2 className="font-head text-xl text-gray-700 mb-3">🤖 Teknologi AI</h2>
          <p>
            Salah satu fitur unggulan kami adalah kemampuan untuk membuat game menggunakan AI. 
            Cukup deskripsikan game yang Anda inginkan, dan AI kami akan membuatkannya secara otomatis. 
            Fitur ini memungkinkan siapa saja — bahkan tanpa pengalaman coding — untuk membuat game 
            edukasi mereka sendiri.
          </p>
        </section>

        <section>
          <h2 className="font-head text-xl text-gray-700 mb-3">👨‍👩‍👧‍👦 Untuk Siapa?</h2>
          <p>
            Platform kami dirancang untuk:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Anak-anak</strong> usia 5-15 tahun yang ingin bermain game seru sambil belajar</li>
            <li><strong>Orang tua</strong> yang mencari konten digital positif dan edukatif untuk anak-anak mereka</li>
            <li><strong>Guru</strong> yang membutuhkan media pembelajaran interaktif</li>
            <li><strong>Kreator konten</strong> yang ingin membuat game edukasi dengan mudah</li>
          </ul>
        </section>

        <section>
          <h2 className="font-head text-xl text-gray-700 mb-3">🔒 Keamanan dan Privasi</h2>
          <p>
            Keamanan anak-anak adalah prioritas utama kami. Platform kami:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Tidak mengumpulkan data pribadi yang tidak perlu</li>
            <li>Semua konten dimoderasi untuk memastikan keamanan</li>
            <li>Menggunakan enkripsi untuk melindungi data pengguna</li>
            <li>Tidak mengizinkan konten dewasa atau kekerasan</li>
          </ul>
        </section>

        <section className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
          <h2 className="font-head text-lg text-gray-700 mb-3">Kontak Kami</h2>
          <p>
            Punya pertanyaan, saran, atau masukan? Jangan ragu untuk{" "}
            <a href="/contact" className="text-purple-600 underline font-semibold">menghubungi kami</a>.
          </p>
        </section>
      </div>
    </div>
  );
}

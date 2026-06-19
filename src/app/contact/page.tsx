export default function ContactPage() {
  return (
    <div className="max-w-[800px] mx-auto px-5 py-16">
      <h1 className="font-head text-3xl text-gray-800 mb-4">Hubungi Kami</h1>
      <p className="text-gray-500 mb-10">
        Punya pertanyaan, saran, atau masukan? Kami senang mendengar dari Anda!
      </p>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
          <h2 className="font-head text-xl text-gray-700 mb-6">📧 Email</h2>
          <p className="text-gray-600 mb-2">Silakan kirim email ke:</p>
          <a
            href="mailto:hasanzuke@gmail.com"
            className="text-purple-600 font-bold text-lg hover:underline"
          >
            hasanzuke@gmail.com
          </a>
          <p className="text-sm text-gray-400 mt-4">
            Kami akan merespon dalam 1-2 hari kerja.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
          <h2 className="font-head text-xl text-gray-700 mb-6">💬 Media Sosial</h2>
          <p className="text-gray-600 mb-4">Ikuti kami untuk update game terbaru:</p>
          <ul className="space-y-3">
            <li>
              <a
                href="https://github.com/aka2015"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-gray-600 hover:text-purple-600 transition font-semibold"
              >
                <span className="text-2xl">🐙</span>
                GitHub
              </a>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 md:col-span-2">
          <h2 className="font-head text-xl text-gray-700 mb-4">❓ Pertanyaan Umum</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-gray-700">Bagaimana cara membuat game?</h3>
              <p className="text-gray-500 text-sm mt-1">
                Login dengan Google, buka halaman &quot;Buat Game&quot;, deskripsikan game yang Anda inginkan, 
                dan AI akan membuatkannya secara otomatis.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-700">Berapa biaya untuk membuat game?</h3>
              <p className="text-gray-500 text-sm mt-1">
                Setiap pengguna mendapat 100 credit gratis setiap hari. Membuat game membutuhkan 10 credit. 
                Anda bisa mendapatkan credit tambahan dengan menonton iklan.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-700">Apakah game yang saya buat aman?</h3>
              <p className="text-gray-500 text-sm mt-1">
                Ya, semua game yang dibuat melalui AI kami melalui proses sanitasi untuk memastikan 
                tidak ada kode berbahaya. Game Anda juga hanya bisa dilihat oleh Anda sampai Anda 
                mempublikasikannya.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

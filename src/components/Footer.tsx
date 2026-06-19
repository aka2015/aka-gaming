import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12 mt-12">
      <div className="max-w-[1200px] mx-auto px-5">
        <div className="grid md:grid-cols-3 gap-8 mb-8 text-sm">
          <div>
            <h3 className="font-head text-white text-lg mb-3">🎮 AKA Gaming</h3>
            <p className="leading-relaxed text-gray-400">
              Platform game edukasi anak Indonesia. Mainkan game seru, buat game sendiri dengan AI,
              dan belajar sambil bermain.
            </p>
          </div>
          <div>
            <h3 className="font-head text-white text-lg mb-3">Tautan</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-gray-400 hover:text-purple-400 transition">Tentang Kami</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-purple-400 transition">Hubungi Kami</Link></li>
              <li><Link href="/privacy" className="text-gray-400 hover:text-purple-400 transition">Kebijakan Privasi</Link></li>
              <li><Link href="/terms" className="text-gray-400 hover:text-purple-400 transition">Syarat &amp; Ketentuan</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-head text-white text-lg mb-3">Ikuti Kami</h3>
            <a
              href="https://github.com/aka2015"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-purple-400 transition flex items-center gap-2"
            >
              <span>🐙</span> GitHub
            </a>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-6 text-center space-y-3">
          <p className="text-sm text-gray-500">
            <span className="inline-block bg-purple-600/20 text-purple-300 px-3 py-1 rounded-full text-xs font-bold mr-2">🤖 AI-Generated</span>
            Semua game dan konten di platform ini dibuat dengan bantuan teknologi <strong className="text-white">Artificial Intelligence (AI)</strong>.
          </p>
          <p className="text-xs text-gray-600">
            &copy; 2026 AKA Gaming. Powered by AI Technology.
          </p>
        </div>
      </div>
    </footer>
  );
}

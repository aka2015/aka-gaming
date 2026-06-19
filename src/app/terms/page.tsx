export default function TermsPage() {
  return (
    <div className="max-w-[800px] mx-auto px-5 py-16">
      <h1 className="font-head text-3xl text-gray-800 mb-8">Syarat dan Ketentuan</h1>
      <p className="text-sm text-gray-400 mb-8">Terakhir diperbarui: 19 Juni 2026</p>

      <div className="prose prose-gray max-w-none space-y-6 text-gray-600 leading-relaxed">
        <section>
          <h2 className="font-head text-xl text-gray-700 mb-3">1. Penerimaan Ketentuan</h2>
          <p>
            Dengan mengakses dan menggunakan situs web AKA Gaming (&quot;Platform&quot;), Anda menyetujui terikat oleh 
            Syarat dan Ketentuan ini. Jika Anda tidak setuju dengan bagian mana pun, Anda tidak boleh menggunakan Platform.
          </p>
        </section>

        <section>
          <h2 className="font-head text-xl text-gray-700 mb-3">2. Deskripsi Layanan</h2>
          <p>
            AKA Gaming adalah platform game edukasi online yang memungkinkan pengguna untuk:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Memainkan game edukasi interaktif</li>
            <li>Membuat game menggunakan teknologi AI</li>
            <li>Berbagi game dengan pengguna lain</li>
            <li>Memberikan komentar dan like pada game</li>
          </ul>
        </section>

        <section>
          <h2 className="font-head text-xl text-gray-700 mb-3">3. Akun Pengguna</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Anda harus login menggunakan akun Google untuk membuat game.</li>
            <li>Anda bertanggung jawab atas semua aktivitas yang terjadi di akun Anda.</li>
            <li>Kami berhak menangguhkan atau menghentikan akun yang melanggar ketentuan.</li>
            <li>Setiap pengguna dibatasi maksimal 3 game.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-head text-xl text-gray-700 mb-3">4. Konten Buatan Pengguna</h2>
          <p>
            Dengan membuat dan mengunggah game, Anda memberikan kami lisensi non-eksklusif untuk menampilkan dan 
            mendistribusikan konten tersebut di Platform. Anda menjamin bahwa konten yang Anda buat:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Tidak melanggar hak cipta pihak ketiga</li>
            <li>Tidak mengandung konten dewasa, kekerasan berlebihan, atau ujaran kebencian</li>
            <li>Tidak mengandung malware, virus, atau kode berbahaya</li>
            <li>Tidak mengumpulkan data pribadi pengguna lain</li>
          </ul>
        </section>

        <section>
          <h2 className="font-head text-xl text-gray-700 mb-3">5. Kredit dan Pembayaran</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Setiap pengguna mendapatkan 100 credit gratis setiap hari.</li>
            <li>Credit digunakan untuk membuat atau meng-generate game.</li>
            <li>Credit bisa didapatkan dengan menonton iklan (maksimal 5 iklan per hari).</li>
            <li>Credit tidak dapat ditukar dengan uang tunai.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-head text-xl text-gray-700 mb-3">6. Konten AI</h2>
          <p>
            Game di Platform ini dibuat dengan bantuan teknologi Artificial Intelligence (AI). 
            Kami tidak menjamin keakuratan, kelengkapan, atau keamanan konten yang dihasilkan AI. 
            Pengguna menggunakan konten AI dengan risiko mereka sendiri.
          </p>
        </section>

        <section>
          <h2 className="font-head text-xl text-gray-700 mb-3">7. Kekayaan Intelektual</h2>
          <p>
            Nama, logo, dan desain AKA Gaming adalah merek dagang milik kami. 
            Kode platform dan infrastruktur dilindungi oleh hak cipta. Game yang dibuat pengguna 
            tetap menjadi milik pengguna sesuai dengan lisensi yang diberikan.
          </p>
        </section>

        <section>
          <h2 className="font-head text-xl text-gray-700 mb-3">8. Batasan Tanggung Jawab</h2>
          <p>
            Platform disediakan &quot;sebagaimana adanya&quot; tanpa jaminan apa pun. Kami tidak bertanggung jawab 
            atas kerusakan langsung atau tidak langsung yang timbul dari penggunaan Platform. 
            Kami berhak mengubah atau menghentikan layanan kapan saja.
          </p>
        </section>

        <section>
          <h2 className="font-head text-xl text-gray-700 mb-3">9. Hukum yang Berlaku</h2>
          <p>
            Ketentuan ini diatur oleh hukum Republik Indonesia. Setiap sengketa akan diselesaikan 
            melalui musyawarah atau jalur hukum yang berlaku.
          </p>
        </section>

        <section>
          <h2 className="font-head text-xl text-gray-700 mb-3">10. Kontak</h2>
          <p>
            Jika Anda memiliki pertanyaan tentang Syarat dan Ketentuan ini, silakan hubungi kami 
            melalui halaman <a href="/contact" className="text-purple-600 underline">Kontak</a>.
          </p>
        </section>
      </div>
    </div>
  );
}

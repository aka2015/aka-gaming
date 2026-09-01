export default function PrivacyPage() {
  return (
    <div className="max-w-[800px] mx-auto px-5 py-16">
      <h1 className="font-head text-3xl text-gray-800 mb-8">Kebijakan Privasi</h1>
      <p className="text-sm text-gray-400 mb-8">Terakhir diperbarui: 19 Juni 2026</p>

      <div className="prose prose-gray max-w-none space-y-6 text-gray-600 leading-relaxed">
        <section>
          <h2 className="font-head text-xl text-gray-700 mb-3">1. Pendahuluan</h2>
          <p>
            AKA Gaming (&quot;kami&quot;, &quot;milik kami&quot;, atau &quot;kita&quot;) berkomitmen untuk melindungi privasi Anda. 
            Kebijakan privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, mengungkapkan, dan melindungi informasi Anda 
            saat Anda mengunjungi situs web kami https://aka-gaming.web.id.
          </p>
        </section>

        <section>
          <h2 className="font-head text-xl text-gray-700 mb-3">2. Informasi yang Kami Kumpulkan</h2>
          <p>Kami dapat mengumpulkan informasi berikut:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Informasi Akun:</strong> Nama, alamat email, dan foto profil saat Anda login melalui Google.</li>
            <li><strong>Informasi Penggunaan:</strong> Game yang Anda buat, mainkan, dan sukai.</li>
            <li><strong>Data Teknis:</strong> Alamat IP, jenis browser, dan halaman yang dikunjungi.</li>
            <li><strong>Cookie:</strong> Kami menggunakan cookie untuk sesi login dan preferensi pengguna.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-head text-xl text-gray-700 mb-3">3. Cara Kami Menggunakan Informasi</h2>
          <p>Informasi Anda digunakan untuk:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Menyediakan dan memelihara layanan game</li>
            <li>Menyimpan game yang Anda buat</li>
            <li>Menampilkan konten yang relevan</li>
            <li>Meningkatkan pengalaman pengguna</li>
            <li>Mematuhi kewajiban hukum</li>
          </ul>
        </section>

        <section>
          <h2 className="font-head text-xl text-gray-700 mb-3">4. Iklan dan Google AdSense</h2>
          <p>
            Kami menggunakan Google AdSense untuk menampilkan iklan. Google menggunakan cookie untuk menayangkan iklan 
            yang relevan berdasarkan kunjungan Anda ke situs kami dan situs lainnya. Anda dapat memilih untuk tidak 
            menerima iklan yang dipersonalisasi melalui <a href="https://adssettings.google.com" className="text-purple-600 underline" target="_blank" rel="noopener noreferrer">Setelan Iklan Google</a>.
          </p>
        </section>

        <section>
          <h2 className="font-head text-xl text-gray-700 mb-3">5. Keamanan Data</h2>
          <p>
            Kami menerapkan langkah-langkah keamanan teknis dan organisasi yang sesuai untuk melindungi informasi pribadi Anda. 
            Namun, tidak ada metode transmisi melalui Internet yang 100% aman.
          </p>
        </section>

        <section>
          <h2 className="font-head text-xl text-gray-700 mb-3">6. Hak Anda</h2>
          <p>Anda berhak untuk:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Mengakses data pribadi yang kami simpan</li>
            <li>Meminta koreksi data yang tidak akurat</li>
            <li>Meminta penghapusan data Anda</li>
            <li>Menolak pemrosesan data tertentu</li>
          </ul>
        </section>

        <section>
          <h2 className="font-head text-xl text-gray-700 mb-3">7. Kontak</h2>
          <p>
            Jika Anda memiliki pertanyaan tentang kebijakan privasi ini, silakan hubungi kami melalui halaman{" "}
            <a href="/contact" className="text-purple-600 underline">Kontak</a>.
          </p>
        </section>

        <section>
          <h2 className="font-head text-xl text-gray-700 mb-3">8. Perubahan Kebijakan</h2>
          <p>
            Kami dapat memperbarui kebijakan privasi ini dari waktu ke waktu. Perubahan akan diumumkan di halaman ini.
          </p>
        </section>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setVisible(true);
    }
  }, []);

  function accept() {
    localStorage.setItem("cookie-consent", "accepted");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] bg-gray-900 text-white p-4 shadow-2xl">
      <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-center gap-4">
        <p className="text-sm text-gray-300 flex-1">
          Kami menggunakan cookie untuk meningkatkan pengalaman Anda. Dengan melanjutkan menggunakan 
          situs ini, Anda menyetujui penggunaan cookie kami. Baca{" "}
          <a href="/privacy" className="text-purple-400 underline">Kebijakan Privasi</a>{" "}
          dan{" "}
          <a href="/terms" className="text-purple-400 underline">Syarat &amp; Ketentuan</a>.
        </p>
        <button
          onClick={accept}
          className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-full text-sm transition whitespace-nowrap"
        >
          Setuju
        </button>
      </div>
    </div>
  );
}

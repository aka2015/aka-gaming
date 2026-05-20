"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    adsbygoogle: any[];
    google: any;
  }
}

interface InterstitialAdProps {
  adSlot: string;
  onClosed: () => void;
  onError?: (error: string) => void;
}

export default function InterstitialAd({ adSlot, onClosed, onError }: InterstitialAdProps) {
  useEffect(() => {
    let adInstance: any = null;

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});

      const ad = document.getElementById("interstitial-ad-container");
      if (!ad) return;

      // Load Google IMA SDK for interstitial
      const script = document.createElement("script");
      script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";
      script.async = true;
      script.crossOrigin = "anonymous";
      script.onload = () => {
        try {
          window.adsbygoogle.push({});
          // Ad loaded
        } catch (e) {
          onError?.("Gagal memuat iklan");
        }
      };
      script.onerror = () => onError?.("Gagal memuat iklan");
      document.head.appendChild(script);

      // Auto-close after 15 seconds
      const timer = setTimeout(() => {
        onClosed();
      }, 15000);

      return () => {
        clearTimeout(timer);
        if (script.parentNode) script.parentNode.removeChild(script);
      };
    } catch (e) {
      onError?.("Gagal memuat iklan");
      onClosed();
    }
  }, [adSlot, onClosed, onError]);

  return (
    <div className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center">
      <div className="relative bg-gray-900 rounded-2xl p-4 max-w-lg w-full mx-4">
        <button
          onClick={onClosed}
          className="absolute top-2 right-2 bg-white/20 hover:bg-white/40 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold transition z-10"
        >
          ✕
        </button>
        <div id="interstitial-ad-container" className="min-h-[300px] flex items-center justify-center">
          <ins
            className="adsbygoogle"
            style={{ display: "block" }}
            data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
            data-ad-slot={adSlot}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
          <p className="text-gray-400 text-sm">Memuat iklan...</p>
        </div>
        <p className="text-center text-gray-500 text-xs mt-3">Iklan akan menutup otomatis dalam 15 detik</p>
      </div>
    </div>
  );
}

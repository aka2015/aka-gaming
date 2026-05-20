import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "AKA GAMING - Portal Game Seru untuk Anak",
  description: "AKA GAMING adalah portal game edukasi anak Indonesia. Mainkan game seru sambil belajar!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <meta name="google-adsense-account" content="ca-pub-3175336620725888" />
      </head>
      <body className="min-h-screen flex flex-col">
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3175336620725888"
          crossOrigin="anonymous"
          strategy="beforeInteractive"
        />
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}

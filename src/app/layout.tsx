import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Providers from "@/components/Providers";
import CookieConsent from "@/components/CookieConsent";

export const metadata: Metadata = {
  title: "AKA GAMING - Portal Game Edukasi Seru untuk Anak Indonesia",
  description:
    "AKA GAMING adalah portal game edukasi anak Indonesia. Mainkan game seru, buat game sendiri dengan AI, dan belajar sambil bermain. Platform game online gratis untuk anak-anak.",
  keywords: [
    "game edukasi",
    "game anak",
    "game Indonesia",
    "belajar sambil bermain",
    "AI game builder",
    "game online gratis",
    "game edukasi anak",
    "platform game anak",
  ],
  openGraph: {
    title: "AKA GAMING - Portal Game Edukasi untuk Anak",
    description:
      "Mainkan game seru, buat game sendiri dengan AI, dan belajar sambil bermain!",
    url: "https://aka-gaming.web.id",
    siteName: "AKA GAMING",
    locale: "id_ID",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: "ca-pub-3175336620725888",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <meta
          name="google-adsense-account"
          content="ca-pub-3175336620725888"
        />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3175336620725888"
          crossOrigin="anonymous"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "AKA GAMING",
              url: "https://aka-gaming.web.id",
              description:
                "Platform game edukasi anak Indonesia. Mainkan game seru dan buat game sendiri dengan AI.",
              inLanguage: "id-ID",
              applicationCategory: "GameApplication",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "IDR",
              },
            }),
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <CookieConsent />
        </Providers>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Space_Grotesk, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "SolarWatch — Güneş Fırtınası Erken Uyarı Sistemi",
  description:
    "NASA DONKI verileriyle gerçek zamanlı güneş fırtınası izleme. CME olaylarını ve jeomanyetik fırtınaları takip edin, uzay hava durumundan korunun.",
  keywords:
    "güneş fırtınası, CME, jeomanyetik fırtına, NASA DONKI, uzay hava durumu, erken uyarı sistemi",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr" className={`${spaceGrotesk.variable} ${jakarta.variable}`}>
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}

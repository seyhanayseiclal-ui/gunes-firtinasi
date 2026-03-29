import type { Metadata } from "next";
import { Orbitron, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
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
    <html lang="tr" className={`${orbitron.variable} ${jakarta.variable}`}>
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}

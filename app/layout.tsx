import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BRAND } from "@/lib/nav";
import { CartProvider } from "@/lib/cart-context";
import { Analytics } from "@vercel/analytics/next";

const display = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap"
});

const body = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap"
});

export const metadata: Metadata = {
  metadataBase: new URL("https://niacosmetics.co.tz"),
  title: {
    default: `${BRAND.name} — Duka la Vipodozi Dar es Salaam`,
    template: `%s | ${BRAND.name}`
  },
  description:
    "Nia Cosmetics ni duka la vipodozi la kuaminika Dar es Salaam linalouza bidhaa za urembo, ngozi na nywele zenye ubora wa hali ya juu.",
  keywords: [
    "vipodozi",
    "duka la vipodozi",
    "cosmetics Tanzania",
    "urembo",
    "makeup Dar es Salaam"
  ],
  openGraph: {
    title: `${BRAND.name} — Duka la Vipodozi Dar es Salaam`,
    description: BRAND.tagline,
    locale: "sw_TZ",
    type: "website"
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sw">
      <body className={`${display.variable} ${body.variable}`}>
        <CartProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </CartProvider>
        <Analytics />
      </body>
    </html>
  );
}

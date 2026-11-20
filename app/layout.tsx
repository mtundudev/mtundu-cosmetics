import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BRAND } from "@/lib/nav";
import { CartProvider } from "@/lib/cart-context";
import { SitePreferencesProvider } from "@/lib/preferences";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Analytics } from "@vercel/analytics/next";
import { SITE_URL } from "@/lib/site-url";

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
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${BRAND.name} — Duka la Vipodozi Mbeya & Tanzania`,
    template: `%s | ${BRAND.name}`
  },
  description:
    `${BRAND.name} ni duka la vipodozi la kuaminika Mwanjerwa Mbeya linalouza bidhaa asilia za urembo, utunzaji wa ngozi na nywele zenye ubora wa hali ya juu.`,
  keywords: [
    "vipodozi",
    "duka la vipodozi",
    "cosmetics Tanzania",
    "urembo",
    "makeup Mbeya",
    "Omega Cosmetics",
    "skincare Mbeya"
  ],
  openGraph: {
    title: `${BRAND.name} — Duka la Vipodozi Mbeya & Tanzania`,
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
        <SitePreferencesProvider>
          <CartProvider>
            <Navbar />
            <main>{children}</main>
            <Footer />
            <WhatsAppButton />
          </CartProvider>
        </SitePreferencesProvider>
        <Analytics />
      </body>
    </html>
  );
}

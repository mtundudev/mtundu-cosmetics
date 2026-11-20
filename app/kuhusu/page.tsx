import type { Metadata } from "next";
import { BRAND } from "@/lib/nav";
import { AboutPageContent } from "@/components/LocalizedPageContent";

export const metadata: Metadata = {
  title: "Kuhusu Sisi",
  description: `Fahamu historia na dhamira ya ${BRAND.name}, duka la vipodozi la kuaminika Mbeya na Tanzania nzima.`
};

export default function AboutPage() {
  return <AboutPageContent />;
}

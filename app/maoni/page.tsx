import type { Metadata } from "next";
import { BRAND } from "@/lib/nav";
import { ReviewsPageContent } from "@/components/LocalizedPageContent";

export const metadata: Metadata = {
  title: "Maoni",
  description: `Soma maoni ya wateja wa ${BRAND.name} na uache maoni yako mwenyewe.`
};

export const dynamic = "force-dynamic";

export default function MaoniPage() {
  return <ReviewsPageContent />;
}

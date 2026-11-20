import type { Metadata } from "next";
import { BRAND } from "@/lib/nav";
import { GalleryPageContent } from "@/components/LocalizedPageContent";

export const metadata: Metadata = {
  title: "Picha",
  description: `Picha za bidhaa na huduma za ${BRAND.name}.`
};

export default function GalleryPage() {
  return <GalleryPageContent />;
}

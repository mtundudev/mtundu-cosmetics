import type { Metadata } from "next";
import { BRAND } from "@/lib/nav";
import { ServicesPageContent } from "@/components/LocalizedPageContent";

export const metadata: Metadata = {
  title: "Huduma",
  description: `Huduma za ushauri wa urembo, mapambo ya matukio na uwasilishaji kutoka ${BRAND.name}.`
};

export default function ServicesPage() {
  return <ServicesPageContent />;
}

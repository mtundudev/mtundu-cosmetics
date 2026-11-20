import type { Metadata } from "next";
import { BRAND } from "@/lib/nav";
import { ContactPageContent } from "@/components/LocalizedPageContent";

export const metadata: Metadata = {
  title: "Wasiliana Nasi",
  description: `Tuma ujumbe kwa ${BRAND.name} au tupigie simu, WhatsApp na barua pepe.`
};

export default function ContactPage() {
  return <ContactPageContent />;
}

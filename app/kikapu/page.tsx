import type { Metadata } from "next";
import SectionHeading from "@/components/SectionHeading";
import CartPageClient from "@/components/CartPageClient";
import { BRAND } from "@/lib/nav";

export const metadata: Metadata = {
  title: "Kikapu",
  description: `Kagua bidhaa zako na ukamilishe order kwa ${BRAND.name}.`
};

export default function CartPage() {
  return (
    <div className="container-page py-16 md:py-24">
      <SectionHeading
        eyebrow="Order Yako"
        title="Kikapu Chako"
        description="Kagua bidhaa ulizochagua, jaza taarifa zako, na kamilisha order."
      />

      <div className="mt-10">
        <CartPageClient />
      </div>
    </div>
  );
}

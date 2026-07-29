import type { Metadata } from "next";
import Link from "next/link";
import SectionHeading from "@/components/SectionHeading";
import { SERVICES } from "@/lib/data";
import { BRAND } from "@/lib/nav";

export const metadata: Metadata = {
  title: "Huduma",
  description: `Huduma za ushauri wa urembo, mapambo ya matukio na uwasilishaji kutoka ${BRAND.name}.`
};

export default function ServicesPage() {
  return (
    <div className="container-page py-16 md:py-24">
      <SectionHeading
        eyebrow="Tunachotoa"
        title="Huduma Zetu"
        description="Zaidi ya kuuza bidhaa, tunasindikiza wateja wetu katika kila hatua ya safari yao ya urembo."
      />

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {SERVICES.map((service, index) => (
          <div key={service.title} className="flex gap-5 rounded-2xl border border-plum/10 p-6">
            <span className="font-display text-3xl font-semibold text-rose-light">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div>
              <h3 className="font-display text-lg font-semibold text-plum">{service.title}</h3>
              <p className="mt-2 text-sm text-charcoal/70">{service.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 rounded-3xl bg-rose-light/30 p-10 text-center">
        <h2 className="text-2xl font-semibold text-plum sm:text-3xl">
          Unahitaji ushauri wa moja kwa moja?
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-charcoal/70">
          Wasiliana na timu yetu leo na tutakusaidia kuchagua bidhaa na huduma zinazokufaa.
        </p>
        <Link href="/wasiliana" className="btn-primary mt-6 inline-flex">
          Wasiliana Nasi
        </Link>
      </div>
    </div>
  );
}

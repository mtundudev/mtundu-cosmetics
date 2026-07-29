import Image from "next/image";
import type { Metadata } from "next";
import SectionHeading from "@/components/SectionHeading";
import { BRAND } from "@/lib/nav";

export const metadata: Metadata = {
  title: "Kuhusu Sisi",
  description: `Fahamu historia na dhamira ya ${BRAND.name}, duka la vipodozi la kuaminika Dar es Salaam.`
};

const VALUES = [
  { title: "Ubora", text: "Kila bidhaa tunayouza imepitia uchunguzi wa ubora kabla ya kufika dukani." },
  { title: "Uaminifu", text: "Tunauza bidhaa halisi tu, hakuna nakala au bidhaa feki." },
  { title: "Jumuiya", text: "Tunawekeza katika mafunzo ya urembo kwa vijana wa kike wa Dar es Salaam." }
];

export default function AboutPage() {
  return (
    <div className="container-page py-16 md:py-24">
      <SectionHeading
        eyebrow="Kuhusu Sisi"
        title={`Hadithi ya ${BRAND.name}`}
        description="Tulianzishwa mwaka 2019 kwa lengo moja: kuhakikisha kila mwanamke wa Kitanzania anapata bidhaa za vipodozi zenye ubora, kwa bei nafuu na ushauri sahihi."
      />

      <div className="mt-12 grid gap-12 md:grid-cols-2 md:items-center">
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
          <Image
            src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1000&q=80"
            alt="Duka la vipodozi la Nia Cosmetics"
            fill
            sizes="(min-width: 768px) 500px, 100vw"
            className="object-cover"
          />
        </div>

        <div className="space-y-4 text-charcoal/80">
          <p>
            {BRAND.name} ilianza kama duka dogo Kariakoo, likiuza bidhaa chache za msingi za ngozi.
            Leo, tumekuwa moja ya maduka yanayoaminika zaidi ya vipodozi jijini Dar es Salaam,
            tukihudumia maelfu ya wateja kila mwezi.
          </p>
          <p>
            Tunaamini kuwa urembo wa kweli unaanzia kwenye kujiamini. Ndiyo maana kila mteja
            anayeingia dukani kwetu anapata ushauri wa dhati, si mauzo tu.
          </p>
        </div>
      </div>

      <div className="mt-20">
        <SectionHeading eyebrow="Misingi Yetu" title="Tunachosimamia" />
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {VALUES.map((value) => (
            <div key={value.title} className="rounded-2xl border border-plum/10 p-6">
              <h3 className="font-display text-lg font-semibold text-plum">{value.title}</h3>
              <p className="mt-2 text-sm text-charcoal/70">{value.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

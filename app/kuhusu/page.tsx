import Image from "next/image";
import type { Metadata } from "next";
import SectionHeading from "@/components/SectionHeading";
import { BRAND } from "@/lib/nav";

export const metadata: Metadata = {
  title: "Kuhusu Sisi",
  description: `Fahamu historia na dhamira ya ${BRAND.name}, duka la vipodozi la kuaminika Mbeya na Tanzania nzima.`
};

const VALUES = [
  { title: "Ubora", text: "Kila bidhaa tunayouza imepitia uchunguzi wa ubora kabla ya kufika dukani." },
  { title: "Uaminifu", text: "Tunauza bidhaa halisi tu, hakuna nakala au bidhaa feki." },
  { title: "Jumuiya", text: "Tunawekeza katika mafunzo ya urembo na kuwawezesha wanawake na vijana kujiamini." }
];

export default function AboutPage() {
  return (
    <div className="container-page py-16 md:py-24">
      <SectionHeading
        eyebrow="Kuhusu Sisi"
        title={`Hadithi ya ${BRAND.name}`}
        description="Tulianzishwa kwa lengo moja: kuhakikisha kila mwanamke na mteja anapata bidhaa za vipodozi zenye ubora wa kimataifa, kwa bei nafuu na ushauri sahihi."
      />

      <div className="mt-12 grid gap-12 md:grid-cols-2 md:items-center">
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
          <Image
            src="/products/Aesthetic_Makeup_Collection_Flatlay.jpg"
            alt={`Duka la vipodozi la ${BRAND.name}`}
            fill
            sizes="(min-width: 768px) 500px, 100vw"
            className="object-cover"
          />
        </div>

        <div className="space-y-4 text-charcoal/80">
          <p>
            {BRAND.name} ilianza Mwanjerwa jijini Mbeya, ikilenga kuleta mapinduzi chanya kwenye
            sekta ya urembo kwa kutoa bidhaa salama na bora za ngozi, uso na nywele.
            Leo, tumekuwa kitovu cha uaminifu kwa maelfu ya wateja mkoani Mbeya na kote nchini.
          </p>
          <p>
            Tunaamini kuwa urembo wa kweli unaanzia kwenye kujiamini. Ndiyo maana kila mteja
            anayeagiza au kuwasiliana nasi anapata ushauri wa dhati wa kitaalamu unaomfaa binafsi.
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

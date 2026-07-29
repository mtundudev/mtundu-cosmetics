import type { Metadata } from "next";
import SectionHeading from "@/components/SectionHeading";
import ContactForm from "@/components/ContactForm";
import { BRAND } from "@/lib/nav";

export const metadata: Metadata = {
  title: "Wasiliana Nasi",
  description: `Tuma ujumbe kwa ${BRAND.name} au tupigie simu, WhatsApp na barua pepe.`
};

export default function ContactPage() {
  return (
    <div className="container-page py-16 md:py-24">
      <SectionHeading
        eyebrow="Tuko Karibu Nawe"
        title="Wasiliana Nasi"
        description="Una swali kuhusu bidhaa au unahitaji ushauri wa urembo? Jaza fomu hapa chini au tumia mawasiliano yetu ya moja kwa moja."
      />

      <div className="mt-12 grid gap-12 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <div className="rounded-3xl border border-plum/10 p-6 sm:p-8">
            <ContactForm />
          </div>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl bg-rose-light/25 p-6">
            <h3 className="font-display text-lg font-semibold text-plum">Duka Letu</h3>
            <p className="mt-2 text-sm text-charcoal/70">{BRAND.address}</p>
          </div>

          <div className="rounded-2xl bg-rose-light/25 p-6">
            <h3 className="font-display text-lg font-semibold text-plum">Simu na WhatsApp</h3>
            <a href={`tel:${BRAND.phone.replace(/\s/g, "")}`} className="mt-2 block text-sm text-charcoal/70 hover:text-rose-dark">
              {BRAND.phone}
            </a>
            <a
              href={`https://wa.me/${BRAND.whatsapp.replace("+", "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 block text-sm text-charcoal/70 hover:text-rose-dark"
            >
              Tuma WhatsApp
            </a>
          </div>

          <div className="rounded-2xl bg-rose-light/25 p-6">
            <h3 className="font-display text-lg font-semibold text-plum">Barua Pepe</h3>
            <a href={`mailto:${BRAND.email}`} className="mt-2 block text-sm text-charcoal/70 hover:text-rose-dark">
              {BRAND.email}
            </a>
          </div>

          <div className="rounded-2xl bg-rose-light/25 p-6">
            <h3 className="font-display text-lg font-semibold text-plum">Muda wa Kufunguliwa</h3>
            <p className="mt-2 text-sm text-charcoal/70">Jumatatu - Jumamosi: 9:00 - 20:00</p>
            <p className="text-sm text-charcoal/70">Jumapili: 11:00 - 17:00</p>
          </div>
        </div>
      </div>
    </div>
  );
}

import Image from "next/image";
import Link from "next/link";
import ShadeStrip from "@/components/ShadeStrip";
import SectionHeading from "@/components/SectionHeading";
import AddToCartButton from "@/components/AddToCartButton";
import { PRODUCTS, SERVICES, TESTIMONIALS } from "@/lib/data";
import { BRAND } from "@/lib/nav";

export default function HomePage() {
  const featured = PRODUCTS.slice(0, 3);

  return (
    <>
      {/* HERO */}
      <section className="container-page grid gap-12 py-16 md:grid-cols-2 md:items-center md:py-24">
        <div>
          <p className="section-eyebrow">Duka la Vipodozi la Kuaminika</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
            Kila rangi ina hadithi yake — chagua inayokufaa.
          </h1>
          <p className="mt-5 max-w-md text-base text-charcoal/70">
            {BRAND.name} inakuletea bidhaa bora za urembo, utunzaji wa ngozi na nywele,
            zilizochaguliwa kwa makini kwa ngozi za Kiafrika.
          </p>

          <ShadeStrip className="mt-8" />

          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/bidhaa" className="btn-primary">
              Angalia Bidhaa
            </Link>
            <Link href="/wasiliana" className="btn-secondary">
              Wasiliana Nasi
            </Link>
          </div>
        </div>

        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl">
          <Image
            src="/products/makeup_artist_model.jpg"
            alt="Mwanamke mrembo mwenye mapambo ya kifahari kutoka Mtundu Cosmetics"
            fill
            priority
            sizes="(min-width: 768px) 500px, 100vw"
            className="object-cover"
          />
        </div>
      </section>

      {/* WHY US */}
      <section className="bg-rose-light/30 py-16">
        <div className="container-page grid gap-8 sm:grid-cols-3">
          {[
            { title: "Bidhaa Halisi", text: "Tunauza bidhaa asili tu, zenye ubora uliothibitishwa." },
            { title: "Ushauri wa Kitaalamu", text: "Timu yetu inakusaidia kuchagua rangi na bidhaa sahihi." },
            { title: "Uwasilishaji wa Haraka", text: "Agiza leo, pokea ndani ya siku 1-2 Mbeya na mikoa yote ya Tanzania." }
          ].map((item) => (
            <div key={item.title} className="rounded-2xl bg-cream p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-plum">{item.title}</h3>
              <p className="mt-2 text-sm text-charcoal/70">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="container-page py-16 md:py-24">
        <SectionHeading
          eyebrow="Vipendwa Zaidi"
          title="Bidhaa Zinazopendwa na Wateja"
          description="Chaguo bora zaidi kutoka kwenye mkusanyiko wetu wa vipodozi na utunzaji wa ngozi."
        />

        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((product) => (
            <div key={product.slug} className="group overflow-hidden rounded-2xl border border-plum/10">
              <div className="relative aspect-square w-full overflow-hidden">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-5">
                <p className="text-xs uppercase tracking-wide text-rose-dark">{product.category}</p>
                <h3 className="mt-1 font-display text-lg font-semibold text-plum">{product.name}</h3>
                <p className="mt-2 text-sm text-charcoal/70">{product.description}</p>
                <p className="mt-3 font-semibold text-plum">{product.price}</p>
                <AddToCartButton product={product} className="mt-4" />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link href="/bidhaa" className="btn-secondary">
            Ona Bidhaa Zote
          </Link>
        </div>
      </section>

      {/* SERVICES TEASER */}
      <section className="bg-plum py-16 text-cream md:py-24">
        <div className="container-page grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <p className="section-eyebrow text-gold">Huduma Zetu</p>
            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
              Zaidi ya Ununuzi — Tunakusindikiza Kwenye Safari ya Urembo
            </h2>
            <p className="mt-4 max-w-md text-cream/70">
              Kutoka ushauri wa kibinafsi hadi mapambo ya siku kuu, timu yetu ipo tayari kukusaidia.
            </p>
            <Link href="/huduma" className="btn-secondary mt-6 inline-flex border-cream/40 text-cream hover:bg-cream hover:text-plum">
              Angalia Huduma Zote
            </Link>
          </div>

          <ul className="space-y-4">
            {SERVICES.slice(0, 3).map((service) => (
              <li key={service.title} className="rounded-2xl border border-cream/15 p-5">
                <p className="font-display text-lg font-semibold">{service.title}</p>
                <p className="mt-1 text-sm text-cream/70">{service.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="container-page py-16 md:py-24">
        <SectionHeading
          eyebrow="Wateja Wetu Wanasema Nini"
          title="Maoni ya Wateja Wetu"
          align="center"
        />

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((testimonial) => (
            <blockquote key={testimonial.name} className="rounded-2xl bg-rose-light/25 p-6">
              <p className="text-sm text-charcoal/80">&ldquo;{testimonial.quote}&rdquo;</p>
              <footer className="mt-4">
                <p className="font-semibold text-plum">{testimonial.name}</p>
                <p className="text-xs text-charcoal/60">{testimonial.role}</p>
              </footer>
            </blockquote>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link href="/maoni" className="btn-secondary">
            Ona Maoni Yote
          </Link>
        </div>
      </section>
    </>
  );
}

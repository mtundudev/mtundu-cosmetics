import Image from "next/image";
import type { Metadata } from "next";
import SectionHeading from "@/components/SectionHeading";
import { GALLERY_IMAGES } from "@/lib/gallery";
import { BRAND } from "@/lib/nav";

export const metadata: Metadata = {
  title: "Picha",
  description: `Picha za bidhaa na huduma za ${BRAND.name}.`
};

export default function GalleryPage() {
  return (
    <div className="container-page py-16 md:py-24">
      <SectionHeading
        eyebrow="Picha Zetu"
        title="Ndani ya Duka Letu"
        description="Angalia picha za bidhaa zetu na baadhi ya kazi za mapambo tulizofanya kwa wateja."
      />

      <div className="mt-12 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3">
        {GALLERY_IMAGES.map((image, index) => (
          <div
            key={image.src}
            className={`relative overflow-hidden rounded-2xl ${
              index === 0 ? "col-span-2 aspect-[16/9] md:col-span-1 md:aspect-square" : "aspect-square"
            }`}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(min-width: 768px) 33vw, 50vw"
              className="object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

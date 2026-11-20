import Image from "next/image";
import { BRAND } from "@/lib/nav";

type LogoProps = {
  size?: number;
  className?: string;
  tone?: "dark" | "light";
};

export default function Logo({ size = 42, className = "", tone = "dark" }: LogoProps) {
  const brandTitle = BRAND.name.split(/\s+/)[0] || BRAND.name;
  const titleColor = tone === "light" ? "text-cream" : "text-plum";
  const subtitleColor = tone === "light" ? "text-gold-light" : "text-plum/65";

  return (
    <span className={`inline-flex shrink-0 items-center gap-2.5 ${className}`}>
      <span
        className="relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-gold bg-white shadow-md shadow-plum/15"
        style={{ width: size, height: size }}
      >
        <Image
          src="/omega-cosmetics-mark.png"
          alt=""
          fill
          sizes={`${size}px`}
          className="rounded-full object-cover"
        />
      </span>
      <span className="flex flex-col">
        <span className={`font-display text-lg font-semibold leading-none ${titleColor}`}>
          {brandTitle}
        </span>
        <span className={`mt-1 text-[8px] font-bold uppercase tracking-[0.15em] ${subtitleColor}`}>
          Cosmetics &amp; Beauty
        </span>
      </span>
    </span>
  );
}

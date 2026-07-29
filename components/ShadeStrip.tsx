import { SHADE_TONES } from "@/lib/nav";

type ShadeStripProps = {
  className?: string;
};

export default function ShadeStrip({ className = "" }: ShadeStripProps) {
  return (
    <div className={`swatch-strip ${className}`} aria-hidden="true">
      {SHADE_TONES.map((tone) => (
        <span key={tone} className="swatch" style={{ backgroundColor: tone }} />
      ))}
    </div>
  );
}

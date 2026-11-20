type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
};

export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left"
}: SectionHeadingProps) {
  const alignment = align === "center" ? "text-center mx-auto" : "text-left";

  return (
    <div className={`max-w-2xl ${alignment}`}>
      <p className="section-eyebrow">{eyebrow}</p>
      <h2 className="mt-4 text-3xl font-medium leading-tight sm:text-4xl">{title}</h2>
      {description && <p className="mt-4 max-w-xl text-sm leading-7 text-charcoal/70 sm:text-base">{description}</p>}
    </div>
  );
}

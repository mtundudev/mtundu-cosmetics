import { BRAND } from "@/lib/nav";
import { getInitials } from "@/lib/logo";

type LogoProps = {
  size?: number;
  className?: string;
};

export default function Logo({ size = 40, className = "" }: LogoProps) {
  const initials = getInitials(BRAND.name);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={className}
      role="img"
      aria-label={`Logo ya ${BRAND.name}`}
    >
      <circle cx="24" cy="24" r="22" fill="#3B1F2B" stroke="#B08D57" strokeWidth="1.5" />
      <text
        x="24"
        y="27"
        textAnchor="middle"
        fontFamily="Fraunces, Georgia, serif"
        fontWeight="600"
        fontSize="17"
        fill="#FBF6F1"
      >
        {initials}
      </text>
      <circle cx="15" cy="36" r="1.6" fill="#F4D9C6" />
      <circle cx="24" cy="38" r="1.6" fill="#C98A5E" />
      <circle cx="33" cy="36" r="1.6" fill="#6B4429" />
    </svg>
  );
}

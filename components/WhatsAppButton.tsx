"use client";

import { BRAND } from "@/lib/nav";
import { useSitePreferences } from "@/lib/preferences";

export default function WhatsAppButton() {
  const number = BRAND.whatsapp.replace(/\D/g, "");
  const href = `https://wa.me/${number}`;
  const { t } = useSitePreferences();

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 right-5 z-40 flex min-h-12 items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105 sm:bottom-7 sm:right-7"
      aria-label={t("whatsapp.chat")}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
        <path d="M20.52 3.48A11.87 11.87 0 0 0 12.06 0C5.46 0 .09 5.37.09 11.97c0 2.11.55 4.17 1.6 5.98L0 24l6.2-1.63a11.9 11.9 0 0 0 5.86 1.49h.01c6.6 0 11.97-5.37 11.97-11.97 0-3.2-1.25-6.2-3.52-8.41ZM12.06 21.8h-.01c-1.83 0-3.62-.49-5.18-1.42l-.37-.22-3.68.97.98-3.59-.24-.37a9.82 9.82 0 0 1-1.51-5.2c0-5.52 4.49-10.01 10.02-10.01a9.95 9.95 0 0 1 7.08 2.94 9.95 9.95 0 0 1 2.93 7.08c0 5.52-4.49 10.02-10.02 10.02Zm5.5-7.5c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.76.97-.93 1.17-.17.2-.34.22-.64.07-.3-.15-1.27-.47-2.42-1.49-.9-.8-1.5-1.79-1.67-2.09-.18-.3-.02-.46.13-.61.13-.13.3-.34.45-.51.15-.17.2-.3.3-.5.1-.2.05-.38-.03-.53-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.08 1.76-.72 2.01-1.42.25-.7.25-1.29.17-1.42-.08-.12-.27-.2-.57-.35Z" />
      </svg>
      <span className="hidden sm:inline">{t("whatsapp.chat")}</span>
    </a>
  );
}

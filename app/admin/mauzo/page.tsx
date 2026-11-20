import type { Metadata } from "next";
import AdminPageClient from "@/components/AdminPageClient";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false }
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  return (
    <div className="container-page py-16 md:py-24">
      <AdminPageClient />
    </div>
  );
}

import type { Metadata } from "next";
import { cookies } from "next/headers";
import AdminLoginForm from "@/components/AdminLoginForm";
import SalesDashboard from "@/components/SalesDashboard";
import { isSupabaseAdminConfigured, supabaseAdmin, type OrderRow } from "@/lib/supabase-admin";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false }
};

export const dynamic = "force-dynamic";

async function getOrders(): Promise<OrderRow[]> {
  if (!isSupabaseAdminConfigured) return [];

  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("*")
    .order("created_at", { ascending: true });

  if (error || !data) return [];
  return data as OrderRow[];
}

export default async function AdminPage() {
  const cookieStore = cookies();
  const isAuthenticated = cookieStore.get("admin_session")?.value === "authenticated";

  if (!isAuthenticated) {
    return (
      <div className="container-page py-16 md:py-24">
        <AdminLoginForm />
      </div>
    );
  }

  if (!isSupabaseAdminConfigured) {
    return (
      <div className="container-page py-16 md:py-24">
        <p className="mx-auto max-w-md rounded-2xl bg-rose-light/25 p-6 text-center text-sm text-charcoal/70">
          Dashboard bado haijasanidiwa kikamilifu. Weka SUPABASE_SERVICE_ROLE_KEY kwenye
          .env.local (tazama README.md).
        </p>
      </div>
    );
  }

  const orders = await getOrders();

  return (
    <div className="container-page py-16 md:py-24">
      <SalesDashboard orders={orders} />
    </div>
  );
}

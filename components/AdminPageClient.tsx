"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import AdminLoginForm from "@/components/AdminLoginForm";
import AdminOperations from "@/components/AdminOperations";
import AdminProductManager from "@/components/AdminProductManager";
import AdminProfileManager from "@/components/AdminProfileManager";
import AdminServiceManager from "@/components/AdminServiceManager";
import SalesDashboard from "@/components/SalesDashboard";
import { API_BASE_URL, getApiError, type AdminOverview, type OrderRow, type SalesMetrics } from "@/lib/api";
import { useSitePreferences } from "@/lib/preferences";

type AdminProfile = { display_name: string; avatar_path: string | null };
type AdminTab = "overview" | "orders" | "products" | "services" | "messages" | "reviews" | "profile";

export default function AdminPageClient() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [metrics, setMetrics] = useState<SalesMetrics | null>(null);
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [tab, setTab] = useState<AdminTab>("overview");
  const [error, setError] = useState("");
  const { language } = useSitePreferences();
  const isEnglish = language === "en";

  const loadDashboard = useCallback(async () => {
    try {
      const [overviewResponse, metricsResponse, ordersResponse, profileResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/overview`, { credentials: "include" }),
        fetch(`${API_BASE_URL}/orders/metrics`, { credentials: "include" }),
        fetch(`${API_BASE_URL}/orders?limit=100`, { credentials: "include" }),
        fetch(`${API_BASE_URL}/admin/profile`, { credentials: "include" })
      ]);
      if ([overviewResponse, metricsResponse, ordersResponse, profileResponse].some((response) => response.status === 401)) {
        setAuthenticated(false);
        return;
      }

      const [overviewData, metricsData, ordersData, profileData] = await Promise.all([
        overviewResponse.json(),
        metricsResponse.json(),
        ordersResponse.json(),
        profileResponse.json()
      ]);
      if (!overviewResponse.ok) throw new Error(getApiError(overviewData, "Imeshindikana kupakia takwimu."));
      if (!metricsResponse.ok) throw new Error(getApiError(metricsData, "Imeshindikana kupakia chati."));
      if (!ordersResponse.ok) throw new Error(getApiError(ordersData, "Imeshindikana kupakia oda."));
      if (!profileResponse.ok) throw new Error(getApiError(profileData, "Imeshindikana kupakia wasifu."));
      if (!Array.isArray(ordersData)) throw new Error("Orodha ya oda haiko katika muundo unaotarajiwa.");

      setOverview(overviewData as AdminOverview);
      setMetrics(metricsData as SalesMetrics);
      setOrders(ordersData as OrderRow[]);
      setProfile(profileData as AdminProfile);
      setAuthenticated(true);
      setError("");
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Imeshindikana kuwasiliana na FastAPI."
      );
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function checkSession() {
      try {
        const response = await fetch(`${API_BASE_URL}/admin/me`, {
          credentials: "include"
        });
        const result = (await response.json()) as { authenticated?: boolean; detail?: unknown };
        if (!response.ok) {
          throw new Error(getApiError(result, "Imeshindikana kuthibitisha akaunti ya admin."));
        }

        if (!active) return;
        if (result.authenticated === true) {
          await loadDashboard();
        } else {
          setAuthenticated(false);
        }
      } catch (sessionError) {
        if (!active) return;
        setError(
          sessionError instanceof Error
            ? sessionError.message
            : "Imeshindikana kuwasiliana na FastAPI."
        );
        setAuthenticated(false);
      }
    }

    void checkSession();
    return () => {
      active = false;
    };
  }, [loadDashboard]);

  async function handleLoginSuccess() {
    await loadDashboard();
  }

  async function handleLogout() {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/logout`, {
        method: "POST",
        credentials: "include"
      });
      const result = await response.json();
      if (!response.ok) throw new Error(getApiError(result, "Imeshindikana kutoka."));
      setAuthenticated(false);
      setOrders([]);
      setOverview(null);
      setMetrics(null);
      setProfile(null);
      setError("");
    } catch (logoutError) {
      setError(logoutError instanceof Error ? logoutError.message : "Imeshindikana kutoka.");
    }
  }

  if (authenticated === null) {
    return <p role="status" className="text-center text-sm text-charcoal/70">{isEnglish ? "Checking session..." : "Inakagua akaunti..."}</p>;
  }

  if (!authenticated) {
    return (
      <div className="space-y-5">
        {error && <p role="alert" className="mx-auto max-w-md rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        <AdminLoginForm onSuccess={handleLoginSuccess} />
      </div>
    );
  }

  const tabs: { id: AdminTab; sw: string; en: string }[] = [
    { id: "overview", sw: "Muhtasari", en: "Overview" },
    { id: "orders", sw: "Oda", en: "Orders" },
    { id: "products", sw: "Dhibiti Bidhaa", en: "Manage Products" },
    { id: "services", sw: "Huduma", en: "Services" },
    { id: "messages", sw: "Ujumbe", en: "Messages" },
    { id: "reviews", sw: "Maoni", en: "Reviews" },
    { id: "profile", sw: "Wasifu", en: "Profile" }
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-plum px-5 py-5 text-cream sm:px-7">
        <div className="flex min-w-0 items-center gap-4">
          {profile?.avatar_path ? (
            <Image
              src={profile.avatar_path.startsWith("/uploads/") ? `${API_BASE_URL.replace(/\/api\/v1$/, "")}${profile.avatar_path}` : profile.avatar_path}
              alt={profile.display_name}
              width={56}
              height={56}
              unoptimized
              className="h-14 w-14 rounded-full border-2 border-gold object-cover"
            />
          ) : (
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-gold/20 font-display text-xl font-bold text-gold">
              {(profile?.display_name ?? "A").slice(0, 1).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.2em] text-gold">{isEnglish ? "Administrator" : "Msimamizi"}</p>
            <p className="truncate font-display text-xl font-semibold">{profile?.display_name ?? "Admin"}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/"
            className="rounded-full border border-cream/30 px-4 py-2 text-sm font-medium transition hover:bg-cream/10"
          >
            {isEnglish ? "View website" : "Tazama tovuti"}
          </Link>
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="rounded-full border border-cream/30 px-4 py-2 text-sm font-medium hover:bg-cream/10"
          >
            {isEnglish ? "Log out" : "Toka"}
          </button>
        </div>
      </header>

      {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <nav aria-label={isEnglish ? "Admin sections" : "Sehemu za admin"} className="flex gap-2 overflow-x-auto rounded-2xl border border-plum/10 bg-white p-2">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            aria-current={tab === item.id ? "page" : undefined}
            className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
              tab === item.id ? "bg-plum text-cream shadow-sm" : "text-plum/75 hover:bg-rose-light/25"
            }`}
          >
            {isEnglish ? item.en : item.sw}
          </button>
        ))}
      </nav>

      <section className="min-h-72 rounded-3xl border border-plum/10 bg-white p-5 shadow-sm sm:p-7">
        {tab === "overview" && overview && metrics && (
          <SalesDashboard orders={orders} overview={overview} metrics={metrics} />
        )}
        {tab === "orders" && <AdminOperations view="orders" />}
        {tab === "products" && <AdminProductManager />}
        {tab === "services" && <AdminServiceManager />}
        {tab === "messages" && <AdminOperations view="messages" />}
        {tab === "reviews" && <AdminOperations view="reviews" />}
        {tab === "profile" && <AdminProfileManager onSaved={(nextProfile) => setProfile(nextProfile)} />}
      </section>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { API_BASE_URL, getApiError } from "@/lib/api";
import { useSitePreferences } from "@/lib/preferences";

type StoreService = {
  id: number;
  title: string;
  description: string;
  title_en: string;
  description_en: string;
  is_active: boolean;
};

type ServiceForm = Omit<StoreService, "id">;

const EMPTY_FORM: ServiceForm = {
  title: "",
  description: "",
  title_en: "",
  description_en: "",
  is_active: true
};

export default function AdminServiceManager() {
  const { language } = useSitePreferences();
  const isEnglish = language === "en";
  const [services, setServices] = useState<StoreService[]>([]);
  const [form, setForm] = useState<ServiceForm>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadServices = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/services?include_inactive=true`, {
        credentials: "include"
      });
      const result = await response.json();
      if (!response.ok || !Array.isArray(result)) {
        throw new Error(getApiError(result, "Imeshindikana kupakia huduma."));
      }
      setServices(result as StoreService[]);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Imeshindikana kupakia huduma.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadServices();
  }, [loadServices]);

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch(
        `${API_BASE_URL}/services${editingId ? `/${editingId}` : ""}`,
        {
          method: editingId ? "PATCH" : "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form)
        }
      );
      const result = await response.json();
      if (!response.ok) {
        throw new Error(getApiError(result, "Imeshindikana kuhifadhi huduma."));
      }
      resetForm();
      setNotice(isEnglish ? "Service saved." : "Huduma imehifadhiwa.");
      await loadServices();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Imeshindikana kuhifadhi huduma.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleAvailability(service: StoreService) {
    setBusyId(service.id);
    setError("");
    setNotice("");
    try {
      const response = await fetch(`${API_BASE_URL}/services/${service.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !service.is_active })
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(getApiError(result, "Imeshindikana kubadili hali ya huduma."));
      }
      setServices((current) => current.map((item) => item.id === service.id ? result as StoreService : item));
    } catch (toggleError) {
      setError(toggleError instanceof Error ? toggleError.message : "Imeshindikana kubadili hali ya huduma.");
    } finally {
      setBusyId(null);
    }
  }

  function editService(service: StoreService) {
    setEditingId(service.id);
    setForm({
      title: service.title,
      description: service.description,
      title_en: service.title_en,
      description_en: service.description_en,
      is_active: service.is_active
    });
    setError("");
    setNotice("");
  }

  const updateField = (field: keyof ServiceForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="section-eyebrow">{isEnglish ? "Store content" : "Maudhui ya duka"}</p>
          <h2 className="mt-1 font-display text-2xl font-semibold text-plum">
            {isEnglish ? "Manage services" : "Dhibiti huduma"}
          </h2>
        </div>
        <button type="button" onClick={() => void loadServices()} className="btn-secondary px-4 py-2">
          {isEnglish ? "Refresh" : "Onyesha upya"}
        </button>
      </div>

      {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {notice && <p role="status" className="mt-4 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">{notice}</p>}

      <form onSubmit={handleSubmit} className="mt-6 grid gap-4 rounded-2xl border border-plum/10 p-5 sm:grid-cols-2">
        <h3 className="font-semibold text-plum sm:col-span-2">
          {editingId
            ? (isEnglish ? "Edit service" : "Hariri huduma")
            : (isEnglish ? "Add a service" : "Ongeza huduma")}
        </h3>
        <label className="space-y-1 text-sm font-medium text-plum">
          {isEnglish ? "Service name (Swahili)" : "Jina la huduma"}
          <input required minLength={2} maxLength={120} value={form.title} onChange={(event) => updateField("title", event.target.value)} className="w-full rounded-xl border border-plum/20 bg-white px-3 py-2 font-normal text-charcoal" />
        </label>
        <label className="space-y-1 text-sm font-medium text-plum">
          {isEnglish ? "Service name (English)" : "Jina la huduma (Kiingereza)"}
          <input maxLength={120} value={form.title_en} onChange={(event) => updateField("title_en", event.target.value)} className="w-full rounded-xl border border-plum/20 bg-white px-3 py-2 font-normal text-charcoal" />
        </label>
        <label className="space-y-1 text-sm font-medium text-plum">
          {isEnglish ? "Description (Swahili)" : "Maelezo ya huduma"}
          <textarea required minLength={5} maxLength={2000} rows={3} value={form.description} onChange={(event) => updateField("description", event.target.value)} className="w-full rounded-xl border border-plum/20 bg-white px-3 py-2 font-normal text-charcoal" />
        </label>
        <label className="space-y-1 text-sm font-medium text-plum">
          {isEnglish ? "Description (English)" : "Maelezo ya huduma (Kiingereza)"}
          <textarea maxLength={2000} rows={3} value={form.description_en} onChange={(event) => updateField("description_en", event.target.value)} className="w-full rounded-xl border border-plum/20 bg-white px-3 py-2 font-normal text-charcoal" />
        </label>
        <label className="flex items-center gap-2 text-sm text-charcoal sm:col-span-2">
          <input type="checkbox" checked={form.is_active} onChange={(event) => setForm((current) => ({ ...current, is_active: event.target.checked }))} className="h-4 w-4 accent-plum" />
          {isEnglish ? "Available on the website" : "Huduma ionekane kwenye tovuti"}
        </label>
        <div className="flex flex-wrap gap-3 sm:col-span-2">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? (isEnglish ? "Saving..." : "Inahifadhi...") : (isEnglish ? "Save service" : "Hifadhi huduma")}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="btn-secondary">
              {isEnglish ? "Cancel" : "Ghairi"}
            </button>
          )}
        </div>
      </form>

      <div className="mt-6 space-y-3">
        {loading && <p role="status" className="text-sm text-charcoal/70">{isEnglish ? "Loading..." : "Inapakia..."}</p>}
        {!loading && services.length === 0 && (
          <p className="rounded-xl bg-rose-light/25 p-4 text-sm text-charcoal/70">
            {isEnglish ? "No services yet." : "Bado hakuna huduma."}
          </p>
        )}
        {services.map((service) => (
          <article key={service.id} className="flex flex-col gap-3 rounded-2xl border border-plum/10 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h3 className="font-semibold text-plum">{service.title}</h3>
              <p className="text-sm text-charcoal/70">{service.description}</p>
              <p className="mt-1 text-xs text-charcoal/55">{service.is_active ? (isEnglish ? "Visible" : "Inaonekana") : (isEnglish ? "Hidden" : "Imefichwa")}</p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <button type="button" onClick={() => editService(service)} className="btn-secondary px-4 py-2">
                {isEnglish ? "Edit" : "Hariri"}
              </button>
              <button type="button" disabled={busyId === service.id} onClick={() => void toggleAvailability(service)} className={service.is_active ? "btn-secondary px-4 py-2" : "btn-primary px-4 py-2"}>
                {service.is_active ? (isEnglish ? "Hide" : "Ficha") : (isEnglish ? "Make available" : "Weka hewani")}
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

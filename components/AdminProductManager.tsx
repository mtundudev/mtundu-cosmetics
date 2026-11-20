"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { API_BASE_URL, getApiError, getImageUrl } from "@/lib/api";
import { useSitePreferences } from "@/lib/preferences";
import Image from "next/image";

type Product = {
  id: number;
  slug: string;
  name: string;
  category: string;
  price: string;
  price_value: number;
  discount_percent: number;
  description: string;
  image: string;
  is_active: boolean;
};

type ProductForm = Omit<Product, "id">;

const EMPTY_FORM: ProductForm = {
  slug: "",
  name: "",
  category: "",
  price: "",
  price_value: 0,
  discount_percent: 0,
  description: "",
  image: "",
  is_active: true
};

async function readError(response: Response, fallback: string) {
  const result = await response.json();
  return getApiError(result, fallback);
}

export default function AdminProductManager() {
  const { t, language } = useSitePreferences();
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [imageInputKey, setImageInputKey] = useState(0);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/products?include_inactive=true`, {
        credentials: "include"
      });
      if (!response.ok) throw new Error(await readError(response, "Imeshindikana kupakia bidhaa."));
      const result = (await response.json()) as Product[];
      setProducts(result);
      setError("");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Imeshindikana kupakia bidhaa.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  function startEditing(product: Product) {
    setEditingSlug(product.slug);
    setForm({
      slug: product.slug,
      name: product.name,
      category: product.category,
      price: product.price,
      price_value: product.price_value,
      discount_percent: product.discount_percent ?? 0,
      description: product.description,
      image: product.image,
      is_active: product.is_active
    });
    setImageFile(null);
    setImagePreview(getImageUrl(product.image));
    setImageInputKey((key) => key + 1);
    setError("");
    setNotice("");
  }

  function resetForm() {
    setEditingSlug(null);
    setForm(EMPTY_FORM);
    setImageFile(null);
    setImagePreview("");
    setImageInputKey((key) => key + 1);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    const formData = new FormData(event.currentTarget);
    const priceValue = Number(formData.get("price_value"));
    const discountPercent = Number(formData.get("discount_percent"));
    let image = String(formData.get("image_url") ?? "").trim();
    const payload: ProductForm = {
      slug: String(formData.get("slug") ?? "").trim().toLowerCase(),
      name: String(formData.get("name") ?? "").trim(),
      category: String(formData.get("category") ?? "").trim(),
      price: `TZS ${priceValue.toLocaleString("en-US")}`,
      price_value: priceValue,
      discount_percent: discountPercent,
      description: String(formData.get("description") ?? "").trim(),
      image,
      is_active: formData.get("is_active") === "on"
    };

    try {
      if (imageFile) {
        const upload = new FormData();
        upload.append("file", imageFile);
        const uploadResponse = await fetch(`${API_BASE_URL}/admin/media/products`, {
          method: "POST",
          credentials: "include",
          body: upload
        });
        const uploadResult = (await uploadResponse.json()) as { path?: string; detail?: unknown };
        if (!uploadResponse.ok || !uploadResult.path) {
          throw new Error(getApiError(uploadResult, "Imeshindikana kupakia picha ya bidhaa."));
        }
        image = uploadResult.path;
        payload.image = image;
      }
      if (!image) throw new Error("Chagua picha ya bidhaa kabla ya kuihifadhi.");
      const response = await fetch(
        `${API_BASE_URL}/products${editingSlug ? `/${encodeURIComponent(editingSlug)}` : ""}`,
        {
          method: editingSlug ? "PUT" : "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }
      );
      if (!response.ok) throw new Error(await readError(response, "Imeshindikana kuhifadhi bidhaa."));
      await response.json();
      resetForm();
      setNotice(t("admin.productSaved"));
      await loadProducts();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Imeshindikana kuhifadhi bidhaa.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleVisibility(product: Product) {
    setError("");
    setNotice("");
    try {
      const response = await fetch(`${API_BASE_URL}/products/${encodeURIComponent(product.slug)}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !product.is_active })
      });
      if (!response.ok) throw new Error(await readError(response, "Imeshindikana kubadili hali ya bidhaa."));
      await loadProducts();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Imeshindikana kubadili hali ya bidhaa.");
    }
  }

  async function deleteProduct(product: Product) {
    if (!window.confirm(t("admin.confirmDelete"))) return;

    setError("");
    setNotice("");
    try {
      const response = await fetch(`${API_BASE_URL}/products/${encodeURIComponent(product.slug)}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (!response.ok) throw new Error(await readError(response, "Imeshindikana kufuta bidhaa."));
      setProducts((current) => current.filter((item) => item.slug !== product.slug));
      if (editingSlug === product.slug) resetForm();
      setNotice(t("admin.productDeleted"));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Imeshindikana kufuta bidhaa.");
    }
  }

  function updateSlugFromName(name: string) {
    setForm((current) => ({
      ...current,
      name,
      slug: name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
    }));
  }

  function chooseImage(file: File | null) {
    setError("");
    setImageFile(null);
    if (!file) {
      setImagePreview(form.image ? getImageUrl(form.image) : "");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Picha isizidi MB 5.");
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Tumia picha ya JPEG, PNG au WebP.");
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(String(reader.result ?? ""));
    reader.readAsDataURL(file);
  }

  return (
    <section className="mt-12 border-t border-plum/10 pt-8">
      <h2 className="font-display text-xl font-semibold text-plum">{t("admin.products")}</h2>

      {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {notice && <p role="status" className="mt-4 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">{notice}</p>}

      <form onSubmit={handleSubmit} className="mt-6 grid gap-4 rounded-2xl border border-plum/10 p-5 sm:grid-cols-2 lg:grid-cols-3">
        <h3 className="font-semibold text-plum sm:col-span-2 lg:col-span-3">
          {editingSlug ? t("admin.edit") : t("admin.add")}
        </h3>
        <label className="space-y-1 text-sm font-medium text-plum">
          {t("admin.productName")}
          <input
            name="name"
            required
            value={form.name}
            onChange={(event) => updateSlugFromName(event.target.value)}
            className="w-full rounded-xl border border-plum/20 bg-white px-3 py-2 text-sm font-normal text-charcoal"
          />
        </label>
        <label className="space-y-1 text-sm font-medium text-plum">
          {t("admin.slug")}
          <input
            name="slug"
            required
            pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
            value={form.slug}
            readOnly
            className="w-full rounded-xl border border-plum/20 bg-white px-3 py-2 text-sm font-normal text-charcoal read-only:bg-cream-muted"
          />
        </label>
        <label className="space-y-1 text-sm font-medium text-plum">
          {t("admin.category")}
          <input
            name="category"
            required
            value={form.category}
            onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
            className="w-full rounded-xl border border-plum/20 bg-white px-3 py-2 text-sm font-normal text-charcoal"
          />
        </label>
        <label className="space-y-1 text-sm font-medium text-plum">
          {t("admin.price")}
          <input
            name="price_value"
            type="number"
            min="0"
            step="1"
            required
            value={form.price_value}
            onChange={(event) => setForm((current) => ({ ...current, price_value: Number(event.target.value) }))}
            className="w-full rounded-xl border border-plum/20 bg-white px-3 py-2 text-sm font-normal text-charcoal"
          />
        </label>
        <label className="space-y-1 text-sm font-medium text-plum">
          {language === "sw" ? "Punguzo (%)" : "Discount (%)"}
          <input
            name="discount_percent"
            type="number"
            min="0"
            max="100"
            step="1"
            required
            value={form.discount_percent}
            onChange={(event) => setForm((current) => ({ ...current, discount_percent: Number(event.target.value) }))}
            className="w-full rounded-xl border border-plum/20 bg-white px-3 py-2 text-sm font-normal text-charcoal"
          />
        </label>
        <label className="space-y-1 text-sm font-medium text-plum sm:col-span-2">
          {t("admin.image")}
          <input type="hidden" name="image_url" value={form.image} />
          <input
            key={imageInputKey}
            name="image_file"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => chooseImage(event.target.files?.[0] ?? null)}
            className="w-full rounded-xl border border-plum/20 bg-white px-3 py-2 text-sm font-normal text-charcoal"
          />
          <span className="block text-xs font-normal text-charcoal/60">JPEG, PNG au WebP · hadi MB 5</span>
          {imagePreview && (
            <Image
              src={imagePreview}
              alt="Muonekano wa picha ya bidhaa"
              width={128}
              height={128}
              unoptimized
              className="mt-2 h-32 w-32 rounded-xl object-cover"
            />
          )}
        </label>
        <label className="space-y-1 text-sm font-medium text-plum sm:col-span-2 lg:col-span-3">
          {t("admin.description")}
          <textarea
            name="description"
            required
            rows={3}
            value={form.description}
            onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
            className="w-full rounded-xl border border-plum/20 bg-white px-3 py-2 text-sm font-normal text-charcoal"
          />
        </label>
        <label className="flex items-center gap-2 text-sm text-charcoal sm:col-span-2 lg:col-span-3">
          <input
            name="is_active"
            type="checkbox"
            checked={form.is_active}
            onChange={(event) => setForm((current) => ({ ...current, is_active: event.target.checked }))}
            className="h-4 w-4 accent-plum"
          />
          {t("admin.active")}
        </label>
        <div className="flex flex-wrap gap-3 sm:col-span-2 lg:col-span-3">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? t("form.sending") : editingSlug ? t("admin.update") : t("admin.save")}
          </button>
          {editingSlug && (
            <button type="button" onClick={resetForm} className="btn-secondary">
              {t("admin.cancel")}
            </button>
          )}
        </div>
      </form>

      <div className="mt-6 space-y-3">
        {loading && <p role="status" className="text-sm text-charcoal/70">{t("form.loading")}</p>}
        {!loading && products.length === 0 && (
          <p className="rounded-xl bg-rose-light/25 p-4 text-sm text-charcoal/70">
            {t("admin.products")}: 0
          </p>
        )}
        {products.map((product) => (
          <article key={product.id} className="flex flex-col gap-3 rounded-2xl border border-plum/10 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h3 className="truncate font-semibold text-plum">{product.name}</h3>
              <p className="text-sm text-charcoal/70">
                {product.category} · {product.price}
                {product.discount_percent > 0 && ` · ${product.discount_percent}% ${language === "sw" ? "punguzo" : "off"}`}
                {` · ${product.is_active ? t("admin.active") : t("admin.inactive")}`}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => startEditing(product)} className="btn-secondary px-4 py-2">
                {t("admin.edit")}
              </button>
              <button type="button" onClick={() => void toggleVisibility(product)} className="btn-secondary px-4 py-2">
                {t("admin.toggleVisibility")}
              </button>
              <button type="button" onClick={() => void deleteProduct(product)} className="rounded-full border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50">
                {t("admin.delete")}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

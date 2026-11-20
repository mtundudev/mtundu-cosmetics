"use client";

import { useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import { API_BASE_URL, getApiError } from "@/lib/api";
import { useSitePreferences } from "@/lib/preferences";

type AdminProfile = { display_name: string; avatar_path: string | null };
type AdminProfileManagerProps = { onSaved: (profile: AdminProfile) => void };

export default function AdminProfileManager({ onSaved }: AdminProfileManagerProps) {
  const { language } = useSitePreferences();
  const isEnglish = language === "en";
  const [displayName, setDisplayName] = useState("");
  const [avatarPath, setAvatarPath] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    fetch(`${API_BASE_URL}/admin/profile`, { credentials: "include" })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(getApiError(result, "Imeshindikana kupakia wasifu."));
        if (!active) return;
        const profile = result as AdminProfile;
        setDisplayName(profile.display_name);
        setAvatarPath(profile.avatar_path ?? "");
        setPreview(profile.avatar_path ?? "");
      })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "Imeshindikana kupakia wasifu.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  function chooseFile(selected: File | null) {
    setError("");
    setFile(null);
    if (!selected) {
      setPreview(avatarPath);
      return;
    }
    if (selected.size > 5 * 1024 * 1024 || !["image/jpeg", "image/png", "image/webp"].includes(selected.type)) {
      setError(isEnglish ? "Choose a JPEG, PNG or WebP image up to 5 MB." : "Chagua picha ya JPEG, PNG au WebP isiyozidi MB 5.");
      return;
    }
    setFile(selected);
    const reader = new FileReader();
    reader.onload = () => setPreview(String(reader.result ?? ""));
    reader.readAsDataURL(selected);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      let nextAvatarPath = avatarPath;
      if (file) {
        const body = new FormData();
        body.append("file", file);
        const uploadResponse = await fetch(`${API_BASE_URL}/admin/media/profile`, {
          method: "POST",
          credentials: "include",
          body
        });
        const uploadResult = (await uploadResponse.json()) as { path?: string; detail?: unknown };
        if (!uploadResponse.ok || !uploadResult.path) {
          throw new Error(getApiError(uploadResult, "Imeshindikana kupakia picha ya wasifu."));
        }
        nextAvatarPath = uploadResult.path;
      }
      const response = await fetch(`${API_BASE_URL}/admin/profile`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ display_name: displayName.trim(), avatar_path: nextAvatarPath || null })
      });
      const result = (await response.json()) as AdminProfile | { detail?: unknown };
      if (!response.ok || !("display_name" in result)) {
        throw new Error(getApiError(result, "Imeshindikana kuhifadhi wasifu."));
      }
      setAvatarPath(result.avatar_path ?? "");
      setFile(null);
      setPreview(result.avatar_path ?? "");
      onSaved(result);
      setNotice(isEnglish ? "Profile saved." : "Wasifu umehifadhiwa.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Imeshindikana kuhifadhi wasifu.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p role="status" className="text-sm text-charcoal/70">{isEnglish ? "Loading profile..." : "Inapakia wasifu..."}</p>;

  return (
    <section className="max-w-2xl">
      <p className="section-eyebrow">{isEnglish ? "Account settings" : "Mipangilio ya akaunti"}</p>
      <h2 className="mt-1 font-display text-2xl font-semibold text-plum">{isEnglish ? "Admin profile" : "Wasifu wa admin"}</h2>
      {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {notice && <p role="status" className="mt-4 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">{notice}</p>}
      <form onSubmit={handleSubmit} className="mt-6 grid gap-5 rounded-2xl border border-plum/10 p-5 sm:grid-cols-[160px_1fr] sm:p-6">
        <div className="flex flex-col items-center gap-3">
          {preview ? (
            <Image src={preview.startsWith("/uploads/") ? `${API_BASE_URL.replace(/\/api\/v1$/, "")}${preview}` : preview} alt={displayName} width={128} height={128} unoptimized className="h-32 w-32 rounded-full border-4 border-rose-light object-cover" />
          ) : (
            <div className="grid h-32 w-32 place-items-center rounded-full bg-rose-light/30 font-display text-4xl font-semibold text-plum">
              {displayName.slice(0, 1).toUpperCase()}
            </div>
          )}
          <label className="cursor-pointer rounded-full border border-plum/20 px-4 py-2 text-center text-xs font-semibold text-plum hover:bg-rose-light/20">
            {isEnglish ? "Choose a photo" : "Chagua picha"}
            <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => chooseFile(event.target.files?.[0] ?? null)} />
          </label>
        </div>
        <div className="space-y-4">
          <label className="block space-y-1 text-sm font-medium text-plum">
            {isEnglish ? "Display name" : "Jina litakaloonekana"}
            <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} minLength={2} maxLength={120} required className="w-full rounded-xl border border-plum/20 bg-white px-3 py-2 text-sm font-normal text-charcoal" />
          </label>
          <p className="text-xs text-charcoal/60">JPEG, PNG au WebP · hadi MB 5</p>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? (isEnglish ? "Saving..." : "Inahifadhi...") : (isEnglish ? "Save profile" : "Hifadhi wasifu")}
          </button>
        </div>
      </form>
    </section>
  );
}

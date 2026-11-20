"use client";

import { FormEvent, useState } from "react";
import { API_BASE_URL, getApiError } from "@/lib/api";

type AdminLoginFormProps = {
  onSuccess: () => void;
};

export default function AdminLoginForm({ onSuccess }: AdminLoginFormProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/admin/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });

      const result = (await response.json()) as { ok: boolean };

      if (!response.ok || !result.ok) {
        setError(getApiError(result, "Imeshindikana kuingia."));
        setLoading(false);
        return;
      }

      onSuccess();
    } catch {
      setError("Hitilafu ya mtandao. Jaribu tena.");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm rounded-3xl border border-plum/10 p-8">
      <h1 className="font-display text-xl font-semibold text-plum">Admin Dashboard</h1>
      <p className="mt-2 text-sm text-charcoal/70">
        Weka password kuona takwimu za mauzo.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-plum">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-xl border border-plum/20 bg-cream px-4 py-2.5 text-sm outline-none focus:border-plum"
          />
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Inaingia..." : "Login"}
        </button>

        {error && (
          <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}
      </form>
    </div>
  );
}

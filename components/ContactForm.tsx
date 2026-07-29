"use client";

import { FormEvent, useState } from "react";

type Status = "idle" | "loading" | "success" | "error";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      message: String(formData.get("message") ?? "")
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = (await response.json()) as { ok: boolean; error?: string };

      if (!response.ok || !result.ok) {
        setStatus("error");
        setErrorMessage(result.error ?? "Imeshindikana kutuma ujumbe. Jaribu tena.");
        return;
      }

      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
      setErrorMessage("Hitilafu ya mtandao. Hakikisha una internet kisha jaribu tena.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-2 block text-sm font-medium text-plum">
            Jina Kamili
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            minLength={2}
            className="w-full rounded-xl border border-plum/20 bg-cream px-4 py-3 text-sm text-charcoal outline-none focus:border-plum"
            placeholder="Jina lako"
          />
        </div>

        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium text-plum">
            Barua Pepe
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full rounded-xl border border-plum/20 bg-cream px-4 py-3 text-sm text-charcoal outline-none focus:border-plum"
            placeholder="jina@barua.com"
          />
        </div>
      </div>

      <div>
        <label htmlFor="phone" className="mb-2 block text-sm font-medium text-plum">
          Namba ya Simu (si lazima)
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          className="w-full rounded-xl border border-plum/20 bg-cream px-4 py-3 text-sm text-charcoal outline-none focus:border-plum"
          placeholder="07XX XXX XXX"
        />
      </div>

      <div>
        <label htmlFor="message" className="mb-2 block text-sm font-medium text-plum">
          Ujumbe
        </label>
        <textarea
          id="message"
          name="message"
          required
          minLength={6}
          rows={5}
          className="w-full rounded-xl border border-plum/20 bg-cream px-4 py-3 text-sm text-charcoal outline-none focus:border-plum"
          placeholder="Andika ujumbe wako hapa..."
        />
      </div>

      <button type="submit" disabled={status === "loading"} className="btn-primary w-full sm:w-auto">
        {status === "loading" ? "Inatuma..." : "Tuma Ujumbe"}
      </button>

      {status === "success" && (
        <p role="status" className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
          Asante! Ujumbe wako umetumwa. Tutakujibu hivi karibuni.
        </p>
      )}

      {status === "error" && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </p>
      )}
    </form>
  );
}

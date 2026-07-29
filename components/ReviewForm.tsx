"use client";

import { FormEvent, useState } from "react";
import { StarPicker } from "./StarRating";

type Status = "idle" | "loading" | "success" | "error";

export default function ReviewForm() {
  const [rating, setRating] = useState(5);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name") ?? "").trim();
    const message = String(formData.get("message") ?? "").trim();

    if (name.length < 2 || message.length < 5) {
      setStatus("error");
      setErrorMessage("Tafadhali jaza jina na ujumbe wenye maana.");
      return;
    }

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, rating, message })
      });

      const result = (await response.json()) as { ok: boolean; error?: string };

      if (!response.ok || !result.ok) {
        setStatus("error");
        setErrorMessage(result.error ?? "Imeshindikana kutuma maoni yako. Jaribu tena baadaye.");
        return;
      }

      setStatus("success");
      setRating(5);
      form.reset();
    } catch {
      setStatus("error");
      setErrorMessage("Hitilafu ya mtandao. Hakikisha una internet kisha jaribu tena.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div>
        <label htmlFor="name" className="mb-2 block text-sm font-medium text-plum">
          Jina Lako
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
        <p className="mb-2 block text-sm font-medium text-plum">Kiwango cha Kuridhika</p>
        <StarPicker value={rating} onChange={setRating} />
      </div>

      <div>
        <label htmlFor="message" className="mb-2 block text-sm font-medium text-plum">
          Maoni Yako
        </label>
        <textarea
          id="message"
          name="message"
          required
          minLength={5}
          rows={4}
          className="w-full rounded-xl border border-plum/20 bg-cream px-4 py-3 text-sm text-charcoal outline-none focus:border-plum"
          placeholder="Andika maoni yako kuhusu bidhaa au huduma zetu..."
        />
      </div>

      <button type="submit" disabled={status === "loading"} className="btn-primary w-full sm:w-auto">
        {status === "loading" ? "Inatuma..." : "Tuma Maoni"}
      </button>

      {status === "success" && (
        <p role="status" className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
          Asante kwa maoni yako! Yatatokea hapa baada ya kupitiwa na kukubaliwa.
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

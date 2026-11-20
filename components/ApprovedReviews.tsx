"use client";

import { useEffect, useState } from "react";
import { StarsDisplay } from "@/components/StarRating";
import { API_BASE_URL, getApiError } from "@/lib/api";

type Review = {
  id: number;
  name: string;
  rating: number;
  message: string;
};

export default function ApprovedReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadReviews() {
      try {
        const response = await fetch(`${API_BASE_URL}/reviews`);
        const result = (await response.json()) as Review[] | { detail?: unknown };
        if (!response.ok || !Array.isArray(result)) {
          throw new Error(getApiError(result, "Imeshindikana kupakia maoni."));
        }
        if (active) setReviews(result);
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error ? loadError.message : "Imeshindikana kupakia maoni."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadReviews();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-6 lg:col-span-3">
      {error && (
        <p role="alert" className="rounded-2xl bg-red-50 p-6 text-sm text-red-700">
          {error}
        </p>
      )}
      {loading && (
        <p role="status" className="text-sm text-charcoal/70">
          Inapakia maoni...
        </p>
      )}
      {!loading && !error && reviews.length === 0 && (
        <p className="rounded-2xl bg-rose-light/25 p-6 text-sm text-charcoal/70">
          Hakuna maoni bado. Kuwa wa kwanza kutoa maoni yako!
        </p>
      )}

      {reviews.map((review) => (
        <div key={review.id} className="rounded-2xl border border-plum/10 p-6">
          <StarsDisplay rating={review.rating} />
          <p className="mt-3 text-sm text-charcoal/80">{review.message}</p>
          <p className="mt-4 font-semibold text-plum">{review.name}</p>
        </div>
      ))}
    </div>
  );
}

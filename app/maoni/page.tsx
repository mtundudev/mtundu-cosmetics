import type { Metadata } from "next";
import SectionHeading from "@/components/SectionHeading";
import ReviewForm from "@/components/ReviewForm";
import { StarsDisplay } from "@/components/StarRating";
import { isSupabaseConfigured, supabase, type Review } from "@/lib/supabase";
import { BRAND } from "@/lib/nav";

export const metadata: Metadata = {
  title: "Maoni",
  description: `Soma maoni ya wateja wa ${BRAND.name} na uache maoni yako mwenyewe.`
};

export const dynamic = "force-dynamic";

async function getApprovedReviews(): Promise<Review[]> {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("approved", true)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data as Review[];
}

export default async function MaoniPage() {
  const reviews = await getApprovedReviews();

  return (
    <div className="container-page py-16 md:py-24">
      <SectionHeading
        eyebrow="Sauti za Wateja"
        title="Maoni ya Wateja Wetu"
        description="Soma uzoefu wa wateja wetu, au acha maoni yako mwenyewe hapa chini."
      />

      <div className="mt-12 grid gap-12 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          {reviews.length === 0 && (
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

        <div className="lg:col-span-2">
          <div className="rounded-3xl border border-plum/10 p-6 sm:p-8">
            <h3 className="font-display text-lg font-semibold text-plum">Acha Maoni Yako</h3>
            <p className="mt-1 text-sm text-charcoal/60">
              Maoni yako yataonekana hapa baada ya kupitiwa na timu yetu.
            </p>
            <div className="mt-6">
              <ReviewForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

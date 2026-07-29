"use client";

type ReadOnlyStarsProps = {
  rating: number;
};

export function StarsDisplay({ rating }: ReadOnlyStarsProps) {
  return (
    <div className="flex gap-0.5" aria-label={`Nyota ${rating} kati ya 5`}>
      {[1, 2, 3, 4, 5].map((value) => (
        <span
          key={value}
          className={value <= rating ? "text-gold" : "text-plum/15"}
          aria-hidden="true"
        >
          ★
        </span>
      ))}
    </div>
  );
}

type StarPickerProps = {
  value: number;
  onChange: (value: number) => void;
};

export function StarPicker({ value, onChange }: StarPickerProps) {
  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Chagua nyota">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} nyota`}
          onClick={() => onChange(star)}
          className={`text-2xl leading-none transition-colors ${
            star <= value ? "text-gold" : "text-plum/20 hover:text-gold/60"
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

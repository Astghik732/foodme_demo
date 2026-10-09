import { useRef } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

const STARS = [1, 2, 3, 4, 5] as const;

function starLabel(value: number) {
  return `${value} ${value === 1 ? "star" : "stars"}`;
}

interface StarRatingInputProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  "aria-labelledby"?: string;
}

/**
 * Interactive 1-5 star picker. Implemented as a radio group so it works with mouse, touch
 * and keyboard (arrow keys move + select, Tab enters/leaves the group) and is announced
 * by screen readers as "N stars, radio button, x of 5".
 */
export function StarRatingInput({ value, onChange, disabled, ...rest }: StarRatingInputProps) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  const move = (next: number) => {
    const clamped = Math.min(5, Math.max(1, next));
    onChange(clamped);
    refs.current[clamped - 1]?.focus();
  };

  const onKeyDown = (event: React.KeyboardEvent, current: number) => {
    switch (event.key) {
      case "ArrowRight":
      case "ArrowUp":
        event.preventDefault();
        move(current + 1);
        break;
      case "ArrowLeft":
      case "ArrowDown":
        event.preventDefault();
        move(current - 1);
        break;
      case "Home":
        event.preventDefault();
        move(1);
        break;
      case "End":
        event.preventDefault();
        move(5);
        break;
    }
  };

  return (
    <div role="radiogroup" aria-labelledby={rest["aria-labelledby"]} className="flex items-center gap-1">
      {STARS.map((n) => {
        const checked = value === n;
        // Roving tabindex: the checked star (or the first, if none) is the tab stop.
        const tabbable = checked || (value === 0 && n === 1);
        return (
          <button
            key={n}
            ref={(el) => {
              refs.current[n - 1] = el;
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            aria-label={starLabel(n)}
            tabIndex={tabbable ? 0 : -1}
            disabled={disabled}
            onClick={() => onChange(n)}
            onKeyDown={(e) => onKeyDown(e, n)}
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-full sm:h-10 sm:w-10",
              "transition-transform duration-150 active:scale-90",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2",
              "disabled:opacity-50",
            )}
          >
            <Star
              size={28}
              strokeWidth={1.75}
              aria-hidden="true"
              className={n <= value ? "fill-amber-400 text-amber-500" : "fill-transparent text-zinc-300"}
            />
          </button>
        );
      })}
    </div>
  );
}

interface StarRatingDisplayProps {
  stars: number;
  size?: number;
  className?: string;
}

/** Read-only stars; exposed to assistive tech as a single labelled image. */
export function StarRatingDisplay({ stars, size = 16, className }: StarRatingDisplayProps) {
  return (
    <span
      role="img"
      aria-label={`Rated ${stars} out of 5 stars`}
      className={cn("inline-flex items-center gap-0.5", className)}
    >
      {STARS.map((n) => (
        <Star
          key={n}
          size={size}
          strokeWidth={1.75}
          aria-hidden="true"
          className={n <= stars ? "fill-amber-400 text-amber-500" : "fill-transparent text-zinc-300"}
        />
      ))}
    </span>
  );
}

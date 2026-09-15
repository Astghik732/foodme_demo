import { memo, type MouseEvent } from "react";
import { Minus, Plus } from "lucide-react";

interface ItemQuantityButtonGroupProps {
  min?: number;
  max?: number;
  quantity: number;
  onIncrement?: (e: MouseEvent<HTMLButtonElement>) => void;
  onDecrement?: (e: MouseEvent<HTMLButtonElement>) => void;
}

const ItemQuantityButtonGroup_ = ({
  quantity,
  onIncrement,
  onDecrement,
  min = 1,
  max,
}: ItemQuantityButtonGroupProps) => {
  return (
    <div className="fm-qty-grp inline-flex items-center gap-0.5 rounded-full border border-zinc-200/90 bg-white p-0.5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <button
        type="button"
        onClick={onDecrement}
        disabled={quantity === min}
        aria-label="Decrease quantity"
        className={[
          "flex h-7 w-7 items-center justify-center rounded-full",
          "text-zinc-500",
          "transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)]",
          "hover:bg-zinc-50 hover:text-zinc-900",
          "active:scale-[0.92]",
          "disabled:cursor-not-allowed disabled:opacity-30",
        ].join(" ")}
      >
        <Minus size={12} strokeWidth={2} />
      </button>
      <p className="min-w-6 text-center text-sm font-bold tabular-nums text-zinc-900">{quantity}</p>
      <button
        type="button"
        onClick={onIncrement}
        disabled={quantity === max}
        aria-label="Increase quantity"
        className={[
          "flex h-7 w-7 items-center justify-center rounded-full",
          "text-zinc-500",
          "transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)]",
          "hover:bg-zinc-50 hover:text-zinc-900",
          "active:scale-[0.92]",
          "disabled:cursor-not-allowed disabled:opacity-30",
        ].join(" ")}
      >
        <Plus size={12} strokeWidth={2} />
      </button>
    </div>
  );
};

export const ItemQuantityButtonGroup = memo(ItemQuantityButtonGroup_);

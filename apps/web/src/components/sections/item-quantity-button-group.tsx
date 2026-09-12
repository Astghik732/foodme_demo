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
    <div className="flex items-center gap-2 fm-qty-grp">
      <button
        type="button"
        onClick={onDecrement}
        disabled={quantity === min}
        aria-label="Decrease quantity"
        className={[
          "h-7 w-7 rounded-full flex items-center justify-center",
          "text-zinc-500 border border-zinc-200 bg-white",
          "transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)]",
          "hover:border-zinc-300 hover:text-zinc-900",
          "active:scale-[0.94]",
          "disabled:opacity-30 disabled:cursor-not-allowed",
        ].join(" ")}
      >
        <Minus size={12} strokeWidth={2} />
      </button>
      <p className="w-5 text-center text-sm font-bold text-zinc-900">{quantity}</p>
      <button
        type="button"
        onClick={onIncrement}
        disabled={quantity === max}
        aria-label="Increase quantity"
        className={[
          "h-7 w-7 rounded-full flex items-center justify-center",
          "text-zinc-500 border border-zinc-200 bg-white",
          "transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)]",
          "hover:border-zinc-300 hover:text-zinc-900",
          "active:scale-[0.94]",
          "disabled:opacity-30 disabled:cursor-not-allowed",
        ].join(" ")}
      >
        <Plus size={12} strokeWidth={2} />
      </button>
    </div>
  );
};

export const ItemQuantityButtonGroup = memo(ItemQuantityButtonGroup_);

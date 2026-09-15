import { Trash2 } from "lucide-react";
import { ItemQuantityButtonGroup } from "@/components/sections/item-quantity-button-group";
import { decrementCartItem, incrementCartItem, removeCartItem } from "@/hooks/useCart";
import { formatAmd } from "@/lib/utils";
import type { ICartItem } from "@/types";

interface CartItemCardProps {
  item: ICartItem;
}

export function CartItemCard({ item }: CartItemCardProps) {
  const handleIncrement = () => {
    void incrementCartItem(item.uid);
  };

  const handleDecrement = () => {
    void decrementCartItem(item.uid);
  };

  return (
    <div className="cic_root flex items-start gap-3 py-4">
      <img
        src={item.url}
        alt={item.nameEn}
        className="h-14 w-14 shrink-0 rounded-xl object-cover ring-1 ring-black/5"
      />
      <div className="cic_body min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <p className="min-w-0 flex-1 truncate text-sm font-bold leading-7 text-zinc-900">
            {item.nameEn}
          </p>
          <button
            type="button"
            onClick={() => void removeCartItem(item.uid)}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
            aria-label="Remove item"
          >
            <Trash2 size={14} strokeWidth={1.75} />
          </button>
        </div>
        <p className="mt-0.5 text-sm tabular-nums text-zinc-600">
          <span className="font-semibold text-zinc-800">{formatAmd(item.price * item.quantity)}</span>
          {item.quantity > 1 && (
            <span className="text-zinc-400"> · {formatAmd(item.price)} each</span>
          )}
        </p>
        {item.additions && item.additions.length > 0 && (
          <p className="mt-1 text-xs leading-relaxed text-zinc-500">
            + {item.additions.map((a) => a.nameEn).join(", ")}
          </p>
        )}
        <div className="mt-3">
          <ItemQuantityButtonGroup
            quantity={item.quantity}
            onIncrement={handleIncrement}
            onDecrement={handleDecrement}
            min={0}
          />
        </div>
      </div>
    </div>
  );
}

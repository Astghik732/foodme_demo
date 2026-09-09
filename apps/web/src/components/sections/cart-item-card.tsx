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
    <div className="cic_root flex items-center gap-3 border-b py-3 last:border-b-0">
      <img src={item.url} alt={item.nameEn} className="h-14 w-14 rounded-xl object-cover" />
      <div className="cic_body flex-1">
        <p className="text-sm font-extrabold text-zinc-800">{item.nameEn}</p>
        <p className="text-sm font-semibold text-zinc-800">{formatAmd(item.price)}</p>
      </div>
      <ItemQuantityButtonGroup
        quantity={item.quantity}
        onIncrement={handleIncrement}
        onDecrement={handleDecrement}
        // FM-BUG-07
        min={0}
      />
      <button
        type="button"
        onClick={() => void removeCartItem(item.uid)}
        className="text-zinc-400 hover:text-primary"
        aria-label="Remove item"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}

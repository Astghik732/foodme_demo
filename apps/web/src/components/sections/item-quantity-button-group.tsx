import { memo, type MouseEvent } from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <div className="flex items-center gap-3 fm-qty-grp">
      <Button
        size="icon"
        variant="muted"
        onClick={onDecrement}
        disabled={quantity === min}
        aria-label="Decrease quantity"
        className="w-[32px] h-[32px]"
      >
        <Minus size={14} />
      </Button>
      <p className="text-lg font-extrabold text-zinc-950">{quantity}</p>
      <Button
        size="icon"
        variant="muted"
        onClick={onIncrement}
        disabled={quantity === max}
        aria-label="Increase quantity"
        className="w-[32px] h-[32px]"
      >
        <Plus size={14} />
      </Button>
    </div>
  );
};

export const ItemQuantityButtonGroup = memo(ItemQuantityButtonGroup_);

import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { addDishToCart } from "@/hooks/useCart";
import { formatAmd } from "@/lib/utils";
import type { DishDto } from "@/types";

interface DishModalProps {
  dish: DishDto | null;
  onOpenChange: (open: boolean) => void;
}

export function DishModal({ dish, onOpenChange }: DishModalProps) {
  const [adding, setAdding] = useState(false);

  if (!dish) return null;

  const handleAdd = async () => {
    setAdding(true);
    await addDishToCart(dish);
    setAdding(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={!!dish} onOpenChange={onOpenChange}>
      <DialogContent className="dm_content">
        <img src={dish.url} alt={dish.nameEn} className="h-64 w-full rounded-t-2xl object-cover" />
        <div className="dm_body px-6 pb-6">
          <h2 className="text-xl font-bold text-foreground">{dish.nameEn}</h2>
          <p className="mt-2 text-sm text-zinc-500">{dish.descriptionEn}</p>
          <p className="mt-1 text-xs text-zinc-400">Portion: {dish.portionEn}</p>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-lg font-extrabold text-primary">{formatAmd(dish.price)}</span>
            <Button onClick={handleAdd} disabled={adding}>
              {adding ? "Adding..." : "Add to cart"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

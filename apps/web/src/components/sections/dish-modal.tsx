import { useState, useMemo } from "react";

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
  const [selectedAdditions, setSelectedAdditions] = useState<number[]>([]);


  
  const totalPrice = useMemo(() => {
    if (!dish) return 0;
    let t = dish.price;
    if (dish.additions) {
      t += dish.additions
        .filter(a => selectedAdditions.includes(a.id))
        .reduce((sum, a) => sum + a.price, 0);
    }
    return t;
  }, [dish, selectedAdditions]);

  if (!dish) return null;

  const handleAdd = async () => {
    setAdding(true);
    await addDishToCart({ ...dish, additions: dish.additions?.filter(a => selectedAdditions.includes(a.id)) });
    setAdding(false);
    onOpenChange(false);
    setSelectedAdditions([]);
  };

  return (
    <Dialog open={!!dish} onOpenChange={(open) => { onOpenChange(open); if (!open) setSelectedAdditions([]); }}>
      <DialogContent className="dm_content">
        <img src={dish.url} alt={dish.nameEn} className="h-64 w-full rounded-t-2xl object-cover" />
        <div className="dm_body px-6 pb-6">
          <h2 className="text-xl font-bold text-foreground">{dish.nameEn}</h2>
          <p className="mt-2 text-sm text-zinc-500">{dish.descriptionEn}</p>
          <p className="mt-1 text-xs text-zinc-400">Portion: {dish.portionEn}</p>

          {dish.additions && dish.additions.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold text-sm mb-2">Additions</h3>
              <div className="space-y-2">
                {dish.additions.map((addition) => (
                  <div key={addition.id} className="flex items-center space-x-2">
                    
                    <input 
                      type="checkbox"
                      id={`addition-${addition.id}`}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      checked={selectedAdditions.includes(addition.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedAdditions(prev => [...prev, addition.id]);
                        } else {
                          setSelectedAdditions(prev => prev.filter(id => id !== addition.id));
                        }
                      }}
                    />

                    <label
                      htmlFor={`addition-${addition.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {addition.nameEn} (+{formatAmd(addition.price)})
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 flex items-center justify-between">
            <span className="text-lg font-extrabold text-primary">{formatAmd(totalPrice)}</span>
            <Button onClick={handleAdd} disabled={adding}>
              {adding ? "Adding..." : "Add to cart"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

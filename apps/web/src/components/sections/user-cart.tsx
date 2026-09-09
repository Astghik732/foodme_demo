import { Link } from "react-router-dom";
import { CartItemCard } from "@/components/sections/cart-item-card";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { formatAmd } from "@/lib/utils";

interface UserCartProps {
  chefId: number;
}

export function UserCart({ chefId }: UserCartProps) {
  const { items, subtotal } = useCart(chefId);

  return (
    <aside className="uc-panel sticky top-24 flex h-fit w-full max-w-sm flex-col rounded-xl border bg-card text-card-foreground p-5 shadow">
      <h3 className="mb-3 text-lg font-extrabold text-zinc-800">Your order</h3>
      {items.length === 0 ? (
        <p className="text-sm text-zinc-500">Your cart is empty. Add dishes from the menu.</p>
      ) : (
        <>
          <div className="fm-scrollbar max-h-80 overflow-y-auto pr-1">
            {items.map((item) => (
              <CartItemCard key={item.uid} item={item} />
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3">
            <span className="text-sm text-zinc-500">Subtotal</span>
            <span className="font-bold text-foreground">{formatAmd(subtotal)}</span>
          </div>
          <Button asChild className="mt-4 w-full">
            <Link to="/checkout">Go to checkout</Link>
          </Button>
        </>
      )}
    </aside>
  );
}

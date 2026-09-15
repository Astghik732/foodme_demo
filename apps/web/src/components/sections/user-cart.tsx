import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { CartItemCard } from "@/components/sections/cart-item-card";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { formatAmd } from "@/lib/utils";

interface UserCartProps {
  chefId: number;
  deliveryPrice?: number;
  freeDeliveryFrom?: number;
  hasForeignItems?: boolean;
  includeDelivery?: boolean;
}

export function UserCart({
  chefId,
  deliveryPrice = 0,
  freeDeliveryFrom = 0,
  hasForeignItems = false,
  includeDelivery = true,
}: UserCartProps) {
  const { items, subtotal, totalCount } = useCart(chefId);
  const remaining = freeDeliveryFrom - subtotal;
  const deliveryFee = deliveryPrice > 0 && (freeDeliveryFrom <= 0 || subtotal < freeDeliveryFrom)
    ? deliveryPrice
    : 0;
  const showDelivery = includeDelivery && items.length > 0;
  const grandTotal = subtotal + (showDelivery ? deliveryFee : 0);

  return (
    <>
      <aside
        id="order-dock"
        className={[
          "uc-panel order-first z-10 flex h-fit w-full flex-col self-start lg:order-none",
          "max-w-none lg:sticky lg:top-24 lg:w-[320px] lg:max-w-sm lg:shrink-0",
          "overflow-hidden rounded-2xl border border-zinc-200 bg-white",
          items.length > 0 || hasForeignItems ? "flex" : "hidden lg:flex",
        ].join(" ")}
      >
        <div className="p-5">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-base font-extrabold text-zinc-900">Your order</h3>
            {items.length > 0 && (
              <span className="rounded-lg bg-zinc-100 px-2 py-0.5 text-xs font-bold tabular-nums">
                {totalCount}
              </span>
            )}
          </div>

          {hasForeignItems && items.length === 0 ? (
            <div className="py-4">
              <p className="text-sm font-semibold text-zinc-800">Cart has another kitchen</p>
              <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                Adding a dish here replaces that order. You can also check out the current cart.
              </p>
              <Button asChild size="sm" variant="outline" className="mt-3 w-full font-semibold">
                <Link to="/checkout">Go to current cart</Link>
              </Button>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100">
                <ShoppingBag size={22} className="text-zinc-400" />
              </div>
              <p className="text-sm font-semibold text-zinc-800">Your cart is empty</p>
              <p className="mt-1 text-xs text-zinc-500">Add dishes from the menu</p>
            </div>
          ) : (
            <>
              <div className="fm-scrollbar max-h-80 divide-y divide-zinc-100 overflow-y-auto">
                {items.map((item) => (
                  <CartItemCard key={item.uid} item={item} />
                ))}
              </div>
              <div className="space-y-3 border-t border-zinc-100 pt-4">
                <div className="flex items-baseline justify-between gap-4 text-sm">
                  <span className="text-zinc-500">Subtotal</span>
                  <span className="font-bold tabular-nums">{formatAmd(subtotal)}</span>
                </div>
                {showDelivery && (
                  <div className="flex items-baseline justify-between gap-4 text-sm">
                    <span className="text-zinc-500">Delivery</span>
                    <span className="font-semibold tabular-nums text-zinc-700">
                      {deliveryFee === 0 ? "Free" : formatAmd(deliveryFee)}
                    </span>
                  </div>
                )}
                {deliveryFee > 0 && remaining > 0 && (
                  <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
                    Add {formatAmd(remaining)} more for free delivery.
                  </p>
                )}
                <div className="flex items-baseline justify-between gap-4 text-sm">
                  <span className="font-semibold text-zinc-900">Total</span>
                  <span className="font-extrabold tabular-nums">{formatAmd(grandTotal)}</span>
                </div>
                <Button asChild size="lg" className="w-full font-bold">
                  <Link to="/checkout">Go to checkout</Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </aside>

      {items.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white px-4 py-3 lg:hidden">
          <div className="mx-auto flex max-w-7xl items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-zinc-500">
                {totalCount} {totalCount === 1 ? "item" : "items"}
              </p>
              <p className="font-extrabold tabular-nums text-zinc-900">{formatAmd(grandTotal)}</p>
            </div>
            <Button asChild size="lg" className="shrink-0 font-bold">
              <Link to="/checkout">Checkout</Link>
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

import { formatAmd } from "@/lib/utils";

interface CheckoutPriceSummaryProps {
  subtotal: number;
  deliveryPrice: number;
  freeDeliveryFrom: number;
}

export function CheckoutPriceSummary({ subtotal, deliveryPrice, freeDeliveryFrom }: CheckoutPriceSummaryProps) {
  const total = subtotal + deliveryPrice;
  const remaining = freeDeliveryFrom - subtotal;

  return (
    <div className="cps_wrap space-y-2 rounded-xl bg-zinc-50 p-4 text-sm">
      <div className="flex justify-between text-zinc-600">
        <span>Subtotal</span>
        <span>{formatAmd(subtotal)}</span>
      </div>
      <div className="flex justify-between text-zinc-600">
        <span>Delivery</span>
        <span>{deliveryPrice === 0 ? "Free" : formatAmd(deliveryPrice)}</span>
      </div>
      {deliveryPrice > 0 && remaining > 0 && (
        <p className="text-xs text-primary">
          Add {formatAmd(remaining)} more for free delivery.
        </p>
      )}
      <div className="flex justify-between border-t border-zinc-200 pt-2 text-base font-bold text-foreground">
        <span>Total</span>
        <span>{formatAmd(total)}</span>
      </div>
    </div>
  );
}

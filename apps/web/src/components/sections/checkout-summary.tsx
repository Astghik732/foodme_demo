import { formatAmd } from "@/lib/utils";
import type { ICartItem } from "@/types";

interface CheckoutSummaryProps {
  items: ICartItem[];
}

export function CheckoutSummary({ items }: CheckoutSummaryProps) {
  return (
    <div className="cs_wrap divide-y divide-zinc-100 rounded-xl border border-zinc-100">
      {items.map((item) => (
        <div key={item.uid} className="flex items-center justify-between px-4 py-3 text-sm">
          <span className="text-foreground">
            {item.quantity} &times; {item.nameEn}
          </span>
          <span className="font-semibold text-foreground">{formatAmd(item.price * item.quantity)}</span>
        </div>
      ))}
    </div>
  );
}

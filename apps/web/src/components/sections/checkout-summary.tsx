import { formatAmd } from "@/lib/utils";
import type { ICartItem } from "@/types";

interface CheckoutSummaryProps {
  items: ICartItem[];
  embedded?: boolean;
}

export function CheckoutSummary({ items, embedded = false }: CheckoutSummaryProps) {
  const body = (
    <>
      <div className="px-5 pt-5 pb-3">
        <h2 className="text-[13px] font-semibold tracking-wide text-zinc-500">Your items</h2>
      </div>
      <div className="divide-y divide-zinc-100">
        {items.map((item) => (
          <div
            key={item.uid}
            className="grid grid-cols-[1.5rem_minmax(0,1fr)_auto] items-start gap-x-3 px-5 py-3 text-sm"
          >
            <span className="tabular-nums leading-5 text-zinc-400">
              {item.quantity}&times;
            </span>
            <div className="min-w-0">
              <p className="font-medium leading-5 text-zinc-900">{item.nameEn}</p>
              {item.additions && item.additions.length > 0 && (
                <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                  + {item.additions.map((a) => a.nameEn).join(", ")}
                </p>
              )}
            </div>
            <span className="shrink-0 font-semibold tabular-nums leading-5 text-zinc-800">
              {formatAmd(item.price * item.quantity)}
            </span>
          </div>
        ))}
      </div>
    </>
  );

  if (embedded) {
    return <div className="cs_wrap">{body}</div>;
  }

  return (
    <div className="cs_wrap bezel-outer shadow-diffuse">
      <div className="bezel-inner overflow-hidden">{body}</div>
    </div>
  );
}

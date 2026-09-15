import { cn } from "@/lib/utils";
import { Truck, ShoppingBag } from "lucide-react";
import type { DeliveryMethod } from "@/types";

interface DeliveryTypeInputProps {
  value: DeliveryMethod;
  onChange: (value: DeliveryMethod) => void;
  allowed?: DeliveryMethod[];
}

const options: { value: DeliveryMethod; label: string; hint: string; Icon: typeof Truck }[] = [
  { value: "DELIVERY", label: "Delivery", hint: "To your door", Icon: Truck },
  { value: "TAKEAWAY", label: "Takeaway", hint: "Pick up", Icon: ShoppingBag },
];

export function DeliveryTypeInput({ value, onChange, allowed }: DeliveryTypeInputProps) {
  const visible = allowed?.length ? options.filter((o) => allowed.includes(o.value)) : options;
  const cols = visible.length === 1 ? "grid-cols-1" : "grid-cols-2";

  return (
    <div className={cn("dti_row grid gap-1 rounded-xl bg-zinc-100 p-1", cols)}>
      {visible.map(({ value: optValue, label, hint, Icon }) => {
        const selected = value === optValue;
        return (
          <button
            key={optValue}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(optValue)}
            className={cn(
              "flex min-h-12 items-center gap-2.5 rounded-lg px-3 py-1.5 text-left transition-colors",
              selected ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700",
            )}
          >
            <Icon size={16} strokeWidth={1.8} className="shrink-0" />
            <span className="min-w-0 leading-tight">
              <span className="block text-sm font-semibold">{label}</span>
              <span className="block text-[11px] font-medium text-zinc-400">{hint}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

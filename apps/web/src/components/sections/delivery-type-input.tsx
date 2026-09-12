import { cn } from "@/lib/utils";
import { Truck, ShoppingBag } from "lucide-react";
import type { DeliveryMethod } from "@/types";

interface DeliveryTypeInputProps {
  value: DeliveryMethod;
  onChange: (value: DeliveryMethod) => void;
}

const options: { value: DeliveryMethod; label: string; Icon: typeof Truck }[] = [
  { value: "DELIVERY", label: "Delivery", Icon: Truck },
  { value: "TAKEAWAY", label: "Takeaway", Icon: ShoppingBag },
];

export function DeliveryTypeInput({ value, onChange }: DeliveryTypeInputProps) {
  return (
    <div className="dti_row grid grid-cols-2 gap-2 rounded-2xl bg-zinc-100 p-1-5">
      {options.map(({ value: optValue, label, Icon }) => (
        <button
          key={optValue}
          type="button"
          onClick={() => onChange(optValue)}
          className={cn(
            "flex items-center justify-center gap-2 rounded-xl py-2-5 text-sm font-semibold",
            "transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]",
            value === optValue
              ? "bg-white text-zinc-900 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.1)]"
              : "text-zinc-500 hover:text-zinc-700",
          )}
        >
          <Icon size={15} strokeWidth={1.5} />
          {label}
        </button>
      ))}
    </div>
  );
}

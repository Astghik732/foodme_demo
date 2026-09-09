import { cn } from "@/lib/utils";
import type { DeliveryMethod } from "@/types";

interface DeliveryTypeInputProps {
  value: DeliveryMethod;
  onChange: (value: DeliveryMethod) => void;
}

const options: { value: DeliveryMethod; label: string }[] = [
  { value: "DELIVERY", label: "Delivery" },
  { value: "TAKEAWAY", label: "Takeaway" },
];

export function DeliveryTypeInput({ value, onChange }: DeliveryTypeInputProps) {
  return (
    <div className="dti_row grid grid-cols-2 gap-2 rounded-xl bg-zinc-100 p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "rounded-lg py-2 text-sm font-semibold transition-colors",
            value === opt.value ? "bg-white text-primary shadow-sm" : "text-zinc-500",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

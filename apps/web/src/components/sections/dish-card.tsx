import { Plus } from "lucide-react";
import { formatAmd } from "@/lib/utils";
import type { DishDto } from "@/types";

interface DishCardProps {
  dish: DishDto;
  onOpen: (dish: DishDto) => void;
}

export function DishCard({ dish, onOpen }: DishCardProps) {
  return (
    <button
      type="button"
      onClick={() => onOpen(dish)}
      className="dc_card group h-full w-full text-start overflow-hidden rounded-xl border bg-card text-card-foreground shadow transition-shadow hover:shadow-md flex flex-col"
    >
      <div className="w-full relative">
        <img src={dish.url} alt={dish.nameEn} className="w-full object-cover h-[200px]" />
      </div>
      <div className="flex flex-col w-full px-4 pb-4 pt-3 gap-3 flex-1">
        <div className="flex flex-col gap-2">
          <p className="text-zinc-900 text-base font-bold">{dish.nameEn}</p>
          {dish.descriptionEn && (
            <p className="text-zinc-500 text-sm font-normal line-clamp-2">{dish.descriptionEn}</p>
          )}
        </div>
        <div className="flex items-center justify-between mt-auto pt-2">
          <p className="text-zinc-800 text-base font-semibold">{formatAmd(dish.price)}</p>
          <span
            className="w-8 h-8 flex items-center justify-center rounded-full bg-secondary text-primary transition-colors group-hover:bg-secondary/80"
            aria-hidden="true"
          >
            <Plus size={16} />
          </span>
        </div>
      </div>
    </button>
  );
}

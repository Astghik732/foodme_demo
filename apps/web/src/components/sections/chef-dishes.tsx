import { DishCard } from "@/components/sections/dish-card";
import type { ChefTagOrderWithDishTagDto, DishDto } from "@/types";

interface ChefDishesProps {
  tags: ChefTagOrderWithDishTagDto[];
  dishes: DishDto[];
  onOpenDish: (dish: DishDto) => void;
}

export function ChefDishes({ tags, dishes, onOpenDish }: ChefDishesProps) {
  const sortedTags = [...tags].sort((a, b) => a.priorityIndex - b.priorityIndex);
  const untagged = dishes.filter((d) => !tags.some((t) => t.dishTagDto.id === d.dishTagDto?.id));

  return (
    <div className="cds_wrap space-y-8">
      {sortedTags.map(({ dishTagDto }) => {
        const groupDishes = dishes.filter((d) => d.dishTagDto?.id === dishTagDto.id);
        if (groupDishes.length === 0) return null;
        return (
          <section key={dishTagDto.id}>
            <h2 className="mb-3 text-lg font-bold text-foreground">{dishTagDto.nameEn}</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {groupDishes.map((dish) => (
                <DishCard key={dish.id} dish={dish} onOpen={onOpenDish} />
              ))}
            </div>
          </section>
        );
      })}
      {untagged.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-bold text-foreground">Other</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {untagged.map((dish) => (
              <DishCard key={dish.id} dish={dish} onOpen={onOpenDish} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

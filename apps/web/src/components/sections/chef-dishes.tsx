import { DishCard } from "@/components/sections/dish-card";
import { Button } from "@/components/ui/button";
import type { ChefTagOrderWithDishTagDto, DishDto } from "@/types";

interface ChefDishesProps {
  tags: ChefTagOrderWithDishTagDto[];
  dishes: DishDto[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  onOpenDish: (dish: DishDto) => void;
  onChefMismatch?: (dish: DishDto, quantity: number) => void;
}

export function ChefDishes({
  tags,
  dishes,
  isLoading = false,
  isError = false,
  onRetry,
  onOpenDish,
  onChefMismatch,
}: ChefDishesProps) {
  const sortedTags = [...tags].sort((a, b) => a.priorityIndex - b.priorityIndex);
  const activeDishes = dishes.filter((d) => !d.status || d.status === "ACTIVE");
  const untagged = activeDishes.filter((d) => !tags.some((t) => t.dishTagDto.id === d.dishTagDto?.id));

  if (isLoading) {
    return (
      <div className="grid gap-3 md:grid-cols-2" aria-label="Loading menu" aria-live="polite">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="flex min-h-36 items-stretch justify-between gap-4 rounded-xl border border-zinc-100 p-4"
          >
            <div className="flex-1 space-y-3 py-1">
              <div className="h-4 w-2/3 rounded skeleton-shimmer" />
              <div className="h-4 w-1/3 rounded skeleton-shimmer" />
              <div className="h-3 w-full rounded skeleton-shimmer" />
            </div>
            <div className="h-28 w-32 shrink-0 rounded-lg skeleton-shimmer" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-red-100 bg-red-50 px-5 py-6" role="alert">
        <p className="font-bold text-zinc-900">The menu could not be loaded</p>
        <p className="mt-1 text-sm text-zinc-600">Try again without leaving this chef’s page.</p>
        {onRetry && (
          <Button className="mt-4" size="sm" onClick={onRetry}>
            Try again
          </Button>
        )}
      </div>
    );
  }

  if (activeDishes.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 px-5 py-10 text-center">
        <p className="font-bold text-zinc-900">No dishes available right now</p>
        <p className="mt-1 text-sm text-zinc-500">This chef is preparing their next menu.</p>
      </div>
    );
  }

  return (
    <div className="cds_wrap space-y-10">
      {sortedTags.map(({ dishTagDto }, sectionIndex) => {
        const groupDishes = activeDishes.filter((d) => d.dishTagDto?.id === dishTagDto.id);
        if (groupDishes.length === 0) return null;
        return (
          <section
            key={dishTagDto.id}
            className="animate-fade-up"
            style={{ animationDelay: `${sectionIndex * 60}ms` }}
          >
            <div className="mb-4">
              <h2 className="text-xl font-extrabold tracking-tight text-zinc-900">
                {dishTagDto.nameEn}
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {groupDishes.map((dish) => (
                <DishCard
                  key={dish.id}
                  dish={dish}
                  onOpen={onOpenDish}
                  onChefMismatch={onChefMismatch}
                />
              ))}
            </div>
          </section>
        );
      })}
      {untagged.length > 0 && (
        <section className="animate-fade-up">
          <div className="mb-4">
            <h2 className="text-xl font-extrabold tracking-tight text-zinc-900">Other</h2>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {untagged.map((dish) => (
              <DishCard
                key={dish.id}
                dish={dish}
                onOpen={onOpenDish}
                onChefMismatch={onChefMismatch}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { foodmeApi } from "@/api/foodme";
import { ChefDetails } from "@/components/sections/chef-details";
import { ChefDishes } from "@/components/sections/chef-dishes";
import { DishModal } from "@/components/sections/dish-modal";
import { UserCart } from "@/components/sections/user-cart";
import { clearCart, getCartChefId } from "@/hooks/useCart";
import type { DishDto } from "@/types";

export default function Chef() {
  const { id } = useParams<{ id: string }>();
  const chefId = Number(id);
  const [activeDish, setActiveDish] = useState<DishDto | null>(null);
  const [cartReady, setCartReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const existingChefId = await getCartChefId();
      if (!cancelled) {
        if (existingChefId !== undefined && existingChefId !== chefId) {
          const confirmed = window.confirm(
            "Your cart has items from another chef. Starting an order here will clear it. Continue?",
          );
          if (confirmed) {
            await clearCart();
          }
        }
        setCartReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [chefId]);

  const chefQuery = useQuery({
    queryKey: ["chef", chefId],
    queryFn: () => foodmeApi.getChefById(chefId),
    enabled: !Number.isNaN(chefId),
  });

  const dishesQuery = useQuery({
    queryKey: ["dishes", chefId],
    queryFn: () => foodmeApi.getActiveDishes(chefId),
    enabled: !Number.isNaN(chefId),
  });

  const tagsQuery = useQuery({
    queryKey: ["dish-tags", chefId],
    queryFn: () => foodmeApi.getDishTags(chefId),
    enabled: !Number.isNaN(chefId),
  });

  if (chefQuery.isLoading || !cartReady) {
    return <p className="px-4 py-10 text-center text-sm text-zinc-500">Loading chef...</p>;
  }

  if (chefQuery.isError || !chefQuery.data) {
    return <p className="px-4 py-10 text-center text-sm text-red-600">Chef not found.</p>;
  }

  const chef = chefQuery.data;

  return (
    <div className="cp_wrap">
      <ChefDetails chef={chef} />
      <div className="mx-auto mt-8 flex max-w-6xl flex-col gap-8 px-4 pb-16 lg:flex-row">
        <div className="flex-1">
          <ChefDishes
            tags={tagsQuery.data ?? []}
            dishes={dishesQuery.data?.dishDtoList ?? []}
            onOpenDish={setActiveDish}
          />
        </div>
        <UserCart chefId={chefId} />
      </div>
      <DishModal dish={activeDish} onOpenChange={(open) => !open && setActiveDish(null)} />
    </div>
  );
}

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { foodmeApi } from "@/api/foodme";
import { ChefCard } from "@/components/sections/chef-card";

export default function Home() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["chefs", "active", "popular"],
    queryFn: () => foodmeApi.getActiveChefs(0, 6),
  });

  return (
    <div className="hp_hero mx-auto flex max-w-6xl flex-col items-center px-4 py-20">
      <div className="text-center">
        <h1 className="max-w-2xl text-4xl font-extrabold leading-tight text-foreground sm:text-5xl mx-auto">
          Home-cooked meals from local chefs, delivered to your door.
        </h1>
        <p className="mt-4 max-w-xl text-zinc-600 mx-auto">
          FoodMe connects you with independent chefs in your city. Browse menus, pick your favorites,
          and order in a few taps.
        </p>
        <Button asChild size="default" className="mt-8 px-8">
          <Link to="/explore">Explore all chefs</Link>
        </Button>
      </div>

      <div className="mt-24 w-full">
        <h2 className="text-2xl font-bold text-foreground mb-6">Popular Chefs</h2>
        {isLoading && <p className="text-sm text-zinc-500">Loading popular chefs...</p>}
        {isError && <p className="text-sm text-red-600">Could not load popular chefs.</p>}
        
        {data && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data.exploreChefResponseDtoList.map((chef) => (
              <ChefCard key={chef.id} chef={chef} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

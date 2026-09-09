import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { foodmeApi } from "@/api/foodme";
import { ChefCard } from "@/components/sections/chef-card";
import { ChefHat, ShoppingBag, Truck } from "lucide-react";

export default function Home() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["chefs", "active", "popular"],
    queryFn: () => foodmeApi.getActiveChefs(0, 6),
  });

  return (
    <div className="hp_wrapper w-full">
      {/* Hero Section */}
      <section className="hp_hero mx-auto flex max-w-6xl flex-col items-center px-4 py-20 text-center">
        <h1 className="max-w-3xl text-5xl font-extrabold leading-tight text-foreground sm:text-6xl mx-auto tracking-tight">
          Home-cooked meals from local chefs, delivered to your door.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-zinc-600 mx-auto">
          FoodMe connects you with independent chefs in your city. Browse menus, pick your favorites,
          and order in a few taps.
        </p>
        <div className="mt-10 flex gap-4 justify-center">
          <Button asChild size="lg" className="px-8 text-base">
            <Link to="/explore">Explore all chefs</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="px-8 text-base">
            <Link to="/about">How it works</Link>
          </Button>
        </div>
      </section>

      {/* How it works Section */}
      <section className="bg-zinc-50 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground">How FoodMe Works</h2>
            <p className="mt-4 text-zinc-600">Get your favorite meals in three simple steps</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
            <div className="flex flex-col items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-6">
                <ChefHat size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">1. Choose a Chef</h3>
              <p className="text-zinc-600">Browse through our curated list of local independent chefs and their unique menus.</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-6">
                <ShoppingBag size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">2. Place Your Order</h3>
              <p className="text-zinc-600">Add your favorite dishes to the cart and checkout securely with cash on delivery.</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-6">
                <Truck size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">3. Fast Delivery</h3>
              <p className="text-zinc-600">Your meal is prepared fresh and delivered straight to your door.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Chefs Section */}
      <section className="mx-auto max-w-6xl px-4 py-24">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl font-bold text-foreground">Popular Chefs</h2>
          <Button asChild variant="ghost" className="text-primary hover:text-primary/80">
            <Link to="/explore">View all &rarr;</Link>
          </Button>
        </div>
        
        {isLoading && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-[120px] rounded-xl bg-zinc-100 animate-pulse"></div>
            ))}
          </div>
        )}
        
        {isError && <p className="text-sm text-red-600">Could not load popular chefs.</p>}
        
        {data && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data.exploreChefResponseDtoList.map((chef) => (
              <ChefCard key={chef.id} chef={chef} />
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-20">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to taste something amazing?</h2>
          <p className="text-primary-foreground/80 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of food lovers who are discovering the best home-cooked meals in the city.
          </p>
          <Button asChild size="lg" variant="secondary" className="px-8 text-base font-bold">
            <Link to="/explore">Order Now</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

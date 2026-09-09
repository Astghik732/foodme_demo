import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="hp_hero mx-auto flex max-w-6xl flex-col items-center px-4 py-20 text-center">
      <h1 className="max-w-2xl text-4xl font-extrabold leading-tight text-foreground sm:text-5xl">
        Home-cooked meals from local chefs, delivered to your door.
      </h1>
      <p className="mt-4 max-w-xl text-zinc-600">
        FoodMe connects you with independent chefs in your city. Browse menus, pick your favorites,
        and order in a few taps.
      </p>
      <Button asChild size="default" className="mt-8 px-8">
        <Link to="/explore">Explore chefs</Link>
      </Button>
    </div>
  );
}

import { Logo } from "@/components/layout/logo";

export function Footer() {
  return (
    <footer className="ftr_wrap mt-16 border-t border-zinc-100 bg-zinc-50">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-10 text-center">
        <Logo className="h-6 w-auto opacity-80" />
        <p className="text-xs text-zinc-500">
          FoodMe is a demo food-ordering storefront. Chefs, dishes and orders on this site are fictional.
        </p>
        <p className="text-xs text-zinc-400">&copy; {new Date().getFullYear()} FoodMe</p>
      </div>
    </footer>
  );
}

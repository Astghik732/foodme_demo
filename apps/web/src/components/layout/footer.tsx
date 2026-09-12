import { Logo } from "@/components/layout/logo";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="ftr_wrap border-t border-zinc-100 bg-zinc-50">
      <div className="mx-auto max-w-7xl px-4 md:px-8 py-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex flex-col gap-3">
            <Logo className="h-6 w-auto opacity-80" />
            <p className="text-xs text-zinc-400 max-w-[36ch] leading-relaxed">
              A demo food-ordering platform. Chefs, dishes and orders on this site are fictional.
            </p>
          </div>

          <nav className="flex items-center gap-6 text-xs font-medium text-zinc-400">
            <Link to="/explore" className="hover:text-zinc-700 transition-colors duration-200">
              Explore
            </Link>
            <a href="#" className="hover:text-zinc-700 transition-colors duration-200">
              Privacy
            </a>
            <a href="#" className="hover:text-zinc-700 transition-colors duration-200">
              Terms
            </a>
          </nav>
        </div>

        <div className="mt-8 pt-6 border-t border-zinc-100 flex items-center justify-between">
          <p className="text-[11px] text-zinc-300">
            &copy; {new Date().getFullYear()} FoodMe
          </p>
          <p className="text-[11px] text-zinc-300">
            Built with care
          </p>
        </div>
      </div>
    </footer>
  );
}

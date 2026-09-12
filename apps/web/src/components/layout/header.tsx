import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="hdr_wrap fixed top-0 inset-x-0 z-50 flex justify-center pt-4 px-4">
      <div
        className={[
          "flex items-center justify-between gap-8 rounded-full px-4 py-2",
          "transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
          scrolled
            ? "bg-white/80 backdrop-blur-xl border border-zinc-200/60 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.12)] max-w-2xl w-full"
            : "bg-white/60 backdrop-blur-md border border-zinc-100/80 max-w-2xl w-full",
        ].join(" ")}
      >
        <Link to="/" className="flex shrink-0 items-center pl-2">
          <Logo className="h-7 w-auto" />
        </Link>

        <nav className="flex items-center gap-1 text-sm font-medium text-zinc-500">
          <Link
            to="/explore"
            className={[
              "px-3 py-[6px] rounded-full transition-all duration-300",
              location.pathname === "/explore"
                ? "bg-zinc-100 text-zinc-900 font-semibold"
                : "hover:text-zinc-900 hover:bg-zinc-100/70",
            ].join(" ")}
          >
            Explore chefs
          </Link>
        </nav>

        <Button
          asChild
          size="sm"
          className="rounded-full px-4 font-semibold text-xs tracking-wide active:scale-[0.97] transition-transform duration-150"
        >
          <Link to="/explore">Order now</Link>
        </Button>
      </div>
    </header>
  );
}

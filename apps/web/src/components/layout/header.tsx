import { Link } from "react-router-dom";
import { Logo } from "@/components/layout/logo";

export function Header() {
  return (
    <header className="hdr_wrap sticky top-0 z-40 w-full flex-none border-b-2 border-zinc-100 bg-background">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-16">
        <Link to="/" className="flex shrink-0 items-center">
          <Logo className="h-8 w-auto" />
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium text-zinc-600">
          <Link to="/explore" className="hover:text-primary">
            Explore chefs
          </Link>
        </nav>
      </div>
    </header>
  );
}

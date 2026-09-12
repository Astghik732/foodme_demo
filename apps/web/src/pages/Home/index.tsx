import { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { foodmeApi } from "@/api/foodme";
import { ChefCard } from "@/components/sections/chef-card";
import { ArrowRight, ChefHat, ShoppingBag, Truck, Star } from "lucide-react";

/* ─── Scroll-reveal helper ───────────────────────────────────────────────── */
function useReveal(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add("visible"); obs.disconnect(); } },
      { threshold: 0.12 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref]);
}

function RevealSection({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useReveal(ref);
  return (
    <div
      ref={ref}
      className={`reveal ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ─── Home Page ──────────────────────────────────────────────────────────── */
export default function Home() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["chefs", "active", "popular"],
    queryFn: () => foodmeApi.getActiveChefs(0, 6),
  });

  return (
    <div className="hp_wrapper w-full overflow-x-hidden">

      {/* ── HERO: Left-aligned asymmetric split ─────────────────────────── */}
      <section className="relative min-h-[100dvh] flex items-center">
        {/* Subtle mesh gradient orb */}
        <div className="pointer-events-none absolute right-0 top-0 h-[70vh] w-[55vw] rounded-bl-[6rem] bg-gradient-to-br from-amber-50 via-orange-50 to-transparent opacity-70" />
        <div className="pointer-events-none absolute right-[8vw] top-[15vh] h-64 w-64 rounded-full bg-amber-200/30 blur-3xl" />

        <div className="relative mx-auto w-full max-w-7xl px-4 md:px-8 py-24">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-12 items-center">

            {/* Left: content */}
            <div className="max-w-xl">
              {/* Eyebrow tag */}
              <RevealSection delay={0}>
                <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-amber-700">
                  <span className="h-[6px] w-[6px] rounded-full bg-amber-500" />
                  Home-cooked · Local chefs
                </span>
              </RevealSection>

              <RevealSection delay={100}>
                <h1 className="mt-6 font-display text-[clamp(2.6rem,6vw,4.5rem)] font-bold leading-[1.04] tracking-tight text-zinc-900">
                  Real food, made by<br />
                  <span className="text-zinc-400">real people</span><br />
                  near you.
                </h1>
              </RevealSection>

              <RevealSection delay={200}>
                <p className="mt-6 text-base text-zinc-500 leading-relaxed max-w-[52ch]">
                  FoodMe connects you with independent chefs in your city.
                  Browse their menus, pick your favourites, and get a fresh
                  home-cooked meal at your door.
                </p>
              </RevealSection>

              <RevealSection delay={300}>
                <div className="mt-10 flex flex-wrap gap-3">
                  <Button asChild size="lg" className="group rounded-full px-6 font-semibold active:scale-[0.98] transition-transform duration-150">
                    <Link to="/explore" className="flex items-center gap-2">
                      Explore chefs
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15 transition-transform duration-300 group-hover:translate-x-[2px]">
                        <ArrowRight size={14} />
                      </span>
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="rounded-full px-6 font-semibold border-zinc-200 hover:bg-zinc-50 active:scale-[0.98] transition-transform duration-150">
                    <Link to="/explore">How it works</Link>
                  </Button>
                </div>
              </RevealSection>

              {/* Social proof strip */}
              <RevealSection delay={400}>
                <div className="mt-10 flex items-center gap-4 text-sm text-zinc-500">
                  <div className="flex -space-x-2">
                    {["F36B3B", "2D6A4F", "1D3557", "E9C46A"].map((color, i) => (
                      <div
                        key={i}
                        className="h-8 w-8 rounded-full border-2 border-white ring-1 ring-zinc-100"
                        style={{ backgroundColor: `#${color}` }}
                      />
                    ))}
                  </div>
                  <span>
                    <strong className="font-semibold text-zinc-800">2,400+</strong> happy orders this month
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-amber-600">
                    <Star size={13} fill="currentColor" />
                    4.8
                  </span>
                </div>
              </RevealSection>
            </div>

            {/* Right: floating stats card — hidden on mobile */}
            <RevealSection delay={500} className="hidden md:block">
              <div className="bezel-outer shadow-diffuse-lg w-72">
                <div className="bezel-inner p-6">
                  <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-4">This week</p>
                  <div className="space-y-4">
                    {[
                      { label: "Orders delivered", value: "847" },
                      { label: "Active chefs", value: "63" },
                      { label: "Avg. rating", value: "4.83" },
                      { label: "Avg. delivery", value: "38 min" },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-baseline justify-between border-b border-zinc-100 pb-3 last:border-0 last:pb-0">
                        <span className="text-sm text-zinc-500">{label}</span>
                        <span className="font-display text-xl font-bold text-zinc-900">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </RevealSection>

          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS: Zig-zag steps ───────────────────────────────────── */}
      <section className="py-24 bg-zinc-50">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <RevealSection>
            <div className="mb-16">
              <span className="inline-flex rounded-full border border-zinc-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-500">
                How it works
              </span>
              <h2 className="mt-4 font-display text-4xl font-bold tracking-tight text-zinc-900">
                Three steps to<br />your next favourite meal
              </h2>
            </div>
          </RevealSection>

          <div className="space-y-6 md:space-y-0 md:grid md:grid-cols-[2fr_1fr_2fr] md:gap-6 items-stretch">
            {[
              {
                step: "01",
                icon: ChefHat,
                title: "Find your chef",
                body: "Browse independent local chefs, each with their own unique menu and kitchen style.",
              },
              {
                step: "02",
                icon: ShoppingBag,
                title: "Pick your dishes",
                body: "Add your favourites to the cart and check out in seconds — cash on delivery.",
              },
              {
                step: "03",
                icon: Truck,
                title: "Fresh at the door",
                body: "Your meal is cooked to order and handed to you warm, never sitting under a heat lamp.",
              },
            ].map(({ step, icon: Icon, title, body }, i) => (
              <RevealSection key={step} delay={i * 120}>
                <div className="bezel-outer shadow-diffuse h-full">
                  <div className="bezel-inner p-8 h-full flex flex-col gap-6">
                    <div className="flex items-start justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                        <Icon size={22} strokeWidth={1.5} />
                      </div>
                      <span className="font-display text-5xl font-black text-zinc-100">{step}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-zinc-900 text-lg">{title}</h3>
                      <p className="mt-2 text-sm text-zinc-500 leading-relaxed">{body}</p>
                    </div>
                  </div>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── POPULAR CHEFS ─────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 md:px-8 py-24">
        <RevealSection>
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="inline-flex rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-500 mb-3">
                Popular right now
              </span>
              <h2 className="font-display text-4xl font-bold tracking-tight text-zinc-900">
                Chefs worth knowing
              </h2>
            </div>
            <Button asChild variant="ghost" className="hidden sm:flex items-center gap-1 text-sm font-semibold text-zinc-500 hover:text-zinc-900 active:scale-[0.97] transition-transform">
              <Link to="/explore">
                View all
                <ArrowRight size={14} className="ml-1" />
              </Link>
            </Button>
          </div>
        </RevealSection>

        {/* Loading skeleton */}
        {isLoading && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bezel-outer">
                <div className="bezel-inner h-[120px] relative overflow-hidden">
                  <div
                    className="absolute inset-0"
                    style={{
                      background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)",
                      backgroundSize: "200% 100%",
                      animation: "shimmer 1.6s linear infinite",
                    }}
                  />
                  <div className="h-full w-full bg-zinc-100" />
                </div>
              </div>
            ))}
          </div>
        )}

        {isError && (
          <div className="py-10 text-center text-sm text-zinc-400">
            Could not load popular chefs — please try refreshing.
          </div>
        )}

        {data && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data.exploreChefResponseDtoList.map((chef, i) => (
              <RevealSection key={chef.id} delay={i * 80}>
                <ChefCard chef={chef} />
              </RevealSection>
            ))}
          </div>
        )}
      </section>

      {/* ── CTA BAND ──────────────────────────────────────────────────────── */}
      <section className="mx-4 md:mx-8 mb-24 rounded-[2rem] overflow-hidden bg-zinc-900">
        <div className="relative px-8 py-20 text-center overflow-hidden">
          {/* Warm glow orbs */}
          <div className="pointer-events-none absolute left-1/4 top-0 h-48 w-48 -translate-y-1/2 rounded-full bg-amber-500/20 blur-3xl" />
          <div className="pointer-events-none absolute right-1/4 bottom-0 h-64 w-64 translate-y-1/2 rounded-full bg-orange-500/15 blur-3xl" />

          <RevealSection>
            <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-white/60 mb-6">
              Ready to eat
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-white max-w-xl mx-auto leading-tight">
              Your next favourite meal is one tap away.
            </h2>
            <p className="mt-5 text-zinc-400 text-base max-w-md mx-auto leading-relaxed">
              Join thousands of food lovers discovering the best home-cooked meals in the city.
            </p>
            <div className="mt-10 flex flex-wrap gap-3 justify-center">
              <Button
                asChild
                size="lg"
                className="group rounded-full px-8 font-semibold bg-white text-zinc-900 hover:bg-zinc-50 active:scale-[0.98] transition-transform duration-150"
              >
                <Link to="/explore" className="flex items-center gap-2">
                  Browse chefs
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-900/10 transition-transform duration-300 group-hover:translate-x-[2px]">
                    <ArrowRight size={14} />
                  </span>
                </Link>
              </Button>
            </div>
          </RevealSection>
        </div>
      </section>

    </div>
  );
}

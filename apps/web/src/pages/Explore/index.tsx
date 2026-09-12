import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { foodmeApi } from "@/api/foodme";
import { ChefCard } from "@/components/sections/chef-card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 12;

function RevealSection({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add("visible"); obs.disconnect(); } },
      { threshold: 0.08 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

export default function Explore() {
  const [page, setPage] = useState(0);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["chefs", "active", page],
    queryFn: () => foodmeApi.getActiveChefs(page, PAGE_SIZE),
  });

  const totalPages = data ? Math.ceil(data.count / PAGE_SIZE) : 0;

  return (
    <div className="ep_wrap mx-auto max-w-7xl px-4 md:px-8 py-12">
      {/* Page header */}
      <RevealSection>
        <div className="mb-10">
          <span className="inline-flex rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-500">
            All chefs
          </span>
          <div className="mt-4 flex items-end justify-between gap-4">
            <h1 className="font-display text-4xl font-bold tracking-tight text-zinc-900">
              Explore chefs
            </h1>
            {data && (
              <span className="text-sm text-zinc-400 font-medium pb-1">
                {data.count} chefs available
              </span>
            )}
          </div>
          <p className="mt-3 text-zinc-500 max-w-lg leading-relaxed">
            Browse independent local chefs, each with their own kitchen and unique menu.
          </p>
        </div>
      </RevealSection>

      {/* Loading skeletons */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="bezel-outer">
              <div className="bezel-inner relative overflow-hidden" style={{ height: 120 }}>
                <div className="absolute inset-0 bg-zinc-100" />
                <div
                  className="absolute inset-0"
                  style={{
                    background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)",
                    backgroundSize: "200% 100%",
                    animation: "shimmer 1.6s linear infinite",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-700 max-w-md">
          Could not load chefs. Please try refreshing the page.
        </div>
      )}

      {/* Empty state */}
      {data && data.exploreChefResponseDtoList.length === 0 && (
        <div className="flex flex-col items-center py-24 text-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-300">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/>
              <line x1="6" y1="17" x2="18" y2="17"/>
              <line x1="6" y1="21" x2="18" y2="21"/>
            </svg>
          </div>
          <div>
            <p className="font-semibold text-zinc-700">No chefs available right now</p>
            <p className="text-sm text-zinc-400 mt-1 max-w-[32ch]">Check back later — chefs come and go throughout the day.</p>
          </div>
        </div>
      )}

      {/* Chef grid */}
      {data && data.exploreChefResponseDtoList.length > 0 && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data.exploreChefResponseDtoList.map((chef, i) => (
            <RevealSection key={chef.id} delay={i * 60}>
              <ChefCard chef={chef} />
            </RevealSection>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="ep_pagination mt-12 flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-full gap-1"
          >
            <ChevronLeft size={14} strokeWidth={1.5} />
            Previous
          </Button>
          <span className="text-sm text-zinc-400 font-medium tabular-nums">
            {page + 1} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page + 1 >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-full gap-1"
          >
            Next
            <ChevronRight size={14} strokeWidth={1.5} />
          </Button>
        </div>
      )}
    </div>
  );
}

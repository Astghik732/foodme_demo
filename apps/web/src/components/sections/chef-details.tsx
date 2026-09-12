import { Star } from "lucide-react";
import { translate } from "@/lib/utils";
import type { ExploreChefResponseDto } from "@/types";

interface ChefDetailsProps {
  chef: ExploreChefResponseDto;
}

export function ChefDetails({ chef }: ChefDetailsProps) {
  return (
    <section className="cd_hero">
      {/* Banner */}
      <div className="relative h-56 w-full overflow-hidden bg-zinc-100 md:h-72">
        <img src={chef.bannerUrl} alt="" className="h-full w-full object-cover" />
        {/* Bottom gradient overlay */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background/60 to-transparent pointer-events-none" />
      </div>

      {/* Chef info overlapping the banner */}
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="flex flex-wrap items-end gap-4 -mt-14">
          {/* Avatar — rounded-2xl, elevated */}
          <div className="shrink-0">
            <img
              src={chef.avatarUrl}
              alt={translate(chef.name)}
              className="h-24 w-24 rounded-2xl border-4 border-white object-cover shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)]"
            />
          </div>

          {/* Name + meta */}
          <div className="pb-1 flex flex-col gap-2">
            <h1 className="font-display text-2xl md:text-3xl font-bold text-zinc-900 leading-tight">
              {translate(chef.name)}
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              {/* Kitchen tag */}
              <span className="inline-flex rounded-full border border-zinc-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
                {translate(chef.kitchen)}
              </span>
              {/* Rating pill */}
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700">
                <Star size={12} fill="currentColor" strokeWidth={0} />
                {chef.rating.toFixed(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        {chef.description && (
          <p className="mt-5 max-w-2xl text-sm text-zinc-500 leading-relaxed">
            {translate(chef.description)}
          </p>
        )}
      </div>
    </section>
  );
}

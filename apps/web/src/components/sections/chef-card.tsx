import { Link } from "react-router-dom";
import { Star, ArrowUpRight } from "lucide-react";
import { translate } from "@/lib/utils";
import type { ExploreChefResponseDto } from "@/types";

interface ChefCardProps {
  chef: ExploreChefResponseDto;
}

export function ChefCard({ chef }: ChefCardProps) {
  return (
    <Link
      to={`/chef/${chef.id}`}
      className={[
        "cc_card group block",
        "bezel-outer shadow-diffuse",
        "transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
        "hover:-translate-y-1 hover:shadow-diffuse-lg",
        "active:scale-[0.99]",
      ].join(" ")}
    >
      <div className="bezel-inner px-5 py-4">
        <div className="flex items-center gap-4">
          {/* Avatar with ring */}
          <div className="relative shrink-0">
            <div className="h-[72px] w-[72px] rounded-2xl overflow-hidden ring-1 ring-zinc-100">
              <img
                src={chef.avatarUrl}
                alt={`${translate(chef.name)} avatar`}
                className="h-full w-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105"
              />
            </div>
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-zinc-900 text-base leading-tight">
              {translate(chef.name)}
            </p>
            <p className="mt-1 text-xs font-medium text-zinc-400 truncate">
              {translate(chef.kitchen)}
            </p>
            <div className="mt-2 flex items-center gap-1">
              <Star size={12} className="text-amber-500 shrink-0" fill="currentColor" />
              <span className="text-xs font-semibold text-zinc-700">
                {chef.rating.toFixed(1)}
              </span>
            </div>
          </div>

          {/* Arrow indicator */}
          <div className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:bg-zinc-900 group-hover:text-white group-hover:rotate-0">
            <ArrowUpRight size={14} />
          </div>
        </div>
      </div>
    </Link>
  );
}

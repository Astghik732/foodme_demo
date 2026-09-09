import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { translate } from "@/lib/utils";
import type { ExploreChefResponseDto } from "@/types";

interface ChefCardProps {
  chef: ExploreChefResponseDto;
}

export function ChefCard({ chef }: ChefCardProps) {
  return (
    <Link
      to={`/chef/${chef.id}`}
      className="cc_card block overflow-hidden rounded-xl border bg-card text-card-foreground shadow px-4 py-3 cursor-pointer transition-shadow hover:shadow-md"
    >
      <div className="flex flex-col flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="min-w-[84px] min-h-[84px] w-[84px] h-[84px]">
            <img
              src={chef.avatarUrl}
              alt="chef avatar or logo"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <div className="min-w-0">
            <p className="text-zinc-900 text-lg font-bold truncate">{translate(chef.name)}</p>
            <p className="mt-1 flex items-center gap-1 text-sm font-medium text-zinc-400">
              <Star size={14} className="text-warning" fill="currentColor" />
              {chef.rating.toFixed(1)}
            </p>
          </div>
        </div>
        <p className="text-zinc-400 text-sm font-medium">{translate(chef.kitchen)}</p>
      </div>
    </Link>
  );
}

import { Star } from "lucide-react";
import { translate } from "@/lib/utils";
import type { ExploreChefResponseDto } from "@/types";

interface ChefDetailsProps {
  chef: ExploreChefResponseDto;
}

export function ChefDetails({ chef }: ChefDetailsProps) {
  return (
    <section className="cd_hero">
      <div className="cd_banner h-48 w-full overflow-hidden bg-zinc-100 md:h-64">
        <img src={chef.bannerUrl} alt="" className="h-full w-full object-cover" />
      </div>
      <div className="mx-auto -mt-10 flex max-w-6xl items-end gap-4 px-4">
        <img
          src={chef.avatarUrl}
          alt={translate(chef.name)}
          className="h-24 w-24 rounded-full border-4 border-white object-cover"
        />
        <div className="cd_info pb-2">
          <h1 className="text-2xl font-extrabold text-foreground">{translate(chef.name)}</h1>
          <div className="mt-1 flex items-center gap-3 text-sm text-zinc-500">
            <span className="flex items-center gap-1 font-semibold text-primary">
              <Star size={14} fill="currentColor" />
              {chef.rating.toFixed(1)}
            </span>
            <span>{translate(chef.kitchen)}</span>
          </div>
        </div>
      </div>
      <p className="mx-auto mt-4 max-w-6xl px-4 text-sm text-zinc-600">{translate(chef.description)}</p>
    </section>
  );
}

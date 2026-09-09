import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { foodmeApi } from "@/api/foodme";
import { ChefCard } from "@/components/sections/chef-card";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 12;

export default function Explore() {
  const [page, setPage] = useState(0);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["chefs", "active", page],
    queryFn: () => foodmeApi.getActiveChefs(page, PAGE_SIZE),
  });

  const totalPages = data ? Math.ceil(data.count / PAGE_SIZE) : 0;

  return (
    <div className="ep_wrap mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-extrabold text-foreground">Explore chefs</h1>

      {isLoading && <p className="mt-6 text-sm text-zinc-500">Loading chefs...</p>}
      {isError && <p className="mt-6 text-sm text-red-600">Could not load chefs. Please try again.</p>}

      {data && data.exploreChefResponseDtoList.length === 0 && (
        <p className="mt-6 text-sm text-zinc-500">No chefs available right now.</p>
      )}

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {data?.exploreChefResponseDtoList.map((chef) => <ChefCard key={chef.id} chef={chef} />)}
      </div>

      {totalPages > 1 && (
        <div className="ep_pagination mt-8 flex items-center justify-center gap-3">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <span className="text-sm text-zinc-500">
            Page {page + 1} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page + 1 >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

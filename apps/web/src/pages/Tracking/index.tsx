import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { foodmeApi } from "@/api/foodme";
import { formatAmd } from "@/lib/utils";

const STATUS_LABEL: Record<string, string> = {
  NEW: "Order received",
  ACCEPTED: "Preparing your order",
  DELIVERED: "Delivered",
  REJECTED: "Rejected",
};

export default function Tracking() {
  const { number } = useParams<{ number: string }>();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["order", number],
    queryFn: () => foodmeApi.getOrderByNumber(number as string),
    enabled: !!number,
  });

  if (isLoading) {
    return <p className="px-4 py-16 text-center text-sm text-zinc-500">Loading order...</p>;
  }

  if (isError || !data) {
    return <p className="px-4 py-16 text-center text-sm text-red-600">Order not found.</p>;
  }

  return (
    <div className="tp_wrap mx-auto max-w-xl px-4 py-10">
      <h1 className="text-2xl font-extrabold text-foreground">Order {data.number}</h1>
      <p className="mt-1 text-sm font-semibold text-primary">
        {STATUS_LABEL[data.status] ?? data.status}
      </p>
      <p className="mt-1 text-sm text-zinc-500">Chef: {data.chefName}</p>

      <div className="mt-6 divide-y divide-zinc-100 rounded-xl border border-zinc-100">
        {data.orderDishList.map((dish) => (
          <div key={dish.id} className="flex items-center justify-between px-4 py-3 text-sm">
            <span className="text-foreground">
              {dish.quantity} &times; {dish.nameEn}
            </span>
            <span className="font-semibold text-foreground">{formatAmd(dish.price * dish.quantity)}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-between text-base font-bold text-foreground">
        <span>Total</span>
        <span>{formatAmd(data.totalPrice)}</span>
      </div>
    </div>
  );
}

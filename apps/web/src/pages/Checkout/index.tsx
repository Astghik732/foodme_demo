import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { foodmeApi } from "@/api/foodme";
import { CheckoutSummary } from "@/components/sections/checkout-summary";
import { CheckoutPriceSummary } from "@/components/sections/checkout-price-summary";
import { OrderDeliveryForm } from "@/components/sections/order-delivery-form";
import { useCart, clearCart } from "@/hooks/useCart";
import type { CheckoutFormValues } from "@/schemas/checkout-schema";
import type { OrderDto } from "@/types";

export default function Checkout() {
  const navigate = useNavigate();
  const { items, subtotal } = useCart();
  const chefId = items[0]?.chefId;
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [deliveryMethod, setDeliveryMethod] = useState<"DELIVERY" | "TAKEAWAY">("DELIVERY");

  const deliveryPriceQuery = useQuery({
    queryKey: ["delivery-price", chefId, subtotal, deliveryMethod],
    queryFn: () =>
      foodmeApi.getDeliveryPrice({ chefId: chefId as number, subtotal, deliveryMethod }),
    enabled: chefId !== undefined && subtotal > 0,
  });

  const deliveryPrice = deliveryPriceQuery.data?.deliveryPrice ?? 0;
  const freeDeliveryFrom = deliveryPriceQuery.data?.freeDeliveryFrom ?? 0;

  const handleSubmit = async (values: CheckoutFormValues) => {
    if (chefId === undefined) return;
    setDeliveryMethod(values.deliveryMethod);
    setSubmitting(true);
    setSubmitError(null);

    const payload: OrderDto = {
      chefId,
      receiverName: values.receiverName,
      receiverPhoneNumber: values.receiverPhoneNumber,
      receiverEmail: values.receiverEmail,
      paymentType: "CASH",
      deliveryMethod: values.deliveryMethod,
      note: values.note,
      addressDto:
        values.deliveryMethod === "DELIVERY"
          ? {
              city: values.city,
              street: values.street,
              building: values.building,
              apartment: values.apartment,
              note: "",
            }
          : null,
      createOrderDishes: items.map((item) => ({ dishId: item.id, quantity: item.quantity })),
    };

    try {
      const order = await foodmeApi.createOrder(payload);
      await clearCart();
      navigate(`/orders/success?number=${order.number}`);
    } catch {
      setSubmitError("We could not place your order. Please try again.");
      navigate("/orders/failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-sm text-zinc-500">Your cart is empty. Browse chefs to start an order.</p>
      </div>
    );
  }

  return (
    <div className="chk_wrap mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-extrabold text-foreground">Checkout</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        <OrderDeliveryForm submitting={submitting} onSubmit={handleSubmit} />
        <div className="space-y-4">
          <CheckoutSummary items={items} />
          <CheckoutPriceSummary
            subtotal={subtotal}
            deliveryPrice={deliveryMethod === "TAKEAWAY" ? 0 : deliveryPrice}
            freeDeliveryFrom={freeDeliveryFrom}
          />
          {submitError && <p className="text-sm text-red-600">{submitError}</p>}
        </div>
      </div>
    </div>
  );
}

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DeliveryTypeInput } from "@/components/sections/delivery-type-input";
import { PhoneInput } from "@/components/sections/phone-input";
import { checkoutSchema, type CheckoutFormValues } from "@/schemas/checkout-schema";
import type { DeliveryMethod } from "@/types";

interface OrderDeliveryFormProps {
  submitting: boolean;
  onSubmit: (values: CheckoutFormValues) => void;
}

export function OrderDeliveryForm({ submitting, onSubmit }: OrderDeliveryFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      deliveryMethod: "DELIVERY",
      paymentType: "CASH",
      note: "",
      city: "",
      street: "",
      building: "",
      apartment: "",
    },
  });

  const deliveryMethod = watch("deliveryMethod");

  return (
    <form className="odf_form space-y-5" onSubmit={handleSubmit(onSubmit)}>
      <DeliveryTypeInput
        value={deliveryMethod}
        onChange={(v: DeliveryMethod) => setValue("deliveryMethod", v)}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="receiverName">Full name</Label>
          <Input id="receiverName" className="mt-1" {...register("receiverName")} />
          {errors.receiverName && <p className="mt-1 text-xs text-red-600">{errors.receiverName.message}</p>}
        </div>
        <div>
          <Label htmlFor="receiverPhoneNumber">Phone</Label>
          <PhoneInput id="receiverPhoneNumber" className="mt-1" {...register("receiverPhoneNumber")} />
          {errors.receiverPhoneNumber && (
            <p className="mt-1 text-xs text-red-600">{errors.receiverPhoneNumber.message}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="receiverEmail">Email</Label>
        <Input id="receiverEmail" type="email" className="mt-1" {...register("receiverEmail")} />
        {errors.receiverEmail && <p className="mt-1 text-xs text-red-600">{errors.receiverEmail.message}</p>}
      </div>

      {deliveryMethod === "DELIVERY" && (
        <div className="odf_address grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="city">City</Label>
            <Input id="city" className="mt-1" {...register("city")} />
            {errors.city && <p className="mt-1 text-xs text-red-600">{errors.city.message}</p>}
          </div>
          <div>
            <Label htmlFor="street">Street</Label>
            <Input id="street" className="mt-1" {...register("street")} />
            {errors.street && <p className="mt-1 text-xs text-red-600">{errors.street.message}</p>}
          </div>
          <div>
            <Label htmlFor="building">Building</Label>
            <Input id="building" className="mt-1" {...register("building")} />
          </div>
          <div>
            <Label htmlFor="apartment">Apartment</Label>
            <Input id="apartment" className="mt-1" {...register("apartment")} />
          </div>
        </div>
      )}

      <div>
        <Label htmlFor="note">Note</Label>
        <textarea
          id="note"
          className="mt-1 w-full rounded-xl border border-zinc-200 p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          rows={3}
          {...register("note")}
        />
      </div>

      <div>
        <Label>Payment</Label>
        <RadioGroup defaultValue="CASH" className="mt-2">
          <div className="flex items-center gap-2">
            <RadioGroupItem value="CASH" id="payment-cash" />
            <Label htmlFor="payment-cash" className="font-normal">
              Cash on delivery
            </Label>
          </div>
        </RadioGroup>
      </div>

      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? "Placing order..." : "Place order"}
      </Button>
    </form>
  );
}

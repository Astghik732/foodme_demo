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

function FieldGroup({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-2">{children}</div>;
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
    <form className="odf_form space-y-6" onSubmit={handleSubmit(onSubmit)}>
      {/* Delivery type */}
      <div className="bezel-outer">
        <div className="bezel-inner p-4">
          <DeliveryTypeInput
            value={deliveryMethod}
            onChange={(v: DeliveryMethod) => setValue("deliveryMethod", v)}
          />
        </div>
      </div>

      {/* Contact info */}
      <div className="bezel-outer">
        <div className="bezel-inner p-5 space-y-4">
          <p className="text-[11px] uppercase tracking-widest text-zinc-400 font-semibold">Contact</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <FieldGroup>
              <Label htmlFor="receiverName" className="text-sm font-medium text-zinc-700">Full name</Label>
              <Input id="receiverName" placeholder="Ara Petrosyan" {...register("receiverName")} />
              {errors.receiverName && (
                <p className="text-xs text-red-600">{errors.receiverName.message}</p>
              )}
            </FieldGroup>
            <FieldGroup>
              <Label htmlFor="receiverPhoneNumber" className="text-sm font-medium text-zinc-700">Phone</Label>
              <PhoneInput id="receiverPhoneNumber" {...register("receiverPhoneNumber")} />
              {errors.receiverPhoneNumber && (
                <p className="text-xs text-red-600">{errors.receiverPhoneNumber.message}</p>
              )}
            </FieldGroup>
          </div>
          <FieldGroup>
            <Label htmlFor="receiverEmail" className="text-sm font-medium text-zinc-700">Email</Label>
            <Input id="receiverEmail" type="email" placeholder="ara@example.com" {...register("receiverEmail")} />
            {errors.receiverEmail && (
              <p className="text-xs text-red-600">{errors.receiverEmail.message}</p>
            )}
          </FieldGroup>
        </div>
      </div>

      {/* Address — only for DELIVERY */}
      {deliveryMethod === "DELIVERY" && (
        <div className="bezel-outer">
          <div className="bezel-inner p-5 space-y-4">
            <p className="text-[11px] uppercase tracking-widest text-zinc-400 font-semibold">Delivery address</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <FieldGroup>
                <Label htmlFor="city" className="text-sm font-medium text-zinc-700">City</Label>
                <Input id="city" placeholder="Yerevan" {...register("city")} />
                {errors.city && <p className="text-xs text-red-600">{errors.city.message}</p>}
              </FieldGroup>
              <FieldGroup>
                <Label htmlFor="street" className="text-sm font-medium text-zinc-700">Street</Label>
                <Input id="street" placeholder="Barekamutyan" {...register("street")} />
                {errors.street && <p className="text-xs text-red-600">{errors.street.message}</p>}
              </FieldGroup>
              <FieldGroup>
                <Label htmlFor="building" className="text-sm font-medium text-zinc-700">Building</Label>
                <Input id="building" placeholder="14" {...register("building")} />
              </FieldGroup>
              <FieldGroup>
                <Label htmlFor="apartment" className="text-sm font-medium text-zinc-700">Apartment</Label>
                <Input id="apartment" placeholder="37" {...register("apartment")} />
              </FieldGroup>
            </div>
          </div>
        </div>
      )}

      {/* Note */}
      <div className="bezel-outer">
        <div className="bezel-inner p-5 space-y-2">
          <p className="text-[11px] uppercase tracking-widest text-zinc-400 font-semibold">Note (optional)</p>
          <textarea
            id="note"
            className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm text-zinc-900 placeholder:text-zinc-400 resize-none focus-visible:outline-none focus-visible:border-zinc-400 focus-visible:ring-4 focus-visible:ring-zinc-100 transition-all duration-200"
            rows={3}
            placeholder="Allergies, instructions, gate code..."
            {...register("note")}
          />
        </div>
      </div>

      {/* Payment */}
      <div className="bezel-outer">
        <div className="bezel-inner px-5 py-4">
          <p className="text-[11px] uppercase tracking-widest text-zinc-400 font-semibold mb-3">Payment</p>
          <RadioGroup defaultValue="CASH" className="mt-2">
            <div className="flex items-center gap-3">
              <RadioGroupItem value="CASH" id="payment-cash" />
              <Label htmlFor="payment-cash" className="font-normal text-zinc-700 cursor-pointer">
                Cash on delivery
              </Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full rounded-full font-semibold"
        disabled={submitting}
      >
        {submitting ? (
          <span className="opacity-70">Placing order...</span>
        ) : (
          "Place order"
        )}
      </Button>
    </form>
  );
}

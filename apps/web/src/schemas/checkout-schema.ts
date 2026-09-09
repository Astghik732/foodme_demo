import { z } from "zod";

export const checkoutSchema = z
  .object({
    receiverName: z.string().min(2, "Enter your name"),
    receiverPhoneNumber: z.string().min(8, "Enter a valid phone number"),
    receiverEmail: z.string().email("Enter a valid email"),
    deliveryMethod: z.enum(["DELIVERY", "TAKEAWAY"]),
    paymentType: z.literal("CASH"),
    note: z.string().max(300),
    city: z.string(),
    street: z.string(),
    building: z.string(),
    apartment: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.deliveryMethod === "DELIVERY") {
      if (!data.street.trim()) {
        ctx.addIssue({ code: "custom", path: ["street"], message: "Street is required" });
      }
      if (!data.city.trim()) {
        ctx.addIssue({ code: "custom", path: ["city"], message: "City is required" });
      }
    }
  });

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;

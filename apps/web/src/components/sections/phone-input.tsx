import { forwardRef } from "react";
import { Input, type InputProps } from "@/components/ui/input";

export const PhoneInput = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  return <Input type="tel" placeholder="+374 XX XXX XXX" ref={ref} {...props} />;
});
PhoneInput.displayName = "PhoneInput";

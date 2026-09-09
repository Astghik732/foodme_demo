import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OrderStatusProps {
  type: "success" | "failure";
}

export default function OrderStatus({ type }: OrderStatusProps) {
  const [searchParams] = useSearchParams();
  const number = searchParams.get("number");
  const isSuccess = type === "success";

  return (
    <div className="os_wrap mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center">
      {isSuccess ? (
        <CheckCircle2 size={56} className="text-primary" />
      ) : (
        <XCircle size={56} className="text-red-500" />
      )}
      <h1 className="mt-4 text-2xl font-extrabold text-foreground">
        {isSuccess ? "Order placed!" : "Order failed"}
      </h1>
      {isSuccess && number && (
        <p className="mt-2 text-sm text-zinc-600">
          Your order number is <span className="font-semibold text-foreground">{number}</span>
        </p>
      )}
      {!isSuccess && (
        <p className="mt-2 text-sm text-zinc-600">Something went wrong while placing your order.</p>
      )}
      <div className="mt-6 flex gap-3">
        {isSuccess && number && (
          <Button asChild variant="outline">
            <Link to={`/tracking/${number}`}>Track order</Link>
          </Button>
        )}
        <Button asChild>
          <Link to="/explore">Back to explore</Link>
        </Button>
      </div>
    </div>
  );
}

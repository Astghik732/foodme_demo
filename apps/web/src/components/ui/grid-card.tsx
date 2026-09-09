import { type PropsWithChildren, type ReactElement } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

interface IGridCard extends PropsWithChildren {
  footer?: ReactElement;
  className?: string;
  onClick?: () => void;
}

const GridCard = ({ children, footer, className, onClick }: IGridCard) => {
  return (
    <Card onClick={onClick} className={cn(className, "overflow-hidden flex flex-col justify-between gap-4")}>
      <CardContent className="p-0">{children}</CardContent>
      {footer && <CardFooter className="flex flex-col items-start gap-4 p-0 flex-1">{footer}</CardFooter>}
    </Card>
  );
};

export default GridCard;

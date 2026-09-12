import type { PropsWithChildren } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export function AppLayout({ children }: PropsWithChildren) {
  return (
    <div className="al_shell flex min-h-[100dvh] flex-col">
      <Header />
      {/* pt-20 to offset the fixed floating header */}
      <main className="flex-1 pt-20">{children}</main>
      <Footer />
    </div>
  );
}

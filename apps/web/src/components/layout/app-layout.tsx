import type { PropsWithChildren } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export function AppLayout({ children }: PropsWithChildren) {
  return (
    <div className="al_shell relative flex min-h-[100dvh] flex-col bg-white">
      <Header />
      <main className="relative z-0 flex-1">{children}</main>
      <Footer />
    </div>
  );
}

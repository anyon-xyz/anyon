import { Banner } from "./Banner";
import { Header } from "./Header";

export const Container = ({ children }: { children: React.ReactNode }) => (
  <main className="flex min-h-screen flex-col items-center bg-gradient-to-b from-[#000] to-[#0b0c1d] text-white">
    <Banner message="is currently in beta and the code is not audited, use at your own risk" />

    <Header />

    <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
      {children}
    </div>
  </main>
);

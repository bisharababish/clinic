// components/layout/MainLayout.tsx
import { Header } from "./Header";
import  Footer  from "./Footer";

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 p-4 bg-gray-50">{children}</main>
      <Footer />
    </div>
  );
}
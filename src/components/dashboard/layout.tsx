import { Sidebar } from "./sidebar";
import { Header } from "./header";

export const Layout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar className="hidden md:flex w-64 border-r bg-muted/40" />
      <main className="flex-1 overflow-y-auto">
        <Header />
        <div className="p-6 flex justify-center">{children}</div>
      </main>
    </div>
  );
};

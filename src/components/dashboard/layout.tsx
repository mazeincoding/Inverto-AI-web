import { Sidebar } from "./sidebar";
import { Header } from "./header";

export const Layout: React.FC<{
  children: React.ReactNode;
  page_title: string;
}> = ({ children, page_title }) => {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar className="hidden md:flex w-64 border-r bg-muted/40" />
      <main className="flex-1 overflow-y-auto">
        <Header page_title={page_title} />
        <div className="p-6 flex justify-center">
          <div className="w-full max-w-4xl">{children}</div>
        </div>
      </main>
    </div>
  );
};

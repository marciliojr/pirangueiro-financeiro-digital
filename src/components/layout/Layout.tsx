import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { MensagemDoDia } from "../ui/MensagemDoDia";

type LayoutProps = {
  children: ReactNode;
};

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-auto">
        <Header />
        <div className="container mx-auto px-2 py-2 sm:px-4 md:px-6 max-w-[1600px]">
          <div className="mb-4">
            <MensagemDoDia />
          </div>
        </div>
        <div className="container mx-auto h-full px-2 py-2 sm:px-4 md:p-6 max-w-[1600px]">
          {children}
        </div>
      </main>
    </div>
  );
};

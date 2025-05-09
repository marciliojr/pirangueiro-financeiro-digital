import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";

import { Layout } from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Contas from "./pages/Contas";
import Categorias from "./pages/Categorias";
import Cartoes from "./pages/Cartoes";
import Receitas from "./pages/Receitas";
import Despesas from "./pages/Despesas";
import Limites from "./pages/Limites";
import Relatorios from "./pages/Relatorios";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/contas" element={<Contas />} />
              <Route path="/categorias" element={<Categorias />} />
              <Route path="/cartoes" element={<Cartoes />} />
              <Route path="/receitas" element={<Receitas />} />
              <Route path="/despesas" element={<Despesas />} />
              <Route path="/limites" element={<Limites />} />
              <Route path="/relatorios" element={<Relatorios />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

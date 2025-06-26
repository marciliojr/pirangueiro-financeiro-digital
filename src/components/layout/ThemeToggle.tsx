import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  isCollapsed?: boolean;
}

export const ThemeToggle = ({ isCollapsed = false }: ThemeToggleProps) => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Retornar null até que o componente seja montado para evitar erros de hydration
  if (!mounted) {
    return null;
  }

  const isLight = theme === "light" || (theme === "system" && resolvedTheme === "light");
  
  const handleToggle = () => {
    setTheme(isLight ? "dark" : "light");
  };

  return (
    <button
      onClick={handleToggle}
      className={cn(
        "flex items-center justify-center rounded-full transition-all duration-300",
        isCollapsed ? "h-8 w-8" : "h-10 w-10",
        isLight 
          ? "bg-primary text-primary-foreground hover:bg-primary/90" 
          : "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
      )}
      aria-label={isLight ? "Ativar modo escuro" : "Ativar modo claro"}
    >
      {isLight ? (
        <Moon className={cn(
          "transition-transform duration-300 ease-in-out",
          isCollapsed ? "h-4 w-4" : "h-5 w-5"
        )} />
      ) : (
        <Sun className={cn(
          "transition-transform duration-300 ease-in-out",
          isCollapsed ? "h-4 w-4" : "h-5 w-5"
        )} />
      )}
    </button>
  );
};

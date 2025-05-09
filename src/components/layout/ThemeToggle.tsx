import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export const ThemeToggle = () => {
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
        "flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300",
        isLight 
          ? "bg-primary text-primary-foreground hover:bg-primary/90" 
          : "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
      )}
      aria-label={isLight ? "Ativar modo escuro" : "Ativar modo claro"}
    >
      {isLight ? (
        <Moon className="h-5 w-5 transition-transform duration-300 ease-in-out" />
      ) : (
        <Sun className="h-5 w-5 transition-transform duration-300 ease-in-out" />
      )}
    </button>
  );
};

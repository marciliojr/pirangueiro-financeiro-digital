import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  BookOpen, 
  FolderOpen, 
  CreditCard, 
  PiggyBank, 
  FileText,
  BarChart3,
  Menu, 
  X,
  Settings
} from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

type NavItemProps = {
  to: string;
  icon: React.ElementType;
  label: string;
  isCollapsed: boolean;
  isActive: boolean;
};

const NavItem = ({ to, icon: Icon, label, isCollapsed, isActive }: NavItemProps) => {
  return (
    <Link 
      to={to}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-base transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        isActive ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground" : "text-sidebar-foreground"
      )}
    >
      <Icon size={20} />
      {!isCollapsed && <span>{label}</span>}
    </Link>
  );
};

export const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { theme } = useTheme();
  
  const navItems = [
    { to: "/", label: "Dashboard", icon: Home },
    { to: "/contas", label: "Contas", icon: BookOpen },
    { to: "/categorias", label: "Categorias", icon: FolderOpen },
    { to: "/cartoes", label: "Cartões", icon: CreditCard },
    { to: "/receitas", label: "Receitas", icon: PiggyBank },
    { to: "/despesas", label: "Despesas", icon: FileText },
    { to: "/relatorios", label: "Relatórios", icon: BarChart3 }
  ];

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };
  
  return (
    <aside 
      className={cn(
        "flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300",
        collapsed ? "w-16" : "w-52 sm:w-64"
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border p-4">
        {!collapsed && (
          <div className="flex items-center gap-2 text-lg font-semibold text-sidebar-primary">
            <PiggyBank className="h-6 w-6" />
            <span>PIRANGUEIRO</span>
          </div>
        )}
        <button 
          onClick={toggleSidebar}
          className={cn(
            "ml-auto flex h-8 w-8 items-center justify-center rounded-full transition-colors",
            "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            "text-sidebar-foreground"
          )}
        >
          {collapsed ? <Menu size={18} /> : <X size={18} />}
        </button>
      </div>
      
      <div className="flex flex-1 flex-col gap-1 overflow-auto p-2">
        {navItems.map((item) => (
          <NavItem
            key={item.to}
            to={item.to}
            icon={item.icon}
            label={item.label}
            isCollapsed={collapsed}
            isActive={location.pathname === item.to}
          />
        ))}
      </div>
      
      <div className={cn(
        "flex items-center border-t border-sidebar-border gap-2",
        collapsed 
          ? "flex-col justify-center p-2" 
          : "flex-col sm:flex-row justify-between p-2 sm:p-4"
      )}>
        <div>
          {!collapsed && (
            <p className="text-xs text-sidebar-foreground font-medium text-center sm:text-left">
              © 2025 Pirangueiro
            </p>
          )}
        </div>
        <div className={cn(
          "flex items-center gap-2",
          collapsed 
            ? "flex-col" 
            : "flex-col sm:flex-row"
        )}>
          <Link
            to="/configuracoes"
            className={cn(
              "flex items-center justify-center rounded-full transition-all duration-300",
              "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700",
              collapsed ? "h-8 w-8" : "h-10 w-10"
            )}
            title="Configurações"
          >
            <Settings className={cn(
              "transition-transform duration-300 ease-in-out",
              collapsed ? "h-4 w-4" : "h-5 w-5"
            )} />
          </Link>
          <ThemeToggle isCollapsed={collapsed} />
        </div>
      </div>
    </aside>
  );
};


import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  BookOpen, 
  FolderOpen, 
  CreditCard, 
  PiggyBank, 
  FileText, 
  FileBarChart, 
  SlidersHorizontal,
  Menu, 
  X 
} from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "@/lib/utils";

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
  
  const navItems = [
    { to: "/", label: "Dashboard", icon: Home },
    { to: "/contas", label: "Contas", icon: BookOpen },
    { to: "/categorias", label: "Categorias", icon: FolderOpen },
    { to: "/cartoes", label: "Cartões", icon: CreditCard },
    { to: "/receitas", label: "Receitas", icon: PiggyBank },
    { to: "/despesas", label: "Despesas", icon: FileText },
    { to: "/limites", label: "Limites de Gastos", icon: SlidersHorizontal },
    { to: "/relatorios", label: "Relatórios", icon: FileBarChart },
  ];

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };
  
  return (
    <aside 
      className={cn(
        "flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border p-4">
        {!collapsed && (
          <div className="flex items-center gap-2 text-lg font-semibold text-primary">
            <PiggyBank className="h-6 w-6" />
            <span>PIRANGUEIRO</span>
          </div>
        )}
        <button 
          onClick={toggleSidebar}
          className="ml-auto flex h-8 w-8 items-center justify-center rounded-full hover:bg-sidebar-accent"
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
      
      <div className="flex items-center justify-between border-t border-sidebar-border p-4">
        <div>
          {!collapsed && <p className="text-xs text-sidebar-foreground">© 2025 Pirangueiro</p>}
        </div>
        <ThemeToggle />
      </div>
    </aside>
  );
};

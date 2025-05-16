import { NotificationBell } from '../ui/NotificationBell';

export const Header = () => {
  return (
    <header className="border-b bg-card">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold">Pirangueiro Financeiro</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <NotificationBell />
        </div>
      </div>
    </header>
  );
}; 
import { useState } from 'react';
import { NotificationBell } from '../ui/NotificationBell';
import { SessionStatus } from '../ui/SessionStatus';
import { InstallPWA } from '@/components/pwa/InstallPWA';
import { Button } from '@/components/ui/button';
import { User, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { LoginModal } from '@/components/auth/LoginModal';
import { toast } from 'sonner';

export const Header = () => {
  const { isAuthenticated, currentUser, logout } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleUserButtonClick = () => {
    if (isAuthenticated) {
      // Se está autenticado, pode abrir modal para gerenciar conta ou fazer logout direto
      setIsModalOpen(true);
    } else {
      // Se não está autenticado, abre modal de login
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <header className="border-b bg-card">
        <div className="container mx-auto flex h-14 sm:h-16 items-center justify-between px-2 sm:px-4">
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-semibold truncate">Pirangueiro Financeiro</h1>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <NotificationBell />
            <SessionStatus />
            <InstallPWA />
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleUserButtonClick}
              className="relative"
              title={isAuthenticated ? `Usuário: ${currentUser?.username}` : 'Fazer login'}
            >
              <User className="h-5 w-5" />
              {isAuthenticated && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
              )}
            </Button>
          </div>
        </div>
      </header>

      <LoginModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
      />
    </>
  );
}; 
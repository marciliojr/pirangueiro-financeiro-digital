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
      setIsModalOpen(true);
    } else {
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <header className="border-b bg-card sticky top-0 z-50 backdrop-blur-sm bg-card/95">
        <div className="container mx-auto flex h-12 sm:h-14 md:h-16 items-center justify-between px-2 sm:px-4">
          <div className="flex items-center gap-2 flex-shrink-0 min-w-0">
            <h1 className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold truncate">
              <span className="hidden sm:inline">Pirangueiro Financeiro</span>
              <span className="sm:hidden">Pirangueiro</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2 md:gap-3 flex-shrink-0">
            <div className="hidden sm:block">
              <NotificationBell />
            </div>
            
            <div className="hidden md:block">
              <SessionStatus />
            </div>
            
            <InstallPWA />
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleUserButtonClick}
              className="relative h-8 w-8 sm:h-9 sm:w-9 p-0 flex-shrink-0"
              title={isAuthenticated ? `Usuário: ${currentUser?.username}` : 'Fazer login'}
            >
              <User className="h-4 w-4 sm:h-5 sm:w-5" />
              {isAuthenticated && (
                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-background" />
              )}
            </Button>
            
            <div className="sm:hidden">
              <NotificationBell />
            </div>
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
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, User, Calendar, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface SessionInfo {
  loginTime: Date;
  expiresAt: Date;
  daysRemaining: number;
  hoursRemaining: number;
  minutesRemaining: number;
  isValid: boolean;
}

export const SessionStatus = () => {
  const { isAuthenticated, currentUser } = useAuth();
  const [showDetails, setShowDetails] = useState(false);
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);

  const updateSessionInfo = () => {
    if (!isAuthenticated) {
      setSessionInfo(null);
      return;
    }

    const sessionData = localStorage.getItem('pirangueiro_session');
    if (!sessionData) {
      setSessionInfo(null);
      return;
    }

    try {
      const session = JSON.parse(sessionData);
      const now = Date.now();
      const timeRemaining = session.expiresAt - now;
      const daysRemaining = Math.floor(timeRemaining / (24 * 60 * 60 * 1000));
      const hoursRemaining = Math.floor((timeRemaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
      const minutesRemaining = Math.floor((timeRemaining % (60 * 60 * 1000)) / (60 * 1000));

      setSessionInfo({
        loginTime: new Date(session.loginTime),
        expiresAt: new Date(session.expiresAt),
        daysRemaining,
        hoursRemaining,
        minutesRemaining,
        isValid: timeRemaining > 0
      });
    } catch (error) {
      console.error('Erro ao carregar informações da sessão:', error);
      setSessionInfo(null);
    }
  };

  useEffect(() => {
    updateSessionInfo();
    
    // Atualiza as informações a cada minuto
    const interval = setInterval(updateSessionInfo, 60 * 1000);
    
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  if (!isAuthenticated || !sessionInfo) return null;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowDetails(!showDetails)}
        className="text-xs h-8 px-2 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
      >
        <Shield className="h-3 w-3 mr-1" />
        <span className="hidden sm:inline">Sessão ativa</span>
        <span className="sm:hidden">🔒</span>
      </Button>

      {showDetails && (
        <Card className="absolute top-10 right-0 w-80 z-50 shadow-lg border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold flex items-center gap-1 text-green-700 dark:text-green-300">
                <Shield className="h-4 w-4" />
                Status da Sessão
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetails(false)}
                className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700"
              >
                ×
              </Button>
            </div>
            
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-1">
                  <User className="h-3 w-3" />
                  Usuário:
                </span>
                <span className="font-medium">{currentUser?.username}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Login:
                </span>
                <span>
                  {sessionInfo.loginTime.toLocaleDateString('pt-BR')} às{' '}
                  {sessionInfo.loginTime.toLocaleTimeString('pt-BR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Expira:
                </span>
                <span>
                  {sessionInfo.expiresAt.toLocaleDateString('pt-BR')} às{' '}
                  {sessionInfo.expiresAt.toLocaleTimeString('pt-BR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
              
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-muted-foreground font-medium">Tempo restante:</span>
                <span className={`font-bold ${sessionInfo.isValid ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {sessionInfo.isValid ? (
                    sessionInfo.daysRemaining > 0 
                      ? `${sessionInfo.daysRemaining}d ${sessionInfo.hoursRemaining}h ${sessionInfo.minutesRemaining}m`
                      : sessionInfo.hoursRemaining > 0
                      ? `${sessionInfo.hoursRemaining}h ${sessionInfo.minutesRemaining}m`
                      : `${sessionInfo.minutesRemaining}m`
                  ) : 'Expirada'}
                </span>
              </div>
            </div>
            
            <div className="mt-3 pt-3 border-t">
              <p className="text-xs text-muted-foreground flex items-start gap-1">
                <Calendar className="h-3 w-3 mt-0.5 flex-shrink-0" />
                <span>
                  Sua sessão é renovada automaticamente a cada acesso e tem duração de 2 dias.
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}; 
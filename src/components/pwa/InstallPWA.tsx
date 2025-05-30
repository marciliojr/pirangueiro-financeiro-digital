import { Button } from '@/components/ui/button';
import { Download, Smartphone, Wifi, WifiOff } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

export const InstallPWA = () => {
  const { isInstallable, isInstalled, isOnline, installApp } = usePWA();

  const handleInstall = async () => {
    const success = await installApp();
    if (success) {
      toast.success('🎉 App instalado com sucesso! Verifique sua tela inicial.');
    } else {
      toast.error('❌ Não foi possível instalar o app. Tente novamente.');
    }
  };

  // Se está instalado, mostra o status
  if (isInstalled) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="flex items-center gap-1 text-green-600 border-green-200">
          <Smartphone className="h-3 w-3" />
          <span className="text-xs">App Instalado</span>
        </Badge>
        {!isOnline && (
          <Badge variant="outline" className="flex items-center gap-1 text-orange-600 border-orange-200">
            <WifiOff className="h-3 w-3" />
            <span className="text-xs">Offline</span>
          </Badge>
        )}
      </div>
    );
  }

  // Se não é instalável, apenas mostra status de conexão se offline
  if (!isInstallable) {
    return !isOnline ? (
      <Badge variant="outline" className="flex items-center gap-1 text-orange-600 border-orange-200">
        <WifiOff className="h-3 w-3" />
        <span className="text-xs">Modo Offline</span>
      </Badge>
    ) : null;
  }

  // Mostra o botão de instalação
  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={handleInstall}
        variant="outline"
        size="sm"
        className="flex items-center gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
      >
        <Download className="h-4 w-4" />
        <span className="hidden sm:inline">Instalar App</span>
        <span className="sm:hidden">Instalar</span>
      </Button>
      
      {/* Indicador de status de conexão */}
      <div className="flex items-center">
        {isOnline ? (
          <div className="text-green-500" title="Online">
            <Wifi className="h-4 w-4" />
          </div>
        ) : (
          <div className="text-orange-500" title="Offline">
            <WifiOff className="h-4 w-4" />
          </div>
        )}
      </div>
    </div>
  );
}; 
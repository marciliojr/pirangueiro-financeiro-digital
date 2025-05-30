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

  // Se está instalado, mostra status compacto
  if (isInstalled) {
    return (
      <div className="flex items-center gap-1 sm:gap-2">
        <Badge 
          variant="outline" 
          className="flex items-center gap-1 text-green-600 border-green-200 text-xs px-2 py-1"
        >
          <Smartphone className="h-3 w-3" />
          <span className="hidden xs:inline">Instalado</span>
          <span className="xs:hidden">📱</span>
        </Badge>
        
        {/* Status de conexão só aparece se offline */}
        {!isOnline && (
          <div className="text-orange-500" title="Offline">
            <WifiOff className="h-4 w-4" />
          </div>
        )}
      </div>
    );
  }

  // Se não é instalável, só mostra status offline se necessário
  if (!isInstallable) {
    return !isOnline ? (
      <div className="flex items-center gap-1">
        <Badge variant="outline" className="flex items-center gap-1 text-orange-600 border-orange-200 text-xs px-2 py-1">
          <WifiOff className="h-3 w-3" />
          <span className="hidden xs:inline">Offline</span>
          <span className="xs:hidden">📶</span>
        </Badge>
      </div>
    ) : (
      /* Indicador discreto de status online em telas pequenas */
      <div className="sm:hidden" title="Online">
        <Wifi className="h-4 w-4 text-green-500 opacity-60" />
      </div>
    );
  }

  // Botão de instalação - super responsivo
  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <Button
        onClick={handleInstall}
        variant="outline"
        size="sm"
        className="flex items-center gap-1 sm:gap-2 text-blue-600 border-blue-200 hover:bg-blue-50 
                   text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 h-7 sm:h-8 md:h-9"
      >
        <Download className="h-3 w-3 sm:h-4 sm:w-4" />
        
        {/* Texto adaptativo por tamanho de tela */}
        <span className="hidden lg:inline">Instalar App</span>
        <span className="hidden sm:inline lg:hidden">Instalar</span>
        <span className="sm:hidden">📥</span>
      </Button>
      
      {/* Indicador de conexão só em telas maiores */}
      <div className="hidden sm:flex items-center">
        {isOnline ? (
          <div className="text-green-500" title="Online">
            <Wifi className="h-4 w-4 opacity-60" />
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
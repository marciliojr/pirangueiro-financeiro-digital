import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Lightbulb, RefreshCw } from 'lucide-react';
import { obterMensagemDia } from '@/services/mensagemDia';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export const MensagemDoDia = () => {
  const [mensagem, setMensagem] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const buscarMensagem = async () => {
    try {
      setLoading(true);
      const mensagemDia = await obterMensagemDia();
      setMensagem(mensagemDia);
    } catch (error) {
      console.error('Erro ao buscar mensagem do dia:', error);
      setMensagem('Não foi possível carregar a mensagem do dia.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await buscarMensagem();
    toast.success('Mensagem do dia atualizada!');
  };

  useEffect(() => {
    buscarMensagem();
  }, []);

  // Escuta mudanças de visibilidade da página para recarregar quando voltar ao foco
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        buscarMensagem();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <Card className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                💭 Pensamento do Dia
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={loading}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 h-8 w-8 p-0"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="h-2 bg-blue-200 dark:bg-blue-800 rounded-full animate-pulse w-full"></div>
              </div>
            ) : (
              <p className="text-blue-800 dark:text-blue-200 text-sm leading-relaxed font-medium italic">
                "{mensagem}"
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 
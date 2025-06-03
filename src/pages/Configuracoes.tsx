import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Trash2, AlertTriangle } from "lucide-react";
import { ModalConfirmacaoLimpeza } from "@/components/admin/ModalConfirmacaoLimpeza";
import { SplashScreen } from "@/components/admin/SplashScreen";
import { AdminService } from "@/services/admin";
import { toast } from "sonner";

const Configuracoes = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [splashOpen, setSplashOpen] = useState(false);
  const navigate = useNavigate();

  const handleLimparDados = async () => {
    setModalOpen(false);
    setSplashOpen(true);

    try {
      await AdminService.limparBaseDados();
      
      // Simular um pequeno delay para mostrar a splash screen
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success("✅ Todos os dados foram apagados com sucesso!");
      setSplashOpen(false);
      
      // Redirecionar para o dashboard
      navigate("/");
      
      // Recarregar a página para atualizar todos os dados
      window.location.reload();
    } catch (error) {
      setSplashOpen(false);
      toast.error("❌ Erro ao limpar os dados. Tente novamente.");
      console.error("Erro ao limpar dados:", error);
    }
  };

  return (
    <>
      <div className="container mx-auto py-6">
        <PageHeader 
          title="Configurações" 
          description="Gerencie as configurações do sistema" 
        />

        <div className="grid gap-6 mt-6">
          {/* Seção Administração */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertTriangle className="h-5 w-5" />
                Administração do Sistema
              </CardTitle>
              <CardDescription>
                Ferramentas avançadas de administração. Use com cuidado.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-950/20">
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-red-900 dark:text-red-100">
                      Apagar todos os Registros
                    </h3>
                    <p className="text-xs text-red-700 dark:text-red-300">
                      Remove permanentemente todos os dados do sistema (receitas, despesas, contas, cartões, categorias)
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setModalOpen(true)}
                    className="text-red-600 border-red-300 hover:bg-red-100 hover:border-red-400 dark:text-red-400 dark:border-red-600 dark:hover:bg-red-950/30"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    <span>apagar agora</span>
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="text-xs text-muted-foreground bg-yellow-50 dark:bg-yellow-950/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="flex items-start gap-2">
                  <span className="text-yellow-600 dark:text-yellow-400">⚠️</span>
                  <span>
                    <strong>Atenção:</strong> As operações desta seção são irreversíveis. 
                    Certifique-se de ter backups antes de proceder.
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Seção Sistema */}
          <Card>
            <CardHeader>
              <CardTitle>Informações do Sistema</CardTitle>
              <CardDescription>
                Detalhes sobre a aplicação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Versão:</span>
                  <span className="ml-2 font-medium">1.0.0</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Ambiente:</span>
                  <span className="ml-2 font-medium">Desenvolvimento</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Framework:</span>
                  <span className="ml-2 font-medium">React + TypeScript</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Backend:</span>
                  <span className="ml-2 font-medium">Spring Boot</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ModalConfirmacaoLimpeza 
        open={modalOpen}
        onOpenChange={setModalOpen}
        onConfirm={handleLimparDados}
      />

      <SplashScreen open={splashOpen} />
    </>
  );
};

export default Configuracoes; 
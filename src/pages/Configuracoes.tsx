import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trash2, AlertTriangle, Download, Upload, Database, RefreshCw, FileText, Clock, CheckCircle, XCircle, History } from "lucide-react";
import { ModalConfirmacaoLimpeza } from "@/components/admin/ModalConfirmacaoLimpeza";
import { SplashScreen } from "@/components/admin/SplashScreen";
import { AdminService } from "@/services/admin";
import { BackupService, StatusBackup, StatusImportacao } from "@/services/backup";
import { toast } from "sonner";

const Configuracoes = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [splashOpen, setSplashOpen] = useState(false);
  const [statusBackup, setStatusBackup] = useState<StatusBackup | null>(null);
  const [carregandoStatus, setCarregandoStatus] = useState(true);
  const [operacaoEmAndamento, setOperacaoEmAndamento] = useState(false);
  const [arquivoSelecionado, setArquivoSelecionado] = useState<File | null>(null);
  const [importacaoAtiva, setImportacaoAtiva] = useState<StatusImportacao | null>(null);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Carregar status do backup ao inicializar
  useEffect(() => {
    carregarStatusBackup();
  }, []);

  // Limpar intervalo ao desmontar o componente
  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);

  const carregarStatusBackup = async () => {
    try {
      setCarregandoStatus(true);
      const status = await BackupService.obterStatus();
      setStatusBackup(status);
    } catch (error) {
      console.error('Erro ao carregar status do backup:', error);
      toast.error("❌ Erro ao carregar status do backup");
    } finally {
      setCarregandoStatus(false);
    }
  };

  const handleLimparDados = async (confirmacao: string) => {
    setModalOpen(false);
    setSplashOpen(true);

    try {
      await AdminService.limparBaseDados(confirmacao);
      
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

  const handleBaixarBackup = async () => {
    try {
      setOperacaoEmAndamento(true);
      const blob = await BackupService.exportarBackup();
      
      // Criar link para download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `backup-pirangueiro-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success("✅ Backup baixado com sucesso!");
    } catch (error) {
      console.error('Erro ao baixar backup:', error);
      toast.error("❌ Erro ao baixar backup. Tente novamente.");
    } finally {
      setOperacaoEmAndamento(false);
    }
  };

  const handleSelecionarArquivo = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleArquivoSelecionado = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'application/json' || file.name.endsWith('.json')) {
        setArquivoSelecionado(file);
      } else {
        toast.error("❌ Por favor, selecione apenas arquivos JSON.");
        event.target.value = '';
      }
    }
  };

  const handleRemoverArquivo = () => {
    setArquivoSelecionado(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const iniciarMonitoramentoImportacao = (requestId: string) => {
    const interval = setInterval(async () => {
      try {
        const status = await BackupService.verificarStatusImportacao(requestId);
        setImportacaoAtiva(status);

        if (status.status === 'CONCLUIDO') {
          clearInterval(interval);
          setIntervalId(null);
          toast.success(`✅ Backup importado com sucesso! ${status.totalRegistros} registros processados.`);
          
          // Limpar arquivo selecionado
          setArquivoSelecionado(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          
          // Recarregar status após importação
          await carregarStatusBackup();
          
          // Limpar status de importação após 5 segundos
          setTimeout(() => {
            setImportacaoAtiva(null);
          }, 5000);
        } else if (status.status === 'ERRO') {
          clearInterval(interval);
          setIntervalId(null);
          toast.error(`❌ Erro na importação: ${status.erro || status.mensagem}`);
          setImportacaoAtiva(null);
        }
      } catch (error) {
        console.error('Erro ao verificar status:', error);
        clearInterval(interval);
        setIntervalId(null);
        setImportacaoAtiva(null);
      }
    }, 2000); // Verifica a cada 2 segundos

    setIntervalId(interval);
  };

  const handleImportarBackup = async () => {
    if (!arquivoSelecionado) {
      toast.error("❌ Selecione um arquivo antes de importar.");
      return;
    }

    try {
      setOperacaoEmAndamento(true);
      
      console.log('=== INICIANDO IMPORTAÇÃO ===');
      console.log('Arquivo selecionado:', {
        nome: arquivoSelecionado.name,
        tamanho: arquivoSelecionado.size,
        tipo: arquivoSelecionado.type,
        ultimaModificacao: arquivoSelecionado.lastModified
      });
      
      const resultado = await BackupService.iniciarImportacao(arquivoSelecionado);
      
      console.log('=== RESULTADO DA IMPORTAÇÃO ===');
      console.log('Resultado completo:', resultado);
      
      if (resultado.sucesso) {
        toast.success("✅ Importação iniciada! Acompanhe o progresso abaixo.");
        setImportacaoAtiva({
          encontrado: true,
          requestId: resultado.requestId,
          status: 'INICIADO',
          mensagem: resultado.mensagem,
          dataInicio: resultado.dataInicio,
          nomeArquivo: resultado.nomeArquivo
        });
        
        // Iniciar monitoramento
        iniciarMonitoramentoImportacao(resultado.requestId);
      } else {
        console.error('Importação falhou - sucesso = false');
        toast.error("❌ Erro ao iniciar importação.");
      }
    } catch (error) {
      console.error('=== ERRO NA IMPORTAÇÃO ===');
      console.error('Erro completo:', error);
      console.error('Tipo do erro:', typeof error);
      console.error('Mensagem:', (error as Error).message);
      
      toast.error(`❌ ${(error as Error).message}`);
    } finally {
      setOperacaoEmAndamento(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'INICIADO':
        return 'bg-blue-500';
      case 'PROCESSANDO':
        return 'bg-yellow-500';
      case 'CONCLUIDO':
        return 'bg-green-500';
      case 'ERRO':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'INICIADO':
      case 'PROCESSANDO':
        return <Clock className="h-4 w-4" />;
      case 'CONCLUIDO':
        return <CheckCircle className="h-4 w-4" />;
      case 'ERRO':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <>
      <div className="container mx-auto py-6">
        <PageHeader 
          title="Configurações" 
          description="Gerencie as configurações do sistema" 
        />

        <div className="grid gap-6 mt-6">
          {/* Seção Backup e Restauração */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <Database className="h-5 w-5" />
                Backup e Restauração
              </CardTitle>
              <CardDescription>
                Gerencie backups dos seus dados financeiros
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Card de Status */}
              <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-950/20">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Status do Sistema
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={carregarStatusBackup}
                    disabled={carregandoStatus}
                    className="h-6 w-6 p-0"
                  >
                    <RefreshCw className={`h-3 w-3 ${carregandoStatus ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
                
                {carregandoStatus ? (
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Carregando status...
                  </p>
                ) : statusBackup ? (
                  <div className="space-y-1">
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      <span className="font-medium">Total de registros:</span> {statusBackup.totalRegistrosDisponiveis}
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      <span className="font-medium">Status:</span> {statusBackup.status}
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      <span className="font-medium">Serviço ativo:</span> {statusBackup.servicoAtivo ? '✅ Sim' : '❌ Não'}
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      <span className="font-medium">Versão:</span> {statusBackup.versaoServico}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    Erro ao carregar status
                  </p>
                )}
              </div>

              {/* Botão Baixar Backup */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <h3 className="text-sm font-medium">Baixar Backup</h3>
                  <p className="text-xs text-muted-foreground">
                    Baixe um arquivo JSON com todos os seus dados
                  </p>
                </div>
                <Button
                  onClick={handleBaixarBackup}
                  disabled={operacaoEmAndamento}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  {operacaoEmAndamento ? 'Baixando...' : 'Baixar Backup'}
                </Button>
              </div>

              {/* Seção de Importar Backup */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-medium">Importar Backup</h3>
                  <p className="text-xs text-muted-foreground">
                    Restaure seus dados a partir de um arquivo de backup (Processamento assíncrono)
                  </p>
                </div>
                
                <div className="space-y-3">
                  {/* Input de arquivo oculto */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,application/json"
                    onChange={handleArquivoSelecionado}
                    className="hidden"
                  />
                  
                  {!arquivoSelecionado ? (
                    /* Botão para selecionar arquivo */
                    <Button
                      variant="outline"
                      onClick={handleSelecionarArquivo}
                      disabled={operacaoEmAndamento || !!importacaoAtiva}
                      className="w-full gap-2 py-8 border-dashed"
                    >
                      <Upload className="h-5 w-5" />
                      Clique para selecionar arquivo JSON
                    </Button>
                  ) : (
                    /* Arquivo selecionado */
                    <div className="border rounded-lg p-4 bg-muted/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-primary" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{arquivoSelecionado.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(arquivoSelecionado.size)}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRemoverArquivo}
                            disabled={operacaoEmAndamento || !!importacaoAtiva}
                          >
                            Remover
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleImportarBackup}
                            disabled={operacaoEmAndamento || !!importacaoAtiva}
                            className="gap-2"
                          >
                            <Upload className="h-4 w-4" />
                            {operacaoEmAndamento ? 'Iniciando...' : 'Importar'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Status da Importação Ativa */}
                  {importacaoAtiva && (
                    <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-950/20">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(importacaoAtiva.status)}
                            <span className="text-sm font-medium">Status da Importação</span>
                          </div>
                          <Badge className={`${getStatusColor(importacaoAtiva.status)} text-white`}>
                            {importacaoAtiva.status}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <p className="text-xs text-muted-foreground">
                            <span className="font-medium">Arquivo:</span> {importacaoAtiva.nomeArquivo}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            <span className="font-medium">Iniciado em:</span> {new Date(importacaoAtiva.dataInicio).toLocaleString('pt-BR')}
                          </p>
                          {importacaoAtiva.tempoDecorrido && (
                            <p className="text-xs text-muted-foreground">
                              <span className="font-medium">Tempo decorrido:</span> {importacaoAtiva.tempoDecorrido}
                            </p>
                          )}
                          {importacaoAtiva.totalRegistros && (
                            <p className="text-xs text-muted-foreground">
                              <span className="font-medium">Registros processados:</span> {importacaoAtiva.totalRegistros}
                            </p>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span>Progresso:</span>
                            <span>{importacaoAtiva.status === 'CONCLUIDO' ? '100%' : 'Processando...'}</span>
                          </div>
                          <Progress 
                            value={importacaoAtiva.status === 'CONCLUIDO' ? 100 : importacaoAtiva.status === 'ERRO' ? 0 : 50} 
                            className="h-2"
                          />
                        </div>
                        
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {importacaoAtiva.mensagem}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

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
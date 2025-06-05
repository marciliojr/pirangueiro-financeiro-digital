import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { UsuariosService } from '@/services/usuarios';
import { UsuarioDTO } from '@/services/contas';
import { toast } from 'sonner';

export const DebugUsuarios: React.FC = () => {
  const [usuarios, setUsuarios] = useState<UsuarioDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [testeNome, setTesteNome] = useState('');
  const [testeSenha, setTesteSenha] = useState('');
  const [testeResult, setTesteResult] = useState<string>('');

  const carregarUsuarios = async () => {
    setIsLoading(true);
    try {
      const users = await UsuariosService.listar();
      setUsuarios(users);
      
      // Também executa o debug
      await UsuariosService.debug();
      
      toast.success(`${users.length} usuários carregados`);
    } catch (error) {
      toast.error("Erro ao carregar usuários");
    } finally {
      setIsLoading(false);
    }
  };

  const testarAutenticacao = async () => {
    if (!testeNome || !testeSenha) {
      toast.error("Preencha nome e senha");
      return;
    }

    setIsLoading(true);
    try {
      const resultado = await UsuariosService.autenticar(testeNome, testeSenha);
      
      if (resultado) {
        setTesteResult(`✅ Sucesso: ${JSON.stringify(resultado, null, 2)}`);
        toast.success("Autenticação bem-sucedida!");
      } else {
        setTesteResult(`❌ Falhou: Credenciais inválidas`);
        toast.error("Credenciais inválidas");
      }
    } catch (error) {
      setTesteResult(`❌ Erro: ${error}`);
      toast.error("Erro no teste");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-4">🔍 Debug de Usuários</h2>
        
        <div className="space-y-4">
          <Button onClick={carregarUsuarios} disabled={isLoading}>
            {isLoading ? "Carregando..." : "Carregar Usuários da Base"}
          </Button>

          {usuarios.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">👥 Usuários Encontrados ({usuarios.length}):</h3>
              <div className="space-y-2">
                {usuarios.map((user, index) => (
                  <div key={user.id || index} className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <div><strong>ID:</strong> {user.id}</div>
                    <div><strong>Nome:</strong> {user.nome}</div>
                    <div><strong>Senha:</strong> {user.senha || "❌ Sem senha"}</div>
                    <div><strong>Tem Senha:</strong> {user.senha ? "✅ Sim" : "❌ Não"}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-4">🧪 Teste de Autenticação</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome do Usuário:</label>
            <Input
              value={testeNome}
              onChange={(e) => setTesteNome(e.target.value)}
              placeholder="Digite o nome do usuário"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Senha:</label>
            <Input
              type="password"
              value={testeSenha}
              onChange={(e) => setTesteSenha(e.target.value)}
              placeholder="Digite a senha"
            />
          </div>

          <Button onClick={testarAutenticacao} disabled={isLoading}>
            {isLoading ? "Testando..." : "Testar Autenticação"}
          </Button>

          {testeResult && (
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
              <h4 className="font-medium mb-2">Resultado do Teste:</h4>
              <pre className="text-sm whitespace-pre-wrap">{testeResult}</pre>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-4">ℹ️ Instruções</h2>
        <div className="text-sm space-y-2">
          <p>1. <strong>Carregar Usuários:</strong> Lista todos os usuários da base de dados</p>
          <p>2. <strong>Verificar Logs:</strong> Abra o console do navegador (F12) para ver logs detalhados</p>
          <p>3. <strong>Testar Login:</strong> Use os dados dos usuários listados para testar autenticação</p>
          <p>4. <strong>Problema Comum:</strong> Usuários sem senha não podem fazer login</p>
        </div>
      </Card>
    </div>
  );
}; 

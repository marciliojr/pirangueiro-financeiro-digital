import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UsuariosService } from '@/services/usuarios';
import { UsuarioDTO } from '@/services/contas';

export interface User {
  username: string;
  password: string;
  id?: number; // ID do backend
}

interface Session {
  user: User;
  loginTime: number;
  expiresAt: number;
}

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (username: string, password: string) => Promise<void>;
  syncWithBackend: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'pirangueiro_user';
const SESSION_KEY = 'pirangueiro_session';
const DEFAULT_USER: User = { username: 'adm', password: '123' };
const SESSION_DURATION = 2 * 24 * 60 * 60 * 1000; // 2 dias em millisegundos

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verifica se a sessão ainda é válida
  const isSessionValid = (session: Session): boolean => {
    const now = Date.now();
    return now < session.expiresAt;
  };

  // Salva a sessão no localStorage
  const saveSession = (user: User) => {
    const now = Date.now();
    const session: Session = {
      user,
      loginTime: now,
      expiresAt: now + SESSION_DURATION
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  };

  // Remove a sessão do localStorage
  const clearSession = () => {
    localStorage.removeItem(SESSION_KEY);
  };

  // Sincroniza usuário local com o backend
  const syncWithBackend = async () => {
    if (!currentUser) return;

    try {
      const usuarioBackend = await UsuariosService.sincronizarUsuarioLocal(
        currentUser.username, 
        currentUser.password
      );

      // Atualiza o usuário local com o ID do backend se necessário
      if (usuarioBackend.id && currentUser.id !== usuarioBackend.id) {
        const userAtualizado: User = {
          ...currentUser,
          id: usuarioBackend.id
        };
        setCurrentUser(userAtualizado);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userAtualizado));
        
        if (isAuthenticated) {
          saveSession(userAtualizado);
        }
      }

      console.log('✅ Usuário sincronizado com o backend:', usuarioBackend);
    } catch (error) {
      console.error('❌ Erro ao sincronizar com o backend:', error);
    }
  };

  // Carrega o usuário do localStorage na inicialização
  useEffect(() => {
    console.log("🔄 INICIALIZANDO AuthContext...");
    
    // Primeiro, verifica se há uma sessão válida
    const storedSession = localStorage.getItem(SESSION_KEY);
    console.log("🔍 Verificando sessão armazenada:", !!storedSession);
    
    if (storedSession) {
      try {
        const session: Session = JSON.parse(storedSession);
        console.log("📄 Sessão encontrada:", session);
        
        if (isSessionValid(session)) {
          // Sessão válida - mantém o usuário logado
          console.log("✅ Sessão válida! Fazendo login automático...");
          setCurrentUser(session.user);
          setIsAuthenticated(true);
          console.log('✅ Sessão válida encontrada. Usuário mantido logado.');
          
          // Atualiza a expiração da sessão (renovação automática)
          saveSession(session.user);
          
          // Sincroniza com o backend após carregar sessão
          setTimeout(() => {
            syncWithBackend();
          }, 1000);
          return;
        } else {
          // Sessão expirada - remove do localStorage
          console.log("⏰ Sessão expirada. Removendo...");
          clearSession();
          console.log('⏰ Sessão expirada. Usuário redirecionado para login.');
        }
      } catch (error) {
        console.error('❌ Erro ao carregar sessão do localStorage:', error);
        clearSession();
      }
    }

    // Se não há sessão válida, carrega apenas os dados do usuário (sem logar automaticamente)
    console.log("🔍 Verificando usuário armazenado...");
    const storedUser = localStorage.getItem(STORAGE_KEY);
    
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        console.log("👤 Usuário encontrado no localStorage:", user);
        setCurrentUser(user);
      } catch (error) {
        console.error('❌ Erro ao carregar usuário do localStorage:', error);
        // Se houver erro, cria o usuário padrão
        console.log("🔧 Criando usuário padrão devido ao erro...");
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_USER));
        setCurrentUser(DEFAULT_USER);
      }
    } else {
      // Se não existir usuário, cria o usuário padrão
      console.log("👤 Nenhum usuário encontrado. Criando usuário padrão...");
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_USER));
      setCurrentUser(DEFAULT_USER);
    }
    
    console.log("✅ Inicialização do AuthContext concluída");
  }, []);

  // Verifica periodicamente se a sessão ainda é válida
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkSession = () => {
      const storedSession = localStorage.getItem(SESSION_KEY);
      if (storedSession) {
        try {
          const session: Session = JSON.parse(storedSession);
          if (!isSessionValid(session)) {
            // Sessão expirou - desloga automaticamente
            logout();
            console.log('⏰ Sessão expirou automaticamente após 2 dias.');
          }
        } catch (error) {
          console.error('❌ Erro ao verificar sessão:', error);
          logout();
        }
      } else {
        // Não há sessão salva - desloga
        logout();
      }
    };

    // Verifica a sessão a cada 5 minutos
    const interval = setInterval(checkSession, 5 * 60 * 1000);
    
    // Verifica quando a página ganha foco (usuário volta para a aba)
    const handleFocus = () => {
      checkSession();
    };

    // Verifica quando a página perde foco (usuário sai da aba)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkSession();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated]);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      console.log("🚀 INICIANDO LOGIN - AuthContext");
      console.log("👤 Usuário:", username);
      console.log("🔐 Senha:", password);
      console.log("📍 Estado atual isAuthenticated:", isAuthenticated);
      console.log("👤 CurrentUser atual:", currentUser);
      
      // Primeiro tenta autenticar no backend
      console.log("🔄 Tentando autenticação no backend...");
      const usuarioBackend = await UsuariosService.autenticar(username, password);
      
      console.log("🔍 Resultado da autenticação backend:", usuarioBackend);
      
      if (usuarioBackend) {
        // Autenticação bem-sucedida no backend
        console.log("✅ Autenticação backend bem-sucedida! Processando...");
        
        const user: User = {
          username: usuarioBackend.nome,
          password: password,
          id: usuarioBackend.id
        };
        
        console.log("👤 Objeto User criado:", user);
        
        console.log("🔄 Definindo currentUser...");
        setCurrentUser(user);
        
        console.log("🔄 Definindo isAuthenticated como true...");
        setIsAuthenticated(true);
        
        console.log("💾 Salvando no localStorage...");
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        
        console.log("🕒 Salvando sessão...");
        saveSession(user);
        
        console.log('🚀 Login realizado via backend. Sessão criada por 2 dias.');
        
        // Aguarda um pouco para garantir que o estado foi atualizado
        setTimeout(() => {
          console.log("📍 Estado final isAuthenticated:", isAuthenticated);
          console.log("👤 Estado final currentUser:", currentUser);
        }, 100);
        
        return true;
      }
      
      console.log("❌ Autenticação backend falhou. Tentando fallback local...");
      
      // Se falhar no backend, tenta validação local como fallback
      if (currentUser && currentUser.username === username && currentUser.password === password) {
        console.log("✅ Fallback local bem-sucedido!");
        setIsAuthenticated(true);
        saveSession(currentUser);
        
        console.log('🚀 Login realizado localmente (fallback). Sincronizando com backend...');
        
        // Tenta sincronizar com o backend após login local
        setTimeout(() => {
          syncWithBackend();
        }, 1000);
        
        return true;
      }
      
      console.log("❌ Todas as tentativas de login falharam");
      return false;
    } catch (error) {
      console.error('❌ ERRO CRÍTICO durante autenticação:', error);
      console.error('Stack trace:', error.stack);
      
      // Em caso de erro, tenta validação local
      if (currentUser && currentUser.username === username && currentUser.password === password) {
        console.log("✅ Usando fallback local devido a erro...");
        setIsAuthenticated(true);
        saveSession(currentUser);
        console.log('🚀 Login realizado localmente devido a erro no backend.');
        return true;
      }
      
      console.log("❌ Nem mesmo o fallback local funcionou");
      return false;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    clearSession();
    console.log('👋 Logout realizado. Sessão removida.');
  };

  const updateUser = async (username: string, password: string) => {
    const newUser: User = { ...currentUser, username, password };
    setCurrentUser(newUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    
    // Se estiver logado, atualiza também a sessão
    if (isAuthenticated) {
      saveSession(newUser);
      console.log('👤 Credenciais atualizadas. Sessão renovada.');
    }

    // Sincroniza as alterações com o backend
    try {
      if (currentUser?.id) {
        // Usuário já existe no backend, apenas atualiza
        await UsuariosService.atualizar(currentUser.id, {
          id: currentUser.id,
          nome: username,
          senha: password
        });
        console.log('✅ Credenciais atualizadas no backend.');
      } else {
        // Usuário não tem ID do backend, tenta criar de forma controlada
        console.log('🔄 Criando novo usuário no backend de forma controlada...');
        const usuarioCriado = await UsuariosService.criarUsuarioControlado(username, password);
        
        if (usuarioCriado.id) {
          // Atualiza o usuário local com o ID do backend
          const userComId: User = {
            ...newUser,
            id: usuarioCriado.id
          };
          setCurrentUser(userComId);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(userComId));
          
          if (isAuthenticated) {
            saveSession(userComId);
          }
          
          console.log('✅ Novo usuário criado no backend:', usuarioCriado);
        }
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar/criar credenciais no backend:', error);
      console.log('ℹ️ Dados salvos localmente. Sincronização será tentada posteriormente.');
    }
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      isAuthenticated,
      login,
      logout,
      updateUser,
      syncWithBackend
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}; 
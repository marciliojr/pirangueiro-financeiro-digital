import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UsuariosService } from '@/services/usuarios';
import { UsuarioDTO } from '@/services/contas';
import { logger, LogModules, LogActions } from '@/utils/logger';

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

      logger.info(LogModules.AUTH, 'usuário sincronizado com backend', { 
        usuarioId: usuarioBackend.id 
      });
    } catch (error) {
      logger.error(LogModules.AUTH, 'erro sincronizar backend', { error });
    }
  };

  // Carrega o usuário do localStorage na inicialização
  useEffect(() => {
    logger.info(LogModules.AUTH, 'inicializando contexto');
    
    // Primeiro, verifica se há uma sessão válida
    const storedSession = localStorage.getItem(SESSION_KEY);
    logger.debug(LogModules.AUTH, 'verificando sessão armazenada', { 
      temSessao: !!storedSession 
    });
    
    if (storedSession) {
      try {
        const session: Session = JSON.parse(storedSession);
        logger.debug(LogModules.AUTH, 'sessão encontrada', { 
          usuario: session.user.username 
        });
        
        if (isSessionValid(session)) {
          // Sessão válida - mantém o usuário logado
          logger.info(LogModules.AUTH, LogActions.LOGIN_SUCCESS, { 
            tipo: 'sessao_automatica',
            usuario: session.user.username 
          });
          setCurrentUser(session.user);
          setIsAuthenticated(true);
          
          // Atualiza a expiração da sessão (renovação automática)
          saveSession(session.user);
          
          // Sincroniza com o backend após carregar sessão
          setTimeout(() => {
            syncWithBackend();
          }, 1000);
          return;
        } else {
          // Sessão expirada - remove do localStorage
          logger.info(LogModules.AUTH, LogActions.SESSION_EXPIRED);
          clearSession();
        }
      } catch (error) {
        logger.error(LogModules.AUTH, 'erro carregar sessão', { error });
        clearSession();
      }
    }

    // Se não há sessão válida, carrega apenas os dados do usuário (sem logar automaticamente)
    logger.debug(LogModules.AUTH, 'verificando usuário armazenado');
    const storedUser = localStorage.getItem(STORAGE_KEY);
    
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        logger.debug(LogModules.AUTH, 'usuário encontrado', { usuario: user.username });
        setCurrentUser(user);
      } catch (error) {
        logger.error(LogModules.AUTH, 'erro carregar usuário', { error });
        // Se houver erro, cria o usuário padrão
        logger.info(LogModules.AUTH, 'criando usuário padrão devido ao erro');
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_USER));
        setCurrentUser(DEFAULT_USER);
      }
    } else {
      // Se não existir usuário, cria o usuário padrão
      logger.info(LogModules.AUTH, 'criando usuário padrão');
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_USER));
      setCurrentUser(DEFAULT_USER);
    }
    
    logger.info(LogModules.AUTH, 'inicialização concluída');
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
            logger.info(LogModules.AUTH, LogActions.SESSION_EXPIRED, { 
              motivo: 'verificacao_periodica' 
            });
          }
        } catch (error) {
          logger.error(LogModules.AUTH, 'erro verificar sessão', { error });
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
      logger.info(LogModules.AUTH, LogActions.LOGIN, { usuario: username });
      
      // Primeiro tenta autenticar no backend
      const usuarioBackend = await UsuariosService.autenticar(username, password);
      
      if (usuarioBackend) {
        // Autenticação bem-sucedida no backend
        logger.info(LogModules.AUTH, LogActions.LOGIN_SUCCESS, { 
          tipo: 'backend',
          usuarioId: usuarioBackend.id 
        });
        
        const user: User = {
          username: usuarioBackend.nome,
          password: password,
          id: usuarioBackend.id
        };
        
        setCurrentUser(user);
        setIsAuthenticated(true);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        saveSession(user);
        
        return true;
      }
      
      // Se falhar no backend, tenta validação local como fallback
      if (currentUser && currentUser.username === username && currentUser.password === password) {
        logger.info(LogModules.AUTH, LogActions.LOGIN_SUCCESS, { 
          tipo: 'fallback_local' 
        });
        setIsAuthenticated(true);
        saveSession(currentUser);
        
        // Tenta sincronizar com o backend após login local
        setTimeout(() => {
          syncWithBackend();
        }, 1000);
        
        return true;
      }
      
      logger.warn(LogModules.AUTH, LogActions.LOGIN_ERROR, { 
        motivo: 'credenciais_invalidas' 
      });
      return false;
    } catch (error) {
      logger.error(LogModules.AUTH, LogActions.LOGIN_ERROR, { error });
      
      // Em caso de erro, tenta validação local
      if (currentUser && currentUser.username === username && currentUser.password === password) {
        logger.info(LogModules.AUTH, LogActions.LOGIN_SUCCESS, { 
          tipo: 'fallback_erro' 
        });
        setIsAuthenticated(true);
        saveSession(currentUser);
        return true;
      }
      
      return false;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    clearSession();
    logger.info(LogModules.AUTH, LogActions.LOGOUT);
  };

  const updateUser = async (username: string, password: string) => {
    const newUser: User = { ...currentUser, username, password };
    setCurrentUser(newUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    
    // Se estiver logado, atualiza também a sessão
    if (isAuthenticated) {
      saveSession(newUser);
      logger.info(LogModules.AUTH, 'credenciais atualizadas', { usuario: username });
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
        logger.info(LogModules.AUTH, 'credenciais atualizadas no backend');
      } else {
        // Usuário não tem ID do backend, tenta criar de forma controlada
        logger.info(LogModules.AUTH, 'criando usuário no backend');
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
          
          logger.info(LogModules.AUTH, 'usuário criado no backend', { 
            usuarioId: usuarioCriado.id 
          });
        }
      }
    } catch (error) {
      logger.error(LogModules.AUTH, 'erro atualizar credenciais backend', { error });
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
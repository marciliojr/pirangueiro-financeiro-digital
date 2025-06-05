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

    } catch (error) {
    }
  };

  const syncUserWithBackend = async (userData: User) => {
    try {
      const usuarioBackend = await UsuariosService.sincronizarUsuarioLocal(userData.username, userData.password);
    } catch (error) {
      // Error syncing with backend
    }
  };

  useEffect(() => {
    // ... existing code ...
    
    const initializeAuth = async () => {
      try {
        // Verificar se há uma sessão válida no localStorage
        const storedSession = localStorage.getItem('pirangueiro_session');
        
        if (storedSession) {
          const session = JSON.parse(storedSession);
          
          // Verifica se a sessão não expirou
          if (new Date(session.expiresAt) > new Date()) {
            const userData = JSON.parse(localStorage.getItem('pirangueiro_user') || '{}');
            
            setCurrentUser(userData);
            setIsAuthenticated(true);
            await syncUserWithBackend(userData);
            
            return;
          } else {
            // Sessão expirada - remove do localStorage
            localStorage.removeItem('pirangueiro_session');
            localStorage.removeItem('pirangueiro_user');
          }
        }
      } catch (error) {
        // Error loading session
      }

      try {
        // Verifica se existe usuário no localStorage (sem sessão)
        const storedUser = localStorage.getItem('pirangueiro_user');
        
        if (storedUser) {
          const user = JSON.parse(storedUser);
          setCurrentUser(user);
          setIsAuthenticated(true);
        } else {
          // Error loading user
        }
      } catch (error) {
        // Creating default user due to error
        const defaultUser: User = { id: 1, username: 'adm', password: '123' };
        setCurrentUser(defaultUser);
        setIsAuthenticated(true);
      }

      if (!currentUser) {
        // No user found, creating default user
        const defaultUser: User = { id: 1, username: 'adm', password: '123' };
        setCurrentUser(defaultUser);
        setIsAuthenticated(true);
      }
    };

    initializeAuth();

    // Configurar expiração automática da sessão (2 dias)
    const checkSession = () => {
      const storedSession = localStorage.getItem('pirangueiro_session');
      if (storedSession) {
        const session = JSON.parse(storedSession);
        if (new Date(session.expiresAt) <= new Date()) {
          logout();
        }
      }
    };

    const interval = setInterval(checkSession, 60000); // Verifica a cada minuto
    return () => clearInterval(interval);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // Primeiro tenta autenticar no backend
      const usuarioBackend = await UsuariosService.autenticar(username, password);
      
      if (usuarioBackend) {
        // Autenticação backend bem-sucedida
        const user: User = {
          id: usuarioBackend.id || 1,
          username: usuarioBackend.nome,
          password: usuarioBackend.senha || password
        };

        setCurrentUser(user);
        setIsAuthenticated(true);
        
        // Salva no localStorage
        localStorage.setItem('pirangueiro_user', JSON.stringify(user));
        
        // Cria sessão com expiração de 2 dias
        const session = {
          username: user.username,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
        };
        localStorage.setItem('pirangueiro_session', JSON.stringify(session));
        
        return true;
      } else {
        // Autenticação backend falhou, tenta fallback local
        if (username === 'adm' && password === '123') {
          const user: User = { id: 1, username, password };
          setCurrentUser(user);
          setIsAuthenticated(true);
          localStorage.setItem('pirangueiro_user', JSON.stringify(user));
          
          // Tenta sincronizar com o backend após login local
          await syncUserWithBackend(user);
          return true;
        }
        
        // Todas as tentativas falharam
        return false;
      }
    } catch (error) {
      // Critical error during authentication
      // Tenta fazer login local como fallback
      if (username === 'adm' && password === '123') {
        const user: User = { id: 1, username, password };
        setCurrentUser(user);
        setIsAuthenticated(true);
        localStorage.setItem('pirangueiro_user', JSON.stringify(user));
        
        return true;
      }
      
      // Nem mesmo o fallback local funcionou
      return false;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('pirangueiro_user');
    localStorage.removeItem('pirangueiro_session');
  };

  const updateCredentials = async (newUsername: string, newPassword: string) => {
    if (currentUser) {
      const updatedUser = { ...currentUser, username: newUsername, password: newPassword };
      setCurrentUser(updatedUser);
      localStorage.setItem('pirangueiro_user', JSON.stringify(updatedUser));
      
      // Atualiza sessão também
      const session = {
        username: updatedUser.username,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
      };
      localStorage.setItem('pirangueiro_session', JSON.stringify(session));

      // Tenta atualizar no backend
      try {
        const usuarioExistente = await UsuariosService.buscarPorNome(currentUser.username);
        if (usuarioExistente) {
          await UsuariosService.atualizar(usuarioExistente.id!, {
            ...usuarioExistente,
            nome: newUsername,
            senha: newPassword
          });
        } else {
          // Cria novo usuário no backend de forma controlada
          const usuarioCriado = await UsuariosService.criarUsuarioControlado(newUsername, newPassword);
        }
      } catch (error) {
        // Error updating/creating credentials in backend
      }
    }
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      isAuthenticated,
      login,
      logout,
      updateUser: updateCredentials,
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

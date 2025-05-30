import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  username: string;
  password: string;
}

interface Session {
  user: User;
  loginTime: number;
  expiresAt: number;
}

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  updateUser: (username: string, password: string) => void;
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

  // Carrega o usuário do localStorage na inicialização
  useEffect(() => {
    // Primeiro, verifica se há uma sessão válida
    const storedSession = localStorage.getItem(SESSION_KEY);
    if (storedSession) {
      try {
        const session: Session = JSON.parse(storedSession);
        if (isSessionValid(session)) {
          // Sessão válida - mantém o usuário logado
          setCurrentUser(session.user);
          setIsAuthenticated(true);
          console.log('✅ Sessão válida encontrada. Usuário mantido logado.');
          
          // Atualiza a expiração da sessão (renovação automática)
          saveSession(session.user);
          return;
        } else {
          // Sessão expirada - remove do localStorage
          clearSession();
          console.log('⏰ Sessão expirada. Usuário redirecionado para login.');
        }
      } catch (error) {
        console.error('❌ Erro ao carregar sessão do localStorage:', error);
        clearSession();
      }
    }

    // Se não há sessão válida, carrega apenas os dados do usuário (sem logar automaticamente)
    const storedUser = localStorage.getItem(STORAGE_KEY);
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
      } catch (error) {
        console.error('❌ Erro ao carregar usuário do localStorage:', error);
        // Se houver erro, cria o usuário padrão
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_USER));
        setCurrentUser(DEFAULT_USER);
      }
    } else {
      // Se não existir usuário, cria o usuário padrão
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_USER));
      setCurrentUser(DEFAULT_USER);
    }
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

  const login = (username: string, password: string): boolean => {
    if (!currentUser) return false;
    
    if (currentUser.username === username && currentUser.password === password) {
      setIsAuthenticated(true);
      // Salva a sessão persistente
      saveSession(currentUser);
      console.log('🚀 Login realizado. Sessão criada por 2 dias.');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    // Remove a sessão do localStorage
    clearSession();
    console.log('👋 Logout realizado. Sessão removida.');
  };

  const updateUser = (username: string, password: string) => {
    const newUser: User = { username, password };
    setCurrentUser(newUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    
    // Se estiver logado, atualiza também a sessão
    if (isAuthenticated) {
      saveSession(newUser);
      console.log('👤 Credenciais atualizadas. Sessão renovada.');
    }
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      isAuthenticated,
      login,
      logout,
      updateUser
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
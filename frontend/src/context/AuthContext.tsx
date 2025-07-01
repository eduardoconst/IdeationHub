

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserResponse, isAuthenticated, getCurrentUser, logout } from '../services/authService';

interface AuthContextType {
  user: UserResponse | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (userData: UserResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook personalizado para usar o contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verifica se há usuário logado ao carregar a página
  useEffect(() => {
    const checkAuth = async () => {
      console.log('🔍 Verificando autenticação...');
      
      if (isAuthenticated()) {
        console.log('✅ Token encontrado, validando com backend...');
        try {
          const userData = await getCurrentUser();
          console.log('✅ Usuário validado:', userData);
          setUser(userData);
        } catch (error) {
          console.error('❌ Erro ao verificar autenticação:', error);
          // Se houve erro, limpa tudo
          handleLogout();
        }
      } else {
        console.log('❌ Nenhum token encontrado');
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogin = (userData: UserResponse) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    logout(); // Chama a função do service que limpa localStorage
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isLoggedIn: !!user,
    login: handleLogin,
    logout: handleLogout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
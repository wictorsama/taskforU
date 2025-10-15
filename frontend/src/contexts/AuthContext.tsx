import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginDto, RegisterDto } from '../types';
import { authApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  loginWithCredentials: (credentials: LoginDto) => Promise<void>;
  register: (userData: RegisterDto) => Promise<void>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      console.log('AuthContext: Inicializando autenticação...');
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      console.log('AuthContext: Token armazenado:', storedToken ? `Existe: ${storedToken.substring(0, 20)}...` : 'Não existe');
      console.log('AuthContext: Usuário armazenado:', storedUser ? `Existe: ${storedUser}` : 'Não existe');

      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          console.log('AuthContext: Usuário parseado:', parsedUser);
          
          // Primeiro, definir o usuário como autenticado (fallback)
          setToken(storedToken);
          setUser(parsedUser);
          console.log('AuthContext: Estado inicial definido (fallback)');
          
          // Tentar validar token com o servidor (opcional)
          try {
            console.log('AuthContext: Tentando validar token com o servidor...');
            const { authApi } = await import('../services/api');
            const isValid = await authApi.validateToken();
            
            if (isValid) {
              console.log('AuthContext: Token válido confirmado pelo servidor');
            } else {
              console.log('AuthContext: Token inválido segundo servidor - mas mantendo sessão local');
              // Não remover a sessão imediatamente, deixar o interceptor lidar com isso
            }
          } catch (validationError) {
            console.warn('AuthContext: Erro na validação do token (mantendo sessão local):', validationError);
            // Manter a sessão mesmo se a validação falhar (problemas de rede, etc.)
          }
          
          console.log('AuthContext: isAuthenticated será:', !!(parsedUser && storedToken));
        } catch (parseError) {
          console.error('AuthContext: Erro ao parsear dados armazenados:', parseError);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          console.log('AuthContext: Dados corrompidos removidos do localStorage');
        }
      } else {
        console.log('AuthContext: Nenhum token ou usuário encontrado - usuário não autenticado');
      }
      
      setLoading(false);
      console.log('AuthContext: Inicialização concluída - loading definido como false');
    };

    initAuth();
  }, []);

  // Login direto com usuário e token (para usuário fixo)
  const login = (user: User, token: string) => {
    setToken(token);
    setUser(user);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  };

  // Login com credenciais (para integração futura com API)
  const loginWithCredentials = async (credentials: LoginDto) => {
    try {
      console.log('AuthContext: Fazendo login com credenciais...');
      const response = await authApi.login(credentials);
      console.log('AuthContext: Resposta da API recebida:', response);
      
      setToken(response.token);
      setUser(response.user);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      console.log('AuthContext: Token e usuário salvos no localStorage');
      console.log('AuthContext: isAuthenticated será:', !!(response.user && response.token));
    } catch (error) {
      console.error('AuthContext: Erro no login:', error);
      throw error;
    }
  };

  const register = async (userData: RegisterDto) => {
    try {
      const response = await authApi.register(userData);
      setToken(response.token);
      setUser(response.user);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    loginWithCredentials,
    register,
    logout,
    loading,
    isAuthenticated: !!user && !!token,
  };

  console.log('AuthContext: Renderizando com valores:', {
    user: user ? `${user.name} (ID: ${user.id})` : 'null',
    token: token ? `${token.substring(0, 20)}...` : 'null',
    loading,
    isAuthenticated: !!user && !!token
  });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
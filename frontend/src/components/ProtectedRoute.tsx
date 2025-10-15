import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Spin } from 'antd';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading, user, token } = useAuth();
  const location = useLocation();

  console.log('ProtectedRoute: Verificando autenticação...');
  console.log('ProtectedRoute: loading:', loading);
  console.log('ProtectedRoute: isAuthenticated:', isAuthenticated);
  console.log('ProtectedRoute: user:', user ? 'Existe' : 'Não existe');
  console.log('ProtectedRoute: token:', token ? 'Existe' : 'Não existe');

  if (loading) {
    console.log('ProtectedRoute: Ainda carregando, mostrando spinner...');
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('ProtectedRoute: Usuário não autenticado, redirecionando para login...');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log('ProtectedRoute: Usuário autenticado, renderizando children...');
  return <>{children}</>;
};

export default ProtectedRoute;
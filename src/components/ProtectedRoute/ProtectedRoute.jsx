import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Componente que protege rotas — redireciona para /
 * se o usuário não estiver logado
 */
function ProtectedRoute({ children }) {
  const { isLogado, carregando } = useAuth();

  if (carregando) {
    return (
      <div className="loading-spinner">
        <div className="spinner" />
      </div>
    );
  }

  if (!isLogado) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;

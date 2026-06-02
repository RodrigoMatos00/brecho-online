import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getUserLogado, setUserLogado, clearUserLogado,
  getUsers, getTheme, setTheme as saveTheme,
} from '../utils/storage';

// ============================================
// AuthContext — Contexto global de autenticação
// e tema da aplicação
// ============================================

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [userLogado, setUserLogadoState] = useState(null);
  const [tema, setTemaState] = useState('light');
  const [carregando, setCarregando] = useState(true);

  // Inicializa o estado a partir do localStorage
  useEffect(() => {
    const user = getUserLogado();
    const temaSalvo = getTheme();
    setUserLogadoState(user);
    setTemaState(temaSalvo);
    document.documentElement.setAttribute('data-theme', temaSalvo);
    setCarregando(false);
  }, []);

  /**
   * Faz login: salva o userLogado no localStorage e no estado
   */
  function login(user) {
    setUserLogado(user);
    setUserLogadoState(user);
  }

  /**
   * Faz logout: limpa o userLogado do localStorage e do estado
   */
  function logout() {
    clearUserLogado();
    setUserLogadoState(null);
  }

  /**
   * Atualiza o usuário logado (ex: após edição de perfil)
   */
  function atualizarUserLogado(updatedUser) {
    setUserLogado(updatedUser);
    setUserLogadoState(updatedUser);
  }

  /**
   * Alterna entre modo claro e escuro
   */
  function toggleTema() {
    const novoTema = tema === 'light' ? 'dark' : 'light';
    setTemaState(novoTema);
    saveTheme(novoTema);
    document.documentElement.setAttribute('data-theme', novoTema);
  }

  const value = {
    userLogado,
    carregando,
    tema,
    login,
    logout,
    toggleTema,
    atualizarUserLogado,
    isLogado: !!userLogado,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook para consumir o AuthContext
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}

export default AuthContext;

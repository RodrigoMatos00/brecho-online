import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar/Navbar';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';

// Páginas
import Auth from './pages/Auth/Auth';
import Explorar from './pages/Explorar/Explorar';
import DetalheAnuncio from './pages/DetalheAnuncio/DetalheAnuncio';
import Negociacoes from './pages/Negociacoes/Negociacoes';
import Chat from './pages/Chat/Chat';
import Avaliar from './pages/Avaliar/Avaliar';
import Perfil from './pages/Perfil/Perfil';
import Garagem from './pages/Garagem/Garagem';
import NovoAnuncio from './pages/NovoAnuncio/NovoAnuncio';

// Seed de dados iniciais
import { inicializarDadosSeed } from './utils/seedData';

// Inicializa dados de demonstração no primeiro carregamento
inicializarDadosSeed();

/**
 * Layout interno que condiciona a exibição da Navbar
 */
function AppLayout() {
  const { isLogado } = useAuth();
  const location = useLocation();

  // Só exibe a Navbar quando logado
  const mostrarNavbar = isLogado;

  return (
    <div className="app-layout">
      {mostrarNavbar && <Navbar />}
      <main className={`main-content${mostrarNavbar ? '' : ' no-navbar'}`}>
        <Routes>
          {/* Página de autenticação — pública */}
          <Route path="/" element={<Auth />} />

          {/* Rotas protegidas */}
          <Route path="/explorar" element={<ProtectedRoute><Explorar /></ProtectedRoute>} />
          <Route path="/anuncio/:id" element={<ProtectedRoute><DetalheAnuncio /></ProtectedRoute>} />
          <Route path="/negociacoes" element={<ProtectedRoute><Negociacoes /></ProtectedRoute>} />
          <Route path="/chat/:propostaId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="/avaliar/:propostaId" element={<ProtectedRoute><Avaliar /></ProtectedRoute>} />
          <Route path="/perfil" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />
          <Route path="/garagem" element={<ProtectedRoute><Garagem /></ProtectedRoute>} />
          <Route path="/novo-anuncio" element={<ProtectedRoute><NovoAnuncio /></ProtectedRoute>} />
          <Route path="/editar-anuncio/:id" element={<ProtectedRoute><NovoAnuncio /></ProtectedRoute>} />

          {/* Rota 404 — redireciona para home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

/**
 * Componente raíz da aplicação Brechó Online
 */
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

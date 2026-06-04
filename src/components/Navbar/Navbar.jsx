import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getPropostas } from '../../utils/storage';
import { iniciais } from '../../utils/helpers';
import './Navbar.css';

/**
 * Barra de navegação principal
 * Responsiva com menu hambúrguer no mobile
 */
function Navbar() {
  const { userLogado, logout, tema, toggleTema, isLogado } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuAberto, setMenuAberto] = useState(false);

  // Conta propostas pendentes recebidas pelo usuário (como vendedor)
  const propostasPendentes = isLogado
    ? getPropostas().filter(
        p => p.vendedorId === userLogado?.id && p.status === 'pendente'
      ).length
    : 0;

  function handleLogout() {
    logout();
    setMenuAberto(false);
    navigate('/');
  }

  function isAtivo(path) {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  }

  function fecharMenu() {
    setMenuAberto(false);
  }

  return (
    <nav className="navbar" role="navigation" aria-label="Navegação principal">
      <div className="navbar-container">
        {/* Logo */}
        <Link to={isLogado ? '/explorar' : '/'} className="navbar-logo" onClick={fecharMenu}>
          <span className="logo-icon">👗</span>
          <span className="logo-text">Brechó Online</span>
        </Link>

        {/* Links de Navegação — Desktop */}
        {isLogado && (
          <div className="navbar-links">
            <Link
              to="/explorar"
              className={`nav-link ${isAtivo('/explorar') ? 'active' : ''}`}
            >
              🔍 Explorar
            </Link>
            <Link
              to="/garagem"
              className={`nav-link ${isAtivo('/garagem') ? 'active' : ''}`}
            >
              🚗 Garagem
            </Link>
            <Link
              to="/negociacoes"
              className={`nav-link ${isAtivo('/negociacoes') ? 'active' : ''}`}
            >
              🤝 Negociações
              {propostasPendentes > 0 && (
                <span className="nav-badge">{propostasPendentes}</span>
              )}
            </Link>
            <Link
              to="/perfil"
              className={`nav-link ${isAtivo('/perfil') ? 'active' : ''}`}
            >
              👤 Perfil
            </Link>
          </div>
        )}

        {/* Ações — Direita */}
        <div className="navbar-actions">
          {/* Toggle de tema */}
          <button
            className="btn-icon"
            onClick={toggleTema}
            title={tema === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'}
            aria-label="Alternar tema"
          >
            {tema === 'light' ? '🌙' : '☀️'}
          </button>

          {isLogado ? (
            <>
              {/* Avatar do usuário */}
              <Link to="/perfil" className="navbar-avatar-link" onClick={fecharMenu}>
                {userLogado?.avatar ? (
                  <img
                    src={userLogado.avatar}
                    alt={userLogado.nome}
                    className="navbar-avatar"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div className="navbar-avatar-placeholder">
                    {iniciais(userLogado?.nome)}
                  </div>
                )}
                <span className="navbar-username">{userLogado?.nome?.split(' ')[0]}</span>
              </Link>

              {/* Saldo VATs */}
              <div className="navbar-vats">
                <span className="vats-icon">💰</span>
                <span className="vats-value">{userLogado?.vats || 0} VATs</span>
              </div>

              {/* Botão Sair — Desktop */}
              <button className="btn btn-secondary btn-sm desktop-only" onClick={handleLogout}>
                Sair
              </button>
            </>
          ) : null}

          {/* Hambúrguer — Mobile */}
          {isLogado && (
            <button
              className={`hamburger ${menuAberto ? 'open' : ''}`}
              onClick={() => setMenuAberto(!menuAberto)}
              aria-label="Menu"
              aria-expanded={menuAberto}
            >
              <span />
              <span />
              <span />
            </button>
          )}
        </div>
      </div>

      {/* Menu Mobile */}
      {isLogado && (
        <div className={`mobile-menu ${menuAberto ? 'open' : ''}`}>
          <Link to="/explorar" className={`mobile-nav-link ${isAtivo('/explorar') ? 'active' : ''}`} onClick={fecharMenu}>
            🔍 Explorar Anúncios
          </Link>
          <Link to="/garagem" className={`mobile-nav-link ${isAtivo('/garagem') ? 'active' : ''}`} onClick={fecharMenu}>
            🚗 Minha Garagem
          </Link>
          <Link to="/negociacoes" className={`mobile-nav-link ${isAtivo('/negociacoes') ? 'active' : ''}`} onClick={fecharMenu}>
            🤝 Minhas Negociações
            {propostasPendentes > 0 && (
              <span className="nav-badge mobile-badge">{propostasPendentes}</span>
            )}
          </Link>
          <Link to="/perfil" className={`mobile-nav-link ${isAtivo('/perfil') ? 'active' : ''}`} onClick={fecharMenu}>
            👤 Meu Perfil
          </Link>
          <button className="mobile-nav-link logout-btn" onClick={handleLogout}>
            🚪 Sair
          </button>
        </div>
      )}

      {/* Overlay para fechar menu mobile */}
      {menuAberto && (
        <div className="mobile-overlay" onClick={fecharMenu} aria-hidden="true" />
      )}
    </nav>
  );
}

export default Navbar;

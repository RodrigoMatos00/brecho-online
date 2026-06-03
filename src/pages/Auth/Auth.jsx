import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getUsers, setUsers } from '../../utils/storage';
import { gerarId } from '../../utils/helpers';
import './Auth.css';

/**
 * Página de autenticação com abas de Login e Cadastro
 */
function Auth() {
  const [aba, setAba] = useState('login');
  const { login } = useAuth();
  const navigate = useNavigate();

  // Estados do formulário de login
  const [loginForm, setLoginForm] = useState({ email: '', senha: '' });
  const [loginErro, setLoginErro] = useState('');

  // Estados do formulário de cadastro
  const [cadastroForm, setCadastroForm] = useState({
    nome: '', email: '', senha: '', confirmarSenha: '',
    telefone: '', endereco: '', avatar: '',
  });
  const [cadastroErros, setCadastroErros] = useState({});
  const [cadastroSucesso, setCadastroSucesso] = useState(false);

  // ---- Login ----
  function handleLogin(e) {
    e.preventDefault();
    setLoginErro('');
    const users = getUsers();
    const user = users.find(
      u => u.email.toLowerCase() === loginForm.email.toLowerCase() && u.senha === loginForm.senha
    );
    if (!user) {
      setLoginErro('E-mail ou senha incorretos.');
      return;
    }
    login(user);
    navigate('/explorar');
  }

  // ---- Cadastro ----
  function validarCadastro() {
    const erros = {};
    if (!cadastroForm.nome.trim()) erros.nome = 'Nome é obrigatório.';
    if (!cadastroForm.email.trim()) {
      erros.email = 'E-mail é obrigatório.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cadastroForm.email)) {
      erros.email = 'E-mail inválido.';
    }
    if (!cadastroForm.senha) {
      erros.senha = 'Senha é obrigatória.';
    } else if (cadastroForm.senha.length < 6) {
      erros.senha = 'Senha deve ter pelo menos 6 caracteres.';
    }
    if (cadastroForm.senha !== cadastroForm.confirmarSenha) {
      erros.confirmarSenha = 'As senhas não coincidem.';
    }
    if (!cadastroForm.telefone.trim()) erros.telefone = 'Telefone é obrigatório.';
    if (!cadastroForm.endereco.trim()) erros.endereco = 'Endereço é obrigatório.';
    return erros;
  }

  function handleCadastro(e) {
    e.preventDefault();
    const erros = validarCadastro();
    if (Object.keys(erros).length > 0) {
      setCadastroErros(erros);
      return;
    }

    const users = getUsers();
    if (users.find(u => u.email.toLowerCase() === cadastroForm.email.toLowerCase())) {
      setCadastroErros({ email: 'Este e-mail já está cadastrado.' });
      return;
    }

    const novoUser = {
      id: gerarId(),
      nome: cadastroForm.nome.trim(),
      email: cadastroForm.email.toLowerCase().trim(),
      senha: cadastroForm.senha,
      telefone: cadastroForm.telefone.trim(),
      endereco: cadastroForm.endereco.trim(),
      avatar: cadastroForm.avatar.trim() || '',
      vats: 20, // VATs de boas-vindas
      mediaEstrelas: 0,
      totalNegociacoes: 0,
      dataCadastro: new Date().toISOString(),
      historicoVats: [
        { data: new Date().toISOString(), valor: 20, descricao: 'VATs de boas-vindas 🎉', saldoApos: 20 }
      ],
    };

    setUsers([...users, novoUser]);
    setCadastroSucesso(true);

    // Faz login automático após cadastro
    setTimeout(() => {
      login(novoUser);
      navigate('/explorar');
    }, 1500);
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Painel esquerdo — Branding */}
        <div className="auth-brand">
          <div className="auth-brand-content">
            <div className="auth-brand-logo">👗</div>
            <h1>Brechó Online</h1>
            <p>Seu marketplace sustentável de moda pré-amada. Compre, venda e troque com quem cuida do planeta.</p>
            <div className="auth-features">
              <div className="auth-feature">💰 Pague com VATs</div>
              <div className="auth-feature">🔄 Troque peças</div>
              <div className="auth-feature">⭐ Avalie vendedores</div>
              <div className="auth-feature">🌱 Moda sustentável</div>
            </div>
          </div>
        </div>

        {/* Painel direito — Formulário */}
        <div className="auth-form-panel">
          {/* Abas */}
          <div className="auth-tabs">
            <button
              className={`auth-tab ${aba === 'login' ? 'active' : ''}`}
              onClick={() => { setAba('login'); setLoginErro(''); }}
              id="tab-login"
            >
              Entrar
            </button>
            <button
              className={`auth-tab ${aba === 'cadastro' ? 'active' : ''}`}
              onClick={() => { setAba('cadastro'); setCadastroErros({}); }}
              id="tab-cadastro"
            >
              Criar Conta
            </button>
          </div>

          {/* Formulário de Login */}
          {aba === 'login' && (
            <form onSubmit={handleLogin} className="auth-form fade-in" id="form-login">
              <h2>Bem-vindo de volta! 👋</h2>
              <p className="auth-subtitle">Entre para acessar seu brechó.</p>

              {loginErro && (
                <div className="alert alert-danger">{loginErro}</div>
              )}

              <div className="form-group">
                <label className="form-label" htmlFor="login-email">
                  E-mail <span className="required">*</span>
                </label>
                <input
                  id="login-email"
                  type="email"
                  className="form-input"
                  placeholder="seu@email.com"
                  value={loginForm.email}
                  onChange={e => setLoginForm({ ...loginForm, email: e.target.value })}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="login-senha">
                  Senha <span className="required">*</span>
                </label>
                <input
                  id="login-senha"
                  type="password"
                  className="form-input"
                  placeholder="••••••"
                  value={loginForm.senha}
                  onChange={e => setLoginForm({ ...loginForm, senha: e.target.value })}
                  required
                  autoComplete="current-password"
                />
              </div>

              <button type="submit" className="btn btn-primary btn-block btn-lg" id="btn-entrar">
                Entrar 🚀
              </button>

              <div className="auth-demo">
                <p>🔑 <strong>Contas de demonstração:</strong></p>
                <p>ana@email.com • carlos@email.com • bea@email.com</p>
                <p>Senha: <code>123456</code></p>
              </div>
            </form>
          )}

          {/* Formulário de Cadastro */}
          {aba === 'cadastro' && (
            <form onSubmit={handleCadastro} className="auth-form fade-in" id="form-cadastro">
              <h2>Criar sua conta ✨</h2>
              <p className="auth-subtitle">Ganhe 20 VATs de boas-vindas!</p>

              {cadastroSucesso && (
                <div className="alert alert-success">
                  ✅ Conta criada! Você ganhou 20 VATs de boas-vindas! Redirecionando...
                </div>
              )}

              <div className="form-group">
                <label className="form-label" htmlFor="cad-nome">
                  Nome completo <span className="required">*</span>
                </label>
                <input
                  id="cad-nome"
                  type="text"
                  className={`form-input ${cadastroErros.nome ? 'error' : ''}`}
                  placeholder="Seu nome"
                  value={cadastroForm.nome}
                  onChange={e => setCadastroForm({ ...cadastroForm, nome: e.target.value })}
                />
                {cadastroErros.nome && <span className="form-error">{cadastroErros.nome}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="cad-email">
                    E-mail <span className="required">*</span>
                  </label>
                  <input
                    id="cad-email"
                    type="email"
                    className={`form-input ${cadastroErros.email ? 'error' : ''}`}
                    placeholder="seu@email.com"
                    value={cadastroForm.email}
                    onChange={e => setCadastroForm({ ...cadastroForm, email: e.target.value })}
                  />
                  {cadastroErros.email && <span className="form-error">{cadastroErros.email}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="cad-telefone">
                    Telefone <span className="required">*</span>
                  </label>
                  <input
                    id="cad-telefone"
                    type="tel"
                    className={`form-input ${cadastroErros.telefone ? 'error' : ''}`}
                    placeholder="(11) 99999-9999"
                    value={cadastroForm.telefone}
                    onChange={e => setCadastroForm({ ...cadastroForm, telefone: e.target.value })}
                  />
                  {cadastroErros.telefone && <span className="form-error">{cadastroErros.telefone}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="cad-senha">
                    Senha <span className="required">*</span>
                  </label>
                  <input
                    id="cad-senha"
                    type="password"
                    className={`form-input ${cadastroErros.senha ? 'error' : ''}`}
                    placeholder="Mín. 6 caracteres"
                    value={cadastroForm.senha}
                    onChange={e => setCadastroForm({ ...cadastroForm, senha: e.target.value })}
                  />
                  {cadastroErros.senha && <span className="form-error">{cadastroErros.senha}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="cad-confirmar">
                    Confirmar senha <span className="required">*</span>
                  </label>
                  <input
                    id="cad-confirmar"
                    type="password"
                    className={`form-input ${cadastroErros.confirmarSenha ? 'error' : ''}`}
                    placeholder="Repita a senha"
                    value={cadastroForm.confirmarSenha}
                    onChange={e => setCadastroForm({ ...cadastroForm, confirmarSenha: e.target.value })}
                  />
                  {cadastroErros.confirmarSenha && <span className="form-error">{cadastroErros.confirmarSenha}</span>}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="cad-endereco">
                  Endereço <span className="required">*</span>
                </label>
                <input
                  id="cad-endereco"
                  type="text"
                  className={`form-input ${cadastroErros.endereco ? 'error' : ''}`}
                  placeholder="Rua, número — Cidade, Estado"
                  value={cadastroForm.endereco}
                  onChange={e => setCadastroForm({ ...cadastroForm, endereco: e.target.value })}
                />
                {cadastroErros.endereco && <span className="form-error">{cadastroErros.endereco}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="cad-avatar">
                  URL do avatar (opcional)
                </label>
                <input
                  id="cad-avatar"
                  type="url"
                  className="form-input"
                  placeholder="https://..."
                  value={cadastroForm.avatar}
                  onChange={e => setCadastroForm({ ...cadastroForm, avatar: e.target.value })}
                />
                <span className="form-hint">Ex: https://i.pravatar.cc/150?img=5</span>
              </div>

              <button type="submit" className="btn btn-primary btn-block btn-lg" id="btn-cadastrar" disabled={cadastroSucesso}>
                Criar Conta Grátis 🎉
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Auth;

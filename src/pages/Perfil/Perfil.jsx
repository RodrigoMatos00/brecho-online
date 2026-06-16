import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  getUsers, updateUser, adicionarHistoricoVats,
} from '../../utils/storage';
import {
  formatarData, formatarVats, calcularSelo, reaisParaVats, iniciais,
} from '../../utils/helpers';
import StarRating from '../../components/StarRating/StarRating';
import Badge from '../../components/Badge/Badge';
import VATsChart from '../../components/VATsChart/VATsChart';
import Modal from '../../components/Modal/Modal';
import './Perfil.css';

/**
 * Página de perfil do usuário logado.
 * Exibe dados, VATs, selos e gráfico de evolução.
 */
function Perfil() {
  const { userLogado, atualizarUserLogado } = useAuth();
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState({});
  const [formErros, setFormErros] = useState({});
  const [sucesso, setSucesso] = useState('');

  // Modais de VATs
  const [modalComprarVats, setModalComprarVats] = useState(false);
  const [modalTrocarVats, setModalTrocarVats] = useState(false);
  const [valorReais, setValorReais] = useState('');
  const [quantVats, setQuantVats] = useState('');
  const [erroVats, setErroVats] = useState('');
  const [suceVats, setSuceVats] = useState('');

  useEffect(() => {
    if (userLogado) {
      setForm({
        nome: userLogado.nome || '',
        email: userLogado.email || '',
        telefone: userLogado.telefone || '',
        endereco: userLogado.endereco || '',
        avatar: userLogado.avatar || '',
        senha: '',
      });
    }
  }, [userLogado]);

  function validarForm() {
    const erros = {};
    if (!form.nome.trim()) erros.nome = 'Nome é obrigatório.';
    if (!form.email.trim()) erros.email = 'E-mail é obrigatório.';
    if (form.senha && form.senha.length < 6) erros.senha = 'Senha deve ter mínimo 6 caracteres.';
    return erros;
  }

  function salvarPerfil(e) {
    e.preventDefault();
    const erros = validarForm();
    if (Object.keys(erros).length > 0) {
      setFormErros(erros);
      return;
    }

    // Verifica e-mail duplicado (exceto o próprio)
    const users = getUsers();
    const emailDuplicado = users.find(
      u => u.email.toLowerCase() === form.email.toLowerCase() && u.id !== userLogado.id
    );
    if (emailDuplicado) {
      setFormErros({ email: 'Este e-mail já está em uso.' });
      return;
    }

    const updatedUser = {
      ...userLogado,
      nome: form.nome.trim(),
      email: form.email.toLowerCase().trim(),
      telefone: form.telefone.trim(),
      endereco: form.endereco.trim(),
      avatar: form.avatar.trim(),
      ...(form.senha ? { senha: form.senha } : {}),
    };

    updateUser(updatedUser);
    atualizarUserLogado(updatedUser);
    setEditando(false);
    setSucesso('✅ Perfil atualizado com sucesso!');
    setFormErros({});
    setTimeout(() => setSucesso(''), 3000);
  }

  function comprarVats(e) {
    e.preventDefault();
    setErroVats('');
    const vatsGanhos = reaisParaVats(valorReais);
    if (!valorReais || vatsGanhos <= 0) {
      setErroVats('Informe um valor válido em reais.');
      return;
    }

    const updatedUser = { ...userLogado, vats: (userLogado.vats || 0) + vatsGanhos };
    updateUser(updatedUser);
    adicionarHistoricoVats(userLogado.id, vatsGanhos, `Compra de ${vatsGanhos} VATs`);
    atualizarUserLogado({ ...updatedUser, historicoVats: [...(userLogado.historicoVats || []), { data: new Date().toISOString(), valor: vatsGanhos, descricao: `Compra de ${vatsGanhos} VATs`, saldoApos: updatedUser.vats }] });
    setSuceVats(`✅ Você adquiriu ${vatsGanhos} VATs! Novo saldo: ${updatedUser.vats} VATs.`);
    setValorReais('');
    setTimeout(() => { setSuceVats(''); setModalComprarVats(false); }, 2500);
  }

  function trocarVats(e) {
    e.preventDefault();
    setErroVats('');
    const quant = Number(quantVats);
    if (!quant || quant <= 0) {
      setErroVats('Informe uma quantidade válida.');
      return;
    }
    if (quant > (userLogado.vats || 0)) {
      setErroVats(`Saldo insuficiente. Você tem ${userLogado.vats} VATs.`);
      return;
    }

    const updatedUser = { ...userLogado, vats: (userLogado.vats || 0) - quant };
    updateUser(updatedUser);
    adicionarHistoricoVats(userLogado.id, -quant, `Resgate de ${quant} VATs`);
    atualizarUserLogado({ ...updatedUser, historicoVats: [...(userLogado.historicoVats || []), { data: new Date().toISOString(), valor: -quant, descricao: `Resgate de ${quant} VATs`, saldoApos: updatedUser.vats }] });
    setSuceVats(`✅ ${quant} VATs resgatados (≈ R$ ${quant},00)! Novo saldo: ${updatedUser.vats} VATs.`);
    setQuantVats('');
    setTimeout(() => { setSuceVats(''); setModalTrocarVats(false); }, 2500);
  }

  if (!userLogado) return null;

  const selo = calcularSelo(userLogado.totalNegociacoes, userLogado.mediaEstrelas);

  return (
    <div className="perfil-page">
      <div className="container">
        <div className="page-wrapper">
          <div className="perfil-layout">
            {/* Coluna Esquerda: Avatar e Resumo */}
            <div className="perfil-sidebar">
              {/* Card principal do perfil */}
              <div className="card perfil-card">
                <div className="card-body">
                  <div className="perfil-avatar-area">
                    {userLogado.avatar ? (
                      <img
                        src={userLogado.avatar}
                        alt={userLogado.nome}
                        className="perfil-avatar"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="perfil-avatar-placeholder">
                        {iniciais(userLogado.nome)}
                      </div>
                    )}
                    {selo && (
                      <div className="perfil-selo">
                        <Badge usuario={userLogado} mostrarLabel />
                      </div>
                    )}
                  </div>

                  <h2 className="perfil-nome">{userLogado.nome}</h2>
                  <p className="perfil-email">{userLogado.email}</p>
                  <p className="perfil-data">
                    Membro desde {formatarData(userLogado.dataCadastro)}
                  </p>

                  <div className="perfil-stats">
                    <div className="stat-item">
                      <span className="stat-valor">{userLogado.totalNegociacoes}</span>
                      <span className="stat-label">Negociações</span>
                    </div>
                    <div className="stat-divider" />
                    <div className="stat-item">
                      <span className="stat-valor">
                        {userLogado.mediaEstrelas > 0 ? `${userLogado.mediaEstrelas}/10` : '—'}
                      </span>
                      <span className="stat-label">Nota média</span>
                    </div>
                  </div>

                  {userLogado.mediaEstrelas > 0 && (
                    <div style={{ margin: '12px 0', display: 'flex', justifyContent: 'center' }}>
                      <StarRating valor={userLogado.mediaEstrelas} readonly tamanho="md" />
                    </div>
                  )}

                  <button
                    className="btn btn-outline btn-block"
                    onClick={() => setEditando(!editando)}
                    id="btn-editar-perfil"
                  >
                    ✏️ {editando ? 'Cancelar edição' : 'Editar Perfil'}
                  </button>
                </div>
              </div>

              {/* Saldo VATs */}
              <div className="card vats-card">
                <div className="card-body">
                  <h3 className="vats-titulo">💰 Saldo de VATs</h3>
                  <div className="vats-saldo">{formatarVats(userLogado.vats || 0)}</div>
                  <p className="vats-info">1 VAT ≈ R$ 1,00</p>
                  <div className="vats-acoes">
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => { setModalComprarVats(true); setErroVats(''); setSuceVats(''); }}
                      id="btn-comprar-vats"
                    >
                      💳 Comprar VATs
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => { setModalTrocarVats(true); setErroVats(''); setSuceVats(''); }}
                      id="btn-resgatar-vats"
                    >
                      💸 Resgatar
                    </button>
                  </div>

                  {/* Gráfico de VATs */}
                  <div className="divider" />
                  <h4 className="grafico-titulo">📊 Evolução do Saldo</h4>
                  <VATsChart historico={userLogado.historicoVats} />
                </div>
              </div>

              {/* Info de contato */}
              <div className="card">
                <div className="card-body">
                  <h3 className="section-title" style={{ fontSize: '1rem' }}>📋 Informações</h3>
                  <div className="info-list">
                    <div className="info-item">
                      <span className="info-icone">📱</span>
                      <span>{userLogado.telefone || '—'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-icone">📍</span>
                      <span>{userLogado.endereco || '—'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Coluna Direita: Formulário de Edição */}
            {editando && (
              <div className="perfil-editar fade-in">
                <div className="card">
                  <div className="card-body">
                    <h2 className="section-title">✏️ Editar Perfil</h2>

                    {sucesso && <div className="alert alert-success">{sucesso}</div>}

                    <form onSubmit={salvarPerfil} id="form-editar-perfil">
                      <div className="form-group">
                        <label className="form-label" htmlFor="perfil-nome">
                          Nome <span className="required">*</span>
                        </label>
                        <input
                          id="perfil-nome"
                          type="text"
                          className={`form-input ${formErros.nome ? 'error' : ''}`}
                          value={form.nome}
                          onChange={e => setForm({ ...form, nome: e.target.value })}
                        />
                        {formErros.nome && <span className="form-error">{formErros.nome}</span>}
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="perfil-email">
                          E-mail <span className="required">*</span>
                        </label>
                        <input
                          id="perfil-email"
                          type="email"
                          className={`form-input ${formErros.email ? 'error' : ''}`}
                          value={form.email}
                          onChange={e => setForm({ ...form, email: e.target.value })}
                        />
                        {formErros.email && <span className="form-error">{formErros.email}</span>}
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label" htmlFor="perfil-tel">Telefone</label>
                          <input
                            id="perfil-tel"
                            type="tel"
                            className="form-input"
                            value={form.telefone}
                            onChange={e => setForm({ ...form, telefone: e.target.value })}
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label" htmlFor="perfil-senha">
                            Nova senha
                          </label>
                          <input
                            id="perfil-senha"
                            type="password"
                            className={`form-input ${formErros.senha ? 'error' : ''}`}
                            value={form.senha}
                            onChange={e => setForm({ ...form, senha: e.target.value })}
                            placeholder="Deixe em branco para manter"
                          />
                          {formErros.senha && <span className="form-error">{formErros.senha}</span>}
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="perfil-endereco">Endereço</label>
                        <input
                          id="perfil-endereco"
                          type="text"
                          className="form-input"
                          value={form.endereco}
                          onChange={e => setForm({ ...form, endereco: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="perfil-avatar">URL do avatar</label>
                        <input
                          id="perfil-avatar"
                          type="url"
                          className="form-input"
                          value={form.avatar}
                          onChange={e => setForm({ ...form, avatar: e.target.value })}
                          placeholder="https://..."
                        />
                      </div>

                      <div style={{ display: 'flex', gap: 10 }}>
                        <button type="button" className="btn btn-secondary" onClick={() => setEditando(false)}>
                          Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary" id="btn-salvar-perfil">
                          💾 Salvar Alterações
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Comprar VATs */}
      <Modal aberto={modalComprarVats} onFechar={() => setModalComprarVats(false)} titulo="💳 Comprar VATs" tamanho="sm">
        <div className="alert alert-info">1 real = 1 VAT. A conversão é simulada.</div>
        {suceVats && <div className="alert alert-success">{suceVats}</div>}
        {erroVats && <div className="alert alert-danger">{erroVats}</div>}
        <form onSubmit={comprarVats} id="form-comprar-vats">
          <div className="form-group">
            <label className="form-label" htmlFor="valor-reais">Valor em reais (R$)</label>
            <input
              id="valor-reais"
              type="number"
              min="1"
              className="form-input"
              placeholder="Ex: 50"
              value={valorReais}
              onChange={e => setValorReais(e.target.value)}
              required
            />
            {valorReais > 0 && (
              <span className="form-hint">Você receberá: {reaisParaVats(valorReais)} VATs</span>
            )}
          </div>
          <div className="modal-acoes">
            <button type="button" className="btn btn-secondary" onClick={() => setModalComprarVats(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primary" id="btn-confirmar-comprar-vats">Comprar</button>
          </div>
        </form>
      </Modal>

      {/* Modal Resgatar VATs */}
      <Modal aberto={modalTrocarVats} onFechar={() => setModalTrocarVats(false)} titulo="💸 Resgatar VATs" tamanho="sm">
        <div className="alert alert-info">
          Saldo atual: <strong>{userLogado.vats} VATs</strong>. 1 VAT = R$ 1,00 (simulado).
        </div>
        {suceVats && <div className="alert alert-success">{suceVats}</div>}
        {erroVats && <div className="alert alert-danger">{erroVats}</div>}
        <form onSubmit={trocarVats} id="form-resgatar-vats">
          <div className="form-group">
            <label className="form-label" htmlFor="quant-vats">Quantidade de VATs</label>
            <input
              id="quant-vats"
              type="number"
              min="1"
              max={userLogado.vats}
              className="form-input"
              placeholder={`Máx: ${userLogado.vats}`}
              value={quantVats}
              onChange={e => setQuantVats(e.target.value)}
              required
            />
            {quantVats > 0 && (
              <span className="form-hint">Você receberá: R$ {Number(quantVats).toFixed(2)}</span>
            )}
          </div>
          <div className="modal-acoes">
            <button type="button" className="btn btn-secondary" onClick={() => setModalTrocarVats(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primary" id="btn-confirmar-resgatar">Resgatar</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Perfil;

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  getPropostas, setPropostas, getAnuncioById,
  getUserById, getChats, setChats, getAnuncios, setAnuncios,
} from '../../utils/storage';
import {
  gerarId, formatarDataHora, formatarVats,
  labelStatusProposta, classBadgeProposta, tempoRelativo,
} from '../../utils/helpers';
import Modal from '../../components/Modal/Modal';
import './Negociacoes.css';

/**
 * Página de negociações dividida em:
 * - Propostas Recebidas (usuário é vendedor)
 * - Propostas Enviadas (usuário é comprador)
 */
function Negociacoes() {
  const { userLogado } = useAuth();
  const navigate = useNavigate();
  const [aba, setAba] = useState('recebidas');
  const [propostas, setPropostasState] = useState([]);
  const [modalContraproposta, setModalContraproposta] = useState(null);
  const [contraForm, setContraForm] = useState({ tipo: 'venda', valorOfertado: '', diferencaVATs: '' });
  const [sucesso, setSucesso] = useState('');

  const carregarPropostas = useCallback(() => {
    setPropostasState(getPropostas());
  }, []);

  useEffect(() => {
    carregarPropostas();
  }, [carregarPropostas]);

  const propostasRecebidas = propostas.filter(p => p.vendedorId === userLogado?.id && p.status !== 'encerrada');
  const propostasEnviadas = propostas.filter(p => p.compradorId === userLogado?.id && p.status !== 'encerrada');

  // ---- Ações do Vendedor ----

  function aceitarProposta(propostaId) {
    const todasPropostas = getPropostas();
    const index = todasPropostas.findIndex(p => p.id === propostaId);
    if (index === -1) return;

    const proposta = todasPropostas[index];
    proposta.status = 'aceita';
    todasPropostas[index] = proposta;
    setPropostas(todasPropostas);

    // Muda o anúncio para "negociação"
    const anuncios = getAnuncios();
    const anIndex = anuncios.findIndex(a => a.id === proposta.anuncioId);
    if (anIndex !== -1) {
      anuncios[anIndex].status = 'negociacao';
      setAnuncios(anuncios);
    }

    // Cria o chat
    const chats = getChats();
    const chatExistente = chats.find(c => c.propostaId === propostaId);
    if (!chatExistente) {
      const novoChat = {
        id: gerarId(),
        propostaId,
        mensagens: [
          {
            texto: '🎉 Proposta aceita! Vamos combinar os detalhes da negociação.',
            autorId: 'sistema',
            dataHora: new Date().toISOString(),
          }
        ],
        dataExpiracao: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        encerrado: false,
      };
      setChats([...chats, novoChat]);
    }

    setSucesso('✅ Proposta aceita! O chat foi aberto.');
    carregarPropostas();
  }

  function recusarProposta(propostaId) {
    const todasPropostas = getPropostas();
    const index = todasPropostas.findIndex(p => p.id === propostaId);
    if (index === -1) return;
    todasPropostas[index].status = 'recusada';
    setPropostas(todasPropostas);
    carregarPropostas();
  }

  function enviarContraproposta(e) {
    e.preventDefault();
    const todasPropostas = getPropostas();
    const proposta = todasPropostas.find(p => p.id === modalContraproposta);
    if (!proposta) return;

    // Adiciona a proposta atual ao histórico
    const historico = [...(proposta.historico || []), {
      tipo: proposta.tipo,
      valorOfertado: proposta.valorOfertado,
      pecasOfertadas: proposta.pecasOfertadas,
      diferencaVATs: proposta.diferencaVATs,
      status: proposta.status,
      autorId: proposta.compradorId,
      data: new Date().toISOString(),
    }];

    // Atualiza a proposta com os novos dados
    const index = todasPropostas.findIndex(p => p.id === modalContraproposta);
    todasPropostas[index] = {
      ...proposta,
      tipo: contraForm.tipo,
      valorOfertado: Number(contraForm.valorOfertado) || 0,
      diferencaVATs: Number(contraForm.diferencaVATs) || 0,
      status: 'contrapropostaEnviada',
      historico,
    };

    setPropostas(todasPropostas);
    setModalContraproposta(null);
    setSucesso('✅ Contraproposta enviada!');
    carregarPropostas();
  }

  // ---- Ações do Comprador ----

  function aceitarContraproposta(propostaId) {
    const todasPropostas = getPropostas();
    const index = todasPropostas.findIndex(p => p.id === propostaId);
    if (index === -1) return;

    const proposta = todasPropostas[index];
    proposta.status = 'aceita';
    todasPropostas[index] = proposta;
    setPropostas(todasPropostas);

    // Muda anúncio para negociação e cria chat
    const anuncios = getAnuncios();
    const anIndex = anuncios.findIndex(a => a.id === proposta.anuncioId);
    if (anIndex !== -1) {
      anuncios[anIndex].status = 'negociacao';
      setAnuncios(anuncios);
    }

    const chats = getChats();
    if (!chats.find(c => c.propostaId === propostaId)) {
      setChats([...chats, {
        id: gerarId(),
        propostaId,
        mensagens: [{
          texto: '🎉 Contraproposta aceita! Negociação em andamento.',
          autorId: 'sistema',
          dataHora: new Date().toISOString(),
        }],
        dataExpiracao: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        encerrado: false,
      }]);
    }

    setSucesso('✅ Contraproposta aceita!');
    carregarPropostas();
  }

  // ---- Renderização de cards de proposta ----
  function renderCardProposta(proposta, perspectiva) {
    const anuncio = getAnuncioById(proposta.anuncioId);
    const outraPessoa = perspectiva === 'vendedor'
      ? getUserById(proposta.compradorId)
      : getUserById(proposta.vendedorId);

    return (
      <div key={proposta.id} className="proposta-card card fade-in">
        <div className="card-body">
          <div className="proposta-header">
            <div className="proposta-anuncio-info">
              {anuncio?.foto && (
                <img
                  src={anuncio.foto}
                  alt={anuncio?.titulo}
                  className="proposta-thumb"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              )}
              <div>
                <p className="proposta-anuncio-titulo">{anuncio?.titulo || 'Anúncio removido'}</p>
                <p className="proposta-pessoa">
                  {perspectiva === 'vendedor' ? '👤 Comprador:' : '🏪 Vendedor:'} {outraPessoa?.nome || '—'}
                </p>
                <p className="proposta-data">{tempoRelativo(proposta.dataCriacao)}</p>
              </div>
            </div>
            <span className={`badge ${classBadgeProposta(proposta.status)}`}>
              {labelStatusProposta(proposta.status)}
            </span>
          </div>

          {/* Detalhes da proposta */}
          <div className="proposta-detalhes">
            <span className="badge badge-gray">
              {proposta.tipo === 'venda' ? '🛒 Compra' : '🔁 Troca'}
            </span>
            {proposta.tipo === 'venda' ? (
              <span className="proposta-valor">{formatarVats(proposta.valorOfertado)}</span>
            ) : (
              <span className="proposta-valor">
                {proposta.pecasOfertadas?.length} peça{proposta.pecasOfertadas?.length !== 1 ? 's' : ''}
                {proposta.diferencaVATs > 0 && ` + ${formatarVats(proposta.diferencaVATs)}`}
              </span>
            )}
          </div>

          {/* Histórico de contrapropostas */}
          {proposta.historico?.length > 0 && (
            <div className="proposta-historico">
              <p className="historico-label">📋 Histórico:</p>
              {proposta.historico.map((h, i) => (
                <div key={i} className="historico-item">
                  <span className="historico-dot" />
                  <span>{h.tipo === 'venda' ? `Compra: ${formatarVats(h.valorOfertado)}` : `Troca: ${h.pecasOfertadas?.length} peça(s)`}</span>
                  <span className="historico-data">{formatarDataHora(h.data)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Ações */}
          <div className="proposta-acoes">
            {/* Ações do Vendedor */}
            {perspectiva === 'vendedor' && proposta.status === 'pendente' && (
              <>
                <button className="btn btn-primary btn-sm" onClick={() => aceitarProposta(proposta.id)} id={`btn-aceitar-${proposta.id}`}>
                  ✅ Aceitar
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => recusarProposta(proposta.id)} id={`btn-recusar-${proposta.id}`}>
                  ❌ Recusar
                </button>
                <button className="btn btn-warning btn-sm" onClick={() => { setModalContraproposta(proposta.id); setContraForm({ tipo: proposta.tipo, valorOfertado: proposta.valorOfertado, diferencaVATs: proposta.diferencaVATs }); }} id={`btn-contrapropor-${proposta.id}`}>
                  🔄 Contrapropor
                </button>
              </>
            )}

            {/* Ações do Comprador quando há contraproposta */}
            {perspectiva === 'comprador' && proposta.status === 'contrapropostaEnviada' && (
              <>
                <button className="btn btn-primary btn-sm" onClick={() => aceitarContraproposta(proposta.id)} id={`btn-aceitar-contra-${proposta.id}`}>
                  ✅ Aceitar Contraproposta
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => recusarProposta(proposta.id)} id={`btn-recusar-contra-${proposta.id}`}>
                  ❌ Recusar
                </button>
              </>
            )}

            {/* Ir para chat se aceita */}
            {proposta.status === 'aceita' && (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => navigate(`/chat/${proposta.id}`)}
                id={`btn-chat-${proposta.id}`}
              >
                💬 Abrir Chat
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="negociacoes-page">
      <div className="container">
        <div className="page-wrapper">
          <div className="page-header">
            <h1>Minhas Negociações 🤝</h1>
            <p>Gerencie suas propostas de compra e troca.</p>
          </div>

          {sucesso && (
            <div className="alert alert-success fade-in">{sucesso}</div>
          )}

          <div className="tabs">
            <button
              className={`tab-btn ${aba === 'recebidas' ? 'active' : ''}`}
              onClick={() => setAba('recebidas')}
              id="tab-recebidas"
            >
              📥 Propostas Recebidas ({propostasRecebidas.length})
            </button>
            <button
              className={`tab-btn ${aba === 'enviadas' ? 'active' : ''}`}
              onClick={() => setAba('enviadas')}
              id="tab-enviadas"
            >
              📤 Propostas Enviadas ({propostasEnviadas.length})
            </button>
          </div>

          {aba === 'recebidas' && (
            <div className="negociacoes-lista fade-in">
              {propostasRecebidas.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📭</div>
                  <h3>Nenhuma proposta recebida</h3>
                  <p>Quando alguém se interessar pelos seus anúncios, as propostas aparecerão aqui.</p>
                </div>
              ) : (
                propostasRecebidas.map(p => renderCardProposta(p, 'vendedor'))
              )}
            </div>
          )}

          {aba === 'enviadas' && (
            <div className="negociacoes-lista fade-in">
              {propostasEnviadas.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📮</div>
                  <h3>Nenhuma proposta enviada</h3>
                  <p>Explore os anúncios disponíveis e faça sua primeira proposta!</p>
                  <button className="btn btn-primary" onClick={() => navigate('/explorar')}>
                    Explorar Anúncios
                  </button>
                </div>
              ) : (
                propostasEnviadas.map(p => renderCardProposta(p, 'comprador'))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Contraproposta */}
      <Modal
        aberto={!!modalContraproposta}
        onFechar={() => setModalContraproposta(null)}
        titulo="🔄 Enviar Contraproposta"
      >
        <form onSubmit={enviarContraproposta} id="form-contraproposta">
          <div className="form-group">
            <label className="form-label">Tipo da proposta</label>
            <select
              className="form-select"
              value={contraForm.tipo}
              onChange={e => setContraForm({ ...contraForm, tipo: e.target.value })}
            >
              <option value="venda">Compra em VATs</option>
              <option value="troca">Troca de peças</option>
            </select>
          </div>

          {contraForm.tipo === 'venda' && (
            <div className="form-group">
              <label className="form-label" htmlFor="contra-valor">
                Novo valor ofertado (VATs)
              </label>
              <input
                id="contra-valor"
                type="number"
                className="form-input"
                min="1"
                value={contraForm.valorOfertado}
                onChange={e => setContraForm({ ...contraForm, valorOfertado: e.target.value })}
                required
              />
            </div>
          )}

          {contraForm.tipo === 'troca' && (
            <div className="form-group">
              <label className="form-label" htmlFor="contra-diferenca">
                Diferença em VATs sugerida
              </label>
              <input
                id="contra-diferenca"
                type="number"
                className="form-input"
                min="0"
                value={contraForm.diferencaVATs}
                onChange={e => setContraForm({ ...contraForm, diferencaVATs: e.target.value })}
              />
            </div>
          )}

          <div className="modal-acoes">
            <button type="button" className="btn btn-secondary" onClick={() => setModalContraproposta(null)}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" id="btn-enviar-contraproposta">
              Enviar Contraproposta
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Negociacoes;

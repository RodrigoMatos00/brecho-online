import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  getPropostaById, getChatByPropostaId, getChats, setChats,
  getPropostas, setPropostas, getAnuncioById, getUserById,
  getAnuncios, setAnuncios,
} from '../../utils/storage';
import { gerarId, formatarDataHora, iniciais, estaExpirado } from '../../utils/helpers';
import Modal from '../../components/Modal/Modal';
import './Chat.css';

/**
 * Página de Chat para uma negociação aceita.
 * Exibe histórico de mensagens e permite encerrar a negociação.
 */
function Chat() {
  const { propostaId } = useParams();
  const { userLogado } = useAuth();
  const navigate = useNavigate();

  const [proposta, setProposta] = useState(null);
  const [chat, setChat] = useState(null);
  const [mensagem, setMensagem] = useState('');
  const [modalEncerrar, setModalEncerrar] = useState(false);
  const [outraPessoa, setOutraPessoa] = useState(null);
  const [anuncio, setAnuncio] = useState(null);
  const messagesEndRef = useRef(null);

  const carregarDados = useCallback(() => {
    const p = getPropostaById(propostaId);
    // Permite acesso ao chat se a proposta está aceita ou encerrada (visualização histórica)
    if (!p || !['aceita', 'encerrada'].includes(p.status)) {
      navigate('/negociacoes');
      return;
    }
    setProposta(p);
    setAnuncio(getAnuncioById(p.anuncioId));

    const outraId = p.vendedorId === userLogado?.id ? p.compradorId : p.vendedorId;
    setOutraPessoa(getUserById(outraId));

    const c = getChatByPropostaId(propostaId);
    setChat(c);
  }, [propostaId, userLogado, navigate]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  // Auto-scroll para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat?.mensagens]);

  function enviarMensagem(e) {
    e.preventDefault();
    if (!mensagem.trim() || !chat) return;

    const chats = getChats();
    const index = chats.findIndex(c => c.id === chat.id);
    if (index === -1) return;

    const novaMensagem = {
      texto: mensagem.trim(),
      autorId: userLogado.id,
      dataHora: new Date().toISOString(),
    };

    chats[index].mensagens = [...(chats[index].mensagens || []), novaMensagem];
    setChats(chats);
    setChat({ ...chats[index] });
    setMensagem('');
  }

  function encerrarNegociacao() {
    if (!chat || !proposta) return;

    // Encerra o chat
    const chats = getChats();
    const chatIndex = chats.findIndex(c => c.id === chat.id);
    if (chatIndex !== -1) {
      chats[chatIndex].encerrado = true;
      setChats(chats);
    }

    // Muda status da proposta para encerrada
    const propostas = getPropostas();
    const pIndex = propostas.findIndex(p => p.id === propostaId);
    if (pIndex !== -1) {
      propostas[pIndex].status = 'encerrada';
      setPropostas(propostas);
    }

    // Muda anúncio para vendido
    const anuncios = getAnuncios();
    const aIndex = anuncios.findIndex(a => a.id === proposta.anuncioId);
    if (aIndex !== -1) {
      anuncios[aIndex].status = 'vendido';
      setAnuncios(anuncios);
    }

    setModalEncerrar(false);
    navigate(`/avaliar/${propostaId}`);
  }

  if (!proposta || !chat) {
    return <div className="loading-spinner"><div className="spinner" /></div>;
  }

  const chatExpirado = estaExpirado(chat.dataExpiracao);

  return (
    <div className="chat-page">
      <div className="container">
        <div className="page-wrapper">
          {/* Header do chat */}
          <div className="chat-header card">
            <div className="card-body">
              <div className="chat-header-info">
                <button className="btn btn-secondary btn-sm" onClick={() => navigate('/negociacoes')}>
                  ← Voltar
                </button>
                <div className="chat-info">
                  {outraPessoa?.avatar ? (
                    <img src={outraPessoa.avatar} alt={outraPessoa?.nome} className="chat-avatar"
                      onError={(e) => { e.target.style.display = 'none'; }} />
                  ) : (
                    <div className="chat-avatar-placeholder">
                      {iniciais(outraPessoa?.nome)}
                    </div>
                  )}
                  <div>
                    <p className="chat-nome">{outraPessoa?.nome}</p>
                    <p className="chat-anuncio">📦 {anuncio?.titulo}</p>
                  </div>
                </div>
                {!chat.encerrado && !chatExpirado && (
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => setModalEncerrar(true)}
                    id="btn-encerrar-negociacao"
                  >
                    🔒 Encerrar
                  </button>
                )}
              </div>

              {chatExpirado && (
                <div className="alert alert-warning" style={{ marginTop: 12, marginBottom: 0 }}>
                  ⏰ Este chat expirou em {formatarDataHora(chat.dataExpiracao)}.
                </div>
              )}

              {chat.encerrado && (
                <div className="alert alert-info" style={{ marginTop: 12, marginBottom: 0 }}>
                  ✅ Esta negociação foi encerrada.
                </div>
              )}
            </div>
          </div>

          {/* Mensagens */}
          <div className="chat-mensagens" id="chat-mensagens">
            {(chat.mensagens || []).map((msg, i) => {
              const ehSistema = msg.autorId === 'sistema';
              const ehMeu = msg.autorId === userLogado?.id;

              if (ehSistema) {
                return (
                  <div key={i} className="mensagem-sistema">
                    {msg.texto}
                  </div>
                );
              }

              return (
                <div key={i} className={`mensagem-wrapper ${ehMeu ? 'minha' : 'deles'}`}>
                  <div className={`mensagem ${ehMeu ? 'mensagem-minha' : 'mensagem-deles'}`}>
                    <p className="mensagem-texto">{msg.texto}</p>
                    <span className="mensagem-hora">{formatarDataHora(msg.dataHora)}</span>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Campo de texto */}
          {!chat.encerrado && !chatExpirado ? (
            <form className="chat-input-area" onSubmit={enviarMensagem} id="form-enviar-mensagem">
              <input
                type="text"
                id="campo-mensagem"
                className="form-input chat-input"
                placeholder="Digite sua mensagem..."
                value={mensagem}
                onChange={e => setMensagem(e.target.value)}
                autoComplete="off"
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!mensagem.trim()}
                id="btn-enviar-mensagem"
              >
                Enviar ✈️
              </button>
            </form>
          ) : (
            <div className="chat-encerrado-msg">
              {chat.encerrado ? '🔒 Chat encerrado.' : '⏰ Chat expirado.'}
            </div>
          )}
        </div>
      </div>

      {/* Modal de confirmação de encerramento */}
      <Modal
        aberto={modalEncerrar}
        onFechar={() => setModalEncerrar(false)}
        titulo="🔒 Encerrar Negociação"
        tamanho="sm"
      >
        <p style={{ marginBottom: 20 }}>
          Tem certeza que deseja encerrar esta negociação? Você será redirecionado para avaliar o outro usuário.
        </p>
        <div className="modal-acoes">
          <button className="btn btn-secondary" onClick={() => setModalEncerrar(false)}>
            Cancelar
          </button>
          <button className="btn btn-danger" onClick={encerrarNegociacao} id="btn-confirmar-encerrar">
            Encerrar e Avaliar
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default Chat;

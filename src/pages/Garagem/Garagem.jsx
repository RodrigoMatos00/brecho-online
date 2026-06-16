import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAnuncios, setAnuncios } from '../../utils/storage';
import { formatarVats, labelStatus, truncar } from '../../utils/helpers';
import Modal from '../../components/Modal/Modal';
import './Garagem.css';

const STATUS_ABAS = ['disponivel', 'negociacao', 'vendido'];
const LABELS_ABAS = {
  disponivel: '✅ Disponível',
  negociacao: '🤝 Em Negociação',
  vendido: '🏷 Trocado/Vendido',
};

/**
 * Garagem Virtual — lista os anúncios do usuário por status
 */
function Garagem() {
  const { userLogado } = useAuth();
  const navigate = useNavigate();
  const [aba, setAba] = useState('disponivel');
  const [anuncios, setAnunciosState] = useState([]);
  const [modalExcluir, setModalExcluir] = useState(null);
  const [sucesso, setSucesso] = useState('');

  const carregarAnuncios = useCallback(() => {
    const todos = getAnuncios();
    setAnunciosState(todos.filter(a => a.userId === userLogado?.id));
  }, [userLogado]);

  useEffect(() => {
    carregarAnuncios();
  }, [carregarAnuncios]);

  function excluirAnuncio(id) {
    const todos = getAnuncios();
    setAnuncios(todos.filter(a => a.id !== id));
    carregarAnuncios();
    setModalExcluir(null);
    setSucesso('✅ Anúncio excluído.');
    setTimeout(() => setSucesso(''), 3000);
  }

  function mudarStatus(id, novoStatus) {
    const todos = getAnuncios();
    const index = todos.findIndex(a => a.id === id);
    if (index !== -1) {
      todos[index].status = novoStatus;
      setAnuncios(todos);
      carregarAnuncios();
    }
  }

  const anunciosDaAba = anuncios.filter(a => a.status === aba);

  const contagens = {
    disponivel: anuncios.filter(a => a.status === 'disponivel').length,
    negociacao: anuncios.filter(a => a.status === 'negociacao').length,
    vendido: anuncios.filter(a => a.status === 'vendido').length,
  };

  return (
    <div className="garagem-page">
      <div className="container">
        <div className="page-wrapper">
          <div className="garagem-page-header">
            <div>
              <h1>Minha Garagem 🚗</h1>
              <p>Gerencie seus anúncios de roupas.</p>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/novo-anuncio')}
              id="btn-novo-anuncio"
            >
              + Novo Anúncio
            </button>
          </div>

          {sucesso && <div className="alert alert-success fade-in">{sucesso}</div>}

          {/* Abas */}
          <div className="tabs">
            {STATUS_ABAS.map(status => (
              <button
                key={status}
                className={`tab-btn ${aba === status ? 'active' : ''}`}
                onClick={() => setAba(status)}
                id={`tab-garagem-${status}`}
              >
                {LABELS_ABAS[status]} ({contagens[status]})
              </button>
            ))}
          </div>

          {/* Lista */}
          {anunciosDaAba.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👕</div>
              <h3>Nenhum item aqui</h3>
              <p>
                {aba === 'disponivel'
                  ? 'Adicione roupas para vender ou trocar.'
                  : `Nenhum item com status "${labelStatus(aba)}".`}
              </p>
              {aba === 'disponivel' && (
                <button className="btn btn-primary" onClick={() => navigate('/novo-anuncio')}>
                  Criar Primeiro Anúncio
                </button>
              )}
            </div>
          ) : (
            <div className="garagem-lista">
              {anunciosDaAba.map(anuncio => (
                <div key={anuncio.id} className="garagem-item card fade-in">
                  <div className="card-body">
                    <div className="garagem-item-content">
                      {/* Thumb */}
                      <div className="garagem-thumb">
                        <img
                          src={anuncio.foto || 'https://via.placeholder.com/80?text=?'}
                          alt={anuncio.titulo}
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/80?text=?'; }}
                        />
                      </div>

                      {/* Info */}
                      <div className="garagem-info">
                        <h3 className="garagem-titulo">{truncar(anuncio.titulo, 50)}</h3>
                        <div className="garagem-meta">
                          <span className="badge badge-gray">📦 {anuncio.categoria}</span>
                          <span className="badge badge-gray">📏 {anuncio.tamanho}</span>
                          <span className="badge badge-green">💰 {formatarVats(anuncio.valorVATs)}</span>
                          <span className="badge badge-gray">{anuncio.modalidade}</span>
                        </div>
                        <p className="garagem-conservacao">⬜ {anuncio.conservacao}</p>
                      </div>

                      {/* Ações */}
                      <div className="garagem-acoes">
                        {aba === 'disponivel' && (
                          <>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => navigate(`/editar-anuncio/${anuncio.id}`)}
                              id={`btn-editar-${anuncio.id}`}
                            >
                              ✏️ Editar
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => setModalExcluir(anuncio.id)}
                              id={`btn-excluir-${anuncio.id}`}
                            >
                              🗑 Excluir
                            </button>
                            <button
                              className="btn btn-warning btn-sm"
                              onClick={() => mudarStatus(anuncio.id, 'vendido')}
                              title="Marcar como vendido"
                            >
                              ✅ Marcar Vendido
                            </button>
                          </>
                        )}
                        {aba === 'negociacao' && (
                          <>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => mudarStatus(anuncio.id, 'disponivel')}
                            >
                              ↩ Disponibilizar
                            </button>
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => mudarStatus(anuncio.id, 'vendido')}
                            >
                              ✅ Marcar Vendido
                            </button>
                          </>
                        )}
                        {aba === 'vendido' && (
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => mudarStatus(anuncio.id, 'disponivel')}
                          >
                            ↩ Reativar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de confirmação de exclusão */}
      <Modal
        aberto={!!modalExcluir}
        onFechar={() => setModalExcluir(null)}
        titulo="🗑 Excluir Anúncio"
        tamanho="sm"
      >
        <p style={{ marginBottom: 20 }}>
          Tem certeza que deseja excluir este anúncio? Esta ação não pode ser desfeita.
        </p>
        <div className="modal-acoes">
          <button className="btn btn-secondary" onClick={() => setModalExcluir(null)}>Cancelar</button>
          <button className="btn btn-danger" onClick={() => excluirAnuncio(modalExcluir)} id="btn-confirmar-excluir">
            Excluir
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default Garagem;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../brecho-online - Copia/src/context/AuthContext';
import {
  getAnuncioById, getUserById, getAnuncios,
  getPropostas, setPropostas,
} from '../../../../brecho-online - Copia/src/utils/storage';
import {
  gerarId, formatarData, formatarVats,
  diferencaPercent, iniciais,
} from '../../../../brecho-online - Copia/src/utils/helpers';
import StarRating from '../../../../brecho-online - Copia/src/components/StarRating/StarRating';
import Badge from '../../../../brecho-online - Copia/src/components/Badge/Badge';
import Modal from '../../../../brecho-online - Copia/src/components/Modal/Modal';
import './DetalheAnuncio.css';

/**
 * Página de detalhe de um anúncio com opções de proposta de compra e troca
 */
function DetalheAnuncio() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userLogado } = useAuth();

  const [anuncio, setAnuncio] = useState(null);
  const [vendedor, setVendedor] = useState(null);
  const [modalCompra, setModalCompra] = useState(false);
  const [modalTroca, setModalTroca] = useState(false);
  const [sucesso, setSucesso] = useState('');
  const [erro, setErro] = useState('');
  const [propostaExistente, setPropostaExistente] = useState(false);

  // Formulário de compra
  const [valorOfertado, setValorOfertado] = useState('');

  // Formulário de troca
  const [meusAnuncios, setMeusAnuncios] = useState([]);
  const [pecasSelecionadas, setPecasSelecionadas] = useState([]);
  const [diferencaVATs, setDiferencaVATs] = useState('');
  const [avisoTroca, setAvisoTroca] = useState('');

  useEffect(() => {
    const a = getAnuncioById(id);
    if (!a) {
      navigate('/explorar');
      return;
    }
    setAnuncio(a);
    setVendedor(getUserById(a.userId));

    // Carrega anúncios do comprador (excluindo o que está sendo visto)
    const todos = getAnuncios();
    const meus = todos.filter(
      an => an.userId === userLogado?.id && an.status === 'disponivel' && an.id !== id
    );
    setMeusAnuncios(meus);

    // Verifica se já existe proposta ativa deste comprador para este anúncio
    const propostas = getPropostas();
    const jaTemProposta = propostas.some(
      p => p.anuncioId === id && p.compradorId === userLogado?.id
        && ['pendente', 'aceita', 'contrapropostaEnviada'].includes(p.status)
    );
    setPropostaExistente(jaTemProposta);
  }, [id, userLogado, navigate]);

  // Recalcula aviso de diferença de VATs ao mudar seleção
  useEffect(() => {
    if (!anuncio) return;
    const valorPecas = pecasSelecionadas.reduce((sum, pid) => {
      const p = meusAnuncios.find(a => a.id === pid);
      return sum + (p?.valorVATs || 0);
    }, 0);
    const totalOferta = valorPecas + Number(diferencaVATs || 0);
    const diff = diferencaPercent(totalOferta, anuncio.valorVATs);

    if (pecasSelecionadas.length > 0 && diff > 20) {
      setAvisoTroca(`⚠️ Diferença de ${diff.toFixed(0)}% entre os valores (${formatarVats(totalOferta)} vs ${formatarVats(anuncio.valorVATs)}). Considere ajustar as peças ou adicionar VATs.`);
    } else {
      setAvisoTroca('');
    }
  }, [pecasSelecionadas, diferencaVATs, anuncio, meusAnuncios]);

  // ---- Proposta de Compra ----
  function enviarPropostaCompra(e) {
    e.preventDefault();
    setErro('');
    const val = Number(valorOfertado);
    if (!val || val <= 0) {
      setErro('Informe um valor válido.');
      return;
    }
    if (val > anuncio.valorVATs) {
      setErro(`O valor não pode ultrapassar ${formatarVats(anuncio.valorVATs)}.`);
      return;
    }
    if (val > (userLogado?.vats || 0)) {
      setErro(`Saldo insuficiente. Você tem ${formatarVats(userLogado?.vats || 0)}.`);
      return;
    }

    const proposta = {
      id: gerarId(),
      anuncioId: anuncio.id,
      compradorId: userLogado.id,
      vendedorId: anuncio.userId,
      tipo: 'venda',
      valorOfertado: val,
      pecasOfertadas: [],
      diferencaVATs: 0,
      status: 'pendente',
      historico: [],
      dataCriacao: new Date().toISOString(),
    };

    const propostas = getPropostas();
    setPropostas([...propostas, proposta]);
    setModalCompra(false);
    setSucesso('✅ Proposta de compra enviada! Aguarde a resposta do vendedor.');
    setValorOfertado('');
    setPropostaExistente(true);
  }

  // ---- Proposta de Troca ----
  function togglePeca(pecaId) {
    setPecasSelecionadas(prev => {
      if (prev.includes(pecaId)) {
        return prev.filter(p => p !== pecaId);
      }
      if (prev.length >= 5) {
        setErro('Você pode selecionar no máximo 5 peças.');
        return prev;
      }
      setErro('');
      return [...prev, pecaId];
    });
  }

  function enviarPropostaTroca(e) {
    e.preventDefault();
    setErro('');
    if (pecasSelecionadas.length === 0) {
      setErro('Selecione pelo menos 1 peça para trocar.');
      return;
    }

    const proposta = {
      id: gerarId(),
      anuncioId: anuncio.id,
      compradorId: userLogado.id,
      vendedorId: anuncio.userId,
      tipo: 'troca',
      valorOfertado: 0,
      pecasOfertadas: pecasSelecionadas,
      diferencaVATs: Number(diferencaVATs || 0),
      status: 'pendente',
      historico: [],
      dataCriacao: new Date().toISOString(),
    };

    const propostas = getPropostas();
    setPropostas([...propostas, proposta]);
    setModalTroca(false);
    setSucesso('✅ Proposta de troca enviada! Aguarde a resposta do vendedor.');
    setPecasSelecionadas([]);
    setDiferencaVATs('');
    setPropostaExistente(true);
  }

  if (!anuncio || !vendedor) {
    return <div className="loading-spinner"><div className="spinner" /></div>;
  }

  const ehMeuAnuncio = anuncio.userId === userLogado?.id;
  const podeComprar = (anuncio.modalidade === 'Venda' || anuncio.modalidade === 'Ambos') && !ehMeuAnuncio;
  const podeTrocar = (anuncio.modalidade === 'Troca' || anuncio.modalidade === 'Ambos') && !ehMeuAnuncio;

  const conservacaoCor = {
    Novo: '🟢', Bom: '🟡', Regular: '🟠', 'Marcas de uso': '🔴'
  };

  return (
    <div className="detalhe-page">
      <div className="container">
        <div className="page-wrapper">
          {/* Botão voltar */}
          <button
            className="btn btn-secondary btn-sm voltar-btn"
            onClick={() => navigate(-1)}
          >
            ← Voltar
          </button>

          {sucesso && (
            <div className="alert alert-success fade-in">{sucesso}</div>
          )}

          <div className="detalhe-grid">
            {/* Foto */}
            <div className="detalhe-foto-col">
              <div className="detalhe-foto">
                <img
                  src={anuncio.foto || 'https://via.placeholder.com/600x500?text=Sem+foto'}
                  alt={anuncio.titulo}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/600x500?text=Sem+foto';
                  }}
                />
                {anuncio.status !== 'disponivel' && (
                  <div className="status-overlay">
                    {anuncio.status === 'negociacao' ? '🤝 Em Negociação' : '✅ Vendido'}
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="detalhe-info-col">
              <div className="detalhe-badges">
                <span className={`badge ${anuncio.modalidade === 'Venda' ? 'badge-info' : anuncio.modalidade === 'Troca' ? 'badge-brown' : 'badge-green'}`}>
                  {anuncio.modalidade === 'Ambos' ? '🔄 Venda/Troca' :
                   anuncio.modalidade === 'Venda' ? '🛒 Venda' : '🔁 Troca'}
                </span>
                <span className="badge badge-gray">📦 {anuncio.categoria}</span>
                <span className="badge badge-gray">📏 Tam. {anuncio.tamanho}</span>
              </div>

              <h1 className="detalhe-titulo">{anuncio.titulo}</h1>

              <div className="detalhe-preco">
                <span className="preco-label">💰</span>
                <span className="preco-valor">{formatarVats(anuncio.valorVATs)}</span>
              </div>

              <div className="detalhe-conservacao">
                <span>{conservacaoCor[anuncio.conservacao]} Estado: </span>
                <strong>{anuncio.conservacao}</strong>
              </div>

              <div className="detalhe-descricao">
                <h3>Descrição</h3>
                <p>{anuncio.descricao}</p>
              </div>

              <p className="detalhe-data">
                Publicado em {formatarData(anuncio.dataCriacao)}
              </p>

              <div className="divider" />

              {/* Perfil do Vendedor */}
              <div className="vendedor-card">
                <h3>Vendedor</h3>
                <div className="vendedor-info">
                  {vendedor.avatar ? (
                    <img
                      src={vendedor.avatar}
                      alt={vendedor.nome}
                      className="vendedor-avatar"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <div className="vendedor-avatar-placeholder">
                      {iniciais(vendedor.nome)}
                    </div>
                  )}
                  <div>
                    <div className="vendedor-nome">
                      {vendedor.nome}
                      <Badge usuario={vendedor} mostrarLabel />
                    </div>
                    <div className="vendedor-estrelas">
                      <StarRating valor={vendedor.mediaEstrelas} readonly tamanho="sm" />
                      <span className="estrelas-texto">
                        {vendedor.mediaEstrelas > 0
                          ? `${vendedor.mediaEstrelas}/10`
                          : 'Sem avaliações'}
                      </span>
                    </div>
                    <p className="vendedor-negociacoes">
                      🤝 {vendedor.totalNegociacoes} negociação{vendedor.totalNegociacoes !== 1 ? 'ões' : ''}
                    </p>
                  </div>
                </div>
              </div>

              {/* Ações */}
              {ehMeuAnuncio ? (
                <div className="alert alert-info">
                  Este é o seu anúncio. <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/editar-anuncio/${anuncio.id}`)}>✏️ Editar</button>
                </div>
              ) : anuncio.status !== 'disponivel' ? (
                <div className="alert alert-warning">
                  Este anúncio não está mais disponível.
                </div>
              ) : propostaExistente ? (
                <div className="alert alert-success">
                  ✅ Você já enviou uma proposta para este anúncio. Acompanhe em <button className="btn btn-primary btn-sm" onClick={() => navigate('/negociacoes')}>Negociações</button>
                </div>
              ) : (
                <div className="detalhe-acoes">
                  {podeComprar && (
                    <button
                      className="btn btn-primary btn-lg"
                      onClick={() => { setModalCompra(true); setErro(''); setSucesso(''); }}
                      id="btn-proposta-compra"
                    >
                      🛒 Fazer Proposta de Compra
                    </button>
                  )}
                  {podeTrocar && (
                    <button
                      className="btn btn-outline btn-lg"
                      onClick={() => { setModalTroca(true); setErro(''); setSucesso(''); }}
                      id="btn-proposta-troca"
                    >
                      🔁 Fazer Proposta de Troca
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Compra */}
      <Modal
        aberto={modalCompra}
        onFechar={() => { setModalCompra(false); setErro(''); }}
        titulo="💰 Proposta de Compra"
      >
        <form onSubmit={enviarPropostaCompra} id="form-proposta-compra">
          <div className="alert alert-info">
            O vendedor pediu <strong>{formatarVats(anuncio.valorVATs)}</strong>.
            Oferte um valor igual ou menor.
          </div>

          {erro && <div className="alert alert-danger">{erro}</div>}

          <div className="form-group">
            <label className="form-label" htmlFor="valor-ofertado">
              Valor ofertado (VATs) <span className="required">*</span>
            </label>
            <input
              id="valor-ofertado"
              type="number"
              className="form-input"
              min="1"
              max={anuncio.valorVATs}
              value={valorOfertado}
              onChange={e => setValorOfertado(e.target.value)}
              placeholder={`Máx: ${anuncio.valorVATs} VATs`}
              required
            />
            <span className="form-hint">
              Seu saldo atual: {userLogado?.vats || 0} VATs
            </span>
          </div>

          <div className="modal-acoes">
            <button type="button" className="btn btn-secondary" onClick={() => setModalCompra(false)}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" id="btn-confirmar-compra">
              Enviar Proposta
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal de Troca */}
      <Modal
        aberto={modalTroca}
        onFechar={() => { setModalTroca(false); setErro(''); setPecasSelecionadas([]); }}
        titulo="🔁 Proposta de Troca"
        tamanho="lg"
      >
        <form onSubmit={enviarPropostaTroca} id="form-proposta-troca">
          <div className="alert alert-info">
            Selecione de 1 a 5 peças dos seus anúncios para trocar por
            <strong> {anuncio.titulo}</strong> ({formatarVats(anuncio.valorVATs)}).
          </div>

          {avisoTroca && <div className="alert alert-warning">{avisoTroca}</div>}
          {erro && <div className="alert alert-danger">{erro}</div>}

          {meusAnuncios.length === 0 ? (
            <div className="alert alert-warning">
              Você não tem anúncios disponíveis para troca.
            </div>
          ) : (
            <div className="troca-pecas-grid">
              {meusAnuncios.map(peca => (
                <div
                  key={peca.id}
                  className={`troca-peca ${pecasSelecionadas.includes(peca.id) ? 'selecionada' : ''}`}
                  onClick={() => togglePeca(peca.id)}
                  role="checkbox"
                  aria-checked={pecasSelecionadas.includes(peca.id)}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && togglePeca(peca.id)}
                >
                  <img
                    src={peca.foto || 'https://via.placeholder.com/80?text=Sem+foto'}
                    alt={peca.titulo}
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/80?text=?'; }}
                  />
                  <div className="troca-peca-info">
                    <p className="troca-peca-titulo">{peca.titulo}</p>
                    <p className="troca-peca-vats">{formatarVats(peca.valorVATs)}</p>
                  </div>
                  {pecasSelecionadas.includes(peca.id) && (
                    <div className="troca-check">✓</div>
                  )}
                </div>
              ))}
            </div>
          )}

          {pecasSelecionadas.length > 0 && (
            <div className="troca-resumo">
              <p>
                <strong>Selecionadas:</strong> {pecasSelecionadas.length} peça{pecasSelecionadas.length > 1 ? 's' : ''}
                {' '}({formatarVats(meusAnuncios
                  .filter(a => pecasSelecionadas.includes(a.id))
                  .reduce((s, a) => s + a.valorVATs, 0))})
              </p>
            </div>
          )}

          <div className="form-group" style={{ marginTop: 16 }}>
            <label className="form-label" htmlFor="diferenca-vats">
              Adicionar diferença em VATs (opcional)
            </label>
            <input
              id="diferenca-vats"
              type="number"
              className="form-input"
              min="0"
              value={diferencaVATs}
              onChange={e => setDiferencaVATs(e.target.value)}
              placeholder="0"
            />
            <span className="form-hint">
              Se as peças não cobrirem o valor total, adicione VATs para compensar.
            </span>
          </div>

          <div className="modal-acoes">
            <button type="button" className="btn btn-secondary" onClick={() => { setModalTroca(false); setPecasSelecionadas([]); }}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" id="btn-confirmar-troca" disabled={meusAnuncios.length === 0}>
              Enviar Proposta de Troca
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default DetalheAnuncio;

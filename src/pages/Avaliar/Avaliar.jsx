import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  getPropostaById, getUserById, getAvaliacoes, setAvaliacoes,
  recalcularEstrelas,
} from '../../utils/storage';
import { gerarId, iniciais } from '../../utils/helpers';
import StarRating from '../../components/StarRating/StarRating';
import './Avaliar.css';

/**
 * Página de avaliação pós-negociação.
 * Ambos os usuários (comprador e vendedor) avaliam um ao outro.
 */
function Avaliar() {
  const { propostaId } = useParams();
  const { userLogado, atualizarUserLogado } = useAuth();
  const navigate = useNavigate();

  const [proposta, setProposta] = useState(null);
  const [avaliadoId, setAvaliadoId] = useState(null);
  const [avaliado, setAvaliado] = useState(null);
  const [jaAvaliou, setJaAvaliou] = useState(false);
  const [estrelas, setEstrelas] = useState(0);
  const [comentario, setComentario] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    const p = getPropostaById(propostaId);
    if (!p) {
      navigate('/negociacoes');
      return;
    }
    setProposta(p);

    // Determina quem vai ser avaliado
    const outraId = p.vendedorId === userLogado?.id ? p.compradorId : p.vendedorId;
    setAvaliadoId(outraId);
    setAvaliado(getUserById(outraId));

    // Verifica se já avaliou
    const avaliacoes = getAvaliacoes();
    const jaFez = avaliacoes.find(
      a => a.propostaId === propostaId && a.avaliadorId === userLogado?.id
    );
    setJaAvaliou(!!jaFez);
  }, [propostaId, userLogado, navigate]);

  function salvarAvaliacao(e) {
    e.preventDefault();
    setErro('');
    if (estrelas === 0) {
      setErro('Selecione pelo menos 1 estrela.');
      return;
    }

    const novaAvaliacao = {
      id: gerarId(),
      propostaId,
      avaliadorId: userLogado.id,
      avaliadoId,
      estrelas,
      comentario: comentario.trim(),
      data: new Date().toISOString(),
    };

    const avaliacoes = getAvaliacoes();
    setAvaliacoes([...avaliacoes, novaAvaliacao]);

    // Recalcula a média do avaliado
    recalcularEstrelas(avaliadoId);
    // Recalcula o total de negociações do avaliador também
    recalcularEstrelas(userLogado.id);

    // Atualiza o userLogado no contexto com dados frescos
    atualizarUserLogado(getUserById(userLogado.id));

    setSucesso(true);
  }

  if (!proposta || !avaliado) {
    return <div className="loading-spinner"><div className="spinner" /></div>;
  }

  return (
    <div className="avaliar-page">
      <div className="container">
        <div className="page-wrapper">
          <div className="avaliar-container">
            <div className="avaliar-card card">
              <div className="card-body">
                <div className="avaliar-icon">⭐</div>
                <h1 className="avaliar-titulo">Avaliar Negociação</h1>
                <p className="avaliar-subtitulo">
                  Como foi sua experiência com <strong>{avaliado.nome}</strong>?
                </p>

                {/* Avatar do avaliado */}
                <div className="avaliado-perfil">
                  {avaliado.avatar ? (
                    <img
                      src={avaliado.avatar}
                      alt={avaliado.nome}
                      className="avaliado-avatar"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <div className="avaliado-avatar-placeholder">
                      {iniciais(avaliado.nome)}
                    </div>
                  )}
                  <p className="avaliado-nome">{avaliado.nome}</p>
                </div>

                {jaAvaliou ? (
                  <div className="ja-avaliado">
                    <div className="ja-avaliado-icon">✅</div>
                    <h3>Você já avaliou esta negociação!</h3>
                    <p>Obrigado por contribuir com a comunidade.</p>
                    <div className="avaliar-acoes">
                      <button className="btn btn-primary" onClick={() => navigate('/explorar')}>
                        Explorar Mais Anúncios
                      </button>
                      <button className="btn btn-secondary" onClick={() => navigate('/negociacoes')}>
                        Ver Negociações
                      </button>
                    </div>
                  </div>
                ) : sucesso ? (
                  <div className="ja-avaliado">
                    <div className="ja-avaliado-icon">🎉</div>
                    <h3>Avaliação enviada!</h3>
                    <p>Sua avaliação foi registrada com sucesso. Obrigado!</p>
                    <div className="avaliar-acoes">
                      <button className="btn btn-primary" onClick={() => navigate('/explorar')}>
                        Explorar Mais Anúncios
                      </button>
                      <button className="btn btn-secondary" onClick={() => navigate('/negociacoes')}>
                        Ver Negociações
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={salvarAvaliacao} id="form-avaliacao">
                    {erro && <div className="alert alert-danger">{erro}</div>}

                    <div className="avaliar-estrelas">
                      <label className="form-label">
                        Nota (1 a 10) <span className="required">*</span>
                      </label>
                      <StarRating
                        valor={estrelas}
                        onChange={setEstrelas}
                        tamanho="lg"
                      />
                      {estrelas > 0 && (
                        <p className="estrelas-descricao">
                          {estrelas >= 9 ? '😍 Excelente!' :
                           estrelas >= 7 ? '😊 Bom!' :
                           estrelas >= 5 ? '😐 Regular' :
                           '😕 Ruim'}
                        </p>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="comentario-avaliacao">
                        Comentário (opcional)
                      </label>
                      <textarea
                        id="comentario-avaliacao"
                        className="form-textarea"
                        placeholder="Conte como foi a negociação..."
                        value={comentario}
                        onChange={e => setComentario(e.target.value)}
                        maxLength={300}
                        rows={4}
                      />
                      <span className="form-hint">{comentario.length}/300 caracteres</span>
                    </div>

                    <div className="avaliar-acoes">
                      <button type="button" className="btn btn-secondary" onClick={() => navigate('/negociacoes')}>
                        Pular
                      </button>
                      <button type="submit" className="btn btn-primary btn-lg" id="btn-enviar-avaliacao">
                        Enviar Avaliação ⭐
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Avaliar;

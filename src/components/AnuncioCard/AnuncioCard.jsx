import React from 'react';
import { Link } from 'react-router-dom';
import { iniciais, truncar, formatarVats } from '../../utils/helpers';
import StarRating from '../StarRating/StarRating';
import Badge from '../Badge/Badge';
import './AnuncioCard.css';

/**
 * Card de anúncio para exibição na listagem
 * Exibe: foto, info do anúncio, vendedor, estrelas
 */
function AnuncioCard({ anuncio, vendedor }) {
  const modalidadeBadge = {
    Venda: 'badge-info',
    Troca: 'badge-brown',
    Ambos: 'badge-green',
  };

  const conservacaoCor = {
    Novo: 'badge-green',
    Bom: 'badge-green',
    Regular: 'badge-warning',
    'Marcas de uso': 'badge-gray',
  };

  return (
    <Link to={`/anuncio/${anuncio.id}`} className="anuncio-card card card-clickable fade-in" aria-label={`Ver anúncio: ${anuncio.titulo}`}>
      {/* Foto */}
      <div className="anuncio-card-foto">
        <img
          src={anuncio.foto || 'https://via.placeholder.com/400x300?text=Sem+foto'}
          alt={anuncio.titulo}
          loading="lazy"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/400x300?text=Sem+foto';
          }}
        />
        <div className="anuncio-card-badges">
          <span className={`badge ${modalidadeBadge[anuncio.modalidade] || 'badge-gray'}`}>
            {anuncio.modalidade === 'Ambos' ? '🔄 Venda/Troca' :
             anuncio.modalidade === 'Venda' ? '🛒 Venda' : '🔁 Troca'}
          </span>
        </div>
        <div className="anuncio-card-vats">
          💰 {formatarVats(anuncio.valorVATs)}
        </div>
      </div>

      {/* Conteúdo */}
      <div className="anuncio-card-body">
        <h3 className="anuncio-card-titulo">{truncar(anuncio.titulo, 45)}</h3>

        <div className="anuncio-card-tags">
          <span className="tag-categoria">📦 {anuncio.categoria}</span>
          <span className="tag-tamanho">📏 {anuncio.tamanho}</span>
          <span className={`badge ${conservacaoCor[anuncio.conservacao] || 'badge-gray'}`} style={{ fontSize: '0.7rem' }}>
            {anuncio.conservacao}
          </span>
        </div>

        {/* Vendedor */}
        {vendedor && (
          <div className="anuncio-card-vendedor">
            <div className="user-mini">
              {vendedor.avatar ? (
                <img
                  src={vendedor.avatar}
                  alt={vendedor.nome}
                  className="avatar"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <div className="avatar-placeholder">
                  {iniciais(vendedor.nome)}
                </div>
              )}
              <div>
                <span className="user-name">{vendedor.nome}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <StarRating valor={vendedor.mediaEstrelas} readonly tamanho="sm" />
                  <Badge usuario={vendedor} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}

export default AnuncioCard;

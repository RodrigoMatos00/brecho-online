import React from 'react';
import './StarRating.css';

/**
 * Componente de estrelas 1-10
 * Modo readonly: exibe estrelas preenchidas/vazias
 * Modo interativo: clique para selecionar valor
 */
function StarRating({ valor = 0, onChange, readonly = false, tamanho = 'md', max = 10 }) {
  const estrelasCheia = Math.round(valor);

  function handleClick(estrela) {
    if (!readonly && onChange) {
      onChange(estrela);
    }
  }

  return (
    <div
      className={`star-rating star-rating-${tamanho} ${readonly ? 'readonly' : 'interactive'}`}
      role={readonly ? 'img' : 'group'}
      aria-label={`${valor} de ${max} estrelas`}
    >
      {Array.from({ length: max }, (_, i) => i + 1).map((estrela) => (
        <button
          key={estrela}
          type="button"
          className={`star ${estrela <= estrelasCheia ? 'filled' : 'empty'}`}
          onClick={() => handleClick(estrela)}
          disabled={readonly}
          aria-label={`${estrela} estrela${estrela > 1 ? 's' : ''}`}
        >
          {estrela <= estrelasCheia ? '⭐' : '☆'}
        </button>
      ))}
      {!readonly && (
        <span className="star-value">
          {valor > 0 ? `${valor}/${max}` : `Selecione`}
        </span>
      )}
    </div>
  );
}

export default StarRating;

import React, { useEffect } from 'react';
import './Modal.css';

/**
 * Modal genérico com overlay
 * Fecha ao pressionar ESC ou clicar no overlay
 */
function Modal({ aberto, onFechar, titulo, children, tamanho = 'md' }) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && aberto) onFechar();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [aberto, onFechar]);

  useEffect(() => {
    if (aberto) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [aberto]);

  if (!aberto) return null;

  return (
    <div className="modal-overlay" onClick={onFechar} role="dialog" aria-modal="true" aria-label={titulo}>
      <div
        className={`modal-content modal-${tamanho} scale-in`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="modal-titulo">{titulo}</h2>
          <button
            className="modal-fechar"
            onClick={onFechar}
            aria-label="Fechar modal"
          >
            ✕
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Modal;

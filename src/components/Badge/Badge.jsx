import React from 'react';
import { calcularSelo } from '../../utils/helpers';
import './Badge.css';

/**
 * Selo de confiabilidade do usuário
 * Bronze: 5+ negociações
 * Prata: 10+ negociações
 * Ouro: 20+ negociações e média >= 8
 */
function Badge({ usuario, mostrarLabel = false }) {
  if (!usuario) return null;

  const selo = calcularSelo(usuario.totalNegociacoes, usuario.mediaEstrelas);
  if (!selo) return null;

  const config = {
    bronze: { emoji: '🥉', label: 'Bronze', classe: 'badge-bronze' },
    prata: { emoji: '🥈', label: 'Prata', classe: 'badge-prata' },
    ouro: { emoji: '🥇', label: 'Ouro', classe: 'badge-ouro' },
  };

  const { emoji, label, classe } = config[selo];

  return (
    <span className={`trust-badge ${classe}`} title={`Selo ${label}`}>
      {emoji}
      {mostrarLabel && <span className="badge-label">{label}</span>}
    </span>
  );
}

export default Badge;

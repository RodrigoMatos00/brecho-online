// ============================================
// Funções auxiliares gerais
// ============================================

/**
 * Gera um ID único usando timestamp + número aleatório
 */
export function gerarId() {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Formata uma data ISO para exibição em pt-BR
 */
export function formatarData(isoString, opcoes = {}) {
  if (!isoString) return '';
  try {
    const data = new Date(isoString);
    const padrao = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      ...opcoes,
    };
    return data.toLocaleDateString('pt-BR', padrao);
  } catch {
    return isoString;
  }
}

/**
 * Formata data + hora
 */
export function formatarDataHora(isoString) {
  if (!isoString) return '';
  try {
    const data = new Date(isoString);
    return data.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

/**
 * Retorna "há X tempo" de forma relativa
 */
export function tempoRelativo(isoString) {
  if (!isoString) return '';
  const agora = new Date();
  const data = new Date(isoString);
  const diffMs = agora - data;
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMin / 60);
  const diffD = Math.floor(diffH / 24);

  if (diffMin < 1) return 'agora mesmo';
  if (diffMin < 60) return `há ${diffMin} min`;
  if (diffH < 24) return `há ${diffH}h`;
  if (diffD < 7) return `há ${diffD} dia${diffD > 1 ? 's' : ''}`;
  return formatarData(isoString);
}

/**
 * Adiciona X dias a uma data ISO e retorna nova data ISO
 */
export function adicionarDias(isoString, dias) {
  const data = new Date(isoString);
  data.setDate(data.getDate() + dias);
  return data.toISOString();
}

/**
 * Verifica se uma data já passou (expirou)
 */
export function estaExpirado(isoString) {
  if (!isoString) return false;
  return new Date(isoString) < new Date();
}

/**
 * Calcula a diferença percentual entre dois valores
 */
export function diferencaPercent(v1, v2) {
  if (v1 === 0 && v2 === 0) return 0;
  const maior = Math.max(v1, v2);
  const menor = Math.min(v1, v2);
  return ((maior - menor) / maior) * 100;
}

/**
 * Trunca texto ao comprimento máximo
 */
export function truncar(texto, max = 120) {
  if (!texto) return '';
  if (texto.length <= max) return texto;
  return texto.slice(0, max).trimEnd() + '…';
}

/**
 * Retorna as iniciais de um nome (até 2 caracteres)
 */
export function iniciais(nome = '') {
  const partes = nome.trim().split(' ').filter(Boolean);
  if (partes.length === 0) return '?';
  if (partes.length === 1) return partes[0][0].toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

/**
 * Determina o selo de confiabilidade do usuário
 * Ouro: 20+ negociações e média >= 8
 * Prata: 10+ negociações
 * Bronze: 5+ negociações
 */
export function calcularSelo(totalNegociacoes = 0, mediaEstrelas = 0) {
  if (totalNegociacoes >= 20 && mediaEstrelas >= 8) return 'ouro';
  if (totalNegociacoes >= 10) return 'prata';
  if (totalNegociacoes >= 5) return 'bronze';
  return null;
}

/**
 * Retorna label amigável para o status de um anúncio
 */
export function labelStatus(status) {
  const labels = {
    disponivel: 'Disponível',
    negociacao: 'Em Negociação',
    vendido: 'Trocado/Vendido',
  };
  return labels[status] || status;
}

/**
 * Retorna label amigável para o status de uma proposta
 */
export function labelStatusProposta(status) {
  const labels = {
    pendente: 'Pendente',
    aceita: 'Aceita',
    recusada: 'Recusada',
    contrapropostaEnviada: 'Contraproposta',
    encerrada: 'Encerrada',
  };
  return labels[status] || status;
}

/**
 * Retorna a classe CSS para o badge de status de proposta
 */
export function classBadgeProposta(status) {
  const classes = {
    pendente: 'badge-warning',
    aceita: 'badge-green',
    recusada: 'badge-danger',
    contrapropostaEnviada: 'badge-info',
    encerrada: 'badge-gray',
  };
  return classes[status] || 'badge-gray';
}

/**
 * Converte reais em VATs (1 real = 1 VAT)
 */
export function reaisParaVats(reais) {
  return Math.floor(Number(reais));
}

/**
 * Formata valor de VATs para exibição
 */
export function formatarVats(valor) {
  return `${Number(valor).toFixed(0)} VATs`;
}

/**
 * Filtra e ordena anúncios com base nos filtros aplicados
 */
export function filtrarAnuncios(anuncios, filtros) {
  let resultado = [...anuncios].filter(a => a.status === 'disponivel');

  if (filtros.busca) {
    const busca = filtros.busca.toLowerCase();
    resultado = resultado.filter(
      a =>
        a.titulo.toLowerCase().includes(busca) ||
        a.descricao.toLowerCase().includes(busca)
    );
  }

  if (filtros.categoria) {
    resultado = resultado.filter(a => a.categoria === filtros.categoria);
  }

  if (filtros.tamanho) {
    resultado = resultado.filter(a => a.tamanho === filtros.tamanho);
  }

  if (filtros.modalidade) {
    resultado = resultado.filter(a => a.modalidade === filtros.modalidade);
  }

  if (filtros.vatMin !== '' && filtros.vatMin !== undefined) {
    resultado = resultado.filter(a => a.valorVATs >= Number(filtros.vatMin));
  }

  if (filtros.vatMax !== '' && filtros.vatMax !== undefined) {
    resultado = resultado.filter(a => a.valorVATs <= Number(filtros.vatMax));
  }

  // Ordenação
  if (filtros.ordenacao === 'menorPreco') {
    resultado.sort((a, b) => a.valorVATs - b.valorVATs);
  } else if (filtros.ordenacao === 'maiorPreco') {
    resultado.sort((a, b) => b.valorVATs - a.valorVATs);
  } else {
    // Mais recente (padrão)
    resultado.sort((a, b) => new Date(b.dataCriacao) - new Date(a.dataCriacao));
  }

  return resultado;
}

import React from 'react';
import './VATsChart.css';

/**
 * Gráfico de barras simples mostrando o histórico de VATs do usuário.
 * Exibe os últimos 10 registros do histórico.
 */
function VATsChart({ historico = [] }) {
  if (!historico || historico.length === 0) {
    return (
      <div className="vats-chart-empty">
        <p>📊 Nenhuma movimentação de VATs ainda.</p>
      </div>
    );
  }

  const ultimos = historico.slice(-10);
  const maxValor = Math.max(...ultimos.map(h => Math.abs(h.valor)), 1);

  return (
    <div className="vats-chart">
      <div className="chart-bars">
        {ultimos.map((item, i) => {
          const altura = (Math.abs(item.valor) / maxValor) * 100;
          const positivo = item.valor >= 0;

          return (
            <div key={i} className="chart-bar-wrapper" title={`${item.descricao}: ${item.valor > 0 ? '+' : ''}${item.valor} VATs`}>
              <div
                className={`chart-bar ${positivo ? 'positivo' : 'negativo'}`}
                style={{ height: `${Math.max(altura, 6)}%` }}
              />
              <span className="chart-label">
                {item.valor > 0 ? '+' : ''}{item.valor}
              </span>
            </div>
          );
        })}
      </div>
      <div className="chart-legend">
        <span className="legend-item positivo">🟢 Entradas</span>
        <span className="legend-item negativo">🔴 Saídas</span>
      </div>
    </div>
  );
}

export default VATsChart;

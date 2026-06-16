import React, { useState, useMemo } from 'react';
import { getAnuncios, getUsers } from '../../utils/storage';
import { filtrarAnuncios } from '../../utils/helpers';
import AnuncioCard from '../../components/AnuncioCard/AnuncioCard';
import './Explorar.css';

const CATEGORIAS = ['Camisa', 'Calça', 'Calçado', 'Acessório', 'Vestido', 'Bermuda', 'Casaco', 'Outro'];
const TAMANHOS = ['PP', 'P', 'M', 'G', 'GG'];
const MODALIDADES = ['Venda', 'Troca', 'Ambos'];

/**
 * Página de exploração de anúncios com filtros, busca e ordenação
 */
function Explorar() {
  const [filtros, setFiltros] = useState({
    busca: '',
    categoria: '',
    tamanho: '',
    modalidade: '',
    vatMin: '',
    vatMax: '',
    ordenacao: 'recente',
  });

  const [filtrosAbertos, setFiltrosAbertos] = useState(false);

  // Lê dados do localStorage e processa
  const { anunciosFiltrados, totalAnuncios } = useMemo(() => {
    const anuncios = getAnuncios();
    const users = getUsers();
    const filtrados = filtrarAnuncios(anuncios, filtros);

    // Adiciona info do vendedor em cada anúncio
    const comVendedor = filtrados.map(a => ({
      anuncio: a,
      vendedor: users.find(u => u.id === a.userId) || null,
    }));

    return {
      anunciosFiltrados: comVendedor,
      totalAnuncios: anuncios.filter(a => a.status === 'disponivel').length,
    };
  }, [filtros]);

  function atualizarFiltro(campo, valor) {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
  }

  function limparFiltros() {
    setFiltros({
      busca: '',
      categoria: '',
      tamanho: '',
      modalidade: '',
      vatMin: '',
      vatMax: '',
      ordenacao: 'recente',
    });
  }

  const temFiltrosAtivos = filtros.categoria || filtros.tamanho || filtros.modalidade ||
    filtros.vatMin || filtros.vatMax;

  return (
    <div className="explorar-page">
      <div className="container">
        <div className="page-wrapper">
          {/* Header */}
          <div className="explorar-header">
            <div>
              <h1>Explorar Anúncios 🔍</h1>
              <p>{totalAnuncios} item{totalAnuncios !== 1 ? 'ns' : ''} disponíve{totalAnuncios !== 1 ? 'is' : 'l'}</p>
            </div>
          </div>

          {/* Barra de busca + ordenação */}
          <div className="explorar-toolbar">
            <div className="busca-wrapper">
              <span className="busca-icon">🔍</span>
              <input
                id="busca-anuncios"
                type="search"
                className="busca-input"
                placeholder="Buscar por título ou descrição..."
                value={filtros.busca}
                onChange={e => atualizarFiltro('busca', e.target.value)}
                aria-label="Buscar anúncios"
              />
              {filtros.busca && (
                <button
                  className="busca-limpar"
                  onClick={() => atualizarFiltro('busca', '')}
                  aria-label="Limpar busca"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="toolbar-right">
              <select
                id="ordenacao"
                className="form-select ordenacao-select"
                value={filtros.ordenacao}
                onChange={e => atualizarFiltro('ordenacao', e.target.value)}
                aria-label="Ordenar por"
              >
                <option value="recente">⏱ Mais recente</option>
                <option value="menorPreco">⬇ Menor preço</option>
                <option value="maiorPreco">⬆ Maior preço</option>
              </select>

              <button
                className={`btn btn-secondary btn-sm filtros-toggle ${filtrosAbertos ? 'active' : ''}`}
                onClick={() => setFiltrosAbertos(!filtrosAbertos)}
                aria-expanded={filtrosAbertos}
                id="btn-filtros"
              >
                🎚 Filtros
                {temFiltrosAtivos && <span className="filtros-dot" />}
              </button>
            </div>
          </div>

          {/* Painel de Filtros */}
          {filtrosAbertos && (
            <div className="filtros-painel card fade-in">
              <div className="card-body">
                <div className="filtros-grid">
                  <div className="form-group">
                    <label className="form-label">Categoria</label>
                    <select
                      id="filtro-categoria"
                      className="form-select"
                      value={filtros.categoria}
                      onChange={e => atualizarFiltro('categoria', e.target.value)}
                    >
                      <option value="">Todas</option>
                      {CATEGORIAS.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Tamanho</label>
                    <select
                      id="filtro-tamanho"
                      className="form-select"
                      value={filtros.tamanho}
                      onChange={e => atualizarFiltro('tamanho', e.target.value)}
                    >
                      <option value="">Todos</option>
                      {TAMANHOS.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Modalidade</label>
                    <select
                      id="filtro-modalidade"
                      className="form-select"
                      value={filtros.modalidade}
                      onChange={e => atualizarFiltro('modalidade', e.target.value)}
                    >
                      <option value="">Todas</option>
                      {MODALIDADES.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Faixa de VATs</label>
                    <div className="vats-range">
                      <input
                        id="vat-min"
                        type="number"
                        className="form-input"
                        placeholder="Min"
                        min="0"
                        value={filtros.vatMin}
                        onChange={e => atualizarFiltro('vatMin', e.target.value)}
                      />
                      <span>—</span>
                      <input
                        id="vat-max"
                        type="number"
                        className="form-input"
                        placeholder="Max"
                        min="0"
                        value={filtros.vatMax}
                        onChange={e => atualizarFiltro('vatMax', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {temFiltrosAtivos && (
                  <button className="btn btn-secondary btn-sm" onClick={limparFiltros} id="btn-limpar-filtros">
                    🗑 Limpar filtros
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Resultados */}
          <div className="explorar-resultados">
            {anunciosFiltrados.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🔍</div>
                <h3>Nenhum anúncio encontrado</h3>
                <p>Tente ajustar os filtros ou a busca.</p>
                {temFiltrosAtivos && (
                  <button className="btn btn-outline" onClick={limparFiltros}>
                    Limpar filtros
                  </button>
                )}
              </div>
            ) : (
              <>
                <p className="resultado-count">
                  {anunciosFiltrados.length} resultado{anunciosFiltrados.length !== 1 ? 's' : ''}
                  {filtros.busca && ` para "${filtros.busca}"`}
                </p>
                <div className="cards-grid">
                  {anunciosFiltrados.map(({ anuncio, vendedor }) => (
                    <AnuncioCard key={anuncio.id} anuncio={anuncio} vendedor={vendedor} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Explorar;

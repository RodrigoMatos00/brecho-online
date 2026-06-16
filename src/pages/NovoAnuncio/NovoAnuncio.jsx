import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAnuncios, setAnuncios, getAnuncioById } from '../../utils/storage';
import { gerarId } from '../../utils/helpers';
import './NovoAnuncio.css';

const CATEGORIAS = ['Camisa', 'Calça', 'Calçado', 'Acessório', 'Vestido', 'Bermuda', 'Casaco', 'Outro'];
const TAMANHOS = ['PP', 'P', 'M', 'G', 'GG'];
const CONSERVACOES = ['Novo', 'Bom', 'Regular', 'Marcas de uso'];
const MODALIDADES = ['Venda', 'Troca', 'Ambos'];

const FORM_INICIAL = {
  titulo: '',
  descricao: '',
  categoria: '',
  tamanho: '',
  conservacao: '',
  foto: '',
  modalidade: '',
  valorVATs: '',
};

/**
 * Formulário para criar ou editar um anúncio
 */
function NovoAnuncio() {
  const { id } = useParams(); // Se tiver id, é edição
  const { userLogado } = useAuth();
  const navigate = useNavigate();
  const modoEdicao = !!id;

  const [form, setForm] = useState(FORM_INICIAL);
  const [erros, setErros] = useState({});
  const [salvando, setSalvando] = useState(false);

  // Carrega dados para edição
  useEffect(() => {
    if (modoEdicao) {
      const anuncio = getAnuncioById(id);
      if (!anuncio || anuncio.userId !== userLogado?.id) {
        navigate('/garagem');
        return;
      }
      setForm({
        titulo: anuncio.titulo,
        descricao: anuncio.descricao,
        categoria: anuncio.categoria,
        tamanho: anuncio.tamanho,
        conservacao: anuncio.conservacao,
        foto: anuncio.foto || '',
        modalidade: anuncio.modalidade,
        valorVATs: String(anuncio.valorVATs),
      });
    }
  }, [id, modoEdicao, userLogado, navigate]);

  function validar() {
    const e = {};
    if (!form.titulo.trim()) e.titulo = 'Título é obrigatório.';
    else if (form.titulo.length < 3) e.titulo = 'Título muito curto (mín. 3 caracteres).';
    if (!form.descricao.trim()) e.descricao = 'Descrição é obrigatória.';
    if (!form.categoria) e.categoria = 'Selecione uma categoria.';
    if (!form.tamanho) e.tamanho = 'Selecione um tamanho.';
    if (!form.conservacao) e.conservacao = 'Selecione o estado de conservação.';
    if (!form.modalidade) e.modalidade = 'Selecione uma modalidade.';
    if (!form.valorVATs || Number(form.valorVATs) <= 0) {
      e.valorVATs = 'Informe um valor em VATs maior que zero.';
    }
    return e;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errosValidacao = validar();
    if (Object.keys(errosValidacao).length > 0) {
      setErros(errosValidacao);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSalvando(true);
    const anuncios = getAnuncios();

    if (modoEdicao) {
      const index = anuncios.findIndex(a => a.id === id);
      if (index !== -1) {
        anuncios[index] = {
          ...anuncios[index],
          titulo: form.titulo.trim(),
          descricao: form.descricao.trim(),
          categoria: form.categoria,
          tamanho: form.tamanho,
          conservacao: form.conservacao,
          foto: form.foto.trim(),
          modalidade: form.modalidade,
          valorVATs: Number(form.valorVATs),
        };
        setAnuncios(anuncios);
      }
    } else {
      const novoAnuncio = {
        id: gerarId(),
        userId: userLogado.id,
        titulo: form.titulo.trim(),
        descricao: form.descricao.trim(),
        categoria: form.categoria,
        tamanho: form.tamanho,
        conservacao: form.conservacao,
        foto: form.foto.trim(),
        modalidade: form.modalidade,
        valorVATs: Number(form.valorVATs),
        status: 'disponivel',
        dataCriacao: new Date().toISOString(),
      };
      setAnuncios([...anuncios, novoAnuncio]);
    }

    setSalvando(false);
    navigate('/garagem');
  }

  function atualizarCampo(campo, valor) {
    setForm(prev => ({ ...prev, [campo]: valor }));
    if (erros[campo]) {
      setErros(prev => { const e = { ...prev }; delete e[campo]; return e; });
    }
  }

  return (
    <div className="novo-anuncio-page">
      <div className="container">
        <div className="page-wrapper">
          <div className="novo-anuncio-container">
            <div className="page-header" style={{ marginBottom: 24 }}>
              <div>
                <h1>{modoEdicao ? '✏️ Editar Anúncio' : '➕ Novo Anúncio'}</h1>
                <p>{modoEdicao ? 'Atualize os dados do seu anúncio.' : 'Adicione uma peça à sua garagem.'}</p>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => navigate('/garagem')}>
                ← Voltar
              </button>
            </div>

            <div className="card">
              <div className="card-body">
                {Object.keys(erros).length > 0 && (
                  <div className="alert alert-danger">
                    ❌ Corrija os erros abaixo antes de continuar.
                  </div>
                )}

                <form onSubmit={handleSubmit} id={modoEdicao ? 'form-editar-anuncio' : 'form-novo-anuncio'}>
                  {/* Título */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="anuncio-titulo">
                      Título <span className="required">*</span>
                    </label>
                    <input
                      id="anuncio-titulo"
                      type="text"
                      className={`form-input ${erros.titulo ? 'error' : ''}`}
                      placeholder="Ex: Camiseta Vintage Anos 90"
                      value={form.titulo}
                      onChange={e => atualizarCampo('titulo', e.target.value)}
                      maxLength={80}
                    />
                    {erros.titulo && <span className="form-error">{erros.titulo}</span>}
                  </div>

                  {/* Descrição */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="anuncio-descricao">
                      Descrição <span className="required">*</span>
                    </label>
                    <textarea
                      id="anuncio-descricao"
                      className={`form-textarea ${erros.descricao ? 'error' : ''}`}
                      placeholder="Descreva o item em detalhes: cor, material, medidas, histórico..."
                      value={form.descricao}
                      onChange={e => atualizarCampo('descricao', e.target.value)}
                      maxLength={500}
                      rows={5}
                    />
                    <span className="form-hint">{form.descricao.length}/500 caracteres</span>
                    {erros.descricao && <span className="form-error">{erros.descricao}</span>}
                  </div>

                  {/* Row: Categoria + Tamanho */}
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label" htmlFor="anuncio-categoria">
                        Categoria <span className="required">*</span>
                      </label>
                      <select
                        id="anuncio-categoria"
                        className={`form-select ${erros.categoria ? 'error' : ''}`}
                        value={form.categoria}
                        onChange={e => atualizarCampo('categoria', e.target.value)}
                      >
                        <option value="">Selecione...</option>
                        {CATEGORIAS.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      {erros.categoria && <span className="form-error">{erros.categoria}</span>}
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="anuncio-tamanho">
                        Tamanho <span className="required">*</span>
                      </label>
                      <div className="tamanho-opcoes">
                        {TAMANHOS.map(t => (
                          <button
                            key={t}
                            type="button"
                            className={`tamanho-btn ${form.tamanho === t ? 'selected' : ''}`}
                            onClick={() => atualizarCampo('tamanho', t)}
                            id={`tamanho-${t}`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                      {erros.tamanho && <span className="form-error">{erros.tamanho}</span>}
                    </div>
                  </div>

                  {/* Conservação */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="anuncio-conservacao">
                      Estado de conservação <span className="required">*</span>
                    </label>
                    <div className="conservacao-opcoes">
                      {CONSERVACOES.map(c => (
                        <button
                          key={c}
                          type="button"
                          className={`conservacao-btn ${form.conservacao === c ? 'selected' : ''}`}
                          onClick={() => atualizarCampo('conservacao', c)}
                          id={`conservacao-${c.replace(' ', '-')}`}
                        >
                          {c === 'Novo' ? '🟢' : c === 'Bom' ? '🟡' : c === 'Regular' ? '🟠' : '🔴'} {c}
                        </button>
                      ))}
                    </div>
                    {erros.conservacao && <span className="form-error">{erros.conservacao}</span>}
                  </div>

                  {/* Foto */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="anuncio-foto">
                      URL da foto
                    </label>
                    <input
                      id="anuncio-foto"
                      type="url"
                      className="form-input"
                      placeholder="https://..."
                      value={form.foto}
                      onChange={e => atualizarCampo('foto', e.target.value)}
                    />
                    {form.foto && (
                      <div className="foto-preview">
                        <img
                          src={form.foto}
                          alt="Preview"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      </div>
                    )}
                    <span className="form-hint">
                      Sugestão: use imagens do Unsplash (unsplash.com)
                    </span>
                  </div>

                  {/* Modalidade + VATs */}
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label" htmlFor="anuncio-modalidade">
                        Modalidade <span className="required">*</span>
                      </label>
                      <div className="modalidade-opcoes">
                        {MODALIDADES.map(m => (
                          <button
                            key={m}
                            type="button"
                            className={`modalidade-btn ${form.modalidade === m ? 'selected' : ''}`}
                            onClick={() => atualizarCampo('modalidade', m)}
                            id={`modalidade-${m}`}
                          >
                            {m === 'Venda' ? '🛒' : m === 'Troca' ? '🔁' : '🔄'} {m}
                          </button>
                        ))}
                      </div>
                      {erros.modalidade && <span className="form-error">{erros.modalidade}</span>}
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="anuncio-vats">
                        Valor em VATs <span className="required">*</span>
                      </label>
                      <input
                        id="anuncio-vats"
                        type="number"
                        className={`form-input ${erros.valorVATs ? 'error' : ''}`}
                        placeholder="Ex: 30"
                        min="1"
                        value={form.valorVATs}
                        onChange={e => atualizarCampo('valorVATs', e.target.value)}
                      />
                      {erros.valorVATs && <span className="form-error">{erros.valorVATs}</span>}
                      <span className="form-hint">1 VAT ≈ R$ 1,00</span>
                    </div>
                  </div>

                  {/* Botões */}
                  <div className="form-acoes">
                    <button type="button" className="btn btn-secondary" onClick={() => navigate('/garagem')}>
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg"
                      disabled={salvando}
                      id="btn-salvar-anuncio"
                    >
                      {salvando ? '⏳ Salvando...' : modoEdicao ? '💾 Salvar Alterações' : '🚀 Publicar Anúncio'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NovoAnuncio;

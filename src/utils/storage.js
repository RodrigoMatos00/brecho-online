// ============================================
// Utilitários de armazenamento no localStorage
// ============================================

/**
 * Obtém um item do localStorage e faz o parse do JSON
 * @param {string} key - Chave do localStorage
 * @param {*} defaultValue - Valor padrão caso não exista
 */
export function getStorage(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;
    return JSON.parse(item);
  } catch (err) {
    console.error(`Erro ao ler localStorage[${key}]:`, err);
    return defaultValue;
  }
}

/**
 * Salva um item no localStorage como JSON
 * @param {string} key - Chave do localStorage
 * @param {*} value - Valor a ser salvo
 */
export function setStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Erro ao salvar localStorage[${key}]:`, err);
  }
}

/**
 * Remove um item do localStorage
 */
export function removeStorage(key) {
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.error(`Erro ao remover localStorage[${key}]:`, err);
  }
}

// ---- Funções específicas por entidade ----

// USUÁRIOS
export const getUsers = () => getStorage('users', []);
export const setUsers = (users) => setStorage('users', users);
export const getUserById = (id) => getUsers().find(u => u.id === id) || null;

// ANÚNCIOS
export const getAnuncios = () => getStorage('anuncios', []);
export const setAnuncios = (anuncios) => setStorage('anuncios', anuncios);
export const getAnuncioById = (id) => getAnuncios().find(a => a.id === id) || null;

// PROPOSTAS
export const getPropostas = () => getStorage('propostas', []);
export const setPropostas = (propostas) => setStorage('propostas', propostas);
export const getPropostaById = (id) => getPropostas().find(p => p.id === id) || null;

// CHATS
export const getChats = () => getStorage('chats', []);
export const setChats = (chats) => setStorage('chats', chats);
export const getChatByPropostaId = (propostaId) =>
  getChats().find(c => c.propostaId === propostaId) || null;

// AVALIAÇÕES
export const getAvaliacoes = () => getStorage('avaliacoes', []);
export const setAvaliacoes = (avaliacoes) => setStorage('avaliacoes', avaliacoes);

// USUÁRIO LOGADO
export const getUserLogado = () => getStorage('userLogado', null);
export const setUserLogado = (user) => setStorage('userLogado', user);
export const clearUserLogado = () => removeStorage('userLogado');

// TEMA
export const getTheme = () => getStorage('tema', 'light');
export const setTheme = (theme) => setStorage('tema', theme);

// ---- Funções de atualização ----

/**
 * Atualiza um usuário na lista e também atualiza o userLogado se for o mesmo
 */
export function updateUser(updatedUser) {
  const users = getUsers();
  const index = users.findIndex(u => u.id === updatedUser.id);
  if (index !== -1) {
    users[index] = updatedUser;
    setUsers(users);
    // Atualiza também o userLogado se for o mesmo usuário
    const logado = getUserLogado();
    if (logado && logado.id === updatedUser.id) {
      setUserLogado(updatedUser);
    }
  }
}

/**
 * Atualiza a média de estrelas e total de negociações de um usuário
 */
export function recalcularEstrelas(userId) {
  const avaliacoes = getAvaliacoes().filter(a => a.avaliadoId === userId);
  const users = getUsers();
  const index = users.findIndex(u => u.id === userId);
  if (index === -1) return;

  const media = avaliacoes.length > 0
    ? avaliacoes.reduce((sum, a) => sum + a.estrelas, 0) / avaliacoes.length
    : 0;

  // totalNegociacoes = número de propostas encerradas onde o usuário participou
  const propostas = getStorage('propostas', []);
  const negociacoes = propostas.filter(
    p => (p.vendedorId === userId || p.compradorId === userId) && p.status === 'encerrada'
  );

  users[index] = {
    ...users[index],
    mediaEstrelas: Math.round(media * 10) / 10,
    totalNegociacoes: negociacoes.length,
  };
  setUsers(users);

  const logado = getUserLogado();
  if (logado && logado.id === userId) {
    setUserLogado(users[index]);
  }
}

/**
 * Adiciona uma mensagem ao histórico de VATs do usuário
 */
export function adicionarHistoricoVats(userId, valor, descricao) {
  const users = getUsers();
  const index = users.findIndex(u => u.id === userId);
  if (index === -1) return;

  const historico = users[index].historicoVats || [];
  historico.push({
    data: new Date().toISOString(),
    valor,
    descricao,
    saldoApos: users[index].vats,
  });
  users[index].historicoVats = historico;
  setUsers(users);

  const logado = getUserLogado();
  if (logado && logado.id === userId) {
    setUserLogado(users[index]);
  }
}

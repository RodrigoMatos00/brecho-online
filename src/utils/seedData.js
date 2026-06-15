// ============================================
// Dados iniciais de demonstração (seed)
// Popula o localStorage com dados de exemplo
// ============================================

import { gerarId } from './helpers';
import {
  getUsers, setUsers, getAnuncios, setAnuncios,
  getPropostas, setPropostas, getChats, setChats,
  getAvaliacoes, setAvaliacoes,
} from './storage';

const FOTOS_ROUPAS = [
  'https://images.unsplash.com/photo-1647058551618-3c836c6045d2?w=400&q=80',
  'https://images.unsplash.com/photo-1602293589930-45aad59ba3ab?w=400&q=80',
  'https://images.unsplash.com/photo-1536830220630-ce146cccac84?w=400&q=80',
  'https://images.unsplash.com/photo-1672380300750-6294c5614695?w=400&q=80',
  'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&q=80',
  'https://images.unsplash.com/photo-1719473466836-ff9f5ebe0e1b?w=400&q=80',
];

const AVATARES = [
  'https://i.pravatar.cc/300?img=10',
  'https://i.pravatar.cc/150?img=12',
  'https://i.pravatar.cc/150?img=48',
  'https://i.pravatar.cc/150?img=4',
  'https://i.pravatar.cc/150?img=5',
];

/**
 * Inicializa o localStorage com dados de demonstração.
 * Só executa se não houver usuários cadastrados ainda.
 */
export function inicializarDadosSeed() {
  const existentes = getUsers();
  if (existentes.length > 0) return; // Já inicializado

  // ---- Usuários ----
  const user1Id = gerarId();
  const user2Id = gerarId();
  const user3Id = gerarId();

  const agora = new Date();
  const diasAtras = (n) => new Date(agora - n * 86400000).toISOString();

  const users = [
    {
      id: user1Id,
      nome: 'Ana Lima',
      email: 'ana@email.com',
      senha: '123456',
      telefone: '(11) 98765-4321',
      endereco: 'Rua das Flores, 123 — São Paulo, SP',
      avatar: AVATARES[0],
      vats: 80,
      mediaEstrelas: 9.2,
      totalNegociacoes: 12,
      dataCadastro: diasAtras(120),
      historicoVats: [
        { data: diasAtras(30), valor: 50, descricao: 'Compra de VATs', saldoApos: 50 },
        { data: diasAtras(20), valor: 30, descricao: 'Compra de VATs', saldoApos: 80 },
      ],
    },
    {
      id: user2Id,
      nome: 'Carlos Souza',
      email: 'carlos@email.com',
      senha: '123456',
      telefone: '(21) 99123-4567',
      endereco: 'Av. Brasil, 500 — Rio de Janeiro, RJ',
      avatar: AVATARES[1],
      vats: 45,
      mediaEstrelas: 8.5,
      totalNegociacoes: 7,
      dataCadastro: diasAtras(90),
      historicoVats: [
        { data: diasAtras(15), valor: 45, descricao: 'Compra de VATs', saldoApos: 45 },
      ],
    },
    {
      id: user3Id,
      nome: 'Beatriz Mendes',
      email: 'bea@email.com',
      senha: '123456',
      telefone: '(31) 97654-3210',
      endereco: 'Rua da Paz, 88 — Belo Horizonte, MG',
      avatar: AVATARES[2],
      vats: 120,
      mediaEstrelas: 7.8,
      totalNegociacoes: 4,
      dataCadastro: diasAtras(60),
      historicoVats: [
        { data: diasAtras(10), valor: 120, descricao: 'Compra de VATs', saldoApos: 120 },
      ],
    },
  ];

  setUsers(users);

  // ---- Anúncios ----
  const an1Id = gerarId();
  const an2Id = gerarId();
  const an3Id = gerarId();
  const an4Id = gerarId();
  const an5Id = gerarId();
  const an6Id = gerarId();

  const anuncios = [
    {
      id: an1Id,
      userId: user1Id,
      titulo: 'Camiseta Vintage Estampada',
      descricao: 'Camiseta vintage com estampa dos anos 90. Tecido 100% algodão, lavada com cuidado. Perfeita para looks retrô.',
      categoria: 'Camisa',
      tamanho: 'M',
      conservacao: 'Bom',
      foto: FOTOS_ROUPAS[0],
      modalidade: 'Ambos',
      valorVATs: 25,
      status: 'disponivel',
      dataCriacao: diasAtras(10),
    },
    {
      id: an2Id,
      userId: user2Id,
      titulo: 'Calça Jeans Slim Fit',
      descricao: 'Calça jeans slim, cor azul desbotado. Usada apenas algumas vezes, em ótimo estado. Tamanho 38.',
      categoria: 'Calça',
      tamanho: 'M',
      conservacao: 'Bom',
      foto: FOTOS_ROUPAS[1],
      modalidade: 'Venda',
      valorVATs: 40,
      status: 'disponivel',
      dataCriacao: diasAtras(7),
    },
    {
      id: an3Id,
      userId: user3Id,
      titulo: 'Tênis All Star Preto',
      descricao: 'Tênis clássico Chuck Taylor, cor preta. Usado por 6 meses, com pequenas marcas de uso. Nº 38.',
      categoria: 'Calçado',
      tamanho: 'G',
      conservacao: 'Regular',
      foto: FOTOS_ROUPAS[2],
      modalidade: 'Troca',
      valorVATs: 35,
      status: 'disponivel',
      dataCriacao: diasAtras(5),
    },
    {
      id: an4Id,
      userId: user1Id,
      titulo: 'Casaco de Lã Importado',
      descricao: 'Casaco de lã merino, cor caramelo. Trazido de viagem, raramente usado. Ideal para o inverno.',
      categoria: 'Casaco',
      tamanho: 'G',
      conservacao: 'Novo',
      foto: FOTOS_ROUPAS[3],
      modalidade: 'Venda',
      valorVATs: 80,
      status: 'disponivel',
      dataCriacao: diasAtras(3),
    },
    {
      id: an5Id,
      userId: user2Id,
      titulo: 'Vestido Floral de Verão',
      descricao: 'Vestido midi com estampa floral, tecido leve. Usado duas vezes, sem defeitos.',
      categoria: 'Vestido',
      tamanho: 'P',
      conservacao: 'Bom',
      foto: FOTOS_ROUPAS[4],
      modalidade: 'Ambos',
      valorVATs: 30,
      status: 'disponivel',
      dataCriacao: diasAtras(2),
    },
    {
      id: an6Id,
      userId: user3Id,
      titulo: 'Bermuda Cargo Cáqui',
      descricao: 'Bermuda cargo na cor cáqui, vários bolsos. Bastante confortável para o dia a dia.',
      categoria: 'Bermuda',
      tamanho: 'GG',
      conservacao: 'Marcas de uso',
      foto: FOTOS_ROUPAS[5],
      modalidade: 'Troca',
      valorVATs: 15,
      status: 'disponivel',
      dataCriacao: diasAtras(1),
    },
  ];

  setAnuncios(anuncios);

  // Propostas, chats e avaliações ficam vazios inicialmente
  if (getPropostas().length === 0) setPropostas([]);
  if (getChats().length === 0) setChats([]);
  if (getAvaliacoes().length === 0) setAvaliacoes([]);
}

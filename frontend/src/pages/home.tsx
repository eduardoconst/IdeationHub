/**
 * RESUMO: Home.tsx - Página Principal
 * 
 * O que faz:
 * - Página principal da aplicação IdeationHub
 * - Lista todas as ideias disponíveis para votação
 * - Sistema completo de filtros e ordenação
 * - Dashboard com estatísticas em tempo real
 * - Gerencia votação local das ideias
 * 
 * Principais funções:
 * - handleVote(): Processa votos e atualiza estado local
 * - Sistema de filtros: 'all', 'trending', 'recent'
 * - Sistema de ordenação: por votos, tempo ou recência
 * - Cálculo dinâmico de estatísticas (total ideias, votos)
 * 
 * Seções da página:
 * - Header: Título e descrição da plataforma
 * - Stats: Cards com estatísticas (ideias, votos, participantes)
 * - Filters: Botões de filtro e dropdown de ordenação
 * - Ideas List: Lista de cards de ideias filtradas/ordenadas
 * - Empty State: Mensagem quando não há ideias para exibir
 * 
 * Estados gerenciados:
 * - ideas: Array de ideias com votos atualizados
 * - filter: Filtro ativo atual
 * - sortBy: Critério de ordenação ativo
 */

// O que faz:
// Gerencia o estado do tema (dark/light)
// Renderiza o header com título e botão de tema
// Renderiza o componente Home no main

import { useState } from 'react';
import IdeaCard from '../components/IdeaCard';

const initialIdeas = [
  {
    id: 1,
    title: 'Sistema de Gamificação',
    description: 'Implementar um sistema de pontos e badges para engajar mais os usuários na plataforma. Incluiria rankings, conquistas e recompensas por participação ativa.',
    timeLeft: '23:45:30',
    votes: { yes: 15, no: 3 },
  },
  {
    id: 2,
    title: 'Modo Noturno Automático',
    description: 'Adicionar um modo escuro que se ativa automaticamente baseado no horário local do usuário ou nas configurações do sistema operacional.',
    timeLeft: '18:20:15',
    votes: { yes: 8, no: 2 },
  },
  {
    id: 3,
    title: 'Notificações Push',
    description: 'Sistema de notificações para avisar sobre novas ideias, resultados de votações e atualizações importantes da plataforma.',
    timeLeft: '47:30:00',
    votes: { yes: 12, no: 7 },
  }
];

const Home = () => {
  const [ideas, setIdeas] = useState(initialIdeas);
  const [filter, setFilter] = useState<'all' | 'trending' | 'recent'>('all');
  const [sortBy, setSortBy] = useState<'votes' | 'time' | 'recent'>('votes');

  const handleVote = (id: number, type: 'yes' | 'no') => {
    setIdeas(prevIdeas =>
      prevIdeas.map(idea =>
        idea.id === id
          ? {
              ...idea,
              votes: {
                ...idea.votes,
                [type]: idea.votes[type] + 1
              }
            }
          : idea
      )
    );
  };

  const filteredIdeas = ideas.filter(idea => {
    if (filter === 'trending') {
      return (idea.votes.yes + idea.votes.no) > 10;
    }
    if (filter === 'recent') {
      return idea.id > 2; // Simulando ideias recentes
    }
    return true;
  });

  const sortedIdeas = [...filteredIdeas].sort((a, b) => {
    if (sortBy === 'votes') {
      return (b.votes.yes + b.votes.no) - (a.votes.yes + a.votes.no);
    }
    if (sortBy === 'time') {
      return a.timeLeft.localeCompare(b.timeLeft);
    }
    return b.id - a.id; // recent
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          💡 IdeationHub
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Compartilhe suas ideias e vote nas melhores propostas da comunidade
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Ideias</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{ideas.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5 5 5M7 21l5-5 5 5" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Votos Positivos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {ideas.reduce((acc, idea) => acc + idea.votes.yes, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Participantes</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">1.2k</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex space-x-1">
          {[
            { key: 'all', label: 'Todas' },
            { key: 'trending', label: 'Em Alta' },
            { key: 'recent', label: 'Recentes' }
          ].map(item => (
            <button
              key={item.key}
              onClick={() => setFilter(item.key as any)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filter === item.key
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Ordenar por:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="votes">Mais Votadas</option>
            <option value="time">Tempo Restante</option>
            <option value="recent">Mais Recentes</option>
          </select>
        </div>
      </div>

      {/* Ideas List */}
      <div className="space-y-4">
        {sortedIdeas.map((idea) => (
          <IdeaCard key={idea.id} idea={idea} onVote={handleVote} />
        ))}
      </div>

      {/* Empty state */}
      {sortedIdeas.length === 0 && (
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Nenhuma ideia encontrada
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Que tal criar uma nova ideia para começar?
          </p>
        </div>
      )}
    </div>
  );
};

export default Home;
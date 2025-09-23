/**
 * RESUMO: Home.tsx - Página Principal
 * 
 * O que faz:
 * - Página principal da aplicação IdeationHub
 * - Lista todas as ideias do banco de dados
 * - Sistema completo de filtros e ordenação
 * - Dashboard com estatísticas em tempo real
 * - Gerencia votação real integrada com backend
 * 
 * Principais funções:
 * - loadCards(): Busca cards do backend
 * - handleVoteUpdate(): Atualiza votos localmente (sem refresh)
 * - Sistema de filtros: 'all', 'active', 'ended', 'recent'
 * - Sistema de ordenação: por votos, tempo ou recência
 * - Cálculo dinâmico de estatísticas vindas do banco
 * 
 * Estratégia de Refresh Otimizada:
 * - ❌ Removido auto-refresh por tempo (evita sobrecarga no backend)
 * - ✅ Refresh inteligente quando usuário volta à aba após 5min+ inativo
 * - ✅ Refresh automático ao fazer login/logout
 * - ✅ Updates locais para votos (sem consultar backend)
 * - ✅ Refresh manual apenas em casos específicos (erros, admin)
 */

import { useState, useEffect, useCallback } from 'react';
import IdeaCard from '../components/IdeaCard';
import { getCards, Card, getTotalPositiveVotes, getTotalUsers } from '../services/cardService';
import { useAuth } from '../context/AuthContext';
import useLocalStorage from '../hooks/useLocalStorage';
import { useNotifications } from '../hooks/useNotifications';

type UseNotificationsReturn = ReturnType<typeof useNotifications>;



interface HomeProps {
  onOpenLogin?: () => void;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  onRefreshRequest?: (refreshFn: () => void) => void;
  onOpenReport?: (ideaId: number) => void;
  notifications: UseNotificationsReturn;
}

const Home = ({ onOpenLogin, searchTerm = '', onSearchChange, onRefreshRequest, onOpenReport, notifications }: HomeProps) => {
  const { isLoggedIn } = useAuth();
  const [ideas, setIdeas] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPositiveVotes, setTotalPositiveVotes] = useState<number>(0);
  const [totalUsers, setTotalUsers] = useState<number>(0);

  
  // Usa localStorage para persistir filtros e ordenação
  const [filter, setFilter] = useLocalStorage<'all' | 'trending' | 'recent' | 'active' | 'ended'>('homeFilter', 'active');
  const [sortBy, setSortBy] = useLocalStorage<'votes' | 'time' | 'recent' | 'alphabetical'>('homeSortBy', 'recent');

  const loadCards = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔄 Carregando dados do backend...');
      
      // Carrega cards, total de votos positivos e total de usuários em paralelo
      const [cardsData, totalVotes, usersCount] = await Promise.all([
        getCards(),
        getTotalPositiveVotes(),
        getTotalUsers()
      ]);
      
      console.log('✅ Cards carregados:', cardsData);
      console.log('✅ Total votos positivos:', totalVotes);
      console.log('✅ Total usuários:', usersCount);
      
      // Para cada card, vamos simular os votos (até implementarmos a contagem real)
      const cardsWithVotes = cardsData.map(card => ({
        ...card,
        votes: card.votes || { yes: 0, no: 0 }
      }));
      
      setIdeas(cardsWithVotes);
      setTotalPositiveVotes(totalVotes);
      setTotalUsers(usersCount);
    } catch (err: any) {
      console.error('❌ Erro ao carregar dados:', err);
      
      // Tratamento específico de erros
      if (err.message.includes('Network Error')) {
        setError('Erro de conexão. Verifique se o backend está rodando.');
      } else {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Carregar cards do backend
  useEffect(() => {
    // Sempre carrega cards, independente do estado de login
    loadCards();
  }, [loadCards]);

  // Registra a função de refresh com o componente pai
  useEffect(() => {
    if (onRefreshRequest) {
      onRefreshRequest(loadCards);
    }
  }, [onRefreshRequest, loadCards]);

  // Refresh inteligente baseado em visibilidade da página
  useEffect(() => {
    let lastRefreshTime = Date.now();
    const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutos

    const handleVisibilityChange = () => {
      if (!document.hidden && Date.now() - lastRefreshTime > REFRESH_INTERVAL) {
        console.log('🔄 Página voltou a ficar visível após período inativo - Atualizando...');
        loadCards();
        lastRefreshTime = Date.now();
      }
    };

    // Refresh quando usuário faz login/logout
    const handleAuthChange = () => {
      console.log('� Estado de autenticação mudou - Atualizando...');
      loadCards();
      lastRefreshTime = Date.now();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Escuta mudanças no localStorage do auth (login/logout)
    window.addEventListener('storage', (e) => {
      if (e.key === 'auth_token') {
        handleAuthChange();
      }
    });

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, [loadCards]);

  const handleVoteUpdate = (cardId: number, newVotes: { yes: number; no: number }) => {
    setIdeas(prevIdeas => {
      const updatedIdeas = prevIdeas.map(idea => 
        idea.id === cardId 
          ? { ...idea, votes: newVotes }
          : idea
      );
      
      // Recalcula total de votos positivos localmente
      const newTotalPositiveVotes = updatedIdeas.reduce((acc, idea) => acc + (idea.votes?.yes || 0), 0);
      setTotalPositiveVotes(newTotalPositiveVotes);
      
      return updatedIdeas;
    });
  };

  const handleOpenReport = (ideaId: number) => {
    if (onOpenReport) {
      onOpenReport(ideaId);
    }
  };

  const handleCardDeleted = (cardId: number) => {
    setIdeas(prevIdeas => {
      const updatedIdeas = prevIdeas.filter(idea => idea.id !== cardId);
      
      // Recalcula total de votos positivos localmente
      const newTotalPositiveVotes = updatedIdeas.reduce((acc, idea) => acc + (idea.votes?.yes || 0), 0);
      setTotalPositiveVotes(newTotalPositiveVotes);
      
      return updatedIdeas;
    });
  };

  // Função para refresh completo quando necessário (apenas em casos específicos)
  const forceRefresh = useCallback(() => {
    console.log('🔄 Refresh forçado solicitado...');
    loadCards();
  }, [loadCards]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-gray-600 dark:text-gray-400">Carregando ideias...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md mx-auto">
          <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">
            Erro ao carregar ideias
          </h3>
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={forceRefresh}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  const filteredIdeas = ideas.filter(idea => {
    // Primeiro aplica o filtro de pesquisa
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      const matchesTitle = idea.title.toLowerCase().includes(searchLower);
      const matchesContent = idea.content.toLowerCase().includes(searchLower);
      const matchesAuthor = idea.userName?.toLowerCase().includes(searchLower);
      
      if (!matchesTitle && !matchesContent && !matchesAuthor) {
        return false;
      }
    }

    // Depois aplica os filtros de categoria
    const now = new Date();
    const endDate = new Date(idea.voting_end);
    const startDate = new Date(idea.voting_start);
    const isActive = now >= startDate && now <= endDate;
    const isEnded = now > endDate;
    
    if (filter === 'active') {
      return isActive;
    }
    if (filter === 'ended') {
      return isEnded;
    }
    if (filter === 'trending') {
      const totalVotes = (idea.votes?.yes || 0) + (idea.votes?.no || 0);
      return totalVotes > 3; // Ideias com mais de 3 votos (reduzido para incluir mais)
    }
    if (filter === 'recent') {
      const daysDiff = (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff <= 30; // Ideias dos últimos 30 dias (aumentado)
    }
    return true; // 'all' - mostra tudo
  });

  const sortedIdeas = [...filteredIdeas].sort((a, b) => {
    if (sortBy === 'votes') {
      const aVotes = (a.votes?.yes || 0) + (a.votes?.no || 0);
      const bVotes = (b.votes?.yes || 0) + (b.votes?.no || 0);
      return bVotes - aVotes;
    }
    if (sortBy === 'time') {
      const now = new Date();
      const aEnd = new Date(a.voting_end);
      const bEnd = new Date(b.voting_end);
      
      // Se ambos estão ativos, ordena por tempo restante (menor primeiro)
      if (aEnd > now && bEnd > now) {
        return aEnd.getTime() - bEnd.getTime();
      }
      // Se apenas um está ativo, prioriza o ativo
      if (aEnd > now && bEnd <= now) return -1;
      if (bEnd > now && aEnd <= now) return 1;
      // Se ambos estão encerrados, ordena por mais recentemente encerrado
      return bEnd.getTime() - aEnd.getTime();
    }
    if (sortBy === 'alphabetical') {
      return a.title.localeCompare(b.title);
    }
    // 'recent' - por data de criação mais recente
    return new Date(b.voting_start).getTime() - new Date(a.voting_start).getTime();
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
                {totalPositiveVotes}
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
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {isLoading ? '...' : totalUsers}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'Todas' },
            { key: 'active', label: 'Ativas' },
            { key: 'ended', label: 'Encerradas' },
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
            <option value="recent">Mais Recentes</option>
            <option value="votes">Mais Votadas</option>
            <option value="time">Tempo Restante</option>
            <option value="alphabetical">Alfabética</option>
          </select>
        </div>
      </div>

      {/* Ideas List */}
      {isLoggedIn ? (
        <div className="space-y-4">
          {sortedIdeas.map((idea) => (
            <IdeaCard 
              key={idea.id} 
              idea={idea} 
              onVoteUpdate={handleVoteUpdate}
              onOpenReport={handleOpenReport}
              onCardDeleted={handleCardDeleted}
              notifications={notifications}
            />
          ))}
        </div>
      ) : (
        /* Tela de login para usuários não logados */
        <div className="flex items-center justify-center py-16">
          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 max-w-xs mx-4">
            <div className="mb-4">
              <svg className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                🔒 Conteúdo Protegido
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                Faça login para ver e interagir com as ideias da comunidade
              </p>
            </div>
            
            <button
              onClick={onOpenLogin}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
            >
              🚀 Fazer Login
            </button>
            
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
              Junte-se à nossa comunidade de inovadores!
            </p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {isLoggedIn && sortedIdeas.length === 0 && (
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            {searchTerm ? 'Nenhuma ideia encontrada' : 'Nenhuma ideia nesta categoria'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {searchTerm 
              ? `Não foram encontradas ideias que correspondam a "${searchTerm}". Tente ajustar sua pesquisa.`
              : filter === 'active' 
                ? 'Não há ideias com votação ativa no momento.'
                : filter === 'ended'
                  ? 'Não há ideias com votação encerrada.'
                  : filter === 'recent'
                    ? 'Não há ideias recentes.'
                    : 'Que tal criar uma nova ideia para começar?'
            }
          </p>
          {searchTerm && (
            <button
              onClick={() => onSearchChange?.('')}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Limpar pesquisa
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
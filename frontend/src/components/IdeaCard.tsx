

import { useState, useEffect } from 'react';
import { Card, voteCard, getUserVoteForCard, getCardVoteCount, removeUserVote } from '../services/cardService';
import { useAuth } from '../context/AuthContext';

interface IdeaProps {
  idea: Card;
  onVoteUpdate?: (cardId: number, newVotes: { yes: number; no: number }) => void;
  onOpenReport?: (ideaId: number) => void;
}

const IdeaCard = ({ idea, onVoteUpdate, onOpenReport }: IdeaProps) => {
  const { user, isLoggedIn } = useAuth();
  const [isVoting, setIsVoting] = useState(false);
  const [userVote, setUserVote] = useState<boolean | null>(null);
  const [voteCount, setVoteCount] = useState<{ yes: number; no: number }>({
    yes: idea.votes?.yes || 0,
    no: idea.votes?.no || 0
  });
  const [isLoadingVotes, setIsLoadingVotes] = useState(false);

  // Carrega voto do usuário e contagem total quando componente monta
  useEffect(() => {
    const loadVoteData = async () => {
      if (!isLoggedIn || !user) return;
      
      setIsLoadingVotes(true);
      try {
        // Carrega voto atual do usuário
        const currentUserVote = await getUserVoteForCard(idea.id, user.id);
        setUserVote(currentUserVote);
        
        // Carrega contagem total de votos
        const totalVotes = await getCardVoteCount(idea.id);
        setVoteCount(totalVotes);
      } catch (error) {
        console.error('Erro ao carregar dados de voto:', error);
      } finally {
        setIsLoadingVotes(false);
      }
    };

    loadVoteData();
  }, [idea.id, isLoggedIn, user]);

  // Calcula tempo restante
  const calculateTimeLeft = () => {
    const now = new Date();
    const endDate = new Date(idea.voting_end);
    const timeDiff = endDate.getTime() - now.getTime();
    
    if (timeDiff <= 0) {
      return 'Votação encerrada';
    }
    
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const handleVote = async (type: 'yes' | 'no') => {
    if (!isLoggedIn || !user) {
      alert('Você precisa estar logado para votar! Faça login e tente novamente.');
      return;
    }

    if (isVoting) return; // Previne duplo clique

    setIsVoting(true);
    
    try {
      const voteValue = type === 'yes';
      
      // Se o usuário clica no mesmo voto que já tem, remove o voto
      if (userVote === voteValue) {
        console.log('Removendo voto do usuário...');
        await removeUserVote(idea.id, user.id);
      } else {
        // Caso contrário, vota ou muda o voto
        console.log('Salvando voto do usuário...');
        await voteCard({
          cardID: idea.id,
          vote: voteValue,
          userID: user.id,
          anonymous: false,
          showVotes: true
        });
      }

      // Aguarda um pequeno delay para garantir que a operação foi processada
      await new Promise(resolve => setTimeout(resolve, 100));

      // Após votar/remover com sucesso, recarrega os dados reais do backend
      console.log('Recarregando dados do backend...');
      const [newUserVote, newVoteCount] = await Promise.all([
        getUserVoteForCard(idea.id, user.id),
        getCardVoteCount(idea.id)
      ]);
      
      // Atualiza com dados reais do backend
      setUserVote(newUserVote);
      setVoteCount(newVoteCount);
      
      // Notifica componente pai com dados reais
      if (onVoteUpdate) {
        onVoteUpdate(idea.id, newVoteCount);
      }
      
    } catch (error: any) {
      console.error('Erro no handleVote:', error);
      alert(error.message);
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 p-6 mb-4">
      {/* Header with user info */}
      <div className="flex items-center mb-3">
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
          {idea.userName?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <div className="ml-3">
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {idea.userName || 'Usuário'}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
            • {new Date(idea.voting_start).toLocaleDateString('pt-BR')}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {idea.title}
        </h2>
        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
          {idea.content}
        </p>
      </div>

      {/* Timer */}
      <div className="flex items-center mb-4">
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          calculateTimeLeft() === 'Votação encerrada' 
            ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
            : 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300'
        }`}>
          ⏰ {calculateTimeLeft()}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center space-x-6">
          {/* Vote Yes */}
          <button
            onClick={() => handleVote('yes')}
            disabled={isVoting || calculateTimeLeft() === 'Votação encerrada' || isLoadingVotes}
            title={!isLoggedIn ? 'Faça login para votar' : userVote === true ? 'Você votou SIM' : 'Votar SIM'}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 group ${
              userVote === true 
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 ring-2 ring-green-300 dark:ring-green-600'
                : isLoggedIn 
                  ? 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                  : 'text-gray-400 dark:text-gray-500 cursor-help'
            } ${isVoting || calculateTimeLeft() === 'Votação encerrada' || isLoadingVotes ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isVoting && userVote !== true ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 1.414L10.586 9.5 8.293 7.207a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0z" clipRule="evenodd" />
              </svg>
            )}
            <span className="text-sm font-medium">
              {isLoadingVotes ? '...' : voteCount.yes}
            </span>
          </button>

          {/* Vote No */}
          <button
            onClick={() => handleVote('no')}
            disabled={isVoting || calculateTimeLeft() === 'Votação encerrada' || isLoadingVotes}
            title={!isLoggedIn ? 'Faça login para votar' : userVote === false ? 'Você votou NÃO' : 'Votar NÃO'}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 group ${
              userVote === false 
                ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 ring-2 ring-red-300 dark:ring-red-600'
                : isLoggedIn 
                  ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                  : 'text-gray-400 dark:text-gray-500 cursor-help'
            } ${isVoting || calculateTimeLeft() === 'Votação encerrada' || isLoadingVotes ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isVoting && userVote !== false ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            <span className="text-sm font-medium">
              {isLoadingVotes ? '...' : voteCount.no}
            </span>
          </button>

          {/* Share placeholder */}
          <button className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 px-3 py-2 rounded-lg transition-colors duration-200">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
          </button>

          {/* Report Button - Only for Admins */}
          {user?.admin && onOpenReport && (
            <button
              onClick={() => onOpenReport(idea.id)}
              title="Ver relatório da ideia"
              className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-3 py-2 rounded-lg transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </button>
          )}
        </div>

        {/* Percentage of positive votes */}
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {(() => {
            const yes = voteCount.yes;
            const no = voteCount.no;
            const total = yes + no;
            if (isLoadingVotes) return 'Carregando...';
            if (total === 0) return '0% aprovação';
            const percentage = Math.round((yes / total) * 100);
            return `${percentage}% aprovação`;
          })()}
        </div>
      </div>
    </div>
  );
};

export default IdeaCard;
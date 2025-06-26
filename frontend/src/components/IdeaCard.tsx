/**
 * RESUMO: IdeaCard.tsx
 * 
 * O que faz:
 * - Exibe um card de ideia individual no estilo Twitter/X
 * - Mostra informações da ideia (título, descrição, tempo restante)
 * - Permite votação com botões interativos (sim/não)
 * - Calcula e exibe porcentagem de aprovação
 * - Suporte completo ao modo escuro/claro
 * 
 * Principais funções:
 * - handleVote(): Processa cliques nos botões de voto
 * - Recebe props: idea (dados) e onVote (callback para votação)
 * - Interface IdeaProps: Define tipos TypeScript para as props
 * - Visual responsivo e moderno com hover effects
 * 
 * Componentes visuais:
 * - Avatar do usuário (placeholder)
 * - Área de conteúdo (título + descrição)
 * - Badge de tempo restante
 * - Botões de ação (voto sim, voto não, compartilhar)
 * - Estatísticas de aprovação
 */

interface IdeaProps {
  idea: {
    id: number;
    title: string;
    description: string;
    timeLeft: string;
    votes: {
      yes: number;
      no: number;
    };
  };
  onVote?: (id: number, type: 'yes' | 'no') => void;
}

const IdeaCard = ({ idea, onVote }: IdeaProps) => {
  const handleVote = (type: 'yes' | 'no') => {
    if (onVote) {
      onVote(idea.id, type);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 p-6 mb-4">
      {/* Header with user info placeholder */}
      <div className="flex items-center mb-3">
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
          U
        </div>
        <div className="ml-3">
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Usuário</span>
          <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">• há 2h</span>
        </div>
      </div>

      {/* Content */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {idea.title}
        </h2>
        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
          {idea.description}
        </p>
      </div>

      {/* Timer */}
      <div className="flex items-center mb-4">
        <div className="bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 px-3 py-1 rounded-full text-xs font-medium">
          ⏰ {idea.timeLeft} restante
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center space-x-6">
          {/* Vote Yes */}
          <button
            onClick={() => handleVote('yes')}
            className="flex items-center space-x-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 px-3 py-2 rounded-lg transition-colors duration-200 group"
          >
            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 1.414L10.586 9.5 8.293 7.207a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">{idea.votes.yes}</span>
          </button>

          {/* Vote No */}
          <button
            onClick={() => handleVote('no')}
            className="flex items-center space-x-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-2 rounded-lg transition-colors duration-200 group"
          >
            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">{idea.votes.no}</span>
          </button>

          {/* Share placeholder */}
          <button className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 px-3 py-2 rounded-lg transition-colors duration-200">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
          </button>
        </div>

        {/* Vote percentage */}
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {Math.round((idea.votes.yes / (idea.votes.yes + idea.votes.no)) * 100) || 0}% aprovação
        </div>
      </div>
    </div>
  );
};

export default IdeaCard;
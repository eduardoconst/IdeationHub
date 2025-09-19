import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

// Registrar os componentes do Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

interface Vote {
  id: number;
  vote: boolean; // true para positivo, false para negativo
  user_name: string;
  user_email: string;
  created_at: string;
  showVotes?: boolean;
}

interface IdeaReportData {
  idea: {
    id: number;
    title: string;
    content: string;
    author_name: string;
    created_at: string;
    positive_votes: number;
    negative_votes: number;
    total_votes: number;
  };
  votes: Vote[];
  votesBreakdown: {
    positive: number;
    negative: number;
    total: number;
  };
}

interface IdeaReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  ideaId: number;
}

const IdeaReportModal: React.FC<IdeaReportModalProps> = ({ isOpen, onClose, ideaId }) => {
  const [reportData, setReportData] = useState<IdeaReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchIdeaReport = async () => {
      setLoading(true);
      setError('');
      
      try {
        const token = localStorage.getItem('token');
        console.log('Buscando relatório para ideia:', ideaId);
        console.log('Token:', token ? 'presente' : 'ausente');
        
        const response = await fetch(`http://localhost:4000/api/reports/idea/${ideaId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        console.log('Response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Erro na resposta:', errorText);
          throw new Error(`Erro ao carregar relatório da ideia: ${response.status}`);
        }

        const data = await response.json();
        console.log('Dados recebidos:', data);
        setReportData(data);
      } catch (err) {
        console.error('Erro capturado:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && ideaId) {
      fetchIdeaReport();
    }
  }, [isOpen, ideaId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const chartData = {
    labels: ['Votos Positivos', 'Votos Negativos'],
    datasets: [
      {
        data: [
          reportData?.votesBreakdown.positive || 0,
          reportData?.votesBreakdown.negative || 0,
        ],
        backgroundColor: [
          '#10B981', // Verde para positivos
          '#EF4444', // Vermelho para negativos
        ],
        borderColor: [
          '#059669',
          '#DC2626',
        ],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 14,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const value = context.parsed;
            const total = reportData?.votesBreakdown.total || 0;
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
            return `${context.label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Relatório da Ideia
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600 dark:text-gray-400">Carregando relatório...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {reportData && (
            <div className="space-y-6">
              {/* Informações da Ideia */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {reportData.idea.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-3">
                  {reportData.idea.content}
                </p>
                <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <span>Autor: {reportData.idea.author_name}</span>
                  <span>Criada em: {formatDate(reportData.idea.created_at)}</span>
                  <span>Total de votos: {reportData.idea.total_votes}</span>
                </div>
              </div>

              {/* Gráfico e Estatísticas */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Gráfico de Pizza */}
                <div className="bg-white dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Distribuição dos Votos
                  </h3>
                  {reportData.votesBreakdown.total > 0 ? (
                    <div className="h-64">
                      <Pie data={chartData} options={chartOptions} />
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
                      <div className="text-center">
                        <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <p>Nenhum voto registrado</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Estatísticas Resumidas */}
                <div className="bg-white dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Estatísticas
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                        <span className="text-gray-600 dark:text-gray-400">Votos Positivos</span>
                      </div>
                      <span className="text-xl font-bold text-green-600">
                        {reportData.votesBreakdown.positive}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
                        <span className="text-gray-600 dark:text-gray-400">Votos Negativos</span>
                      </div>
                      <span className="text-xl font-bold text-red-600">
                        {reportData.votesBreakdown.negative}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-600">
                      <span className="text-gray-600 dark:text-gray-400">Total</span>
                      <span className="text-xl font-bold text-gray-900 dark:text-white">
                        {reportData.votesBreakdown.total}
                      </span>
                    </div>
                    {reportData.votesBreakdown.total > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Aprovação</span>
                        <span className="text-xl font-bold text-blue-600">
                          {((reportData.votesBreakdown.positive / reportData.votesBreakdown.total) * 100).toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Lista Detalhada dos Votos */}
              <div className="bg-white dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Detalhamento dos Votos
                </h3>
                
                {reportData.votes.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-600">
                        <tr>
                          <th className="px-4 py-2 text-left text-gray-900 dark:text-white">Tipo</th>
                          <th className="px-4 py-2 text-left text-gray-900 dark:text-white">Usuário</th>
                          <th className="px-4 py-2 text-left text-gray-900 dark:text-white">Email</th>
                          <th className="px-4 py-2 text-left text-gray-900 dark:text-white">Data</th>
                          <th className="px-4 py-2 text-left text-gray-900 dark:text-white">Visibilidade</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                        {reportData.votes.map((vote) => (
                          <tr key={vote.id} className="hover:bg-gray-50 dark:hover:bg-gray-600">
                            <td className="px-4 py-2">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                vote.vote === true 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              }`}>
                                {vote.vote === true ? (
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                                  </svg>
                                ) : (
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.7m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1413.608-2.007L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                                  </svg>
                                )}
                                {vote.vote === true ? 'Positivo' : 'Negativo'}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-gray-900 dark:text-white">
                              {vote.user_name}
                            </td>
                            <td className="px-4 py-2 text-gray-600 dark:text-gray-400">
                              {vote.user_email}
                            </td>
                            <td className="px-4 py-2 text-gray-600 dark:text-gray-400">
                              {formatDate(vote.created_at)}
                            </td>
                            <td className="px-4 py-2">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                vote.showVotes
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              }`}>
                                {vote.showVotes ? 'Público' : 'Privado'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p>Nenhum voto registrado para esta ideia</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IdeaReportModal;

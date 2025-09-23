import React, { useState, useEffect, useCallback } from 'react';
import ChartComponent from './ChartComponent';
import { getIdeaReport } from '../services/reportService';
import { formatDate } from '../services/reportService';

interface IdeaReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  ideaId: number;
}

const IdeaReportModal: React.FC<IdeaReportModalProps> = ({ isOpen, onClose, ideaId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<{
    idea: any;
    votesBreakdown: {
      total: number;
      positive: number;
      negative: number;
    };
  } | null>(null);

  const fetchIdeaData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Usar apenas o relatório da ideia que já inclui os dados da ideia
      const reportResponse = await getIdeaReport(ideaId);

      setReportData(reportResponse);
    } catch (err: any) {
      console.error('Erro ao buscar dados:', err);
      setError(err.message || 'Erro ao carregar dados do relatório');
    } finally {
      setLoading(false);
    }
  }, [ideaId]);

  // Buscar dados quando o modal abrir
  useEffect(() => {
    if (isOpen && ideaId) {
      fetchIdeaData();
    }
  }, [isOpen, ideaId, fetchIdeaData]);

  // Preparar dados para o gráfico
  const chartData = reportData ? [
    { name: 'Aprovados', value: reportData.votesBreakdown.positive, color: '#22c55e' },
    { name: 'Rejeitados', value: reportData.votesBreakdown.negative, color: '#ef4444' }
  ] : [];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Relatório de Votação - Ideia #{ideaId}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Carregando dados do relatório...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-800 dark:text-red-200 font-medium">Erro ao carregar relatório</p>
            </div>
            <p className="text-red-600 dark:text-red-400 text-sm mt-1">{error}</p>
            <button
              onClick={fetchIdeaData}
              className="mt-3 px-4 py-2 bg-red-600 dark:bg-red-500 text-white rounded hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
                {reportData?.idea.title || 'Carregando...'}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
                {reportData?.idea.content || 'Carregando descrição...'}
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-xs">
                Autor: {reportData?.idea.author_name || 'Carregando...'} | Criado em: {reportData?.idea.created_at ? formatDate(reportData.idea.created_at) : 'Carregando...'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{reportData?.votesBreakdown.total || 0}</div>
                <div className="text-sm text-blue-800 dark:text-blue-200">Total de Votos</div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{reportData?.votesBreakdown.positive || 0}</div>
                <div className="text-sm text-green-800 dark:text-green-200">Aprovados ({reportData ? ((reportData.votesBreakdown.positive / reportData.votesBreakdown.total) * 100).toFixed(0) : 0}%)</div>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">{reportData?.votesBreakdown.negative || 0}</div>
                <div className="text-sm text-red-800 dark:text-red-200">Rejeitados ({reportData ? ((reportData.votesBreakdown.negative / reportData.votesBreakdown.total) * 100).toFixed(0) : 0}%)</div>
              </div>
            </div>

            <div className="mb-6">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <ChartComponent data={chartData} />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-600 dark:bg-gray-500 text-white rounded hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
              >
                Fechar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default IdeaReportModal;
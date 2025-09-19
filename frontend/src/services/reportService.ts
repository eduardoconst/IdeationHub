// Report Service
// Serviço para comunicação com as APIs de relatórios

const API_BASE_URL = 'http://localhost:4000/api';

// Interface para dados de relatório do dashboard
export interface DashboardMetrics {
  overview: {
    totalUsers: number;
    totalIdeas: number;
    totalVotes: number;
    totalAdmins: number;
    positiveVotes: number;
    negativeVotes: number;
  };
  recentActivity: {
    newUsers: number;
    newIdeas: number;
    newVotes: number;
  };
  topIdeas: Array<{
    id: number;
    title: string;
    author_name: string;
    vote_count: number;
  }>;
  topUsers: Array<{
    id: number;
    name: string;
    email: string;
    ideas_count: number;
    votes_count: number;
    total_activity: number;
  }>;
}

// Interface para relatório pessoal
export interface PersonalReport {
  user: {
    name: string;
    email: string;
    created_at: string;
  };
  stats: {
    totalIdeas: number;
    totalVotesGiven: number;
    totalVotesReceived: number;
    positiveVotesGiven: number;
    positiveVotesReceived: number;
    engagementRate: string;
  };
  ideas: Array<{
    id: number;
    title: string;
    content: string;
    created_at: string;
    positive_votes: number;
    negative_votes: number;
    total_votes: number;
  }>;
  votesGiven: Array<{
    type: string;
    created_at: string;
    idea_title: string;
    author_name: string;
  }>;
  votesReceived: Array<{
    type: string;
    created_at: string;
    idea_title: string;
    voter_name: string;
  }>;
}

// Interface para voto no relatório de ideia
export interface ReportVote {
  id: number;
  vote: boolean;
  createdAt: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

// Interface para dados do relatório de ideia
export interface IdeaReportData {
  cardId: number;
  cardTitle: string;
  totalVotes: number;
  positiveVotes: number;
  negativeVotes: number;
  votes: ReportVote[];
}

// Função para buscar métricas do dashboard
export const getDashboardMetrics = async (): Promise<DashboardMetrics> => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/reports/dashboard`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Erro ao buscar métricas do dashboard');
  }

  return response.json();
};

// Função para buscar relatório pessoal
export const getPersonalReport = async (): Promise<PersonalReport> => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/reports/personal`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Erro ao buscar relatório pessoal');
  }

  return response.json();
};

// Função para buscar relatório de ideia específica
export const getIdeaReport = async (cardId: number): Promise<IdeaReportData> => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/reports/idea/${cardId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Erro ao buscar relatório da ideia');
  }

  return response.json();
};

// Função para formatar data brasileira
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Função para exportar dados em CSV (placeholder)
export const exportToCSV = (data: any[], filename: string): void => {
  console.log('Exportando para CSV:', filename, data);
  // Implementação futura para exportação CSV
};

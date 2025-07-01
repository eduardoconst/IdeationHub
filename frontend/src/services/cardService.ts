import api from './api';

// Interface para dados do card
export interface Card {
  id: number;
  title: string;
  content: string;
  userName: string;
  userID: number;
  voting_start: string;
  voting_end: string;
  status?: string;
  votes?: {
    yes: number;
    no: number;
  };
}

// Interface para criar novo card
export interface CreateCardData {
  title: string;
  content: string;
  userID: number;
  voting_start: string;
  voting_end: string;
}

// Interface para votar
export interface VoteData {
  cardID: number;
  userID: number;
  vote: boolean; 
  anonymous?: boolean;
  showVotes?: boolean;
}


export const getCards = async (): Promise<Card[]> => {
  try {
    const response = await api.get('/cards');
    return response.data;
  } catch (error: any) {
    console.error('Erro ao buscar cards:', error);
    throw new Error('Erro ao carregar ideias. Tente novamente.');
  }
};


export const getCardById = async (id: number): Promise<Card> => {
  try {
    const response = await api.get(`/cards/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Erro ao buscar card:', error);
    throw new Error('Erro ao carregar ideia. Tente novamente.');
  }
};

/**
 * Cria um novo card
 */
export const createCard = async (cardData: CreateCardData): Promise<void> => {
  try {
    await api.post('/cards', cardData);
  } catch (error: any) {
    console.error('Erro ao criar card:', error);
    if (error.response?.data) {
      throw new Error(error.response.data);
    }
    throw new Error('Erro ao criar ideia. Tente novamente.');
  }
};

/**
 * Deleta um card
 */
export const deleteCard = async (id: number): Promise<void> => {
  try {
    await api.delete(`/cards/${id}`);
  } catch (error: any) {
    console.error('Erro ao deletar card:', error);
    if (error.response?.data) {
      throw new Error(error.response.data);
    }
    throw new Error('Erro ao deletar ideia. Tente novamente.');
  }
};

/**
 * Vota em um card
 */
export const voteCard = async (voteData: VoteData): Promise<void> => {
  try {
    await api.post('/votes', voteData);
  } catch (error: any) {
    console.error('Erro ao votar:', error);
    if (error.response?.data) {
      throw new Error(error.response.data);
    }
    throw new Error('Erro ao registrar voto. Tente novamente.');
  }
};

/**
 * Busca votos de um card específico (Substituída por getCardVoteCount)
 */
export const getCardVotes = async (cardId: number): Promise<{ yes: number; no: number }> => {
  try {
    // Usa a rota correta implementada
    const response = await api.get(`/votes/count/${cardId}`);
    return response.data;
  } catch (error: any) {
    console.error('Erro ao buscar votos:', error);
    // Retorna zeros se não conseguir buscar
    return { yes: 0, no: 0 };
  }
};

/**
 * Busca o voto do usuário atual em um card específico
 */
export const getUserVoteForCard = async (cardId: number, userId: number): Promise<boolean | null> => {
  try {
    const response = await api.get(`/votes/user/${userId}/card/${cardId}`);
    return response.data.vote; // true = sim, false = não, null = não votou
  } catch (error: any) {
    console.error('Erro ao buscar voto do usuário:', error);
    return null; // Usuário não votou
  }
};

/**
 * Busca contagem de votos de um card específico
 */
export const getCardVoteCount = async (cardId: number): Promise<{ yes: number; no: number }> => {
  try {
    const response = await api.get(`/votes/count/${cardId}`);
    return response.data;
  } catch (error: any) {
    console.error('Erro ao buscar contagem de votos:', error);
    return { yes: 0, no: 0 };
  }
};

/**
 * Busca o total de votos positivos de todos os cards
 */
export const getTotalPositiveVotes = async (): Promise<number> => {
  try {
    const response = await api.get('/votes/total-positive');
    return response.data.total || 0;
  } catch (error: any) {
    console.error('Erro ao buscar total de votos positivos:', error);
    return 0;
  }
};

/**
 * Remove o voto de um usuário em um card específico
 */
export const removeUserVote = async (cardId: number, userId: number): Promise<void> => {
  try {
    await api.delete(`/votes/user/${userId}/card/${cardId}`);
  } catch (error: any) {
    console.error('Erro ao remover voto:', error);
    throw new Error('Erro ao remover voto. Tente novamente.');
  }
};

/**
 * Busca o total de usuários cadastrados no sistema
 */
export const getTotalUsers = async (): Promise<number> => {
  try {
    const response = await api.get('/users/total-count');
    return response.data.total || 0;
  } catch (error: any) {
    console.error('Erro ao buscar total de usuários:', error);
    return 0;
  }
};

/**
 * RESUMO: adminService.ts
 * 
 * Serviços de administração para comunicação com o backend
 * - Estatísticas do sistema
 * - Gerenciamento de usuários
 * - Ações administrativas
 */

import api from './api';

// Interface para estatísticas administrativas
export interface AdminStats {
  totalUsers: number;
  totalIdeas: number;
  totalVotes: number;
  activeIdeas: number;
}

// Interface para usuários administrativos
export interface AdminUser {
  id: number;
  name: string;
  email: string;
  admin: boolean;
  created_at?: string; // Opcional por enquanto
  deleted_at?: string;
}

/**
 * Busca estatísticas gerais do sistema
 */
export const getAdminStats = async (): Promise<AdminStats> => {
  try {
    const response = await api.get('/admin/stats');
    return response.data;
  } catch (error: any) {
    console.error('Erro ao buscar estatísticas admin:', error);
    throw new Error(error.response?.data?.message || 'Erro ao carregar estatísticas');
  }
};

/**
 * Busca todos os usuários do sistema
 */
export const getAllUsers = async (): Promise<AdminUser[]> => {
  try {
    const response = await api.get('/admin/users');
    return response.data;
  } catch (error: any) {
    console.error('Erro ao buscar usuários:', error);
    throw new Error(error.response?.data?.message || 'Erro ao carregar usuários');
  }
};

/**
 * Torna um usuário administrador
 */
export const promoteUser = async (userId: number): Promise<void> => {
  try {
    await api.patch(`/admin/users/${userId}/promote`);
  } catch (error: any) {
    console.error('Erro ao promover usuário:', error);
    throw new Error(error.response?.data?.message || 'Erro ao promover usuário');
  }
};

/**
 * Remove privilégios de administrador de um usuário
 */
export const demoteUser = async (userId: number): Promise<void> => {
  try {
    await api.patch(`/admin/users/${userId}/demote`);
  } catch (error: any) {
    console.error('Erro ao rebaixar usuário:', error);
    throw new Error(error.response?.data?.message || 'Erro ao rebaixar usuário');
  }
};

/**
 * Exclui um usuário do sistema (soft delete)
 */
export const deleteUser = async (userId: number): Promise<void> => {
  try {
    await api.delete(`/admin/users/${userId}`);
  } catch (error: any) {
    console.error('Erro ao excluir usuário:', error);
    throw new Error(error.response?.data?.message || 'Erro ao excluir usuário');
  }
};

/**
 * Atualiza cache/dados do sistema
 */
export const refreshSystemData = async (): Promise<void> => {
  try {
    await api.post('/admin/refresh');
  } catch (error: any) {
    console.error('Erro ao atualizar dados:', error);
    throw new Error(error.response?.data?.message || 'Erro ao atualizar dados');
  }
};

/**
 * Exporta dados do sistema
 */
export const exportSystemData = async (): Promise<Blob> => {
  try {
    const response = await api.get('/admin/export', {
      responseType: 'blob'
    });
    return response.data;
  } catch (error: any) {
    console.error('Erro ao exportar dados:', error);
    throw new Error(error.response?.data?.message || 'Erro ao exportar dados');
  }
};

/**
 * Limpa dados antigos do sistema
 */
export const cleanupOldData = async (): Promise<void> => {
  try {
    await api.post('/admin/cleanup');
  } catch (error: any) {
    console.error('Erro ao limpar dados:', error);
    throw new Error(error.response?.data?.message || 'Erro ao limpar dados');
  }
};

/**
 * Cria backup do sistema
 */
export const createSystemBackup = async (): Promise<void> => {
  try {
    await api.post('/admin/backup');
  } catch (error: any) {
    console.error('Erro ao criar backup:', error);
    throw new Error(error.response?.data?.message || 'Erro ao criar backup');
  }
};

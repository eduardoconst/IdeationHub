/**
 * RESUMO: authService.ts
 * 
 * Serviços de autenticação para comunicação com o backend
 * - Cadastro de usuários
 * - Login de usuários
 * - Logout
 * - Verificação de token
 */

import api from './api';

// Interface para dados de cadastro
export interface SignupData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// Interface para dados de login
export interface LoginData {
  email: string;
  password: string;
}

// Interface para resposta do usuário
export interface UserResponse {
  id: number;
  name: string;
  email: string;
  admin: boolean;
  token?: string;
}

// Interface para atualização de perfil
export interface UpdateProfileData {
  name: string;
}

// Interface para mudança de senha
export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Cadastra um novo usuário
 */
export const signup = async (userData: SignupData): Promise<UserResponse> => {
  try {
    const response = await api.post('/signup', userData);
    
    // Se o cadastro foi bem-sucedido e retornou um token
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    
    return response.data;
  } catch (error: any) {
    // Tratamento de erros específicos
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Erro ao criar conta. Tente novamente.');
  }
};

/**
 * Faz login do usuário
 */
export const login = async (credentials: LoginData): Promise<UserResponse> => {
  try {
    const response = await api.post('/signin', credentials);
    
    // Salva o token no localStorage
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Email ou senha incorretos.');
  }
};

/**
 * Faz logout do usuário
 */
export const logout = () => {
  localStorage.removeItem('token');
};

/**
 * Verifica se o usuário está autenticado
 */
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('token');
  return !!token;
};

/**
 * Obtém dados do usuário atual
 */
export const getCurrentUser = async (): Promise<UserResponse | null> => {
  try {
    if (!isAuthenticated()) {
      console.log('❌ Não autenticado - sem token');
      return null;
    }
    
    console.log('🔍 Validando token com backend...');
    
    // Usar uma rota protegida que já valida o token no header
    // Como não temos /users/me, vamos usar validateToken corretamente
    const token = localStorage.getItem('token');
    console.log('🔑 Token:', token?.substring(0, 20) + '...');
    
    const response = await api.post('/validateToken', { token });
    console.log('📡 Resposta validateToken:', response.data);
    
    // Se validateToken retorna true, precisamos decodificar o token para obter os dados
    if (response.data === true) {
      console.log('✅ Token válido, decodificando...');
      // Decodificar token JWT para obter dados do usuário
      const payload = JSON.parse(atob(token!.split('.')[1]));
      console.log('👤 Dados do usuário:', payload);
      
      return {
        id: payload.id,
        name: payload.name,
        email: payload.email,
        admin: payload.admin
      };
    }
    
    console.log('❌ Token inválido');
    throw new Error('Token inválido');
  } catch (error) {
    console.error('❌ Erro ao validar token:', error);
    logout(); // Remove token inválido
    return null;
  }
};

/**
 * Atualiza dados do perfil do usuário
 */
export const updateUserProfile = async (userData: UpdateProfileData): Promise<UserResponse> => {
  try {
    const response = await api.put('/users/profile', userData);
    return response.data;
  } catch (error: any) {
    console.error('Erro ao atualizar perfil:', error);
    
    if (error.response?.status === 403) {
      throw new Error('Acesso negado. Faça login novamente.');
    }
    
    if (error.response?.status === 401) {
      throw new Error('Não autorizado. Faça login novamente.');
    }
    
    if (error.response?.data) {
      // Se o backend retorna string diretamente
      if (typeof error.response.data === 'string') {
        throw new Error(error.response.data);
      }
      // Se o backend retorna objeto com message
      if (error.response.data.message) {
        throw new Error(error.response.data.message);
      }
    }
    
    throw new Error('Erro ao atualizar perfil. Tente novamente.');
  }
};

/**
 * Altera a senha do usuário
 */
export const changePassword = async (passwordData: ChangePasswordData): Promise<void> => {
  try {
    await api.put('/users/password', passwordData);
  } catch (error: any) {
    console.error('Erro ao alterar senha:', error);
    
    if (error.response?.status === 403) {
      throw new Error('Acesso negado. Faça login novamente.');
    }
    
    if (error.response?.status === 401) {
      throw new Error('Não autorizado. Faça login novamente.');
    }
    
    if (error.response?.data) {
      // Se o backend retorna string diretamente
      if (typeof error.response.data === 'string') {
        throw new Error(error.response.data);
      }
      // Se o backend retorna objeto com message
      if (error.response.data.message) {
        throw new Error(error.response.data.message);
      }
    }
    
    throw new Error('Erro ao alterar senha. Verifique sua senha atual.');
  }
};

/**
 * Deleta a conta do usuário
 */
export const deleteAccount = async (): Promise<void> => {
  try {
    await api.delete('/users/account');
    logout(); // Remove token após deletar conta
  } catch (error: any) {
    console.error('Erro ao deletar conta:', error);
    
    if (error.response?.status === 403) {
      throw new Error('Acesso negado. Faça login novamente.');
    }
    
    if (error.response?.status === 401) {
      throw new Error('Não autorizado. Faça login novamente.');
    }
    
    if (error.response?.data) {
      // Se o backend retorna string diretamente
      if (typeof error.response.data === 'string') {
        throw new Error(error.response.data);
      }
      // Se o backend retorna objeto com message
      if (error.response.data.message) {
        throw new Error(error.response.data.message);
      }
    }
    
    throw new Error('Erro ao deletar conta. Tente novamente.');
  }
};

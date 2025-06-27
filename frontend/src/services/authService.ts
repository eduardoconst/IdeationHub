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
  window.location.href = '/';
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
    if (!isAuthenticated()) return null;
    
    const response = await api.get('/user/current');
    return response.data;
  } catch (error) {
    logout(); // Remove token inválido
    return null;
  }
};

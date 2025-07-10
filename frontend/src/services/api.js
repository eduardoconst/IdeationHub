// Configura axios para comunicação com backend

import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000', // Porta correta do backend
  timeout: 10000, // 10 segundos de timeout
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptador para adicionar token de autenticação automaticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('🔍 Fazendo requisição:', config.method?.toUpperCase(), config.url);
    console.log('🔑 Token presente:', token ? 'Sim' : 'Não');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('📤 Header Authorization:', config.headers.Authorization.substring(0, 20) + '...');
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Erro no interceptor de request:', error);
    return Promise.reject(error);
  }
);

// Interceptador para tratar respostas e erros
api.interceptors.response.use(
  (response) => {
    console.log('✅ Resposta bem-sucedida:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ Erro na resposta:', error.response?.status, error.response?.data);
    console.error('❌ URL que falhou:', error.config?.url);
    
    if (error.response?.status === 401) {
      console.warn('🚨 Token expirado ou inválido - removendo token');
      // Token expirado ou inválido
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    
    return Promise.reject(error);
  }
);

export default api;
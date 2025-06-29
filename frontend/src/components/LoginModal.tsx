
import { useState } from 'react';
import { login, LoginData } from '../services/authService';
import { useAuth } from '../context/AuthContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignup: () => void;
  onLoginSuccess?: (user: any) => void; // Callback para quando login for bem-sucedido
}

const LoginModal = ({ isOpen, onClose, onSwitchToSignup, onLoginSuccess }: LoginModalProps) => {
  const { login: loginUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(''); // Limpa erros anteriores
    
    try {
      // Chama o serviço de login
      const credentials: LoginData = {
        email,
        password
      };

      const response = await login(credentials);
        // Sucesso! Usuário foi autenticado
      console.log('Login realizado com sucesso:', response);
      
      // Atualiza o contexto global
      loginUser(response);
      
      // Limpa o formulário
      setEmail('');
      setPassword('');
      
      // Chama callback de sucesso (para atualizar estado no componente pai)
      if (onLoginSuccess) {
        onLoginSuccess(response);
      }
      
      // Fecha o modal
      onClose();
        } catch (error: any) {
      // Trata erros vindos do backend
      console.error('Erro no login:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Entrar
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Erro geral */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="seu@email.com"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="••••••••"
              required
            />
          </div>

          {/* Forgot password */}
          <div className="text-right">
            <button
              type="button"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Esqueceu a senha?
            </button>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              'Entrar'
            )}
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                ou
              </span>
            </div>
          </div>

          {/* Switch to signup */}
          <div className="text-center">
            <span className="text-gray-600 dark:text-gray-400">
              Não tem uma conta?{' '}
            </span>
            <button
              type="button"
              onClick={onSwitchToSignup}
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Cadastre-se
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;

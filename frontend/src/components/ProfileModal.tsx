/**
 * RESUMO: ProfileModal.tsx
 * 
 * Modal único para gerenciar o perfil do usuário
 * - Alterar nome
 * - Email (somente leitura)
 * - Alterar senha (com confirmação)
 * - Deletar conta (soft delete)
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateUserProfile, changePassword, deleteAccount } from '../services/authService';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileModal = ({ isOpen, onClose }: ProfileModalProps) => {
  const { user, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  // Estados para edição de perfil
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  
  // Estados para mudança de senha
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Estados para deletar conta
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Estados de feedback
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Atualizar estados quando o usuário mudar
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  // Verificar token ao abrir modal
  useEffect(() => {
    if (isOpen) {
      const token = localStorage.getItem('token');
      console.log('🔑 Token no localStorage:', token ? 'Presente' : 'Ausente');
      console.log('👤 Usuário logado:', user);
      
      if (!token) {
        setMessage({ type: 'error', text: 'Token de autenticação não encontrado. Faça login novamente.' });
      }
    }
  }, [isOpen, user]);

  // Limpar mensagem após 5 segundos
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleUpdateProfile = async () => {
    if (!name.trim()) {
      setMessage({ type: 'error', text: 'Nome é obrigatório' });
      return;
    }

    if (name.trim().length < 2) {
      setMessage({ type: 'error', text: 'Nome deve ter pelo menos 2 caracteres' });
      return;
    }

    // Teste manual de autenticação antes de tentar atualizar
    const token = localStorage.getItem('token');
    if (!token) {
      setMessage({ type: 'error', text: 'Token não encontrado. Faça login novamente.' });
      return;
    }

    setIsLoading(true);
    setMessage(null);
    
    try {
      console.log('🔍 Token que será usado:', token.substring(0, 50) + '...');
      console.log('📤 Tentando atualizar perfil com:', { name: name.trim() });
      
      const updatedUser = await updateUserProfile({ name: name.trim() });
      console.log('✅ Perfil atualizado com sucesso:', updatedUser);
      setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
      // Recarregar para atualizar dados do usuário
      setTimeout(() => window.location.reload(), 1500);
    } catch (error: any) {
      console.error('❌ Erro detalhado ao atualizar perfil:', error);
      
      // Se for erro 401 ou 403, force um novo login
      if (error.message.includes('401') || error.message.includes('403') || error.message.includes('Acesso negado')) {
        setMessage({ type: 'error', text: 'Sessão expirada. Fazendo logout...' });
        setTimeout(() => {
          logout();
          onClose();
        }, 2000);
      } else {
        setMessage({ type: 'error', text: error.message || 'Erro ao atualizar perfil' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword) {
      setMessage({ type: 'error', text: 'Senha atual é obrigatória' });
      return;
    }

    if (!newPassword) {
      setMessage({ type: 'error', text: 'Nova senha é obrigatória' });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Nova senha deve ter pelo menos 6 caracteres' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Confirmação de senha não confere' });
      return;
    }

    if (currentPassword === newPassword) {
      setMessage({ type: 'error', text: 'A nova senha deve ser diferente da atual' });
      return;
    }

    setIsLoading(true);
    setMessage(null);
    
    try {
      console.log('Tentando alterar senha...');
      await changePassword({
        currentPassword,
        newPassword,
        confirmPassword
      });
      console.log('Senha alterada com sucesso');
      setMessage({ type: 'success', text: 'Senha alterada com sucesso!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Erro detalhado ao alterar senha:', error);
      setMessage({ type: 'error', text: error.message || 'Erro ao alterar senha' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETAR') {
      setMessage({ type: 'error', text: 'Digite "DELETAR" para confirmar' });
      return;
    }

    setIsLoading(true);
    setMessage(null);
    
    try {
      console.log('Tentando deletar conta...');
      await deleteAccount();
      console.log('Conta deletada com sucesso');
      setMessage({ type: 'success', text: 'Conta deletada com sucesso' });
      setTimeout(() => {
        logout();
        onClose();
      }, 2000);
    } catch (error: any) {
      console.error('Erro detalhado ao deletar conta:', error);
      setMessage({ type: 'error', text: error.message || 'Erro ao deletar conta' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  if (!user) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">
              Você precisa estar logado para acessar seu perfil.
            </p>
            <button
              onClick={onClose}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            👤 Meu Perfil
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

        {/* Message */}
        {message && (
          <div className={`p-3 rounded-lg mb-6 ${
            message.type === 'success' 
              ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
          }`}>
            <p className="text-sm">{message.text}</p>
          </div>
        )}

        <div className="space-y-8">
          {/* Seção 1: Informações do Perfil */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
              Informações do Perfil
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nome
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Seu nome completo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  O email não pode ser alterado
                </p>
              </div>
            </div>

            <button
              onClick={handleUpdateProfile}
              disabled={isLoading || name.trim() === user.name}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg font-medium transition-colors"
            >
              {isLoading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>

          {/* Seção 2: Alterar Senha */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
              Alterar Senha
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Senha Atual
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Digite sua senha atual"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nova Senha
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nova senha (mín. 6 caracteres)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirmar Nova Senha
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Confirme a nova senha"
                />
              </div>
            </div>

            <button
              onClick={handleChangePassword}
              disabled={isLoading || !currentPassword || !newPassword || !confirmPassword}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg font-medium transition-colors"
            >
              {isLoading ? 'Alterando...' : 'Alterar Senha'}
            </button>
          </div>

          {/* Seção 3: Zona de Perigo */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 border-b border-red-200 dark:border-red-800 pb-2">
              Zona de Perigo
            </h3>
            
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">
                Deletar Conta
              </h4>
              <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                Esta ação é irreversível. Sua conta será desativada permanentemente, mas seus dados serão preservados por questões de auditoria.
              </p>
              
              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Deletar Minha Conta
                </button>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-red-700 dark:text-red-300 mb-2">
                      Digite "DELETAR" para confirmar:
                    </label>
                    <input
                      type="text"
                      value={deleteConfirmation}
                      onChange={(e) => setDeleteConfirmation(e.target.value)}
                      className="w-full px-3 py-2 border border-red-300 dark:border-red-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Digite DELETAR"
                    />
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setDeleteConfirmation('');
                      }}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleDeleteAccount}
                      disabled={isLoading || deleteConfirmation !== 'DELETAR'}
                      className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg font-medium transition-colors"
                    >
                      {isLoading ? 'Deletando...' : 'Confirmar Deleção'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;

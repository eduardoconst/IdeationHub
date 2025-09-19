import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  getAdminStats, 
  getAllUsers, 
  promoteUser, 
  demoteUser, 
  deleteUser,
  refreshSystemData,
  cleanupOldData,
  AdminStats,
  AdminUser
} from '../services/adminService';

interface AdminCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAction: (action: string, data?: any) => void;
}

const AdminCenterModal = ({ isOpen, onClose, onAction }: AdminCenterModalProps) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users'>('dashboard');
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalIdeas: 0,
    totalVotes: 0,
    activeIdeas: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para gerenciamento de usuários
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmAction, setConfirmAction] = useState<{type: 'delete' | 'promote' | 'demote', userId: number, username: string} | null>(null);
  
  const { user } = useAuth();

  const loadAdminStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('🔄 Carregando estatísticas administrativas...');
      const statsData = await getAdminStats();
      console.log('✅ Estatísticas carregadas:', statsData);
      setStats(statsData);
    } catch (error: any) {
      console.error('❌ Erro ao carregar estatísticas:', error);
      setError(error.message);
      // Fallback para dados simulados em caso de erro
      setStats({
        totalUsers: 0,
        totalIdeas: 0,
        totalVotes: 0,
        activeIdeas: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      console.log('🔄 Carregando usuários...');
      const usersData = await getAllUsers();
      console.log('✅ Usuários carregados:', usersData);
      setUsers(usersData);
    } catch (error: any) {
      console.error('❌ Erro ao carregar usuários:', error);
      setError(error.message);
      // Fallback para dados simulados em caso de erro
      setUsers([]);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadAdminStats();
      loadUsers();
    }
  }, [isOpen]);

  if (!isOpen || !user || !user.admin) return null;

  const handleQuickAction = async (actionType: string, data?: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`🔄 Executando ação: ${actionType}`);
      
      switch (actionType) {
        case 'refresh_data':
          await refreshSystemData();
          await loadAdminStats();
          await loadUsers();
          console.log('✅ Dados atualizados com sucesso');
          break;
          
        case 'cleanup_old_votes':
          await cleanupOldData();
          await loadAdminStats();
          console.log('✅ Limpeza realizada com sucesso');
          break;
          
        default:
          console.log(`Ação não implementada: ${actionType}`);
      }
      
      onAction(actionType, data);
    } catch (error: any) {
      console.error(`❌ Erro na ação ${actionType}:`, error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
        📊 Dashboard Administrativo
      </h3>
      
      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {isLoading ? '...' : stats.totalUsers}
          </div>
          <div className="text-sm text-blue-600 dark:text-blue-400">Usuários</div>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {isLoading ? '...' : stats.totalIdeas}
          </div>
          <div className="text-sm text-green-600 dark:text-green-400">Ideias</div>
        </div>
        
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {isLoading ? '...' : stats.totalVotes}
          </div>
          <div className="text-sm text-purple-600 dark:text-purple-400">Votos</div>
        </div>
        
        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {isLoading ? '...' : stats.activeIdeas}
          </div>
          <div className="text-sm text-orange-600 dark:text-orange-400">Ativas</div>
        </div>
      </div>

      {/* Ações Rápidas */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
          🚀 Ações Rápidas
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            onClick={() => handleQuickAction('refresh_data')}
            disabled={isLoading}
            className="flex items-center p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
            <span className="text-blue-700 dark:text-blue-300">
              {isLoading ? 'Atualizando...' : 'Atualizar Dados'}
            </span>
          </button>
          
          <button
            onClick={() => handleQuickAction('cleanup_old_votes')}
            disabled={isLoading}
            className="flex items-center p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5 text-orange-600 dark:text-orange-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span className="text-orange-700 dark:text-orange-300">Limpar Dados Antigos</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => {
    const filteredUsers = users.filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleToggleAdmin = async (userId: number, currentAdminStatus: boolean) => {
      const userItem = users.find(u => u.id === userId);
      if (!userItem) return;
      
      setConfirmAction({
        type: currentAdminStatus ? 'demote' : 'promote',
        userId,
        username: userItem.name
      });
    };

    const handleDeleteUser = (userId: number) => {
      const userItem = users.find(u => u.id === userId);
      if (!userItem) return;
      
      setConfirmAction({
        type: 'delete',
        userId,
        username: userItem.name
      });
    };

    const confirmUserAction = async () => {
      if (!confirmAction) return;

      const { type, userId } = confirmAction;
      
      try {
        setIsLoading(true);
        
        if (type === 'delete') {
          await deleteUser(userId);
          setUsers(users.filter(u => u.id !== userId));
          onAction('delete_user', { userId });
        } else if (type === 'promote') {
          await promoteUser(userId);
          setUsers(users.map(u => u.id === userId ? { ...u, admin: true } : u));
          onAction('promote_user', { userId });
        } else if (type === 'demote') {
          await demoteUser(userId);
          setUsers(users.map(u => u.id === userId ? { ...u, admin: false } : u));
          onAction('demote_user', { userId });
        }
      } catch (error: any) {
        console.error('Erro na ação administrativa:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
      
      setConfirmAction(null);
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            👥 Gerenciar Usuários
          </h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {filteredUsers.length} usuários
            </span>
          </div>
        </div>

        {/* Busca */}
        <div className="relative">
          <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar usuários por nome ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Lista de Usuários */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Usuário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                {filteredUsers.map((userItem) => (
                  <tr key={userItem.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                              {userItem.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {userItem.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {userItem.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        userItem.admin 
                          ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                      }`}>
                        {userItem.admin ? '🛡️ Admin' : '👤 Usuário'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      {userItem.id !== user?.id && (
                        <>
                          <button
                            onClick={() => handleToggleAdmin(userItem.id, userItem.admin)}
                            className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium transition-colors ${
                              userItem.admin
                                ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-900/30'
                                : 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/30'
                            }`}
                          >
                            {userItem.admin ? '👤 Remover Admin' : '🛡️ Tornar Admin'}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(userItem.id)}
                            className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors"
                          >
                            🗑️ Excluir
                          </button>
                        </>
                      )}
                      {userItem.id === user?.id && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 italic">
                          (Você)
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-8">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            <p className="text-gray-600 dark:text-gray-400">
              Nenhum usuário encontrado com o termo "{searchTerm}"
            </p>
          </div>
        )}

        {/* Modal de Confirmação */}
        {confirmAction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Confirmar Ação
              </h4>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {confirmAction.type === 'delete' && `Tem certeza que deseja excluir o usuário "${confirmAction.username}"? Esta ação não pode ser desfeita.`}
                {confirmAction.type === 'promote' && `Tem certeza que deseja tornar "${confirmAction.username}" um administrador?`}
                {confirmAction.type === 'demote' && `Tem certeza que deseja remover os privilégios de administrador de "${confirmAction.username}"?`}
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setConfirmAction(null)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmUserAction}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    confirmAction.type === 'delete'
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {confirmAction.type === 'delete' ? 'Excluir' : 'Confirmar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg max-w-7xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              🛡️ Centro Administrativo
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Bem-vindo, {user.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-800 dark:text-red-200 text-sm font-medium">
                {error}
              </span>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {[
            { key: 'dashboard', label: '📊 Dashboard' },
            { key: 'users', label: '👥 Usuários' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'users' && renderUsers()}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminCenterModal;
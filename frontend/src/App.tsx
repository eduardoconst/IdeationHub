import { useState, useRef } from 'react';
import Home from './pages/Home';
import Navbar from './components/Navbar';
import LoginModal from './components/LoginModal';
import SignupModal from './components/SignupModal';
import CreateIdeaModal from './components/CreateIdeaModal';
import ProfileModal from './components/ProfileModal';
import AdminCenterModal from './components/AdminCenterModal';
import IdeaReportModal from './components/IdeaReportModal';
import ConfirmDialog from './components/ConfirmDialog';
import ToastContainer from './components/ToastContainer';
import { AuthProvider } from './context/AuthContext';
import { useUserPreferences } from './hooks/useUserPreferences';
import { useNotifications } from './hooks/useNotifications';

function App() {
  const { preferences, toggleDarkMode } = useUserPreferences();
  const notifications = useNotifications();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showCreateIdeaModal, setShowCreateIdeaModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAdminCenterModal, setShowAdminCenterModal] = useState(false);
  const [showIdeaReportModal, setShowIdeaReportModal] = useState(false);
  const [selectedIdeaId, setSelectedIdeaId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const homeRefreshRef = useRef<(() => void) | null>(null);

  const handleSwitchToSignup = () => {
    setShowLoginModal(false);
    setShowSignupModal(true);
  };

  const handleSwitchToLogin = () => {
    setShowSignupModal(false);
    setShowLoginModal(true);
  };

  const closeAllModals = () => {
    setShowLoginModal(false);
    setShowSignupModal(false);
    setShowCreateIdeaModal(false);
    setShowProfileModal(false);
    setShowAdminCenterModal(false);
    setShowIdeaReportModal(false);
    setSelectedIdeaId(null);
  };

  const handleOpenReport = (ideaId: number) => {
    setSelectedIdeaId(ideaId);
    setShowIdeaReportModal(true);
  };

  return (
    <AuthProvider>
      <div className={preferences.darkMode ? 'dark' : ''}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-black dark:text-white transition-colors">
          <Navbar 
            darkMode={preferences.darkMode}
            onToggleDarkMode={toggleDarkMode}
            onOpenLogin={() => setShowLoginModal(true)}
            onOpenCreateIdea={() => setShowCreateIdeaModal(true)}
            onOpenSettings={() => setShowProfileModal(true)}
            onOpenProfile={() => setShowProfileModal(true)}
            onOpenAdminCenter={() => setShowAdminCenterModal(true)}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
          
          <main className="max-w-4xl mx-auto px-4 py-6">
            <Home 
              onOpenLogin={() => setShowLoginModal(true)} 
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onRefreshRequest={(refreshFn) => {
                homeRefreshRef.current = refreshFn;
              }}
              onOpenReport={handleOpenReport}
              notifications={notifications}
            />
          </main>

          {/* Modals */}
          <LoginModal 
            isOpen={showLoginModal}
            onClose={closeAllModals}
            onSwitchToSignup={handleSwitchToSignup}
            onLoginSuccess={() => {
              closeAllModals();
            }}
          />
          
          <SignupModal 
            isOpen={showSignupModal}
            onClose={closeAllModals}
            onSwitchToLogin={handleSwitchToLogin}
          />
          
          <CreateIdeaModal 
            isOpen={showCreateIdeaModal}
            onClose={() => setShowCreateIdeaModal(false)}
            onSubmit={() => {
              // Fecha o modal após criação bem-sucedida
              setShowCreateIdeaModal(false);
              // Atualiza apenas os dados da página sem fechar outros popups
              if (homeRefreshRef.current) {
                homeRefreshRef.current();
              }
            }}
          />

          <ProfileModal 
            isOpen={showProfileModal}
            onClose={closeAllModals}
          />

          <AdminCenterModal 
            isOpen={showAdminCenterModal}
            onClose={closeAllModals}
            onAction={(action, data) => {
              console.log('Ação administrativa:', action, data);
              // Aqui você pode implementar as ações específicas
              if (action === 'refresh_data') {
                // Atualiza apenas os dados da página sem fechar outros popups
                if (homeRefreshRef.current) {
                  homeRefreshRef.current();
                }
              }
            }}
          />

          {selectedIdeaId && (
            <IdeaReportModal
              isOpen={showIdeaReportModal}
              onClose={() => {
                setShowIdeaReportModal(false);
                setSelectedIdeaId(null);
              }}
              ideaId={selectedIdeaId}
            />
          )}

          {/* Toast Notifications */}
          <ToastContainer 
            toasts={notifications.toasts} 
            onRemove={notifications.removeToast} 
          />

          {/* Confirm Dialog */}
          {notifications.confirmDialog && (
            <ConfirmDialog
              isOpen={notifications.confirmDialog.isOpen}
              title={notifications.confirmDialog.title}
              message={notifications.confirmDialog.message}
              confirmText={notifications.confirmDialog.confirmText}
              cancelText={notifications.confirmDialog.cancelText}
              type={notifications.confirmDialog.type}
              onConfirm={notifications.confirmDialog.onConfirm}
              onCancel={notifications.confirmDialog.onCancel}
            />
          )}
        </div>
      </div>
    </AuthProvider>
  );
}

export default App;
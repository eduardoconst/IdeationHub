import { useState } from 'react';
import Home from './pages/Home';
import Navbar from './components/Navbar';
import LoginModal from './components/LoginModal';
import SignupModal from './components/SignupModal';
import CreateIdeaModal from './components/CreateIdeaModal';
import SettingsModal from './components/SettingsModal';
import AdminCenterModal from './components/AdminCenterModal';
import { AuthProvider } from './context/AuthContext';
import { useUserPreferences } from './hooks/useUserPreferences';

function App() {
  const { preferences, toggleDarkMode } = useUserPreferences();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showCreateIdeaModal, setShowCreateIdeaModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAdminCenterModal, setShowAdminCenterModal] = useState(false);

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
    setShowSettingsModal(false);
    setShowAdminCenterModal(false);
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
            onOpenSettings={() => setShowSettingsModal(true)}
            onOpenAdminCenter={() => setShowAdminCenterModal(true)}
          />
          
          <main className="max-w-4xl mx-auto px-4 py-6">
            <Home onOpenLogin={() => setShowLoginModal(true)} />
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
            onClose={closeAllModals}
            onSubmit={() => {
              // Recarregar página para mostrar nova ideia
              window.location.reload();
            }}
          />

          <SettingsModal 
            isOpen={showSettingsModal}
            onClose={closeAllModals}
          />

          <AdminCenterModal 
            isOpen={showAdminCenterModal}
            onClose={closeAllModals}
            onAction={(action, data) => {
              console.log('Ação administrativa:', action, data);
              // Aqui você pode implementar as ações específicas
              if (action === 'refresh_data') {
                window.location.reload();
              }
            }}
          />
        </div>
      </div>
    </AuthProvider>
  );
}

export default App;
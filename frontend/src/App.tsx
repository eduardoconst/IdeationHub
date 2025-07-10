import { useState } from 'react';
import Home from './pages/Home';
import Navbar from './components/Navbar';
import LoginModal from './components/LoginModal';
import SignupModal from './components/SignupModal';
import CreateIdeaModal from './components/CreateIdeaModal';
import ProfileModal from './components/ProfileModal';
import AdminCenterModal from './components/AdminCenterModal';
import { AuthProvider } from './context/AuthContext';
import { useUserPreferences } from './hooks/useUserPreferences';

function App() {
  const { preferences, toggleDarkMode } = useUserPreferences();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showCreateIdeaModal, setShowCreateIdeaModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAdminCenterModal, setShowAdminCenterModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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
            onClose={closeAllModals}
            onSubmit={() => {
              // Recarregar página para mostrar nova ideia
              window.location.reload();
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
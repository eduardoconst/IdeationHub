import { useState } from 'react';
import Home from './pages/Home';
import Navbar from './components/Navbar';
import LoginModal from './components/LoginModal';
import SignupModal from './components/SignupModal';
import CreateIdeaModal from './components/CreateIdeaModal';
import { AuthProvider } from './context/AuthContext';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showCreateIdeaModal, setShowCreateIdeaModal] = useState(false);

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
  };

  return (
    <AuthProvider>
      <div className={darkMode ? 'dark' : ''}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-black dark:text-white transition-colors">
          <Navbar 
            darkMode={darkMode}
            onToggleDarkMode={() => setDarkMode(!darkMode)}
            onOpenLogin={() => setShowLoginModal(true)}
            onOpenCreateIdea={() => setShowCreateIdeaModal(true)}
          />
          
          <main className="max-w-4xl mx-auto px-4 py-6">
            <Home />
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
            onSubmit={(idea) => {
              console.log('Nova ideia criada:', idea);
              // TODO: Adicionar ideia à lista
            }}
          />
        </div>
      </div>
    </AuthProvider>
  );
}

export default App;
/**
 * RESUMO: App.tsx - Componente Principal
 * 
 * O que faz:
 * - Componente raiz da aplicação React
 * - Gerencia estado global de tema (dark/light mode)
 * - Controla abertura/fechamento de todos os modais
 * - Orquestra comunicação entre componentes principais
 * - Aplica classes CSS para modo escuro/claro
 * 
 * Principais funções:
 * - Estados gerenciados:
 *   - darkMode: controla tema da aplicação
 *   - showLoginModal: controla modal de login
 *   - showSignupModal: controla modal de cadastro
 *   - showCreateIdeaModal: controla modal de criação
 * 
 * - Funções de controle:
 *   - handleSwitchToSignup(): Troca de login para cadastro
 *   - handleSwitchToLogin(): Troca de cadastro para login
 *   - closeAllModals(): Fecha todos os modais abertos
 * 
 * Estrutura da aplicação:
 * - Wrapper com classe 'dark' condicional
 * - Navbar com callbacks para ações principais
 * - Área principal com componente Home
 * - Modais condicionalmente renderizados
 * - Sistema de callbacks para comunicação entre componentes
 */

import { useState } from 'react';
import Home from './pages/Home';
import Navbar from './components/Navbar';
import LoginModal from './components/LoginModal';
import SignupModal from './components/SignupModal';
import CreateIdeaModal from './components/CreateIdeaModal';

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
  );
}

export default App;
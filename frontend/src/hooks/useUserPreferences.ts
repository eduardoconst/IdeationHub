/**
 * Hook para gerenciar todas as preferências do usuário
 * Persiste automaticamente no localStorage
 */

import { useEffect } from 'react';
import useLocalStorage from './useLocalStorage';

interface UserPreferences {
  darkMode: boolean;
  language: string;
  notifications: boolean;
  autoRefresh: boolean;
}

const defaultPreferences: UserPreferences = {
  darkMode: false,
  language: 'pt-BR',
  notifications: true,
  autoRefresh: true
};

export const useUserPreferences = () => {
  const [preferences, setPreferences] = useLocalStorage<UserPreferences>(
    'userPreferences', 
    defaultPreferences
  );

  // Aplica modo escuro no documento
  useEffect(() => {
    if (preferences.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [preferences.darkMode]);

  // Funções helper para atualizar preferências específicas
  const toggleDarkMode = () => {
    setPreferences({
      ...preferences,
      darkMode: !preferences.darkMode
    });
  };

  const setLanguage = (language: string) => {
    setPreferences({
      ...preferences,
      language
    });
  };

  const toggleNotifications = () => {
    setPreferences({
      ...preferences,
      notifications: !preferences.notifications
    });
  };

  const toggleAutoRefresh = () => {
    setPreferences({
      ...preferences,
      autoRefresh: !preferences.autoRefresh
    });
  };

  const resetPreferences = () => {
    setPreferences(defaultPreferences);
  };

  return {
    preferences,
    setPreferences,
    toggleDarkMode,
    setLanguage,
    toggleNotifications,
    toggleAutoRefresh,
    resetPreferences
  };
};

export default useUserPreferences;

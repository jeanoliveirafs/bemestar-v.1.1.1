import React, { useState, useEffect, Suspense } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import Layout from './components/layout/Layout';
import LandingPage from './components/pages/LandingPage';
import LoginPage from './components/pages/LoginPage';
import Dashboard from './components/pages/Dashboard';
import SOSPage from './components/pages/SOSPage';
import TermsOfService from './components/pages/TermsOfService';
import LoadingSpinner from './components/ui/LoadingSpinner';

// Lazy loading dos componentes de funcionalidades
const PsychologicalScales = React.lazy(() => import('./components/features/PsychologicalScales'));
const CrisisActionPlan = React.lazy(() => import('./components/features/CrisisActionPlan'));
const HabitGamification = React.lazy(() => import('./components/features/HabitGamification'));
const PersonalizedRoutine = React.lazy(() => import('./components/features/PersonalizedRoutine'));
const EmotionWall = React.lazy(() => import('./components/features/EmotionWall'));
const AIContent = React.lazy(() => import('./components/features/AIContent'));
const ProgressReports = React.lazy(() => import('./components/features/ProgressReports'));
const SoundMindfulness = React.lazy(() => import('./components/features/SoundMindfulness'));

function App() {
  const [currentPage, setCurrentPage] = useState<string>('landing');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [showTerms, setShowTerms] = useState(false);
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  
  const { user, userProfile, loading, signUp, signIn, signOut, acceptTerms, error } = useAuth();
  const isAuthenticated = !!user;

  useEffect(() => {
    if (user && userProfile) {
      if (!userProfile.termos_aceitos) {
        setShowTerms(true);
      } else {
        setCurrentPage('dashboard');
        setShowTerms(false);
      }
    } else if (user && !userProfile) {
      // Novo usuário, mostrar termos
      setIsFirstLogin(true);
      setShowTerms(true);
    } else if (!user) {
      setCurrentPage('landing');
      setShowTerms(false);
      setIsFirstLogin(false);
    }
  }, [user, userProfile]);



  // Update document class and save preference
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  const handleLogin = async (email: string, password: string, isSignUp: boolean = false) => {
    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
    } catch (error: any) {
      console.error('Erro na autenticação:', error);
      alert(error.message || 'Erro na autenticação');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error: any) {
      console.error('Erro ao fazer logout:', error);
      alert('Erro ao fazer logout');
    }
  };

  // Função para aceitar os termos
  const handleAcceptTerms = async () => {
    try {
      await acceptTerms();
      setShowTerms(false);
      setIsFirstLogin(false);
      setCurrentPage('dashboard');
    } catch (error) {
      console.error('Erro ao aceitar termos:', error);
    }
  };

  // Função para recusar os termos
  const handleDeclineTerms = async () => {
    setShowTerms(false);
    setIsFirstLogin(false);
    await handleLogout();
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-purple-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Layout simples para login e termos
  const isSimpleLayout = !isAuthenticated || showTerms;

  if (isSimpleLayout) {
    return (
      <div className={isDarkMode ? 'dark' : ''}>
        {showTerms ? (
          <TermsOfService 
            onAccept={handleAcceptTerms}
            onDecline={handleDeclineTerms}
            isFirstLogin={isFirstLogin}
          />
        ) : currentPage === 'login' ? (
          <LoginPage 
            onLogin={handleLogin}
            onBack={() => setCurrentPage('landing')}
            loading={loading}
          />
        ) : (
          <LandingPage 
            onGetStarted={() => setCurrentPage('login')}
            onToggleTheme={toggleTheme}
            isDarkMode={isDarkMode}
          />
        )}
      </div>
    );
  }

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <Layout
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onLogout={handleLogout}
        user={user}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
      >
        <Suspense fallback={<LoadingSpinner />}>
          {currentPage === 'dashboard' && <Dashboard />}
          {currentPage === 'habits' && <HabitGamification />}
          {currentPage === 'routines' && <PersonalizedRoutine />}
          {currentPage === 'emotions' && <EmotionWall />}
          {currentPage === 'scales' && <PsychologicalScales />}
          {currentPage === 'ai-content' && <AIContent />}
          {currentPage === 'crisis-plan' && <CrisisActionPlan />}
          {currentPage === 'mindfulness' && <SoundMindfulness />}
          {currentPage === 'progress' && <ProgressReports />}
          {currentPage === 'sos' && <SOSPage />}
        </Suspense>
      </Layout>
      
      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="fixed bottom-6 right-6 p-3 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300 z-50"
        aria-label="Alternar tema"
      >
        {isDarkMode ? (
          <Sun className="w-5 h-5 text-yellow-500" />
        ) : (
          <Moon className="w-5 h-5 text-slate-600" />
        )}
      </button>
    </div>
  );
}

export default App;
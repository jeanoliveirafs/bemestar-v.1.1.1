import React, { useState, useEffect } from 'react';
import Layout from './components/layout/Layout';
import LandingPage from './components/pages/LandingPage';
import LoginPage from './components/pages/LoginPage';
import Home from './components/pages/Home';
import Dashboard from './components/pages/Dashboard';
import SOSPage from './components/pages/SOSPage';
import TermsAndConditions from './components/pages/TermsAndConditions';

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [isFirstLogin, setIsFirstLogin] = useState(false);

  // Check for saved theme preference or default to light mode
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    } else {
      // Check system preference
      setIsDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
  }, []);

  // Update document class and save preference
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const handleLogin = (isNewUser: boolean = false) => {
    setIsAuthenticated(true);
    
    // Verificar se é o primeiro login do usuário
    const hasAcceptedTerms = localStorage.getItem('termsAccepted');
    
    if (isNewUser || !hasAcceptedTerms) {
      setIsFirstLogin(true);
      setShowTerms(true);
    } else {
      setCurrentPage('home');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentPage('landing');
    setShowTerms(false);
    setIsFirstLogin(false);
  };

  // Função para aceitar os termos
  const handleAcceptTerms = () => {
    localStorage.setItem('termsAccepted', 'true');
    setShowTerms(false);
    setIsFirstLogin(false);
    setCurrentPage('home');
  };

  // Função para recusar os termos
  const handleDeclineTerms = () => {
    setShowTerms(false);
    setIsFirstLogin(false);
    handleLogout();
  };

  const handleGetStarted = () => {
    setCurrentPage('login');
  };

  const handleBackToLanding = () => {
    setCurrentPage('landing');
  };

  const handleNavigation = (page: string) => {
    if (isAuthenticated) {
      setCurrentPage(page);
    } else {
      setCurrentPage('login');
    }
  };

  const renderCurrentPage = () => {
    // Se deve mostrar os termos, exibir a página de termos
    if (showTerms) {
      return (
        <TermsAndConditions 
          onAccept={handleAcceptTerms}
          onDecline={handleDeclineTerms}
        />
      );
    }

    switch (currentPage) {
      case 'landing':
        return <LandingPage onGetStarted={handleGetStarted} />;
      case 'login':
        return <LoginPage onLogin={handleLogin} onBack={handleBackToLanding} />;
      case 'home':
        return <Home onNavigate={handleNavigation} />;
      case 'painel':
      case 'dashboard':
        return <Dashboard />;
      case 'autoavaliacoes':
        return (
          <React.Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="text-lg">Carregando...</div></div>}>
            <PsychologicalScales />
          </React.Suspense>
        );
      case 'emergencia':
      case 'plano-emergencia':
        return (
          <React.Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="text-lg">Carregando...</div></div>}>
            <CrisisActionPlan />
          </React.Suspense>
        );
      case 'habitos':
      case 'gamificacao':
        return (
          <React.Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="text-lg">Carregando...</div></div>}>
            <HabitGamification />
          </React.Suspense>
        );
      case 'rotina':
        return (
          <React.Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="text-lg">Carregando...</div></div>}>
            <PersonalizedRoutine />
          </React.Suspense>
        );
      case 'comunidade':
      case 'mural-emocoes':
        return (
          <React.Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="text-lg">Carregando...</div></div>}>
            <EmotionWall />
          </React.Suspense>
        );
      case 'conteudo-ia':
        return (
          <React.Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="text-lg">Carregando...</div></div>}>
            <AIContent />
          </React.Suspense>
        );
      case 'relatorios':
        return (
          <React.Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="text-lg">Carregando...</div></div>}>
            <ProgressReports />
          </React.Suspense>
        );
      case 'mindfulness':
        return (
          <React.Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="text-lg">Carregando...</div></div>}>
            <SoundMindfulness />
          </React.Suspense>
        );
      case 'sos':
        return <SOSPage />;
      default:
        return <Home onNavigate={handleNavigation} />;
    }
  };

  // Se não está autenticado ou está mostrando termos, usar layout simples
  if (!isAuthenticated || showTerms) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
        {renderCurrentPage()}
        
        {/* Theme Toggle - Fixed Position */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="fixed bottom-6 right-6 w-12 h-12 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 transform hover:scale-110 z-50"
          title={isDarkMode ? 'Modo claro' : 'Modo escuro'}
        >
          {isDarkMode ? (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          )}
        </button>
      </div>
    );
  }

  // Layout principal com navegação
  return (
    <Layout 
      currentPage={currentPage} 
      onNavigate={handleNavigation}
      isDarkMode={isDarkMode}
      onToggleTheme={() => setIsDarkMode(!isDarkMode)}
      onLogout={handleLogout}
    >
      {renderCurrentPage()}
    </Layout>
  );
}

export default App;
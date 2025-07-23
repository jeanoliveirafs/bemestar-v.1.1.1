import React, { useState, useEffect, Suspense } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { ProtectedRoute } from './components/Auth';
import Layout from './components/layout/Layout';
import LandingPage from './components/pages/LandingPage';
import Dashboard from './components/pages/Dashboard';
import SOSPage from './components/pages/SOSPage';
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
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  
  const { user, signOut } = useAuth();

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

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error: any) {
      console.error('Erro ao fazer logout:', error);
      alert('Erro ao fazer logout');
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <ProtectedRoute>
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
      </ProtectedRoute>
    </div>
  );
}

export default App;
import React, { useState } from 'react';
import { 
  Home, BarChart3, Brain, Shield, Award, Bell, 
  Users, Sparkles, PieChart, Music, Menu, X,
  Sun, Moon, Settings, User, LogOut
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
  onLogout: () => void;
  user: any;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

/**
 * Layout principal do aplicativo com menu de navegação
 * @param props - Propriedades incluindo conteúdo, página atual e função de navegação
 */
export default function Layout({ children, currentPage, onPageChange, onLogout, user, isDarkMode, onToggleTheme }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Configuração dos itens do menu
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
    { id: 'habits', name: 'Hábitos', icon: Award },
    { id: 'routines', name: 'Routines', icon: Bell },
    { id: 'emotions', name: 'Emoções', icon: Users },
    { id: 'scales', name: 'Autoavaliações', icon: Brain },
    { id: 'ai-content', name: 'Conteúdo IA', icon: Sparkles },
    { id: 'crisis-plan', name: 'Emergência', icon: Shield },
    { id: 'mindfulness', name: 'Mindfulness', icon: Music },
    { id: 'progress', name: 'Relatórios', icon: PieChart },
    { id: 'sos', name: 'SOS', icon: Shield }
  ];



  /**
   * Navega para uma página e fecha o menu mobile
   * @param pageId - ID da página para navegar
   */
  const handleNavigation = (pageId: string) => {
    onPageChange(pageId);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
        {/* Sidebar Desktop */}
        <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r lg:border-slate-200 lg:dark:border-slate-700 lg:bg-white lg:dark:bg-slate-800">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 border-b border-slate-200 dark:border-slate-700">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Refúgio Digital
            </h1>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.id)}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <IconComponent className="w-5 h-5 mr-3" />
                  {item.name}
                </button>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                  <p className="text-sm font-medium text-slate-800 dark:text-white">{user?.email || 'Usuário'}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Usuário Premium</p>
                </div>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={onToggleTheme}
                className="flex-1 flex items-center justify-center px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button className="flex-1 flex items-center justify-center px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                <Settings className="w-4 h-4" />
              </button>
              <button 
                onClick={onLogout}
                className="flex-1 flex items-center justify-center px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Header */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between h-16 px-4">
            <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Refúgio Digital
            </h1>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)} />
        )}

        {/* Mobile Menu */}
        <div className={`lg:hidden fixed top-16 left-0 right-0 bottom-0 z-50 bg-white dark:bg-slate-800 transform transition-transform duration-300 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <nav className="p-4 space-y-2 overflow-y-auto h-full">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.id)}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <IconComponent className="w-5 h-5 mr-3" />
                  {item.name}
                </button>
              );
            })}
            
            {/* Mobile User Section */}
            <div className="pt-6 mt-6 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-3 mb-4 px-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-800 dark:text-white">{user?.email || 'Usuário'}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Usuário Premium</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <button
                  onClick={onToggleTheme}
                  className="w-full flex items-center px-4 py-3 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  {isDarkMode ? <Sun className="w-5 h-5 mr-3" /> : <Moon className="w-5 h-5 mr-3" />}
                  {isDarkMode ? 'Modo Claro' : 'Modo Escuro'}
                </button>
                <button className="w-full flex items-center px-4 py-3 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors">
                  <Settings className="w-5 h-5 mr-3" />
                  Configurações
                </button>
                <button 
                  onClick={onLogout}
                  className="w-full flex items-center px-4 py-3 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  Sair
                </button>
              </div>
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:ml-64">
          <div className="pt-16 lg:pt-0 h-full overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
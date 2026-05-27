import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  GraduationCap, 
  BarChart3, 
  Settings, 
  Plus, 
  Bell, 
  Search,
  BrainCircuit,
  LogOut
} from 'lucide-react';
import { cn } from './lib/utils';
import Dashboard from './components/Dashboard';
import StudyMaterials from './components/StudyMaterials';
import PracticeExams from './components/PracticeExams';
import Analytics from './components/Analytics';
import AIChat from './components/AIChat';
import GenerationView from './components/GenerationView';
import SettingsView from './components/Settings';
import NotificationCenter from './components/NotificationCenter';
import Login from './components/Login';
import SignUp from './components/SignUp';
import { Toaster } from 'sonner';

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [materials, setMaterials] = useState([]);
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('examiq-auth') === 'true';
  });
  const [userName, setUserName] = useState(() => {
    return localStorage.getItem('examiq-user-name') || 'Alex Rivera';
  });
  const [authView, setAuthView] = useState('login');
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('examiq-theme');
    return saved || 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    const applyTheme = (t) => {
      root.classList.remove('light', 'dark');
      root.classList.add(t);
      root.style.colorScheme = t;
      localStorage.setItem('examiq-theme', t);
    };
    applyTheme(theme);
  }, [theme]);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    if (!isAuthenticated) return;
    try {
      const [mRes, sRes] = await Promise.all([
        fetch('/api/materials'),
        fetch('/api/analytics')
      ]);
      setMaterials(await mRes.json());
      setScores(await sRes.json());
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('examiq-auth');
    localStorage.removeItem('examiq-user-name');
    setCurrentView('dashboard');
  };

  const handleLogin = (name = 'Alex Rivera') => {
    setIsAuthenticated(true);
    setUserName(name);
    localStorage.setItem('examiq-auth', 'true');
    localStorage.setItem('examiq-user-name', name);
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'materials', label: 'Study Materials', icon: BookOpen },
    { id: 'exams', label: 'Practice Exams', icon: GraduationCap },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'chat', label: 'AI Tutor', icon: BrainCircuit },
  ];

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard materials={materials} scores={scores} onViewChange={setCurrentView} userName={userName} />;
      case 'materials': return <StudyMaterials materials={materials} />;
      case 'exams': return <PracticeExams materials={materials} onScoreSubmit={fetchData} />;
      case 'analytics': return <Analytics scores={scores} />;
      case 'chat': return <AIChat userName={userName} />;
      case 'settings': return <SettingsView theme={theme} onThemeChange={setTheme} userName={userName} />;
      case 'create': return <GenerationView onComplete={() => { fetchData(); setCurrentView('materials'); }} />;
      default: return <Dashboard materials={materials} scores={scores} onViewChange={setCurrentView} userName={userName} />;
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        <Toaster position="top-right" richColors />
        {authView === 'login' ? (
          <Login onLogin={(name) => handleLogin(name)} onNavigateToSignUp={() => setAuthView('signup')} />
        ) : (
          <SignUp onSignUp={(name) => handleLogin(name)} onNavigateToLogin={() => setAuthView('login')} />
        )}
      </>
    );
  }

  return (
    <div className="flex min-h-screen bg-background-light dark:bg-background-dark transition-colors">
      <Toaster position="top-right" richColors />
      <NotificationCenter isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
      <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col fixed h-full z-50 transition-colors">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <BrainCircuit size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-primary">ExamIQ</h1>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">AI-Powered Prep</p>
          </div>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => (
            <button key={item.id} onClick={() => setCurrentView(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                currentView === item.id ? 'bg-primary/10 text-primary font-semibold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              )}>
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <button onClick={() => setCurrentView('create')}
            className="w-full py-3 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
            <Plus size={18} /> Start New Prep
          </button>
        </div>
        <div className="p-4 flex items-center gap-3 border-t border-slate-200 dark:border-slate-800">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate">{userName}</p>
            <p className="text-[10px] text-slate-500 uppercase font-semibold">University Student</p>
          </div>
          <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 transition-colors">
            <LogOut size={18} />
          </button>
        </div>
      </aside>
      <main className="flex-1 ml-64 flex flex-col min-h-screen bg-background-light dark:bg-background-dark transition-colors">
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-40 transition-colors">
          <div className="flex items-center gap-4 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input type="text" placeholder="Search your materials..." className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/50" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className={cn('p-2 rounded-full transition-colors relative', isNotificationsOpen ? 'bg-primary/10 text-primary' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500')}>
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
            </button>
            <button onClick={() => setCurrentView('settings')}
              className={cn('p-2 rounded-full transition-colors', currentView === 'settings' ? 'bg-primary/10 text-primary' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500')}>
              <Settings size={20} />
            </button>
          </div>
        </header>
        <div className={cn('w-full mx-auto flex-1 flex flex-col', currentView === 'chat' ? '' : 'p-8 max-w-6xl')}>
          {loading ? (
            <div className="flex items-center justify-center flex-1">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : renderView()}
        </div>
      </main>
    </div>
  );
}

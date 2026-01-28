import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Layers, 
  Plus, 
  Search, 
  GraduationCap, 
  LogOut,
  User,
  Settings
} from 'lucide-react';

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: 'dashboard' | 'add-item' | 'flashcards' | 'quiz' | 'search' | 'admin') => void;
  onLogout: () => void;
  userName: string;
}

export const Navigation = ({ currentPage, onNavigate, onLogout, userName }: NavigationProps) => {
  const navItems = [
    { id: 'dashboard', label: 'Chapters', icon: BookOpen },
    { id: 'flashcards', label: 'Flashcards', icon: Layers },
    { id: 'quiz', label: 'Quiz', icon: GraduationCap },
    { id: 'search', label: 'Search', icon: Search },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b-2 border-[#0B1E5B]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#00B8A9] flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="font-semibold text-[#0B1E5B] text-lg">PharmaStudy</span>
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id as any)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                    ${isActive 
                      ? 'bg-[#00B8A9] text-white' 
                      : 'text-[#0B1E5B] hover:bg-[#0B1E5B]/5'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            <Button
              onClick={() => onNavigate('add-item')}
              className="bg-[#00B8A9] hover:bg-[#00a396] text-white rounded-full px-4 py-2 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Item</span>
            </Button>
            
            <div className="flex items-center gap-2 pl-3 border-l border-[#0B1E5B]/10">
              <button
                onClick={() => onNavigate('admin')}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                title="Admin Panel"
              >
                <Settings className="w-4 h-4 text-[#0B1E5B]" />
              </button>
              <div className="w-8 h-8 rounded-full bg-[#0B1E5B]/10 flex items-center justify-center">
                <User className="w-4 h-4 text-[#0B1E5B]" />
              </div>
              <span className="hidden sm:inline text-sm text-[#0B1E5B] font-medium">{userName}</span>
              <button
                onClick={onLogout}
                className="p-2 hover:bg-red-50 rounded-full transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4 text-red-500" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <div className="md:hidden flex items-center justify-around py-2 border-t border-[#0B1E5B]/10">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id as any)}
              className={`
                flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200
                ${isActive 
                  ? 'text-[#00B8A9]' 
                  : 'text-[#6B7280]'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

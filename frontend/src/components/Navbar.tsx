import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, 
  LayoutDashboard, 
  Compass, 
  History, 
  FileText, 
  Settings, 
  LogOut, 
  LogIn, 
  Chrome,
  Heart
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Digital Wellbeing', path: '/consumption', icon: Compass },
    { name: 'Live Analysis', path: '/analyze', icon: Sparkles },
    { name: 'History', path: '/history', icon: History },
    { name: 'Reports', path: '/reports', icon: FileText },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#F8F6F0]/90 backdrop-blur-xl border-b border-[#A9C4B2]/30 shadow-[0_2px_20px_-4px_rgba(36,75,67,0.06)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 rounded-2xl bg-[#E9F0E7] border border-[#A9C4B2]/60 flex items-center justify-center text-[#244B43] shadow-xs group-hover:scale-105 group-hover:bg-[#D9E9E5] transition-all duration-300">
              <span className="text-lg">🌿</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-[#244B43]">
                  Cognivibe AI
                </span>
                <span className="w-2 h-2 rounded-full bg-[#A9C4B2] animate-pulse"></span>
              </div>
              <p className="text-[10px] text-[#244B43]/75 font-semibold hidden sm:block tracking-wide">
                Your Digital Wellbeing Sanctuary
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          {user && (
            <nav className="hidden md:flex items-center gap-1.5">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-[#E9F0E7] text-[#244B43] shadow-xs border border-[#A9C4B2]/60'
                        : 'text-[#244B43]/70 hover:text-[#244B43] hover:bg-[#E9F0E7]/60'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#244B43]' : 'text-[#244B43]/60'}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          )}

          {/* User actions */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-1.5 text-xs font-bold text-[#244B43] bg-[#E9F0E7] px-3.5 py-1.5 rounded-xl border border-[#A9C4B2]/60 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#10b981]"></span>
              <span>Sanctuary Companion Ready</span>
            </div>

            {user ? (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-bold text-[#244B43]">{user.name}</div>
                  <div className="text-[10px] text-[#244B43]/70 font-medium">{user.email}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-[#244B43]/60 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 text-xs font-bold text-[#244B43] hover:text-[#17332D] px-3.5 py-2 rounded-xl hover:bg-[#E9F0E7] transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Log In</span>
                </Link>
                <Link
                  to="/register"
                  className="text-xs font-bold text-[#F8F6F0] bg-[#244B43] hover:bg-[#17332D] px-4 py-2 rounded-xl shadow-xs transition-all hover:scale-[1.02]"
                >
                  Enter Sanctuary
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

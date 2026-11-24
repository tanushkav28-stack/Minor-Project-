import React, { useEffect, useState } from 'react';
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
  Menu,
  X,
  Leaf,
  ChevronRight
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  // Close drawer on Escape key and lock background scroll while open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false);
    };
    if (drawerOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  const handleLogout = () => {
    setDrawerOpen(false);
    logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', description: 'Wellbeing overview & mood garden', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Digital Wellbeing', description: 'Consumption, mood & visualizations', path: '/consumption', icon: Compass },
    { name: 'Live Analysis', description: 'Real-time Hinglish screening', path: '/analyze', icon: Sparkles },
    { name: 'History', description: 'Past language & sentiment logs', path: '/history', icon: History },
    { name: 'Reports', description: 'Generate & export PDF reports', path: '/reports', icon: FileText },
    { name: 'Settings', description: 'Privacy & extension pairing', path: '/settings', icon: Settings },
  ];

  const activeNav = navLinks.find((item) => item.path === location.pathname);

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#F8F6F0]/95 backdrop-blur-xl border-b border-[#A9C4B2]/35 shadow-[0_2px_20px_-4px_rgba(36,75,67,0.06)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center min-h-[68px] py-2 gap-4">
            {/* Left: Hamburger Menu Button + Brand Logo */}
            <div className="flex items-center gap-3 sm:gap-3.5 shrink-0">
              {user && (
                <button
                  type="button"
                  onClick={() => setDrawerOpen(true)}
                  aria-label="Open navigation menu"
                  aria-expanded={drawerOpen}
                  className="w-10 h-10 shrink-0 rounded-xl bg-[#E9F0E7]/80 hover:bg-[#D9E9E5] border border-[#A9C4B2]/60 flex items-center justify-center text-[#244B43] shadow-xs transition-all hover:scale-105 active:scale-95"
                >
                  <Menu className="w-5 h-5" />
                </button>
              )}

              <Link to="/" className="flex items-center gap-3 group shrink-0">
                <div className="w-10 h-10 shrink-0 rounded-2xl bg-gradient-to-br from-[#E9F0E7] to-[#D9E9E5] border border-[#A9C4B2]/70 flex items-center justify-center text-[#244B43] shadow-xs group-hover:scale-105 transition-transform duration-300">
                  <Leaf className="w-5 h-5 text-[#2F5E54]" strokeWidth={2.2} />
                </div>
                <div className="flex flex-col justify-center">
                  <div className="flex items-center gap-2 whitespace-nowrap">
                    <span className="text-lg sm:text-xl font-black tracking-tight text-[#244B43] leading-tight whitespace-nowrap">
                      Cognivibe AI
                    </span>
                    <span className="w-2 h-2 rounded-full bg-[#10b981] shrink-0" />
                  </div>
                  <p className="text-[11px] text-[#244B43]/75 font-semibold hidden sm:block tracking-wide leading-tight whitespace-nowrap">
                    Your Digital Wellbeing Sanctuary
                  </p>
                </div>
              </Link>

              {user && activeNav && (
                <div className="hidden md:flex items-center gap-1.5 ml-2 px-3 py-1 rounded-full bg-[#E9F0E7]/70 border border-[#A9C4B2]/50 text-xs font-bold text-[#244B43] whitespace-nowrap">
                  <activeNav.icon className="w-3.5 h-3.5 text-[#2F5E54]" />
                  <span>{activeNav.name}</span>
                </div>
              )}
            </div>

            {/* Right: Companion Status + User Actions */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="hidden lg:flex items-center gap-2 text-xs font-bold text-[#244B43] bg-[#E9F0E7] px-3.5 py-1.5 rounded-xl border border-[#A9C4B2]/60 shadow-xs whitespace-nowrap">
                <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse shrink-0" />
                <span>Sanctuary Companion Ready</span>
              </div>

              {user ? (
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="text-right hidden sm:block whitespace-nowrap">
                    <div className="text-xs font-bold text-[#244B43] leading-tight">{user.name}</div>
                    <div className="text-[10px] text-[#244B43]/70 font-medium leading-tight">{user.email}</div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-[#244B43]/70 hover:text-rose-700 hover:bg-rose-50 rounded-xl border border-transparent hover:border-rose-200 transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 whitespace-nowrap">
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

      {/* Slide-out Side Navigation Drawer */}
      {user && (
        <div
          className={`fixed inset-0 z-50 transition-opacity duration-300 ${
            drawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          aria-hidden={!drawerOpen}
        >
          {/* Backdrop */}
          <div
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-[#102420]/40 backdrop-blur-[2px]"
          />

          {/* Side Panel */}
          <aside
            className={`relative w-80 max-w-[85vw] h-full bg-[#F8F6F0] border-r border-[#A9C4B2]/50 shadow-2xl flex flex-col justify-between transform transition-transform duration-300 ease-out ${
              drawerOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#A9C4B2]/35 bg-[#E9F0E7]/50">
                <Link
                  to="/"
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center gap-2.5"
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#E9F0E7] to-[#D9E9E5] border border-[#A9C4B2]/70 flex items-center justify-center text-[#244B43]">
                    <Leaf className="w-4 h-4 text-[#2F5E54]" strokeWidth={2.2} />
                  </div>
                  <div>
                    <div className="text-base font-black text-[#244B43] leading-tight">Cognivibe AI</div>
                    <div className="text-[10px] font-semibold text-[#244B43]/70 leading-tight">Wellbeing Sanctuary</div>
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Close navigation menu"
                  className="p-2 rounded-xl text-[#244B43]/70 hover:text-[#244B43] hover:bg-[#D9E9E5]/70 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Companion & User Summary */}
              <div className="px-5 pt-4 pb-2">
                <div className="p-3.5 rounded-2xl bg-white/90 border border-[#A9C4B2]/45 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-extrabold text-[#244B43]">{user.name}</div>
                      <div className="text-[11px] text-[#244B43]/70 truncate max-w-[185px]">{user.email}</div>
                    </div>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] shrink-0" title="Online" />
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#2F5E54] bg-[#E9F0E7]/80 px-2.5 py-1 rounded-lg">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                    <span>Sanctuary Companion Ready</span>
                  </div>
                </div>
              </div>

              {/* Navigation Items */}
              <nav className="px-4 py-3 space-y-1.5" aria-label="Main navigation">
                <div className="px-2 pb-1 text-[10px] font-black uppercase tracking-widest text-[#244B43]/55">
                  Navigation
                </div>
                {navLinks.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setDrawerOpen(false)}
                      className={`flex items-center justify-between gap-3 px-3.5 py-3 rounded-2xl transition-all ${
                        isActive
                          ? 'bg-[#244B43] text-[#F8F6F0] shadow-md shadow-[#244B43]/15'
                          : 'text-[#244B43]/80 hover:text-[#244B43] hover:bg-[#E9F0E7]/80'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            isActive ? 'bg-white/15 text-[#F8F6F0]' : 'bg-[#E9F0E7] text-[#2F5E54]'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-extrabold leading-tight">{item.name}</div>
                          <div
                            className={`text-[10px] truncate mt-0.5 ${
                              isActive ? 'text-[#E9F0E7]/80' : 'text-[#244B43]/60'
                            }`}
                          >
                            {item.description}
                          </div>
                        </div>
                      </div>
                      <ChevronRight
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? 'text-[#A9C4B2]' : 'text-[#244B43]/35'
                        }`}
                      />
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-[#A9C4B2]/35 bg-[#E9F0E7]/35">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
};

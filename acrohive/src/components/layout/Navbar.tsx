import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Ticket,
  ScanLine,
  Sparkles,
  LayoutDashboard,
  LogIn,
  LogOut,
  User,
  ChevronDown,
  Shield,
  Menu,
  X,
} from 'lucide-react';
import { Logo } from './Logo';
import { useAuth } from '@/hooks/useAuth';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

export const Navbar: React.FC = () => {
  const { user, profile, role, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  // Build nav items based on role
  const getNavItems = (): NavItem[] => {
    if (!user) {
      // Logged out — show all
      return [
        { label: 'Events', path: '/events', icon: <Calendar className="w-4 h-4" /> },
        { label: 'My Tickets', path: '/tickets', icon: <Ticket className="w-4 h-4" /> },
        { label: 'Scanner', path: '/scanner', icon: <ScanLine className="w-4 h-4" /> },
        { label: 'AI Suite', path: '/ai', icon: <Sparkles className="w-4 h-4" /> },
        { label: 'Command', path: '/command', icon: <LayoutDashboard className="w-4 h-4" /> },
      ];
    }

    if (role === 'student') {
      return [
        { label: 'Events', path: '/events', icon: <Calendar className="w-4 h-4" /> },
        { label: 'My Tickets', path: '/tickets', icon: <Ticket className="w-4 h-4" /> },
        { label: 'AI Suite', path: '/ai', icon: <Sparkles className="w-4 h-4" /> },
      ];
    }

    // Admin
    return [
      { label: 'Events', path: '/events', icon: <Calendar className="w-4 h-4" /> },
      { label: 'Scanner', path: '/scanner', icon: <ScanLine className="w-4 h-4" /> },
      { label: 'AI Suite', path: '/ai', icon: <Sparkles className="w-4 h-4" /> },
      { label: 'Command', path: '/command', icon: <LayoutDashboard className="w-4 h-4" /> },
    ];
  };

  const navItems = getNavItems();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 border-b border-white/5 bg-black/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <Logo size="sm" />
          </Link>

          {/* Desktop nav items */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
                  transition-all duration-200
                  ${
                    isActive(item.path)
                      ? 'text-primary bg-primary/10'
                      : 'text-muted hover:text-white hover:bg-white/5'
                  }
                `}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right side: auth */}
          <div className="hidden md:flex items-center gap-3">
            {!user ? (
              <Link
                to="/auth"
                className="cyber-btn text-sm flex items-center gap-1.5 !px-4 !py-1.5"
                id="nav-sign-in"
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign In
              </Link>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg
                    text-sm font-medium text-white hover:bg-white/5
                    transition-colors duration-200"
                  id="nav-user-menu"
                >
                  <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="max-w-[120px] truncate">
                    {profile?.full_name || user.email?.split('@')[0]}
                  </span>
                  {role === 'admin' && (
                    <span className="badge-warning text-[10px] !px-1.5 !py-0">
                      <Shield className="w-2.5 h-2.5" />
                      ADMIN
                    </span>
                  )}
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-muted transition-transform duration-200 ${
                      dropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Dropdown */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-surface-elevated border border-white/10 rounded-lg shadow-xl animate-fade-in-slide overflow-hidden">
                    <div className="px-4 py-3 border-b border-white/5">
                      <p className="text-xs text-muted">Signed in as</p>
                      <p className="text-sm text-white truncate">
                        {user.email}
                      </p>
                      <span className="badge-info text-[10px] mt-1">
                        {role?.toUpperCase() || 'USER'}
                      </span>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-danger
                        hover:bg-danger/5 transition-colors duration-150"
                      id="nav-sign-out"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-muted hover:text-white transition-colors"
            id="mobile-menu-toggle"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/5 bg-black/95 backdrop-blur-xl animate-fade-in-slide">
          <div className="px-4 py-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium
                  transition-colors duration-200
                  ${
                    isActive(item.path)
                      ? 'text-primary bg-primary/10'
                      : 'text-muted hover:text-white hover:bg-white/5'
                  }
                `}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </div>
          <div className="px-4 py-3 border-t border-white/5">
            {!user ? (
              <Link
                to="/auth"
                className="cyber-btn w-full text-sm text-center flex items-center justify-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign In
              </Link>
            ) : (
              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg
                  text-sm text-danger border border-danger/20 hover:bg-danger/5 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

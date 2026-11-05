import React, { useState } from 'react';
import {
  Calendar,
  SlidersHorizontal,
  Bell,
  LogOut,
  KeyRound,
  CheckCircle,
  AlertCircle,
  Menu
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle.js';
import { ThemeMode } from '../utils/theme.js';

interface ApexTopBarProps {
  pageTitle: string;
  currentTheme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  currentUser: any;
  serverHealth: 'checking' | 'healthy' | 'unreachable';
  onLoginAs: (userId: string) => void;
  onLogout: () => void;
  onOpenAuth: () => void;
  onToggleMobileMenu?: () => void;
}

export const ApexTopBar: React.FC<ApexTopBarProps> = ({
  pageTitle,
  currentTheme,
  onThemeChange,
  currentUser,
  serverHealth,
  onLoginAs,
  onLogout,
  onOpenAuth,
  onToggleMobileMenu
}) => {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '12m'>('30d');

  return (
    <header className="border-b border-[var(--border)] bg-[var(--surface-card)] backdrop-blur-xl px-4 sm:px-6 py-3.5 sticky top-0 z-30 transition-colors">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Hamburger (mobile), Page Title & Time Range Segmented Control matching Apex */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          {/* Hamburger button on mobile */}
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)] border border-[var(--border)]"
            title="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <h1 className="text-xl sm:text-2xl font-bold text-[var(--text)] tracking-tight capitalize">
            {pageTitle}
          </h1>

          {/* Time-Range Segmented Pill Control matching Apex reference */}
          <div className="glass-pill p-1 flex items-center space-x-1 bg-[var(--surface)] border border-[var(--border)]">
            {[
              { id: '12m', label: '12 months' },
              { id: '30d', label: '30 days' },
              { id: '7d', label: '7 days' },
              { id: '24h', label: '24 hours' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setTimeRange(item.id as any)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 ${
                  timeRange === item.id
                    ? 'bg-[var(--accent)] text-white shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* "Select dates" & "Filters" Buttons matching Apex reference */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => alert('Filter date picker: Range Active')}
              className="glass-card px-3 py-1.5 text-xs font-semibold text-[var(--text)] flex items-center space-x-1.5 hover:border-[var(--border-focus)] transition-colors"
            >
              <Calendar className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              <span>Select dates</span>
            </button>

            <button
              onClick={() => alert('Filters: Stream type, destination channel, and bitrates')}
              className="glass-card px-3 py-1.5 text-xs font-semibold text-[var(--text)] flex items-center space-x-1.5 hover:border-[var(--border-focus)] transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Right: Theme Toggle, Notifications, User Switcher, Profile */}
        <div className="flex items-center space-x-3">
          {/* Server / Appwrite Health Pill */}
          <div className="hidden xl:flex items-center space-x-1.5 text-xs">
            {serverHealth === 'healthy' ? (
              <span className="inline-flex items-center text-[var(--success)] bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 text-[10px] font-mono font-bold">
                <CheckCircle className="w-3 h-3 mr-1" /> READY
              </span>
            ) : (
              <span className="inline-flex items-center text-[var(--warning)] bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 text-[10px] font-mono">
                <AlertCircle className="w-3 h-3 mr-1" /> {serverHealth}
              </span>
            )}
          </div>

          {/* Switchable 3-Theme Toggle (Dark / Light / Green) matching Apex pill */}
          <ThemeToggle currentTheme={currentTheme} onThemeChange={onThemeChange} />

          {/* Notification Bell matching Apex */}
          <button
            onClick={() => alert('Notifications: All systems operational. 2 channels active for live streaming.')}
            className="w-9 h-9 rounded-full glass-card flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text)] transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-[var(--accent)] absolute top-2 right-2 ring-2 ring-[var(--surface-card)]" />
          </button>

          {/* User Profile & Test Switchers */}
          {currentUser ? (
            <div className="flex items-center space-x-2.5 pl-2 border-l border-[var(--border)]">
              {/* Quick test switcher */}
              <div className="flex items-center space-x-1 glass-pill p-0.5 bg-[var(--surface)] border border-[var(--border)]">
                <button
                  onClick={() => onLoginAs('6aec33ab0023e440f804')}
                  className={`text-[10px] px-2 py-0.5 rounded-full transition-colors font-medium ${
                    currentUser.id === '6aec33ab0023e440f804'
                      ? 'bg-[var(--accent)] text-white'
                      : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                  }`}
                  title="Switch to Normal Test User"
                >
                  Normal
                </button>
                <button
                  onClick={() => onLoginAs('6aec344800296c3cb621')}
                  className={`text-[10px] px-2 py-0.5 rounded-full transition-colors font-medium ${
                    currentUser.id === '6aec344800296c3cb621'
                      ? 'bg-[var(--danger)] text-white'
                      : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                  }`}
                  title="Switch to Super Admin User"
                >
                  Admin
                </button>
              </div>

              {/* User Avatar & Name matching Apex reference */}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-bold flex items-center justify-center text-xs ring-2 ring-[var(--border)] shrink-0">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-bold text-[var(--text)] truncate max-w-[110px]">
                    {currentUser.name || 'User'}
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)] font-mono">
                    {currentUser.isSuperAdmin ? 'SUPER ADMIN' : 'CREATOR'}
                  </div>
                </div>
              </div>

              <button
                onClick={onLogout}
                className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)] rounded-lg transition-colors"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[var(--accent)] text-white shadow-md flex items-center space-x-1.5"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

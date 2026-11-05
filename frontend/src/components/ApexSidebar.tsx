import React from 'react';
import {
  LayoutDashboard,
  Radio,
  Tv,
  Users,
  Shield,
  Laptop,
  HelpCircle,
  Settings,
  Search,
  ChevronDown,
  QrCode,
  Sparkles,
  X
} from 'lucide-react';
import { NavTab } from './Sidebar.js';

interface ApexSidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  currentUser: any;
  currentOrgId: string;
  setCurrentOrgId: (id: string) => void;
  availableOrgs: { id: string; name: string }[];
  channelsCount: number;
  onOpenSettings: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const ApexSidebar: React.FC<ApexSidebarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  currentOrgId,
  setCurrentOrgId,
  availableOrgs,
  channelsCount,
  onOpenSettings,
  isOpenMobile = false,
  onCloseMobile
}) => {
  const handleTabClick = (tab: NavTab) => {
    setActiveTab(tab);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-200"
        />
      )}

      {/* Sidebar (Desktop fixed, Mobile sliding drawer) */}
      <aside
        className={`fixed lg:sticky top-0 bottom-0 left-0 z-50 lg:z-20 w-64 bg-[var(--surface-card)] backdrop-blur-xl border-r border-[var(--border)] flex flex-col justify-between shrink-0 h-screen select-none transition-transform duration-200 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col p-4 space-y-4 overflow-y-auto">
          {/* Brand Header & Workspace Switcher matching Apex reference */}
          <div className="glass-card p-2.5 flex items-center justify-between border border-[var(--border)] bg-[var(--surface)]">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-[var(--accent)] text-white font-bold flex items-center justify-center shadow-lg shadow-[var(--accent-glow)] shrink-0">
                <Sparkles className="w-4 h-4 fill-current" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-[var(--text)] tracking-tight truncate">
                  Flash Live
                </div>
                <div className="text-[10px] text-[var(--text-muted)] truncate">
                  Apex Studio Pro
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <div className="relative">
                <select
                  value={currentOrgId}
                  onChange={(e) => setCurrentOrgId(e.target.value)}
                  className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                  title="Switch Workspace"
                >
                  {availableOrgs.map((org) => (
                    <option key={org.id} value={org.id} className="bg-[#070B1A] text-white">
                      {org.name}
                    </option>
                  ))}
                </select>
                <div className="p-1 rounded-lg hover:bg-[var(--surface-hover)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
                  <ChevronDown className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Close Button on Mobile */}
              <button
                onClick={onCloseMobile}
                className="lg:hidden p-1 rounded-lg hover:bg-[var(--surface-hover)] text-[var(--text-muted)] hover:text-[var(--text)]"
                title="Close sidebar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

        {/* Search Field with ⌘K Badge matching Apex reference */}
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full glass-input py-2 pl-9 pr-12 text-xs text-[var(--text)] placeholder-[var(--text-muted)] bg-[var(--surface)] border-[var(--border)]"
          />
          <div className="absolute right-2.5 flex items-center space-x-0.5 text-[10px] font-mono text-[var(--text-muted)] border border-[var(--border)] px-1.5 py-0.5 rounded-md bg-[var(--surface)]">
            <span>⌘</span>
            <span>K</span>
          </div>
        </div>

        {/* Group 1: MAIN Navigation matching Apex reference */}
        <div className="space-y-1">
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Main
          </div>

          <button
            onClick={() => handleTabClick('home')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'home'
                ? 'bg-[var(--surface-hover)] text-[var(--text)] font-semibold border border-[var(--border)] shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface)]'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </div>
          </button>

          <button
            onClick={() => handleTabClick('studio')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'studio'
                ? 'bg-[var(--accent)] text-white font-semibold shadow-md shadow-[var(--accent-glow)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface)]'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Radio className="w-4 h-4" />
              <span>Go Live Studio</span>
            </div>
            <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded-full bg-white/20 text-white font-mono">
              LIVE
            </span>
          </button>

          <button
            onClick={() => handleTabClick('channels')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'channels'
                ? 'bg-[var(--surface-hover)] text-[var(--text)] font-semibold border border-[var(--border)] shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface)]'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Tv className="w-4 h-4" />
              <span>Destinations</span>
            </div>
            {channelsCount > 0 && (
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-[var(--surface)] text-[var(--accent)] border border-[var(--border)] font-bold">
                {channelsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => handleTabClick('teams')}
            className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'teams'
                ? 'bg-[var(--surface-hover)] text-[var(--text)] font-semibold border border-[var(--border)] shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface)]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Team & Workspaces</span>
          </button>

          <button
            onClick={() => handleTabClick('sessions')}
            className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'sessions'
                ? 'bg-[var(--surface-hover)] text-[var(--text)] font-semibold border border-[var(--border)] shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface)]'
            }`}
          >
            <Laptop className="w-4 h-4" />
            <span>Active Sessions</span>
          </button>

          {currentUser?.isSuperAdmin && (
            <button
              onClick={() => handleTabClick('admin')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'admin'
                  ? 'bg-[var(--danger)] text-white font-semibold shadow-md'
                  : 'text-[var(--danger)] hover:bg-[var(--surface)]'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Shield className="w-4 h-4" />
                <span>Super Admin</span>
              </div>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-black/20 text-white font-bold">
                ROOT
              </span>
            </button>
          )}
        </div>

        {/* Group 2: HELP CENTER Navigation matching Apex reference */}
        <div className="space-y-1 pt-2">
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Help Center
          </div>

          <button
            onClick={() => alert('Support: 24/7 Priority RTMP Engineering assistance is active.')}
            className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] transition-all"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Support</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] transition-all"
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Bottom Security / Verify Device Card matching Apex reference */}
      <div className="p-4 border-t border-[var(--border)]">
        <div className="glass-card p-3.5 space-y-3 bg-[var(--surface)] border-[var(--border)]">
          <div>
            <div className="text-xs font-bold text-[var(--text)]">Verify this device</div>
            <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
              Scan or inspect device session to authenticate.
            </div>
          </div>

          <div className="flex justify-center p-2 rounded-xl bg-white/5 border border-[var(--border)]">
            <QrCode className="w-16 h-16 text-[var(--text)] opacity-90" />
          </div>

          <button
            onClick={() => handleTabClick('sessions')}
            className="w-full py-1.5 rounded-lg text-xs font-semibold text-[var(--text)] bg-[var(--surface-hover)] hover:bg-[var(--border)] border border-[var(--border)] transition-colors"
          >
            Verify another way
          </button>
        </div>
      </div>
    </aside>
    </>
  );
};

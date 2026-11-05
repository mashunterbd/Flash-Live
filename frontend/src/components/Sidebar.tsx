import React from 'react';
import {
  Home,
  Tv,
  Radio,
  History,
  Scissors,
  HardDrive,
  BarChart2,
  Shield,
  Laptop,
  Plus,
  UserPlus,
  ChevronDown
} from 'lucide-react';

export type NavTab =
  | 'home'
  | 'studio'
  | 'webinars'
  | 'past_streams'
  | 'clips'
  | 'storage'
  | 'channels'
  | 'analytics'
  | 'teams'
  | 'sessions'
  | 'admin';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  currentUser: any;
  currentOrgId: string;
  setCurrentOrgId: (id: string) => void;
  availableOrgs: { id: string; name: string }[];
  channelsCount: number;
  channelsQuota: number;
  onOpenInviteModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  currentOrgId,
  setCurrentOrgId,
  availableOrgs,
  channelsCount,
  channelsQuota,
  onOpenInviteModal
}) => {
  return (
    <aside className="w-64 bg-[#0E131F] border-r border-[#1C2538] flex flex-col justify-between select-none shrink-0 h-screen sticky top-0">
      <div className="flex flex-col overflow-y-auto">
        {/* User Profile Header */}
        <div className="p-4 border-b border-[#1C2538]/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-bold flex items-center justify-center text-xs ring-2 ring-[#1C2538] shrink-0">
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-white truncate">
                  {currentUser?.email || 'Guest User'}
                </div>
                <div className="flex items-center space-x-1.5 mt-0.5">
                  <span className="text-[10px] text-slate-400">
                    {currentUser?.isSuperAdmin ? 'Super Admin' : 'Free plan'}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-slate-600" />
                  <span className="text-[10px] text-blue-400 font-medium cursor-pointer hover:underline">
                    Upgrade
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('sessions')}
              className="text-slate-400 hover:text-white p-1 rounded"
              title="Session Details"
            >
              <Laptop className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Invite Members Link */}
          <button
            onClick={() => {
              if (onOpenInviteModal) onOpenInviteModal();
              else setActiveTab('teams');
            }}
            className="mt-3 w-full py-1.5 px-2.5 rounded-lg border border-[#1C2538] hover:border-slate-600 text-[11px] font-medium text-slate-300 hover:text-white flex items-center space-x-1.5 transition-colors bg-[#131B2E]/60"
          >
            <UserPlus className="w-3.5 h-3.5 text-blue-400" />
            <span>+ Invite members</span>
          </button>
        </div>

        {/* Workspaces Section */}
        <div className="px-4 py-3 border-b border-[#1C2538]/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Workspaces
            </span>
            <button
              onClick={() => setActiveTab('teams')}
              className="text-slate-400 hover:text-white"
              title="Create Workspace"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="relative">
            <select
              value={currentOrgId}
              onChange={(e) => setCurrentOrgId(e.target.value)}
              className="w-full appearance-none bg-[#131B2E] border border-[#1C2538] hover:border-slate-600 rounded-lg py-1.5 pl-2.5 pr-8 text-xs font-medium text-white focus:outline-none cursor-pointer truncate"
            >
              {availableOrgs.map((org) => (
                <option key={org.id} value={org.id} className="bg-[#131B2E] text-white">
                  {org.name}
                </option>
              ))}
            </select>
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Main Navigation List */}
        <nav className="p-3 space-y-1">
          <button
            onClick={() => setActiveTab('home')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'home'
                ? 'bg-[#1C2538] text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#131B2E]'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Home className="w-4 h-4" />
              <span>Streams (Home)</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('studio')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'studio'
                ? 'bg-blue-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#131B2E]'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Radio className="w-4 h-4" />
              <span>Encoder Studio</span>
            </div>
            <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300">
              LIVE
            </span>
          </button>

          <button
            onClick={() => setActiveTab('webinars')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'webinars'
                ? 'bg-[#1C2538] text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#131B2E]'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Tv className="w-4 h-4" />
              <span>Webinars</span>
            </div>
            <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
              NEW
            </span>
          </button>

          <button
            onClick={() => setActiveTab('past_streams')}
            className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'past_streams'
                ? 'bg-[#1C2538] text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#131B2E]'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Past streams</span>
          </button>

          <button
            onClick={() => setActiveTab('clips')}
            className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'clips'
                ? 'bg-[#1C2538] text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#131B2E]'
            }`}
          >
            <Scissors className="w-4 h-4" />
            <span>Clips</span>
          </button>

          <button
            onClick={() => setActiveTab('storage')}
            className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'storage'
                ? 'bg-[#1C2538] text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#131B2E]'
            }`}
          >
            <HardDrive className="w-4 h-4" />
            <span>Storage</span>
          </button>

          <button
            onClick={() => setActiveTab('channels')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'channels'
                ? 'bg-[#1C2538] text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#131B2E]'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Tv className="w-4 h-4" />
              <span>Channels</span>
            </div>
            {channelsCount > 0 && (
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-800 text-blue-400 border border-slate-700">
                {channelsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'analytics'
                ? 'bg-[#1C2538] text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#131B2E]'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>Analytics</span>
          </button>

          {/* Super Admin Panel link for admins */}
          {currentUser?.isSuperAdmin && (
            <div className="pt-2">
              <div className="px-3 py-1 text-[9px] uppercase tracking-wider font-bold text-red-400">
                Admin Control
              </div>
              <button
                onClick={() => setActiveTab('admin')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'admin'
                    ? 'bg-red-600 text-white font-semibold shadow-sm'
                    : 'text-red-400 hover:text-red-300 hover:bg-red-950/20'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Shield className="w-4 h-4" />
                  <span>Super Admin</span>
                </div>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-red-900/40 border border-red-500/30 text-white">
                  ROOT
                </span>
              </button>
            </div>
          )}
        </nav>
      </div>

      {/* Bottom Channels Quota & Footer */}
      <div className="p-4 border-t border-[#1C2538]/60 space-y-3">
        {/* Quota Progress Tracker */}
        <div className="bg-[#131B2E] border border-[#1C2538] rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-white">Channels</span>
            <button
              onClick={() => setActiveTab('channels')}
              className="text-blue-400 hover:underline text-[10px] font-medium"
            >
              Add more
            </button>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (channelsCount / (channelsQuota || 5)) * 100)}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            ADDED: {channelsCount} (LIMIT PER STREAM: {channelsQuota || 5})
          </div>
        </div>

        {/* Footer Links */}
        <div className="flex flex-wrap gap-x-2 gap-y-1 text-[10px] text-slate-500 px-1">
          <a href="#" className="hover:text-slate-400">Pricing</a>
          <span>•</span>
          <a href="#" className="hover:text-slate-400">Help Center</a>
          <span>•</span>
          <a href="#" className="hover:text-slate-400">Changelog</a>
          <span>•</span>
          <a href="#" className="hover:text-slate-400">API</a>
          <span>•</span>
          <a href="#" className="hover:text-slate-400">Terms</a>
        </div>
      </div>
    </aside>
  );
};

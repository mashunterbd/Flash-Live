import React, { useState, useEffect } from 'react';
import {
  Radio,
  Shield,
  Tv,
  CheckCircle,
  AlertCircle,
  LogOut,
  Laptop,
  Building,
  KeyRound
} from 'lucide-react';
import { AuthModal } from './components/AuthModal.js';
import { SessionsView } from './components/SessionsView.js';
import { OrganizationsView } from './components/OrganizationsView.js';
import { SuperAdminPanel } from './components/SuperAdminPanel.js';

interface UserInfo {
  id: string;
  email: string;
  name: string;
  labels: string[];
  isSuperAdmin: boolean;
  role: 'SUPER_ADMIN' | 'NORMAL_USER';
  emailVerification: boolean;
}

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);
  const [activeTab, setActiveTab] = useState<'studio' | 'destinations' | 'teams' | 'sessions' | 'admin'>('studio');
  const [serverHealth, setServerHealth] = useState<'checking' | 'healthy' | 'unreachable'>('checking');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Check health and auto-load active session on mount
  useEffect(() => {
    checkHealth();
    // Default to pre-configured test user if desired for QA
    loginAs('6aec33ab0023e440f804');
  }, []);

  const checkHealth = async () => {
    try {
      const res = await fetch('/health');
      if (res.ok) setServerHealth('healthy');
      else setServerHealth('unreachable');
    } catch {
      setServerHealth('unreachable');
    }
  };

  const loginAs = async (userId: string) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { 'x-user-id': userId }
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data);
      }
    } catch {
      // Retain fallback
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('studio');
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-[#F8FAFC] flex flex-col font-sans">
      {/* Top Studio Navbar */}
      <header className="h-16 border-b border-[#1E293B] bg-[#131B2E] px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/30">
            <Radio className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg tracking-tight text-white">Flash Live</span>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Studio
              </span>
            </div>
            <p className="text-xs text-[#94A3B8]">Multi-Destination RTMP Platform</p>
          </div>
        </div>

        {/* Server Status & User Controls */}
        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center space-x-2 text-xs">
            <span className="text-[#94A3B8]">Backend:</span>
            {serverHealth === 'healthy' ? (
              <span className="inline-flex items-center text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <CheckCircle className="w-3 h-3 mr-1" /> Ready
              </span>
            ) : (
              <span className="inline-flex items-center text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                <AlertCircle className="w-3 h-3 mr-1" /> {serverHealth}
              </span>
            )}
          </div>

          {currentUser ? (
            <div className="flex items-center space-x-3 pl-4 border-l border-[#1E293B]">
              <div className="text-right">
                <div className="text-xs font-semibold text-white flex items-center justify-end space-x-1.5">
                  <span>{currentUser.name}</span>
                  {currentUser.isSuperAdmin ? (
                    <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 py-0.2 rounded font-mono font-bold">
                      SUPER ADMIN
                    </span>
                  ) : (
                    <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.2 rounded font-mono">
                      NORMAL USER
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-[#94A3B8]">{currentUser.email}</div>
              </div>

              {/* Fast switcher buttons for pairing */}
              <div className="flex items-center space-x-1 bg-[#0B0F17] p-1 rounded-lg border border-[#1E293B]">
                <button
                  onClick={() => loginAs('6aec33ab0023e440f804')}
                  className={`text-[11px] px-2 py-1 rounded transition-colors ${
                    currentUser.id === '6aec33ab0023e440f804'
                      ? 'bg-blue-600 text-white font-medium'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Switch to Normal Test User"
                >
                  Normal
                </button>
                <button
                  onClick={() => loginAs('6aec344800296c3cb621')}
                  className={`text-[11px] px-2 py-1 rounded transition-colors ${
                    currentUser.id === '6aec344800296c3cb621'
                      ? 'bg-red-600 text-white font-medium'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Switch to Super Admin User"
                >
                  Admin
                </button>
              </div>

              <button
                onClick={handleLogout}
                className="p-2 hover:bg-[#1E293B] text-[#94A3B8] hover:text-white rounded-lg transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors flex items-center space-x-1.5 min-h-[34px] shadow-sm"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Sign In / Sign Up</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Studio Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-[#1E293B] pb-3">
          <button
            onClick={() => setActiveTab('studio')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 min-h-[38px] ${
              activeTab === 'studio' ? 'bg-blue-600 text-white' : 'text-[#94A3B8] hover:text-white hover:bg-[#1E293B]'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Live Broadcast Studio</span>
          </button>
          <button
            onClick={() => setActiveTab('destinations')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 min-h-[38px] ${
              activeTab === 'destinations' ? 'bg-blue-600 text-white' : 'text-[#94A3B8] hover:text-white hover:bg-[#1E293B]'
            }`}
          >
            <Tv className="w-4 h-4" />
            <span>Connected Destinations</span>
          </button>
          <button
            onClick={() => setActiveTab('teams')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 min-h-[38px] ${
              activeTab === 'teams' ? 'bg-blue-600 text-white' : 'text-[#94A3B8] hover:text-white hover:bg-[#1E293B]'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>Organizations & Teams</span>
          </button>
          {currentUser && (
            <button
              onClick={() => setActiveTab('sessions')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 min-h-[38px] ${
                activeTab === 'sessions' ? 'bg-blue-600 text-white' : 'text-[#94A3B8] hover:text-white hover:bg-[#1E293B]'
              }`}
            >
              <Laptop className="w-4 h-4" />
              <span>Active Sessions</span>
            </button>
          )}
          {currentUser?.isSuperAdmin && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 min-h-[38px] ${
                activeTab === 'admin' ? 'bg-red-600 text-white' : 'text-red-400 hover:text-red-300 hover:bg-red-900/20'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Super Admin Panel</span>
            </button>
          )}
        </div>

        {/* Tab 1: Studio Broadcast View */}
        {activeTab === 'studio' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Stream Settings */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-[#131B2E] border border-[#1E293B] rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                    <h2 className="text-base font-semibold text-white">Stream Output Status</h2>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-[#94A3B8] border border-[#1E293B] font-mono">
                    READY TO STREAM
                  </span>
                </div>

                <div className="space-y-2 mb-5">
                  <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
                    Unified Broadcast Title (Propagates to all active destinations)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Breaking News & Tech Insights Live Broadcast"
                    defaultValue="Live Broadcast: Episode 1"
                    className="w-full bg-[#0B0F17] border border-[#1E293B] focus:border-blue-500 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
                  />
                </div>

                {/* RTMP Ingest Credentials */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#94A3B8]">RTMP Server Ingest URL</label>
                    <div className="bg-[#0B0F17] border border-[#1E293B] rounded-lg p-2.5 text-xs font-mono text-slate-300 truncate">
                      rtmp://localhost:1935/live
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#94A3B8]">Stream Key (Secured)</label>
                    <div className="bg-[#0B0F17] border border-[#1E293B] rounded-lg p-2.5 text-xs font-mono text-slate-300 truncate">
                      fl_live_98ab7c2e1f40d89a
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Connected Channels & Quota */}
            <div className="space-y-6">
              <div className="bg-[#131B2E] border border-[#1E293B] rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-semibold text-white">Active Destinations</h2>
                  <span className="text-xs text-blue-400 font-medium">0 / 5 connected</span>
                </div>
                <p className="text-xs text-[#94A3B8] mb-4">
                  Connect your Facebook Pages and YouTube Channels to broadcast simultaneously.
                </p>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg border border-[#1E293B] bg-[#0B0F17]/50">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-xs ring-1 ring-blue-500/30">
                        f
                      </div>
                      <div>
                        <div className="text-xs font-medium text-white">Facebook Page</div>
                        <div className="text-[11px] text-[#94A3B8]">Live streaming permission</div>
                      </div>
                    </div>
                    <button className="text-xs bg-[#1E293B] hover:bg-[#2A3854] text-slate-200 border border-[#2D3A54] px-3 py-1.5 rounded-lg transition-colors min-h-[32px]">
                      Connect
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg border border-[#1E293B] bg-[#0B0F17]/50">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full bg-red-600/20 text-red-400 flex items-center justify-center font-bold text-xs ring-1 ring-red-500/30">
                        yt
                      </div>
                      <div>
                        <div className="text-xs font-medium text-white">YouTube Channel</div>
                        <div className="text-[11px] text-[#94A3B8]">Live broadcast permission</div>
                      </div>
                    </div>
                    <button className="text-xs bg-[#1E293B] hover:bg-[#2A3854] text-slate-200 border border-[#2D3A54] px-3 py-1.5 rounded-lg transition-colors min-h-[32px]">
                      Connect
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Connected Destinations Tab */}
        {activeTab === 'destinations' && (
          <div className="bg-[#131B2E] border border-[#1E293B] rounded-xl p-8 text-center space-y-4">
            <Tv className="w-12 h-12 text-blue-400 mx-auto" />
            <h3 className="text-lg font-bold text-white">Platform Destinations</h3>
            <p className="text-xs text-[#94A3B8] max-w-md mx-auto">
              Multi-platform live stream connections using official Meta and Google OAuth APIs.
            </p>
          </div>
        )}

        {/* Tab 3: Organizations & Teams */}
        {activeTab === 'teams' && (
          <OrganizationsView currentUser={currentUser} />
        )}

        {/* Tab 4: Active Login Sessions (PRD 4.1) */}
        {activeTab === 'sessions' && currentUser && (
          <SessionsView userId={currentUser.id} />
        )}

        {/* Tab 5: Super Admin Panel (PRD 3.0 & 4.5) */}
        {activeTab === 'admin' && currentUser?.isSuperAdmin && (
          <SuperAdminPanel currentUserId={currentUser.id} />
        )}
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(user) => setCurrentUser(user)}
      />
    </div>
  );
};

export default App;

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
  KeyRound,
  Copy,
  RefreshCw,
  Check,
  Play,
  Square,
  Sparkles
} from 'lucide-react';
import { AuthModal } from './components/AuthModal.js';
import { SessionsView } from './components/SessionsView.js';
import { OrganizationsView } from './components/OrganizationsView.js';
import { SuperAdminPanel } from './components/SuperAdminPanel.js';
import { DestinationsView, Channel } from './components/DestinationsView.js';
import { Spinner } from './components/Spinner.js';

interface UserInfo {
  id: string;
  email: string;
  name: string;
  labels: string[];
  isSuperAdmin: boolean;
  role: 'SUPER_ADMIN' | 'NORMAL_USER';
  emailVerification: boolean;
}

interface StreamSession {
  id: string;
  orgId: string;
  ingestUrl: string;
  streamKey: string;
  title: string;
  destinations: string[];
  status: 'idle' | 'live';
  startedAt: string | null;
}

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);
  const [activeTab, setActiveTab] = useState<'studio' | 'destinations' | 'teams' | 'sessions' | 'admin'>('studio');
  const [serverHealth, setServerHealth] = useState<'checking' | 'healthy' | 'unreachable'>('checking');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Active Organization
  const [currentOrgId, setCurrentOrgId] = useState<string>('6aec4ad00008859371b2');
  const [availableOrgs, setAvailableOrgs] = useState<{ id: string; name: string }[]>([]);

  // Studio Stream Session State (PRD 4.4)
  const [streamSession, setStreamSession] = useState<StreamSession | null>(null);
  const [broadcastTitle, setBroadcastTitle] = useState('Live Broadcast: Episode 1');
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>([]);
  const [copiedField, setCopiedField] = useState<'url' | 'key' | null>(null);
  const [updatingTitle, setUpdatingTitle] = useState(false);
  const [titleUpdateSuccess, setTitleUpdateSuccess] = useState<string | null>(null);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastLoading, setBroadcastLoading] = useState(false);
  const [regeneratingKey, setRegeneratingKey] = useState(false);

  // Check health and auto-load active session on mount
  useEffect(() => {
    checkHealth();
    loginAs('6aec33ab0023e440f804');
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadUserOrganizations();
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentOrgId) {
      loadStreamSession();
      loadOrgChannels();
    }
  }, [currentOrgId]);

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

  const loadUserOrganizations = async () => {
    try {
      const res = await fetch('/api/teams');
      if (res.ok) {
        const data = await res.json();
        const teams = data.teams || [];
        const uniqueMap = new Map<string, { id: string; name: string }>();
        teams.forEach((t: any) => {
          if (t?.$id && !uniqueMap.has(t.$id)) {
            uniqueMap.set(t.$id, { id: t.$id, name: t.name });
          }
        });
        const uniqueList = Array.from(uniqueMap.values());
        setAvailableOrgs(uniqueList);
        if (uniqueList.length > 0 && !uniqueList.some(o => o.id === currentOrgId)) {
          setCurrentOrgId(uniqueList[0].id);
        }
      }
    } catch {
      // Handled silently
    }
  };

  const loadStreamSession = async () => {
    try {
      const res = await fetch(`/api/streams/session?orgId=${encodeURIComponent(currentOrgId)}`);
      if (res.ok) {
        const data = await res.json();
        setStreamSession(data);
        if (data.title) setBroadcastTitle(data.title);
        setIsBroadcasting(data.status === 'live');
        if (Array.isArray(data.destinations)) {
          setSelectedDestinations(data.destinations);
        }
      }
    } catch {
      // Handled silently
    }
  };

  const loadOrgChannels = async () => {
    try {
      const res = await fetch(`/api/channels?orgId=${encodeURIComponent(currentOrgId)}`);
      if (res.ok) {
        const data = await res.json();
        const rawChannels = data.channels || [];
        const uniqueMap = new Map<string, Channel>();
        rawChannels.forEach((c: Channel) => {
          if (c?.id && !uniqueMap.has(c.id)) {
            uniqueMap.set(c.id, c);
          }
        });
        const loadedChannels = Array.from(uniqueMap.values());
        setChannels(loadedChannels);
        if (selectedDestinations.length === 0 && loadedChannels.length > 0) {
          const ids = loadedChannels.map((c: Channel) => c.id);
          setSelectedDestinations(ids);
          await updateDestinations(ids);
        }
      }
    } catch {
      // Handled silently
    }
  };

  const updateDestinations = async (destIds: string[]) => {
    try {
      await fetch('/api/streams/destinations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgId: currentOrgId, destinations: destIds })
      });
    } catch {
      // Handled silently
    }
  };

  const toggleDestination = async (channelId: string) => {
    const next = selectedDestinations.includes(channelId)
      ? selectedDestinations.filter(id => id !== channelId)
      : [...selectedDestinations, channelId];
    setSelectedDestinations(next);
    await updateDestinations(next);
  };

  const handleUpdateTitle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim()) return;

    setUpdatingTitle(true);
    setTitleUpdateSuccess(null);
    try {
      const res = await fetch('/api/streams/title', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgId: currentOrgId, title: broadcastTitle.trim() })
      });

      if (res.ok) {
        const data = await res.json();
        setTitleUpdateSuccess(data.message || 'Title synchronized to all selected destinations!');
        setTimeout(() => setTitleUpdateSuccess(null), 4000);
      }
    } catch {
      // Handled silently
    } finally {
      setUpdatingTitle(false);
    }
  };

  const handleRegenerateKey = async () => {
    if (!confirm('Regenerate stream key? Your current streaming software (OBS, vMix) will need to be updated.')) {
      return;
    }

    setRegeneratingKey(true);
    try {
      const res = await fetch('/api/streams/regenerate-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgId: currentOrgId })
      });
      if (res.ok) {
        const data = await res.json();
        setStreamSession(prev => prev ? { ...prev, streamKey: data.streamKey } : null);
      }
    } catch {
      // Handled silently
    } finally {
      setRegeneratingKey(false);
    }
  };

  const handleToggleBroadcast = async () => {
    const action = isBroadcasting ? 'stop' : 'start';
    setBroadcastLoading(true);
    try {
      const res = await fetch('/api/streams/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgId: currentOrgId, action })
      });
      if (res.ok) {
        setIsBroadcasting(action === 'start');
      }
    } catch {
      // Handled silently
    } finally {
      setBroadcastLoading(false);
    }
  };

  const copyToClipboard = (text: string, field: 'url' | 'key') => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
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

              {/* Fast test switcher buttons for pairing */}
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
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1E293B] pb-3">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('studio')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 min-h-[38px] ${
                activeTab === 'studio' ? 'bg-blue-600 text-white shadow-sm' : 'text-[#94A3B8] hover:text-white hover:bg-[#1E293B]'
              }`}
            >
              <Radio className="w-4 h-4" />
              <span>Live Broadcast Studio</span>
            </button>
            <button
              onClick={() => setActiveTab('destinations')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 min-h-[38px] ${
                activeTab === 'destinations' ? 'bg-blue-600 text-white shadow-sm' : 'text-[#94A3B8] hover:text-white hover:bg-[#1E293B]'
              }`}
            >
              <Tv className="w-4 h-4" />
              <span>Connected Destinations</span>
              {channels.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-blue-400 font-mono ml-1">
                  {channels.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('teams')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 min-h-[38px] ${
                activeTab === 'teams' ? 'bg-blue-600 text-white shadow-sm' : 'text-[#94A3B8] hover:text-white hover:bg-[#1E293B]'
              }`}
            >
              <Building className="w-4 h-4" />
              <span>Organizations & Teams</span>
            </button>
            {currentUser && (
              <button
                onClick={() => setActiveTab('sessions')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 min-h-[38px] ${
                  activeTab === 'sessions' ? 'bg-blue-600 text-white shadow-sm' : 'text-[#94A3B8] hover:text-white hover:bg-[#1E293B]'
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
                  activeTab === 'admin' ? 'bg-red-600 text-white shadow-sm' : 'text-red-400 hover:text-red-300 hover:bg-red-900/20'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Super Admin Panel</span>
              </button>
            )}
          </div>

          {/* Active Organization Workspace Selector */}
          {availableOrgs.length > 0 && (
            <div className="flex items-center space-x-2 bg-[#131B2E] border border-[#1E293B] rounded-lg px-3 py-1.5">
              <Building className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="text-xs text-[#94A3B8]">Workspace:</span>
              <select
                value={currentOrgId}
                onChange={(e) => setCurrentOrgId(e.target.value)}
                className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer"
              >
                {availableOrgs.map(org => (
                  <option key={org.id} value={org.id} className="bg-[#131B2E] text-white">
                    {org.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Tab 1: Studio Broadcast View (PRD 4.4 Live Streaming) */}
        {activeTab === 'studio' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Stream Settings & Output Canvas */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-[#131B2E] border border-[#1E293B] rounded-xl p-6 shadow-sm space-y-6">
                {/* Broadcast Header & Go Live Action */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1E293B]">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-3.5 h-3.5 rounded-full ${
                        isBroadcasting ? 'bg-red-500 animate-pulse ring-4 ring-red-500/20' : 'bg-slate-500'
                      }`}
                    />
                    <div>
                      <h2 className="text-base font-semibold text-white">Stream Output Pipeline</h2>
                      <p className="text-xs text-[#94A3B8]">
                        {isBroadcasting
                          ? `Broadcasting live to ${selectedDestinations.length} destination(s)`
                          : 'Idle — ready to receive external RTMP feed'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-mono font-semibold border ${
                        isBroadcasting
                          ? 'bg-red-500/10 text-red-400 border-red-500/30'
                          : 'bg-slate-800 text-[#94A3B8] border-[#1E293B]'
                      }`}
                    >
                      {isBroadcasting ? '● LIVE ON AIR' : 'OFFLINE'}
                    </span>

                    <button
                      onClick={handleToggleBroadcast}
                      disabled={broadcastLoading || selectedDestinations.length === 0}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 min-h-[38px] shadow-sm ${
                        isBroadcasting
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : selectedDestinations.length === 0
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                    >
                      {broadcastLoading ? (
                        <Spinner size="sm" />
                      ) : isBroadcasting ? (
                        <>
                          <Square className="w-3.5 h-3.5 fill-current" />
                          <span>End Broadcast</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Go Live to Selected</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Unified Broadcast Title Form (PRD 4.4) */}
                <form onSubmit={handleUpdateTitle} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                      <span>Unified Broadcast Title (Propagates to all active destinations)</span>
                    </label>
                    {titleUpdateSuccess && (
                      <span className="text-xs text-emerald-400 font-medium flex items-center space-x-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>{titleUpdateSuccess}</span>
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Breaking News & Tech Insights Live Broadcast"
                      value={broadcastTitle}
                      onChange={(e) => setBroadcastTitle(e.target.value)}
                      className="flex-1 bg-[#0B0F17] border border-[#1E293B] focus:border-blue-500 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
                    />
                    <button
                      type="submit"
                      disabled={updatingTitle}
                      className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors shrink-0 min-h-[42px]"
                    >
                      {updatingTitle ? <Spinner size="sm" /> : <span>Update Title</span>}
                    </button>
                  </div>
                </form>

                {/* RTMP Ingest Credentials (PRD 4.4) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {/* Ingest URL */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-[#94A3B8]">RTMP Server Ingest URL</label>
                      <button
                        onClick={() => copyToClipboard(streamSession?.ingestUrl || 'rtmp://localhost:1935/live', 'url')}
                        className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center space-x-1"
                      >
                        {copiedField === 'url' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedField === 'url' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <div className="bg-[#0B0F17] border border-[#1E293B] rounded-lg p-2.5 text-xs font-mono text-slate-300 truncate select-all">
                      {streamSession?.ingestUrl || 'rtmp://localhost:1935/live'}
                    </div>
                  </div>

                  {/* Stream Key */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-[#94A3B8]">Stream Key (Secured)</label>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={handleRegenerateKey}
                          disabled={regeneratingKey}
                          className="text-[11px] text-slate-400 hover:text-white flex items-center space-x-1"
                          title="Generate a new stream key"
                        >
                          <RefreshCw className={`w-3 h-3 ${regeneratingKey ? 'animate-spin' : ''}`} />
                          <span>Reset</span>
                        </button>
                        <button
                          onClick={() => copyToClipboard(streamSession?.streamKey || '', 'key')}
                          className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center space-x-1"
                        >
                          {copiedField === 'key' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedField === 'key' ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>
                    <div className="bg-[#0B0F17] border border-[#1E293B] rounded-lg p-2.5 text-xs font-mono text-slate-300 truncate select-all">
                      {streamSession?.streamKey || 'Generating...'}
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 bg-[#0B0F17]/50 p-3 rounded-lg border border-[#1E293B]">
                  <strong>How to broadcast:</strong> Paste the RTMP Server Ingest URL and Stream Key into your streaming software (OBS, vMix, Wirecast). Select your broadcast destinations on the right, then start streaming from OBS or click &quot;Go Live&quot;.
                </div>
              </div>
            </div>

            {/* Right Column: Multi-Destination Live Selection (PRD 4.4) */}
            <div className="space-y-6">
              <div className="bg-[#131B2E] border border-[#1E293B] rounded-xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
                  <div>
                    <h2 className="text-base font-semibold text-white">Multi-Destination Relay</h2>
                    <p className="text-xs text-[#94A3B8]">
                      Select pages and channels to receive the live feed.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full font-mono">
                    {selectedDestinations.length} / {channels.length} active
                  </span>
                </div>

                {channels.length === 0 ? (
                  <div className="p-6 text-center bg-[#0B0F17]/50 border border-[#1E293B] rounded-lg space-y-3">
                    <Tv className="w-8 h-8 text-slate-600 mx-auto" />
                    <p className="text-xs text-[#94A3B8]">
                      No Facebook Pages or YouTube Channels connected yet.
                    </p>
                    <button
                      onClick={() => setActiveTab('destinations')}
                      className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Connect Destinations
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {channels.map((channel) => {
                      const isSelected = selectedDestinations.includes(channel.id);
                      const isFb = channel.platform === 'facebook';

                      return (
                        <div
                          key={channel.id}
                          onClick={() => toggleDestination(channel.id)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'bg-blue-950/20 border-blue-500/40 shadow-sm'
                              : 'bg-[#0B0F17]/40 border-[#1E293B] opacity-70 hover:opacity-100'
                          }`}
                        >
                          <div className="flex items-center space-x-3 min-w-0">
                            {/* Circular Channel Logo per DESIGN.md */}
                            <div className="relative shrink-0">
                              <img
                                src={channel.logoUrl || (isFb
                                  ? 'https://upload.wikimedia.org/wikipedia/commons/b/b9/2023_Facebook_icon.svg'
                                  : 'https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg')}
                                alt={channel.name}
                                className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-700 bg-[#0B0F17]"
                              />
                              <span
                                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow ring-1 ring-[#131B2E] ${
                                  isFb ? 'bg-blue-600' : 'bg-red-600'
                                }`}
                              >
                                {isFb ? 'f' : 'yt'}
                              </span>
                            </div>

                            <div className="min-w-0">
                              <div className="text-xs font-semibold text-white truncate">
                                {channel.name}
                              </div>
                              <div className="text-[11px] text-[#94A3B8] font-mono truncate">
                                {channel.platform.toUpperCase()} • ID: {channel.externalId.substring(0, 16)}
                              </div>
                            </div>
                          </div>

                          {/* Custom Toggle Switch */}
                          <div className="shrink-0 pl-3">
                            <div
                              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                                isSelected ? 'bg-blue-600' : 'bg-slate-800'
                              }`}
                            >
                              <div
                                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                                  isSelected ? 'translate-x-5' : 'translate-x-0'
                                }`}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    <div className="pt-2">
                      <button
                        onClick={() => setActiveTab('destinations')}
                        className="w-full py-2 bg-[#0B0F17] hover:bg-[#1E293B] text-slate-300 border border-[#1E293B] rounded-lg text-xs font-medium transition-colors flex items-center justify-center space-x-1.5"
                      >
                        <Tv className="w-3.5 h-3.5" />
                        <span>Manage Connected Destinations</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Connected Destinations Tab (PRD 4.3) */}
        {activeTab === 'destinations' && (
          <DestinationsView
            currentUser={currentUser}
            currentOrgId={currentOrgId}
            onChannelsChanged={loadOrgChannels}
          />
        )}

        {/* Tab 3: Organizations & Teams (PRD 4.2) */}
        {activeTab === 'teams' && (
          <OrganizationsView currentUser={currentUser} />
        )}

        {/* Tab 4: Active Login Sessions (PRD 4.1) */}
        {activeTab === 'sessions' && currentUser && (
          <SessionsView userId={currentUser.id} />
        )}

        {/* Tab 5: Super Admin Panel (PRD 3.0, 4.5, 4.6) */}
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

import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  AlertCircle,
  LogOut,
  KeyRound,
  Tv
} from 'lucide-react';
import { Sidebar, NavTab } from './components/Sidebar.js';
import { StreamsListView } from './components/StreamsListView.js';
import { EncoderStudioView } from './components/EncoderStudioView.js';
import { CreateStreamModal } from './components/CreateStreamModal.js';
import { StreamSettingsModal } from './components/StreamSettingsModal.js';
import { UpdateTitlesModal } from './components/UpdateTitlesModal.js';
import { DestinationsView, Channel } from './components/DestinationsView.js';
import { OrganizationsView } from './components/OrganizationsView.js';
import { SessionsView } from './components/SessionsView.js';
import { SuperAdminPanel } from './components/SuperAdminPanel.js';
import { AuthModal } from './components/AuthModal.js';
import { HelpModal } from './components/HelpModal.js';

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
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [serverHealth, setServerHealth] = useState<'checking' | 'healthy' | 'unreachable'>('checking');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Active Organization Workspace
  const [currentOrgId, setCurrentOrgId] = useState<string>('6aec4ad00008859371b2');
  const [availableOrgs, setAvailableOrgs] = useState<{ id: string; name: string }[]>([]);

  // Studio Stream Session State (PRD 4.4)
  const [streamSession, setStreamSession] = useState<StreamSession | null>(null);
  const [broadcastTitle, setBroadcastTitle] = useState('Live Broadcast: Episode 1');
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>([]);
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  // Modals state
  const [isCreateStreamModalOpen, setIsCreateStreamModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isUpdateTitlesModalOpen, setIsUpdateTitlesModalOpen] = useState(false);

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

  const toggleAllDestinations = async (enableAll: boolean) => {
    const next = enableAll ? channels.map(c => c.id) : [];
    setSelectedDestinations(next);
    await updateDestinations(next);
  };

  const handleRegenerateKey = async () => {
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
    }
  };

  const handleToggleBroadcast = async () => {
    const action = isBroadcasting ? 'stop' : 'start';
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
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('home');
  };

  return (
    <div className="min-h-screen bg-[#070A12] text-[#F8FAFC] flex font-sans antialiased overflow-x-hidden">
      {/* Persistent Left Sidebar matching Image 1 */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        currentOrgId={currentOrgId}
        setCurrentOrgId={setCurrentOrgId}
        availableOrgs={availableOrgs}
        channelsCount={channels.length}
        channelsQuota={5}
        onOpenInviteModal={() => setActiveTab('teams')}
      />

      {/* Main Studio View Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Top Navbar */}
        <header className="h-16 border-b border-[#1C2538] bg-[#0E131F]/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30 shrink-0">
          <div className="flex items-center space-x-3">
            <span className="font-bold text-base tracking-tight text-white flex items-center space-x-2">
              <span className="text-blue-500">Flash</span>
              <span>Live</span>
            </span>
            <span className="text-slate-600 font-mono text-xs">/</span>
            <span className="text-xs text-slate-300 font-medium capitalize">
              {activeTab === 'home'
                ? 'Streams Dashboard'
                : activeTab === 'studio'
                ? 'Live Encoder Studio'
                : activeTab}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2 text-xs">
              <span className="text-[#94A3B8]">Appwrite:</span>
              {serverHealth === 'healthy' ? (
                <span className="inline-flex items-center text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-mono text-[10px]">
                  <CheckCircle className="w-3 h-3 mr-1" /> ONLINE
                </span>
              ) : (
                <span className="inline-flex items-center text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 font-mono text-[10px]">
                  <AlertCircle className="w-3 h-3 mr-1" /> {serverHealth}
                </span>
              )}
            </div>

            {currentUser ? (
              <div className="flex items-center space-x-3 pl-3 border-l border-[#1C2538]">
                {/* Switcher pills for testing */}
                <div className="flex items-center space-x-1 bg-[#131B2E] p-1 rounded-lg border border-[#1C2538]">
                  <button
                    onClick={() => loginAs('6aec33ab0023e440f804')}
                    className={`text-[10px] px-2 py-0.5 rounded transition-colors font-medium ${
                      currentUser.id === '6aec33ab0023e440f804'
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="Switch to Normal Test User"
                  >
                    Normal
                  </button>
                  <button
                    onClick={() => loginAs('6aec344800296c3cb621')}
                    className={`text-[10px] px-2 py-0.5 rounded transition-colors font-medium ${
                      currentUser.id === '6aec344800296c3cb621'
                        ? 'bg-red-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="Switch to Super Admin User"
                  >
                    Admin
                  </button>
                </div>

                <div className="text-right hidden sm:block">
                  <div className="text-xs font-semibold text-white truncate max-w-[140px]">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {currentUser.isSuperAdmin ? 'ROOT ADMIN' : 'NORMAL'}
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="p-1.5 hover:bg-[#1E293B] text-slate-400 hover:text-white rounded-lg transition-colors"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1.5"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </header>

        {/* Content Body Container */}
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
          {/* Tab 1: Streams Listing (Dashboard - Image 1) */}
          {activeTab === 'home' && (
            <StreamsListView
              onOpenNewStreamModal={() => setIsCreateStreamModalOpen(true)}
              onOpenEncoderStudio={() => setActiveTab('studio')}
              broadcastTitle={broadcastTitle}
              connectedChannelsCount={channels.length}
            />
          )}

          {/* Tab 2: Live Encoder Studio (Image 3) */}
          {activeTab === 'studio' && (
            <EncoderStudioView
              currentOrgId={currentOrgId}
              ingestUrl={streamSession?.ingestUrl || 'rtmp://localhost:1935/live'}
              streamKey={streamSession?.streamKey || 'Generating...'}
              broadcastTitle={broadcastTitle}
              channels={channels}
              selectedDestinations={selectedDestinations}
              isBroadcasting={isBroadcasting}
              onToggleBroadcast={handleToggleBroadcast}
              onToggleDestination={toggleDestination}
              onToggleAllDestinations={toggleAllDestinations}
              onRegenerateKey={handleRegenerateKey}
              onOpenSettings={() => setIsSettingsModalOpen(true)}
              onOpenAddChannel={() => setActiveTab('channels')}
              onOpenUpdateTitle={() => setIsUpdateTitlesModalOpen(true)}
            />
          )}

          {/* Tab 3: Connected Channels / Destinations (PRD 4.3) */}
          {activeTab === 'channels' && (
            <DestinationsView
              currentUser={currentUser}
              currentOrgId={currentOrgId}
              onChannelsChanged={loadOrgChannels}
            />
          )}

          {/* Tab 4: Workspaces & Teams (PRD 4.2) */}
          {activeTab === 'teams' && (
            <OrganizationsView currentUser={currentUser} />
          )}

          {/* Tab 5: Active Sessions (PRD 4.1) */}
          {activeTab === 'sessions' && currentUser && (
            <SessionsView userId={currentUser.id} />
          )}

          {/* Tab 6: Super Admin Panel (PRD 4.5 & 4.6) */}
          {activeTab === 'admin' && currentUser?.isSuperAdmin && (
            <SuperAdminPanel currentUserId={currentUser.id} />
          )}

          {/* Tab 7: Webinars / Past streams / Clips / Storage / Analytics Placeholders */}
          {['webinars', 'past_streams', 'clips', 'storage', 'analytics'].includes(activeTab) && (
            <div className="bg-[#111726] border border-[#1E293B] rounded-2xl p-12 text-center space-y-4">
              <Tv className="w-12 h-12 text-blue-400 mx-auto" />
              <h2 className="text-lg font-bold text-white capitalize">{activeTab.replace('_', ' ')} Studio</h2>
              <p className="text-xs text-[#94A3B8] max-w-md mx-auto">
                Broadcasting and cloud processing pipeline integrated with official Appwrite storage and real-time streaming relay.
              </p>
              <button
                onClick={() => setActiveTab('studio')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
              >
                Go to Encoder Studio
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Floating "Need Help?" Widget matching Restream screenshot */}
      <HelpModal />

      {/* "Create a new stream" Modal matching Image 2 */}
      <CreateStreamModal
        isOpen={isCreateStreamModalOpen}
        onClose={() => setIsCreateStreamModalOpen(false)}
        onSelectOption={(option) => {
          if (option === 'encoder' || option === 'studio') {
            setActiveTab('studio');
          } else if (option === 'webinar') {
            setActiveTab('webinars');
          } else {
            setActiveTab('studio');
          }
        }}
      />

      {/* Stream Settings Modal matching Image 4 */}
      <StreamSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        ingestUrl={streamSession?.ingestUrl || 'rtmp://localhost:1935/live'}
        streamKey={streamSession?.streamKey || ''}
        onRegenerateKey={handleRegenerateKey}
      />

      {/* Update Titles Modal */}
      <UpdateTitlesModal
        isOpen={isUpdateTitlesModalOpen}
        onClose={() => setIsUpdateTitlesModalOpen(false)}
        currentOrgId={currentOrgId}
        initialTitle={broadcastTitle}
        onTitleUpdated={(newTitle) => {
          setBroadcastTitle(newTitle);
          loadStreamSession();
        }}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(user) => setCurrentUser(user)}
      />
    </div>
  );
};

export default App;

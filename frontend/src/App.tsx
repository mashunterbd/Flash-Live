import React, { useState, useEffect } from 'react';
import {
  Tv,
  Plus,
  Radio,
  Sparkles
} from 'lucide-react';
import { NavTab } from './components/Sidebar.js';
import { ApexSidebar } from './components/ApexSidebar.js';
import { ApexTopBar } from './components/ApexTopBar.js';
import { KPICards } from './components/KPICards.js';
import { AnalyticsCharts } from './components/AnalyticsCharts.js';
import { ApexTable } from './components/ApexTable.js';
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
import { ThemeMode, getInitialTheme, applyTheme } from './utils/theme.js';

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
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>(() => getInitialTheme());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  // Apply theme on initial load and changes
  useEffect(() => {
    applyTheme(currentTheme);
  }, [currentTheme]);

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

  const handleThemeChange = (newTheme: ThemeMode) => {
    setCurrentTheme(newTheme);
    applyTheme(newTheme);
  };

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

  const getTitleForTab = (tab: NavTab) => {
    switch (tab) {
      case 'home':
        return 'Dashboard';
      case 'studio':
        return 'Live Encoder Studio';
      case 'channels':
        return 'Broadcast Destinations';
      case 'teams':
        return 'Team & Workspaces';
      case 'sessions':
        return 'Active Sessions';
      case 'admin':
        return 'Super Admin Console';
      case 'webinars':
        return 'Webinars Studio';
      case 'past_streams':
        return 'Past Broadcasts';
      case 'clips':
        return 'Stream Clips & Highlights';
      case 'storage':
        return 'Cloud Storage';
      case 'analytics':
        return 'Advanced Analytics';
      default:
        return 'Dashboard';
    }
  };

  return (
    <div className="min-h-screen text-[var(--text)] flex font-sans antialiased overflow-x-hidden transition-colors">
      {/* Fixed Apex Glass Sidebar matching the Reference */}
      <ApexSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        currentOrgId={currentOrgId}
        setCurrentOrgId={setCurrentOrgId}
        availableOrgs={availableOrgs}
        channelsCount={channels.length}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Studio View Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Top Apex Glass Bar */}
        <ApexTopBar
          pageTitle={getTitleForTab(activeTab)}
          currentTheme={currentTheme}
          onThemeChange={handleThemeChange}
          currentUser={currentUser}
          serverHealth={serverHealth}
          onLoginAs={loginAs}
          onLogout={handleLogout}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />

        {/* Content Body Container */}
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
          {/* Tab 1: Apex Glass Dashboard (matching reference 1:1) */}
          {activeTab === 'home' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Quick Action & Broadcast Banner */}
              <div className="glass-panel p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[var(--text)]">
                      {broadcastTitle}
                    </div>
                    <div className="text-xs text-[var(--text-muted)]">
                      {isBroadcasting
                        ? 'Broadcasting live across multi-destination RTMP endpoints.'
                        : 'Encoder ready. Feed OBS or hardware ingest to start multi-streaming.'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => setIsCreateStreamModalOpen(true)}
                    className="glass-card px-3.5 py-2 text-xs font-semibold text-[var(--text)] flex items-center space-x-1.5 hover:border-[var(--border-focus)] transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New Stream</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('studio')}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[var(--accent)] text-white shadow-md shadow-[var(--accent-glow)] flex items-center space-x-1.5 hover:opacity-90 transition-opacity"
                  >
                    <Radio className="w-3.5 h-3.5" />
                    <span>Open Studio</span>
                  </button>
                </div>
              </div>

              {/* Row 1: 3 KPI Cards matching Apex reference */}
              <KPICards
                isLive={isBroadcasting}
                connectedChannelsCount={channels.length}
                maxQuota={5}
              />

              {/* Row 2: 3 Analytics & Metric Cards matching Apex reference */}
              <AnalyticsCharts />

              {/* Row 3: Full-width Glass Destinations & Channels Table matching Apex reference */}
              <ApexTable
                channels={channels}
                selectedDestinations={selectedDestinations}
                onToggleDestination={toggleDestination}
                onEditChannel={() => setIsUpdateTitlesModalOpen(true)}
                onDisconnectChannel={(c) => {
                  if (confirm(`Disconnect ${c.name}?`)) {
                    fetch(`/api/channels/${c.id}`, { method: 'DELETE' }).then(() => loadOrgChannels());
                  }
                }}
              />

              {/* Streams Listing View for managing individual stream drafts */}
              <div className="pt-4">
                <StreamsListView
                  onOpenNewStreamModal={() => setIsCreateStreamModalOpen(true)}
                  onOpenEncoderStudio={() => setActiveTab('studio')}
                  broadcastTitle={broadcastTitle}
                  connectedChannelsCount={channels.length}
                />
              </div>
            </div>
          )}

          {/* Tab 2: Live Encoder Studio (matching Restream studio reference) */}
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
            <div className="glass-panel p-12 text-center space-y-4">
              <Tv className="w-12 h-12 text-[var(--accent)] mx-auto" />
              <h2 className="text-lg font-bold text-[var(--text)] capitalize">
                {activeTab.replace('_', ' ')} Studio
              </h2>
              <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto">
                Broadcasting and cloud processing pipeline integrated with official Appwrite storage and real-time streaming relay.
              </p>
              <button
                onClick={() => setActiveTab('studio')}
                className="px-4 py-2 bg-[var(--accent)] hover:opacity-90 text-white rounded-xl text-xs font-semibold"
              >
                Go to Encoder Studio
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Floating "Need Help?" Widget */}
      <HelpModal />

      {/* "Create a new stream" Modal */}
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

      {/* Stream Settings Modal */}
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

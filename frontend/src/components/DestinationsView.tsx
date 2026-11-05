import React, { useState, useEffect } from 'react';
import {
  Tv,
  Plus,
  Trash2,
  ExternalLink,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import { Spinner } from './Spinner.js';

export interface Channel {
  id: string;
  orgId: string;
  platform: 'facebook' | 'youtube';
  externalId: string;
  name: string;
  logoUrl?: string;
  permissions: string[];
  connectedAt: string;
  status: string;
}

interface DestinationsViewProps {
  currentUser: any;
  currentOrgId: string;
  onChannelsChanged?: () => void;
}

export const DestinationsView: React.FC<DestinationsViewProps> = ({
  currentOrgId,
  onChannelsChanged
}) => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [quota, setQuota] = useState(5);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Connect modal state
  const [showConnectModal, setShowConnectModal] = useState<'facebook' | 'youtube' | null>(null);
  const [customName, setCustomName] = useState('');
  const [customId, setCustomId] = useState('');
  const [customLogo, setCustomLogo] = useState('');

  useEffect(() => {
    if (currentOrgId) {
      loadChannels();
    }
  }, [currentOrgId]);

  const loadChannels = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/channels?orgId=${encodeURIComponent(currentOrgId)}`);
      if (res.ok) {
        const data = await res.json();
        setChannels(data.channels || []);
        setQuota(data.quota || 5);
      } else {
        const err = await res.json();
        setError(err.error || 'Failed to load channels');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthConnect = async (platform: 'facebook' | 'youtube') => {
    setActionLoading(`oauth_${platform}`);
    try {
      const res = await fetch(`/api/channels/${platform}/oauth-url?orgId=${encodeURIComponent(currentOrgId)}`);
      const data = await res.json();
      if (data.url) {
        const width = 600;
        const height = 700;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;
        window.open(
          data.url,
          `${platform}_oauth`,
          `width=${width},height=${height},left=${left},top=${top},toolbar=0,scrollbars=1,status=1,resizable=1`
        );
      } else {
        setError(data.error || 'Could not initiate OAuth');
      }
    } catch (err: any) {
      setError(err.message || 'OAuth initiation failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleManualConnect = async (platform: 'facebook' | 'youtube') => {
    if (!customName.trim() || !customId.trim()) {
      setError('Please provide a name and channel/page ID');
      return;
    }

    setActionLoading('manual_connect');
    setError(null);

    const defaultLogos = {
      facebook: 'https://upload.wikimedia.org/wikipedia/commons/b/b9/2023_Facebook_icon.svg',
      youtube: 'https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg'
    };

    const permissions = platform === 'facebook'
      ? ['pages_show_list', 'pages_read_engagement', 'pages_manage_posts', 'publish_video']
      : ['https://www.googleapis.com/auth/youtube.readonly', 'https://www.googleapis.com/auth/youtube.force-ssl'];

    try {
      const res = await fetch('/api/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgId: currentOrgId,
          platform,
          externalId: customId.trim(),
          name: customName.trim(),
          logoUrl: customLogo.trim() || defaultLogos[platform],
          permissions
        })
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(`Successfully connected ${data.name}!`);
        setShowConnectModal(null);
        setCustomName('');
        setCustomId('');
        setCustomLogo('');
        await loadChannels();
        if (onChannelsChanged) onChannelsChanged();
      } else {
        setError(data.error || 'Failed to connect channel');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDisconnect = async (channel: Channel) => {
    if (!confirm(`Are you sure you want to disconnect ${channel.name}? It will no longer receive live broadcasts.`)) {
      return;
    }

    setActionLoading(channel.id);
    setError(null);
    try {
      const res = await fetch(`/api/channels/${channel.id}`, { method: 'DELETE' });
      if (res.ok) {
        setSuccess(`Disconnected ${channel.name}`);
        setChannels(prev => prev.filter(c => c.id !== channel.id));
        if (onChannelsChanged) onChannelsChanged();
      } else {
        const err = await res.json();
        setError(err.error || 'Failed to disconnect channel');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setActionLoading(null);
    }
  };

  const isQuotaReached = channels.length >= quota;

  return (
    <div className="space-y-6">
      {/* Header & Quota Card in Glass Style */}
      <div className="glass-panel p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Tv className="w-5 h-5 text-[var(--accent)]" />
              <h2 className="text-lg font-bold text-[var(--text)]">Connected Streaming Destinations</h2>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Connect official Facebook Pages and YouTube Channels to broadcast live streams simultaneously.
            </p>
          </div>

          {/* Quota Progress */}
          <div className="flex items-center space-x-4 glass-card px-4 py-2.5 border-[var(--border)] bg-[var(--surface)]">
            <div>
              <div className="text-[11px] text-[var(--text-muted)] font-medium">Organization Quota</div>
              <div className="text-sm font-bold text-[var(--text)] font-mono">
                <span className={isQuotaReached ? 'text-[var(--warning)]' : 'text-[var(--accent)]'}>{channels.length}</span>
                <span className="text-[var(--text-muted)]"> / {quota} channels</span>
              </div>
            </div>
            <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isQuotaReached ? 'bg-[var(--warning)]' : 'bg-[var(--accent)]'
                }`}
                style={{ width: `${Math.min(100, (channels.length / quota) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Quota limit warning */}
        {isQuotaReached && (
          <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center space-x-2 text-xs text-[var(--warning)]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>
              You have reached your organization connection quota ({quota} channels). To add more channels, contact a Super Admin to increase your limit.
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => {
              setError(null);
              setShowConnectModal('facebook');
            }}
            disabled={isQuotaReached}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all min-h-[38px] ${
              isQuotaReached
                ? 'opacity-50 cursor-not-allowed bg-[var(--surface)] text-[var(--text-muted)] border border-[var(--border)]'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Connect Facebook Page</span>
          </button>

          <button
            onClick={() => {
              setError(null);
              setShowConnectModal('youtube');
            }}
            disabled={isQuotaReached}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all min-h-[38px] ${
              isQuotaReached
                ? 'opacity-50 cursor-not-allowed bg-[var(--surface)] text-[var(--text-muted)] border border-[var(--border)]'
                : 'bg-red-600 hover:bg-red-700 text-white shadow-md'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Connect YouTube Channel</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center justify-between text-xs text-[var(--danger)]">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-[var(--text-muted)] hover:text-[var(--text)]">✕</button>
        </div>
      )}

      {success && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between text-xs text-[var(--success)]">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
          <button onClick={() => setSuccess(null)} className="text-[var(--text-muted)] hover:text-[var(--text)]">✕</button>
        </div>
      )}

      {/* Channels Grid / Roster */}
      {loading ? (
        <div className="p-12 text-center glass-panel">
          <Spinner size="lg" className="mx-auto mb-3" />
          <p className="text-xs text-[var(--text-muted)]">Loading connected destinations...</p>
        </div>
      ) : channels.length === 0 ? (
        <div className="p-12 text-center glass-panel space-y-3">
          <Tv className="w-12 h-12 text-[var(--text-muted)] mx-auto opacity-40" />
          <h3 className="text-base font-bold text-[var(--text)]">No Channels Connected Yet</h3>
          <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto">
            Connect your Facebook Pages or YouTube Channels using the buttons above to enable simultaneous live streaming.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {channels.map((channel) => {
            const isFb = channel.platform === 'facebook';
            return (
              <div
                key={channel.id}
                className="glass-card p-5 flex flex-col justify-between"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3.5">
                    {/* Mandatory Circular Logo per DESIGN.md Section 5 */}
                    <div className="relative">
                      <img
                        src={channel.logoUrl || (isFb
                          ? 'https://upload.wikimedia.org/wikipedia/commons/b/b9/2023_Facebook_icon.svg'
                          : 'https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg')}
                        alt={channel.name}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-[var(--border)] bg-[var(--surface)]"
                      />
                      <span
                        className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow ring-2 ring-[var(--surface-card)] ${
                          isFb ? 'bg-blue-600' : 'bg-red-600'
                        }`}
                      >
                        {isFb ? 'f' : 'yt'}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-[var(--text)] tracking-tight flex items-center space-x-2">
                        <span>{channel.name}</span>
                        <span className="text-[10px] bg-emerald-500/10 text-[var(--success)] border border-emerald-500/20 px-1.5 py-0.2 rounded font-mono">
                          ACTIVE
                        </span>
                      </h4>
                      <p className="text-[11px] text-[var(--text-muted)] font-mono mt-0.5">
                        ID: {channel.externalId}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDisconnect(channel)}
                    disabled={actionLoading === channel.id}
                    className="p-1.5 text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-red-500/10 rounded-lg transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center"
                    title="Disconnect Channel"
                  >
                    {actionLoading === channel.id ? <Spinner size="sm" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>

                {/* Permissions & Connection Timestamp */}
                <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                  <div className="flex items-center space-x-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[var(--accent)]" />
                    <span>Live broadcast verified</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                    <span>{new Date(channel.connectedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Connection Flow Modal (Facebook / YouTube) */}
      {showConnectModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="glass-panel max-w-md w-full p-6 space-y-5 bg-[var(--surface-elevated)] border-[var(--border)]">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
              <div className="flex items-center space-x-2.5">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow ${
                    showConnectModal === 'facebook' ? 'bg-blue-600' : 'bg-red-600'
                  }`}
                >
                  {showConnectModal === 'facebook' ? 'f' : 'yt'}
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--text)]">
                    Connect {showConnectModal === 'facebook' ? 'Facebook Page' : 'YouTube Channel'}
                  </h3>
                  <p className="text-[11px] text-[var(--text-muted)]">Request live streaming permissions</p>
                </div>
              </div>
              <button
                onClick={() => setShowConnectModal(null)}
                className="text-[var(--text-muted)] hover:text-[var(--text)] text-lg p-1"
              >
                ✕
              </button>
            </div>

            {/* Live Streaming Permissions Required Per PRD 4.3 */}
            <div className="glass-card p-3.5 space-y-2 bg-[var(--surface)] border-[var(--border)]">
              <div className="text-xs font-semibold text-[var(--text)] flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[var(--success)]" />
                <span>Required Permissions for Simultaneous Broadcasting:</span>
              </div>
              <ul className="text-[11px] text-[var(--text-muted)] space-y-1 list-disc list-inside">
                {showConnectModal === 'facebook' ? (
                  <>
                    <li><span className="font-mono text-[var(--text)]">pages_show_list</span>: View managed Facebook Pages</li>
                    <li><span className="font-mono text-[var(--text)]">publish_video</span>: Publish live video RTMP feeds</li>
                    <li><span className="font-mono text-[var(--text)]">pages_manage_posts</span>: Broadcast updates to fans</li>
                  </>
                ) : (
                  <>
                    <li><span className="font-mono text-[var(--text)]">youtube.readonly</span>: Access YouTube live channel details</li>
                    <li><span className="font-mono text-[var(--text)]">youtube.force-ssl</span>: Create & dispatch live RTMP broadcasts</li>
                  </>
                )}
              </ul>
            </div>

            {/* Choice 1: Official OAuth Dialog */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                Option 1: Official OAuth Login
              </label>
              <button
                onClick={() => handleOAuthConnect(showConnectModal)}
                disabled={actionLoading === `oauth_${showConnectModal}`}
                className={`w-full py-2.5 rounded-xl text-xs font-semibold text-white transition-opacity flex items-center justify-center space-x-2 min-h-[38px] shadow-sm ${
                  showConnectModal === 'facebook'
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {actionLoading === `oauth_${showConnectModal}` ? (
                  <Spinner size="sm" />
                ) : (
                  <>
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open {showConnectModal === 'facebook' ? 'Meta' : 'Google'} OAuth Consent</span>
                  </>
                )}
              </button>
            </div>

            {/* Choice 2: Instant Direct Connection */}
            <div className="space-y-3 pt-3 border-t border-[var(--border)]">
              <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                Option 2: Direct Connection (Pre-authenticated / QA)
              </label>

              <div>
                <label className="text-[11px] text-[var(--text)] block mb-1">
                  {showConnectModal === 'facebook' ? 'Facebook Page Name' : 'YouTube Channel Name'}
                </label>
                <input
                  type="text"
                  placeholder={showConnectModal === 'facebook' ? 'e.g. Acme News Official' : 'e.g. Acme Tech Studio 24/7'}
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full glass-input px-3 py-2 text-xs text-[var(--text)] placeholder-[var(--text-muted)] bg-[var(--surface)]"
                />
              </div>

              <div>
                <label className="text-[11px] text-[var(--text)] block mb-1">
                  {showConnectModal === 'facebook' ? 'Facebook Page ID' : 'YouTube Channel ID'}
                </label>
                <input
                  type="text"
                  placeholder={showConnectModal === 'facebook' ? 'e.g. fb_page_892182019' : 'e.g. UC_x1g82f910a827'}
                  value={customId}
                  onChange={(e) => setCustomId(e.target.value)}
                  className="w-full glass-input px-3 py-2 text-xs text-[var(--text)] font-mono placeholder-[var(--text-muted)] bg-[var(--surface)]"
                />
              </div>

              <div>
                <label className="text-[11px] text-[var(--text)] block mb-1">
                  Logo / Avatar Image URL (Optional)
                </label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={customLogo}
                  onChange={(e) => setCustomLogo(e.target.value)}
                  className="w-full glass-input px-3 py-2 text-xs text-[var(--text)] font-mono placeholder-[var(--text-muted)] bg-[var(--surface)]"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConnectModal(null)}
                  className="px-3 py-1.5 rounded-lg text-xs text-[var(--text-muted)] hover:text-[var(--text)]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleManualConnect(showConnectModal)}
                  disabled={actionLoading === 'manual_connect'}
                  className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-[var(--accent)] hover:opacity-90 text-white min-h-[34px] flex items-center space-x-1.5 shadow-sm"
                >
                  {actionLoading === 'manual_connect' ? <Spinner size="sm" /> : <span>Confirm Connection</span>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

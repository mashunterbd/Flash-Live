import React, { useState } from 'react';
import {
  Plus,
  Radio,
  Video,
  MoreVertical,
  Calendar,
  Sparkles,
  ArrowUpDown,
  ExternalLink
} from 'lucide-react';

interface StreamItem {
  id: string;
  title: string;
  subtitle: string;
  type: 'rtmp' | 'studio' | 'webinar';
  status: 'Draft' | 'Live' | 'Scheduled';
  channelsCount: number;
  lastEdited: string;
}

interface StreamsListViewProps {
  onOpenNewStreamModal: () => void;
  onOpenEncoderStudio: () => void;
  broadcastTitle: string;
  connectedChannelsCount: number;
}

export const StreamsListView: React.FC<StreamsListViewProps> = ({
  onOpenNewStreamModal,
  onOpenEncoderStudio,
  broadcastTitle,
  connectedChannelsCount
}) => {
  const [filterTab, setFilterTab] = useState<'all' | 'drafts' | 'scheduled'>('all');

  const streams: StreamItem[] = [
    {
      id: 'rtmp_1',
      title: broadcastTitle || 'Stream via RTMP (OBS, vMix, Zoom) with Flash Live',
      subtitle: 'Default RTMP',
      type: 'rtmp',
      status: 'Draft',
      channelsCount: connectedChannelsCount,
      lastEdited: 'Today, 5:01 PM'
    },
    {
      id: 'studio_1',
      title: 'Go live from your browser with Flash Live Studio',
      subtitle: 'Studio',
      type: 'studio',
      status: 'Draft',
      channelsCount: 0,
      lastEdited: 'Nov 05, 3:45 PM'
    },
    {
      id: 'webinar_1',
      title: 'Interactive Keynote & Global Media Conference',
      subtitle: 'Webinar',
      type: 'webinar',
      status: 'Scheduled',
      channelsCount: connectedChannelsCount,
      lastEdited: 'Nov 04, 11:20 AM'
    }
  ];

  const filtered = streams.filter(s => {
    if (filterTab === 'drafts') return s.status === 'Draft';
    if (filterTab === 'scheduled') return s.status === 'Scheduled';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Upgrade Promotional Banner matching Image 1 */}
      <div className="glass-card p-4 flex items-center justify-between shadow-lg border border-[var(--border)] bg-gradient-to-r from-[var(--surface-elevated)] to-[var(--surface)]">
        <div className="flex items-center space-x-2.5">
          <Sparkles className="w-5 h-5 text-[var(--accent)]" />
          <span className="text-xs font-semibold text-[var(--text)] tracking-wide">
            Get more power from Flash Live! <strong className="text-[var(--accent)]">Upgrade to Pro Studio</strong>
          </span>
        </div>
        <button className="text-xs bg-[var(--accent)] hover:opacity-90 text-white font-semibold px-4 py-1.5 rounded-xl transition-opacity shadow">
          Upgrade
        </button>
      </div>

      {/* Main Header & New Stream Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text)] tracking-tight">Active Broadcast Streams</h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Manage RTMP broadcasts, studio sessions, and scheduled live events.
          </p>
        </div>

        <button
          onClick={onOpenNewStreamModal}
          className="bg-[var(--accent)] hover:opacity-90 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all shadow-lg shadow-[var(--accent-glow)] flex items-center space-x-2 min-h-[38px] shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ New Stream</span>
        </button>
      </div>

      {/* Filter Tabs matching Image 1: All, Drafts, Scheduled */}
      <div className="flex items-center space-x-2 border-b border-[var(--border)] pb-3">
        {(['all', 'drafts', 'scheduled'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterTab(tab)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors capitalize ${
              filterTab === tab
                ? 'bg-[var(--surface-hover)] text-[var(--text)] border border-[var(--border)] shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface)]'
            }`}
          >
            {tab === 'all' ? 'All' : tab}
          </button>
        ))}
      </div>

      {/* Streams Roster Table matching Image 1 */}
      <div className="glass-panel overflow-hidden">
        <table className="w-full text-left text-xs text-[var(--text)]">
          <thead className="bg-[var(--surface-card)] text-[var(--text-muted)] uppercase font-semibold border-b border-[var(--border)]">
            <tr>
              <th className="px-5 py-3.5">
                <div className="flex items-center space-x-1.5">
                  <span>Stream title</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="px-5 py-3.5">
                <div className="flex items-center space-x-1.5">
                  <span>Status</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="px-5 py-3.5">Channels</th>
              <th className="px-5 py-3.5">
                <div className="flex items-center space-x-1.5">
                  <span>Last edited</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {filtered.map((stream) => (
              <tr
                key={stream.id}
                onClick={onOpenEncoderStudio}
                className="hover:bg-[var(--surface-hover)] cursor-pointer transition-colors group"
              >
                {/* Title & Preview Thumbnail */}
                <td className="px-5 py-4">
                  <div className="flex items-center space-x-3.5">
                    {/* Thumbnail Card with live broadcast iconography */}
                    <div className="w-20 h-12 bg-[var(--surface)] rounded-xl border border-[var(--border)] flex items-center justify-center relative overflow-hidden shrink-0 group-hover:border-[var(--accent)] transition-colors">
                      {stream.type === 'rtmp' ? (
                        <div className="flex items-center space-x-1.5 text-[var(--text-muted)]">
                          <Radio className="w-4 h-4 text-[var(--accent)]" />
                          <span className="text-[10px] font-mono font-bold">OBS</span>
                        </div>
                      ) : stream.type === 'studio' ? (
                        <div className="flex items-center space-x-1 text-[var(--text-muted)]">
                          <Video className="w-4 h-4 text-purple-400" />
                          <span className="text-[10px] font-mono font-bold">LIVE</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1 text-[var(--text-muted)]">
                          <Calendar className="w-4 h-4 text-emerald-400" />
                          <span className="text-[10px] font-mono font-bold">WEB</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="font-semibold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors flex items-center space-x-2">
                        <span>{stream.title}</span>
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-[var(--accent)]" />
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)] font-medium mt-0.5">
                        {stream.subtitle}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Status Pill */}
                <td className="px-5 py-4">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                      stream.status === 'Draft'
                        ? 'bg-[var(--surface)] text-[var(--text-muted)] border-[var(--border)]'
                        : stream.status === 'Live'
                        ? 'bg-red-500/10 text-[var(--danger)] border-red-500/30'
                        : 'bg-blue-500/10 text-[var(--accent)] border-blue-500/20'
                    }`}
                  >
                    {stream.status}
                  </span>
                </td>

                {/* Connected Channels Counter */}
                <td className="px-5 py-4 text-[var(--text)] font-mono text-xs">
                  {stream.channelsCount > 0 ? (
                    <span className="text-[var(--accent)] font-semibold">{stream.channelsCount} active</span>
                  ) : (
                    <span className="text-[var(--text-muted)]">—</span>
                  )}
                </td>

                {/* Last Edited Timestamp */}
                <td className="px-5 py-4 text-[var(--text-muted)] text-xs">
                  {stream.lastEdited}
                </td>

                {/* Action Menu */}
                <td className="px-5 py-4 text-right">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenEncoderStudio();
                    }}
                    className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)] rounded-lg transition-colors"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};


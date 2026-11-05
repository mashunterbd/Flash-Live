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
      <div className="bg-gradient-to-r from-purple-900/40 via-indigo-900/40 to-blue-900/40 border border-purple-500/30 rounded-xl p-3.5 flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-2.5">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <span className="text-xs font-semibold text-white tracking-wide">
            Get more power from Flash Live! <strong className="text-purple-300">Upgrade to Pro Studio</strong>
          </span>
        </div>
        <button className="text-xs bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-1.5 rounded-lg transition-colors shadow">
          Upgrade
        </button>
      </div>

      {/* Main Header & New Stream Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Streams</h1>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Manage RTMP broadcasts, studio sessions, and scheduled live events.
          </p>
        </div>

        <button
          onClick={onOpenNewStreamModal}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all shadow-lg shadow-blue-600/25 flex items-center space-x-2 min-h-[38px] shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ New Stream</span>
        </button>
      </div>

      {/* Filter Tabs matching Image 1: All, Drafts, Scheduled */}
      <div className="flex items-center space-x-2 border-b border-[#1E293B] pb-3">
        {(['all', 'drafts', 'scheduled'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterTab(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors capitalize ${
              filterTab === tab
                ? 'bg-[#1C2538] text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-[#131B2E]'
            }`}
          >
            {tab === 'all' ? 'All' : tab}
          </button>
        ))}
      </div>

      {/* Streams Roster Table matching Image 1 */}
      <div className="bg-[#111726] border border-[#1E293B] rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs text-slate-200">
          <thead className="bg-[#0B0F17]/80 text-[#94A3B8] uppercase font-semibold border-b border-[#1E293B]">
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
          <tbody className="divide-y divide-[#1E293B]">
            {filtered.map((stream) => (
              <tr
                key={stream.id}
                onClick={onOpenEncoderStudio}
                className="hover:bg-[#162035] cursor-pointer transition-colors group"
              >
                {/* Title & Preview Thumbnail */}
                <td className="px-5 py-4">
                  <div className="flex items-center space-x-3.5">
                    {/* Thumbnail Card with live broadcast iconography */}
                    <div className="w-20 h-12 bg-[#0B0F17] rounded-lg border border-[#1E293B] flex items-center justify-center relative overflow-hidden shrink-0 group-hover:border-blue-500/40 transition-colors">
                      {stream.type === 'rtmp' ? (
                        <div className="flex items-center space-x-1.5 text-slate-400">
                          <Radio className="w-4 h-4 text-blue-400" />
                          <span className="text-[10px] font-mono font-bold">OBS</span>
                        </div>
                      ) : stream.type === 'studio' ? (
                        <div className="flex items-center space-x-1 text-slate-400">
                          <Video className="w-4 h-4 text-purple-400" />
                          <span className="text-[10px] font-mono font-bold">LIVE</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1 text-slate-400">
                          <Calendar className="w-4 h-4 text-emerald-400" />
                          <span className="text-[10px] font-mono font-bold">WEB</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="font-semibold text-white group-hover:text-blue-400 transition-colors flex items-center space-x-2">
                        <span>{stream.title}</span>
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-blue-400" />
                      </div>
                      <div className="text-[11px] text-[#94A3B8] font-medium mt-0.5">
                        {stream.subtitle}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Status Pill */}
                <td className="px-5 py-4">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${
                      stream.status === 'Draft'
                        ? 'bg-slate-800 text-slate-300 border-slate-700'
                        : stream.status === 'Live'
                        ? 'bg-red-500/10 text-red-400 border-red-500/30'
                        : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    }`}
                  >
                    {stream.status}
                  </span>
                </td>

                {/* Connected Channels Counter */}
                <td className="px-5 py-4 text-slate-300 font-mono text-xs">
                  {stream.channelsCount > 0 ? (
                    <span className="text-blue-400 font-semibold">{stream.channelsCount} active</span>
                  ) : (
                    <span className="text-slate-500">—</span>
                  )}
                </td>

                {/* Last Edited Timestamp */}
                <td className="px-5 py-4 text-slate-400 text-xs">
                  {stream.lastEdited}
                </td>

                {/* Action Menu */}
                <td className="px-5 py-4 text-right">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenEncoderStudio();
                    }}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-[#1E293B] rounded-lg transition-colors"
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


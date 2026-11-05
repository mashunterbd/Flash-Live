import React, { useState } from 'react';
import {
  Settings,
  BarChart2,
  Copy,
  Check,
  RefreshCw,
  Plus,
  Edit2,
  Tv,
  MessageSquare,
  PlayCircle,
  X,
  Radio,
  Eye,
  EyeOff
} from 'lucide-react';
import { Channel } from './DestinationsView.js';

interface EncoderStudioViewProps {
  currentOrgId: string;
  ingestUrl: string;
  streamKey: string;
  broadcastTitle: string;
  channels: Channel[];
  selectedDestinations: string[];
  isBroadcasting: boolean;
  onToggleBroadcast: () => void;
  onToggleDestination: (channelId: string) => void;
  onToggleAllDestinations: (enableAll: boolean) => void;
  onRegenerateKey: () => Promise<void>;
  onOpenSettings: () => void;
  onOpenAddChannel: () => void;
  onOpenUpdateTitle: () => void;
}

export const EncoderStudioView: React.FC<EncoderStudioViewProps> = ({
  ingestUrl,
  streamKey,
  broadcastTitle,
  channels,
  selectedDestinations,
  isBroadcasting,
  onToggleDestination,
  onToggleAllDestinations,
  onRegenerateKey,
  onOpenSettings,
  onOpenAddChannel,
  onOpenUpdateTitle
}) => {
  const [selectedProtocol, setSelectedProtocol] = useState<'RTMP' | 'RTMPS' | 'SRT' | 'WHIP'>('RTMP');
  const [rightPanelTab, setRightPanelTab] = useState<'channels' | 'chat'>('channels');
  const [copiedField, setCopiedField] = useState<'url' | 'key' | null>(null);
  const [showKey, setShowKey] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showBackupBanner, setShowBackupBanner] = useState(true);

  const copyToClipboard = (text: string, field: 'url' | 'key') => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const allActive = channels.length > 0 && selectedDestinations.length === channels.length;

  return (
    <div className="flex flex-col space-y-4">
      {/* Top Studio Control Bar matching Image 3 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#111726] border border-[#1E293B] rounded-xl px-4 py-2.5 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-[#0B0F17] px-3 py-1.5 rounded-lg border border-[#1E293B]">
            <Radio className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-bold text-white tracking-wide truncate max-w-xs">
              {broadcastTitle}
            </span>
          </div>

          <button className="text-xs bg-purple-600 hover:bg-purple-700 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors shadow">
            Upgrade
          </button>
        </div>

        <div className="flex items-center space-x-4">
          {/* Record Switch */}
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-400">Record</span>
            <button
              onClick={() => setIsRecording(!isRecording)}
              className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                isRecording ? 'bg-red-600' : 'bg-slate-700'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  isRecording ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <button className="text-xs bg-[#1A2338] hover:bg-[#253250] text-slate-200 border border-[#2D3A54] px-3 py-1.5 rounded-lg transition-colors font-semibold">
            ✨ Get Clips
          </button>
        </div>
      </div>

      {/* Main Studio Split Layout matching Image 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Encoder Stage (Span 7 or 8) */}
        <div className="lg:col-span-8 bg-[#0D121F] border border-[#1E293B] rounded-2xl p-6 sm:p-8 flex flex-col justify-between min-h-[580px] shadow-lg relative overflow-hidden">
          {/* Top Bar of Stage */}
          <div className="flex items-center justify-between mb-8">
            <span
              className={`text-xs px-3 py-1 rounded-md font-bold font-mono tracking-wider border ${
                isBroadcasting
                  ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse'
                  : 'bg-slate-800/80 text-slate-400 border-slate-700'
              }`}
            >
              {isBroadcasting ? '● LIVE' : 'OFFLINE'}
            </span>

            <div className="flex items-center space-x-1.5 text-sm font-bold text-white tracking-tight">
              <span className="text-blue-500">Flash</span>
              <span>Live</span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 ml-0.5" />
            </div>
          </div>

          {/* Central Encoder Connect Box */}
          <div className="max-w-md w-full mx-auto space-y-6 my-auto text-center sm:text-left">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight text-center">
                Connect your encoder
              </h2>
              <p className="text-xs text-[#94A3B8] text-center mt-1">
                Copy & paste links into your streaming software.
              </p>
            </div>

            {/* Protocol Tabs matching Image 3: RTMP, RTMPS, SRT, WHIP BETA */}
            <div className="flex justify-center">
              <div className="inline-flex bg-[#070A12] p-1 rounded-xl border border-[#1E293B]">
                {(['RTMP', 'RTMPS', 'SRT', 'WHIP'] as const).map((proto) => (
                  <button
                    key={proto}
                    onClick={() => setSelectedProtocol(proto)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1 ${
                      selectedProtocol === proto
                        ? 'bg-[#1C2538] text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>{proto}</span>
                    {proto === 'WHIP' && (
                      <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1 py-0.2 rounded font-mono font-bold">
                        BETA
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* RTMP URL Field */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-semibold text-slate-300">RTMP URL</label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  readOnly
                  value={ingestUrl}
                  className="w-full bg-[#070A12] border border-[#1E293B] focus:border-blue-500 rounded-xl px-3.5 py-2.5 pr-10 text-xs text-slate-200 font-mono select-all focus:outline-none"
                />
                <button
                  onClick={() => copyToClipboard(ingestUrl, 'url')}
                  className="absolute right-2 text-slate-400 hover:text-white p-1 rounded-md transition-colors"
                  title="Copy RTMP URL"
                >
                  {copiedField === 'url' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Stream Key Field */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-semibold text-slate-300">Stream key</label>
              <div className="relative flex items-center">
                <input
                  type={showKey ? 'text' : 'password'}
                  readOnly
                  value={streamKey}
                  className="w-full bg-[#070A12] border border-[#1E293B] focus:border-blue-500 rounded-xl px-3.5 py-2.5 pr-20 text-xs text-slate-200 font-mono select-all focus:outline-none"
                />
                <div className="absolute right-2 flex items-center space-x-1">
                  <button
                    onClick={() => setShowKey(!showKey)}
                    className="text-slate-400 hover:text-white p-1"
                    title={showKey ? 'Hide key' : 'Show key'}
                  >
                    {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={onRegenerateKey}
                    className="text-slate-400 hover:text-white p-1"
                    title="Regenerate stream key"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => copyToClipboard(streamKey, 'key')}
                    className="text-slate-400 hover:text-white p-1"
                    title="Copy stream key"
                  >
                    {copiedField === 'key' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Event Backup Banner matching Image 3 */}
            {showBackupBanner && (
              <div className="p-3 bg-purple-950/20 border border-purple-500/30 rounded-xl flex items-center justify-between text-xs text-purple-200 shadow-sm">
                <span>
                  Running an important event? <strong className="text-white hover:underline cursor-pointer">Get backup stream</strong>
                </span>
                <button
                  onClick={() => setShowBackupBanner(false)}
                  className="text-purple-400 hover:text-white p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Guide Link */}
            <div className="text-center pt-2">
              <a
                href="#guide"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Instructions: In OBS/vMix, navigate to Settings > Stream. Select Custom Server. Paste RTMP URL and Stream Key, then click Start Streaming.');
                }}
                className="text-xs text-slate-400 hover:text-white inline-flex items-center space-x-1.5 transition-colors"
              >
                <PlayCircle className="w-3.5 h-3.5 text-blue-400" />
                <span>Explore how to connect OBS, Zoom, vMix</span>
              </a>
            </div>
          </div>

          {/* Bottom Bar: Settings & Analytics */}
          <div className="mt-8 pt-4 border-t border-[#1E293B] flex items-center justify-between text-xs text-slate-400">
            <button
              onClick={onOpenSettings}
              className="flex items-center space-x-1.5 hover:text-white transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>

            <button
              onClick={() => alert('Analytics: Stream health 100%, 0 dropped frames, RTMP latency 1.2s')}
              className="flex items-center space-x-1.5 hover:text-white transition-colors"
            >
              <BarChart2 className="w-4 h-4" />
              <span>Analytics</span>
            </button>
          </div>
        </div>

        {/* Right Column: Channels & Chat Sidepanel matching Image 3 (Span 4 or 5) */}
        <div className="lg:col-span-4 bg-[#0D121F] border border-[#1E293B] rounded-2xl p-5 shadow-lg space-y-5">
          {/* Top Panel Tab Switcher: Channels | Chat */}
          <div className="flex border-b border-[#1E293B]">
            <button
              onClick={() => setRightPanelTab('channels')}
              className={`flex-1 py-2.5 text-xs font-bold text-center border-b-2 transition-colors flex items-center justify-center space-x-2 ${
                rightPanelTab === 'channels'
                  ? 'border-blue-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span>Channels</span>
            </button>
            <button
              onClick={() => setRightPanelTab('chat')}
              className={`flex-1 py-2.5 text-xs font-bold text-center border-b-2 transition-colors flex items-center justify-center space-x-2 ${
                rightPanelTab === 'chat'
                  ? 'border-blue-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Chat</span>
            </button>
          </div>

          {rightPanelTab === 'channels' ? (
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">Your Channels</span>
                <button
                  onClick={onOpenAddChannel}
                  className="text-slate-400 hover:text-white flex items-center space-x-1"
                >
                  <span>Paired Channels</span>
                  <span>&gt;</span>
                </button>
              </div>

              {/* Two Action Buttons side-by-side matching Image 3 */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={onOpenAddChannel}
                  className="py-2.5 px-3 bg-[#162035] hover:bg-[#1E2D4A] border border-[#1E293B] hover:border-slate-600 rounded-xl text-xs font-semibold text-white flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Channel</span>
                </button>

                <button
                  onClick={onOpenUpdateTitle}
                  className="py-2.5 px-3 bg-[#162035] hover:bg-[#1E2D4A] border border-[#1E293B] hover:border-slate-600 rounded-xl text-xs font-semibold text-white flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Update Titles</span>
                </button>
              </div>

              {/* Toggle All Status Bar matching Image 3 */}
              <div className="flex items-center justify-between text-xs pt-1">
                <div className="text-slate-400">
                  <span className="text-white font-bold">{selectedDestinations.length}</span> of {channels.length} active{' '}
                  <button onClick={onOpenAddChannel} className="text-blue-400 hover:underline">
                    Get More
                  </button>
                </div>

                <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-medium">
                  <span>Toggle all:</span>
                  <button
                    onClick={() => onToggleAllDestinations(false)}
                    className={`hover:text-white ${!allActive ? 'text-slate-300 font-bold' : ''}`}
                  >
                    OFF
                  </button>
                  <span>|</span>
                  <button
                    onClick={() => onToggleAllDestinations(true)}
                    className={`hover:text-white ${allActive ? 'text-blue-400 font-bold' : ''}`}
                  >
                    ON
                  </button>
                </div>
              </div>

              {/* Channels List matching Image 3 */}
              <div className="space-y-3 pt-1">
                {channels.length === 0 ? (
                  <div className="p-6 bg-[#070A12] border border-[#1E293B] rounded-xl text-center space-y-2 text-xs text-slate-400">
                    <p>No channels connected yet.</p>
                    <button
                      onClick={onOpenAddChannel}
                      className="text-blue-400 hover:underline font-semibold"
                    >
                      Connect Facebook or YouTube
                    </button>
                  </div>
                ) : (
                  channels.map((ch) => {
                    const isSelected = selectedDestinations.includes(ch.id);
                    const isFb = ch.platform === 'facebook';

                    return (
                      <div
                        key={ch.id}
                        className={`p-3.5 rounded-xl border transition-all ${
                          isSelected
                            ? 'bg-[#131B2E] border-blue-500/40'
                            : 'bg-[#0B0F17]/60 border-[#1E293B]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 min-w-0">
                            {/* Circular Channel Logo with platform badge per DESIGN.md & Image 3 */}
                            <div className="relative shrink-0">
                              <img
                                src={ch.logoUrl || (isFb
                                  ? 'https://upload.wikimedia.org/wikipedia/commons/b/b9/2023_Facebook_icon.svg'
                                  : 'https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg')}
                                alt={ch.name}
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
                              <div className="text-xs font-bold text-white truncate">
                                {ch.name}
                              </div>
                              <div className="text-[11px] text-[#94A3B8] truncate">
                                {broadcastTitle}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 shrink-0 pl-2">
                            <button
                              onClick={onOpenUpdateTitle}
                              className="text-slate-400 hover:text-white p-1"
                              title="Edit stream title for this destination"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Toggle Switch */}
                            <button
                              onClick={() => onToggleDestination(ch.id)}
                              className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                                isSelected ? 'bg-blue-600' : 'bg-slate-700'
                              }`}
                            >
                              <div
                                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                                  isSelected ? 'translate-x-4' : 'translate-x-0'
                                }`}
                              />
                            </button>
                          </div>
                        </div>

                        {/* Status notification pill */}
                        <div className="mt-2.5 pt-2 border-t border-[#1E293B]/60 flex items-center justify-between text-[10px]">
                          <span className="text-emerald-400 font-medium">● Connected & Ready</span>
                          <span className="text-slate-500 font-mono">{ch.platform.toUpperCase()}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-400 space-y-3">
              <MessageSquare className="w-8 h-8 text-slate-600 mx-auto" />
              <div className="font-semibold text-white">Unified Live Chat</div>
              <p className="text-[11px] text-slate-400">
                View incoming comments from Facebook and YouTube concurrently while live broadcasting.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


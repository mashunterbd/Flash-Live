import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  RefreshCw,
  Eye,
  EyeOff,
  ChevronRight,
  Radio,
  Shield,
  Layers,
  Link as LinkIcon,
  MessageSquare,
  Scissors
} from 'lucide-react';
import { Spinner } from './Spinner.js';

interface StreamSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  ingestUrl: string;
  streamKey: string;
  onRegenerateKey: () => Promise<void>;
}

export const StreamSettingsModal: React.FC<StreamSettingsModalProps> = ({
  isOpen,
  onClose,
  ingestUrl,
  streamKey,
  onRegenerateKey
}) => {
  const [activeNav, setActiveNav] = useState<string>('stream');
  const [selectedProtocol, setSelectedProtocol] = useState<'RTMP' | 'RTMPS' | 'SRT' | 'WHIP'>('RTMP');
  const [copiedField, setCopiedField] = useState<'url' | 'key' | null>(null);
  const [showKey, setShowKey] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, field: 'url' | 'key') => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      await onRegenerateKey();
    } finally {
      setRegenerating(false);
    }
  };

  const navItems = [
    { id: 'stream', label: 'Stream', icon: Radio },
    { id: 'backup', label: 'Backup stream', icon: Layers },
    { id: 'disconnect', label: 'Disconnect protection', icon: Shield },
    { id: 'pull', label: 'Pull links', icon: LinkIcon },
    { id: 'chat', label: 'Embed chat', icon: MessageSquare },
    { id: 'clips', label: 'Clips', icon: Scissors }
  ];

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-[#111726] border border-[#1E293B] rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[460px]">
        {/* Left Subnav */}
        <div className="w-full md:w-56 bg-[#0E131F] border-b md:border-b-0 md:border-r border-[#1E293B] p-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white tracking-tight">Settings</h3>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeNav === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveNav(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'text-slate-400 hover:text-white hover:bg-[#162035]'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5" />}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="pt-4 text-[11px] text-slate-500">
            Flash Live v1.0 • Low Latency RTMP
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 p-6 space-y-6 flex flex-col justify-between bg-[#111726]">
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              {/* Protocol Pills matching Image 4 */}
              <div className="flex items-center bg-[#0B0F17] p-1 rounded-lg border border-[#1E293B]">
                {(['RTMP', 'RTMPS', 'SRT', 'WHIP'] as const).map((proto) => (
                  <button
                    key={proto}
                    onClick={() => setSelectedProtocol(proto)}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors flex items-center space-x-1 ${
                      selectedProtocol === proto
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>{proto}</span>
                    {proto === 'WHIP' && (
                      <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">
                        BETA
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Server Autodetect */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Server</label>
              <select className="w-full bg-[#0B0F17] border border-[#1E293B] rounded-lg px-3 py-2 text-xs text-white focus:outline-none cursor-pointer">
                <option>Autodetect (Global Low Latency / Frankfurt)</option>
                <option>US East (N. Virginia)</option>
                <option>US West (Oregon)</option>
                <option>Europe (London / Amsterdam)</option>
                <option>Asia Pacific (Singapore / Tokyo)</option>
              </select>
            </div>

            {/* RTMP URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">RTMP URL</label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  readOnly
                  value={ingestUrl}
                  className="w-full bg-[#0B0F17] border border-[#1E293B] rounded-lg px-3 py-2 pr-10 text-xs text-slate-200 font-mono select-all focus:outline-none"
                />
                <button
                  onClick={() => copyToClipboard(ingestUrl, 'url')}
                  className="absolute right-2 text-slate-400 hover:text-blue-400 p-1"
                  title="Copy RTMP URL"
                >
                  {copiedField === 'url' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Stream Key */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Stream key</label>
              <div className="relative flex items-center">
                <input
                  type={showKey ? 'text' : 'password'}
                  readOnly
                  value={streamKey}
                  className="w-full bg-[#0B0F17] border border-[#1E293B] rounded-lg px-3 py-2 pr-20 text-xs text-slate-200 font-mono select-all focus:outline-none"
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
                    onClick={handleRegenerate}
                    disabled={regenerating}
                    className="text-slate-400 hover:text-white p-1"
                    title="Regenerate stream key"
                  >
                    {regenerating ? <Spinner size="sm" /> : <RefreshCw className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => copyToClipboard(streamKey, 'key')}
                    className="text-slate-400 hover:text-blue-400 p-1"
                    title="Copy stream key"
                  >
                    {copiedField === 'key' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Advanced Settings Link */}
            <div>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-xs text-blue-400 hover:underline font-medium"
              >
                {showAdvanced ? 'Hide advanced settings' : 'Show advanced settings'}
              </button>

              {showAdvanced && (
                <div className="mt-3 p-3 bg-[#0B0F17] border border-[#1E293B] rounded-lg text-xs space-y-2 text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Max Video Bitrate:</span>
                    <span className="font-mono text-white">6000 Kbps</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Audio Sample Rate:</span>
                    <span className="font-mono text-white">48 kHz AAC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Keyframe Interval:</span>
                    <span className="font-mono text-white">2 seconds (GOP 60)</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-[#1E293B] flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


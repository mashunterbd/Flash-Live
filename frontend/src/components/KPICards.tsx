import React from 'react';
import { ArrowUpRight, ArrowDownRight, Tv, Activity } from 'lucide-react';

interface KPICardsProps {
  isLive: boolean;
  connectedChannelsCount: number;
  maxQuota: number;
}

export const KPICards: React.FC<KPICardsProps> = ({
  isLive,
  connectedChannelsCount,
  maxQuota
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* KPI Card 1: Live Broadcast Output matching Apex */}
      <div className="glass-panel p-5 space-y-3 relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[var(--text-muted)] tracking-wide">
            Live Streaming Status
          </span>
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-500/10 text-[var(--success)] border border-emerald-500/20">
            <ArrowUpRight className="w-3 h-3" />
            <span>+10%</span>
          </span>
        </div>

        <div className="flex items-baseline space-x-2">
          <div className="text-3xl font-extrabold text-[var(--text)] tracking-tight tabular-nums">
            {isLive ? '1 Stream' : 'Ready'}
          </div>
          <span className="text-xs text-[var(--text-muted)] font-mono">
            {isLive ? '● ON AIR' : 'RTMP IDLE'}
          </span>
        </div>

        <div className="flex items-center space-x-2 text-xs text-[var(--text-muted)] pt-1">
          <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-[var(--danger)] animate-pulse' : 'bg-emerald-400'}`} />
          <span>Ingest latency: <strong className="text-[var(--text)]">1.2s (Ultra Low)</strong></span>
        </div>
      </div>

      {/* KPI Card 2: Connected Destinations matching Apex */}
      <div className="glass-panel p-5 space-y-3 relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[var(--text-muted)] tracking-wide">
            Connected Destinations
          </span>
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-500/10 text-[var(--success)] border border-emerald-500/20">
            <ArrowUpRight className="w-3 h-3" />
            <span>+12%</span>
          </span>
        </div>

        <div className="flex items-baseline space-x-2">
          <div className="text-3xl font-extrabold text-[var(--text)] tracking-tight tabular-nums">
            {connectedChannelsCount}
          </div>
          <span className="text-xs text-[var(--text-muted)] font-mono">
            / {maxQuota} limit
          </span>
        </div>

        <div className="flex items-center space-x-2 text-xs text-[var(--text-muted)] pt-1">
          <Tv className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span>Facebook & YouTube active</span>
        </div>
      </div>

      {/* KPI Card 3: Ingest Throughput / Bitrate matching Apex */}
      <div className="glass-panel p-5 space-y-3 relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[var(--text-muted)] tracking-wide">
            Broadcast Ingest Bitrate
          </span>
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-amber-500/10 text-[var(--warning)] border border-amber-500/20">
            <ArrowDownRight className="w-3 h-3" />
            <span>-2%</span>
          </span>
        </div>

        <div className="flex items-baseline space-x-2">
          <div className="text-3xl font-extrabold text-[var(--text)] tracking-tight tabular-nums">
            5,850
          </div>
          <span className="text-xs text-[var(--text-muted)] font-mono">
            Kbps (1080p60)
          </span>
        </div>

        <div className="flex items-center space-x-2 text-xs text-[var(--text-muted)] pt-1">
          <Activity className="w-3.5 h-3.5 text-[var(--success)]" />
          <span>Zero dropped frames (100% health)</span>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Sliders, Download, TrendingUp } from 'lucide-react';

export const AnalyticsCharts: React.FC = () => {
  const [selectedSpan, setSelectedSpan] = useState<'5D' | '2W' | '1M' | '6M' | '1Y'>('1M');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Chart Card 1: Broadcast Volume & Relay Performance (Span 4) */}
      <div className="lg:col-span-4 glass-panel p-5 space-y-5 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--text-muted)]">Total Broadcast Audience</span>
            <button className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)]">
              <Sliders className="w-3.5 h-3.5" />
            </button>
          </div>

          <div>
            <div className="text-3xl font-extrabold text-[var(--text)] tracking-tight tabular-nums">
              84.2K
            </div>
            <div className="text-[11px] text-[var(--text-muted)] mt-0.5 font-medium">
              Simultaneous Reach • Cross-Platform
            </div>
          </div>

          {/* Progress Bar matching Apex reference */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--text-muted)] flex items-center space-x-1">
                <TrendingUp className="w-3 h-3 text-[var(--accent)]" />
                <span>Bandwidth Quota utilized</span>
              </span>
              <span className="text-[var(--text)] font-mono font-bold">42%</span>
            </div>
            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-[var(--border-subtle)]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[var(--accent)] to-purple-500 shadow-sm"
                style={{ width: '42%' }}
              />
            </div>
          </div>

          {/* Metric Sub-grid matching Apex reference */}
          <div className="grid grid-cols-4 gap-2 pt-2 border-t border-[var(--border)] text-center">
            <div className="bg-[var(--surface)] p-2 rounded-xl border border-[var(--border)]">
              <div className="text-[10px] text-[var(--text-muted)] truncate">Facebook</div>
              <div className="text-xs font-bold text-[var(--text)] font-mono">38K</div>
            </div>
            <div className="bg-[var(--surface)] p-2 rounded-xl border border-[var(--border)]">
              <div className="text-[10px] text-[var(--text-muted)] truncate">YouTube</div>
              <div className="text-xs font-bold text-[var(--text)] font-mono">46K</div>
            </div>
            <div className="bg-[var(--surface)] p-2 rounded-xl border border-[var(--border)]">
              <div className="text-[10px] text-[var(--text-muted)] truncate">RTMP FPS</div>
              <div className="text-xs font-bold text-[var(--text)] font-mono">60</div>
            </div>
            <div className="bg-[var(--surface)] p-2 rounded-xl border border-[var(--border)]">
              <div className="text-[10px] text-[var(--text-muted)] truncate">Uptime</div>
              <div className="text-xs font-bold text-[var(--text)] font-mono">99.9%</div>
            </div>
          </div>
        </div>

        {/* Action Buttons matching Apex reference */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <button className="py-2 px-3 rounded-xl text-xs font-semibold text-[var(--text)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] transition-colors flex items-center justify-center space-x-1.5">
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>
          <button className="py-2 px-3 rounded-xl text-xs font-semibold text-white bg-[var(--accent)] hover:opacity-90 transition-opacity flex items-center justify-center">
            <span>Track sales</span>
          </button>
        </div>
      </div>

      {/* Chart Card 2: Stream Health & Reliability Score (Span 4) */}
      <div className="lg:col-span-4 glass-panel p-5 space-y-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--text-muted)]">Encoder Reliability</span>
            <span className="text-xs text-[var(--accent)] font-semibold">Real-time</span>
          </div>

          <div className="flex items-center justify-between mt-2">
            <div>
              <div className="text-xs text-[var(--text-muted)] font-medium uppercase tracking-wide">
                Total Score
              </div>
              <div className="text-lg font-bold text-[var(--text)] flex items-center space-x-1.5 mt-0.5">
                <span className="text-amber-400">★</span>
                <span>4.9 / 5</span>
                <span className="text-xs text-[var(--text-muted)] font-normal font-mono">(99.4%)</span>
              </div>
            </div>

            {/* Glowing Waveform matching Apex reference */}
            <div className="w-28 h-12">
              <svg viewBox="0 0 120 50" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="waveGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,35 Q15,40 30,25 T60,20 T80,5 T100,30 T120,20"
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <circle cx="80" cy="5" r="3.5" fill="#FFFFFF" className="animate-ping" />
                <circle cx="80" cy="5" r="3" fill="var(--accent)" />
              </svg>
            </div>
          </div>
        </div>

        {/* User Insight Card matching Apex reference */}
        <div className="glass-card p-4 space-y-3 bg-[var(--surface)] border-[var(--border)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text)]">Stream Quality Insight</span>
            <button className="text-[11px] text-[var(--accent)] hover:underline font-medium">
              Details
            </button>
          </div>

          <div className="text-xs text-[var(--text)]">
            Your stream bitrate health is <strong>98 / 100</strong>. This configuration is considered <strong>Excellent</strong>. 😎
          </div>

          {/* Segmented Tick-bar matching Apex reference */}
          <div className="flex items-center space-x-1 pt-1">
            {Array.from({ length: 28 }).map((_, i) => (
              <div
                key={i}
                className={`h-4 flex-1 rounded-sm transition-all ${
                  i < 24
                    ? 'bg-[var(--accent)] shadow-sm shadow-[var(--accent-glow)]'
                    : 'bg-white/10'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Chart Card 3: Multi-Platform Impressions Overview (Span 4) */}
      <div className="lg:col-span-4 glass-panel p-5 space-y-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--text-muted)]">Impressions Overview</span>
            <button className="text-xs text-[var(--accent)] hover:underline font-semibold">
              See All
            </button>
          </div>

          <div className="mt-2">
            <div className="text-[11px] text-[var(--text-muted)] font-bold tracking-wider">
              FLASH LIVE NETWORK
            </div>
            <div className="text-3xl font-extrabold text-[var(--text)] tracking-tight tabular-nums mt-0.5">
              440,364
            </div>
          </div>

          {/* Time Span Filter Pills matching Apex reference: 5D, 2W, 1M, 6M, 1Y */}
          <div className="flex items-center space-x-1 pt-3">
            {(['5D', '2W', '1M', '6M', '1Y'] as const).map((span) => (
              <button
                key={span}
                onClick={() => setSelectedSpan(span)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-colors ${
                  selectedSpan === span
                    ? 'bg-[var(--accent)] text-white'
                    : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)]'
                }`}
              >
                {span}
              </button>
            ))}
          </div>
        </div>

        {/* Glowing Cylindrical Bars Chart matching Apex reference */}
        <div className="space-y-2 pt-2">
          <div className="flex items-end justify-between h-28 px-2 gap-2">
            {[
              { val: 40, label: 'Mon' },
              { val: 75, label: 'Tue' },
              { val: 55, label: 'Wed' },
              { val: 95, label: 'Thu' },
              { val: 65, label: 'Fri' },
              { val: 85, label: 'Sat' }
            ].map((col, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                <div className="w-full relative flex flex-col justify-end items-center h-full">
                  <div
                    className="w-full max-w-[28px] rounded-lg transition-all duration-300 relative overflow-hidden group-hover:scale-105"
                    style={{
                      height: `${col.val}%`,
                      background: `linear-gradient(to top, rgba(124, 140, 255, 0.25), var(--accent))`
                    }}
                  >
                    <div className="absolute top-0 inset-x-0 h-1.5 bg-white/70 rounded-t-lg" />
                  </div>
                </div>
                <span className="text-[10px] text-[var(--text-muted)] font-mono">{col.label}</span>
              </div>
            ))}
          </div>

          <div className="text-[11px] text-[var(--text-muted)] text-center pt-1">
            ● Discover the real-time engagement of your audience.
          </div>
        </div>
      </div>
    </div>
  );
};


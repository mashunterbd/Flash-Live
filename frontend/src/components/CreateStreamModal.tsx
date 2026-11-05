import React from 'react';
import {
  Video,
  Radio,
  Calendar,
  Film,
  ChevronRight,
  X
} from 'lucide-react';

interface CreateStreamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOption: (option: 'studio' | 'encoder' | 'webinar' | 'prerecorded') => void;
}

export const CreateStreamModal: React.FC<CreateStreamModalProps> = ({
  isOpen,
  onClose,
  onSelectOption
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="glass-panel max-w-lg w-full p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[var(--text)] tracking-tight">Create a new stream</h2>
          <button
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--text)] p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options List matching Image 2 */}
        <div className="space-y-3">
          {/* Option 1: Browser Studio */}
          <button
            onClick={() => {
              onSelectOption('studio');
              onClose();
            }}
            className="w-full glass-card hover:bg-[var(--surface-hover)] border border-[var(--border)] hover:border-[var(--accent)] rounded-xl p-4 flex items-center justify-between text-left transition-all group"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center ring-1 ring-[var(--accent)]/20 group-hover:scale-105 transition-transform shrink-0">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-[var(--text)]">Flash Live Studio</div>
                <div className="text-xs text-[var(--text-muted)]">
                  Go live or record — from your browser.
                </div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--text)] transition-colors" />
          </button>

          {/* Option 2: Live Webinar */}
          <button
            onClick={() => {
              onSelectOption('webinar');
              onClose();
            }}
            className="w-full glass-card hover:bg-[var(--surface-hover)] border border-[var(--border)] hover:border-[var(--accent)] rounded-xl p-4 flex items-center justify-between text-left transition-all group"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-full bg-indigo-600/10 text-indigo-400 flex items-center justify-center ring-1 ring-indigo-500/20 group-hover:scale-105 transition-transform shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-[var(--text)] flex items-center space-x-2">
                  <span>Live Webinar</span>
                  <span className="text-[10px] bg-[var(--accent)] text-white font-semibold px-2 py-0.5 rounded-full font-mono">
                    Try for free
                  </span>
                </div>
                <div className="text-xs text-[var(--text-muted)]">
                  Host a closed event on a private link or in a Slack channel.
                </div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--text)] transition-colors" />
          </button>

          {/* Option 3: Encoder | RTMP (Primary) */}
          <button
            onClick={() => {
              onSelectOption('encoder');
              onClose();
            }}
            className="w-full glass-card hover:bg-[var(--surface-hover)] border border-[var(--border)] hover:border-[var(--accent)] rounded-xl p-4 flex items-center justify-between text-left transition-all group ring-1 ring-[var(--accent)]/30"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-full bg-[var(--accent)] text-white flex items-center justify-center shadow-lg shadow-[var(--accent-glow)] group-hover:scale-105 transition-transform shrink-0">
                <Radio className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-[var(--text)] flex items-center space-x-2">
                  <span>Encoder | RTMP</span>
                  <span className="text-[10px] bg-[var(--accent)]/20 text-[var(--accent)] font-semibold px-2 py-0.5 rounded-full font-mono">
                    Popular
                  </span>
                </div>
                <div className="text-xs text-[var(--text-muted)]">
                  Stream from OBS, Zoom, vMix, Wirecast, etc.
                </div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--text)] transition-colors" />
          </button>

          {/* Option 4: Pre-recorded livestream */}
          <button
            onClick={() => {
              onSelectOption('prerecorded');
              onClose();
            }}
            className="w-full glass-card hover:bg-[var(--surface-hover)] border border-[var(--border)] hover:border-[var(--accent)] rounded-xl p-4 flex items-center justify-between text-left transition-all group"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-full bg-purple-600/10 text-purple-400 flex items-center justify-center ring-1 ring-purple-500/20 group-hover:scale-105 transition-transform shrink-0">
                <Film className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-[var(--text)]">Pre-recorded livestream</div>
                <div className="text-xs text-[var(--text-muted)]">
                  Turn videos or stream recordings into live broadcasts.
                </div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--text)] transition-colors" />
          </button>
        </div>
      </div>
    </div>
  );
};


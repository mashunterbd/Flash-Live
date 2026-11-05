import React, { useState } from 'react';
import { X, Sparkles, Check, AlertCircle } from 'lucide-react';
import { Spinner } from './Spinner.js';

interface UpdateTitlesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentOrgId: string;
  initialTitle: string;
  onTitleUpdated: (newTitle: string) => void;
}

export const UpdateTitlesModal: React.FC<UpdateTitlesModalProps> = ({
  isOpen,
  onClose,
  currentOrgId,
  initialTitle,
  onTitleUpdated
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/streams/title', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgId: currentOrgId, title: title.trim() })
      });

      const data = await res.json();
      if (res.ok) {
        setFeedback({
          type: 'success',
          message: data.message || 'Title synchronized to all active destinations!'
        });
        onTitleUpdated(title.trim());
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setFeedback({
          type: 'error',
          message: data.error || 'Failed to update title'
        });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Network error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="glass-panel max-w-md w-full p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-[var(--accent)]" />
            <h3 className="text-base font-bold text-[var(--text)]">Update Stream Titles</h3>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--text)] p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-[var(--text-muted)]">
          Editing the unified title propagates immediately to all selected Facebook Pages and YouTube Channels.
        </p>

        {feedback && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-center space-x-2 ${
              feedback.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-[var(--success)]'
                : 'bg-red-500/10 border-red-500/30 text-[var(--danger)]'
            }`}
          >
            {feedback.type === 'success' ? (
              <Check className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1.5">
              Broadcast Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Breaking News & Global Insights Live"
              className="w-full glass-input rounded-xl px-3.5 py-2.5 text-sm text-[var(--text)] placeholder-[var(--text-muted)] bg-[var(--surface-card)] border-[var(--border)] focus:outline-none"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl text-xs text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="px-4 py-2 bg-[var(--accent)] hover:opacity-90 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 min-h-[36px] transition-opacity"
            >
              {loading ? <Spinner size="sm" /> : <span>Update Across All</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


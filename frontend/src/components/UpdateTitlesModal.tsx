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
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-[#111726] border border-[#1E293B] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-bold text-white">Update Stream Titles</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-[#94A3B8]">
          Editing the unified title propagates immediately to all selected Facebook Pages and YouTube Channels.
        </p>

        {feedback && (
          <div
            className={`p-3 rounded-lg border text-xs flex items-center space-x-2 ${
              feedback.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-red-500/10 border-red-500/30 text-red-400'
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
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Broadcast Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Breaking News & Global Insights Live"
              className="w-full bg-[#0B0F17] border border-[#1E293B] focus:border-blue-500 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-[#1E293B]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 min-h-[36px]"
            >
              {loading ? <Spinner size="sm" /> : <span>Update Across All</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


import React, { useState, useEffect } from 'react';
import { Laptop, Globe, ShieldAlert, Trash2, RefreshCw } from 'lucide-react';
import { Spinner } from './Spinner.js';

interface SessionItem {
  id: string;
  ip: string;
  deviceModel: string;
  clientName: string;
  osName: string;
  countryName: string;
  expire: string;
  current: boolean;
}

interface SessionsViewProps {
  userId: string;
}

export const SessionsView: React.FC<SessionsViewProps> = ({ userId }) => {
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/sessions', {
        headers: { 'x-user-id': userId }
      });
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions || []);
      }
    } catch {
      // Handled silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [userId]);

  const revokeSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to revoke this session? The device will be logged out.')) return;
    setRevokingId(sessionId);
    try {
      const res = await fetch(`/api/auth/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: { 'x-user-id': userId }
      });
      if (res.ok) {
        setSessions(prev => prev.filter(s => s.id !== sessionId));
      } else {
        alert('Failed to revoke session');
      }
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    } finally {
      setRevokingId(null);
    }
  };

  return (
    <div className="glass-panel p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-[var(--text)] flex items-center space-x-2">
            <Laptop className="w-4 h-4 text-[var(--accent)]" />
            <span>Active Login Sessions</span>
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Track connected devices, active IP addresses, and revoke any unrecognized sessions.
          </p>
        </div>
        <button
          onClick={fetchSessions}
          disabled={loading}
          className="text-xs glass-button px-3 py-1.5 flex items-center space-x-1.5 min-h-[32px] text-[var(--text)]"
          title="Refresh session list"
        >
          {loading ? <Spinner size="sm" /> : <RefreshCw className="w-3.5 h-3.5" />}
          <span>Refresh</span>
        </button>
      </div>

      {loading && sessions.length === 0 ? (
        <div className="py-12 flex justify-center items-center">
          <Spinner size="lg" />
        </div>
      ) : sessions.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-[var(--border)] rounded-2xl bg-[var(--surface)]">
          <ShieldAlert className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2" />
          <p className="text-sm font-medium text-[var(--text)]">No active external sessions found</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">Your account has only the primary active browser session.</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-[var(--border)] rounded-2xl bg-[var(--surface)]">
          <table className="w-full text-left text-xs text-[var(--text)]">
            <thead className="bg-[var(--surface-card)] text-[var(--text-muted)] uppercase font-semibold border-b border-[var(--border)]">
              <tr>
                <th className="px-4 py-3">Device & Browser</th>
                <th className="px-4 py-3">IP Address</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Expires</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {sessions.map((s) => (
                <tr key={s.id} className="hover:bg-[var(--surface-hover)] transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="font-medium text-[var(--text)] flex items-center space-x-2">
                      <span>{s.clientName} on {s.osName || s.deviceModel}</span>
                      {s.current && (
                        <span className="text-[10px] bg-emerald-500/10 text-[var(--success)] border border-emerald-500/20 px-1.5 py-0.5 rounded font-mono font-bold">
                          THIS DEVICE
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)] font-mono mt-0.5">ID: {s.id}</div>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-[var(--text)]">
                    {s.ip}
                  </td>
                  <td className="px-4 py-3.5 text-[var(--text)] flex items-center space-x-1.5">
                    <Globe className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                    <span>{s.countryName}</span>
                  </td>
                  <td className="px-4 py-3.5 text-[var(--text-muted)]">
                    {new Date(s.expire).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <button
                      onClick={() => revokeSession(s.id)}
                      disabled={revokingId === s.id}
                      className="text-xs bg-red-600/10 hover:bg-red-600/20 text-[var(--danger)] border border-red-500/20 px-2.5 py-1.5 rounded-lg transition-colors inline-flex items-center space-x-1 min-h-[28px]"
                      title="Revoke session"
                    >
                      {revokingId === s.id ? <Spinner size="sm" /> : <Trash2 className="w-3 h-3" />}
                      <span>Revoke</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};


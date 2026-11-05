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
    <div className="bg-[#131B2E] border border-[#1E293B] rounded-xl p-6 shadow-sm space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center space-x-2">
            <Laptop className="w-4 h-4 text-blue-400" />
            <span>Active Login Sessions</span>
          </h2>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Track connected devices, active IP addresses, and revoke any unrecognized sessions.
          </p>
        </div>
        <button
          onClick={fetchSessions}
          disabled={loading}
          className="text-xs bg-[#1E293B] hover:bg-[#2A3854] text-slate-200 border border-[#2D3A54] px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1.5 min-h-[32px]"
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
        <div className="p-8 text-center border border-dashed border-[#1E293B] rounded-lg">
          <ShieldAlert className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-300">No active external sessions found</p>
          <p className="text-xs text-[#94A3B8] mt-1">Your account has only the primary active browser session.</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-[#1E293B] rounded-lg">
          <table className="w-full text-left text-xs text-slate-200">
            <thead className="bg-[#0B0F17]/70 text-[#94A3B8] uppercase font-semibold border-b border-[#1E293B]">
              <tr>
                <th className="px-4 py-3">Device & Browser</th>
                <th className="px-4 py-3">IP Address</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Expires</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]">
              {sessions.map((s) => (
                <tr key={s.id} className="hover:bg-[#1E293B]/40 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="font-medium text-white flex items-center space-x-2">
                      <span>{s.clientName} on {s.osName || s.deviceModel}</span>
                      {s.current && (
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.2 rounded font-mono">
                          THIS DEVICE
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-[#94A3B8] font-mono mt-0.5">ID: {s.id}</div>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-slate-300">
                    {s.ip}
                  </td>
                  <td className="px-4 py-3.5 text-slate-300 flex items-center space-x-1.5">
                    <Globe className="w-3.5 h-3.5 text-slate-500" />
                    <span>{s.countryName}</span>
                  </td>
                  <td className="px-4 py-3.5 text-[#94A3B8]">
                    {new Date(s.expire).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <button
                      onClick={() => revokeSession(s.id)}
                      disabled={revokingId === s.id}
                      className="text-xs bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/20 px-2.5 py-1.5 rounded-lg transition-colors inline-flex items-center space-x-1 min-h-[28px]"
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


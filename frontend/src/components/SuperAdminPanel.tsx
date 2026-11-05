import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle, RefreshCw, Key } from 'lucide-react';
import { Spinner } from './Spinner.js';

interface UserRecord {
  id: string;
  email: string;
  name: string;
  labels: string[];
  status: boolean;
  emailVerification: boolean;
}

interface SuperAdminPanelProps {
  currentUserId: string;
}

export const SuperAdminPanel: React.FC<SuperAdminPanelProps> = ({ currentUserId }) => {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingUserId, setTogglingUserId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/users', {
        headers: { 'x-user-id': currentUserId }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch {
      // Handled silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentUserId]);

  const toggleAdminRole = async (targetUser: UserRecord) => {
    const isCurrentlyAdmin = targetUser.labels?.includes('admin');
    const confirmMsg = isCurrentlyAdmin
      ? `Revoke Super Admin privileges from ${targetUser.email}? User will become Normal User immediately.`
      : `Promote ${targetUser.email} to Super Admin? User will get full platform control immediately.`;

    if (!confirm(confirmMsg)) return;

    setTogglingUserId(targetUser.id);
    try {
      const res = await fetch('/api/auth/role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUserId
        },
        body: JSON.stringify({
          targetUserId: targetUser.id,
          grantSuperAdmin: !isCurrentlyAdmin
        })
      });

      if (res.ok) {
        const updated = await res.json();
        setUsers(prev => prev.map(u => u.id === targetUser.id ? { ...u, labels: updated.labels } : u));
      } else {
        const err = await res.json();
        alert(`Failed: ${err.error || 'Operation failed'}`);
      }
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    } finally {
      setTogglingUserId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#131B2E] border border-red-500/20 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center space-x-2">
              <Shield className="w-4 h-4 text-red-400" />
              <span>Super Admin Authority & Role Governance</span>
            </h2>
            <p className="text-xs text-[#94A3B8] mt-1">
              Automatic label-driven access control. Adding the <code className="text-red-300 bg-red-950/40 px-1 py-0.5 rounded font-mono">admin</code> label immediately grants Super Admin privileges. Removing it downgrades the user.
            </p>
          </div>
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="text-xs bg-[#1E293B] hover:bg-[#2A3854] text-slate-200 border border-[#2D3A54] px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1.5 min-h-[34px] shrink-0"
          >
            {loading ? <Spinner size="sm" /> : <RefreshCw className="w-3.5 h-3.5" />}
            <span>Refresh Users</span>
          </button>
        </div>
      </div>

      {/* Users Authority Table */}
      <div className="bg-[#131B2E] border border-[#1E293B] rounded-xl p-6 shadow-sm space-y-4">
        <h3 className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
          Platform User Accounts & Labels
        </h3>

        {loading ? (
          <div className="py-12 flex justify-center"><Spinner size="lg" /></div>
        ) : (
          <div className="border border-[#1E293B] rounded-lg overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-200">
              <thead className="bg-[#0B0F17]/70 text-[#94A3B8] uppercase font-semibold border-b border-[#1E293B]">
                <tr>
                  <th className="px-4 py-3">User & Email</th>
                  <th className="px-4 py-3">Account ID</th>
                  <th className="px-4 py-3">Current Role</th>
                  <th className="px-4 py-3">Auth Labels</th>
                  <th className="px-4 py-3 text-right">Role Governance Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B]">
                {users.map((u) => {
                  const isSuper = u.labels?.includes('admin');
                  const isCurrent = u.id === currentUserId;

                  return (
                    <tr key={u.id} className="hover:bg-[#1E293B]/40 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-white flex items-center space-x-2">
                          <span>{u.name || 'Unnamed Account'}</span>
                          {isCurrent && (
                            <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.2 rounded font-mono">
                              YOU
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#94A3B8]">{u.email}</div>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-slate-400">
                        {u.id}
                      </td>
                      <td className="px-4 py-3.5">
                        {isSuper ? (
                          <span className="inline-flex items-center text-[10px] bg-red-500/10 text-red-400 border border-red-500/30 px-2 py-0.5 rounded font-mono font-semibold">
                            <Shield className="w-3 h-3 mr-1" /> SUPER ADMIN
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-[10px] bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded font-mono">
                            <CheckCircle className="w-3 h-3 mr-1 text-slate-500" /> NORMAL USER
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-[11px]">
                        {u.labels && u.labels.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {u.labels.map(l => (
                              <span key={l} className="bg-slate-800 text-slate-300 border border-slate-700 px-1.5 py-0.5 rounded">
                                {l}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-500">[no labels]</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => toggleAdminRole(u)}
                          disabled={togglingUserId === u.id || (isCurrent && isSuper)}
                          className={`text-xs px-3 py-1.5 rounded-lg border transition-colors inline-flex items-center space-x-1.5 min-h-[32px] ${
                            isSuper
                              ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/20'
                              : 'bg-red-600/10 hover:bg-red-600/20 text-red-400 border-red-500/30'
                          } disabled:opacity-40 disabled:cursor-not-allowed`}
                          title={isCurrent && isSuper ? 'Cannot demote own active session' : 'Toggle role'}
                        >
                          {togglingUserId === u.id ? (
                            <Spinner size="sm" />
                          ) : (
                            <>
                              <Key className="w-3 h-3" />
                              <span>{isSuper ? 'Demote to Normal' : 'Grant Super Admin'}</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

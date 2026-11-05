import React, { useState, useEffect } from 'react';
import {
  Shield,
  CheckCircle,
  RefreshCw,
  Key,
  Building,
  Mail,
  Sliders,
  AlertTriangle,
  Send
} from 'lucide-react';
import { Spinner } from './Spinner.js';

interface UserRecord {
  id: string;
  email: string;
  name: string;
  labels: string[];
  status: boolean;
  emailVerification: boolean;
}

interface ConnectedChannelInfo {
  id: string;
  externalId: string;
  platform: 'facebook' | 'youtube';
  name: string;
  logoUrl?: string;
  connectedAt: string;
  status: string;
}

interface OrganizationRecord {
  id: string;
  name: string;
  totalMembers: number;
  connectionLimit: number;
  status: 'active' | 'suspended';
  suspendedAt: string | null;
  connectedCount: number;
  facebookCount: number;
  youtubeCount: number;
  channels: ConnectedChannelInfo[];
}

interface EmailConfigs {
  verification: string;
  recovery: string;
  welcome: string;
}

interface SuperAdminPanelProps {
  currentUserId: string;
}

export const SuperAdminPanel: React.FC<SuperAdminPanelProps> = ({ currentUserId }) => {
  const [activeSubTab, setActiveSubTab] = useState<'users' | 'organizations' | 'emails'>('users');

  // Users state
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [togglingUserId, setTogglingUserId] = useState<string | null>(null);

  // Organizations state
  const [organizations, setOrganizations] = useState<OrganizationRecord[]>([]);
  const [loadingOrgs, setLoadingOrgs] = useState(false);
  const [actionLoadingOrg, setActionLoadingOrg] = useState<string | null>(null);
  const [editingLimitOrgId, setEditingLimitOrgId] = useState<string | null>(null);
  const [newLimitValue, setNewLimitValue] = useState<number>(5);

  // Email Providers state
  const [emailConfigs, setEmailConfigs] = useState<EmailConfigs>({
    verification: '',
    recovery: '',
    welcome: ''
  });
  const [loadingEmails, setLoadingEmails] = useState(false);
  const [savingEmails, setSavingEmails] = useState(false);
  const [emailTestLoading, setEmailTestLoading] = useState(false);
  const [testEmailRecipient, setTestEmailRecipient] = useState('');
  const [testEmailType, setTestEmailType] = useState<'verification' | 'recovery' | 'welcome'>('verification');

  // Notifications
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [currentUserId]);

  useEffect(() => {
    if (activeSubTab === 'organizations') {
      fetchOrganizations();
    } else if (activeSubTab === 'emails') {
      fetchEmailConfigs();
    }
  }, [activeSubTab]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
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
      setLoadingUsers(false);
    }
  };

  const fetchOrganizations = async () => {
    setLoadingOrgs(true);
    try {
      const res = await fetch('/api/admin/organizations', {
        headers: { 'x-user-id': currentUserId }
      });
      if (res.ok) {
        const data = await res.json();
        setOrganizations(data.organizations || []);
      }
    } catch {
      // Handled silently
    } finally {
      setLoadingOrgs(false);
    }
  };

  const fetchEmailConfigs = async () => {
    setLoadingEmails(true);
    try {
      const res = await fetch('/api/admin/email-providers', {
        headers: { 'x-user-id': currentUserId }
      });
      if (res.ok) {
        const data = await res.json();
        setEmailConfigs(data.configs || { verification: '', recovery: '', welcome: '' });
      }
    } catch {
      // Handled silently
    } finally {
      setLoadingEmails(false);
    }
  };

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
        setStatusMessage({ type: 'success', text: `Role updated for ${targetUser.email}` });
      } else {
        const err = await res.json();
        setStatusMessage({ type: 'error', text: err.error || 'Operation failed' });
      }
    } catch (e: any) {
      setStatusMessage({ type: 'error', text: e.message });
    } finally {
      setTogglingUserId(null);
    }
  };

  const handleUpdateLimit = async (orgId: string) => {
    setActionLoadingOrg(`limit_${orgId}`);
    try {
      const res = await fetch(`/api/admin/organizations/${orgId}/limit`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUserId
        },
        body: JSON.stringify({ limit: newLimitValue })
      });

      if (res.ok) {
        const data = await res.json();
        setOrganizations(prev => prev.map(o => o.id === orgId ? { ...o, connectionLimit: data.connectionLimit } : o));
        setEditingLimitOrgId(null);
        setStatusMessage({ type: 'success', text: `Connection limit updated to ${data.connectionLimit}` });
      } else {
        const err = await res.json();
        setStatusMessage({ type: 'error', text: err.error || 'Failed to update limit' });
      }
    } catch (e: any) {
      setStatusMessage({ type: 'error', text: e.message });
    } finally {
      setActionLoadingOrg(null);
    }
  };

  const handleToggleOrgStatus = async (org: OrganizationRecord) => {
    const newStatus = org.status === 'active' ? 'suspended' : 'active';
    const actionWord = newStatus === 'suspended' ? 'suspend' : 'reactivate';

    if (!confirm(`Are you sure you want to ${actionWord} the organization "${org.name}"?`)) {
      return;
    }

    setActionLoadingOrg(`status_${org.id}`);
    try {
      const res = await fetch(`/api/admin/organizations/${org.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUserId
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        const data = await res.json();
        setOrganizations(prev => prev.map(o => o.id === org.id ? { ...o, status: data.status, suspendedAt: data.suspendedAt } : o));
        setStatusMessage({ type: 'success', text: `Organization ${org.name} is now ${data.status}` });
      } else {
        const err = await res.json();
        setStatusMessage({ type: 'error', text: err.error || 'Failed to change organization status' });
      }
    } catch (e: any) {
      setStatusMessage({ type: 'error', text: e.message });
    } finally {
      setActionLoadingOrg(null);
    }
  };

  const handleSaveEmailConfigs = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingEmails(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/admin/email-providers', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUserId
        },
        body: JSON.stringify({ configs: emailConfigs })
      });

      if (res.ok) {
        setStatusMessage({ type: 'success', text: 'Email provider configurations saved successfully' });
      } else {
        const err = await res.json();
        setStatusMessage({ type: 'error', text: err.error || 'Failed to save configurations' });
      }
    } catch (e: any) {
      setStatusMessage({ type: 'error', text: e.message });
    } finally {
      setSavingEmails(false);
    }
  };

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmailRecipient.trim()) {
      setStatusMessage({ type: 'error', text: 'Recipient email is required' });
      return;
    }

    setEmailTestLoading(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/admin/email-providers/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUserId
        },
        body: JSON.stringify({
          type: testEmailType,
          recipientEmail: testEmailRecipient.trim()
        })
      });

      const data = await res.json();
      if (res.ok) {
        setStatusMessage({ type: 'success', text: data.message });
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'Failed to send test email' });
      }
    } catch (e: any) {
      setStatusMessage({ type: 'error', text: e.message });
    } finally {
      setEmailTestLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner in Glass Style */}
      <div className="glass-panel p-6 border-red-500/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-[var(--text)] flex items-center space-x-2">
              <Shield className="w-5 h-5 text-[var(--danger)]" />
              <span>Super Admin Management Control</span>
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Global platform oversight: Users, Organizations, Channel quotas, Suspensions, and Transactional Email Providers.
            </p>
          </div>

          <div className="glass-pill p-1 flex items-center space-x-1 bg-[var(--surface)] border border-[var(--border)]">
            <button
              onClick={() => setActiveSubTab('users')}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors flex items-center space-x-1.5 ${
                activeSubTab === 'users' ? 'bg-[var(--danger)] text-white' : 'text-[var(--text-muted)] hover:text-[var(--text)]'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>Users & Roles</span>
            </button>
            <button
              onClick={() => setActiveSubTab('organizations')}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors flex items-center space-x-1.5 ${
                activeSubTab === 'organizations' ? 'bg-[var(--danger)] text-white' : 'text-[var(--text-muted)] hover:text-[var(--text)]'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>Organizations & Channels</span>
            </button>
            <button
              onClick={() => setActiveSubTab('emails')}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors flex items-center space-x-1.5 ${
                activeSubTab === 'emails' ? 'bg-[var(--danger)] text-white' : 'text-[var(--text-muted)] hover:text-[var(--text)]'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email Providers</span>
            </button>
          </div>
        </div>
      </div>

      {/* Status Notifications */}
      {statusMessage && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-[var(--success)]'
              : 'bg-red-500/10 border-red-500/30 text-[var(--danger)]'
          }`}
        >
          <span>{statusMessage.text}</span>
          <button onClick={() => setStatusMessage(null)} className="text-[var(--text-muted)] hover:text-[var(--text)]">✕</button>
        </div>
      )}

      {/* SubTab 1: Users & Roles */}
      {activeSubTab === 'users' && (
        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
              Platform User Accounts & Labels
            </h3>
            <button
              onClick={fetchUsers}
              disabled={loadingUsers}
              className="text-xs glass-card px-3 py-1.5 rounded-xl font-medium text-[var(--text)] flex items-center space-x-1.5 min-h-[34px] hover:bg-[var(--surface-hover)] transition-colors"
            >
              {loadingUsers ? <Spinner size="sm" /> : <RefreshCw className="w-3.5 h-3.5" />}
              <span>Refresh Users</span>
            </button>
          </div>

          {loadingUsers ? (
            <div className="py-12 flex justify-center"><Spinner size="lg" /></div>
          ) : (
            <div className="border border-[var(--border)] rounded-xl overflow-x-auto">
              <table className="w-full text-left text-xs text-[var(--text)]">
                <thead className="bg-[var(--surface)] text-[var(--text-muted)] uppercase font-semibold border-b border-[var(--border)]">
                  <tr>
                    <th className="px-4 py-3">User & Email</th>
                    <th className="px-4 py-3">Account ID</th>
                    <th className="px-4 py-3">Current Role</th>
                    <th className="px-4 py-3">Auth Labels</th>
                    <th className="px-4 py-3 text-right">Role Governance Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {users.map((u) => {
                    const isSuper = u.labels?.includes('admin');
                    const isCurrent = u.id === currentUserId;

                    return (
                      <tr key={u.id} className="hover:bg-[var(--surface-hover)] transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="font-semibold text-[var(--text)] flex items-center space-x-2">
                            <span>{u.name || 'Unnamed Account'}</span>
                            {isCurrent && (
                              <span className="text-[10px] bg-[var(--accent)]/20 text-[var(--accent)] border border-[var(--accent)]/30 px-1.5 py-0.2 rounded-full font-mono">
                                YOU
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[var(--text-muted)]">{u.email}</div>
                        </td>
                        <td className="px-4 py-3.5 font-mono text-[var(--text-muted)]">
                          {u.id}
                        </td>
                        <td className="px-4 py-3.5">
                          {isSuper ? (
                            <span className="inline-flex items-center text-[10px] bg-red-500/10 text-[var(--danger)] border border-red-500/30 px-2 py-0.5 rounded-full font-mono font-semibold">
                              <Shield className="w-3 h-3 mr-1" /> SUPER ADMIN
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-[10px] bg-[var(--surface)] text-[var(--text-muted)] border border-[var(--border)] px-2 py-0.5 rounded-full font-mono">
                              <CheckCircle className="w-3 h-3 mr-1 text-[var(--text-muted)]" /> NORMAL USER
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 font-mono text-[11px]">
                          {u.labels && u.labels.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {u.labels.map(l => (
                                <span key={l} className="bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] px-1.5 py-0.5 rounded">
                                  {l}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[var(--text-muted)]">[no labels]</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <button
                            onClick={() => toggleAdminRole(u)}
                            disabled={togglingUserId === u.id || (isCurrent && isSuper)}
                            className={`text-xs px-3 py-1.5 rounded-xl border transition-colors inline-flex items-center space-x-1.5 min-h-[32px] ${
                              isSuper
                                ? 'bg-amber-500/10 hover:bg-amber-500/20 text-[var(--warning)] border-amber-500/20'
                                : 'bg-red-600/10 hover:bg-red-600/20 text-[var(--danger)] border-red-500/30'
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
      )}

      {/* SubTab 2: Organizations & Quota Controls (PRD 4.5) */}
      {activeSubTab === 'organizations' && (
        <div className="glass-panel p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[var(--text)] flex items-center space-x-2">
                <Building className="w-4 h-4 text-[var(--accent)]" />
                <span>Organizations, Channels & Quota Management</span>
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Inspect connected Facebook Pages and YouTube Channels, adjust limits, and suspend/reactivate accounts.
              </p>
            </div>
            <button
              onClick={fetchOrganizations}
              disabled={loadingOrgs}
              className="text-xs glass-card px-3 py-1.5 rounded-xl font-medium text-[var(--text)] flex items-center space-x-1.5 min-h-[34px] hover:bg-[var(--surface-hover)] transition-colors"
            >
              {loadingOrgs ? <Spinner size="sm" /> : <RefreshCw className="w-3.5 h-3.5" />}
              <span>Refresh Organizations</span>
            </button>
          </div>

          {loadingOrgs ? (
            <div className="py-12 flex justify-center"><Spinner size="lg" /></div>
          ) : organizations.length === 0 ? (
            <div className="p-8 text-center text-xs text-[var(--text-muted)]">No organizations found.</div>
          ) : (
            <div className="space-y-6">
              {organizations.map((org) => {
                const isSuspended = org.status === 'suspended';
                const isEditingLimit = editingLimitOrgId === org.id;

                return (
                  <div
                    key={org.id}
                    className={`border rounded-xl p-5 space-y-4 transition-colors ${
                      isSuspended
                        ? 'bg-amber-950/10 border-amber-500/30'
                        : 'glass-card bg-[var(--surface)] border-[var(--border)]'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
                      <div>
                        <div className="flex items-center space-x-2.5">
                          <h4 className="text-base font-bold text-[var(--text)]">{org.name}</h4>
                          <span className="text-xs font-mono text-[var(--text-muted)]">ID: {org.id}</span>
                          {isSuspended ? (
                            <span className="text-[10px] bg-amber-500/10 text-[var(--warning)] border border-amber-500/30 px-2 py-0.5 rounded-full font-mono font-bold flex items-center space-x-1">
                              <AlertTriangle className="w-3 h-3" />
                              <span>SUSPENDED</span>
                            </span>
                          ) : (
                            <span className="text-[10px] bg-emerald-500/10 text-[var(--success)] border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono font-medium">
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-[var(--text-muted)] mt-1 flex items-center space-x-4">
                          <span>Team Members: <strong className="text-[var(--text)]">{org.totalMembers}</strong></span>
                          <span>Connected Channels: <strong className="text-[var(--text)]">{org.connectedCount}</strong> ({org.facebookCount} Facebook, {org.youtubeCount} YouTube)</span>
                        </div>
                      </div>

                      {/* Quota & Status Actions */}
                      <div className="flex items-center space-x-3">
                        {/* Quota limit control */}
                        {isEditingLimit ? (
                          <div className="flex items-center space-x-1.5 glass-card p-1 rounded-xl border border-[var(--accent)]">
                            <input
                              type="number"
                              min="1"
                              max="100"
                              value={newLimitValue}
                              onChange={(e) => setNewLimitValue(parseInt(e.target.value, 10) || 1)}
                              className="w-14 glass-input px-2 py-1 text-xs text-[var(--text)] font-mono focus:outline-none"
                            />
                            <button
                              onClick={() => handleUpdateLimit(org.id)}
                              disabled={actionLoadingOrg === `limit_${org.id}`}
                              className="px-2.5 py-1 bg-[var(--accent)] hover:opacity-90 text-white rounded-lg text-xs font-medium"
                            >
                              {actionLoadingOrg === `limit_${org.id}` ? <Spinner size="sm" /> : 'Save'}
                            </button>
                            <button
                              onClick={() => setEditingLimitOrgId(null)}
                              className="px-2 py-1 text-[var(--text-muted)] hover:text-[var(--text)] text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2 glass-card px-3 py-1.5 rounded-xl border border-[var(--border)]">
                            <span className="text-xs text-[var(--text-muted)]">Quota Limit:</span>
                            <span className="text-xs font-bold text-[var(--text)] font-mono">{org.connectionLimit} channels</span>
                            <button
                              onClick={() => {
                                setEditingLimitOrgId(org.id);
                                setNewLimitValue(org.connectionLimit);
                              }}
                              className="p-1 text-[var(--text-muted)] hover:text-[var(--accent)]"
                              title="Edit Quota Limit"
                            >
                              <Sliders className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                        {/* Suspend / Restore Action */}
                        <button
                          onClick={() => handleToggleOrgStatus(org)}
                          disabled={actionLoadingOrg === `status_${org.id}`}
                          className={`text-xs px-3.5 py-1.5 rounded-xl font-medium border transition-colors min-h-[34px] flex items-center space-x-1.5 ${
                            isSuspended
                              ? 'bg-emerald-600/10 hover:bg-emerald-600/20 text-[var(--success)] border-emerald-500/30'
                              : 'bg-amber-600/10 hover:bg-amber-600/20 text-[var(--warning)] border-amber-500/30'
                          }`}
                        >
                          {actionLoadingOrg === `status_${org.id}` ? (
                            <Spinner size="sm" />
                          ) : (
                            <span>{isSuspended ? 'Reactivate Account' : 'Suspend Account'}</span>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Connected Channels Sub-Table */}
                    <div>
                      <div className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">
                        Connected Pages & Channels ({org.channels.length})
                      </div>
                      {org.channels.length === 0 ? (
                        <div className="text-xs text-[var(--text-muted)] italic glass-card p-3 rounded-xl border border-[var(--border)]">
                          No Facebook Pages or YouTube Channels connected yet.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {org.channels.map((ch) => {
                            const isFb = ch.platform === 'facebook';
                            return (
                              <div
                                key={ch.id}
                                className="glass-card p-3 flex items-center space-x-3 rounded-xl"
                              >
                                <img
                                  src={ch.logoUrl || (isFb
                                    ? 'https://upload.wikimedia.org/wikipedia/commons/b/b9/2023_Facebook_icon.svg'
                                    : 'https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg')}
                                  alt={ch.name}
                                  className="w-10 h-10 rounded-full object-cover ring-2 ring-[var(--border)] bg-[var(--surface)] shrink-0"
                                />
                                <div className="min-w-0 flex-1">
                                  <div className="text-xs font-semibold text-[var(--text)] truncate flex items-center space-x-1.5">
                                    <span>{ch.name}</span>
                                    <span
                                      className={`text-[9px] px-1 py-0.2 rounded font-mono font-bold text-white ${
                                        isFb ? 'bg-blue-600' : 'bg-red-600'
                                      }`}
                                    >
                                      {isFb ? 'FB' : 'YT'}
                                    </span>
                                  </div>
                                  <div className="text-[10px] text-[var(--text-muted)] font-mono truncate">
                                    ID: {ch.externalId}
                                  </div>
                                  <div className="text-[10px] text-[var(--text-muted)] mt-0.5">
                                    Connected: {new Date(ch.connectedAt).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SubTab 3: Email Providers Configuration (PRD 4.6) */}
      {activeSubTab === 'emails' && (
        <div className="glass-panel p-6 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-[var(--text)] flex items-center space-x-2">
              <Mail className="w-4 h-4 text-[var(--danger)]" />
              <span>Transactional Email Configuration (Appwrite Messaging)</span>
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Per PRD Section 4.6: Enter a separate Provider ID (created in Appwrite Messaging) for each transactional email flow.
            </p>
          </div>

          {loadingEmails ? (
            <div className="py-12 flex justify-center"><Spinner size="lg" /></div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Configuration Form */}
              <form onSubmit={handleSaveEmailConfigs} className="space-y-4">
                <div className="glass-card p-4 space-y-4 bg-[var(--surface)] border-[var(--border)]">
                  <div>
                    <label className="text-xs font-semibold text-[var(--text)] block mb-1">
                      Account Verification Provider ID
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. mailgun_verif_provider_id"
                      value={emailConfigs.verification}
                      onChange={(e) => setEmailConfigs({ ...emailConfigs, verification: e.target.value })}
                      className="w-full glass-input px-3 py-2 text-xs text-[var(--text)] font-mono bg-[var(--surface)]"
                    />
                    <p className="text-[11px] text-[var(--text-muted)] mt-1">
                      Used for user signup email verification links.
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[var(--text)] block mb-1">
                      Forgot Password / Recovery Provider ID
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. sendgrid_recovery_provider_id"
                      value={emailConfigs.recovery}
                      onChange={(e) => setEmailConfigs({ ...emailConfigs, recovery: e.target.value })}
                      className="w-full glass-input px-3 py-2 text-xs text-[var(--text)] font-mono bg-[var(--surface)]"
                    />
                    <p className="text-[11px] text-[var(--text-muted)] mt-1">
                      Used for password recovery and reset token dispatch.
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[var(--text)] block mb-1">
                      Welcome / Congratulations Provider ID
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ses_welcome_provider_id"
                      value={emailConfigs.welcome}
                      onChange={(e) => setEmailConfigs({ ...emailConfigs, welcome: e.target.value })}
                      className="w-full glass-input px-3 py-2 text-xs text-[var(--text)] font-mono bg-[var(--surface)]"
                    />
                    <p className="text-[11px] text-[var(--text-muted)] mt-1">
                      Used for welcome email dispatch after successful account creation.
                    </p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={savingEmails}
                  className="px-4 py-2 bg-[var(--danger)] hover:opacity-90 text-white rounded-xl text-xs font-semibold flex items-center space-x-2 min-h-[38px] transition-opacity shadow-sm"
                >
                  {savingEmails ? <Spinner size="sm" /> : <span>Save Provider Configuration</span>}
                </button>
              </form>

              {/* Test Email Dispatch Sandbox */}
              <div className="glass-card p-5 space-y-4 flex flex-col justify-between bg-[var(--surface)] border-[var(--border)]">
                <div>
                  <h4 className="text-xs font-bold text-[var(--text)] uppercase tracking-wider mb-2">
                    Test Provider Dispatch (Appwrite Messaging)
                  </h4>
                  <p className="text-xs text-[var(--text-muted)] mb-4">
                    Send a test payload via the selected Provider ID to verify live deliverability.
                  </p>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-[var(--text)] block mb-1">
                        Select Email Flow / Provider
                      </label>
                      <select
                        value={testEmailType}
                        onChange={(e) => setTestEmailType(e.target.value as any)}
                        className="w-full glass-input px-3 py-2 text-xs text-[var(--text)] bg-[var(--surface)]"
                      >
                        <option value="verification">Verification Provider ({emailConfigs.verification || 'Not set'})</option>
                        <option value="recovery">Recovery Provider ({emailConfigs.recovery || 'Not set'})</option>
                        <option value="welcome">Welcome Provider ({emailConfigs.welcome || 'Not set'})</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-[var(--text)] block mb-1">
                        Recipient Test Email Address
                      </label>
                      <input
                        type="email"
                        placeholder="admin-live@doitfastit.com"
                        value={testEmailRecipient}
                        onChange={(e) => setTestEmailRecipient(e.target.value)}
                        className="w-full glass-input px-3 py-2 text-xs text-[var(--text)] bg-[var(--surface)]"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSendTestEmail}
                  disabled={emailTestLoading}
                  className="w-full py-2 bg-[var(--surface-hover)] hover:bg-[var(--border)] text-[var(--text)] border border-[var(--border)] rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 min-h-[38px] transition-colors"
                >
                  {emailTestLoading ? <Spinner size="sm" /> : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Dispatch Test Email</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

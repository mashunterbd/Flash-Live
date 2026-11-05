import React, { useState, useEffect } from 'react';
import { Plus, UserPlus, Shield, UserCheck, Trash2, Building } from 'lucide-react';
import { Spinner } from './Spinner.js';

interface Team {
  id: string;
  name: string;
  total: number;
  createdAt: string;
}

interface Member {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  roles: string[];
  invited: string;
  confirm: boolean;
}

interface OrganizationsViewProps {
  currentUser: any;
}

export const OrganizationsView: React.FC<OrganizationsViewProps> = ({ currentUser }) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [membersLoading, setMembersLoading] = useState(false);

  // New team modal state
  const [isCreating, setIsCreating] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  // Invite member state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'member'>('admin');
  const [inviteLoading, setInviteLoading] = useState(false);

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/teams');
      if (res.ok) {
        const data = await res.json();
        const rawTeams = (data.teams || []).map((t: any) => ({
          id: t.$id,
          name: t.name,
          total: t.total,
          createdAt: t.$createdAt
        }));
        setTeams(rawTeams);
        if (rawTeams.length > 0 && !selectedTeam) {
          setSelectedTeam(rawTeams[0]);
        }
      }
    } catch {
      // Handled silently
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async (teamId: string) => {
    setMembersLoading(true);
    try {
      const res = await fetch(`/api/teams/${teamId}/members`);
      if (res.ok) {
        const data = await res.json();
        const rawMembers = (data.members || []).map((m: any) => ({
          id: m.$id,
          userId: m.userId,
          userName: m.userName || 'Invited User',
          userEmail: m.userEmail,
          roles: m.roles || [],
          invited: m.invited,
          confirm: m.confirm
        }));
        setMembers(rawMembers);
      }
    } catch {
      // Handled silently
    } finally {
      setMembersLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  useEffect(() => {
    if (selectedTeam) {
      fetchMembers(selectedTeam.id);
    }
  }, [selectedTeam]);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    setCreateLoading(true);
    try {
      const res = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTeamName.trim(),
          ownerUserId: currentUser?.id
        })
      });
      if (res.ok) {
        const created = await res.json();
        const newTeamObj: Team = {
          id: created.id,
          name: created.name,
          total: 1,
          createdAt: new Date().toISOString()
        };
        setTeams(prev => [...prev, newTeamObj]);
        setSelectedTeam(newTeamObj);
        setIsCreating(false);
        setNewTeamName('');
      } else {
        const err = await res.json();
        alert(`Error: ${err.error || 'Failed to create team'}`);
      }
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeam || !inviteEmail.trim()) return;
    setInviteLoading(true);
    try {
      const res = await fetch(`/api/teams/${selectedTeam.id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail.trim(),
          roles: [inviteRole]
        })
      });
      if (res.ok) {
        setInviteEmail('');
        fetchMembers(selectedTeam.id);
        alert(`Invitation sent to ${inviteEmail}!`);
      } else {
        const err = await res.json();
        alert(`Error: ${err.error || 'Failed to invite member'}`);
      }
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    } finally {
      setInviteLoading(false);
    }
  };

  const handleRemoveMember = async (membershipId: string, email: string) => {
    if (!selectedTeam) return;
    if (!confirm(`Are you sure you want to remove ${email} from ${selectedTeam.name}?`)) return;

    try {
      const res = await fetch(`/api/teams/${selectedTeam.id}/members/${membershipId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setMembers(prev => prev.filter(m => m.id !== membershipId));
      } else {
        const err = await res.json();
        alert(`Error: ${err.error || 'Failed to remove member'}`);
      }
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header in Glass Style */}
      <div className="glass-panel p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Building className="w-5 h-5 text-[var(--accent)]" />
              <h2 className="text-lg font-bold text-[var(--text)]">Organization & Team Workspaces</h2>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Per PRD Section 4.2: Isolated workspaces powered by Appwrite Teams. Invite additional team admins to collaborate.
            </p>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="text-xs bg-[var(--accent)] hover:opacity-90 text-white font-semibold px-4 py-2 rounded-xl transition-opacity flex items-center space-x-1.5 min-h-[36px] shadow-sm shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create Organization</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Organization Workspaces List */}
        <div className="glass-panel p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
              Your Workspaces ({teams.length})
            </h3>
          </div>

          {loading ? (
            <div className="py-8 flex justify-center"><Spinner size="md" /></div>
          ) : teams.length === 0 ? (
            <div className="text-xs text-[var(--text-muted)] text-center py-6">
              No organization workspaces found. Create one to begin.
            </div>
          ) : (
            <div className="space-y-2">
              {teams.map((team) => (
                <div
                  key={team.id}
                  onClick={() => setSelectedTeam(team)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    selectedTeam?.id === team.id
                      ? 'bg-[var(--surface-hover)] border-[var(--accent)] shadow-sm'
                      : 'bg-[var(--surface)] border-[var(--border)] hover:bg-[var(--surface-hover)]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-[var(--text)]">{team.name}</span>
                    <span className="text-[10px] bg-[var(--surface)] text-[var(--text-muted)] border border-[var(--border)] px-1.5 py-0.5 rounded-md font-mono">
                      {team.total} member{team.total > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)] font-mono mt-1">
                    ID: {team.id}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Active Workspace Roster & Invites */}
        <div className="lg:col-span-2 space-y-6">
          {selectedTeam ? (
            <>
              {/* Workspace Roster */}
              <div className="glass-panel p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border)] pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-[var(--text)]">{selectedTeam.name} Roster</h3>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      Members and admins collaborating within this isolated workspace.
                    </p>
                  </div>
                  <span className="text-xs text-[var(--accent)] font-medium font-mono">
                    Workspace ID: {selectedTeam.id}
                  </span>
                </div>

                {membersLoading ? (
                  <div className="py-8 flex justify-center"><Spinner size="md" /></div>
                ) : members.length === 0 ? (
                  <div className="text-xs text-[var(--text-muted)] text-center py-6">
                    No members loaded.
                  </div>
                ) : (
                  <div className="border border-[var(--border)] rounded-xl overflow-x-auto">
                    <table className="w-full text-left text-xs text-[var(--text)]">
                      <thead className="bg-[var(--surface)] text-[var(--text-muted)] uppercase font-semibold border-b border-[var(--border)]">
                        <tr>
                          <th className="px-4 py-3">Member</th>
                          <th className="px-4 py-3">Email</th>
                          <th className="px-4 py-3">Workspace Role</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border)]">
                        {members.map((m) => {
                          const isAdminRole = m.roles.includes('admin') || m.roles.includes('owner');
                          return (
                            <tr key={m.id} className="hover:bg-[var(--surface-hover)] transition-colors">
                              <td className="px-4 py-3 font-semibold text-[var(--text)]">
                                {m.userName}
                              </td>
                              <td className="px-4 py-3 text-[var(--text-muted)] font-mono text-[11px]">
                                {m.userEmail}
                              </td>
                              <td className="px-4 py-3">
                                {isAdminRole ? (
                                  <span className="inline-flex items-center text-[10px] bg-blue-500/10 text-[var(--accent)] border border-blue-500/20 px-2 py-0.5 rounded-full font-mono font-bold">
                                    <Shield className="w-3 h-3 mr-1" /> ORG ADMIN
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center text-[10px] bg-[var(--surface)] text-[var(--text-muted)] border border-[var(--border)] px-2 py-0.5 rounded-full font-mono">
                                    <UserCheck className="w-3 h-3 mr-1 text-[var(--text-muted)]" /> MEMBER
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                {m.confirm ? (
                                  <span className="text-emerald-400 text-[11px] font-medium">Joined</span>
                                ) : (
                                  <span className="text-amber-400 text-[11px] font-medium">Pending Invite</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <button
                                  onClick={() => handleRemoveMember(m.id, m.userEmail)}
                                  className="p-1 text-[var(--text-muted)] hover:text-[var(--danger)] rounded hover:bg-red-500/10 transition-colors"
                                  title="Remove from Workspace"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
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

              {/* Invite Form */}
              <div className="glass-panel p-5 space-y-4">
                <div className="flex items-center space-x-2">
                  <UserPlus className="w-4 h-4 text-[var(--accent)]" />
                  <h4 className="text-xs font-bold text-[var(--text)] uppercase tracking-wider">
                    Invite Collaborator to {selectedTeam.name}
                  </h4>
                </div>

                <form onSubmit={handleInviteMember} className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    required
                    placeholder="teammate@company.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="flex-1 glass-input px-3.5 py-2 text-xs text-[var(--text)] placeholder-[var(--text-muted)] bg-[var(--surface)]"
                  />
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as any)}
                    className="glass-input px-3 py-2 text-xs text-[var(--text)] bg-[var(--surface)] focus:outline-none"
                  >
                    <option value="admin" className="bg-[#070B1A] text-white">Organization Admin</option>
                    <option value="member" className="bg-[#070B1A] text-white">Standard Member</option>
                  </select>
                  <button
                    type="submit"
                    disabled={inviteLoading}
                    className="px-4 py-2 bg-[var(--accent)] hover:opacity-90 text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-opacity min-h-[38px] shrink-0"
                  >
                    {inviteLoading ? <Spinner size="sm" /> : <span>Send Invite</span>}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="glass-panel p-12 text-center text-xs text-[var(--text-muted)]">
              Select or create a workspace on the left to manage members.
            </div>
          )}
        </div>
      </div>

      {/* Create Team Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="glass-panel max-w-md w-full p-6 space-y-4 bg-[var(--surface-elevated)] border-[var(--border)]">
            <h3 className="text-base font-bold text-[var(--text)]">Create Company Workspace</h3>
            <p className="text-xs text-[var(--text-muted)]">
              Workspaces provide isolated live channels, stream keys, and team membership rosters.
            </p>

            <form onSubmit={handleCreateTeam} className="space-y-4 pt-2">
              <div>
                <label className="text-xs font-semibold text-[var(--text)] block mb-1.5">
                  Company / Workspace Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Media Productions"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="w-full glass-input px-3 py-2.5 text-xs text-[var(--text)] placeholder-[var(--text-muted)] bg-[var(--surface)]"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-[var(--text-muted)] hover:text-[var(--text)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-[var(--accent)] hover:opacity-90 text-white min-h-[34px] flex items-center space-x-1.5"
                >
                  {createLoading ? <Spinner size="sm" /> : <span>Create Workspace</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

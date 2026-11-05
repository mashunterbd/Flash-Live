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
        setTeams(data.teams || []);
        if (data.teams?.length > 0 && !selectedTeam) {
          setSelectedTeam(data.teams[0]);
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
        setMembers(data.members || []);
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
        setTeams(prev => [...prev, created]);
        setSelectedTeam(created);
        setNewTeamName('');
        setIsCreating(false);
      } else {
        alert('Failed to create team');
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
          role: inviteRole
        })
      });
      if (res.ok) {
        const newMember = await res.json();
        setMembers(prev => [...prev, newMember]);
        setInviteEmail('');
      } else {
        alert('Failed to invite member');
      }
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    } finally {
      setInviteLoading(false);
    }
  };

  const handleRemoveMember = async (membershipId: string) => {
    if (!selectedTeam) return;
    if (!confirm('Remove this member from the organization?')) return;
    try {
      const res = await fetch(`/api/teams/${selectedTeam.id}/members/${membershipId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setMembers(prev => prev.filter(m => m.id !== membershipId));
      }
    } catch {
      alert('Failed to remove member');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Create Team Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#131B2E] border border-[#1E293B] rounded-xl p-6 shadow-sm">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center space-x-2">
            <Building className="w-4 h-4 text-blue-400" />
            <span>Company Workspaces & Teams</span>
          </h2>
          <p className="text-xs text-[#94A3B8] mt-1">
            Isolate channel connections and streaming destinations per organization. Invite team admins to collaborate.
          </p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 min-h-[38px] shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Organization</span>
        </button>
      </div>

      {/* Create Team Form Modal */}
      {isCreating && (
        <div className="p-5 bg-[#131B2E] border border-blue-500/30 rounded-xl space-y-4">
          <h3 className="text-sm font-semibold text-white">Create New Organization Workspace</h3>
          <form onSubmit={handleCreateTeam} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              required
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              placeholder="e.g. Apex Global Media"
              className="flex-1 bg-[#0B0F17] border border-[#1E293B] focus:border-blue-500 rounded-lg px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
            />
            <div className="flex space-x-2">
              <button
                type="submit"
                disabled={createLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors flex items-center space-x-1.5 min-h-[36px]"
              >
                {createLoading ? <Spinner size="sm" /> : <Plus className="w-3.5 h-3.5" />}
                <span>Create Workspace</span>
              </button>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="bg-[#1E293B] hover:bg-[#2A3854] text-slate-300 text-xs px-3 py-2 rounded-lg transition-colors min-h-[36px]"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Grid: Workspaces List on left, Selected Team details on right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Organization List */}
        <div className="bg-[#131B2E] border border-[#1E293B] rounded-xl p-5 shadow-sm space-y-3">
          <h3 className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-2">
            Workspaces ({teams.length})
          </h3>
          {loading ? (
            <div className="py-8 flex justify-center"><Spinner size="md" /></div>
          ) : teams.length === 0 ? (
            <div className="p-4 text-center text-xs text-[#94A3B8] border border-dashed border-[#1E293B] rounded-lg">
              No organizations created yet. Click "New Organization" to start.
            </div>
          ) : (
            <div className="space-y-2">
              {teams.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTeam(t)}
                  className={`w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between min-h-[44px] ${
                    selectedTeam?.id === t.id
                      ? 'bg-blue-600/10 border-blue-500/40 text-white'
                      : 'bg-[#0B0F17]/50 border-[#1E293B] text-slate-300 hover:bg-[#1E293B]/40'
                  }`}
                >
                  <div>
                    <div className="text-sm font-semibold">{t.name}</div>
                    <div className="text-[11px] text-[#94A3B8] font-mono">ID: {t.id}</div>
                  </div>
                  <span className="text-xs bg-[#1E293B] px-2 py-0.5 rounded text-slate-400">
                    {t.total} {t.total === 1 ? 'member' : 'members'}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Selected Team Members & Invite */}
        <div className="lg:col-span-2 space-y-6">
          {selectedTeam ? (
            <div className="bg-[#131B2E] border border-[#1E293B] rounded-xl p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-[#1E293B] pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                    <span>{selectedTeam.name}</span>
                    <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">
                      Active Workspace
                    </span>
                  </h3>
                  <p className="text-xs text-[#94A3B8] mt-1 font-mono">Workspace ID: {selectedTeam.id}</p>
                </div>
              </div>

              {/* Invite Member Section */}
              <div className="bg-[#0B0F17] border border-[#1E293B] rounded-lg p-4 space-y-3">
                <h4 className="text-xs font-semibold text-slate-200 flex items-center space-x-1.5">
                  <UserPlus className="w-3.5 h-3.5 text-blue-400" />
                  <span>Invite Admin or Team Member</span>
                </h4>
                <form onSubmit={handleInviteMember} className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="teammate@company.com"
                    className="flex-1 bg-[#131B2E] border border-[#1E293B] focus:border-blue-500 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                  />
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as 'admin' | 'member')}
                    className="bg-[#131B2E] border border-[#1E293B] rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="admin">Organization Admin</option>
                    <option value="member">Standard Member</option>
                  </select>
                  <button
                    type="submit"
                    disabled={inviteLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-1.5 min-h-[34px] shrink-0"
                  >
                    {inviteLoading ? <Spinner size="sm" /> : <UserPlus className="w-3.5 h-3.5" />}
                    <span>Send Invite</span>
                  </button>
                </form>
              </div>

              {/* Members Table */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
                  Roster & Memberships ({members.length})
                </h4>
                {membersLoading ? (
                  <div className="py-8 flex justify-center"><Spinner size="md" /></div>
                ) : (
                  <div className="border border-[#1E293B] rounded-lg overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-200">
                      <thead className="bg-[#0B0F17]/70 text-[#94A3B8] uppercase font-semibold border-b border-[#1E293B]">
                        <tr>
                          <th className="px-4 py-2.5">Member</th>
                          <th className="px-4 py-2.5">Role</th>
                          <th className="px-4 py-2.5">Status</th>
                          <th className="px-4 py-2.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1E293B]">
                        {members.map((m) => (
                          <tr key={m.id} className="hover:bg-[#1E293B]/40 transition-colors">
                            <td className="px-4 py-3">
                              <div className="font-semibold text-white">{m.userName || m.userEmail}</div>
                              <div className="text-[11px] text-[#94A3B8]">{m.userEmail}</div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center space-x-1">
                                {m.roles?.includes('admin') || m.roles?.includes('owner') ? (
                                  <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded font-mono inline-flex items-center space-x-1">
                                    <Shield className="w-3 h-3 mr-0.5" /> Org Admin
                                  </span>
                                ) : (
                                  <span className="text-[10px] bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded font-mono">
                                    Member
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              {m.confirm ? (
                                <span className="text-[10px] text-emerald-400 inline-flex items-center space-x-1">
                                  <UserCheck className="w-3 h-3 mr-0.5" /> Joined
                                </span>
                              ) : (
                                <span className="text-[10px] text-amber-400 font-mono">Pending Invite</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => handleRemoveMember(m.id)}
                                className="text-slate-400 hover:text-red-400 p-1.5 rounded hover:bg-red-500/10 transition-colors min-w-[28px] min-h-[28px] inline-flex items-center justify-center"
                                title="Remove member"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-[#131B2E] border border-[#1E293B] rounded-xl p-12 text-center text-[#94A3B8]">
              Select or create an organization workspace to view details and manage team members.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

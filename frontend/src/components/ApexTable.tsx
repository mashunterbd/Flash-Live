import React, { useState } from 'react';
import { Search, Edit2, Trash2, ArrowUpDown } from 'lucide-react';
import { Channel } from './DestinationsView.js';

interface ApexTableProps {
  channels: Channel[];
  selectedDestinations: string[];
  onToggleDestination: (channelId: string) => void;
  onDisconnectChannel?: (channel: Channel) => void;
  onEditChannel?: (channel: Channel) => void;
}

export const ApexTable: React.FC<ApexTableProps> = ({
  channels,
  selectedDestinations,
  onToggleDestination,
  onDisconnectChannel,
  onEditChannel
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const filtered = channels.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.platform.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.externalId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSelectRow = (id: string) => {
    setSelectedRows(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedRows.length === channels.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(channels.map(c => c.id));
    }
  };

  return (
    <div className="glass-panel p-6 space-y-5">
      {/* Table Header matching Apex reference */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[var(--text)] tracking-tight">
            Broadcast Destinations & Channels
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Active multi-platform endpoints receiving live video broadcasts.
          </p>
        </div>

        {/* Search Input with ⌘K Badge */}
        <div className="relative flex items-center min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search channels..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full glass-input py-1.5 pl-9 pr-10 text-xs text-[var(--text)] placeholder-[var(--text-muted)] bg-[var(--surface)] border-[var(--border)]"
          />
          <div className="absolute right-2.5 flex items-center space-x-0.5 text-[10px] font-mono text-[var(--text-muted)] border border-[var(--border)] px-1.5 py-0.5 rounded-md bg-[var(--surface)]">
            <span>⌘K</span>
          </div>
        </div>
      </div>

      {/* Glass Data Table matching Apex reference */}
      <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
        <table className="w-full text-left text-xs text-[var(--text)]">
          <thead className="bg-[var(--surface)] text-[var(--text-muted)] uppercase font-semibold border-b border-[var(--border)]">
            <tr>
              <th className="px-4 py-3.5 w-10">
                <input
                  type="checkbox"
                  checked={selectedRows.length === channels.length && channels.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded border-[var(--border)] text-[var(--accent)] focus:ring-0 cursor-pointer"
                />
              </th>
              <th className="px-4 py-3.5">
                <div className="flex items-center space-x-1.5">
                  <span>Channel & Name</span>
                  <ArrowUpDown className="w-3 h-3 text-[var(--text-muted)]" />
                </div>
              </th>
              <th className="px-4 py-3.5">
                <div className="flex items-center space-x-1.5">
                  <span>Platform / ID</span>
                  <ArrowUpDown className="w-3 h-3 text-[var(--text-muted)]" />
                </div>
              </th>
              <th className="px-4 py-3.5">
                <div className="flex items-center space-x-1.5">
                  <span>Connected Date</span>
                  <ArrowUpDown className="w-3 h-3 text-[var(--text-muted)]" />
                </div>
              </th>
              <th className="px-4 py-3.5">
                <div className="flex items-center space-x-1.5">
                  <span>Status</span>
                  <ArrowUpDown className="w-3 h-3 text-[var(--text-muted)]" />
                </div>
              </th>
              <th className="px-4 py-3.5">Live Relay</th>
              <th className="px-4 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-xs text-[var(--text-muted)]">
                  No destinations found matching &quot;{searchTerm}&quot;
                </td>
              </tr>
            ) : (
              filtered.map((channel) => {
                const isSelected = selectedDestinations.includes(channel.id);
                const isRowChecked = selectedRows.includes(channel.id);
                const isFb = channel.platform === 'facebook';

                return (
                  <tr
                    key={channel.id}
                    className="hover:bg-[var(--surface-hover)] transition-colors group"
                  >
                    {/* Checkbox column */}
                    <td className="px-4 py-3.5">
                      <input
                        type="checkbox"
                        checked={isRowChecked}
                        onChange={() => toggleSelectRow(channel.id)}
                        className="rounded border-[var(--border)] text-[var(--accent)] focus:ring-0 cursor-pointer"
                      />
                    </td>

                    {/* Circular Avatar + Full Name matching Apex reference */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center space-x-3">
                        <div className="relative shrink-0">
                          <img
                            src={channel.logoUrl || (isFb
                              ? 'https://upload.wikimedia.org/wikipedia/commons/b/b9/2023_Facebook_icon.svg'
                              : 'https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg')}
                            alt={channel.name}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-[var(--border)] bg-[var(--surface)]"
                          />
                          <span
                            className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow ring-1 ring-[var(--surface-card)] ${
                              isFb ? 'bg-blue-600' : 'bg-red-600'
                            }`}
                          >
                            {isFb ? 'f' : 'yt'}
                          </span>
                        </div>

                        <div>
                          <div className="font-semibold text-[var(--text)]">
                            {channel.name}
                          </div>
                          <div className="text-[11px] text-[var(--text-muted)]">
                            Live Stream Destination
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Platform & External ID */}
                    <td className="px-4 py-3.5">
                      <span className="font-mono text-xs text-[var(--text)] uppercase font-semibold">
                        {channel.platform}
                      </span>
                      <div className="text-[11px] text-[var(--text-muted)] font-mono">
                        {channel.externalId.substring(0, 18)}
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3.5 text-xs text-[var(--text-muted)]">
                      {new Date(channel.connectedAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>

                    {/* Status Pill with dot matching Apex reference */}
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-[var(--success)] border border-emerald-500/20 font-mono">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)]" />
                        <span>Active</span>
                      </span>
                    </td>

                    {/* Live Relay Toggle Switch */}
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => onToggleDestination(channel.id)}
                        className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                          isSelected ? 'bg-[var(--accent)]' : 'bg-white/10'
                        }`}
                        title={isSelected ? 'Active live broadcast destination' : 'Disabled for live broadcast'}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                            isSelected ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </td>

                    {/* Row Action Icons matching Apex reference */}
                    <td className="px-4 py-3.5 text-right">
                      <div className="inline-flex items-center space-x-2">
                        {onEditChannel && (
                          <button
                            onClick={() => onEditChannel(channel)}
                            className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)] transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {onDisconnectChannel && (
                          <button
                            onClick={() => onDisconnectChannel(channel)}
                            className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--surface-hover)] transition-colors"
                            title="Disconnect"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

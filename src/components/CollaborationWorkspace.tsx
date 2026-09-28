import React, { useState } from 'react';
import { Users, Share2, MessageSquare, Shield, Clock, Check, Link, Lock, UserPlus } from 'lucide-react';

export const CollaborationWorkspace: React.FC = () => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitedList, setInvitedList] = useState<{ email: string; role: string; status: string }[]>([]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText('https://pdfak.ai/share/workspace-encrypted');
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInvitedList((prev) => [...prev, { email: inviteEmail, role: 'Editor', status: 'Pending' }]);
    setInviteEmail('');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Team Collaboration & Comments</h1>
        <p className="text-sm text-gray-400 mt-1">
          Share encrypted document links, manage role permissions, and collaborate in real-time.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Share Link Card */}
        <div className="p-6 rounded-2xl glass-card border border-white/10 space-y-4 bg-black/40">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <Share2 className="w-4 h-4 text-blue-400" />
            <span>Encrypted Shareable Access Link</span>
          </h3>

          <div className="flex items-center space-x-2">
            <input
              type="text"
              readOnly
              value="https://pdfak.ai/share/workspace-encrypted"
              className="flex-1 px-3 py-2 rounded-xl glass-input text-xs font-mono"
            />
            <button
              onClick={handleCopyLink}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-1"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Link className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="space-y-2 text-xs text-gray-300">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/5">
              <span>Link Expiration</span>
              <span className="font-bold text-amber-300">7 Days Default</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/5">
              <span>Password Protection</span>
              <span className="font-bold text-emerald-400">Enabled</span>
            </div>
          </div>
        </div>

        {/* Invite Team Members */}
        <div className="p-6 rounded-2xl glass-card border border-white/10 space-y-4 bg-black/40">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <UserPlus className="w-4 h-4 text-purple-400" />
            <span>Invite Collaborators</span>
          </h3>

          <form onSubmit={handleInvite} className="flex space-x-2">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="colleague@enterprise.com"
              className="flex-1 px-3 py-2 rounded-xl glass-input text-xs"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold"
            >
              Invite
            </button>
          </form>

          <div className="space-y-2">
            {invitedList.length > 0 ? (
              invitedList.map((m, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-white">{m.email}</p>
                    <p className="text-[10px] text-gray-400">{m.role}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    m.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {m.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-xs text-gray-500 bg-white/[0.02] rounded-xl border border-dashed border-white/10">
                No collaborators invited yet. Enter an email above to invite team members.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Collaborative Document Version Revisions Tracked */}
      <div className="p-6 rounded-2xl glass-card border border-white/10 space-y-4 bg-black/40">
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Collaborative Document Changes Tracked</h3>
              <p className="text-xs text-gray-400">
                All team annotations, reviews, and sign-offs are logged into each document's Version History.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-purple-300 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">
            Real-time Audit Log
          </span>
        </div>

        <div className="p-8 text-center text-xs text-gray-400 bg-white/[0.02] rounded-xl border border-dashed border-white/10 space-y-1.5">
          <Users className="w-8 h-8 text-gray-600 mx-auto" />
          <p className="font-bold text-gray-300">No collaborative revisions logged yet</p>
          <p className="text-[11px] text-gray-500">
            When team members annotate or review documents in PDF Studio, changes will automatically appear here.
          </p>
        </div>
      </div>

    </div>
  );
};

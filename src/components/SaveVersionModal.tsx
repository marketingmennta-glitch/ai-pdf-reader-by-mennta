import React, { useState } from 'react';
import { X, Save, Star, GitCommit, FileText, CheckCircle2 } from 'lucide-react';
import { DocumentSnapshot, VersionAuthor } from '../types/pdfak';

interface SaveVersionModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentName: string;
  currentSnapshot: DocumentSnapshot;
  onSave: (data: { name: string; description: string; isMilestone: boolean }) => void;
  currentUser?: VersionAuthor;
}

export const SaveVersionModal: React.FC<SaveVersionModalProps> = ({
  isOpen,
  onClose,
  documentName,
  currentSnapshot,
  onSave,
  currentUser = {
    name: 'Alex Vance',
    email: 'alex.vance@enterprise.com',
    role: 'Senior Principal Researcher',
    isCurrentUser: true,
  },
}) => {
  const [versionName, setVersionName] = useState(
    `Manual Checkpoint (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`
  );
  const [description, setDescription] = useState('');
  const [isMilestone, setIsMilestone] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!versionName.trim()) return;

    onSave({
      name: versionName.trim(),
      description: description.trim() || 'Manual document checkpoint saved by user.',
      isMilestone,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-[#0b1120] border border-white/15 rounded-3xl p-6 shadow-2xl space-y-6 relative text-gray-100">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <GitCommit className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white tracking-tight">Save Version Checkpoint</h2>
              <p className="text-xs text-gray-400">Document: {documentName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Snapshot Summary Stats */}
        <div className="grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs">
          <div>
            <span className="text-[10px] text-gray-400 uppercase font-semibold">Total Pages</span>
            <p className="font-mono font-bold text-white mt-0.5">{currentSnapshot.pageCount} pages</p>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 uppercase font-semibold">Active Annotations</span>
            <p className="font-mono font-bold text-blue-400 mt-0.5">{currentSnapshot.annotations.length} items</p>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 uppercase font-semibold">Committed By</span>
            <p className="font-medium text-purple-300 truncate mt-0.5">{currentUser.name}</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-semibold text-gray-300">
              Version Label / Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={versionName}
              onChange={(e) => setVersionName(e.target.value)}
              placeholder="e.g. Added Section 4 Benchmarks & Citations"
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-white text-xs font-medium focus:border-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-gray-300">
              Change Notes & Context (Optional)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what changed or why this version is being saved (e.g., reviewed with CFO, verified LaTeX formulas, updated confidentiality)..."
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-white text-xs resize-none focus:border-blue-500"
            />
          </div>

          <label className="flex items-center space-x-3 p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={isMilestone}
              onChange={(e) => setIsMilestone(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 accent-blue-600 focus:ring-0"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-1.5 font-bold text-white">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>Mark as Major Milestone / Release</span>
              </div>
              <p className="text-[11px] text-gray-400">
                Milestones bump the major version number (e.g. v2.0) and are permanently pinned in history filters.
              </p>
            </div>
          </label>

          {/* Modal Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-semibold text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Version Checkpoint</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

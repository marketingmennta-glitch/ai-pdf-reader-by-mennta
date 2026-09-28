import React, { useState } from 'react';
import { 
  History, Clock, Save, Users, GitCommit, RotateCcw, Eye, Diff, Star, 
  CheckCircle2, Download, AlertCircle, ArrowRight, Sparkles, Filter, Search,
  Check, Trash2, X, Plus, ChevronRight, UserPlus
} from 'lucide-react';
import { DocumentVersion, DocumentSnapshot, VersionAuthor, PdfDocument, Annotation } from '../types/pdfak';
import { versionHistoryService } from '../services/versionHistoryService';
import { SaveVersionModal } from './SaveVersionModal';
import { VersionDiffModal } from './VersionDiffModal';
import { VersionPreviewModal } from './VersionPreviewModal';
import confetti from 'canvas-confetti';

interface VersionHistoryPanelProps {
  document: PdfDocument;
  currentSnapshot: DocumentSnapshot;
  onRestoreVersion: (version: DocumentVersion) => void;
  onManualSaveCommitted?: (version: DocumentVersion) => void;
  onCollaborativeChangeCommitted?: (version: DocumentVersion, updatedSnapshot: DocumentSnapshot) => void;
  isOpen: boolean;
  onClose: () => void;
  currentUser?: VersionAuthor;
}

export const VersionHistoryPanel: React.FC<VersionHistoryPanelProps> = ({
  document,
  currentSnapshot,
  onRestoreVersion,
  onManualSaveCommitted,
  onCollaborativeChangeCommitted,
  isOpen,
  onClose,
  currentUser = {
    name: 'Alex Vance',
    email: 'alex.vance@enterprise.com',
    role: 'Senior Principal Researcher',
    isCurrentUser: true,
  },
}) => {
  const [filterType, setFilterType] = useState<'all' | 'manual' | 'collaborative' | 'milestones'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [diffTargetVersion, setDiffTargetVersion] = useState<DocumentVersion | null>(null);
  const [previewTargetVersion, setPreviewTargetVersion] = useState<DocumentVersion | null>(null);
  const [confirmRestoreVersion, setConfirmRestoreVersion] = useState<DocumentVersion | null>(null);

  // Versions state
  const [versions, setVersions] = useState<DocumentVersion[]>(() => {
    return versionHistoryService.getVersions(document.id, document, currentSnapshot.annotations);
  });

  const reloadVersions = () => {
    setVersions(versionHistoryService.getVersions(document.id, document, currentSnapshot.annotations));
  };

  const currentVersion = versions.find((v) => v.isCurrent) || versions[versions.length - 1];

  // Filtering
  const filteredVersions = versions
    .filter((v) => {
      if (filterType === 'manual') return v.type === 'manual';
      if (filterType === 'collaborative') return v.type === 'collaborative';
      if (filterType === 'milestones') return v.isMilestone;
      return true;
    })
    .filter((v) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        v.name.toLowerCase().includes(q) ||
        v.versionNumber.toLowerCase().includes(q) ||
        v.author.name.toLowerCase().includes(q) ||
        (v.description && v.description.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Handle manual save
  const handleSaveCommit = (meta: { name: string; description: string; isMilestone: boolean }) => {
    const newVersion = versionHistoryService.saveManualVersion(document.id, currentSnapshot, {
      name: meta.name,
      description: meta.description,
      isMilestone: meta.isMilestone,
      author: currentUser,
    });
    reloadVersions();
    confetti({ particleCount: 35, spread: 60, origin: { y: 0.7 } });
    if (onManualSaveCommitted) {
      onManualSaveCommitted(newVersion);
    }
  };

  // Handle simulating a team collaborative edit
  const handleSimulateCollaborativeEdit = () => {
    const { newVersion, updatedSnapshot } = versionHistoryService.simulateCollaborativeEdit(
      document.id,
      currentSnapshot
    );
    reloadVersions();
    confetti({ particleCount: 40, spread: 70, origin: { y: 0.6 } });
    if (onCollaborativeChangeCommitted) {
      onCollaborativeChangeCommitted(newVersion, updatedSnapshot);
    }
  };

  // Handle restoring a version
  const handleExecuteRestore = (targetVersion: DocumentVersion) => {
    const result = versionHistoryService.restoreVersion(document.id, targetVersion.id, currentUser);
    if (result) {
      reloadVersions();
      onRestoreVersion(result.newCheckpoint);
      setConfirmRestoreVersion(null);
      confetti({ particleCount: 50, spread: 80, origin: { y: 0.6 } });
    }
  };

  // Toggle milestone star
  const handleToggleMilestone = (e: React.MouseEvent, versionId: string) => {
    e.stopPropagation();
    versionHistoryService.toggleMilestone(document.id, versionId);
    reloadVersions();
  };

  // Export version snapshot as JSON
  const handleDownloadSnapshot = (e: React.MouseEvent, v: DocumentVersion) => {
    e.stopPropagation();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(v, null, 2));
    const downloadAnchor = window.document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${document.name.replace('.pdf', '')}-${v.versionNumber}-snapshot.json`);
    window.document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-xl bg-[#070d19] border-l border-white/15 shadow-2xl z-40 flex flex-col overflow-hidden animate-slide-left select-none text-gray-100">
      
      {/* PANEL TOP HEADER */}
      <div className="p-5 border-b border-white/10 bg-black/40 flex-shrink-0 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-0.5 shadow-md shadow-blue-500/20">
              <div className="w-full h-full bg-[#030712] rounded-[14px] flex items-center justify-center">
                <History className="w-4 h-4 text-blue-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-extrabold text-white tracking-tight">Version History</h2>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono text-[10px] font-bold border border-blue-500/30">
                  {versions.length} checkpoints
                </span>
              </div>
              <p className="text-[11px] text-gray-400 truncate max-w-xs">{document.name}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Controls Bar */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => setIsSaveModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition-all flex items-center justify-center space-x-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Version Checkpoint</span>
          </button>

          <button
            onClick={handleSimulateCollaborativeEdit}
            className="px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 hover:text-white font-bold text-xs transition-all flex items-center justify-center space-x-1.5"
            title="Simulates a team reviewer making a collaborative change"
          >
            <Users className="w-3.5 h-3.5 text-purple-400" />
            <span>Simulate Team Edit</span>
          </button>
        </div>

        {/* Filter Tabs & Search */}
        <div className="space-y-2 pt-1">
          <div className="flex rounded-xl bg-black/60 p-1 border border-white/10 text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`flex-1 py-1.5 rounded-lg font-semibold transition-all text-center ${
                filterType === 'all' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
              }`}
            >
              All ({versions.length})
            </button>
            <button
              onClick={() => setFilterType('manual')}
              className={`flex-1 py-1.5 rounded-lg font-semibold transition-all text-center ${
                filterType === 'manual' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
              }`}
            >
              Manual Saves
            </button>
            <button
              onClick={() => setFilterType('collaborative')}
              className={`flex-1 py-1.5 rounded-lg font-semibold transition-all text-center ${
                filterType === 'collaborative' ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
              }`}
            >
              Collaborative
            </button>
            <button
              onClick={() => setFilterType('milestones')}
              className={`flex-1 py-1.5 rounded-lg font-semibold transition-all text-center flex items-center justify-center space-x-1 ${
                filterType === 'milestones' ? 'bg-amber-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Star className="w-3 h-3 text-amber-300 fill-amber-300" />
              <span>Milestones</span>
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by commit message, author, or version..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl glass-input text-xs"
            />
          </div>
        </div>
      </div>

      {/* VERSION TIMELINE LIST */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4 relative">
        {filteredVersions.length === 0 ? (
          <div className="text-center py-16 space-y-3 text-gray-400">
            <History className="w-10 h-10 mx-auto text-gray-600" />
            <p className="text-xs font-semibold text-white">No version checkpoints match this filter</p>
            <p className="text-[11px]">Click "Save Version Checkpoint" above to record a manual document state.</p>
          </div>
        ) : (
          <div className="relative pl-6 space-y-4">
            {/* Timeline vertical guideline */}
            <div className="absolute left-2.5 top-3 bottom-3 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500/40 to-white/10" />

            {filteredVersions.map((version) => {
              const isCurrent = version.isCurrent;
              const dateObj = new Date(version.createdAt);
              const formattedDate = dateObj.toLocaleDateString([], {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });
              const formattedTime = dateObj.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={version.id}
                  className={`relative p-4 rounded-2xl border transition-all ${
                    isCurrent
                      ? 'bg-gradient-to-br from-blue-950/30 via-slate-900 to-black/80 border-blue-500/40 shadow-lg shadow-blue-500/10'
                      : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/10'
                  }`}
                >
                  {/* Timeline Node Icon Indicator */}
                  <div
                    className={`absolute -left-[29px] top-4 w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] ${
                      isCurrent
                        ? 'bg-blue-600 border-white text-white shadow-md shadow-blue-500/50'
                        : version.type === 'collaborative'
                        ? 'bg-purple-600 border-purple-300 text-white'
                        : version.type === 'restored'
                        ? 'bg-emerald-600 border-emerald-300 text-white'
                        : 'bg-gray-800 border-gray-500 text-gray-300'
                    }`}
                  >
                    {isCurrent ? (
                      <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                    ) : version.type === 'collaborative' ? (
                      <Users className="w-2.5 h-2.5" />
                    ) : version.type === 'restored' ? (
                      <RotateCcw className="w-2.5 h-2.5" />
                    ) : (
                      <GitCommit className="w-2.5 h-2.5" />
                    )}
                  </div>

                  {/* Header Row: Version Number, Type Badge, Star Milestone, Time */}
                  <div className="flex items-center justify-between pb-2 border-b border-white/5">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded-md bg-white/10 text-white font-mono text-xs font-bold border border-white/15">
                        {version.versionNumber}
                      </span>

                      {/* Type Badge */}
                      {version.type === 'manual' && (
                        <span className="px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 text-[10px] font-semibold border border-blue-500/30 flex items-center space-x-1">
                          <Save className="w-2.5 h-2.5" />
                          <span>Manual Save</span>
                        </span>
                      )}
                      {version.type === 'collaborative' && (
                        <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-semibold border border-purple-500/30 flex items-center space-x-1">
                          <Users className="w-2.5 h-2.5" />
                          <span>Collaborative</span>
                        </span>
                      )}
                      {version.type === 'restored' && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold border border-emerald-500/30 flex items-center space-x-1">
                          <RotateCcw className="w-2.5 h-2.5" />
                          <span>Restored Rollback</span>
                        </span>
                      )}
                      {version.type === 'auto' && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 text-[10px] font-semibold border border-amber-500/30 flex items-center space-x-1">
                          <Clock className="w-2.5 h-2.5" />
                          <span>Auto Checkpoint</span>
                        </span>
                      )}

                      {isCurrent && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/40">
                          Active State
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={(e) => handleToggleMilestone(e, version.id)}
                        className="p-1 text-gray-400 hover:text-amber-400 transition-colors"
                        title={version.isMilestone ? 'Starred as milestone' : 'Mark as milestone'}
                      >
                        <Star
                          className={`w-3.5 h-3.5 ${
                            version.isMilestone ? 'text-amber-400 fill-amber-400' : ''
                          }`}
                        />
                      </button>
                      <button
                        onClick={(e) => handleDownloadSnapshot(e, version)}
                        className="p-1 text-gray-400 hover:text-white transition-colors"
                        title="Download snapshot JSON"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Version Title & Description */}
                  <div className="pt-2 space-y-1">
                    <h3 className="text-xs font-bold text-white leading-snug">{version.name}</h3>
                    {version.description && (
                      <p className="text-[11px] text-gray-300 leading-relaxed font-normal">
                        {version.description}
                      </p>
                    )}
                  </div>

                  {/* Author & Timestamp */}
                  <div className="pt-2.5 flex items-center justify-between text-[11px] text-gray-400 border-t border-white/5 mt-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0">
                        {version.author.name
                          .split(' ')
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join('')}
                      </div>
                      <span className="font-medium text-gray-200 truncate max-w-[150px]">
                        {version.author.name}
                      </span>
                      {version.author.isCurrentUser && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300">
                          You
                        </span>
                      )}
                      {version.author.role && (
                        <span className="hidden sm:inline text-[10px] text-gray-500">
                          • {version.author.role}
                        </span>
                      )}
                    </div>

                    <div className="text-[10px] text-gray-400 font-mono">
                      {formattedDate}, {formattedTime}
                    </div>
                  </div>

                  {/* Change Summary Pills */}
                  {version.changeSummary && (
                    <div className="pt-2 flex flex-wrap gap-1.5 text-[10px]">
                      {version.changeSummary.annotationsAdded !== undefined && version.changeSummary.annotationsAdded > 0 && (
                        <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          +{version.changeSummary.annotationsAdded} annotations
                        </span>
                      )}
                      {version.snapshot.pageCount && (
                        <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                          {version.snapshot.pageCount} pages
                        </span>
                      )}
                      {version.snapshot.annotations.some((a) => a.type === 'stamp') && (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold">
                          ✓ Digital Stamp
                        </span>
                      )}
                    </div>
                  )}

                  {/* Action Buttons: Preview / Compare / Restore */}
                  <div className="pt-3 flex items-center justify-between border-t border-white/5 mt-2.5">
                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => setPreviewTargetVersion(version)}
                        className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-[11px] font-semibold flex items-center space-x-1 transition-colors"
                      >
                        <Eye className="w-3 h-3 text-blue-400" />
                        <span>Preview</span>
                      </button>

                      <button
                        onClick={() => setDiffTargetVersion(version)}
                        className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-[11px] font-semibold flex items-center space-x-1 transition-colors"
                      >
                        <Diff className="w-3 h-3 text-purple-400" />
                        <span>Compare</span>
                      </button>
                    </div>

                    {!isCurrent ? (
                      <button
                        onClick={() => setConfirmRestoreVersion(version)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 hover:text-white text-[11px] font-bold flex items-center space-x-1.5 transition-all"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Restore</span>
                      </button>
                    ) : (
                      <span className="text-[10px] text-emerald-400 font-semibold flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Active State</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CONFIRMATION RESTORE MODAL */}
      {confirmRestoreVersion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-[#0b1120] border border-emerald-500/30 rounded-3xl p-6 shadow-2xl space-y-5 text-gray-100">
            <div className="flex items-center space-x-3 text-emerald-400">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">Restore Document State?</h3>
                <p className="text-xs text-gray-400">Reverting to {confirmRestoreVersion.versionNumber}</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs">
              <p className="font-bold text-white">{confirmRestoreVersion.name}</p>
              <p className="text-gray-300 text-[11px]">
                {confirmRestoreVersion.description || 'Snapshot containing previous pages and annotations.'}
              </p>
              <div className="pt-2 text-[10px] text-emerald-400 font-semibold flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Your current document state will be safely preserved as a backup checkpoint.</span>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setConfirmRestoreVersion(null)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-semibold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleExecuteRestore(confirmRestoreVersion)}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center space-x-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Confirm & Restore</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SAVE VERSION MODAL */}
      <SaveVersionModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        documentName={document.name}
        currentSnapshot={currentSnapshot}
        onSave={handleSaveCommit}
        currentUser={currentUser}
      />

      {/* DIFF COMPARISON MODAL */}
      {diffTargetVersion && (
        <VersionDiffModal
          isOpen={!!diffTargetVersion}
          onClose={() => setDiffTargetVersion(null)}
          targetVersion={diffTargetVersion}
          currentSnapshot={currentSnapshot}
          currentVersionNumber={currentVersion.versionNumber}
          onRestore={(vId) => {
            const v = versions.find((item) => item.id === vId);
            if (v) handleExecuteRestore(v);
          }}
        />
      )}

      {/* HISTORICAL PREVIEW MODAL */}
      {previewTargetVersion && (
        <VersionPreviewModal
          isOpen={!!previewTargetVersion}
          onClose={() => setPreviewTargetVersion(null)}
          version={previewTargetVersion}
          onRestore={(vId) => {
            const v = versions.find((item) => item.id === vId);
            if (v) handleExecuteRestore(v);
          }}
        />
      )}

    </div>
  );
};

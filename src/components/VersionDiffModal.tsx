import React, { useState } from 'react';
import { X, ArrowRight, RotateCcw, FileText, CheckCircle2, AlertCircle, Layers, StickyNote } from 'lucide-react';
import { DocumentVersion, DocumentSnapshot } from '../types/pdfak';

interface VersionDiffModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetVersion: DocumentVersion;
  currentSnapshot: DocumentSnapshot;
  currentVersionNumber: string;
  onRestore: (versionId: string) => void;
}

export const VersionDiffModal: React.FC<VersionDiffModalProps> = ({
  isOpen,
  onClose,
  targetVersion,
  currentSnapshot,
  currentVersionNumber,
  onRestore,
}) => {
  const [activeTab, setActiveTab] = useState<'text' | 'annotations' | 'summary'>('text');
  const [selectedPageNum, setSelectedPageNum] = useState<number>(1);

  if (!isOpen) return null;

  const targetPage = targetVersion.snapshot.pages.find((p) => p.pageNumber === selectedPageNum) || targetVersion.snapshot.pages[0];
  const currentPage = currentSnapshot.pages.find((p) => p.pageNumber === selectedPageNum) || currentSnapshot.pages[0];

  const targetAnnotations = targetVersion.snapshot.annotations;
  const currentAnnotations = currentSnapshot.annotations;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-5xl max-h-[90vh] bg-[#0b1120] border border-white/15 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-gray-100">
        
        {/* Modal Top Bar */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between flex-shrink-0 bg-black/40">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-md bg-blue-500/20 text-blue-300 font-mono text-xs font-bold border border-blue-500/30">
                {targetVersion.versionNumber}
              </span>
              <span className="text-gray-400 text-xs">compared with</span>
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold border border-emerald-500/30">
                Current ({currentVersionNumber})
              </span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center space-x-2">
              <span>{targetVersion.name}</span>
              <span className="text-xs text-gray-400 font-normal">by {targetVersion.author.name}</span>
            </h2>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                onRestore(targetVersion.id);
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all flex items-center space-x-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restore This Version</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Diff Tabs & Page Filter Bar */}
        <div className="px-6 py-3 border-b border-white/10 bg-white/[0.02] flex items-center justify-between flex-shrink-0 text-xs">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('text')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
                activeTab === 'text' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
              }`}
            >
              Document Text Content
            </button>
            <button
              onClick={() => setActiveTab('annotations')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
                activeTab === 'annotations' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
              }`}
            >
              Annotations ({targetAnnotations.length} vs {currentAnnotations.length})
            </button>
            <button
              onClick={() => setActiveTab('summary')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
                activeTab === 'summary' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
              }`}
            >
              AI Summary & Metadata
            </button>
          </div>

          {activeTab === 'text' && (
            <div className="flex items-center space-x-2">
              <span className="text-gray-400 text-[11px]">Compare Page:</span>
              <div className="flex space-x-1">
                {targetVersion.snapshot.pages.map((p) => (
                  <button
                    key={p.pageNumber}
                    onClick={() => setSelectedPageNum(p.pageNumber)}
                    className={`w-7 h-7 rounded-lg text-xs font-mono font-bold transition-all ${
                      selectedPageNum === p.pageNumber
                        ? 'bg-blue-600 text-white'
                        : 'bg-white/5 text-gray-400 hover:text-white'
                    }`}
                  >
                    {p.pageNumber}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 p-6 overflow-y-auto">
          {activeTab === 'text' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
              {/* Target (Historical) Version Pane */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3 flex flex-col">
                <div className="flex justify-between items-center text-xs pb-2 border-b border-white/10">
                  <span className="font-bold text-blue-400">
                    {targetVersion.versionNumber} • Page {selectedPageNum} Snapshot
                  </span>
                  <span className="text-gray-400 text-[11px]">
                    {new Date(targetVersion.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex-1 p-4 rounded-xl bg-black/50 border border-white/5 font-serif text-xs leading-relaxed text-gray-300 overflow-y-auto whitespace-pre-wrap select-text">
                  {targetPage?.text || 'No text content on this page.'}
                </div>
              </div>

              {/* Current Version Pane */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3 flex flex-col">
                <div className="flex justify-between items-center text-xs pb-2 border-b border-white/10">
                  <span className="font-bold text-emerald-400">
                    Current Version • Page {selectedPageNum}
                  </span>
                  <span className="text-emerald-400/80 text-[11px] font-semibold">Active State</span>
                </div>
                <div className="flex-1 p-4 rounded-xl bg-black/50 border border-white/5 font-serif text-xs leading-relaxed text-gray-300 overflow-y-auto whitespace-pre-wrap select-text">
                  {currentPage?.text || 'No text content on this page.'}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'annotations' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Target Annotations */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <StickyNote className="w-3.5 h-3.5" />
                  <span>{targetVersion.versionNumber} Annotations ({targetAnnotations.length})</span>
                </h4>
                {targetAnnotations.length > 0 ? (
                  targetAnnotations.map((ann) => (
                    <div key={ann.id} className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs space-y-1">
                      <div className="flex justify-between items-center text-[10px] text-gray-400">
                        <span className="font-bold text-amber-300 uppercase">{ann.type}</span>
                        <span>Page {ann.pageNumber} • by {ann.author}</span>
                      </div>
                      <p className="text-gray-200">{ann.text || 'Drawing / Freehand line'}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-500 italic p-4 bg-white/5 rounded-xl">
                    No annotations present in this historical snapshot.
                  </p>
                )}
              </div>

              {/* Current Annotations */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <StickyNote className="w-3.5 h-3.5" />
                  <span>Current Annotations ({currentAnnotations.length})</span>
                </h4>
                {currentAnnotations.length > 0 ? (
                  currentAnnotations.map((ann) => (
                    <div key={ann.id} className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs space-y-1">
                      <div className="flex justify-between items-center text-[10px] text-gray-400">
                        <span className="font-bold text-emerald-400 uppercase">{ann.type}</span>
                        <span>Page {ann.pageNumber} • by {ann.author}</span>
                      </div>
                      <p className="text-gray-200">{ann.text || 'Drawing / Freehand line'}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-500 italic p-4 bg-white/5 rounded-xl">
                    No active annotations in current state.
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'summary' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <h4 className="text-xs font-bold text-blue-400 uppercase">
                  {targetVersion.versionNumber} Summary & Tags
                </h4>
                <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {targetVersion.snapshot.summary || 'No AI summary generated for this version.'}
                </p>
                <div className="pt-2 flex flex-wrap gap-1">
                  {targetVersion.snapshot.tags?.map((t) => (
                    <span key={t} className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 text-[10px]">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <h4 className="text-xs font-bold text-emerald-400 uppercase">
                  Current Summary & Tags
                </h4>
                <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {currentSnapshot.summary || 'No AI summary generated for current state.'}
                </p>
                <div className="pt-2 flex flex-wrap gap-1">
                  {currentSnapshot.tags?.map((t) => (
                    <span key={t} className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 text-[10px]">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

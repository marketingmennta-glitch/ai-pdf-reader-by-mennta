import React, { useState } from 'react';
import { X, RotateCcw, ChevronLeft, ChevronRight, FileText, StickyNote, Stamp, Clock, CheckCircle } from 'lucide-react';
import { DocumentVersion } from '../types/pdfak';

interface VersionPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  version: DocumentVersion;
  onRestore: (versionId: string) => void;
}

export const VersionPreviewModal: React.FC<VersionPreviewModalProps> = ({
  isOpen,
  onClose,
  version,
  onRestore,
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  if (!isOpen) return null;

  const totalPages = version.snapshot.pageCount;
  const page = version.snapshot.pages.find((p) => p.pageNumber === currentPage) || version.snapshot.pages[0];
  const pageAnnotations = version.snapshot.annotations.filter((a) => a.pageNumber === currentPage);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-4xl max-h-[90vh] bg-[#0b1120] border border-white/15 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-gray-100">
        
        {/* Banner Bar indicating historical preview */}
        <div className="px-6 py-3 bg-amber-500/10 border-b border-amber-500/20 text-amber-300 text-xs flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>
              <strong>Historical Preview Mode:</strong> You are viewing state <strong>{version.versionNumber}</strong> ({version.name}) recorded on {new Date(version.createdAt).toLocaleString()}.
            </span>
          </div>
          <button
            onClick={() => {
              onRestore(version.id);
              onClose();
            }}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-emerald-600/30 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restore This State</span>
          </button>
        </div>

        {/* Top Header */}
        <div className="p-4 px-6 border-b border-white/10 flex items-center justify-between flex-shrink-0 bg-black/40">
          <div className="flex items-center space-x-3">
            <span className="px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-300 font-mono text-xs font-bold border border-blue-500/30">
              {version.versionNumber}
            </span>
            <div>
              <h3 className="text-sm font-bold text-white">{version.name}</h3>
              <p className="text-[11px] text-gray-400">
                Author: {version.author.name} ({version.author.role || 'Member'}) • {version.snapshot.annotations.length} annotations
              </p>
            </div>
          </div>

          {/* Page Navigator & Close */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1 bg-white/5 px-2 py-1 rounded-xl border border-white/10 text-xs">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1 hover:text-white disabled:opacity-30"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span>
                Page <strong className="text-white">{currentPage}</strong> / {totalPages}
              </span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1 hover:text-white disabled:opacity-30"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Canvas Body */}
        <div className="flex-1 p-8 overflow-y-auto bg-black/60 flex justify-center">
          <div className="w-full max-w-2xl min-h-[600px] p-8 rounded-2xl bg-[#0b1120] border border-white/10 shadow-2xl relative">
            <div className="flex justify-between items-center pb-4 border-b border-white/10 mb-6 text-[10px] font-mono opacity-60">
              <span>{version.snapshot.name}</span>
              <span>Page {currentPage} of {totalPages} (Snapshot)</span>
            </div>

            <div className="text-xs leading-relaxed whitespace-pre-wrap font-serif text-gray-200">
              {page?.text || 'No page content.'}
            </div>

            {/* Render Annotations in snapshot */}
            {pageAnnotations.map((ann) => {
              if (ann.type === 'sticky') {
                return (
                  <div
                    key={ann.id}
                    style={{ top: ann.y, left: ann.x }}
                    className="absolute p-3 rounded-xl bg-amber-400 text-gray-900 text-xs font-bold shadow-xl max-w-xs border border-amber-300"
                  >
                    <div className="flex items-center space-x-1 mb-1 text-[10px] text-amber-900">
                      <StickyNote className="w-3 h-3" />
                      <span>Note by {ann.author}</span>
                    </div>
                    <p>{ann.text}</p>
                  </div>
                );
              }
              if (ann.type === 'stamp') {
                return (
                  <div
                    key={ann.id}
                    style={{ top: ann.y, left: ann.x }}
                    className="absolute px-4 py-2 rounded-xl border-4 border-emerald-500 text-emerald-400 font-extrabold text-lg uppercase tracking-widest bg-emerald-950/60 backdrop-blur-md rotate-[-12deg] shadow-2xl"
                  >
                    APPROVED
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

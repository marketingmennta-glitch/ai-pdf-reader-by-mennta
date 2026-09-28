import React, { useState } from 'react';
import { Split, Layers, Lock, Shield, Stamp, FileText, Upload, Check, ArrowRight, Download, Sparkles } from 'lucide-react';
import { SAMPLE_PDFS } from '../data/samplePdfs';

export const PDFToolsStudio: React.FC = () => {
  const [activeToolTab, setActiveToolTab] = useState<'merge' | 'split' | 'compress' | 'protect' | 'sign'>('merge');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Tools Form States
  const [selectedMergeDocs, setSelectedMergeDocs] = useState<string[]>([SAMPLE_PDFS[0].id, SAMPLE_PDFS[1].id]);
  const [splitPageRange, setSplitPageRange] = useState('1-2, 3-5');
  const [compressLevel, setCompressLevel] = useState<'recommended' | 'extreme' | 'less'>('recommended');
  const [password, setPassword] = useState('');
  const [stampText, setStampText] = useState('CONFIDENTIAL & PROPRIETARY');

  const handleExecuteTool = () => {
    setIsProcessing(true);
    setSuccessMsg('');

    setTimeout(() => {
      setIsProcessing(false);
      setSuccessMsg(`Operation successful! Generated optimized output document.`);
    }, 1200);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">PDF Utility Studio & Operations</h1>
        <p className="text-sm text-gray-400 mt-1">
          Merge, split, compress, protect, and sign documents with zero quality loss.
        </p>
      </div>

      {/* Tool Selector Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { id: 'merge', label: 'Merge PDFs', icon: Layers, color: 'text-blue-400' },
          { id: 'split', label: 'Split PDF', icon: Split, color: 'text-purple-400' },
          { id: 'compress', label: 'Compress PDF', icon: Sparkles, color: 'text-emerald-400' },
          { id: 'protect', label: 'Encrypt & Protect', icon: Lock, color: 'text-red-400' },
          { id: 'sign', label: 'Digital Signature', icon: Stamp, color: 'text-amber-400' },
        ].map((tool) => {
          const Icon = tool.icon;
          const isActive = activeToolTab === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => {
                setActiveToolTab(tool.id as any);
                setSuccessMsg('');
              }}
              className={`p-4 rounded-2xl border transition-all text-left flex flex-col justify-between ${
                isActive
                  ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-600/20'
                  : 'glass-card border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon className={`w-6 h-6 mb-3 ${tool.color}`} />
              <span className="text-xs font-bold">{tool.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tool Main Execution Card */}
      <div className="p-8 rounded-2xl glass-card border border-white/10 space-y-6 max-w-3xl mx-auto bg-black/40">
        
        {/* MERGE TAB */}
        {activeToolTab === 'merge' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Layers className="w-5 h-5 text-blue-400" />
              <span>Merge Multiple PDF Files into One</span>
            </h3>
            <p className="text-xs text-gray-400">Select documents from your workspace to combine in sequence:</p>

            <div className="space-y-2">
              {SAMPLE_PDFS.map((doc) => {
                const isSelected = selectedMergeDocs.includes(doc.id);
                return (
                  <div
                    key={doc.id}
                    onClick={() => {
                      setSelectedMergeDocs((prev) =>
                        isSelected ? prev.filter((id) => id !== doc.id) : [...prev, doc.id]
                      );
                    }}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-600/20 border-blue-500/50 text-white'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <FileText className="w-4 h-4 text-blue-400" />
                      <div>
                        <p className="text-xs font-bold text-white">{doc.name}</p>
                        <p className="text-[10px] text-gray-400">{doc.pageCount} pages • {doc.size}</p>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-blue-400" />}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SPLIT TAB */}
        {activeToolTab === 'split' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Split className="w-5 h-5 text-purple-400" />
              <span>Split PDF into Separate Pages or Ranges</span>
            </h3>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Enter Page Ranges to Extract (e.g. 1-2, 3-5)</label>
              <input
                type="text"
                value={splitPageRange}
                onChange={(e) => setSplitPageRange(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
              />
            </div>
          </div>
        )}

        {/* COMPRESS TAB */}
        {activeToolTab === 'compress' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <span>Compress PDF File Size</span>
            </h3>

            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'recommended', label: 'Balanced Quality', desc: '~60% size reduction' },
                { id: 'extreme', label: 'Extreme Compression', desc: '~85% size reduction' },
                { id: 'less', label: 'High Precision', desc: '~30% size reduction' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setCompressLevel(opt.id as any)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    compressLevel === opt.id
                      ? 'bg-emerald-600/20 border-emerald-500 text-white'
                      : 'bg-white/5 border-white/10 text-gray-400'
                  }`}
                >
                  <p className="text-xs font-bold">{opt.label}</p>
                  <p className="text-[10px] text-emerald-400 mt-1">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* PROTECT TAB */}
        {activeToolTab === 'protect' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Lock className="w-5 h-5 text-red-400" />
              <span>Password Protect & Encrypt PDF (AES-256)</span>
            </h3>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Set Document Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
              />
            </div>
          </div>
        )}

        {/* SIGN TAB */}
        {activeToolTab === 'sign' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Stamp className="w-5 h-5 text-amber-400" />
              <span>Watermark & Digital Signature</span>
            </h3>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Watermark / Stamp Text</label>
              <input
                type="text"
                value={stampText}
                onChange={(e) => setStampText(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-xs font-bold"
              />
            </div>
          </div>
        )}

        {/* Success Banner */}
        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center justify-between">
            <span>{successMsg}</span>
            <button
              onClick={() => {
                const element = document.createElement('a');
                const file = new Blob(['PDFAK Processed Output Data'], { type: 'text/plain' });
                element.href = URL.createObjectURL(file);
                element.download = `PDFAK_Output_${activeToolTab}.pdf`;
                element.click();
              }}
              className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px] flex items-center space-x-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleExecuteTool}
          disabled={isProcessing}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center space-x-2"
        >
          {isProcessing ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>Execute {activeToolTab.toUpperCase()} Operation</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

      </div>

    </div>
  );
};

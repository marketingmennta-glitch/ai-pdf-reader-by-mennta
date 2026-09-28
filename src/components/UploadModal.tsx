import React, { useState } from 'react';
import { X, Upload, FileText, Check, Sparkles } from 'lucide-react';
import { extractTextFromFile, fileToBase64, formatBytes } from '../utils/pdfWorker';
import { PdfDocument } from '../types/pdfak';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDocumentUploaded: (newDoc: PdfDocument) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onDocumentUploaded,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const [docName, setDocName] = useState('');

  if (!isOpen) return null;

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const { text, pages } = await extractTextFromFile(file);
      const base64 = await fileToBase64(file);

      const newDoc: PdfDocument = {
        id: `pdf-${Date.now()}`,
        name: file.name,
        size: formatBytes(file.size),
        pageCount: pages.length,
        uploadDate: new Date().toISOString().split('T')[0],
        lastOpened: 'Just now',
        category: 'Personal',
        tags: ['CustomUpload'],
        isFavorite: false,
        isRecent: true,
        summary: text.substring(0, 200) + '...',
        base64Data: base64,
        pages,
      };

      onDocumentUploaded(newDoc);
      onClose();
    } catch (err) {
      console.error('File Upload Error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleTextSubmit = () => {
    if (!pastedText.trim()) return;
    setIsUploading(true);

    const name = docName.trim() ? `${docName}.pdf` : 'Custom_Text_Document.pdf';
    const lines = pastedText.split('\n');
    const pages = [
      {
        pageNumber: 1,
        text: pastedText,
      },
    ];

    const newDoc: PdfDocument = {
      id: `pdf-${Date.now()}`,
      name,
      size: '1.2 MB',
      pageCount: 1,
      uploadDate: new Date().toISOString().split('T')[0],
      lastOpened: 'Just now',
      category: 'Research',
      tags: ['CustomText'],
      isFavorite: false,
      isRecent: true,
      summary: pastedText.substring(0, 200) + '...',
      pages,
    };

    setTimeout(() => {
      onDocumentUploaded(newDoc);
      setIsUploading(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl p-8 glass-card rounded-2xl border border-white/10 shadow-2xl">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 mb-3">
            <Upload className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white">Upload PDF or Document</h2>
          <p className="text-xs text-gray-400 mt-1">Drag and drop PDF, TXT, or image files for AI analysis</p>
        </div>

        {/* Drag Dropzone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
          }}
          className={`p-8 rounded-2xl border-2 border-dashed transition-all text-center flex flex-col items-center justify-center space-y-3 cursor-pointer ${
            isDragging
              ? 'border-blue-500 bg-blue-500/10'
              : 'border-white/15 bg-black/40 hover:border-white/30'
          }`}
        >
          <FileText className="w-10 h-10 text-blue-400 animate-pulse" />
          <div>
            <p className="text-sm font-bold text-white">Choose a file or drag & drop here</p>
            <p className="text-xs text-gray-400 mt-0.5">Supports PDF, TXT, PNG, JPG up to 500 MB</p>
          </div>

          <label className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer transition-all shadow-md">
            <span>Browse Computer Files</span>
            <input
              type="file"
              accept=".pdf,.txt,image/*"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              className="hidden"
            />
          </label>
        </div>

        {/* Or Paste Text Option */}
        <div className="mt-6 pt-6 border-t border-white/10 space-y-3">
          <p className="text-xs font-bold text-gray-300">Or Paste Text / Markdown directly:</p>
          <input
            type="text"
            value={docName}
            onChange={(e) => setDocName(e.target.value)}
            placeholder="Document Title (Optional)"
            className="w-full px-3 py-2 rounded-xl glass-input text-xs"
          />
          <textarea
            rows={4}
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            placeholder="Paste raw research text, essay, or legal contract..."
            className="w-full p-3 rounded-xl glass-input text-xs"
          />
          <button
            onClick={handleTextSubmit}
            disabled={!pastedText.trim() || isUploading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md transition-all disabled:opacity-40"
          >
            {isUploading ? 'Processing Document...' : 'Create PDF from Pasted Text'}
          </button>
        </div>

      </div>
    </div>
  );
};

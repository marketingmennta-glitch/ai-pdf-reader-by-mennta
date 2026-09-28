import React, { useState } from 'react';
import { Search, Bell, Upload, Sparkles, User, FileText, Check, ShieldCheck } from 'lucide-react';
import { PdfDocument, ViewMode } from '../types/pdfak';

interface TopHeaderProps {
  documents: PdfDocument[];
  onSelectDocument: (docId: string) => void;
  onOpenUpload: () => void;
  setViewMode: (mode: ViewMode) => void;
  userName?: string;
  userEmail?: string;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  documents,
  onSelectDocument,
  onOpenUpload,
  setViewMode,
  userName = 'Alex Vance',
  userEmail = 'alex@enterprise.com',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const filteredDocs = searchQuery.trim()
    ? documents.filter(
        (doc) =>
          doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
          doc.pages.some((p) => p.text.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  return (
    <header className="h-16 px-6 bg-[#030712]/80 backdrop-blur-xl border-b border-white/10 flex items-center justify-between sticky top-0 z-30">
      
      {/* Global Search Bar */}
      <div className="relative w-full max-w-md">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents, tags, page text, or AI notes..."
            className="w-full pl-10 pr-4 py-2 rounded-xl glass-input text-xs font-medium placeholder-gray-500"
          />
        </div>

        {/* Search Results Dropdown */}
        {searchQuery.trim() && (
          <div className="absolute left-0 right-0 top-12 glass-card rounded-xl border border-white/10 p-2 shadow-2xl max-h-80 overflow-y-auto z-50">
            {filteredDocs.length > 0 ? (
              filteredDocs.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => {
                    onSelectDocument(doc.id);
                    setViewMode('studio');
                    setSearchQuery('');
                  }}
                  className="p-2.5 rounded-lg hover:bg-white/10 cursor-pointer transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2.5 overflow-hidden">
                    <FileText className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-white truncate">{doc.name}</p>
                      <p className="text-[10px] text-gray-400">{doc.category} • {doc.pageCount} pages</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-blue-300 font-semibold bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                    Open
                  </span>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-xs text-gray-400">
                No matching documents found for "{searchQuery}"
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-4">
        
        {/* Gemini AI Status Indicator */}
        <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <Sparkles className="w-3.5 h-3.5" />
          <span>Gemini 3.6 Connected</span>
        </div>

        {/* Quick Upload Button */}
        <button
          onClick={onOpenUpload}
          className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-md shadow-blue-600/20 flex items-center space-x-1.5"
        >
          <Upload className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Upload PDF</span>
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-12 w-80 glass-card rounded-2xl border border-white/10 p-4 shadow-2xl z-50 animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                <span className="text-xs font-bold text-white">Notifications</span>
                <span className="text-[10px] text-blue-400 cursor-pointer">Mark all as read</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <p className="font-semibold text-blue-300">OCR Extraction Completed</p>
                  <p className="text-gray-300 text-[11px] mt-0.5">Extracted 4 pages from Research_Notes.png</p>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                  <p className="font-semibold text-white">Security Scan Clean</p>
                  <p className="text-gray-400 text-[11px] mt-0.5">No malware found in Q3_Audit.pdf</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-md border border-white/20 hover:scale-105 transition-transform"
          >
            {userName.charAt(0)}
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 top-12 w-60 glass-card rounded-2xl border border-white/10 p-3 shadow-2xl z-50 animate-fade-in">
              <div className="p-2 border-b border-white/10 mb-2">
                <p className="text-xs font-bold text-white">{userName}</p>
                <p className="text-[10px] text-gray-400">{userEmail}</p>
              </div>
              <button
                onClick={() => { setViewMode('settings'); setShowProfileMenu(false); }}
                className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex items-center space-x-2"
              >
                <User className="w-3.5 h-3.5" />
                <span>Account Settings</span>
              </button>
              <button
                onClick={() => { setViewMode('analytics'); setShowProfileMenu(false); }}
                className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex items-center space-x-2"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Security & Storage</span>
              </button>
            </div>
          )}
        </div>

      </div>

    </header>
  );
};

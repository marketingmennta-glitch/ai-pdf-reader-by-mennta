import React, { useState } from 'react';
import { 
  FileText, Sparkles, FolderKanban, ShieldCheck, HardDrive, Eye, BrainCircuit, 
  Trash2, Star, Clock, Plus, Search, Filter, MoreVertical, FolderPlus, History, X
} from 'lucide-react';
import { PdfDocument, Folder, ViewMode } from '../types/pdfak';

interface AnalyticsDashboardProps {
  documents: PdfDocument[];
  folders: Folder[];
  onSelectDocument: (docId: string) => void;
  onOpenUpload: () => void;
  setViewMode: (mode: ViewMode) => void;
  onDeleteDocument: (docId: string) => void;
  onToggleFavorite: (docId: string) => void;
  onCreateFolder?: (name: string, color?: string) => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  documents,
  folders,
  onSelectDocument,
  onOpenUpload,
  setViewMode,
  onDeleteDocument,
  onToggleFavorite,
  onCreateFolder,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchFilter, setSearchFilter] = useState('');
  
  // Folder creation modal state
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#2563EB');

  // Real metric counters starting from 0
  const [aiQueriesCount] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      return parseInt(localStorage.getItem('pdfak_ai_queries_count') || '0', 10);
    }
    return 0;
  });

  const [ocrCount] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      return parseInt(localStorage.getItem('pdfak_ocr_count') || '0', 10);
    }
    return 0;
  });

  // Calculate real storage dynamically from actual documents
  const calculatedStorageMB = documents.reduce((acc, doc) => {
    const sizeStr = doc.size || '0 MB';
    const mbMatch = sizeStr.match(/([\d.]+)\s*MB/i);
    const kbMatch = sizeStr.match(/([\d.]+)\s*KB/i);
    if (mbMatch) return acc + parseFloat(mbMatch[1]);
    if (kbMatch) return acc + parseFloat(kbMatch[1]) / 1024;
    return acc;
  }, 0);

  const storagePercentage = Math.min(100, (calculatedStorageMB / 10240) * 100);

  const categories = ['All', 'Favorites', 'Research', 'Security', 'Finance'];

  const filteredDocs = documents.filter((doc) => {
    const matchesCategory =
      selectedCategory === 'All'
        ? true
        : selectedCategory === 'Favorites'
        ? doc.isFavorite
        : doc.category === selectedCategory;

    const matchesSearch =
      doc.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      doc.tags.some((t) => t.toLowerCase().includes(searchFilter.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const handleCreateFolderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    if (onCreateFolder) {
      onCreateFolder(newFolderName.trim(), selectedColor);
    }
    setNewFolderName('');
    setIsFolderModalOpen(false);
  };

  const folderColors = ['#2563EB', '#7C3AED', '#10B981', '#F59E0B', '#EC4899', '#06B6D4'];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in text-gray-100">
      
      {/* Top Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Enterprise Workspace Dashboard</h1>
          <p className="text-sm text-gray-400 mt-1">
            Overview of active documents, Gemini AI query usage, storage allocation, and team analytics.
          </p>
        </div>

        <button
          onClick={onOpenUpload}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Upload New PDF</span>
        </button>
      </div>

      {/* METRICS METERS ROW — Real Data Starting From 0 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Documents */}
        <div className="p-6 rounded-2xl glass-card border border-white/10 space-y-2 bg-black/40">
          <div className="flex justify-between items-center text-gray-400">
            <span className="text-xs font-semibold">Total Documents</span>
            <FileText className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-3xl font-extrabold text-white">{documents.length}</p>
          <p className="text-[11px] text-gray-400 font-medium">
            {documents.length === 0 ? 'No documents uploaded yet' : `${documents.length} active in workspace`}
          </p>
        </div>

        {/* Gemini AI Queries */}
        <div className="p-6 rounded-2xl glass-card border border-white/10 space-y-2 bg-black/40">
          <div className="flex justify-between items-center text-gray-400">
            <span className="text-xs font-semibold">Gemini AI Queries</span>
            <Sparkles className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-3xl font-extrabold text-white">{aiQueriesCount}</p>
          <p className="text-[11px] text-gray-400 font-medium">
            {aiQueriesCount === 0 ? '0 queries run' : 'Grounded AI reasoning'}
          </p>
        </div>

        {/* OCR Pages Extracted */}
        <div className="p-6 rounded-2xl glass-card border border-white/10 space-y-2 bg-black/40">
          <div className="flex justify-between items-center text-gray-400">
            <span className="text-xs font-semibold">OCR Pages Extracted</span>
            <Eye className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-3xl font-extrabold text-white">{ocrCount}</p>
          <p className="text-[11px] text-gray-400 font-medium">
            {ocrCount === 0 ? '0 scans processed' : 'Multimodal layout parsed'}
          </p>
        </div>

        {/* Storage Allocated */}
        <div className="p-6 rounded-2xl glass-card border border-white/10 space-y-2 bg-black/40">
          <div className="flex justify-between items-center text-gray-400">
            <span className="text-xs font-semibold">Storage Allocated</span>
            <HardDrive className="w-5 h-5 text-indigo-400" />
          </div>
          <p className="text-3xl font-extrabold text-white">
            {calculatedStorageMB.toFixed(2)} MB <span className="text-xs text-gray-400 font-normal">/ 10 GB</span>
          </p>
          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden mt-2">
            <div 
              className="h-full bg-blue-500 rounded-full transition-all duration-500" 
              style={{ width: `${Math.max(storagePercentage > 0 ? 4 : 0, storagePercentage)}%` }} 
            />
          </div>
        </div>

      </div>

      {/* FOLDERS GRID */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <FolderKanban className="w-5 h-5 text-blue-400" />
            <span>Workspace Folders</span>
          </h2>
          <button 
            onClick={() => setIsFolderModalOpen(true)}
            className="text-xs text-blue-400 font-semibold hover:underline flex items-center space-x-1"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>New Folder</span>
          </button>
        </div>

        {folders.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {folders.map((folder) => (
              <div
                key={folder.id}
                className="p-4 rounded-xl glass-card border border-white/10 hover:border-blue-500/50 cursor-pointer transition-all flex items-center space-x-3 bg-black/40"
              >
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center font-bold" 
                  style={{ backgroundColor: `${folder.color}20`, color: folder.color }}
                >
                  <FolderKanban className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{folder.name}</h4>
                  <p className="text-[10px] text-gray-400">{folder.docCount} files</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-2xl glass-card border border-dashed border-white/10 text-center space-y-2 bg-black/20">
            <FolderKanban className="w-8 h-8 text-gray-600 mx-auto" />
            <p className="text-xs font-bold text-gray-300">No folders created yet</p>
            <p className="text-[11px] text-gray-500">
              Organize your documents by clicking "+ New Folder" to create your first workspace directory.
            </p>
          </div>
        )}
      </div>

      {/* DOCUMENTS LIBRARY TABLE */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-white">Document Library</h2>

          {/* Filters & Search */}
          {documents.length > 0 && (
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Filter library..."
                  className="pl-8 pr-3 py-1.5 rounded-xl glass-input text-xs"
                />
              </div>

              <div className="flex rounded-xl bg-black/60 p-1 border border-white/10 text-xs">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                      selectedCategory === cat ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Documents Table or Clean Empty State */}
        {documents.length === 0 ? (
          <div className="p-12 text-center rounded-2xl glass-card border border-dashed border-white/10 space-y-4 bg-black/30">
            <div className="w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mx-auto text-blue-400">
              <FileText className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Your Document Library is Empty</h3>
              <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
                Upload your first PDF or document to begin viewing, annotating, chatting with Gemini AI, and tracking version history.
              </p>
            </div>
            <button
              onClick={onOpenUpload}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all inline-flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Upload Your First PDF</span>
            </button>
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-400 rounded-2xl bg-white/[0.02] border border-white/5">
            No documents match your filter or search query.
          </div>
        ) : (
          <div className="rounded-2xl glass-card border border-white/10 overflow-hidden bg-black/40">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-white/5 text-gray-400 uppercase tracking-wider text-[10px] font-bold border-b border-white/10">
                <tr>
                  <th className="py-3 px-4">Document Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Page Count</th>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">Uploaded</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-white/5 transition-colors group">
                    <td className="py-3 px-4 font-bold text-white flex items-center space-x-3">
                      <button
                        onClick={() => onToggleFavorite(doc.id)}
                        className="text-gray-500 hover:text-amber-400 transition-colors"
                      >
                        <Star className={`w-4 h-4 ${doc.isFavorite ? 'text-amber-400 fill-amber-400' : ''}`} />
                      </button>
                      <FileText className="w-4 h-4 text-blue-400 flex-shrink-0" />
                      <span 
                        onClick={() => {
                          onSelectDocument(doc.id);
                          setViewMode('studio');
                        }}
                        className="cursor-pointer hover:text-blue-300 transition-colors truncate max-w-md"
                      >
                        {doc.name}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px] font-bold border border-blue-500/20">
                        {doc.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono">{doc.pageCount} pages</td>
                    <td className="py-3 px-4 font-mono">{doc.size}</td>
                    <td className="py-3 px-4 text-gray-400">{doc.uploadDate}</td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          onSelectDocument(doc.id);
                          setViewMode('studio');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-bold text-[11px] border border-white/10 inline-flex items-center space-x-1 transition-colors"
                        title="View Version History & Backups"
                      >
                        <History className="w-3 h-3 text-blue-400" />
                        <span>History</span>
                      </button>
                      <button
                        onClick={() => {
                          onSelectDocument(doc.id);
                          setViewMode('studio');
                        }}
                        className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px]"
                      >
                        Open PDF
                      </button>
                      <button
                        onClick={() => onDeleteDocument(doc.id)}
                        className="p-1 text-gray-400 hover:text-red-400 rounded-lg hover:bg-white/10 transition-colors"
                        title="Delete document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* NEW FOLDER CREATION MODAL */}
      {isFolderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm bg-[#0b1120] border border-white/15 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <FolderPlus className="w-4 h-4 text-blue-400" />
                <span>Create New Folder</span>
              </h3>
              <button 
                onClick={() => setIsFolderModalOpen(false)}
                className="text-gray-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateFolderSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-gray-300 font-semibold">Folder Name</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="e.g. Legal Contracts 2026"
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-300 font-semibold">Folder Color Tag</label>
                <div className="flex items-center space-x-2 pt-1">
                  {folderColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`w-6 h-6 rounded-full transition-all ${
                        selectedColor === color ? 'scale-125 ring-2 ring-white' : 'opacity-70 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsFolderModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30"
                >
                  Create Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

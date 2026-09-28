import React, { useState, useRef, useEffect } from 'react';
import { 
  FileText, ZoomIn, ZoomOut, RotateCw, Maximize2, Moon, Sun, Highlighter, 
  Underline, Pencil, StickyNote, Type, Stamp, Sparkles, Send, Volume2, Play, Pause, 
  HelpCircle, ChevronLeft, ChevronRight, Bookmark, Layers, List, Copy, Globe, 
  Share2, Download, Printer, Check, Trash2, X, BrainCircuit, RefreshCw, Layers3, VolumeX,
  History, Save, CheckCircle2, RotateCcw, Plus
} from 'lucide-react';
import { 
  PdfDocument, Annotation, AnnotationType, ChatMessage, QuizQuestion, 
  Flashcard, MindMapNode, DocumentVersion, DocumentSnapshot 
} from '../types/pdfak';
import { versionHistoryService } from '../services/versionHistoryService';
import { VersionHistoryPanel } from './VersionHistoryPanel';
import confetti from 'canvas-confetti';

interface PDFStudioProps {
  documents: PdfDocument[];
  activeDocument: PdfDocument | null;
  onSelectDocument: (docId: string) => void;
  onUpdateDocumentSummary?: (pdfId: string, summary: string) => void;
  onUpdateDocument?: (updatedDoc: PdfDocument) => void;
  onOpenUpload?: () => void;
}

export const PDFStudio: React.FC<PDFStudioProps> = ({
  documents,
  activeDocument,
  onSelectDocument,
  onUpdateDocumentSummary,
  onUpdateDocument,
  onOpenUpload,
}) => {
  if (!activeDocument && documents.length > 0) {
    activeDocument = documents[0];
  }

  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [isNightMode, setIsNightMode] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Version History State
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [activeVersionTag, setActiveVersionTag] = useState('v2.0');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [restoredBannerMessage, setRestoredBannerMessage] = useState<string | null>(null);

  // Annotation Tool State
  const [activeTool, setActiveTool] = useState<'pan' | 'select' | AnnotationType>('select');
  const [activeColor, setActiveColor] = useState('#FACC15');
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPenPath, setCurrentPenPath] = useState<{ x: number; y: number }[]>([]);

  // Text Selection Popup State
  const [selectedText, setSelectedText] = useState('');
  const [selectionPosition, setSelectionPosition] = useState<{ x: number; y: number } | null>(null);

  // Left Sidebar Drawer State
  const [leftTab, setLeftTab] = useState<'thumbnails' | 'outline' | 'annotations' | 'bookmarks'>('thumbnails');
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);

  // Right AI Assistant State
  const [rightTab, setRightTab] = useState<'chat' | 'summary' | 'quiz' | 'mindmap' | 'audio'>('chat');
  const [showRightSidebar, setShowRightSidebar] = useState(true);

  // AI Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      role: 'assistant',
      content: `Hello! I am PDFAK AI. I've analyzed **${activeDocument?.name || 'your document'}**. Ask me anything about this PDF or request a specific section breakdown!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // AI Summary State
  const [summaryText, setSummaryText] = useState(activeDocument?.summary || '');
  const [isSummarizing, setIsSummarizing] = useState(false);

  // AI Quiz & Flashcards State
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [activeFlashcardIndex, setActiveFlashcardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);

  // AI Mind Map State
  const [mindMapData, setMindMapData] = useState<MindMapNode | null>(null);
  const [isGeneratingMindMap, setIsGeneratingMindMap] = useState(false);

  // Text to Speech State
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechRate, setSpeechRate] = useState(1.0);

  // Sync document annotations from version history on document switch
  useEffect(() => {
    if (activeDocument) {
      const curVersion = versionHistoryService.getCurrentVersion(activeDocument.id);
      if (curVersion) {
        setActiveVersionTag(curVersion.versionNumber);
        if (curVersion.snapshot.annotations) {
          setAnnotations(curVersion.snapshot.annotations);
        }
      } else {
        setActiveVersionTag('v1.0');
        setAnnotations([]);
      }
      setSummaryText(activeDocument.summary || '');
      setHasUnsavedChanges(false);
      setCurrentPage(1);
    }
  }, [activeDocument?.id]);

  // Keyboard shortcut listener: Cmd/Ctrl + S to trigger Version History / Save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        setShowVersionHistory(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getCurrentSnapshot = (): DocumentSnapshot => {
    return {
      name: activeDocument?.name || 'Document.pdf',
      pageCount: activeDocument?.pageCount || 1,
      pages: activeDocument?.pages || [],
      annotations,
      summary: summaryText || activeDocument?.summary,
      tags: activeDocument?.tags || [],
    };
  };

  const handleRestoreVersion = (restoredCheckpoint: DocumentVersion) => {
    setAnnotations([...restoredCheckpoint.snapshot.annotations]);
    setActiveVersionTag(restoredCheckpoint.versionNumber);
    setHasUnsavedChanges(false);

    if (activeDocument) {
      const updatedDoc: PdfDocument = {
        ...activeDocument,
        pages: restoredCheckpoint.snapshot.pages,
        summary: restoredCheckpoint.snapshot.summary || activeDocument.summary,
        name: restoredCheckpoint.snapshot.name || activeDocument.name,
      };
      if (onUpdateDocument) {
        onUpdateDocument(updatedDoc);
      }
      if (restoredCheckpoint.snapshot.summary && onUpdateDocumentSummary) {
        onUpdateDocumentSummary(activeDocument.id, restoredCheckpoint.snapshot.summary);
      }
    }

    setRestoredBannerMessage(
      `Successfully restored document to ${restoredCheckpoint.versionNumber}: "${restoredCheckpoint.name}"`
    );
    setTimeout(() => setRestoredBannerMessage(null), 6000);
  };

  const handleCollaborativeChangeCommitted = (newVersion: DocumentVersion, updatedSnapshot: DocumentSnapshot) => {
    setAnnotations([...updatedSnapshot.annotations]);
    setActiveVersionTag(newVersion.versionNumber);
    setHasUnsavedChanges(false);

    if (activeDocument) {
      const updatedDoc: PdfDocument = {
        ...activeDocument,
        pages: updatedSnapshot.pages,
        summary: updatedSnapshot.summary || activeDocument.summary,
      };
      if (onUpdateDocument) {
        onUpdateDocument(updatedDoc);
      }
    }

    setRestoredBannerMessage(`Collaborative update merged: "${newVersion.name}" by ${newVersion.author.name}`);
    setTimeout(() => setRestoredBannerMessage(null), 5000);
  };

  // Selection popup handler
  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      const text = selection.toString().trim();
      setSelectedText(text);
      
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setSelectionPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 40,
      });
    } else {
      setSelectedText('');
      setSelectionPosition(null);
    }
  };

  // Canvas Click for Sticky Notes / Stamps
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeTool === 'sticky' || activeTool === 'stamp') {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const newAnnotation: Annotation = {
        id: `ann-${Date.now()}`,
        pdfId: activeDocument?.id || '',
        pageNumber: currentPage,
        type: activeTool,
        color: activeColor,
        x,
        y,
        text: activeTool === 'stamp' ? 'APPROVED' : 'Review Section Notes',
        author: 'Alex Vance',
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setAnnotations((prev) => [...prev, newAnnotation]);
      setHasUnsavedChanges(true);
      setActiveTool('select');
    }
  };

  // Handle Freehand Pen Drawing
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeTool === 'pen') {
      setIsDrawing(true);
      const rect = e.currentTarget.getBoundingClientRect();
      setCurrentPenPath([{ x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDrawing && activeTool === 'pen') {
      const rect = e.currentTarget.getBoundingClientRect();
      setCurrentPenPath((prev) => [...prev, { x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    }
  };

  const handleMouseUp = () => {
    if (isDrawing && activeTool === 'pen' && currentPenPath.length > 1) {
      const newAnnotation: Annotation = {
        id: `ann-${Date.now()}`,
        pdfId: activeDocument?.id || '',
        pageNumber: currentPage,
        type: 'pen',
        color: activeColor,
        x: currentPenPath[0].x,
        y: currentPenPath[0].y,
        path: currentPenPath,
        author: 'Alex Vance',
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setAnnotations((prev) => [...prev, newAnnotation]);
      setHasUnsavedChanges(true);
    }
    setIsDrawing(false);
    setCurrentPenPath([]);
  };

  // Execute AI Chat Query
  const handleSendChatMessage = async (overridePrompt?: string) => {
    const prompt = overridePrompt || chatInput;
    if (!prompt.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    if (!overridePrompt) setChatInput('');
    setIsAiLoading(true);

    try {
      const pageText = activeDocument?.pages.find((p) => p.pageNumber === currentPage)?.text || '';
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: prompt,
          documentContext: `Document: ${activeDocument?.name}\nCurrent Page ${currentPage}:\n${pageText}`,
        }),
      });

      const data = await response.json();
      const aiMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: data.text || 'I analyzed the document section and found relevant references.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        pageRef: currentPage,
      };

      setChatMessages((prev) => [...prev, aiMsg]);
      if (typeof window !== 'undefined') {
        const currentCount = parseInt(localStorage.getItem('pdfak_ai_queries_count') || '0', 10);
        localStorage.setItem('pdfak_ai_queries_count', String(currentCount + 1));
      }
    } catch (err) {
      console.error(err);
      setChatMessages((prev) => [
        ...prev,
        {
          id: `msg-err-${Date.now()}`,
          role: 'assistant',
          content: 'Sorry, I encountered an issue reaching the Gemini AI engine.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Generate Executive Summary
  const handleGenerateSummary = async () => {
    if (!activeDocument) return;
    setIsSummarizing(true);
    try {
      const fullText = activeDocument.pages.map((p) => p.text).join('\n\n');
      const response = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: fullText,
          title: activeDocument.name,
        }),
      });
      const data = await response.json();
      setSummaryText(data.summary || 'Summary generated.');
      if (onUpdateDocumentSummary) {
        onUpdateDocumentSummary(activeDocument.id, data.summary);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSummarizing(false);
    }
  };

  // Generate Quiz & Flashcards
  const handleGenerateQuiz = async () => {
    if (!activeDocument) return;
    setIsGeneratingQuiz(true);
    try {
      const fullText = activeDocument.pages.map((p) => p.text).join('\n\n');
      const response = await fetch('/api/ai/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: fullText, numQuestions: 4 }),
      });
      const data = await response.json();
      setQuizQuestions(data.quiz || []);
      setFlashcards(data.flashcards || []);
      setActiveFlashcardIndex(0);
      setIsCardFlipped(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  // Generate Mind Map
  const handleGenerateMindMap = async () => {
    if (!activeDocument) return;
    setIsGeneratingMindMap(true);
    try {
      const fullText = activeDocument.pages.map((p) => p.text).join('\n\n');
      const response = await fetch('/api/ai/mindmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: fullText }),
      });
      const data = await response.json();
      setMindMapData(data.root || null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingMindMap(false);
    }
  };

  // Text-to-Speech Toggle
  const toggleSpeech = () => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      } else {
        const textToRead = activeDocument?.pages.find((p) => p.pageNumber === currentPage)?.text || '';
        const utterance = new SpeechSynthesisUtterance(textToRead);
        utterance.rate = speechRate;
        utterance.onend = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);
      }
    }
  };

  if (!activeDocument) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400 min-h-[calc(100vh-64px)] bg-[#030712] animate-fade-in">
        <div className="w-20 h-20 rounded-3xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mb-5 text-blue-400 shadow-xl shadow-blue-500/10">
          <FileText className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">PDF Studio is Ready</h2>
        <p className="text-xs text-gray-400 mt-2 max-w-md leading-relaxed">
          No document is currently open. Upload a PDF from your computer or paste text to start viewing, annotating with pens & stamps, chatting with Gemini AI, and tracking version history.
        </p>
        {onOpenUpload && (
          <button
            onClick={onOpenUpload}
            className="mt-6 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all hover:scale-105 active:scale-95 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Upload PDF Document</span>
          </button>
        )}
      </div>
    );
  }

  const currentPageObj = activeDocument.pages.find((p) => p.pageNumber === currentPage) || activeDocument.pages[0];

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-[#030712] overflow-hidden select-none">
      
      {/* TOOLBAR TOP HEADER */}
      <div className="h-14 px-4 bg-[#030712] border-b border-white/10 flex items-center justify-between z-20 flex-shrink-0">
        
        {/* Left Document Switcher & Toggle Drawer */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowLeftSidebar(!showLeftSidebar)}
            className={`p-2 rounded-xl transition-colors ${
              showLeftSidebar ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-gray-400 hover:text-white'
            }`}
            title="Toggle Thumbnails & Outline"
          >
            <Layers className="w-4 h-4" />
          </button>

          <select
            value={activeDocument.id}
            onChange={(e) => onSelectDocument(e.target.value)}
            className="bg-black/40 border border-white/10 text-xs font-bold text-white rounded-xl px-3 py-1.5 focus:outline-none focus:border-blue-500 max-w-xs truncate"
          >
            {documents.map((doc) => (
              <option key={doc.id} value={doc.id} className="bg-gray-900 text-white">
                {doc.name}
              </option>
            ))}
          </select>
        </div>

        {/* Center Canvas Tools (Annotation Palette) */}
        <div className="flex items-center space-x-1.5 bg-black/50 p-1 rounded-2xl border border-white/10">
          
          <button
            onClick={() => setActiveTool('select')}
            className={`p-2 rounded-xl text-xs font-medium transition-all ${
              activeTool === 'select' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
            title="Text Selection Mode"
          >
            <Type className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveTool('highlight')}
            className={`p-2 rounded-xl text-xs font-medium transition-all ${
              activeTool === 'highlight' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-gray-400 hover:text-white'
            }`}
            title="Highlight Text"
          >
            <Highlighter className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveTool('underline')}
            className={`p-2 rounded-xl text-xs font-medium transition-all ${
              activeTool === 'underline' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' : 'text-gray-400 hover:text-white'
            }`}
            title="Underline Text"
          >
            <Underline className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveTool('pen')}
            className={`p-2 rounded-xl text-xs font-medium transition-all ${
              activeTool === 'pen' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'text-gray-400 hover:text-white'
            }`}
            title="Freehand Drawing Pen"
          >
            <Pencil className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveTool('sticky')}
            className={`p-2 rounded-xl text-xs font-medium transition-all ${
              activeTool === 'sticky' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40' : 'text-gray-400 hover:text-white'
            }`}
            title="Drop Sticky Note"
          >
            <StickyNote className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveTool('stamp')}
            className={`p-2 rounded-xl text-xs font-medium transition-all ${
              activeTool === 'stamp' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-gray-400 hover:text-white'
            }`}
            title="Apply Digital Stamp"
          >
            <Stamp className="w-4 h-4" />
          </button>

          {/* Color Palette Picker */}
          <div className="flex items-center space-x-1 pl-2 border-l border-white/10">
            {['#FACC15', '#22C55E', '#EC4899', '#3B82F6', '#A855F7'].map((c) => (
              <button
                key={c}
                onClick={() => setActiveColor(c)}
                className={`w-4 h-4 rounded-full transition-transform ${
                  activeColor === c ? 'scale-125 ring-2 ring-white' : 'opacity-70 hover:opacity-100'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

        </div>

        {/* Right Page & Zoom Navigation Controls */}
        <div className="flex items-center space-x-3">
          
          {/* Page Navigation */}
          <div className="flex items-center space-x-1 bg-black/40 px-2 py-1 rounded-xl border border-white/10 text-xs text-gray-300">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1 hover:text-white disabled:opacity-30"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span>
              Page <strong className="text-white">{currentPage}</strong> / {activeDocument.pageCount}
            </span>
            <button
              disabled={currentPage >= activeDocument.pageCount}
              onClick={() => setCurrentPage((p) => Math.min(activeDocument!.pageCount, p + 1))}
              className="p-1 hover:text-white disabled:opacity-30"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center space-x-1 bg-black/40 px-2 py-1 rounded-xl border border-white/10 text-xs text-gray-300">
            <button onClick={() => setZoom((z) => Math.max(50, z - 10))} className="p-1 hover:text-white">
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="w-10 text-center font-mono">{zoom}%</span>
            <button onClick={() => setZoom((z) => Math.min(200, z + 10))} className="p-1 hover:text-white">
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Rotate */}
          <button
            onClick={() => setRotation((r) => (r + 90) % 360)}
            className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
            title="Rotate Page"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          {/* Night Reading Mode Toggle */}
          <button
            onClick={() => setIsNightMode(!isNightMode)}
            className={`p-2 rounded-xl transition-colors ${
              isNightMode ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30' : 'text-gray-400 hover:text-white'
            }`}
            title="Toggle Night Reading Canvas"
          >
            {isNightMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          {/* Save Version Checkpoint Button */}
          <button
            onClick={() => setShowVersionHistory(true)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-md ${
              hasUnsavedChanges
                ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/20 animate-pulse'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20'
            }`}
            title="Save manual version checkpoint (Ctrl+S / Cmd+S)"
          >
            <Save className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{hasUnsavedChanges ? 'Save *' : 'Save'}</span>
          </button>

          {/* Version History Toggle */}
          <button
            onClick={() => setShowVersionHistory(!showVersionHistory)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center space-x-1.5 transition-all ${
              showVersionHistory
                ? 'bg-blue-600/30 text-blue-300 border-blue-500/50 shadow-md'
                : 'bg-black/40 text-gray-300 border-white/10 hover:text-white hover:border-white/30'
            }`}
            title="Open Version History Panel"
          >
            <History className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden md:inline">History</span>
            <span className="px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-mono text-[10px]">
              {activeVersionTag}
            </span>
          </button>

          {/* Toggle AI Sidebar */}
          <button
            onClick={() => setShowRightSidebar(!showRightSidebar)}
            className={`p-2 rounded-xl transition-colors ${
              showRightSidebar ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30' : 'text-gray-400 hover:text-white'
            }`}
            title="Toggle Gemini AI Panel"
          >
            <Sparkles className="w-4 h-4" />
          </button>

        </div>

      </div>

      {/* MAIN CONTENT AREA (Left Drawer + Center Canvas + Right AI Sidebar) */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* LEFT DRAWER (Thumbnails / Bookmarks / Outline) */}
        {showLeftSidebar && (
          <div className="w-64 bg-[#030712] border-r border-white/10 flex flex-col flex-shrink-0 z-10">
            
            {/* Drawer Tabs */}
            <div className="flex border-b border-white/10 bg-black/40 text-xs">
              <button
                onClick={() => setLeftTab('thumbnails')}
                className={`flex-1 py-2.5 text-center font-medium transition-colors ${
                  leftTab === 'thumbnails' ? 'text-blue-400 border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'
                }`}
              >
                Pages ({activeDocument.pageCount})
              </button>
              <button
                onClick={() => setLeftTab('annotations')}
                className={`flex-1 py-2.5 text-center font-medium transition-colors ${
                  leftTab === 'annotations' ? 'text-blue-400 border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'
                }`}
              >
                Notes ({annotations.length})
              </button>
              <button
                onClick={() => setShowVersionHistory(true)}
                className={`flex-1 py-2.5 text-center font-medium transition-colors flex items-center justify-center space-x-1 ${
                  showVersionHistory ? 'text-blue-400 border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'
                }`}
                title="Open Version History Panel"
              >
                <History className="w-3 h-3 text-blue-400" />
                <span>History</span>
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 p-3 overflow-y-auto space-y-3">
              {leftTab === 'thumbnails' && (
                <div className="grid grid-cols-2 gap-2">
                  {activeDocument.pages.map((p) => (
                    <div
                      key={p.pageNumber}
                      onClick={() => setCurrentPage(p.pageNumber)}
                      className={`p-2 rounded-xl cursor-pointer border transition-all ${
                        currentPage === p.pageNumber
                          ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20'
                          : 'border-white/10 bg-white/5 hover:border-white/30'
                      }`}
                    >
                      <div className="w-full h-24 bg-black/60 rounded-lg p-2 text-[8px] font-mono text-gray-400 overflow-hidden leading-tight">
                        {p.text.substring(0, 100)}...
                      </div>
                      <span className="block text-[10px] font-bold text-center text-gray-300 mt-1.5">
                        Page {p.pageNumber}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {leftTab === 'annotations' && (
                <div className="space-y-2">
                  {annotations.length > 0 ? (
                    annotations.map((ann) => (
                      <div key={ann.id} className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs space-y-1">
                        <div className="flex justify-between items-center text-[10px] text-gray-400">
                          <span className="font-bold text-amber-300 uppercase">{ann.type}</span>
                          <span>Page {ann.pageNumber} • {ann.createdAt}</span>
                        </div>
                        <p className="text-gray-200 font-medium">{ann.text || 'Drawing / Highlight'}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-xs text-gray-500">
                      No annotations added yet. Use toolbar tools above to highlight or add notes.
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        )}

        {/* CENTER VIEWPORT (PDF Page Canvas Render) */}
        <div 
          className="flex-1 bg-black/60 p-8 overflow-auto flex items-start justify-center relative cursor-crosshair"
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* FLOATING RESTORE NOTIFICATION BANNER */}
          {restoredBannerMessage && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 px-5 py-2.5 rounded-2xl bg-emerald-950/95 border border-emerald-500/50 text-emerald-200 text-xs font-bold shadow-2xl flex items-center space-x-2.5 animate-fade-in backdrop-blur-md">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 animate-pulse" />
              <span>{restoredBannerMessage}</span>
              <button
                onClick={() => setRestoredBannerMessage(null)}
                className="ml-2 p-1 hover:text-white text-emerald-400/80 rounded-md hover:bg-white/10"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          
          {/* FLOATING TEXT SELECTION AI MENU */}
          {selectedText && selectionPosition && (
            <div
              style={{ top: selectionPosition.y, left: selectionPosition.x }}
              className="fixed -translate-x-1/2 z-50 glass-card rounded-2xl border border-white/20 p-1.5 shadow-2xl flex items-center space-x-1 animate-fade-in"
            >
              <button
                onClick={() => {
                  setRightTab('chat');
                  handleSendChatMessage(`Explain the following selected paragraph:\n"${selectedText}"`);
                  setSelectedText('');
                }}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center space-x-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Explain</span>
              </button>

              <button
                onClick={() => {
                  setRightTab('chat');
                  handleSendChatMessage(`Summarize this key selection:\n"${selectedText}"`);
                  setSelectedText('');
                }}
                className="px-3 py-1.5 rounded-xl hover:bg-white/10 text-gray-200 text-xs font-semibold flex items-center space-x-1.5"
              >
                <BrainCircuit className="w-3.5 h-3.5 text-purple-400" />
                <span>Summarize</span>
              </button>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(selectedText);
                  setSelectedText('');
                }}
                className="px-2.5 py-1.5 rounded-xl hover:bg-white/10 text-gray-300 text-xs font-semibold"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* PAGE DISPLAY PAPER CANVAS */}
          <div
            style={{
              transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
              transformOrigin: 'top center',
            }}
            onMouseUp={handleTextSelection}
            onClick={handleCanvasClick}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            className={`w-full max-w-3xl min-h-[900px] p-12 rounded-2xl shadow-2xl transition-transform duration-200 relative border ${
              isNightMode 
                ? 'bg-[#0b1120] text-gray-100 border-white/10 shadow-blue-900/10' 
                : 'bg-white text-gray-900 border-gray-200'
            }`}
          >
            {/* Page Header Stamp */}
            <div className="flex justify-between items-center pb-6 border-b border-white/10 mb-8 text-xs font-mono opacity-60">
              <span>{activeDocument.name}</span>
              <span>Page {currentPage} of {activeDocument.pageCount}</span>
            </div>

            {/* Page Main Text Content */}
            <div className="text-sm leading-relaxed whitespace-pre-wrap font-serif select-text">
              {currentPageObj.text}
            </div>

            {/* ANNOTATIONS OVERLAY LAYER */}
            {annotations
              .filter((ann) => ann.pageNumber === currentPage)
              .map((ann) => {
                if (ann.type === 'sticky') {
                  return (
                    <div
                      key={ann.id}
                      style={{ top: ann.y, left: ann.x }}
                      className="absolute p-3 rounded-xl bg-amber-400 text-gray-900 text-xs font-bold shadow-xl max-w-xs border border-amber-300 animate-bounce"
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
                if (ann.type === 'pen' && ann.path) {
                  return (
                    <svg key={ann.id} className="absolute inset-0 w-full h-full pointer-events-none">
                      <polyline
                        fill="none"
                        stroke={ann.color}
                        strokeWidth="3"
                        strokeLinecap="round"
                        points={ann.path.map((p) => `${p.x},${p.y}`).join(' ')}
                      />
                    </svg>
                  );
                }
                return null;
              })}

            {/* Active Drawing SVG Line */}
            {isDrawing && currentPenPath.length > 1 && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <polyline
                  fill="none"
                  stroke={activeColor}
                  strokeWidth="3"
                  strokeLinecap="round"
                  points={currentPenPath.map((p) => `${p.x},${p.y}`).join(' ')}
                />
              </svg>
            )}

            {/* Page Footer */}
            <div className="absolute bottom-6 left-12 right-12 flex justify-between items-center text-[10px] text-gray-500 border-t border-white/5 pt-4">
              <span>Confidential • PDFAK Workspace</span>
              <span>Rendered with Gemini 3.6 Multimodal Vision</span>
            </div>

          </div>

        </div>

        {/* RIGHT AI ASSISTANT PANEL */}
        {showRightSidebar && (
          <div className="w-96 bg-[#030712] border-l border-white/10 flex flex-col flex-shrink-0 z-10">
            
            {/* AI Panel Tabs */}
            <div className="flex border-b border-white/10 bg-black/60 p-1 space-x-1 text-[11px] font-semibold overflow-x-auto">
              <button
                onClick={() => setRightTab('chat')}
                className={`flex-1 py-2 px-2.5 rounded-xl transition-all flex items-center justify-center space-x-1 ${
                  rightTab === 'chat' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Chat</span>
              </button>

              <button
                onClick={() => {
                  setRightTab('summary');
                  if (!summaryText) handleGenerateSummary();
                }}
                className={`flex-1 py-2 px-2.5 rounded-xl transition-all flex items-center justify-center space-x-1 ${
                  rightTab === 'summary' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
                }`}
              >
                <BrainCircuit className="w-3.5 h-3.5 text-purple-400" />
                <span>Summary</span>
              </button>

              <button
                onClick={() => {
                  setRightTab('quiz');
                  if (quizQuestions.length === 0) handleGenerateQuiz();
                }}
                className={`flex-1 py-2 px-2.5 rounded-xl transition-all flex items-center justify-center space-x-1 ${
                  rightTab === 'quiz' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Layers3 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Quiz</span>
              </button>

              <button
                onClick={() => {
                  setRightTab('mindmap');
                  if (!mindMapData) handleGenerateMindMap();
                }}
                className={`flex-1 py-2 px-2.5 rounded-xl transition-all flex items-center justify-center space-x-1 ${
                  rightTab === 'mindmap' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span>Map</span>
              </button>

              <button
                onClick={() => setRightTab('audio')}
                className={`flex-1 py-2 px-2.5 rounded-xl transition-all flex items-center justify-center space-x-1 ${
                  rightTab === 'audio' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Voice</span>
              </button>
            </div>

            {/* TAB 1: AI CHAT */}
            {rightTab === 'chat' && (
              <div className="flex-1 flex flex-col justify-between overflow-hidden">
                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-3 rounded-2xl text-xs space-y-1 ${
                        msg.role === 'user'
                          ? 'bg-blue-600/30 border border-blue-500/30 text-white ml-6'
                          : 'bg-white/5 border border-white/10 text-gray-200 mr-4'
                      }`}
                    >
                      <div className="flex justify-between items-center text-[10px] text-gray-400">
                        <span className="font-bold flex items-center space-x-1">
                          {msg.role === 'assistant' && <Sparkles className="w-3 h-3 text-amber-400" />}
                          <span>{msg.role === 'user' ? 'You' : 'PDFAK AI'}</span>
                        </span>
                        <span>{msg.timestamp}</span>
                      </div>
                      <div className="leading-relaxed whitespace-pre-wrap">{msg.content}</div>
                      {msg.pageRef && (
                        <div className="pt-1 text-[10px] text-blue-300 font-semibold flex items-center space-x-1">
                          <FileText className="w-3 h-3" />
                          <span>Referenced Page {msg.pageRef}</span>
                        </div>
                      )}
                    </div>
                  ))}
                  {isAiLoading && (
                    <div className="p-3 rounded-2xl bg-white/5 text-xs text-gray-400 flex items-center space-x-2">
                      <span className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      <span>Gemini AI is analyzing document context...</span>
                    </div>
                  )}
                </div>

                {/* Chat Input */}
                <div className="p-3 bg-black/60 border-t border-white/10">
                  <div className="relative">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()}
                      placeholder="Ask anything about this document..."
                      className="w-full pl-3 pr-10 py-2.5 rounded-xl glass-input text-xs"
                    />
                    <button
                      onClick={() => handleSendChatMessage()}
                      className="absolute right-2 top-2 p-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: AI SUMMARY */}
            {rightTab === 'summary' && (
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-white/10">
                  <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                    <BrainCircuit className="w-4 h-4 text-purple-400" />
                    <span>Executive Document Summary</span>
                  </span>
                  <button
                    onClick={handleGenerateSummary}
                    disabled={isSummarizing}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSummarizing ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {summaryText ? (
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-200 leading-relaxed space-y-3 whitespace-pre-wrap">
                    {summaryText}
                  </div>
                ) : (
                  <div className="text-center py-12 text-xs text-gray-400">
                    Click refresh to generate executive summary.
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: QUIZ & FLASHCARDS */}
            {rightTab === 'quiz' && (
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-white/10">
                  <span className="text-xs font-bold text-white">Study Flashcards & Quiz</span>
                  <button
                    onClick={handleGenerateQuiz}
                    disabled={isGeneratingQuiz}
                    className="px-2.5 py-1 rounded-lg bg-blue-600 text-white text-[11px] font-semibold"
                  >
                    {isGeneratingQuiz ? 'Generating...' : 'Regenerate'}
                  </button>
                </div>

                {/* Flashcard Component */}
                {flashcards.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-[11px] font-bold text-gray-300 uppercase tracking-wider">
                      Flashcard {activeFlashcardIndex + 1} of {flashcards.length}
                    </p>
                    <div
                      onClick={() => setIsCardFlipped(!isCardFlipped)}
                      className="h-44 p-6 rounded-2xl glass-card border border-white/15 flex flex-col justify-between items-center text-center cursor-pointer transition-all hover:scale-[1.02] bg-gradient-to-br from-blue-950/40 to-purple-950/40"
                    >
                      <span className="text-[10px] uppercase font-bold text-blue-400">
                        {isCardFlipped ? 'Answer Side' : 'Question Side (Click to Flip)'}
                      </span>
                      <p className="text-xs font-bold text-white leading-relaxed">
                        {isCardFlipped ? flashcards[activeFlashcardIndex].back : flashcards[activeFlashcardIndex].front}
                      </p>
                      <span className="text-[10px] text-gray-400">Tap card to flip</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <button
                        disabled={activeFlashcardIndex <= 0}
                        onClick={() => { setActiveFlashcardIndex((i) => i - 1); setIsCardFlipped(false); }}
                        className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-gray-300 disabled:opacity-30"
                      >
                        Previous Card
                      </button>
                      <button
                        disabled={activeFlashcardIndex >= flashcards.length - 1}
                        onClick={() => { setActiveFlashcardIndex((i) => i + 1); setIsCardFlipped(false); }}
                        className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold disabled:opacity-30"
                      >
                        Next Card
                      </button>
                    </div>
                  </div>
                )}

                {/* Multiple Choice Quiz */}
                {quizQuestions.length > 0 && (
                  <div className="space-y-4 pt-4 border-t border-white/10">
                    <p className="text-[11px] font-bold text-white uppercase tracking-wider">Self-Test Assessment</p>
                    {quizQuestions.map((q, idx) => (
                      <div key={q.id} className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs space-y-2">
                        <p className="font-bold text-gray-200">{idx + 1}. {q.question}</p>
                        <div className="space-y-1.5">
                          {q.options.map((opt, optIdx) => {
                            const isSelected = quizAnswers[q.id] === optIdx;
                            const isCorrect = optIdx === q.correctIndex;
                            return (
                              <button
                                key={optIdx}
                                onClick={() => {
                                  setQuizAnswers((prev) => ({ ...prev, [q.id]: optIdx }));
                                  if (optIdx === q.correctIndex) {
                                    confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 } });
                                  }
                                }}
                                className={`w-full p-2 rounded-lg text-left text-xs transition-all ${
                                  isSelected
                                    ? isCorrect
                                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                      : 'bg-red-500/20 text-red-300 border border-red-500/40'
                                    : 'bg-black/30 hover:bg-white/10 text-gray-300'
                                }`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: MIND MAP */}
            {rightTab === 'mindmap' && (
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-white/10">
                  <span className="text-xs font-bold text-white">Hierarchical Concept Mind Map</span>
                  <button
                    onClick={handleGenerateMindMap}
                    disabled={isGeneratingMindMap}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingMindMap ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {mindMapData ? (
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3 text-xs">
                    <div className="p-3 rounded-xl bg-blue-600 text-white font-bold text-center shadow-lg">
                      {mindMapData.label}
                    </div>
                    {mindMapData.children?.map((child) => (
                      <div key={child.id} className="pl-4 border-l-2 border-blue-500/40 space-y-2">
                        <div className="p-2.5 rounded-lg bg-purple-900/30 border border-purple-500/30 text-purple-200 font-bold">
                          {child.label}
                        </div>
                        {child.children?.map((grandchild) => (
                          <div key={grandchild.id} className="pl-3 border-l-2 border-purple-500/30">
                            <div className="p-2 rounded bg-black/40 text-gray-300 text-[11px]">
                              • {grandchild.label}
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-xs text-gray-400">
                    Click refresh to construct mind map.
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: VOICE READER */}
            {rightTab === 'audio' && (
              <div className="flex-1 p-6 flex flex-col items-center justify-center text-center space-y-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 p-1 shadow-2xl shadow-blue-500/30">
                  <div className="w-full h-full bg-[#030712] rounded-full flex items-center justify-center">
                    {isSpeaking ? (
                      <Volume2 className="w-8 h-8 text-amber-400 animate-pulse" />
                    ) : (
                      <VolumeX className="w-8 h-8 text-gray-500" />
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white">Neural Voice Reading Engine</h3>
                  <p className="text-xs text-gray-400 mt-1">Reading Page {currentPage} text aloud</p>
                </div>

                <div className="flex items-center space-x-4">
                  <button
                    onClick={toggleSpeech}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-500/30 transition-all flex items-center space-x-2"
                  >
                    {isSpeaking ? (
                      <>
                        <Pause className="w-4 h-4" />
                        <span>Pause Audio</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-white" />
                        <span>Start Reading</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Speed Controls */}
                <div className="w-full max-w-xs space-y-2">
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Reading Speed</span>
                    <span className="font-mono text-white">{speechRate}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.75"
                    max="2.0"
                    step="0.25"
                    value={speechRate}
                    onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                </div>
              </div>
            )}

          </div>
        )}

      </div>

      {/* VERSION HISTORY SLIDE-OVER PANEL */}
      {activeDocument && (
        <VersionHistoryPanel
          isOpen={showVersionHistory}
          onClose={() => setShowVersionHistory(false)}
          document={activeDocument}
          currentSnapshot={getCurrentSnapshot()}
          onRestoreVersion={handleRestoreVersion}
          onManualSaveCommitted={(v) => {
            setActiveVersionTag(v.versionNumber);
            setHasUnsavedChanges(false);
            setRestoredBannerMessage(`Saved new checkpoint ${v.versionNumber}: "${v.name}"`);
            setTimeout(() => setRestoredBannerMessage(null), 4000);
          }}
          onCollaborativeChangeCommitted={handleCollaborativeChangeCommitted}
        />
      )}

    </div>
  );
};

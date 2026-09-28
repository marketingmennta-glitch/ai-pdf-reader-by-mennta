import React, { useState } from 'react';
import { ViewMode, PdfDocument, Folder, UserProfile } from './types/pdfak';
import { SAMPLE_PDFS, INITIAL_FOLDERS } from './data/samplePdfs';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { PDFStudio } from './components/PDFStudio';
import { OCRStudio } from './components/OCRStudio';
import { PDFToolsStudio } from './components/PDFToolsStudio';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { AIAssistantStudio } from './components/AIAssistantStudio';
import { CollaborationWorkspace } from './components/CollaborationWorkspace';
import { SettingsModal } from './components/SettingsModal';
import { AuthModal } from './components/AuthModal';
import { UploadModal } from './components/UploadModal';

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('landing');
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Default true for instant full app preview
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Core Data State starting strictly from 0 (empty)
  const [documents, setDocuments] = useState<PdfDocument[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('pdfak_user_docs');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });

  const [folders, setFolders] = useState<Folder[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('pdfak_user_folders');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });

  const [activePdfId, setActivePdfId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('pdfak_user_docs');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.length > 0) return parsed[0].id;
        }
      } catch (e) {}
    }
    return '';
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

  // Sync to local storage
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('pdfak_user_docs', JSON.stringify(documents));
    }
  }, [documents]);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('pdfak_user_folders', JSON.stringify(folders));
    }
  }, [folders]);

  // User State
  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: 'usr-1',
    name: 'Dr. Alex Vance',
    email: 'alex.vance@enterprise.com',
    avatar: '',
    role: 'Senior Principal Researcher',
    plan: 'Pro Studio',
    storageUsedMB: Number(calculatedStorageMB.toFixed(2)),
    storageLimitMB: 10240,
    twoFactorEnabled: true,
    theme: 'dark',
    apiConnected: true,
  });

  // Modal Control States
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authType, setAuthType] = useState<'login' | 'signup'>('login');
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const activePdf = documents.find((doc) => doc.id === activePdfId) || documents[0] || null;

  // Handlers
  const handleOpenAuth = (type: 'login' | 'signup') => {
    setAuthType(type);
    setIsAuthOpen(true);
  };

  const handleLoginSuccess = (user: { name: string; email: string }) => {
    setUserProfile((prev) => ({
      ...prev,
      name: user.name,
      email: user.email,
    }));
    setIsLoggedIn(true);
    setViewMode('dashboard');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setViewMode('landing');
  };

  const handleDocumentUploaded = (newDoc: PdfDocument) => {
    setDocuments((prev) => [newDoc, ...prev]);
    setActivePdfId(newDoc.id);
    setViewMode('studio');
  };

  const handleDeleteDocument = (docId: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
    if (activePdfId === docId) {
      const remaining = documents.filter((d) => d.id !== docId);
      if (remaining.length > 0) setActivePdfId(remaining[0].id);
    }
  };

  const handleToggleFavorite = (docId: string) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === docId ? { ...d, isFavorite: !d.isFavorite } : d))
    );
  };

  const handleUpdateSummary = (docId: string, newSummary: string) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === docId ? { ...d, summary: newSummary } : d))
    );
  };

  const handleUpdateDocument = (updatedDoc: PdfDocument) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === updatedDoc.id ? updatedDoc : d))
    );
  };

  const handleCreateFolder = (name: string, color?: string) => {
    const colors = ['#2563EB', '#7C3AED', '#10B981', '#F59E0B', '#EC4899', '#06B6D4'];
    const newFolder: Folder = {
      id: `f-${Date.now()}`,
      name: name.trim() || 'New Folder',
      color: color || colors[folders.length % colors.length],
      docCount: 0,
    };
    setFolders((prev) => [...prev, newFolder]);
  };

  return (
    <div className="min-h-screen bg-[#030712] text-gray-100 flex flex-col font-sans selection:bg-blue-600/40">
      
      {/* LANDING PAGE VIEW */}
      {viewMode === 'landing' ? (
        <>
          <Navbar
            viewMode={viewMode}
            setViewMode={setViewMode}
            onOpenAuth={handleOpenAuth}
            isLoggedIn={isLoggedIn}
            userName={userProfile.name}
          />
          <LandingPage
            setViewMode={setViewMode}
            onOpenAuth={handleOpenAuth}
            onSelectSamplePdf={(pdfId) => {
              setActivePdfId(pdfId);
              setViewMode('studio');
            }}
          />
        </>
      ) : (
        /* WORKSPACE & DASHBOARD LAYOUT */
        <div className="flex h-screen overflow-hidden">
          
          {/* Left Sidebar */}
          <Sidebar
            currentView={viewMode}
            setViewMode={setViewMode}
            isCollapsed={isSidebarCollapsed}
            setIsCollapsed={setIsSidebarCollapsed}
            docCount={documents.length}
            userName={userProfile.name}
            userPlan={userProfile.plan}
            onLogout={handleLogout}
            onOpenUpload={() => setIsUploadOpen(true)}
          />

          {/* Main Content Viewport */}
          <div
            className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
              isSidebarCollapsed ? 'ml-20' : 'ml-64'
            }`}
          >
            {/* Top Navigation Header */}
            <TopHeader
              documents={documents}
              onSelectDocument={(id) => setActivePdfId(id)}
              onOpenUpload={() => setIsUploadOpen(true)}
              setViewMode={setViewMode}
              userName={userProfile.name}
              userEmail={userProfile.email}
            />

            {/* Active Sub-View Body */}
            <main className="flex-1 overflow-y-auto bg-[#030712]">
              {(viewMode === 'dashboard' || viewMode === 'my-pdfs' || viewMode === 'analytics') && (
                <AnalyticsDashboard
                  documents={documents}
                  folders={folders}
                  onSelectDocument={(id) => setActivePdfId(id)}
                  onOpenUpload={() => setIsUploadOpen(true)}
                  setViewMode={setViewMode}
                  onDeleteDocument={handleDeleteDocument}
                  onToggleFavorite={handleToggleFavorite}
                  onCreateFolder={handleCreateFolder}
                />
              )}

              {viewMode === 'studio' && (
                <PDFStudio
                  documents={documents}
                  activeDocument={activePdf}
                  onSelectDocument={(id) => setActivePdfId(id)}
                  onUpdateDocumentSummary={handleUpdateSummary}
                  onUpdateDocument={handleUpdateDocument}
                  onOpenUpload={() => setIsUploadOpen(true)}
                />
              )}

              {viewMode === 'ocr' && <OCRStudio />}

              {viewMode === 'tools' && <PDFToolsStudio />}

              {viewMode === 'ai-assistant' && (
                <AIAssistantStudio documents={documents} activeDocument={activePdf} />
              )}

              {viewMode === 'collab' && <CollaborationWorkspace />}

              {viewMode === 'settings' && (
                <SettingsModal
                  user={userProfile}
                  onUpdateUser={(updated) => setUserProfile((prev) => ({ ...prev, ...updated }))}
                />
              )}
            </main>

          </div>

        </div>
      )}

      {/* GLOBAL MODALS */}
      <AuthModal
        isOpen={isAuthOpen}
        initialType={authType}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onDocumentUploaded={handleDocumentUploaded}
      />

    </div>
  );
}

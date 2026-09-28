export type ViewMode = 
  | 'landing' 
  | 'dashboard' 
  | 'my-pdfs' 
  | 'studio' 
  | 'ai-assistant' 
  | 'ocr' 
  | 'tools' 
  | 'collab' 
  | 'analytics' 
  | 'settings';

export type AnnotationType = 'highlight' | 'underline' | 'pen' | 'sticky' | 'textbox' | 'stamp';

export interface Point {
  x: number;
  y: number;
}

export interface Annotation {
  id: string;
  pdfId: string;
  pageNumber: number;
  type: AnnotationType;
  color: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  path?: Point[]; // For freehand draw
  text?: string;
  author: string;
  createdAt: string;
}

export interface PdfPage {
  pageNumber: number;
  text: string;
  thumbnailUrl?: string;
}

export interface VersionAuthor {
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  isCurrentUser?: boolean;
}

export interface VersionChangeSummary {
  description: string;
  annotationsAdded?: number;
  annotationsRemoved?: number;
  pagesModified?: number[];
  textChangesCount?: number;
  summaryChanged?: boolean;
}

export interface DocumentSnapshot {
  name: string;
  pageCount: number;
  pages: PdfPage[];
  annotations: Annotation[];
  summary?: string;
  tags?: string[];
}

export type VersionType = 'manual' | 'collaborative' | 'auto' | 'restored';

export interface DocumentVersion {
  id: string;
  pdfId: string;
  versionNumber: string;
  name: string;
  description?: string;
  type: VersionType;
  author: VersionAuthor;
  createdAt: string;
  isMilestone?: boolean;
  isCurrent: boolean;
  changeSummary: VersionChangeSummary;
  snapshot: DocumentSnapshot;
}

export interface PdfDocument {
  id: string;
  name: string;
  size: string;
  pageCount: number;
  uploadDate: string;
  lastOpened?: string;
  category: 'Research' | 'Security' | 'Finance' | 'Legal' | 'Personal';
  tags: string[];
  isFavorite: boolean;
  isRecent: boolean;
  isTrash?: boolean;
  folderId?: string;
  fileUrl?: string;
  base64Data?: string;
  summary?: string;
  pages: PdfPage[];
  annotationsCount?: number;
  currentVersionId?: string;
  versionCount?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  pageRef?: number;
  citations?: { title: string; page: number; snippet: string }[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  category?: string;
}

export interface MindMapNode {
  id: string;
  label: string;
  description?: string;
  children?: MindMapNode[];
}

export interface Folder {
  id: string;
  name: string;
  color: string;
  docCount: number;
}

export interface OCRItem {
  id: string;
  title: string;
  imageUrl: string;
  extractedText: string;
  date: string;
  language: string;
}

export interface DocumentComment {
  id: string;
  pdfId: string;
  pageNumber: number;
  author: string;
  authorAvatar: string;
  text: string;
  timestamp: string;
  resolved: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  plan: 'Free' | 'Pro' | 'Enterprise';
  storageUsedMB: number;
  storageLimitMB: number;
  twoFactorEnabled: boolean;
  theme: 'dark' | 'light' | 'system';
  apiConnected: boolean;
}

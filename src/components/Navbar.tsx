import React from 'react';
import { FileText, Sparkles, LogIn, UserPlus, Shield, Zap, Search, LayoutDashboard } from 'lucide-react';
import { ViewMode } from '../types/pdfak';

interface NavbarProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  onOpenAuth: (type: 'login' | 'signup') => void;
  isLoggedIn: boolean;
  userName?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  viewMode,
  setViewMode,
  onOpenAuth,
  isLoggedIn,
  userName,
}) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#030712]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => setViewMode(isLoggedIn ? 'dashboard' : 'landing')}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 p-0.5 shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full bg-[#030712] rounded-[10px] flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-400 group-hover:text-blue-300 transition-colors" />
            </div>
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-blue-100 to-indigo-300 bg-clip-text text-transparent">
              PDFAK
            </span>
            <span className="ml-2 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              AI v3.5
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
          <button
            onClick={() => setViewMode(isLoggedIn ? 'dashboard' : 'landing')}
            className={`transition-colors hover:text-blue-400 ${
              viewMode === 'landing' ? 'text-blue-400 font-semibold' : 'text-gray-300'
            }`}
          >
            Overview
          </button>
          
          <button
            onClick={() => setViewMode('studio')}
            className={`flex items-center space-x-1.5 transition-colors hover:text-blue-400 ${
              viewMode === 'studio' ? 'text-blue-400 font-semibold' : 'text-gray-300'
            }`}
          >
            <span>PDF Studio</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          </button>

          <button
            onClick={() => setViewMode('ocr')}
            className={`transition-colors hover:text-blue-400 ${
              viewMode === 'ocr' ? 'text-blue-400 font-semibold' : 'text-gray-300'
            }`}
          >
            OCR Vision
          </button>

          <button
            onClick={() => setViewMode('tools')}
            className={`transition-colors hover:text-blue-400 ${
              viewMode === 'tools' ? 'text-blue-400 font-semibold' : 'text-gray-300'
            }`}
          >
            PDF Tools
          </button>
        </nav>

        {/* Right CTA / User Controls */}
        <div className="flex items-center space-x-3">
          {isLoggedIn ? (
            <button
              onClick={() => setViewMode('dashboard')}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-300 hover:bg-blue-600/30 transition-all font-medium text-sm shadow-sm"
            >
              <LayoutDashboard className="w-4 h-4 text-blue-400" />
              <span>Dashboard ({userName || 'User'})</span>
            </button>
          ) : (
            <>
              <button
                onClick={() => onOpenAuth('login')}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition-all text-sm font-medium"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </button>
              
              <button
                onClick={() => onOpenAuth('signup')}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white text-sm font-semibold shadow-lg shadow-blue-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <UserPlus className="w-4 h-4" />
                <span>Get Started Free</span>
              </button>
            </>
          )}
        </div>

      </div>
    </header>
  );
};

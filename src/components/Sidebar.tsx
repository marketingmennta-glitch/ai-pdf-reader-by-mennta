import React from 'react';
import { 
  LayoutDashboard, FolderKanban, Sparkles, Eye, Wrench, Users, BarChart3, Settings, 
  ChevronLeft, FileText, Upload, Plus, LogOut, ShieldCheck
} from 'lucide-react';
import { ViewMode } from '../types/pdfak';

interface SidebarProps {
  currentView: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  docCount: number;
  userName?: string;
  userPlan?: string;
  onLogout: () => void;
  onOpenUpload: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  setViewMode,
  isCollapsed,
  setIsCollapsed,
  docCount,
  userName = 'Alex Vance',
  userPlan = 'Pro Studio',
  onLogout,
  onOpenUpload,
}) => {
  const menuItems = [
    { id: 'dashboard' as ViewMode, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'my-pdfs' as ViewMode, label: 'My Documents', icon: FolderKanban, badge: docCount },
    { id: 'studio' as ViewMode, label: 'PDF Studio', icon: Sparkles, highlight: true },
    { id: 'ai-assistant' as ViewMode, label: 'AI Assistant', icon: Sparkles },
    { id: 'ocr' as ViewMode, label: 'OCR Vision', icon: Eye },
    { id: 'tools' as ViewMode, label: 'PDF Tools', icon: Wrench },
    { id: 'collab' as ViewMode, label: 'Team Workspace', icon: Users },
    { id: 'analytics' as ViewMode, label: 'Usage Analytics', icon: BarChart3 },
    { id: 'settings' as ViewMode, label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-40 bg-[#030712]/90 backdrop-blur-xl border-r border-white/10 transition-all duration-300 flex flex-col justify-between ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Header */}
      <div>
        <div className="h-16 px-4 border-b border-white/10 flex items-center justify-between">
          {!isCollapsed && (
            <div 
              onClick={() => setViewMode('dashboard')}
              className="flex items-center space-x-2.5 cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 p-0.5 shadow-md shadow-blue-500/20">
                <div className="w-full h-full bg-[#030712] rounded-[10px] flex items-center justify-center">
                  <FileText className="w-4 h-4 text-blue-400" />
                </div>
              </div>
              <span className="text-lg font-extrabold text-white tracking-tight">PDFAK</span>
            </div>
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors mx-auto"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <ChevronLeft className={`w-5 h-5 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Quick Upload CTA */}
        <div className="p-3">
          <button
            onClick={onOpenUpload}
            className={`w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center space-x-2 ${
              isCollapsed ? 'p-2.5' : 'px-4'
            }`}
          >
            <Plus className="w-4 h-4" />
            {!isCollapsed && <span>Upload Document</span>}
          </button>
        </div>

        {/* Navigation Menu Links */}
        <nav className="px-2 py-2 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setViewMode(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-amber-400' : 'text-gray-400'}`} />
                  {!isCollapsed && <span>{item.label}</span>}
                </div>

                {!isCollapsed && item.badge !== undefined && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-gray-300">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Profile Footer */}
      <div className="p-3 border-t border-white/10 bg-black/40">
        {!isCollapsed ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs shadow-sm flex-shrink-0">
                {userName.charAt(0)}
              </div>
              <div className="overflow-hidden text-left">
                <p className="text-xs font-bold text-white truncate">{userName}</p>
                <p className="text-[10px] text-blue-400 font-semibold flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3 inline" />
                  <span>{userPlan}</span>
                </p>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="p-1.5 text-gray-400 hover:text-red-400 rounded-lg hover:bg-white/5 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={onLogout}
            className="w-full p-2 text-gray-400 hover:text-red-400 rounded-lg hover:bg-white/5 transition-colors flex justify-center"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>

    </aside>
  );
};

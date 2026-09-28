import React, { useState } from 'react';
import { Sparkles, BrainCircuit, MessageSquare, Globe, Layers3, Send, RefreshCw, Copy, Check } from 'lucide-react';
import { PdfDocument, ChatMessage } from '../types/pdfak';

interface AIAssistantStudioProps {
  documents: PdfDocument[];
  activeDocument: PdfDocument | null;
}

export const AIAssistantStudio: React.FC<AIAssistantStudioProps> = ({
  documents,
  activeDocument,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'chat' | 'translate' | 'summary'>('chat');
  const [queryInput, setQueryInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      role: 'assistant',
      content: 'Welcome to the Central Gemini AI Hub. Ask questions across your entire PDF library or select a specific document context below.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  // Translation State
  const [transInput, setTransInput] = useState('');
  const [targetLang, setTargetLang] = useState('Spanish');
  const [transResult, setTransResult] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);

  const handleSendQuery = async () => {
    if (!queryInput.trim()) return;

    const userMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      role: 'user',
      content: queryInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setQueryInput('');
    setIsLoading(true);

    try {
      const docContext = documents.map((d) => `Document: ${d.name}\n${d.summary}`).join('\n\n');
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: queryInput,
          documentContext: docContext,
        }),
      });

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        {
          id: `m-${Date.now() + 1}`,
          role: 'assistant',
          content: data.text || 'Analyzed cross-document database.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      if (typeof window !== 'undefined') {
        const currentCount = parseInt(localStorage.getItem('pdfak_ai_queries_count') || '0', 10);
        localStorage.setItem('pdfak_ai_queries_count', String(currentCount + 1));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTranslate = async () => {
    if (!transInput.trim()) return;
    setIsTranslating(true);
    try {
      const response = await fetch('/api/ai/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: transInput, targetLanguage: targetLang }),
      });
      const data = await response.json();
      setTransResult(data.translatedText || 'Translation complete.');
    } catch (err) {
      console.error(err);
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex justify-between items-center pb-6 border-b border-white/10">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Gemini AI Assistant Hub</h1>
          <p className="text-sm text-gray-400 mt-1">Cross-document reasoning, intelligent translations, and automated research synthesis.</p>
        </div>

        {/* Subtab Selector */}
        <div className="flex rounded-xl bg-black/60 p-1 border border-white/10 text-xs">
          <button
            onClick={() => setActiveSubTab('chat')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              activeSubTab === 'chat' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Multi-Doc Chat
          </button>
          <button
            onClick={() => setActiveSubTab('translate')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              activeSubTab === 'translate' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            AI Translation
          </button>
        </div>
      </div>

      {/* CHAT TAB */}
      {activeSubTab === 'chat' && (
        <div className="rounded-2xl glass-card border border-white/10 flex flex-col h-[560px] bg-black/40 overflow-hidden">
          
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`p-4 rounded-2xl text-xs space-y-1 max-w-2xl ${
                  msg.role === 'user'
                    ? 'bg-blue-600/30 border border-blue-500/30 text-white ml-auto'
                    : 'bg-white/5 border border-white/10 text-gray-200'
                }`}
              >
                <div className="flex justify-between items-center text-[10px] text-gray-400 mb-1">
                  <span className="font-bold flex items-center space-x-1">
                    {msg.role === 'assistant' && <Sparkles className="w-3 h-3 text-amber-400" />}
                    <span>{msg.role === 'user' ? 'You' : 'Gemini AI Hub'}</span>
                  </span>
                  <span>{msg.timestamp}</span>
                </div>
                <div className="leading-relaxed whitespace-pre-wrap">{msg.content}</div>
              </div>
            ))}
            {isLoading && (
              <div className="p-4 rounded-2xl bg-white/5 text-xs text-gray-400 flex items-center space-x-2">
                <span className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span>Synthesizing cross-document intelligence...</span>
              </div>
            )}
          </div>

          <div className="p-4 bg-black/80 border-t border-white/10">
            <div className="relative">
              <input
                type="text"
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendQuery()}
                placeholder="Ask any question across all uploaded PDFs..."
                className="w-full pl-4 pr-12 py-3 rounded-xl glass-input text-xs"
              />
              <button
                onClick={handleSendQuery}
                className="absolute right-2 top-2 p-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      )}

      {/* TRANSLATE TAB */}
      {activeSubTab === 'translate' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl glass-card border border-white/10 space-y-4 bg-black/40">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-white">Source Document Text</span>
              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="bg-black/60 border border-white/10 text-xs font-bold text-white rounded-lg px-2.5 py-1"
              >
                {['Spanish', 'French', 'German', 'Japanese', 'Chinese', 'Arabic', 'Hindi'].map((l) => (
                  <option key={l} value={l} className="bg-gray-900">{l}</option>
                ))}
              </select>
            </div>

            <textarea
              rows={12}
              value={transInput}
              onChange={(e) => setTransInput(e.target.value)}
              placeholder="Paste text to translate or select from PDF..."
              className="w-full p-4 rounded-xl glass-input text-xs"
            />

            <button
              onClick={handleTranslate}
              disabled={isTranslating}
              className="w-full py-3 rounded-xl bg-blue-600 text-white text-xs font-bold flex items-center justify-center space-x-2"
            >
              {isTranslating ? 'Translating Text...' : `Translate to ${targetLang}`}
            </button>
          </div>

          <div className="p-6 rounded-2xl glass-card border border-white/10 space-y-4 bg-gradient-to-b from-blue-950/20 to-purple-950/20">
            <span className="text-xs font-bold text-white">Translated Result ({targetLang})</span>
            <div className="p-4 rounded-xl bg-black/60 border border-white/10 text-xs text-gray-200 min-h-[300px] leading-relaxed whitespace-pre-wrap font-serif">
              {transResult || 'Translated text output will appear here.'}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

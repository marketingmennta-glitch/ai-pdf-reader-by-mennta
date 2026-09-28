import React, { useState } from 'react';
import { 
  FileText, Sparkles, Zap, Shield, Eye, Cpu, BrainCircuit, Mic, 
  Split, Layers, Lock, ChevronRight, Check, ArrowRight, Play, Star, HelpCircle, MessageSquare
} from 'lucide-react';
import { ViewMode, PdfDocument } from '../types/pdfak';
import { SAMPLE_PDFS } from '../data/samplePdfs';

interface LandingPageProps {
  setViewMode: (mode: ViewMode) => void;
  onOpenAuth: (type: 'login' | 'signup') => void;
  onSelectSamplePdf: (pdfId: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  setViewMode,
  onOpenAuth,
  onSelectSamplePdf,
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [demoSelectedDocIndex, setDemoSelectedDocIndex] = useState(0);
  const [demoAiTab, setDemoAiTab] = useState<'summary' | 'chat' | 'quiz'>('summary');

  const defaultShowcaseDoc: PdfDocument = {
    id: 'showcase-preview-doc',
    name: 'Neural_Vector_PDF_Intelligence_Architecture.pdf',
    size: '3.8 MB',
    pageCount: 4,
    uploadDate: '2026-09-26',
    category: 'Research',
    tags: ['Gemini', 'NeuralGraph', 'OCR'],
    isFavorite: true,
    isRecent: true,
    summary: 'Comprehensive analysis of multimodal transformer scaling laws, sparse mixture of experts (MoE), and sub-100ms real-time audio-visual inference architectures.',
    pages: [
      {
        pageNumber: 1,
        text: `EXECUTIVE SUMMARY & ARCHITECTURAL FOUNDATIONS
Gemini 3.5 introduces a paradigm shift in multimodal foundation model design, featuring native sub-millisecond cross-attention fusion across text, vision, high-frequency audio streams, and interactive document structures.

1. Key Breakthroughs:
• Unified Multimodal Tokenization: Direct alignment of raw PDF vector geometry, raster image layers, and semantically parsed markdown tokens.
• Sparse Mixture-of-Experts (MoE): 64 expert routes per layer with dynamically gated routing, reducing active parameter inference latency by 48%.
• Ultra-Long Context Cache: Native support for 2,000,000 context window tokens with key-value cache compression algorithms operating at O(1) retrieval speed.

2. Application in Document Intelligence:
Traditional OCR and PDF parsing tools treat documents as static bitmaps or loose text blocks. Gemini 3.5 treats PDF documents as hierarchical vector graphs, preserving exact typography, bounding box coordinates, table cells, and mathematical LaTeX markup.`,
      },
    ],
  };

  const activeDemoPdf = SAMPLE_PDFS[demoSelectedDocIndex] || defaultShowcaseDoc;

  return (
    <div className="min-h-screen bg-[#030712] text-gray-100 bg-grid-pattern relative overflow-hidden">
      
      {/* Background Radial Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-violet-600/15 rounded-full blur-[120px] pointer-events-none" />

      {/* HERO SECTION */}
      <section className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        
        {/* Release Pill */}
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold mb-8 backdrop-blur-md shadow-lg shadow-blue-500/10">
          <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
          <span>Announcing PDFAK v3.5 with Gemini 3.6 Multimodal Neural Vision</span>
          <ChevronRight className="w-3.5 h-3.5 text-blue-400" />
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] max-w-5xl mx-auto">
          The Next-Generation <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
            AI PDF Intelligence Platform
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto font-normal leading-relaxed">
          Chat with 1,000+ page PDFs, extract OCR handwriting, generate flashcards & mind maps, annotate with precision, and split or merge files with zero quality loss.
        </p>

        {/* Primary CTA Buttons */}
        <div className="mt-10 flex flex-wrap justify-center items-center gap-4">
          <button
            onClick={() => onOpenAuth('signup')}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-base shadow-xl shadow-blue-600/30 transition-all hover:scale-[1.03] active:scale-[0.98] flex items-center space-x-3"
          >
            <span>Start Free Trial</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            onClick={() => {
              setViewMode('dashboard');
            }}
            className="px-8 py-4 rounded-2xl glass-card hover:bg-white/10 text-white font-semibold text-base border border-white/15 transition-all flex items-center space-x-2"
          >
            <Play className="w-5 h-5 text-blue-400 fill-blue-400/20" />
            <span>Launch Clean Workspace</span>
          </button>
        </div>

        {/* Key Feature Badges */}
        <div className="mt-12 flex flex-wrap justify-center items-center gap-6 text-xs text-gray-400 font-medium">
          <div className="flex items-center space-x-1.5">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Gemini 3.6 Flash Engine</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>SOC 2 Type II Certified</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Unlimited OCR Extraction</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>End-to-End Cryptographic Encryption</span>
          </div>
        </div>

        {/* INTERACTIVE DEMO PREVIEW WINDOW */}
        <div className="mt-16 max-w-6xl mx-auto rounded-2xl p-2 glass-card border border-white/15 shadow-2xl relative group">
          <div className="rounded-xl bg-[#030712] border border-white/10 overflow-hidden text-left">
            
            {/* Demo Window Header */}
            <div className="px-4 py-3 bg-white/5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-xs font-mono text-gray-400">PDFAK Studio v3.5 — Interactive Showcase</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-blue-600/30 text-blue-300 border border-blue-500/40">
                  Live Preview
                </span>
              </div>
            </div>

            {/* Demo Body Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[420px]">
              
              {/* Document Text Viewport */}
              <div className="lg:col-span-7 p-6 border-b lg:border-b-0 lg:border-r border-white/10 bg-black/40">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-blue-400" />
                      <span>{activeDemoPdf.name}</span>
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">Page 1 of {activeDemoPdf.pageCount} • {activeDemoPdf.size}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 text-[10px] font-bold tracking-wide uppercase border border-blue-500/20">
                    {activeDemoPdf.category}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-xs text-gray-300 font-mono leading-relaxed space-y-3 max-h-[320px] overflow-y-auto">
                  <p className="text-amber-300 font-semibold bg-amber-400/10 p-1.5 rounded border border-amber-400/20">
                    [Selected Highlight] {activeDemoPdf.pages[0].text.substring(0, 180)}...
                  </p>
                  <p>{activeDemoPdf.pages[0].text.substring(181, 700)}</p>
                </div>

                <div className="mt-4 flex items-center justify-between pt-2 border-t border-white/5">
                  <span className="text-xs text-gray-400">Launch studio to upload and work with your own documents</span>
                  <button
                    onClick={() => {
                      setViewMode('studio');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center space-x-1.5"
                  >
                    <span>Open in PDF Studio</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* AI Assistant Output Panel */}
              <div className="lg:col-span-5 p-6 flex flex-col justify-between bg-gradient-to-b from-blue-950/20 to-purple-950/20">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-gray-200 flex items-center space-x-1.5">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Gemini AI Insights</span>
                    </span>

                    <div className="flex rounded-lg bg-black/60 p-0.5 border border-white/10 text-[11px]">
                      <button
                        onClick={() => setDemoAiTab('summary')}
                        className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                          demoAiTab === 'summary' ? 'bg-blue-600 text-white' : 'text-gray-400'
                        }`}
                      >
                        Summary
                      </button>
                      <button
                        onClick={() => setDemoAiTab('chat')}
                        className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                          demoAiTab === 'chat' ? 'bg-blue-600 text-white' : 'text-gray-400'
                        }`}
                      >
                        Ask AI
                      </button>
                      <button
                        onClick={() => setDemoAiTab('quiz')}
                        className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                          demoAiTab === 'quiz' ? 'bg-blue-600 text-white' : 'text-gray-400'
                        }`}
                      >
                        Quiz
                      </button>
                    </div>
                  </div>

                  {demoAiTab === 'summary' && (
                    <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-gray-200 space-y-2">
                      <p className="font-bold text-blue-300">Executive Summary:</p>
                      <p className="leading-relaxed">{activeDemoPdf.summary}</p>
                      <div className="pt-2 flex flex-wrap gap-1.5">
                        {activeDemoPdf.tags.map((t) => (
                          <span key={t} className="px-2 py-0.5 rounded bg-white/10 text-[10px] text-gray-300">
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {demoAiTab === 'chat' && (
                    <div className="space-y-3 text-xs">
                      <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 text-gray-300">
                        <p className="font-semibold text-blue-400 mb-1">Q: What are the main key metrics?</p>
                        <p>A: The document details sub-millisecond multimodal inference latency and O(1) context cache retrieval across 2,000,000 tokens.</p>
                      </div>
                      <div className="p-2.5 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-200">
                        <p className="font-semibold text-amber-300 mb-1">Cited Page: Page 1, Section 2</p>
                      </div>
                    </div>
                  )}

                  {demoAiTab === 'quiz' && (
                    <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-gray-200 space-y-2">
                      <p className="font-bold text-purple-300">Sample Flashcard:</p>
                      <div className="p-3 rounded-lg bg-black/50 border border-white/10 text-center font-medium">
                        "What is the maximum context cache window supported?"
                      </div>
                      <p className="text-[11px] text-gray-400 text-center">Click card to reveal answer (2,000,000 Tokens)</p>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => onOpenAuth('signup')}
                  className="mt-4 w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center justify-center space-x-1.5"
                >
                  <span>Unlock Unlimited AI Processing</span>
                  <ChevronRight className="w-4 h-4" />
                </button>

              </div>

            </div>

          </div>
        </div>

      </section>

      {/* CORE CAPABILITIES GRID */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Built to Replace 6 Separate PDF Tools
          </h2>
          <p className="mt-3 text-base text-gray-400 max-w-2xl mx-auto">
            Everything you need for reading, summarizing, editing, converting, and securing documents in one unified dark glassmorphic workspace.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Card 1 */}
          <div className="p-8 rounded-2xl glass-card glass-card-hover relative group">
            <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Gemini 3.6 PDF Chat</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Ask complex questions across 1,000+ page documents. Receive exact verbatim page citations and bounding box highlights.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-8 rounded-2xl glass-card glass-card-hover relative group">
            <div className="w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 transition-transform">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Multimodal OCR Vision</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Instantly extract text, handwritten notes, tables, and mathematical formulas from scanned documents and images.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-8 rounded-2xl glass-card glass-card-hover relative group">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Mind Map & Quiz Generator</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Automatically distill dense research papers into interactive hierarchical concept trees, flashcards, and self-tests.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-8 rounded-2xl glass-card glass-card-hover relative group">
            <div className="w-12 h-12 rounded-xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-6 group-hover:scale-110 transition-transform">
              <Mic className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">AI Voice Reader (TTS)</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Listen to your PDFs with natural neural voices. Control playback speed and auto-scroll as you read on the go.
            </p>
          </div>

          {/* Card 5 */}
          <div className="p-8 rounded-2xl glass-card glass-card-hover relative group">
            <div className="w-12 h-12 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
              <Split className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Split, Merge & Compress</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Combine multiple PDFs, extract specific page ranges, and compress large file sizes while retaining crystal clear vector quality.
            </p>
          </div>

          {/* Card 6 */}
          <div className="p-8 rounded-2xl glass-card glass-card-hover relative group">
            <div className="w-12 h-12 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400 mb-6 group-hover:scale-110 transition-transform">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Digital Signature & Encrypt</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Apply cryptographic signatures, custom watermarks, and AES-256 password protection to confidential documents.
            </p>
          </div>

        </div>
      </section>

      {/* PRICING SECTION */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/10">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Flexible Plans for Individuals & Teams
          </h2>
          <p className="mt-3 text-base text-gray-400">
            Start with our generous free tier or upgrade for unlimited AI compute and team collaboration.
          </p>

          {/* Billing Cycle Switch */}
          <div className="mt-8 inline-flex items-center p-1 rounded-xl bg-black/60 border border-white/10">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                billingCycle === 'monthly' ? 'bg-blue-600 text-white' : 'text-gray-400'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1 ${
                billingCycle === 'yearly' ? 'bg-blue-600 text-white' : 'text-gray-400'
              }`}
            >
              <span>Annual Billing</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                Save 25%
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Free Tier */}
          <div className="p-8 rounded-2xl glass-card border border-white/10 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold text-white">Starter</h3>
              <p className="text-xs text-gray-400 mt-1">Essential reading & light AI tools</p>
              <div className="mt-6 mb-6">
                <span className="text-4xl font-extrabold text-white">$0</span>
                <span className="text-xs text-gray-400"> / forever free</span>
              </div>
              <ul className="space-y-3 text-xs text-gray-300">
                <li className="flex items-center"><Check className="w-4 h-4 text-emerald-400 mr-2" /> Up to 5 PDFs per month</li>
                <li className="flex items-center"><Check className="w-4 h-4 text-emerald-400 mr-2" /> Basic AI PDF Chat & Summary</li>
                <li className="flex items-center"><Check className="w-4 h-4 text-emerald-400 mr-2" /> 5 OCR page extractions</li>
                <li className="flex items-center"><Check className="w-4 h-4 text-emerald-400 mr-2" /> Basic PDF Reader & Highlights</li>
              </ul>
            </div>
            <button
              onClick={() => onOpenAuth('signup')}
              className="mt-8 w-full py-3 rounded-xl glass-card hover:bg-white/10 text-white text-xs font-bold transition-all"
            >
              Get Started Free
            </button>
          </div>

          {/* Pro Tier (Featured) */}
          <div className="p-8 rounded-2xl glass-card border-2 border-blue-500/50 relative shadow-2xl shadow-blue-600/20 flex flex-col justify-between">
            <div className="absolute -top-3 right-6 px-3 py-1 rounded-full bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-md">
              Most Popular
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Pro Studio</h3>
              <p className="text-xs text-blue-300 mt-1">Power users, researchers & professionals</p>
              <div className="mt-6 mb-6">
                <span className="text-4xl font-extrabold text-white">
                  {billingCycle === 'yearly' ? '$12' : '$16'}
                </span>
                <span className="text-xs text-gray-400"> / month</span>
              </div>
              <ul className="space-y-3 text-xs text-gray-200">
                <li className="flex items-center"><Check className="w-4 h-4 text-blue-400 mr-2" /> Unlimited PDF Documents</li>
                <li className="flex items-center"><Check className="w-4 h-4 text-blue-400 mr-2" /> Unlimited Gemini 3.6 AI Processing</li>
                <li className="flex items-center"><Check className="w-4 h-4 text-blue-400 mr-2" /> Unlimited Vision OCR Extractions</li>
                <li className="flex items-center"><Check className="w-4 h-4 text-blue-400 mr-2" /> Interactive Mind Map & Quiz Generator</li>
                <li className="flex items-center"><Check className="w-4 h-4 text-blue-400 mr-2" /> AI Voice Reader with Neural Voices</li>
                <li className="flex items-center"><Check className="w-4 h-4 text-blue-400 mr-2" /> Split, Merge, Compress & Encrypt Tools</li>
              </ul>
            </div>
            <button
              onClick={() => onOpenAuth('signup')}
              className="mt-8 w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-500/30 transition-all"
            >
              Start 14-Day Free Pro Trial
            </button>
          </div>

          {/* Enterprise Tier */}
          <div className="p-8 rounded-2xl glass-card border border-white/10 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold text-white">Enterprise</h3>
              <p className="text-xs text-gray-400 mt-1">Custom security, SOC2 & dedicated SLA</p>
              <div className="mt-6 mb-6">
                <span className="text-4xl font-extrabold text-white">Custom</span>
              </div>
              <ul className="space-y-3 text-xs text-gray-300">
                <li className="flex items-center"><Check className="w-4 h-4 text-purple-400 mr-2" /> Single Sign-On (SAML / Okta)</li>
                <li className="flex items-center"><Check className="w-4 h-4 text-purple-400 mr-2" /> Dedicated On-Prem / Cloud Instance</li>
                <li className="flex items-center"><Check className="w-4 h-4 text-purple-400 mr-2" /> Custom AI Model Fine-tuning</li>
                <li className="flex items-center"><Check className="w-4 h-4 text-purple-400 mr-2" /> Audit Logs & Admin Console</li>
              </ul>
            </div>
            <button
              onClick={() => onOpenAuth('signup')}
              className="mt-8 w-full py-3 rounded-xl glass-card hover:bg-white/10 text-white text-xs font-bold transition-all"
            >
              Contact Enterprise Sales
            </button>
          </div>

        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-white/10">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          {[
            {
              q: 'How does PDFAK process confidential enterprise documents securely?',
              a: 'All files are encrypted in-transit via TLS 1.3 and at-rest using AES-256 encryption. We enforce zero data-retention policies on AI model calls, ensuring your private content is never used to train public foundation models.'
            },
            {
              q: 'Can PDFAK extract text from scanned paper documents or handwritten notes?',
              a: 'Yes! Our Vision OCR module powered by Gemini 3.6 Flash analyzes raster images, camera photos, and scanned PDFs to extract printed and handwritten text with over 98% accuracy.'
            },
            {
              q: 'What is the maximum PDF file size supported?',
              a: 'PDFAK supports PDFs up to 500 MB and up to 2,000 pages per document. Long-context cache window ensures sub-second query responses.'
            },
            {
              q: 'Does PDFAK work on mobile browsers and tablets?',
              a: 'Yes, PDFAK features a fully responsive, dark glassmorphic mobile workspace with touch gesture navigation for scrolling and zooming.'
            }
          ].map((faq, idx) => (
            <div
              key={idx}
              className="rounded-xl glass-card border border-white/10 overflow-hidden transition-all"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full px-6 py-4 text-left font-semibold text-sm text-white flex justify-between items-center"
              >
                <span>{faq.q}</span>
                <span className="text-blue-400 font-mono text-lg">{activeFaq === idx ? '−' : '+'}</span>
              </button>
              {activeFaq === idx && (
                <div className="px-6 pb-4 text-xs text-gray-300 leading-relaxed border-t border-white/5 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 py-12 bg-black/60 text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
              P
            </div>
            <span className="text-white font-bold text-sm">PDFAK AI</span>
            <span>© 2026 PDFAK Inc. All rights reserved.</span>
          </div>

          <div className="flex items-center space-x-6">
            <a href="#terms" className="hover:text-gray-300 transition-colors">Privacy Policy</a>
            <a href="#terms" className="hover:text-gray-300 transition-colors">Terms of Service</a>
            <a href="#security" className="hover:text-gray-300 transition-colors">SOC2 Security</a>
            <a href="#status" className="hover:text-gray-300 transition-colors">System Status</a>
          </div>
        </div>
      </footer>

    </div>
  );
};

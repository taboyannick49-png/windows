import React from 'react';
import { Smartphone, Code, BookOpen, Download, Layers, ShieldCheck, Play, Square } from 'lucide-react';

interface HeaderProps {
  activeTab: 'simulator' | 'code' | 'guide';
  setActiveTab: (tab: 'simulator' | 'code' | 'guide') => void;
  serviceEnabled: boolean;
  onToggleService: () => void;
  onDownloadAll: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  serviceEnabled,
  onToggleService,
  onDownloadAll,
}) => {
  return (
    <header className="bg-[#2e3036]/60 backdrop-blur-2xl border-b border-[#44474e] text-[#e2e2e6] sticky top-0 z-40 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between py-3.5 gap-4">
          {/* Logo & App Title */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#d1e4ff] flex items-center justify-center shadow-lg shadow-[#d1e4ff]/10">
              <Layers className="w-6 h-6 text-[#00315c]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold tracking-tight text-[#e2e2e6]">
                  SideFlow Pro
                </h1>
                <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-[#d1e4ff]/20 text-[#d1e4ff] border border-[#d1e4ff]/30">
                  Android Native API 24+
                </span>
              </div>
              <p className="text-xs text-[#c4c6cf] opacity-80 uppercase tracking-wider font-medium">
                Overlay Window System • Kotlin & Java • Material You
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-white/5 p-1.5 rounded-2xl border border-white/10 backdrop-blur-xl">
            <button
              id="tab-simulator-btn"
              onClick={() => setActiveTab('simulator')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'simulator'
                  ? 'bg-[#d1e4ff] text-[#00315c] shadow-md'
                  : 'text-[#c4c6cf] hover:text-white hover:bg-white/10'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Simulateur Tablette</span>
            </button>

            <button
              id="tab-code-btn"
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'code'
                  ? 'bg-[#d1e4ff] text-[#00315c] shadow-md'
                  : 'text-[#c4c6cf] hover:text-white hover:bg-white/10'
              }`}
            >
              <Code className="w-4 h-4" />
              <span>Code Source Studio</span>
            </button>

            <button
              id="tab-guide-btn"
              onClick={() => setActiveTab('guide')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'guide'
                  ? 'bg-[#d1e4ff] text-[#00315c] shadow-md'
                  : 'text-[#c4c6cf] hover:text-white hover:bg-white/10'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Guide & Overlay</span>
            </button>
          </nav>

          {/* Quick Action Controls */}
          <div className="flex items-center gap-2.5">
            <button
              id="header-toggle-service-btn"
              onClick={onToggleService}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md ${
                serviceEnabled
                  ? 'bg-[#b8f397]/20 text-[#b8f397] border border-[#b8f397]/40 hover:bg-[#b8f397]/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
              }`}
            >
              {serviceEnabled ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Overlay Actif</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Démarrer Overlay</span>
                </>
              )}
            </button>

            <button
              id="header-download-code-btn"
              onClick={onDownloadAll}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/10 text-[#e2e2e6] border border-white/10 hover:bg-white/20 transition-all backdrop-blur-md"
              title="Exporter tous les fichiers Android Studio"
            >
              <Download className="w-3.5 h-3.5 text-[#d1e4ff]" />
              <span className="hidden sm:inline">Exporter Code</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

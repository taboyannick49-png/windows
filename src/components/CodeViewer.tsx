import React, { useState } from 'react';
import {
  FileCode,
  Copy,
  Check,
  Download,
  FolderTree,
  Code2,
  Sparkles,
  FileText,
  Search,
  ExternalLink
} from 'lucide-react';
import { CodeFile, CodeLanguage } from '../types/android';

interface CodeViewerProps {
  files: CodeFile[];
  onDownloadFile: (file: CodeFile, language: CodeLanguage) => void;
  onDownloadAll: () => void;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({
  files,
  onDownloadFile,
  onDownloadAll,
}) => {
  const [selectedFileId, setSelectedFileId] = useState<string>('floating_service');
  const [language, setLanguage] = useState<CodeLanguage>('kotlin');
  const [copiedFileId, setCopiedFileId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const selectedFile = files.find((f) => f.id === selectedFileId) || files[0];

  const filteredFiles = files.filter(
    (f) =>
      f.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getFileContent = (file: CodeFile, lang: CodeLanguage): string => {
    if (file.language === 'kotlin' || file.language === 'java' || file.category === 'code') {
      return lang === 'kotlin'
        ? file.contentKotlin || file.contentJava || ''
        : file.contentJava || file.contentKotlin || '';
    }
    if (file.language === 'xml') return file.contentXml || '';
    if (file.language === 'markdown') return file.contentMd || '';
    return '';
  };

  const handleCopyCode = (content: string, id: string) => {
    navigator.clipboard?.writeText(content);
    setCopiedFileId(id);
    setTimeout(() => setCopiedFileId(null), 2000);
  };

  const currentCode = getFileContent(selectedFile, language);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* LEFT SIDEBAR: FILE EXPLORER (COL 1 to 4) */}
      <div className="lg:col-span-4 bg-[#2e3036]/50 backdrop-blur-xl border border-[#44474e] rounded-3xl p-5 text-[#e2e2e6] shadow-xl flex flex-col h-[700px]">
        {/* Explorer Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <FolderTree className="w-4 h-4 text-[#d1e4ff]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#e2e2e6]">
              Projet Android Studio
            </h3>
          </div>

          {/* Language Switch Toggle */}
          <div className="flex items-center bg-white/5 p-1 rounded-xl border border-white/10 backdrop-blur-md">
            <button
              onClick={() => setLanguage('kotlin')}
              className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${
                language === 'kotlin' ? 'bg-[#d1e4ff] text-[#00315c]' : 'text-[#c4c6cf] hover:text-white'
              }`}
            >
              Kotlin
            </button>
            <button
              onClick={() => setLanguage('java')}
              className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${
                language === 'java' ? 'bg-amber-500 text-slate-950' : 'text-[#c4c6cf] hover:text-white'
              }`}
            >
              Java
            </button>
          </div>
        </div>

        {/* Search bar */}
        <div className="my-3.5 relative">
          <Search className="w-3.5 h-3.5 text-[#c4c6cf] absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Rechercher un fichier XML, Kt, Java..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/30 border border-white/10 rounded-2xl pl-9 pr-3 py-2 text-xs text-white placeholder-[#c4c6cf]/50 outline-none focus:border-[#d1e4ff]"
          />
        </div>

        {/* File Tree List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {filteredFiles.map((file) => {
            const isSelected = file.id === selectedFileId;
            return (
              <button
                key={file.id}
                onClick={() => setSelectedFileId(file.id)}
                className={`w-full text-left p-3 rounded-2xl border transition-all flex items-start gap-3 group ${
                  isSelected
                    ? 'bg-[#d1e4ff]/15 border-[#d1e4ff]/40 text-white shadow-md'
                    : 'bg-white/5 border-white/5 text-[#c4c6cf] hover:bg-white/10 hover:text-white'
                }`}
              >
                <div
                  className={`p-2 rounded-xl mt-0.5 ${
                    file.category === 'manifest'
                      ? 'bg-amber-500/20 text-amber-300'
                      : file.category === 'code'
                      ? language === 'kotlin'
                        ? 'bg-[#d1e4ff]/20 text-[#d1e4ff]'
                        : 'bg-amber-500/20 text-amber-300'
                      : file.category === 'layout'
                      ? 'bg-blue-500/20 text-blue-300'
                      : 'bg-[#b8f397]/20 text-[#b8f397]'
                  }`}
                >
                  <FileCode className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold truncate text-[#e2e2e6]">
                      {file.filename}
                    </span>
                    <span className="text-[9px] uppercase font-bold text-[#c4c6cf] px-2 py-0.5 rounded-full bg-white/10">
                      {file.language}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#c4c6cf]/80 truncate mt-0.5">
                    {file.path}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Bottom Download Project Button */}
        <div className="pt-3.5 border-t border-white/10 mt-2">
          <button
            onClick={onDownloadAll}
            className="w-full flex items-center justify-center gap-2 bg-[#d1e4ff] hover:bg-[#b8d7ff] text-[#00315c] py-2.5 rounded-2xl text-xs font-bold transition-all shadow-md"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exporter Tous Fichiers (.zip)</span>
          </button>
        </div>
      </div>

      {/* RIGHT EDITOR: CODE DISPLAY & COPY (COL 5 to 12) */}
      <div className="lg:col-span-8 bg-[#2e3036]/50 backdrop-blur-xl border border-[#44474e] rounded-3xl p-5 text-[#e2e2e6] shadow-xl flex flex-col h-[700px]">
        {/* File Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-white/10 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-[#d1e4ff]" />
              <h2 className="text-sm font-bold text-[#e2e2e6]">
                {selectedFile.filename}
              </h2>
              <span className="text-[10px] font-semibold text-[#c4c6cf] bg-white/10 px-2.5 py-0.5 rounded-full border border-white/10">
                {selectedFile.path}
              </span>
            </div>
            <p className="text-xs text-[#c4c6cf] mt-1">
              {selectedFile.description}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopyCode(currentCode, selectedFile.id)}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-[#e2e2e6] border border-white/10 px-3.5 py-2 rounded-2xl text-xs font-semibold transition-colors backdrop-blur-md"
            >
              {copiedFileId === selectedFile.id ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#b8f397]" />
                  <span className="text-[#b8f397] font-bold">Copié !</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#d1e4ff]" />
                  <span>Copier Code</span>
                </>
              )}
            </button>

            <button
              onClick={() => onDownloadFile(selectedFile, language)}
              className="flex items-center gap-1.5 bg-[#d1e4ff] hover:bg-[#b8d7ff] text-[#00315c] px-3.5 py-2 rounded-2xl text-xs font-bold transition-colors shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Télécharger</span>
            </button>
          </div>
        </div>

        {/* CODE CONTAINER */}
        <div className="flex-1 mt-4 bg-black/40 rounded-2xl border border-white/10 p-4 overflow-auto font-mono text-xs leading-relaxed text-[#e2e2e6] custom-scrollbar relative backdrop-blur-md">
          <pre className="whitespace-pre-wrap select-text">
            <code>{currentCode}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};

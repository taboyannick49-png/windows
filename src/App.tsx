import React, { useState } from 'react';
import { Header } from './components/Header';
import { TabletSimulator } from './components/TabletSimulator';
import { CodeViewer } from './components/CodeViewer';
import { InstallationGuide } from './components/InstallationGuide';
import { ANDROID_CODE_FILES } from './data/androidCodeFiles';
import { OverlaySettings, ClipboardItem, CodeFile, CodeLanguage } from './types/android';

export default function App() {
  const [activeTab, setActiveTab] = useState<'simulator' | 'code' | 'guide'>('simulator');

  const [settings, setSettings] = useState<OverlaySettings>({
    serviceEnabled: true,
    edgePosition: 'right',
    displayMode: 'edge',
    handleYPercent: 30,
    bubbleXPercent: 82,
    bubbleYPercent: 25,
    bubbleSize: 48,
    handleColor: '#d1e4ff',
    handleOpacity: 0.85,
    autoHide: false,
    hapticFeedback: true,
    clipboardSync: true,
    selectedApps: ['com.google.android.calculator', 'com.google.android.keep'],
    animationSpeed: 'normal',
    showRuler: false,
    stickyNotes: '• Réunion à 10h00 avec l\'équipe\n• Vérifier les rapports de production\n• Valider le design Material You',
    shortcuts: [
      {
        id: 'calc',
        name: 'Calculatrice',
        packageName: 'com.google.android.calculator',
        iconName: 'Calculator',
        color: 'bg-[#d1e4ff] text-[#00315c]',
        category: 'Outillage',
      },
      {
        id: 'browser',
        name: 'Navigateur',
        packageName: 'com.android.chrome',
        iconName: 'Compass',
        color: 'bg-indigo-600 text-white',
        category: 'Web',
      },
      {
        id: 'notes',
        name: 'Bloc-notes',
        packageName: 'com.google.android.keep',
        iconName: 'FileText',
        color: 'bg-[#b8f397] text-[#00315c]',
        category: 'Productivité',
      },
      {
        id: 'settings',
        name: 'Réglages',
        packageName: 'com.android.settings',
        iconName: 'Settings',
        color: 'bg-amber-500 text-slate-950',
        category: 'Système',
      },
    ],
  });

  const [clipboardHistory, setClipboardHistory] = useState<ClipboardItem[]>([
    {
      id: '1',
      text: 'Exemple de texte copié depuis une autre application Android',
      timestamp: '09:40',
      sourceApp: 'Navigateur Web',
    },
    {
      id: '2',
      text: 'Coordonnées GPS: 48.8566° N, 2.3522° E',
      timestamp: '09:32',
      sourceApp: 'Notes',
    },
  ]);

  const handleAddClipboardText = (text: string) => {
    if (!text.trim()) return;
    const newItem: ClipboardItem = {
      id: Date.now().toString(),
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setClipboardHistory((prev) => [newItem, ...prev.slice(0, 9)]);
  };

  // Single file download
  const handleDownloadFile = (file: CodeFile, lang: CodeLanguage) => {
    let content = '';
    if (file.category === 'code') {
      content = lang === 'kotlin' ? file.contentKotlin || '' : file.contentJava || '';
    } else if (file.language === 'xml') {
      content = file.contentXml || '';
    } else if (file.language === 'markdown') {
      content = file.contentMd || '';
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.filename.split(' ')[0]; // clean filename
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Download all files as text package
  const handleDownloadAll = () => {
    ANDROID_CODE_FILES.forEach((file) => {
      handleDownloadFile(file, 'kotlin');
    });
  };

  return (
    <div className="min-h-screen bg-[#1a1c1e] text-[#e2e2e6] font-sans flex flex-col selection:bg-[#d1e4ff] selection:text-[#00315c] [background-image:radial-gradient(circle_at_0%_0%,#2e3036_0%,#1a1c1e_100%)]">
      {/* Top Navigation Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        serviceEnabled={settings.serviceEnabled}
        onToggleService={() =>
          setSettings((prev) => ({ ...prev, serviceEnabled: !prev.serviceEnabled }))
        }
        onDownloadAll={handleDownloadAll}
      />

      {/* Main Content Body */}
      <main className="flex-1 py-6">
        {activeTab === 'simulator' && (
          <TabletSimulator
            settings={settings}
            setSettings={setSettings}
            clipboardHistory={clipboardHistory}
            addClipboardText={handleAddClipboardText}
          />
        )}

        {activeTab === 'code' && (
          <CodeViewer
            files={ANDROID_CODE_FILES}
            onDownloadFile={handleDownloadFile}
            onDownloadAll={handleDownloadAll}
          />
        )}

        {activeTab === 'guide' && <InstallationGuide />}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-white/5 backdrop-blur-md py-4 text-center text-xs text-[#c4c6cf]/70">
        <p>
          Barre Latérale Flottante Android • Compatible API 24 (Android 7.0) à API 34+ (Android 14) • Material You & Frosted Glass Overlay
        </p>
      </footer>
    </div>
  );
}

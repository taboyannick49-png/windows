import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calculator,
  Compass,
  FileText,
  Settings,
  X,
  Copy,
  Check,
  GripVertical,
  Sliders,
  ShieldCheck,
  Tablet,
  Plus,
  Volume2,
  Wifi,
  Battery,
  Trash2,
  MoveHorizontal,
  Camera,
  Image as ImageIcon,
  Video,
  Music,
  MapPin,
  Mail,
  ShoppingBag,
  Gamepad2,
  Globe,
  Folder,
  Sparkles,
  Clock,
  Ruler,
  Percent,
  StickyNote,
  Maximize2,
  Scissors,
  Sparkle,
  Layers,
  Circle,
  Minimize2
} from 'lucide-react';
import { OverlaySettings, ClipboardItem, ShortcutApp } from '../types/android';

interface TabletSimulatorProps {
  settings: OverlaySettings;
  setSettings: React.Dispatch<React.SetStateAction<OverlaySettings>>;
  clipboardHistory: ClipboardItem[];
  addClipboardText: (text: string) => void;
}

// Map icon string names to Lucide Icon components
const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Calculator,
  Compass,
  FileText,
  Settings,
  Camera,
  Image: ImageIcon,
  Video,
  Music,
  MapPin,
  Mail,
  ShoppingBag,
  Gamepad2,
  Globe,
  Folder,
  Sparkles,
  Clock,
  Ruler,
  Percent,
  StickyNote,
  Layers,
};

// Preset catalog of apps that can be added
const PRESET_CATALOG: ShortcutApp[] = [
  {
    id: 'youtube',
    name: 'YouTube',
    packageName: 'com.google.android.youtube',
    iconName: 'Video',
    color: 'bg-rose-600 text-white',
    category: 'Média',
  },
  {
    id: 'camera',
    name: 'Appareil Photo',
    packageName: 'com.android.camera',
    iconName: 'Camera',
    color: 'bg-emerald-600 text-white',
    category: 'Média',
  },
  {
    id: 'gmail',
    name: 'Gmail',
    packageName: 'com.google.android.gm',
    iconName: 'Mail',
    color: 'bg-red-500 text-white',
    category: 'Communication',
  },
  {
    id: 'spotify',
    name: 'Musique',
    packageName: 'com.spotify.music',
    iconName: 'Music',
    color: 'bg-emerald-500 text-slate-950',
    category: 'Média',
  },
  {
    id: 'maps',
    name: 'Cartes & GPS',
    packageName: 'com.google.android.apps.maps',
    iconName: 'MapPin',
    color: 'bg-sky-500 text-white',
    category: 'Navigation',
  },
  {
    id: 'files',
    name: 'Fichiers',
    packageName: 'com.google.android.documentsui',
    iconName: 'Folder',
    color: 'bg-[#d1e4ff] text-[#00315c]',
    category: 'Système',
  },
  {
    id: 'gallery',
    name: 'Galerie',
    packageName: 'com.google.android.apps.photos',
    iconName: 'Image',
    color: 'bg-indigo-500 text-white',
    category: 'Média',
  },
  {
    id: 'clock',
    name: 'Horloge & Alarme',
    packageName: 'com.google.android.deskclock',
    iconName: 'Clock',
    color: 'bg-purple-600 text-white',
    category: 'Outils',
  },
];

export const TabletSimulator: React.FC<TabletSimulatorProps> = ({
  settings,
  setSettings,
  clipboardHistory,
  addClipboardText,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [handleY, setHandleY] = useState<number>(160); // Y position in pixels for edge handle
  const [bubblePos, setBubblePos] = useState<{ x: number; y: number }>({ x: 80, y: 30 }); // Percentage x,y for bubble mode

  const [activeAppWindow, setActiveAppWindow] = useState<string>('none');
  const [hasPermission, setHasPermission] = useState<boolean>(true);
  const [copiedSuccess, setCopiedSuccess] = useState<boolean>(false);
  const [calcInput, setCalcInput] = useState<string>('0');
  const [noteText, setNoteText] = useState<string>('Exemple de note enregistrée sur tablette...');
  const [testCopyInput, setTestCopyInput] = useState<string>('Projet Android Flottant 2026 - API 24+');
  const [wallpaperIndex, setWallpaperIndex] = useState<number>(0);

  // Shortcut Modal State
  const [showAddShortcutModal, setShowAddShortcutModal] = useState<boolean>(false);
  const [isEditShortcutMode, setIsEditShortcutMode] = useState<boolean>(false);
  const [customAppName, setCustomAppName] = useState<string>('');
  const [customAppPackage, setCustomAppPackage] = useState<string>('');
  const [customAppIcon, setCustomAppIcon] = useState<string>('Sparkles');
  const [customAppColor, setCustomAppColor] = useState<string>('bg-purple-600 text-white');

  // Daily Tools States
  const [activeSidebarTab, setActiveSidebarTab] = useState<'shortcuts' | 'tools' | 'clipboard'>('shortcuts');
  const [showScreenshotFlash, setShowScreenshotFlash] = useState<boolean>(false);
  const [screenshotPreview, setScreenshotPreview] = useState<boolean>(false);
  const [isSplitScreen, setIsSplitScreen] = useState<boolean>(false);
  const [showFloatingStickyNote, setShowFloatingStickyNote] = useState<boolean>(false);
  
  // Converter Tool State
  const [calcMode, setCalcMode] = useState<'discount' | 'converter'>('discount');
  const [priceInput, setPriceInput] = useState<number>(100);
  const [discountPercent, setDiscountPercent] = useState<number>(20);
  const [convertCm, setConvertCm] = useState<number>(25.4);

  const simulatorRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const initialPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Wallpapers for tablet
  const wallpapers = [
    'from-slate-900 via-indigo-950 to-blue-900',
    'from-blue-900 via-slate-900 to-teal-900',
    'from-purple-950 via-slate-900 to-indigo-900',
    'from-emerald-950 via-slate-900 to-cyan-950',
  ];

  // Pointer dragging logic for Edge Handle
  const handleEdgePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    isDraggingRef.current = false;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    initialPosRef.current = { x: 0, y: handleY };

    const handlePointerMove = (moveEv: PointerEvent) => {
      const deltaY = moveEv.clientY - dragStartRef.current.y;
      if (Math.abs(deltaY) > 5) {
        isDraggingRef.current = true;
      }
      if (simulatorRef.current) {
        const bounds = simulatorRef.current.getBoundingClientRect();
        const maxY = bounds.height - 100;
        const newY = Math.max(30, Math.min(maxY, initialPosRef.current.y + deltaY));
        setHandleY(newY);
      }
    };

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      if (!isDraggingRef.current) {
        if (settings.serviceEnabled && hasPermission) {
          setIsExpanded((prev) => !prev);
        }
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  // Pointer dragging logic for Floating Bubble (Free 2D on Tablet Screen)
  const handleBubblePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    isDraggingRef.current = false;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    initialPosRef.current = { x: bubblePos.x, y: bubblePos.y };

    const handlePointerMove = (moveEv: PointerEvent) => {
      const deltaX = moveEv.clientX - dragStartRef.current.x;
      const deltaY = moveEv.clientY - dragStartRef.current.y;

      if (Math.hypot(deltaX, deltaY) > 5) {
        isDraggingRef.current = true;
      }

      if (simulatorRef.current) {
        const bounds = simulatorRef.current.getBoundingClientRect();
        const pctX = Math.max(5, Math.min(92, initialPosRef.current.x + (deltaX / bounds.width) * 100));
        const pctY = Math.max(8, Math.min(88, initialPosRef.current.y + (deltaY / bounds.height) * 100));
        setBubblePos({ x: pctX, y: pctY });
      }
    };

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      if (!isDraggingRef.current) {
        if (settings.serviceEnabled && hasPermission) {
          setIsExpanded((prev) => !prev);
        }
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const currentClipboard = clipboardHistory[0]?.text || 'Aucun texte copié';

  const handleCopyClipboard = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2000);
  };

  const handleRemoveShortcut = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSettings((prev) => ({
      ...prev,
      shortcuts: prev.shortcuts.filter((s) => s.id !== id),
    }));
  };

  const handleAddPresetShortcut = (preset: ShortcutApp) => {
    // Check if exists
    if (settings.shortcuts.some((s) => s.id === preset.id)) return;
    setSettings((prev) => ({
      ...prev,
      shortcuts: [...prev.shortcuts, preset],
    }));
    setShowAddShortcutModal(false);
  };

  const handleAddCustomShortcut = () => {
    if (!customAppName.trim()) return;
    const newShortcut: ShortcutApp = {
      id: `custom_${Date.now()}`,
      name: customAppName,
      packageName: customAppPackage || `com.app.${customAppName.toLowerCase().replace(/\s+/g, '')}`,
      iconName: customAppIcon,
      color: customAppColor,
      category: 'Personnalisé',
      isCustom: true,
    };
    setSettings((prev) => ({
      ...prev,
      shortcuts: [...prev.shortcuts, newShortcut],
    }));
    setCustomAppName('');
    setCustomAppPackage('');
    setShowAddShortcutModal(false);
  };

  // Trigger Screenshot Simulation
  const handleTakeScreenshot = () => {
    setShowScreenshotFlash(true);
    setTimeout(() => {
      setShowScreenshotFlash(false);
      setScreenshotPreview(true);
      addClipboardText(`[Capture d'Écran] Image sauvegardée (${new Date().toLocaleTimeString()})`);
    }, 200);
  };

  // Get animation config
  const getSpringConfig = () => {
    if (settings.animationSpeed === 'fast') return { damping: 20, stiffness: 350 };
    if (settings.animationSpeed === 'smooth') return { damping: 30, stiffness: 120 };
    return { damping: 24, stiffness: 200 };
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 md:p-6 max-w-7xl mx-auto">
      {/* SIMULATOR CANVAS (COL 1 to 8) */}
      <div className="lg:col-span-8 flex flex-col items-center">
        {/* Tablet Frame Header */}
        <div className="w-full flex items-center justify-between mb-3 bg-[#2e3036]/60 backdrop-blur-xl p-3.5 rounded-2xl border border-[#44474e] text-[#e2e2e6] text-xs">
          <div className="flex items-center gap-2">
            <Tablet className="w-4 h-4 text-[#d1e4ff]" />
            <span className="font-semibold text-[#e2e2e6]">
              Simulateur Tablette Android 14 (10.5")
            </span>
            <span className="text-[#c4c6cf] opacity-60">• 2560 x 1600 px</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setWallpaperIndex((wallpaperIndex + 1) % wallpapers.length)}
              className="hover:text-white transition-colors text-[11px] bg-white/10 px-2.5 py-1 rounded-xl border border-white/10 font-medium"
            >
              Changer Fond
            </button>

            <button
              onClick={() =>
                setSettings((prev) => ({
                  ...prev,
                  displayMode: prev.displayMode === 'edge' ? 'bubble' : 'edge',
                }))
              }
              className="hover:text-white transition-colors text-[11px] bg-[#d1e4ff]/20 text-[#d1e4ff] border border-[#d1e4ff]/30 px-2.5 py-1 rounded-xl font-semibold"
            >
              {settings.displayMode === 'edge' ? 'Passer en Bulle' : 'Passer en Poignée'}
            </button>

            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                hasPermission && settings.serviceEnabled
                  ? 'bg-[#b8f397]/20 text-[#b8f397] border border-[#b8f397]/30'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}
            >
              {hasPermission && settings.serviceEnabled ? 'Overlay Actif' : 'Overlay Masqué'}
            </span>
          </div>
        </div>

        {/* TABLET DEVICE CONTAINER */}
        <div
          ref={simulatorRef}
          className="relative w-full aspect-[16/10] max-h-[540px] rounded-[32px] p-3.5 bg-[#1a1c1e] border-[8px] border-[#2e3036] shadow-2xl overflow-hidden select-none transition-all ring-1 ring-white/10"
        >
          {/* SCREENSHOT FLASH ANIMATION OVERLAY */}
          {showScreenshotFlash && (
            <div className="absolute inset-0 bg-white z-50 animate-ping opacity-80 pointer-events-none" />
          )}

          {/* TABLET SCREEN BACKGROUND */}
          <div
            className={`w-full h-full rounded-2xl bg-gradient-to-br ${wallpapers[wallpaperIndex]} relative overflow-hidden flex flex-col justify-between`}
          >
            {/* STATUS BAR */}
            <div className="w-full h-7 bg-black/30 backdrop-blur-md px-4 flex items-center justify-between text-white text-[11px] font-medium z-10 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span>09:42</span>
                <span className="text-[10px] text-white/70">Sam. 8 Août</span>
                {isSplitScreen && (
                  <span className="text-[9px] bg-[#d1e4ff]/20 text-[#d1e4ff] px-1.5 py-0.2 rounded font-bold">
                    Écran Scindé
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Wifi className="w-3.5 h-3.5" />
                <Volume2 className="w-3.5 h-3.5" />
                <div className="flex items-center gap-1">
                  <span>98%</span>
                  <Battery className="w-3.5 h-3.5 text-[#b8f397] fill-current" />
                </div>
              </div>
            </div>

            {/* TABLET HOMESCREEN CONTENT OR SPLIT SCREEN */}
            <div
              className="flex-1 p-5 relative flex flex-col justify-between"
              onClick={() => {
                if (isExpanded) setIsExpanded(false);
              }}
            >
              {isSplitScreen ? (
                /* SPLIT SCREEN MODE */
                <div className="grid grid-cols-2 gap-3 h-full">
                  <div className="bg-black/50 backdrop-blur-md rounded-2xl border border-white/20 p-4 flex flex-col justify-between">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="text-xs font-bold text-[#d1e4ff] flex items-center gap-1">
                        <Calculator className="w-4 h-4" /> Calculatrice (Écran 1)
                      </span>
                    </div>
                    <div className="bg-white/5 p-3 rounded-xl text-right font-mono text-xl text-[#b8f397]">
                      {calcInput}
                    </div>
                    <div className="grid grid-cols-4 gap-1.5 text-xs">
                      {['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', 'C', '0', '=', '+'].map((btn) => (
                        <button
                          key={btn}
                          onClick={() => {
                            if (btn === 'C') setCalcInput('0');
                            else if (btn === '=') {
                              try {
                                setCalcInput(String(eval(calcInput)));
                              } catch {
                                setCalcInput('Erreur');
                              }
                            } else {
                              setCalcInput((prev) => (prev === '0' || prev === 'Erreur' ? btn : prev + btn));
                            }
                          }}
                          className="p-2 bg-white/10 hover:bg-white/20 rounded-lg font-bold"
                        >
                          {btn}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-black/50 backdrop-blur-md rounded-2xl border border-white/20 p-4 flex flex-col justify-between">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="text-xs font-bold text-[#b8f397] flex items-center gap-1">
                        <FileText className="w-4 h-4" /> Notes Flottantes (Écran 2)
                      </span>
                      <button
                        onClick={() => setIsSplitScreen(false)}
                        className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded"
                      >
                        Fermer
                      </button>
                    </div>
                    <textarea
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      className="w-full flex-1 bg-black/30 my-2 p-2.5 rounded-xl border border-white/10 text-xs text-[#e2e2e6] outline-none resize-none"
                    />
                  </div>
                </div>
              ) : (
                /* STANDARD SINGLE HOMESCREEN */
                <>
                  {/* Home Clock Widget */}
                  <div className="text-white mb-4">
                    <div className="text-5xl font-extralight tracking-tight font-sans drop-shadow-md">
                      09:42
                    </div>
                    <p className="text-sm text-white/80 font-medium drop-shadow">
                      Paris • Ensoleillé 24°C
                    </p>
                  </div>

                  {/* Desktop Apps Grid */}
                  <div className="grid grid-cols-6 gap-3 max-w-lg">
                    {settings.shortcuts.slice(0, 6).map((app) => {
                      const IconComponent = ICON_MAP[app.iconName] || Sparkles;
                      return (
                        <button
                          key={app.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveAppWindow(app.id);
                          }}
                          className="flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:bg-white/10 backdrop-blur-md transition-all group"
                        >
                          <div
                            className={`w-11 h-11 rounded-2xl ${app.color} flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform`}
                          >
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <span className="text-[11px] text-white font-semibold drop-shadow truncate max-w-[70px]">
                            {app.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              {/* SCREEN RULER OVERLAY */}
              {settings.showRuler && (
                <div className="absolute bottom-2 left-6 right-6 h-12 bg-amber-300/90 text-slate-950 backdrop-blur-md border border-amber-400 rounded-xl px-4 flex items-center justify-between text-[10px] font-mono shadow-2xl z-20">
                  <span className="font-bold">RÈGLE 15 CM</span>
                  <div className="flex-1 flex justify-between px-4 items-end h-full pt-2">
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((cm) => (
                      <div key={cm} className="flex flex-col items-center gap-0.5">
                        <div className="w-0.5 h-4 bg-slate-900" />
                        <span>{cm}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setSettings((prev) => ({ ...prev, showRuler: false }))}
                    className="p-1 hover:bg-slate-900/20 rounded"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* FLOATING STICKY NOTE OVERLAY */}
              {showFloatingStickyNote && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute top-12 right-12 w-56 bg-amber-300 text-slate-900 rounded-2xl p-3.5 shadow-2xl border border-amber-400 z-30 font-sans"
                >
                  <div className="flex items-center justify-between border-b border-slate-900/20 pb-1.5 mb-2">
                    <span className="text-xs font-bold flex items-center gap-1 text-slate-950">
                      <StickyNote className="w-3.5 h-3.5" /> Pense-bête Flottant
                    </span>
                    <button
                      onClick={() => setShowFloatingStickyNote(false)}
                      className="p-1 hover:bg-slate-900/20 rounded"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <textarea
                    value={settings.stickyNotes}
                    onChange={(e) => setSettings({ ...settings, stickyNotes: e.target.value })}
                    className="w-full bg-transparent text-xs text-slate-900 outline-none resize-none h-24 font-medium"
                    placeholder="Ecrire une note..."
                  />
                </motion.div>
              )}

              {/* SCREENSHOT PREVIEW MODAL */}
              <AnimatePresence>
                {screenshotPreview && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute inset-6 m-auto bg-[#1a1c1e]/95 backdrop-blur-2xl border border-white/20 rounded-3xl p-4 shadow-2xl flex flex-col z-40 text-white"
                  >
                    <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
                      <span className="text-xs font-bold flex items-center gap-2 text-[#b8f397]">
                        <Scissors className="w-4 h-4" /> Capture d'Écran Rognée & Copiée
                      </span>
                      <button
                        onClick={() => setScreenshotPreview(false)}
                        className="p-1 hover:bg-white/10 rounded-xl"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex-1 bg-black/40 rounded-2xl border border-white/10 p-3 flex flex-col items-center justify-center text-center">
                      <div className="w-full h-32 bg-gradient-to-r from-blue-600/30 to-purple-600/30 rounded-xl border border-dashed border-white/30 flex items-center justify-center mb-2">
                        <ImageIcon className="w-8 h-8 text-[#d1e4ff]" />
                      </div>
                      <p className="text-xs text-[#c4c6cf]">
                        Aperçu de la capture d'écran sauvegardée dans le presse-papier Android.
                      </p>
                    </div>
                    <div className="flex justify-end gap-2 mt-3">
                      <button
                        onClick={() => {
                          addClipboardText('Image Capture Tablette - ' + new Date().toLocaleTimeString());
                          setScreenshotPreview(false);
                        }}
                        className="bg-[#d1e4ff] text-[#00315c] px-4 py-2 rounded-xl text-xs font-bold"
                      >
                        Copier l'Image
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* INTERACTIVE POPUP APP WINDOWS */}
              <AnimatePresence>
                {activeAppWindow !== 'none' && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="absolute inset-8 m-auto max-w-xl max-h-[380px] bg-[#1a1c1e]/90 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl flex flex-col z-20 overflow-hidden text-[#e2e2e6]"
                  >
                    {/* Window Header */}
                    <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/10">
                      <span className="text-xs font-bold text-[#e2e2e6] flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#d1e4ff]" />
                        App: {settings.shortcuts.find((s) => s.id === activeAppWindow)?.name || activeAppWindow}
                      </span>
                      <button
                        onClick={() => setActiveAppWindow('none')}
                        className="p-1 hover:bg-white/10 rounded-xl text-[#c4c6cf] hover:text-white transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Window Body */}
                    <div className="flex-1 p-4 overflow-y-auto">
                      {activeAppWindow === 'calc' ? (
                        <div className="max-w-xs mx-auto bg-black/40 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
                          <div className="bg-white/5 text-right p-3 rounded-xl text-2xl font-mono mb-3 text-[#b8f397] overflow-x-auto border border-white/5">
                            {calcInput}
                          </div>
                          <div className="grid grid-cols-4 gap-2 text-sm">
                            {['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', 'C', '0', '=', '+'].map((btn) => (
                              <button
                                key={btn}
                                onClick={() => {
                                  if (btn === 'C') setCalcInput('0');
                                  else if (btn === '=') {
                                    try {
                                      setCalcInput(String(eval(calcInput)));
                                    } catch {
                                      setCalcInput('Erreur');
                                    }
                                  } else {
                                    setCalcInput((prev) => (prev === '0' || prev === 'Erreur' ? btn : prev + btn));
                                  }
                                }}
                                className="p-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold text-[#e2e2e6] transition-colors"
                              >
                                {btn}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : activeAppWindow === 'notes' ? (
                        <div className="flex flex-col h-full gap-3">
                          <textarea
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            className="w-full flex-1 bg-black/30 p-3.5 rounded-2xl border border-white/10 text-xs text-[#e2e2e6] outline-none resize-none focus:border-[#d1e4ff]"
                            placeholder="Saisissez vos notes..."
                          />
                          <button
                            onClick={() => {
                              addClipboardText(noteText);
                              setCopiedSuccess(true);
                              setTimeout(() => setCopiedSuccess(false), 2000);
                            }}
                            className="flex items-center justify-center gap-2 bg-[#b8f397] hover:bg-[#a6e683] py-2.5 rounded-xl text-xs font-bold text-[#00315c] transition-colors shadow-md"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copier dans le Presse-papier</span>
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-3">
                          <div className="w-14 h-14 rounded-2xl bg-[#d1e4ff]/20 flex items-center justify-center text-[#d1e4ff]">
                            <Sparkles className="w-8 h-8" />
                          </div>
                          <h4 className="font-bold text-sm text-[#e2e2e6]">
                            Lancement Simulateur Android
                          </h4>
                          <p className="text-xs text-[#c4c6cf]">
                            L'application {settings.shortcuts.find((s) => s.id === activeAppWindow)?.name || activeAppWindow} a été exécutée depuis l'Intent Android.
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ANDROID SYSTEM NAVIGATION BAR */}
            <div className="w-full h-8 bg-black/40 backdrop-blur-md flex items-center justify-center gap-12 text-white border-t border-white/10">
              <div className="w-3.5 h-3.5 border-l-2 border-b-2 border-white/80 rotate-45 cursor-pointer" />
              <div className="w-3.5 h-3.5 rounded-full border-2 border-white/80 cursor-pointer" />
              <div className="w-3 h-3 border-2 border-white/80 rounded-sm cursor-pointer" />
            </div>

            {/* OVERLAY FLOATING WIDGET MODE 1: EDGE HANDLE */}
            {settings.serviceEnabled && hasPermission && settings.displayMode === 'edge' && (
              <div
                style={{
                  top: `${handleY}px`,
                  left: settings.edgePosition === 'left' ? '0px' : 'auto',
                  right: settings.edgePosition === 'right' ? '0px' : 'auto',
                }}
                className="absolute z-30 flex items-center"
              >
                {/* HANDLE BAR */}
                <div
                  onPointerDown={handleEdgePointerDown}
                  style={{
                    opacity: settings.handleOpacity,
                    backgroundColor: settings.handleColor,
                  }}
                  className={`cursor-grab active:cursor-grabbing w-11 h-20 flex flex-col items-center justify-center gap-1 text-slate-950 shadow-2xl backdrop-blur-lg border border-white/40 transition-all ${
                    settings.edgePosition === 'right' ? 'rounded-l-2xl' : 'rounded-r-2xl'
                  }`}
                  title="Glisser pour déplacer • Cliquer pour ouvrir"
                >
                  <div className="w-4 h-0.5 bg-slate-900/60 rounded-full" />
                  <GripVertical className="w-5 h-5 text-slate-950" />
                  <div className="w-4 h-0.5 bg-slate-900/60 rounded-full" />
                </div>
              </div>
            )}

            {/* OVERLAY FLOATING WIDGET MODE 2: FREE FLOATING BUBBLE */}
            {settings.serviceEnabled && hasPermission && settings.displayMode === 'bubble' && (
              <div
                onPointerDown={handleBubblePointerDown}
                style={{
                  left: `${bubblePos.x}%`,
                  top: `${bubblePos.y}%`,
                  width: `${settings.bubbleSize}px`,
                  height: `${settings.bubbleSize}px`,
                  opacity: settings.handleOpacity,
                  backgroundColor: settings.handleColor,
                }}
                className="absolute z-30 cursor-grab active:cursor-grabbing rounded-full shadow-2xl backdrop-blur-xl border-2 border-white/60 flex items-center justify-center text-slate-950 transition-shadow hover:scale-110 active:scale-95 group"
                title="Bulle Flottante • Glisser n'importe où sur l'écran"
              >
                <div className="absolute -inset-1 rounded-full bg-white/20 animate-pulse -z-10" />
                <Layers className="w-5 h-5 text-slate-950" />
              </div>
            )}

            {/* EXPANDABLE SIDEBAR OVERLAY PANEL (SLIDE & FADE TRANSITION) */}
            <AnimatePresence>
              {isExpanded && settings.serviceEnabled && hasPermission && (
                <motion.div
                  initial={{
                    x: settings.displayMode === 'edge' ? (settings.edgePosition === 'right' ? 120 : -120) : 0,
                    scale: settings.displayMode === 'bubble' ? 0.4 : 0.9,
                    opacity: 0,
                  }}
                  animate={{ x: 0, scale: 1, opacity: 1 }}
                  exit={{
                    x: settings.displayMode === 'edge' ? (settings.edgePosition === 'right' ? 120 : -120) : 0,
                    scale: settings.displayMode === 'bubble' ? 0.4 : 0.9,
                    opacity: 0,
                  }}
                  transition={{ type: 'spring', ...getSpringConfig() }}
                  style={{
                    position: 'absolute',
                    top: settings.displayMode === 'edge' ? `${Math.max(20, handleY - 60)}px` : `${Math.max(20, bubblePos.y - 10)}%`,
                    right: settings.displayMode === 'edge' ? (settings.edgePosition === 'right' ? '56px' : 'auto') : 'auto',
                    left: settings.displayMode === 'edge' ? (settings.edgePosition === 'left' ? '56px' : 'auto') : `${Math.min(60, bubblePos.x)}%`,
                  }}
                  className="w-80 bg-[#2e3036]/95 backdrop-blur-2xl border border-white/20 rounded-3xl p-4 shadow-2xl text-[#e2e2e6] z-40"
                >
                  {/* Sidebar Header */}
                  <div className="flex items-center justify-between pb-2.5 border-b border-white/10 mb-3">
                    <span className="text-xs font-bold text-[#e2e2e6] uppercase tracking-wider flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-[#d1e4ff]" />
                      SideFlow Pro
                    </span>
                    <button
                      onClick={() => setIsExpanded(false)}
                      className="p-1 rounded-xl hover:bg-white/10 text-[#c4c6cf] hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Sidebar Internal Tabs */}
                  <div className="flex bg-black/30 p-1 rounded-2xl mb-3 border border-white/10 text-xs font-semibold">
                    <button
                      onClick={() => setActiveSidebarTab('shortcuts')}
                      className={`flex-1 py-1.5 rounded-xl transition-colors ${
                        activeSidebarTab === 'shortcuts'
                          ? 'bg-[#d1e4ff] text-[#00315c]'
                          : 'text-[#c4c6cf] hover:text-white'
                      }`}
                    >
                      Raccourcis
                    </button>
                    <button
                      onClick={() => setActiveSidebarTab('tools')}
                      className={`flex-1 py-1.5 rounded-xl transition-colors ${
                        activeSidebarTab === 'tools'
                          ? 'bg-[#d1e4ff] text-[#00315c]'
                          : 'text-[#c4c6cf] hover:text-white'
                      }`}
                    >
                      Outils Tablette
                    </button>
                    <button
                      onClick={() => setActiveSidebarTab('clipboard')}
                      className={`flex-1 py-1.5 rounded-xl transition-colors ${
                        activeSidebarTab === 'clipboard'
                          ? 'bg-[#d1e4ff] text-[#00315c]'
                          : 'text-[#c4c6cf] hover:text-white'
                      }`}
                    >
                      Presse-papier
                    </button>
                  </div>

                  {/* TAB 1: CUSTOMIZABLE SHORTCUTS */}
                  {activeSidebarTab === 'shortcuts' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#c4c6cf]">
                          Raccourcis Rapides ({settings.shortcuts.length})
                        </span>
                        <button
                          onClick={() => setIsEditShortcutMode(!isEditShortcutMode)}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition-colors ${
                            isEditShortcutMode
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                              : 'bg-white/10 text-[#c4c6cf] border-white/10 hover:text-white'
                          }`}
                        >
                          {isEditShortcutMode ? 'Terminer' : 'Gérer / Supprimer'}
                        </button>
                      </div>

                      <div className="grid grid-cols-4 gap-2">
                        {settings.shortcuts.map((app) => {
                          const IconComponent = ICON_MAP[app.iconName] || Sparkles;
                          return (
                            <div key={app.id} className="relative group">
                              <button
                                onClick={() => {
                                  setActiveAppWindow(app.id);
                                  setIsExpanded(false);
                                }}
                                className="w-full flex flex-col items-center gap-1 p-2 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 transition-all"
                              >
                                <div
                                  className={`w-9 h-9 rounded-xl ${app.color} flex items-center justify-center shadow-md`}
                                >
                                  <IconComponent className="w-4 h-4" />
                                </div>
                                <span className="text-[10px] text-[#e2e2e6] font-medium truncate max-w-[50px]">
                                  {app.name}
                                </span>
                              </button>

                              {/* DELETE BUTTON IF EDIT MODE OR HOVER */}
                              {isEditShortcutMode && (
                                <button
                                  onClick={(e) => handleRemoveShortcut(app.id, e)}
                                  className="absolute -top-1 -right-1 bg-rose-600 text-white p-1 rounded-full shadow-lg hover:bg-rose-500 transition-transform scale-110"
                                  title="Supprimer ce raccourci"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          );
                        })}

                        {/* PLUS BUTTON TO ADD NEW SHORTCUT */}
                        <button
                          onClick={() => setShowAddShortcutModal(true)}
                          className="flex flex-col items-center justify-center gap-1 p-2 rounded-2xl bg-white/10 hover:bg-[#d1e4ff]/20 border border-dashed border-white/30 text-[#d1e4ff] transition-all"
                          title="Ajouter un raccourci"
                        >
                          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white">
                            <Plus className="w-5 h-5 text-[#d1e4ff]" />
                          </div>
                          <span className="text-[10px] font-bold">Ajouter</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: DAILY TABLET PRODUCTIVITY TOOLS */}
                  {activeSidebarTab === 'tools' && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#c4c6cf] block mb-1">
                        Boîte à Outils Tablette
                      </span>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {/* Tool 1: Capture d'Écran */}
                        <button
                          onClick={handleTakeScreenshot}
                          className="flex items-center gap-2 p-2.5 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 text-left transition-all"
                        >
                          <div className="p-2 rounded-xl bg-rose-500/20 text-rose-300">
                            <Scissors className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold text-[#e2e2e6] text-[11px]">Capture Écran</p>
                            <p className="text-[9px] text-[#c4c6cf]">Rognage rapide</p>
                          </div>
                        </button>

                        {/* Tool 2: Règle Écran */}
                        <button
                          onClick={() => {
                            setSettings((prev) => ({ ...prev, showRuler: !prev.showRuler }));
                            setIsExpanded(false);
                          }}
                          className="flex items-center gap-2 p-2.5 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 text-left transition-all"
                        >
                          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
                            <Ruler className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold text-[#e2e2e6] text-[11px]">Règle Écran</p>
                            <p className="text-[9px] text-[#c4c6cf]">Mesure en cm</p>
                          </div>
                        </button>

                        {/* Tool 3: Split Screen */}
                        <button
                          onClick={() => {
                            setIsSplitScreen(!isSplitScreen);
                            setIsExpanded(false);
                          }}
                          className="flex items-center gap-2 p-2.5 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 text-left transition-all"
                        >
                          <div className="p-2 rounded-xl bg-sky-500/20 text-sky-300">
                            <Maximize2 className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold text-[#e2e2e6] text-[11px]">Écran Scindé</p>
                            <p className="text-[9px] text-[#c4c6cf]">2 Apps côte à côte</p>
                          </div>
                        </button>

                        {/* Tool 4: Pense Bête */}
                        <button
                          onClick={() => {
                            setShowFloatingStickyNote(!showFloatingStickyNote);
                            setIsExpanded(false);
                          }}
                          className="flex items-center gap-2 p-2.5 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 text-left transition-all"
                        >
                          <div className="p-2 rounded-xl bg-[#b8f397]/20 text-[#b8f397]">
                            <StickyNote className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold text-[#e2e2e6] text-[11px]">Pense-bête</p>
                            <p className="text-[9px] text-[#c4c6cf]">Post-it flottant</p>
                          </div>
                        </button>
                      </div>

                      {/* Tool 5: Quick Unit & Discount Calculator */}
                      <div className="p-3 bg-black/40 rounded-2xl border border-white/10 mt-2 space-y-2">
                        <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                          <span className="text-[10px] font-bold text-[#d1e4ff] flex items-center gap-1">
                            <Percent className="w-3.5 h-3.5" /> Calculateur & Convertisseur Rapide
                          </span>
                          <div className="flex gap-1 text-[9px]">
                            <button
                              onClick={() => setCalcMode('discount')}
                              className={`px-2 py-0.5 rounded-md font-bold ${
                                calcMode === 'discount' ? 'bg-[#d1e4ff] text-[#00315c]' : 'text-[#c4c6cf]'
                              }`}
                            >
                              Remise %
                            </button>
                            <button
                              onClick={() => setCalcMode('converter')}
                              className={`px-2 py-0.5 rounded-md font-bold ${
                                calcMode === 'converter' ? 'bg-[#d1e4ff] text-[#00315c]' : 'text-[#c4c6cf]'
                              }`}
                            >
                              Unités
                            </button>
                          </div>
                        </div>

                        {calcMode === 'discount' ? (
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-[9px] text-[#c4c6cf] block">Prix de départ (€)</span>
                              <input
                                type="number"
                                value={priceInput}
                                onChange={(e) => setPriceInput(Number(e.target.value))}
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-1 text-white text-xs"
                              />
                            </div>
                            <div>
                              <span className="text-[9px] text-[#c4c6cf] block">Rabais (-%)</span>
                              <input
                                type="number"
                                value={discountPercent}
                                onChange={(e) => setDiscountPercent(Number(e.target.value))}
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-1 text-white text-xs"
                              />
                            </div>
                            <div className="col-span-2 bg-[#b8f397]/20 p-2 rounded-xl text-center font-bold text-[#b8f397] text-xs">
                              Prix final: {(priceInput * (1 - discountPercent / 100)).toFixed(2)} € (Économie: {(priceInput * (discountPercent / 100)).toFixed(2)} €)
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-[9px] text-[#c4c6cf] block">Centimètres (cm)</span>
                              <input
                                type="number"
                                value={convertCm}
                                onChange={(e) => setConvertCm(Number(e.target.value))}
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-1 text-white text-xs"
                              />
                            </div>
                            <div className="bg-[#d1e4ff]/20 p-2 rounded-xl text-center font-bold text-[#d1e4ff] text-xs flex flex-col justify-center">
                              <span>{(convertCm / 2.54).toFixed(2)} pouces (inch)</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 3: CLIPBOARD */}
                  {activeSidebarTab === 'clipboard' && (
                    <div className="p-3 bg-black/40 rounded-2xl border border-white/10 backdrop-blur-md">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#c4c6cf]">
                          Presse-papier Intelligents
                        </span>
                        <button
                          onClick={() => handleCopyClipboard(currentClipboard)}
                          className="text-[10px] font-semibold text-[#d1e4ff] hover:underline flex items-center gap-1 bg-[#d1e4ff]/10 px-2 py-0.5 rounded-lg border border-[#d1e4ff]/20"
                        >
                          {copiedSuccess ? (
                            <>
                              <Check className="w-3 h-3 text-[#b8f397]" /> Copié
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" /> Copier
                            </>
                          )}
                        </button>
                      </div>

                      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 custom-scrollbar">
                        {clipboardHistory.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => handleCopyClipboard(item.text)}
                            className="p-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 cursor-pointer transition-colors"
                          >
                            <p className="text-xs text-[#e2e2e6] line-clamp-2 font-mono">
                              "{item.text}"
                            </p>
                            <span className="text-[9px] text-[#c4c6cf] block text-right mt-0.5">
                              {item.timestamp}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* OVERLAY CONFIGURATION SIDE PANEL (COL 9 to 12) */}
      <div className="lg:col-span-4 space-y-4">
        {/* Card 1: Mode d'Affichage & Perms */}
        <div className="bg-[#2e3036]/50 backdrop-blur-xl border border-[#44474e] rounded-3xl p-5 text-[#e2e2e6] shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#e2e2e6] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#b8f397]" />
              Mode d'Affichage Overlay
            </h3>
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                settings.serviceEnabled && hasPermission ? 'bg-[#b8f397] animate-pulse' : 'bg-rose-500'
              }`}
            />
          </div>

          {/* DISPLAY MODE TOGGLE: EDGE BAR VS FLOATING BUBBLE */}
          <div>
            <label className="text-xs text-[#c4c6cf] font-medium block mb-2">
              Style de Composant Flottant
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSettings({ ...settings, displayMode: 'edge' })}
                className={`py-2 px-3 rounded-2xl text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 ${
                  settings.displayMode === 'edge'
                    ? 'bg-[#d1e4ff] text-[#00315c] border-[#d1e4ff]'
                    : 'bg-white/5 text-[#c4c6cf] border-white/10 hover:text-white'
                }`}
              >
                <GripVertical className="w-3.5 h-3.5" />
                Poignée Côté
              </button>
              <button
                onClick={() => setSettings({ ...settings, displayMode: 'bubble' })}
                className={`py-2 px-3 rounded-2xl text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 ${
                  settings.displayMode === 'bubble'
                    ? 'bg-[#d1e4ff] text-[#00315c] border-[#d1e4ff]'
                    : 'bg-white/5 text-[#c4c6cf] border-white/10 hover:text-white'
                }`}
              >
                <Circle className="w-3.5 h-3.5" />
                Bulle Libre 360°
              </button>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <label className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
              <div>
                <p className="text-xs font-semibold text-[#e2e2e6]">Service Flottant Active</p>
                <p className="text-[10px] text-[#c4c6cf]">SYSTEM_ALERT_WINDOW Background</p>
              </div>
              <input
                type="checkbox"
                checked={settings.serviceEnabled}
                onChange={(e) => setSettings({ ...settings, serviceEnabled: e.target.checked })}
                className="w-4 h-4 rounded accent-[#d1e4ff] cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Card 2: Customization Options (Handle vs Bubble Size & Animations) */}
        <div className="bg-[#2e3036]/50 backdrop-blur-xl border border-[#44474e] rounded-3xl p-5 text-[#e2e2e6] shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-[#e2e2e6] flex items-center gap-2">
            <MoveHorizontal className="w-4 h-4 text-[#d1e4ff]" />
            Personnalisation Visuelle & Transitions
          </h3>

          {/* Position Edge or Bubble Size */}
          {settings.displayMode === 'edge' ? (
            <div>
              <label className="text-xs text-[#c4c6cf] font-medium block mb-2">
                Ancrage Écran (Côté)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSettings({ ...settings, edgePosition: 'left' })}
                  className={`py-2 px-3 rounded-2xl text-xs font-semibold border transition-all ${
                    settings.edgePosition === 'left'
                      ? 'bg-[#d1e4ff] text-[#00315c] border-[#d1e4ff]'
                      : 'bg-white/5 text-[#c4c6cf] border-white/10 hover:text-white'
                  }`}
                >
                  Bord Gauche
                </button>
                <button
                  onClick={() => setSettings({ ...settings, edgePosition: 'right' })}
                  className={`py-2 px-3 rounded-2xl text-xs font-semibold border transition-all ${
                    settings.edgePosition === 'right'
                      ? 'bg-[#d1e4ff] text-[#00315c] border-[#d1e4ff]'
                      : 'bg-white/5 text-[#c4c6cf] border-white/10 hover:text-white'
                  }`}
                >
                  Bord Droit
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex justify-between text-xs text-[#c4c6cf] mb-1">
                <span>Taille de la Bulle Flottante</span>
                <span className="font-bold text-[#d1e4ff]">{settings.bubbleSize} px</span>
              </div>
              <input
                type="range"
                min="32"
                max="72"
                step="4"
                value={settings.bubbleSize}
                onChange={(e) =>
                  setSettings({ ...settings, bubbleSize: parseInt(e.target.value) })
                }
                className="w-full accent-[#d1e4ff]"
              />
            </div>
          )}

          {/* Animation Transition Speed */}
          <div>
            <label className="text-xs text-[#c4c6cf] font-medium block mb-2">
              Fluidité de Transition Ouverture (Slide & Fade)
            </label>
            <div className="grid grid-cols-3 gap-1.5 text-xs">
              {(
                [
                  { id: 'fast', label: 'Rapide' },
                  { id: 'normal', label: 'Expressif' },
                  { id: 'smooth', label: 'Fluide' },
                ] as const
              ).map((anim) => (
                <button
                  key={anim.id}
                  onClick={() => setSettings({ ...settings, animationSpeed: anim.id })}
                  className={`py-1.5 rounded-xl border text-[11px] font-semibold transition-colors ${
                    settings.animationSpeed === anim.id
                      ? 'bg-[#d1e4ff] text-[#00315c] border-[#d1e4ff]'
                      : 'bg-white/5 text-[#c4c6cf] border-white/10 hover:text-white'
                  }`}
                >
                  {anim.label}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selector */}
          <div>
            <label className="text-xs text-[#c4c6cf] font-medium block mb-2">
              Couleur d'Accent
            </label>
            <div className="flex gap-2">
              {[
                { name: 'Glace', hex: '#d1e4ff' },
                { name: 'Émeraude', hex: '#b8f397' },
                { name: 'Bleu', hex: '#2563eb' },
                { name: 'Violet', hex: '#7c3aed' },
                { name: 'Rose', hex: '#e11d48' },
              ].map((c) => (
                <button
                  key={c.hex}
                  onClick={() => setSettings({ ...settings, handleColor: c.hex })}
                  style={{ backgroundColor: c.hex }}
                  className={`w-7 h-7 rounded-full transition-transform border-2 ${
                    settings.handleColor === c.hex ? 'scale-110 border-white' : 'border-transparent'
                  }`}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          {/* Opacity Slider */}
          <div>
            <div className="flex justify-between text-xs text-[#c4c6cf] mb-1">
              <span>Opacité au repos</span>
              <span>{Math.round(settings.handleOpacity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="1.0"
              step="0.05"
              value={settings.handleOpacity}
              onChange={(e) =>
                setSettings({ ...settings, handleOpacity: parseFloat(e.target.value) })
              }
              className="w-full accent-[#d1e4ff]"
            />
          </div>
        </div>
      </div>

      {/* MODAL: ADD / REPLACE SHORTCUT DIALOG */}
      <AnimatePresence>
        {showAddShortcutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#2e3036] border border-white/20 rounded-3xl p-6 max-w-lg w-full text-[#e2e2e6] shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-[#d1e4ff]" />
                  Ajouter ou Remplacer un Raccourci
                </h3>
                <button
                  onClick={() => setShowAddShortcutModal(false)}
                  className="p-1 hover:bg-white/10 rounded-xl text-[#c4c6cf]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* CATALOG PRESETS */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#c4c6cf]">
                  Catalogue d'Applications Tablette
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PRESET_CATALOG.map((preset) => {
                    const IconComp = ICON_MAP[preset.iconName] || Sparkles;
                    const isAlreadyAdded = settings.shortcuts.some((s) => s.id === preset.id);
                    return (
                      <button
                        key={preset.id}
                        disabled={isAlreadyAdded}
                        onClick={() => handleAddPresetShortcut(preset)}
                        className={`flex flex-col items-center gap-1.5 p-2.5 rounded-2xl border text-center transition-all ${
                          isAlreadyAdded
                            ? 'bg-white/5 border-white/5 opacity-40 cursor-not-allowed'
                            : 'bg-white/10 border-white/10 hover:bg-white/20'
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-xl ${preset.color} flex items-center justify-center`}
                        >
                          <IconComp className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-semibold truncate max-w-full">
                          {preset.name}
                        </span>
                        {isAlreadyAdded && (
                          <span className="text-[9px] text-[#b8f397] font-bold">Ajouté</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* CUSTOM APP CREATOR */}
              <div className="border-t border-white/10 pt-4 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#c4c6cf]">
                  Ou Créer un Raccourci Personnalisé
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Nom de l'app (ex: Netflix)"
                    value={customAppName}
                    onChange={(e) => setCustomAppName(e.target.value)}
                    className="bg-black/30 border border-white/10 rounded-2xl px-3.5 py-2 text-xs text-white outline-none focus:border-[#d1e4ff]"
                  />
                  <input
                    type="text"
                    placeholder="Package (ex: com.netflix.mediaclient)"
                    value={customAppPackage}
                    onChange={(e) => setCustomAppPackage(e.target.value)}
                    className="bg-black/30 border border-white/10 rounded-2xl px-3.5 py-2 text-xs text-white outline-none focus:border-[#d1e4ff]"
                  />
                </div>

                {/* Icon Selection */}
                <div>
                  <span className="text-[10px] text-[#c4c6cf] block mb-1">Icône</span>
                  <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                    {['Sparkles', 'Camera', 'Video', 'Music', 'Globe', 'ShoppingBag', 'Gamepad2', 'Mail', 'Folder'].map((iconKey) => {
                      const IconC = ICON_MAP[iconKey] || Sparkles;
                      return (
                        <button
                          key={iconKey}
                          onClick={() => setCustomAppIcon(iconKey)}
                          className={`p-2 rounded-xl border transition-colors ${
                            customAppIcon === iconKey
                              ? 'bg-[#d1e4ff] text-[#00315c] border-[#d1e4ff]'
                              : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                          }`}
                        >
                          <IconC className="w-4 h-4" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setShowAddShortcutModal(false)}
                    className="px-4 py-2 rounded-2xl bg-white/10 text-xs font-semibold text-[#c4c6cf]"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleAddCustomShortcut}
                    disabled={!customAppName.trim()}
                    className="px-4 py-2 rounded-2xl bg-[#d1e4ff] text-[#00315c] text-xs font-bold disabled:opacity-50"
                  >
                    Créer le Raccourci
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

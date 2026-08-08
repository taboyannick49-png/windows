export type CodeLanguage = 'kotlin' | 'java';

export interface CodeFile {
  id: string;
  filename: string;
  path: string;
  category: 'manifest' | 'code' | 'layout' | 'drawable' | 'values' | 'instructions';
  language: 'xml' | 'kotlin' | 'java' | 'markdown';
  contentKotlin?: string;
  contentJava?: string;
  contentXml?: string;
  contentMd?: string;
  description: string;
}

export interface ShortcutApp {
  id: string;
  name: string;
  packageName: string;
  iconName: string; // Lucide icon identifier
  color: string;
  category: string;
  isCustom?: boolean;
}

export interface ClipboardItem {
  id: string;
  text: string;
  timestamp: string;
  sourceApp?: string;
}

export type DisplayMode = 'edge' | 'bubble';

export interface OverlaySettings {
  serviceEnabled: boolean;
  edgePosition: 'right' | 'left';
  displayMode: DisplayMode; // 'edge' or 'bubble'
  handleYPercent: number; // 0 to 100
  bubbleXPercent: number; // 0 to 100 for free floating bubble
  bubbleYPercent: number; // 0 to 100 for free floating bubble
  bubbleSize: number; // in pixels (36 to 72)
  handleColor: string;
  handleOpacity: number; // 0.2 to 1.0
  autoHide: boolean;
  hapticFeedback: boolean;
  clipboardSync: boolean;
  selectedApps: string[]; // package names
  shortcuts: ShortcutApp[];
  animationSpeed: 'fast' | 'normal' | 'smooth'; // animation speed setting
  showRuler: boolean;
  stickyNotes: string;
}


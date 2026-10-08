import React from 'react';
import {
  ChevronDown,
  Crown,
  Shuffle,
  Monitor,
  Maximize2,
  Download,
  Smartphone,
} from 'lucide-react';

interface TopHeaderProps {
  onInstallAndroid: () => void;
  onInstallPWA: () => void;
  onToggleFullscreen?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  onInstallAndroid,
  onInstallPWA,
  onToggleFullscreen,
}) => {
  const toggleFullscreen = () => {
    if (onToggleFullscreen) {
      onToggleFullscreen();
      return;
    }
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <header className="h-14 bg-white/95 border-b border-stone-200/90 px-4 sm:px-6 flex items-center justify-between gap-3 sticky top-0 z-30 backdrop-blur-md">
      {/* Left: App switcher dropdown */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-800 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
        >
          <Smartphone className="w-3.5 h-3.5 text-stone-600" />
          <span>DKA - TTS</span>
          <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
        </button>

        {/* Promo banner badge */}
        <button
          type="button"
          onClick={onInstallAndroid}
          className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-900/90 via-orange-900/80 to-amber-950 text-amber-200 border border-amber-600/40 text-xs font-medium hover:border-amber-500 transition-all cursor-pointer shadow-xs group"
        >
          <Crown className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
          <span className="font-semibold text-white">Get DKA - TTS for Android</span>
          <span className="text-amber-300/80 hidden lg:inline">· Fast native launch & offline library</span>
        </button>
      </div>

      {/* Right Action buttons */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-medium transition-colors cursor-pointer"
          title="Remix script and voice"
        >
          <Shuffle className="w-3.5 h-3.5 text-stone-500" />
          <span className="hidden sm:inline">Remix</span>
        </button>

        <button
          type="button"
          onClick={onInstallAndroid}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-medium transition-colors cursor-pointer"
          title="Device previews and Android setup"
        >
          <Monitor className="w-3.5 h-3.5 text-stone-500" />
          <span className="hidden sm:inline">Device</span>
        </button>

        <button
          type="button"
          onClick={toggleFullscreen}
          className="p-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-600 transition-colors cursor-pointer"
          title="Toggle Fullscreen"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onInstallPWA}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs hover:shadow-sm cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Install App</span>
        </button>
      </div>
    </header>
  );
};

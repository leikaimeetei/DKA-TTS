import React, { useState, useEffect } from 'react';
import {
  Mic,
  Smartphone,
  BookOpen,
  History,
  Sparkles,
  Image as ImageIcon,
  Sliders,
  Maximize2,
} from 'lucide-react';
import { BackdropModal } from './BackdropModal';

interface StudioBannerProps {
  activeMode: 'single' | 'dialogue';
  onModeChange: (mode: 'single' | 'dialogue') => void;
  onOpenAndroid: () => void;
  onOpenGuide: () => void;
  onOpenHistory: () => void;
  historyCount: number;
  onToggleFullPageWallpaper?: (active: boolean, url: string) => void;
}

export const StudioBanner: React.FC<StudioBannerProps> = ({
  activeMode,
  onModeChange,
  onOpenAndroid,
  onOpenGuide,
  onOpenHistory,
  historyCount,
  onToggleFullPageWallpaper,
}) => {
  const [bgUrl, setBgUrl] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('dhatwal_custom_backdrop') || '/dhatwal-valley-bg.svg';
    }
    return '/dhatwal-valley-bg.svg';
  });

  const [bgOpacity, setBgOpacity] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dhatwal_backdrop_opacity');
      return saved ? parseFloat(saved) : 0.65;
    }
    return 0.65;
  });

  const [fullPageWallpaper, setFullPageWallpaper] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('dhatwal_full_wallpaper') === 'true';
    }
    return false;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSelectBg = (url: string) => {
    setBgUrl(url);
    if (typeof window !== 'undefined') {
      localStorage.setItem('dhatwal_custom_backdrop', url);
    }
    if (onToggleFullPageWallpaper && fullPageWallpaper) {
      onToggleFullPageWallpaper(true, url);
    }
  };

  const handleChangeOpacity = (val: number) => {
    setBgOpacity(val);
    if (typeof window !== 'undefined') {
      localStorage.setItem('dhatwal_backdrop_opacity', val.toString());
    }
  };

  const handleToggleWallpaper = (active: boolean) => {
    setFullPageWallpaper(active);
    if (typeof window !== 'undefined') {
      localStorage.setItem('dhatwal_full_wallpaper', active ? 'true' : 'false');
    }
    if (onToggleFullPageWallpaper) {
      onToggleFullPageWallpaper(active, bgUrl);
    }
  };

  // Sync on initial mount
  useEffect(() => {
    if (onToggleFullPageWallpaper && fullPageWallpaper) {
      onToggleFullPageWallpaper(true, bgUrl);
    }
  }, []);

  return (
    <div className="space-y-3.5">
      {/* Top Controls Row above banner */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Mode Selector Pill */}
        <div className="flex items-center gap-1.5 p-1 bg-stone-200/80 rounded-full text-xs font-semibold shadow-inner">
          <button
            type="button"
            onClick={() => onModeChange('single')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full transition-all cursor-pointer ${
              activeMode === 'single'
                ? 'bg-rose-600 text-white shadow-xs font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Solo Narration</span>
          </button>

          <button
            type="button"
            onClick={() => onModeChange('dialogue')}
            className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
              activeMode === 'dialogue'
                ? 'bg-rose-600 text-white shadow-xs font-bold'
                : 'text-stone-600 hover:text-stone-900 font-medium'
            }`}
          >
            Dual Conversation
          </button>

          <span className="px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-700 border border-pink-200 text-[11px] font-bold">
            Gemini 3.8
          </span>
        </div>

        {/* Right Action buttons */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Backdrop Picture settings button */}
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-100/70 hover:bg-amber-200/80 text-amber-950 text-xs font-semibold transition-colors cursor-pointer shadow-2xs group"
            title="Dhatwal Mountain Sunrise Backdrop Picture"
          >
            <ImageIcon className="w-3.5 h-3.5 text-amber-700 group-hover:scale-110 transition-transform" />
            <span>Backdrop Picture</span>
          </button>

          <button
            type="button"
            onClick={onOpenAndroid}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Smartphone className="w-3.5 h-3.5 text-amber-700" />
            <span>Install Android</span>
          </button>

          <button
            type="button"
            onClick={onOpenGuide}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-medium transition-colors cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-stone-500" />
            <span>Accent Guide</span>
          </button>

          <button
            type="button"
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-medium transition-colors cursor-pointer"
          >
            <History className="w-3.5 h-3.5 text-stone-500" />
            <span>Library</span>
            <span className="w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center">
              {historyCount > 0 ? historyCount : 4}
            </span>
          </button>
        </div>
      </div>

      {/* Main Studio Banner Card with Dhatwal Valley Himalayan Sunrise Backdrop Picture */}
      <div className="relative rounded-2xl overflow-hidden border border-amber-400/40 shadow-sm min-h-[160px] flex items-center justify-between gap-6 p-6 sm:p-7 group">
        {/* Layer 1: The Mountain Sunrise Backdrop Picture */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <img
            src={bgUrl}
            alt="Dhatwal Himalayan Sunrise Panorama"
            className="w-full h-full object-cover object-[center_35%] transition-transform duration-1000 group-hover:scale-[1.03]"
            referrerPolicy="no-referrer"
            onError={(e) => {
              // Fallback to local SVG if custom image fails
              const target = e.currentTarget;
              if (target.src !== window.location.origin + '/dhatwal-valley-bg.svg') {
                target.src = '/dhatwal-valley-bg.svg';
              }
            }}
          />

          {/* Layer 2: Gradient Overlay to maintain high-contrast readability */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-amber-950/88 via-amber-900/75 to-stone-900/60"
            style={{ opacity: bgOpacity }}
          />
          {/* Subtle warm amber rim glow */}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/40 via-transparent to-amber-500/10 pointer-events-none" />
        </div>

        {/* Left vintage golden microphone art & Studio Branding */}
        <div className="relative z-10 flex items-center gap-4 sm:gap-6">
          <div className="w-16 h-20 sm:w-20 sm:h-24 shrink-0 relative flex items-center justify-center drop-shadow-lg">
            {/* Vintage Studio Mic Graphic */}
            <svg
              viewBox="0 0 100 120"
              className="w-full h-full drop-shadow-md"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Mic capsule outer frame */}
              <rect x="25" y="10" width="50" height="70" rx="25" fill="#f59e0b" />
              <rect x="28" y="13" width="44" height="64" rx="22" fill="#fef08a" />
              {/* Grille mesh lines */}
              <line x1="28" y1="28" x2="72" y2="28" stroke="#92400e" strokeWidth="2" />
              <line x1="28" y1="42" x2="72" y2="42" stroke="#92400e" strokeWidth="2" />
              <line x1="28" y1="56" x2="72" y2="56" stroke="#92400e" strokeWidth="2" />
              <line x1="38" y1="14" x2="38" y2="76" stroke="#92400e" strokeWidth="2" />
              <line x1="50" y1="12" x2="50" y2="78" stroke="#92400e" strokeWidth="2.5" />
              <line x1="62" y1="14" x2="62" y2="76" stroke="#92400e" strokeWidth="2" />
              {/* Metallic center band */}
              <rect x="25" y="44" width="50" height="6" fill="#78350f" />
              {/* U-shaped mount bracket */}
              <path
                d="M18 45 C18 85, 82 85, 82 45"
                stroke="#d97706"
                strokeWidth="5"
                strokeLinecap="round"
                fill="none"
              />
              {/* Swivel knobs */}
              <circle cx="18" cy="45" r="4.5" fill="#78350f" />
              <circle cx="82" cy="45" r="4.5" fill="#78350f" />
              {/* Base stem and pedestal */}
              <rect x="46" y="80" width="8" height="25" fill="#92400e" />
              <ellipse cx="50" cy="108" rx="26" ry="7" fill="#d97706" />
              <ellipse cx="50" cy="106" rx="22" ry="5" fill="#fbbf24" />
            </svg>
          </div>

          {/* Banner titles */}
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-300/30 text-amber-200 text-[10px] font-bold uppercase tracking-wider backdrop-blur-xs">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>Dhatwal Himalayan Voice Engine</span>
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight leading-tight drop-shadow-sm">
              Dhatwal Ki Awaaz Text-to-Speech Studio
            </h1>

            <p className="text-xs sm:text-sm text-amber-100/90 max-w-2xl leading-relaxed font-normal drop-shadow-xs">
              Experience authentic Indian phonetics, natural cadences, and distinct regional personas
              in Indian English and Hindi with high-fidelity studio speech synthesis.
            </p>
          </div>
        </div>

        {/* Right calligraphic banner typography & Quick Backdrop View */}
        <div className="hidden lg:flex flex-col items-end justify-between self-stretch relative z-10 text-right shrink-0">
          <div>
            <p className="font-serif italic text-xl text-amber-100 leading-tight tracking-wide drop-shadow-xs">
              Your Words
            </p>
            <p className="font-serif italic text-lg text-amber-300 font-bold leading-tight tracking-wide drop-shadow-xs">
              In Real Voices
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1 text-[11px] font-medium text-amber-200/80 hover:text-white bg-black/30 hover:bg-black/50 px-2.5 py-1 rounded-full border border-white/10 backdrop-blur-xs transition-colors cursor-pointer"
          >
            <Maximize2 className="w-3 h-3" />
            <span>Scenic View</span>
          </button>
        </div>
      </div>

      {/* Backdrop Picture Modal */}
      <BackdropModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentBgUrl={bgUrl}
        onSelectBg={handleSelectBg}
        opacity={bgOpacity}
        onChangeOpacity={handleChangeOpacity}
        fullPageWallpaper={fullPageWallpaper}
        onToggleFullPageWallpaper={handleToggleWallpaper}
      />
    </div>
  );
};


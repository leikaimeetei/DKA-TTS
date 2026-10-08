import React from 'react';
import {
  Volume2,
  Mic,
  FolderOpen,
  History,
  Sliders,
  Settings,
  Crown,
  ChevronRight,
  Radio,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenHistory: () => void;
  historyCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onOpenHistory,
  historyCount,
}) => {
  const navItems = [
    {
      id: 'tts',
      label: 'Text to Speech',
      icon: Volume2,
      action: () => onSelectTab('tts'),
      active: currentTab === 'tts',
      isPrimary: true,
    },
    {
      id: 'voices',
      label: 'Voice Library',
      icon: Mic,
      action: () => onSelectTab('voices'),
      active: currentTab === 'voices',
    },
    {
      id: 'cloning',
      label: 'Voice Cloning',
      icon: Radio,
      action: () => onSelectTab('cloning'),
      active: currentTab === 'cloning',
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: FolderOpen,
      action: () => onSelectTab('projects'),
      active: currentTab === 'projects',
    },
    {
      id: 'history',
      label: 'History',
      icon: History,
      action: onOpenHistory,
      active: false,
      badge: historyCount > 0 ? historyCount : undefined,
    },
    {
      id: 'studio',
      label: 'Studio',
      icon: Sliders,
      action: () => onSelectTab('studio'),
      active: currentTab === 'studio',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      action: () => onSelectTab('settings'),
      active: currentTab === 'settings',
    },
  ];

  return (
    <aside className="w-64 bg-[#111318] text-white flex flex-col shrink-0 border-r border-stone-800/80 min-h-screen select-none">
      {/* Top Brand Logo */}
      <div className="p-5 flex items-center gap-3 border-b border-stone-800/50">
        <div className="flex items-center gap-1.5 h-8">
          <span className="w-1.5 h-4 bg-orange-500 rounded-full animate-pulse" />
          <span className="w-1.5 h-6 bg-amber-400 rounded-full" />
          <span className="w-1.5 h-8 bg-orange-500 rounded-full" />
          <span className="w-1.5 h-5 bg-yellow-400 rounded-full" />
          <span className="w-1.5 h-3 bg-orange-400 rounded-full" />
        </div>
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-extrabold text-base tracking-tight text-white">
              Dhatwal Ki Awaaz
            </span>
          </div>
          <span className="text-[11px] font-bold tracking-widest text-amber-500/90 uppercase">
            TTS
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="p-3 space-y-1 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={item.action}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                item.isPrimary && item.active
                  ? 'bg-gradient-to-r from-orange-500 via-rose-500 to-indigo-600 text-white shadow-md shadow-orange-950/40 ring-1 ring-white/10'
                  : item.active
                  ? 'bg-stone-800 text-white'
                  : 'text-stone-400 hover:text-white hover:bg-stone-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-500/80 text-white">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Pro Plan Card */}
      <div className="p-3">
        <div className="p-3 bg-gradient-to-br from-stone-900 to-stone-950 border border-amber-500/30 rounded-2xl flex items-center justify-between gap-2.5 cursor-pointer hover:border-amber-500/50 transition-all shadow-sm group">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-stone-950 shadow-xs shrink-0">
              <Crown className="w-4 h-4 fill-current" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-400 group-hover:text-amber-300">
                Pro Plan
              </div>
              <p className="text-[10px] text-stone-400 line-clamp-1">
                Unlock all voices, customization & more
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-500 group-hover:text-amber-400 transition-colors shrink-0" />
        </div>
      </div>

      {/* Artistic Heritage Banner at Bottom */}
      <div className="p-3 pt-0">
        <div className="relative rounded-2xl overflow-hidden border border-amber-500/20 bg-gradient-to-b from-[#1c1815] via-[#241914] to-[#141217] p-4 text-center">
          {/* Subtle architectural background art */}
          <div className="absolute inset-0 opacity-25 pointer-events-none">
            <svg
              className="w-full h-full object-cover"
              viewBox="0 0 200 120"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10 120 V70 Q25 40 40 70 V120 M40 120 V50 Q55 20 70 50 V120 M70 120 V60 Q85 30 100 60 V120 M100 120 V45 Q115 15 130 45 V120 M130 120 V65 Q145 35 160 65 V120 M160 120 V75 Q175 45 190 75 V120"
                stroke="#f59e0b"
                strokeWidth="1.5"
                fill="none"
              />
              <circle cx="100" cy="30" r="14" fill="#ea580c" fillOpacity="0.3" />
            </svg>
          </div>

          <div className="relative z-10 space-y-0.5">
            <p className="font-serif italic text-sm text-amber-300/90 tracking-wide drop-shadow-xs">
              Your Words
            </p>
            <p className="font-serif italic text-xs text-orange-200/80 tracking-wide">
              Our Voice
            </p>
            <p className="font-serif italic text-xs text-amber-400/90 font-semibold tracking-wider">
              Limitless Possibilities
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

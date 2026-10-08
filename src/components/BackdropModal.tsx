import React, { useRef, useState } from 'react';
import {
  Image as ImageIcon,
  Upload,
  RotateCcw,
  Sliders,
  Check,
  X,
  Maximize2,
  Sparkles,
  Sun,
  Eye,
} from 'lucide-react';

interface BackdropModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBgUrl: string;
  onSelectBg: (url: string) => void;
  opacity: number;
  onChangeOpacity: (val: number) => void;
  fullPageWallpaper: boolean;
  onToggleFullPageWallpaper: (val: boolean) => void;
}

export const BackdropModal: React.FC<BackdropModalProps> = ({
  isOpen,
  onClose,
  currentBgUrl,
  onSelectBg,
  opacity,
  onChangeOpacity,
  fullPageWallpaper,
  onToggleFullPageWallpaper,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Image size exceeds 10MB limit. Please choose a smaller file.');
      return;
    }

    setUploadError(null);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onSelectBg(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetDefault = () => {
    onSelectBg('/dhatwal-valley-bg.svg');
    onChangeOpacity(0.75);
    setUploadError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white shadow-xs">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900">
                Studio Picture & Background Settings
              </h3>
              <p className="text-[11px] text-stone-500">
                Dhatwal Ki Awaaz Himalayan sunrise panorama and custom backup picture
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-stone-200/70 text-stone-500 hover:text-stone-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Main Panorama Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-stone-700">
              <span className="flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                Dhatwal Valley Sunrise Panorama (Active Backdrop)
              </span>
              <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                Authentic Himalayan Foothills
              </span>
            </div>

            <div className="relative rounded-2xl overflow-hidden border border-stone-200 shadow-inner aspect-[21/9] bg-stone-950 group">
              <img
                src={currentBgUrl || '/dhatwal-valley-bg.svg'}
                alt="Dhatwal Ki Awaaz Himalayan Valley"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-stone-950/20 pointer-events-none"
                style={{ opacity: opacity }}
              />

              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white pointer-events-none">
                <div>
                  <div className="text-xs font-bold drop-shadow-md">
                    Dhatwal Himalayan Foothills
                  </div>
                  <div className="text-[10px] text-amber-200/90 drop-shadow-xs">
                    Sunrise over mountain hamlets, winding highway & snow peaks
                  </div>
                </div>
                <div className="bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-medium border border-white/20">
                  Studio Artwork
                </div>
              </div>
            </div>
          </div>

          {/* Controls: Opacity & Appearance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Opacity Slider */}
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/70 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-stone-800 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-stone-500" />
                  Dark Overlay Tint
                </span>
                <span className="font-bold text-amber-700">
                  {Math.round(opacity * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.2"
                max="0.95"
                step="0.05"
                value={opacity}
                onChange={(e) => onChangeOpacity(parseFloat(e.target.value))}
                className="w-full accent-amber-600 cursor-pointer h-1.5 bg-stone-200 rounded-lg"
              />
              <p className="text-[10px] text-stone-500">
                Adjusts dark contrast behind banner text for optimal readability.
              </p>
            </div>

            {/* Full-Page Backdrop Switch */}
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/70 flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="text-xs font-semibold text-stone-800">
                  Full Page Wallpaper
                </div>
                <p className="text-[10px] text-stone-500">
                  Also cast a soft scenic Himalayan backdrop behind the entire studio.
                </p>
              </div>

              <button
                type="button"
                onClick={() => onToggleFullPageWallpaper(!fullPageWallpaper)}
                className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer shrink-0 ${
                  fullPageWallpaper ? 'bg-amber-600' : 'bg-stone-300'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow-xs transition-transform ${
                    fullPageWallpaper ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Upload Custom Backup Picture */}
          <div className="p-4 bg-gradient-to-r from-amber-50/70 to-orange-50/50 rounded-2xl border border-amber-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-amber-700" />
                <span className="text-xs font-bold text-amber-900">
                  Upload Custom Picture
                </span>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Choose Picture</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            <p className="text-[11px] text-amber-800/80 leading-relaxed">
              You can choose any image file from your device to use as the backup picture for Dhatwal Ki Awaaz Text-to-Speech Studio. Your custom picture is saved in your browser.
            </p>

            {uploadError && (
              <div className="text-xs text-rose-600 font-medium">
                {uploadError}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-stone-100 bg-stone-50/90 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleResetDefault}
            className="flex items-center gap-1.5 text-xs text-stone-600 hover:text-stone-900 font-semibold cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-stone-400" />
            <span>Reset to Dhatwal Panorama</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

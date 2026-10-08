import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { AndroidInstallModal } from './AndroidInstallModal';
import { Smartphone, Download, Check } from 'lucide-react';

interface PWAInstallButtonProps {
  variant?: 'nav' | 'banner';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'nav' }) => {
  const { isInstallable, isInstalled, isAndroid, isIOS, install } = usePWAInstall();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // If already running standalone inside Android/desktop PWA wrapper, hide prompt
  if (isInstalled) {
    return null;
  }

  const handleAction = async () => {
    if (isInstallable) {
      const success = await install();
      if (!success) {
        setIsModalOpen(true);
      }
    } else {
      setIsModalOpen(true);
    }
  };

  if (variant === 'banner') {
    return (
      <>
        <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-rose-700 text-white px-4 py-2.5 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 shrink-0" />
            <span className="font-semibold">Get DKA -TTS for Android</span>
            <span className="hidden sm:inline text-orange-200">· Fast native launch & offline library</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAction}
              className="px-3 py-1 bg-white text-orange-900 rounded-md font-bold hover:bg-orange-50 transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install App</span>
            </button>
          </div>
        </div>

        <AndroidInstallModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          isInstallable={isInstallable}
          onInstall={install}
          isAndroid={isAndroid}
          isIOS={isIOS}
        />
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={handleAction}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-orange-50 border border-orange-200 text-orange-800 hover:bg-orange-100 hover:border-orange-300 transition-colors shadow-xs cursor-pointer"
        title="Install Android App / Add to Home Screen"
      >
        <Smartphone className="w-3.5 h-3.5 text-orange-700" />
        <span className="hidden sm:inline">Install Android App</span>
        <span className="sm:hidden">Install</span>
      </button>

      <AndroidInstallModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isInstallable={isInstallable}
        onInstall={install}
        isAndroid={isAndroid}
        isIOS={isIOS}
      />
    </>
  );
};

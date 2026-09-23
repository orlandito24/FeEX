import React, { useState } from 'react';
import { Smartphone, Monitor, QrCode, X, Copy, Check, ExternalLink } from 'lucide-react';
import { DeviceFrameMode } from '../types';

interface DeviceSimulatorProps {
  deviceMode: DeviceFrameMode;
  onDeviceModeChange: (mode: DeviceFrameMode) => void;
  children: React.ReactNode;
}

export const DeviceSimulator: React.FC<DeviceSimulatorProps> = ({
  deviceMode,
  onDeviceModeChange,
  children,
}) => {
  const [showQrModal, setShowQrModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currentTimeStr, setCurrentTimeStr] = useState(() => {
    const d = new Date();
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  });

  React.useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      setCurrentTimeStr(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // QR Code generator using quick SVG
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    currentUrl
  )}&bgcolor=2e101d&color=fff0f5&margin=1`;

  return (
    <div className="flex flex-col min-h-screen bg-[#12070c] text-[#fff0f5]">
      {/* Top Simulator Toolbar (subtle, clean, non-intrusive) */}
      <header className="flex items-center justify-between px-4 py-2 bg-[#1a0b12] border-b border-[#4a152d] z-30">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#d9b8c7]">
            Stopwatches
          </span>
          <span className="hidden sm:inline text-[11px] text-[#94687e] border-l border-[#4a152d] pl-2">
            iOS / Android Ready
          </span>
        </div>

        {/* Device Switcher */}
        <div className="flex items-center gap-1 bg-[#280e1a] p-1 rounded-xl border border-[#4a152d]">
          <button
            id="view-mode-responsive"
            onClick={() => onDeviceModeChange('responsive')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
              deviceMode === 'responsive'
                ? 'bg-[#5c1b3a] text-[#fff0f5] shadow-sm'
                : 'text-[#b895a6] hover:text-[#fff0f5]'
            }`}
            title="Full Screen / Responsive"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Fluid</span>
          </button>

          <button
            id="view-mode-iphone"
            onClick={() => onDeviceModeChange('iphone')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
              deviceMode === 'iphone'
                ? 'bg-[#5c1b3a] text-[#fff0f5] shadow-sm'
                : 'text-[#b895a6] hover:text-[#fff0f5]'
            }`}
            title="iPhone Frame Simulator"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>iPhone</span>
          </button>

          <button
            id="view-mode-android"
            onClick={() => onDeviceModeChange('android')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
              deviceMode === 'android'
                ? 'bg-[#5c1b3a] text-[#fff0f5] shadow-sm'
                : 'text-[#b895a6] hover:text-[#fff0f5]'
            }`}
            title="Android Frame Simulator"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Android</span>
          </button>
        </div>

        {/* Test on Phone QR Button */}
        <div className="flex items-center gap-2">
          <button
            id="test-on-phone-btn"
            onClick={() => setShowQrModal(true)}
            className="flex items-center gap-1.5 bg-[#361122] hover:bg-[#4a152d] text-[#ff9fc0] border border-[#5c1b3a] px-3 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95"
            title="Open on physical iPhone or Android device"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Test on Phone</span>
          </button>
        </div>
      </header>

      {/* Main Canvas Area */}
      <main className="flex-1 flex items-center justify-center p-0 sm:p-4 overflow-y-auto">
        {deviceMode === 'responsive' ? (
          <div className="w-full max-w-md h-full min-h-[620px] flex flex-col bg-[#1a0b12] shadow-[0_0_50px_rgba(255,117,160,0.12)] sm:rounded-3xl sm:border sm:border-[#4a152d] sm:my-auto overflow-hidden">
            {children}
          </div>
        ) : deviceMode === 'iphone' ? (
          <div className="relative my-auto flex flex-col w-[385px] h-[780px] bg-[#1a0b12] rounded-[52px] border-[10px] border-[#4a152d] shadow-[0_0_50px_rgba(255,117,160,0.15),inset_0_0_4px_rgba(255,255,255,0.08)] overflow-hidden ring-1 ring-white/10">
            {/* iPhone Notch / Dynamic Island */}
            <div className="absolute top-2.5 inset-x-0 flex justify-center z-40 pointer-events-none">
              <div className="w-28 h-6 bg-black rounded-full flex items-center justify-between px-3">
                <div className="w-2.5 h-2.5 rounded-full bg-[#111] border border-white/5" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#3c1225] border border-pink-500/20" />
              </div>
            </div>

            {/* iOS Status Bar */}
            <div className="pt-3 px-7 pb-1 flex items-center justify-between text-[11px] font-semibold text-[#d9b8c7] select-none z-30">
              <span>{currentTimeStr}</span>
              <div className="flex items-center gap-1.5 text-[10px]">
                <div className="flex gap-0.5 items-end h-2.5">
                  <span className="w-0.5 h-1 bg-white rounded-xs" />
                  <span className="w-0.5 h-1.5 bg-white rounded-xs" />
                  <span className="w-0.5 h-2 bg-white rounded-xs" />
                  <span className="w-0.5 h-2.5 bg-white rounded-xs" />
                </div>
                <span>5G</span>
                <div className="w-4 h-2 border border-white/80 rounded-xs p-0.5 flex items-center">
                  <div className="h-full w-2.5 bg-white rounded-2xs" />
                </div>
              </div>
            </div>

            {/* Inner Content */}
            <div className="flex-1 flex flex-col overflow-hidden pb-4">
              {children}
            </div>

            {/* iOS Home Indicator Bar */}
            <div className="pb-2 pt-1 flex justify-center pointer-events-none">
              <div className="w-32 h-1 bg-white/40 rounded-full" />
            </div>
          </div>
        ) : (
          /* Android Frame */
          <div className="relative my-auto flex flex-col w-[385px] h-[780px] bg-[#1a0b12] rounded-[44px] border-[8px] border-[#4a152d] shadow-[0_0_50px_rgba(255,117,160,0.15)] overflow-hidden ring-1 ring-white/10">
            {/* Android Camera Punch Hole */}
            <div className="absolute top-3 inset-x-0 flex justify-center z-40 pointer-events-none">
              <div className="w-3.5 h-3.5 bg-black rounded-full border border-[#4a152d]" />
            </div>

            {/* Android Status Bar */}
            <div className="pt-2 px-6 pb-1 flex items-center justify-between text-[11px] font-medium text-[#d9b8c7] select-none z-30">
              <span>{currentTimeStr}</span>
              <div className="flex items-center gap-2 text-[11px]">
                <span>98%</span>
                <div className="w-2.5 h-3 border border-white/80 rounded-2xs p-0.5 flex items-end">
                  <div className="w-full h-2 bg-white" />
                </div>
              </div>
            </div>

            {/* Inner Content */}
            <div className="flex-1 flex flex-col overflow-hidden pb-2">
              {children}
            </div>

            {/* Android Navigation Pill */}
            <div className="pb-2 flex justify-center pointer-events-none">
              <div className="w-20 h-1 bg-white/30 rounded-full" />
            </div>
          </div>
        )}
      </main>

      {/* Test on Phone / QR Code Modal */}
      {showQrModal && (
        <div 
          id="qr-modal-backdrop"
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowQrModal(false)}
        >
          <div 
            id="qr-modal-content"
            className="bg-[#2e101d] border border-[#5c1b3a] rounded-3xl p-6 max-w-sm w-full shadow-2xl flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex w-full items-center justify-between pb-3 border-b border-[#4a152d] mb-4">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-[#ff75a0]" />
                <span className="text-sm font-bold text-[#fff0f5]">Test on iPhone or Android</span>
              </div>
              <button
                id="close-qr-modal"
                onClick={() => setShowQrModal(false)}
                className="rounded-full p-1 text-[#b895a6] hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#c49db0] mb-4">
              Open your camera app on your iPhone or Android phone and scan this QR code to run the stopwatch natively:
            </p>

            <div className="p-3 bg-[#1a0b12] rounded-2xl border border-[#4a152d] shadow-inner mb-4">
              <img
                src={qrCodeUrl}
                alt="Scan to test on iPhone or Android"
                className="w-48 h-48 rounded-lg"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="flex items-center gap-2 w-full">
              <button
                id="copy-url-btn"
                onClick={handleCopy}
                className="flex-1 flex items-center justify-center gap-1.5 bg-[#381323] hover:bg-[#4a152d] text-[#fff0f5] border border-[#5c1b3a] py-2 px-3 rounded-xl text-xs font-semibold transition-all active:scale-95"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Link Copied!' : 'Copy Link'}</span>
              </button>

              <a
                href={currentUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1 bg-[#ff75a0] hover:bg-[#ff85ab] text-[#1a0b12] py-2 px-3 rounded-xl text-xs font-bold transition-all active:scale-95"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>New Tab</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

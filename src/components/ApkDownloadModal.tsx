/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { sound } from '../game/sound';

interface ApkDownloadModalProps {
  onClose: () => void;
}

export const ApkDownloadModal: React.FC<ApkDownloadModalProps> = ({ onClose }) => {
  const [copied, setCopied] = useState(false);

  const gitPushCommand = `git add . && git commit -m "Add AdMob integration & Android Capacitor build" && git push origin main`;

  const handleCopy = () => {
    sound.playTap();
    navigator.clipboard.writeText(gitPushCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in select-none">
      <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-blue-900 via-indigo-950 to-blue-950 border-4 border-yellow-400 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.9)] text-white flex flex-col">
        
        {/* Close Button */}
        <button
          onClick={() => {
            sound.playTap();
            onClose();
          }}
          className="absolute -top-3 -right-3 w-9 h-9 rounded-full bg-red-600 border-2 border-yellow-300 flex items-center justify-center text-white font-bold shadow-lg active:scale-95 transition-transform"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="text-center mb-3">
          <div className="inline-block px-3 py-0.5 rounded-full bg-yellow-400/20 border border-yellow-400 text-yellow-300 text-[10px] font-black uppercase tracking-wider mb-1">
            Android APK & AAB
          </div>
          <div className="flex items-center justify-center gap-2 mb-1">
            <img 
              src="/icon.png" 
              alt="Royal Dream Match Icon" 
              className="w-10 h-10 rounded-xl shadow-md border-2 border-yellow-400"
            />
            <h3
              className="text-xl font-black text-white"
              style={{ fontFamily: "'Fredoka', sans-serif" }}
            >
              Royal-Dream-Match.apk
            </h3>
          </div>
          <p className="text-xs text-blue-200">
            Playable Android build with custom crown launcher icon & AdMob
          </p>
        </div>

        {/* Technical Specs Card */}
        <div className="bg-blue-950/80 rounded-2xl p-3 border border-yellow-400/30 flex flex-col gap-1.5 text-xs mb-3">
          <div className="flex justify-between items-center py-0.5 border-b border-blue-800/60">
            <span className="text-blue-300 font-medium">Output APK:</span>
            <span className="font-mono font-bold text-yellow-300">Royal-Dream-Match.apk</span>
          </div>
          <div className="flex justify-between items-center py-0.5 border-b border-blue-800/60">
            <span className="text-blue-300 font-medium">Launcher Icon:</span>
            <span className="font-bold text-amber-300">Crown + Gems (512x512)</span>
          </div>
          <div className="flex justify-between items-center py-0.5 border-b border-blue-800/60">
            <span className="text-blue-300 font-medium">Package Name:</span>
            <span className="font-mono font-bold text-yellow-300">com.royaldream.match</span>
          </div>
          <div className="flex justify-between items-center py-0.5 border-b border-blue-800/60">
            <span className="text-blue-300 font-medium">Version:</span>
            <span className="font-bold text-white">v1.0.0 (Code 1)</span>
          </div>
          <div className="flex justify-between items-center py-0.5 border-b border-blue-800/60">
            <span className="text-blue-300 font-medium">Environment:</span>
            <span className="font-bold text-emerald-400">Node.js 22 & Java 21</span>
          </div>
          <div className="flex justify-between items-center py-0.5">
            <span className="text-blue-300 font-medium">AdMob Status:</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400 text-[10px] font-black text-emerald-300">
              READY (Test/Live)
            </span>
          </div>
        </div>

        {/* GitHub Workflow Info */}
        <div className="bg-blue-950/60 rounded-2xl p-3 border border-blue-800 mb-3 flex flex-col gap-2 text-xs">
          <div className="font-bold text-yellow-300 flex items-center gap-1.5">
            <span>🚀</span> Automatic GitHub Actions Build
          </div>
          <p className="text-[11px] text-blue-200 leading-relaxed">
            The GitHub Actions workflow (<code className="text-yellow-200">.github/workflows/build-apk.yml</code>) compiles the APK and AAB automatically on every push and publishes it as a downloadable release artifact!
          </p>

          <button
            onClick={handleCopy}
            className="w-full py-2 rounded-xl bg-blue-900 hover:bg-blue-800 border border-yellow-400/60 text-yellow-200 font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <span>📋</span>
            <span>{copied ? 'Command Copied!' : 'Copy Git Push Command'}</span>
          </button>
        </div>

        {/* Installation Instructions */}
        <div className="text-[11px] text-blue-200 bg-blue-950/40 p-2.5 rounded-xl border border-blue-800 mb-3">
          <div className="font-bold text-white mb-1">How to Install on Phone:</div>
          <ol className="list-decimal list-inside space-y-0.5">
            <li>Download the generated <code className="text-yellow-300">.apk</code> file.</li>
            <li>Tap the file on your Android device.</li>
            <li>Allow &quot;Install from unknown sources&quot; when prompted.</li>
            <li>Enjoy Royal Dream Match on Android!</li>
          </ol>
        </div>

        {/* Close Button */}
        <button
          onClick={() => {
            sound.playTap();
            onClose();
          }}
          className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-500 text-blue-950 font-black text-xs uppercase tracking-wider shadow active:scale-95 transition-transform"
        >
          OK, GOT IT!
        </button>
      </div>
    </div>
  );
};

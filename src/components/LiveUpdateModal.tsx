/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { OtaManifest } from '../config/ota';
import { otaService, OtaState } from '../services/otaService';
import { sound } from '../game/sound';

interface LiveUpdateModalProps {
  manifest: OtaManifest;
  otaState: OtaState;
  onClose: () => void;
}

export const LiveUpdateModal: React.FC<LiveUpdateModalProps> = ({
  manifest,
  otaState,
  onClose,
}) => {
  const [downloading, setDownloading] = useState(false);
  const isReady = otaState.status === 'ready';

  const handleStartUpdate = async () => {
    sound.playTap();
    setDownloading(true);
    await otaService.downloadAndApplyUpdate(manifest);
    sound.playVictory();
  };

  const handleApplyAndRestart = () => {
    sound.playTap();
    otaService.applyAndReload();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in select-none">
      <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#330f57] via-[#21093b] to-[#140424] border-4 border-amber-400 p-5 shadow-[0_12px_45px_rgba(0,0,0,0.95)] text-white flex flex-col items-center text-center">
        
        {/* Close Button (if not downloading or mandatory) */}
        {!downloading && !manifest.mandatory && (
          <button
            onClick={() => {
              sound.playTap();
              onClose();
            }}
            className="absolute -top-3 -right-3 w-9 h-9 rounded-full bg-gradient-to-b from-rose-500 to-rose-700 border-2 border-amber-300 flex items-center justify-center text-white font-black shadow-lg active:scale-95 transition-transform"
          >
            ✕
          </button>
        )}

        {/* Crown Badge */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-600 border-2 border-white flex items-center justify-center text-3xl shadow-[0_4px_20px_rgba(245,158,11,0.5)] mb-3 animate-bounce">
          👑
        </div>

        {/* Header Title */}
        <h3
          className="text-xl font-black text-amber-300 mb-1"
          style={{ fontFamily: "'Fredoka', sans-serif" }}
        >
          {isReady ? 'Royal Update Ready!' : 'New Live Update Available!'}
        </h3>

        <div className="inline-block px-3 py-0.5 rounded-full bg-amber-400/20 border border-amber-400 text-amber-300 text-[10px] font-black uppercase tracking-wider mb-3">
          Version {manifest.version} (Build {manifest.build})
        </div>

        {/* Version Compare Banner */}
        <div className="w-full bg-[#1b0830]/90 rounded-2xl p-2.5 border border-amber-400/30 flex items-center justify-between text-xs mb-3">
          <div className="flex flex-col text-left">
            <span className="text-[10px] text-purple-300">Installed:</span>
            <span className="font-bold text-white">v{otaState.currentVersion}</span>
          </div>
          <span className="text-amber-400 text-base font-bold">➔</span>
          <div className="flex flex-col text-right">
            <span className="text-[10px] text-purple-300">New Version:</span>
            <span className="font-black text-emerald-400">v{manifest.version}</span>
          </div>
        </div>

        {/* Release Notes */}
        <div className="w-full text-left mb-3">
          <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block mb-1">
            📜 What&apos;s New:
          </span>
          <div className="p-3 rounded-2xl bg-[#110321] border border-purple-800 text-xs text-purple-100 max-h-28 overflow-y-auto leading-relaxed whitespace-pre-line">
            {manifest.releaseNotes}
          </div>
        </div>

        {/* Download Progress Bar (When downloading) */}
        {downloading && (
          <div className="w-full mb-3 flex flex-col gap-1.5">
            <div className="w-full h-3.5 rounded-full bg-purple-950/90 border border-amber-400 p-0.5 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 transition-all duration-150"
                style={{ width: `${otaState.downloadProgress}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-bold text-amber-200">
              <span>{isReady ? 'Installing bundle...' : 'Downloading live update...'}</span>
              <span>{otaState.downloadProgress}%</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2 mt-1">
          {isReady ? (
            <button
              onClick={handleApplyAndRestart}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 border-2 border-emerald-300 text-white font-black text-sm uppercase tracking-wider shadow-lg active:scale-95 transition-transform animate-pulse"
            >
              🔄 RESTART & PLAY NOW
            </button>
          ) : downloading ? (
            <button
              disabled
              className="w-full py-3 rounded-2xl bg-purple-950/60 border border-purple-700 text-purple-300 font-bold text-xs uppercase tracking-wider"
            >
              DOWNLOADING...
            </button>
          ) : (
            <div className="flex gap-2 w-full">
              {!manifest.mandatory && (
                <button
                  onClick={() => {
                    sound.playTap();
                    onClose();
                  }}
                  className="flex-1 py-2.5 rounded-2xl bg-[#1b0830] border border-purple-700 text-purple-300 font-bold text-xs hover:bg-[#250b42] active:scale-95 transition-transform"
                >
                  Later
                </button>
              )}
              <button
                onClick={handleStartUpdate}
                className="flex-2 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 font-black text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-transform"
              >
                ⚡ UPDATE NOW (FREE)
              </button>
            </div>
          )}
        </div>

        {/* Footer Note */}
        <p className="text-[9px] text-purple-300 mt-2">
          OTA Live Update downloads only updated game files without reinstalling the APK.
        </p>
      </div>
    </div>
  );
};

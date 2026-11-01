/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { admobService } from '../services/admobService';

interface AdMobInterstitialModalProps {
  countdown: number;
  onClose: () => void;
}

export const AdMobInterstitialModal: React.FC<AdMobInterstitialModalProps> = ({
  countdown,
  onClose,
}) => {
  const config = admobService.getConfig();
  const canSkip = countdown <= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in select-none">
      <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-slate-900 via-neutral-950 to-black border-4 border-slate-700 p-5 shadow-2xl text-white flex flex-col items-center text-center">
        
        {/* Top Ad Info Bar */}
        <div className="w-full flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 rounded bg-amber-400 text-[10px] font-black text-black">
              Ad
            </span>
            <span className="text-xs font-bold text-slate-300">
              {config.testMode ? 'Google AdMob (Test Mode)' : 'Google AdMob'}
            </span>
          </div>

          {/* Close button with countdown */}
          {canSkip ? (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-700 hover:bg-slate-600 border border-slate-500 flex items-center justify-center text-white font-bold text-sm shadow active:scale-95 transition-transform"
            >
              ✕
            </button>
          ) : (
            <div className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-600 text-xs font-bold text-slate-300">
              Skip in {countdown}s
            </div>
          )}
        </div>

        {/* Ad Unit & Policy Tag */}
        <div className="my-2 text-[10px] text-slate-400 font-mono">
          Unit ID: {config.interstitial.android}
        </div>

        {/* Interstitial Ad Creative Preview */}
        <div className="w-full my-4 p-4 rounded-2xl bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 border border-indigo-700/50 flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-yellow-400 to-amber-600 border-2 border-white flex items-center justify-center text-3xl shadow-lg">
            👑
          </div>
          <div>
            <h3 className="text-lg font-black text-white">Royal Castle Builders</h3>
            <p className="text-xs text-indigo-200 mt-1">
              Construct towering fortresses, defend the royal kingdom, and conquer new realms!
            </p>
          </div>

          <button
            onClick={() => {
              alert('Google AdMob: Interactive Interstitial Test Ad completed.');
              onClose();
            }}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 border-2 border-emerald-300 text-white font-black text-sm uppercase tracking-wider shadow-lg active:scale-95 transition-transform"
          >
            PLAY NOW FOR FREE
          </button>
        </div>

        {/* Compliance Footer */}
        <p className="text-[10px] text-slate-400">
          This is an official Google AdMob compliant interstitial advertisement.
        </p>
      </div>
    </div>
  );
};

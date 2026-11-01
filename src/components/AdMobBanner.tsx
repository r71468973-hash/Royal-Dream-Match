/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { admobService } from '../services/admobService';

interface AdMobBannerProps {
  className?: string;
}

export const AdMobBanner: React.FC<AdMobBannerProps> = ({ className = '' }) => {
  const [closed, setClosed] = useState(false);
  const [feedback, setFeedback] = useState(false);
  const config = admobService.getConfig();

  if (closed) return null;

  return (
    <div
      className={`relative w-full max-w-sm mx-auto h-12 bg-gradient-to-r from-slate-900 via-neutral-900 to-slate-900 border-t border-slate-700/80 flex items-center justify-between px-2.5 shadow-lg select-none z-30 ${className}`}
    >
      {/* Left Ad Identifier Badge */}
      <div className="flex items-center gap-1.5">
        <span className="px-1 py-0.5 rounded bg-amber-400 text-[9px] font-black text-black uppercase tracking-wider">
          Ad
        </span>
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-bold text-white tracking-wide">
              {config.testMode ? 'Test Ad: Google AdMob' : 'Sponsored Royal Games'}
            </span>
            {config.testMode && (
              <span className="px-1 py-0.2 rounded bg-emerald-500/30 text-[8px] font-extrabold text-emerald-300">
                TEST
              </span>
            )}
          </div>
          <span className="text-[9px] text-slate-400 line-clamp-1">
            Play thrilling match-3 puzzles with millions of players worldwide!
          </span>
        </div>
      </div>

      {/* Right Action / Close Button */}
      <div className="flex items-center gap-1.5 ml-1">
        <button
          onClick={() => {
            setFeedback(true);
            setTimeout(() => setFeedback(false), 2500);
          }}
          className="px-2 py-1 rounded bg-amber-500 hover:bg-amber-400 text-[10px] font-bold text-amber-950 shadow transition-colors"
        >
          {feedback ? 'OPENING...' : 'INSTALL'}
        </button>

        <button
          onClick={() => setClosed(true)}
          className="text-slate-400 hover:text-white text-xs px-1"
          title="Dismiss ad"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

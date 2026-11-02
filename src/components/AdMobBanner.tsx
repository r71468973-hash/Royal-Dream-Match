/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ADMOB_CONFIG, getActiveBannerUnitId } from '../config/admob';

interface AdMobBannerProps {
  className?: string;
  forceTestMode?: boolean;
}

export const AdMobBanner: React.FC<AdMobBannerProps> = ({
  className = '',
  forceTestMode,
}) => {
  const activeUnitId = getActiveBannerUnitId(forceTestMode);
  const isTest = forceTestMode !== undefined ? forceTestMode : ADMOB_CONFIG.isTestMode;

  return (
    <div
      className={`w-full max-w-sm mx-auto h-[50px] bg-[#0c0418] border-t border-b border-amber-400/40 shadow-inner flex items-center justify-between px-3 select-none overflow-hidden relative ${className}`}
      role="banner"
      aria-label="Google AdMob Advertisement"
    >
      {/* Background Subtle Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-950/80 via-indigo-950/70 to-purple-950/80 pointer-events-none" />

      {/* Ad Tag Badge */}
      <div className="relative z-10 flex items-center gap-2">
        <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-amber-400 text-purple-950 shadow-sm">
          Ad
        </span>
        <div className="flex flex-col text-left">
          <span className="text-[11px] font-bold text-amber-200 leading-tight">
            {isTest ? 'Google AdMob (Test Ad)' : 'Sponsored Royal Puzzle'}
          </span>
          <span className="text-[8px] font-mono text-purple-300 truncate max-w-[170px]">
            {isTest ? 'Test ID: ...78111' : activeUnitId}
          </span>
        </div>
      </div>

      {/* Right-side Google AdMob Branding Tag */}
      <div className="relative z-10 flex items-center gap-1.5">
        <div className="flex flex-col items-end">
          <span className="text-[9px] font-bold text-yellow-300/90 flex items-center gap-1">
            <span>Google</span>
            <span className="text-white">AdMob</span>
          </span>
          <span className="text-[7px] text-purple-300">
            {isTest ? 'Official Sample Test' : 'Live Banner'}
          </span>
        </div>
        <div className="w-5 h-5 rounded-full bg-amber-400/20 border border-amber-300/40 flex items-center justify-center text-[10px] text-amber-300">
          ⓘ
        </div>
      </div>
    </div>
  );
};

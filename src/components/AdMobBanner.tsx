/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { showRealNativeBanner, hideRealNativeBanner } from '../services/nativeAdMob';

interface AdMobBannerProps {
  className?: string;
}

export const AdMobBanner: React.FC<AdMobBannerProps> = ({
  className = '',
}) => {
  useEffect(() => {
    // Mount native banner on Android device
    showRealNativeBanner();
    return () => {
      hideRealNativeBanner();
    };
  }, []);

  return (
    <div
      className={`w-full max-w-sm mx-auto h-[50px] bg-[#0c0418] border-t border-b border-amber-400/30 shadow-inner flex items-center justify-between px-3 select-none overflow-hidden relative shrink-0 ${className}`}
      role="banner"
      aria-label="Google AdMob Advertisement"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-purple-950/70 via-indigo-950/60 to-purple-950/70 pointer-events-none" />

      {/* Discreet Ad Badge (Zero Developer IDs Displayed) */}
      <div className="relative z-10 flex items-center gap-2">
        <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-amber-400 text-purple-950 shadow-sm">
          Ad
        </span>
        <span className="text-[11px] font-bold text-amber-200">
          Google AdMob Banner
        </span>
      </div>

      <div className="relative z-10 flex items-center gap-1.5">
        <span className="text-[9px] font-bold text-yellow-300/90 flex items-center gap-0.5">
          <span>Google</span>
          <span className="text-white">AdMob</span>
        </span>
        <div className="w-4 h-4 rounded-full bg-amber-400/20 border border-amber-300/40 flex items-center justify-center text-[9px] text-amber-300">
          ⓘ
        </div>
      </div>
    </div>
  );
};

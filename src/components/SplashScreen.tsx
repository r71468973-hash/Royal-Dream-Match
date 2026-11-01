/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { RoyalLogo } from './RoyalLogo';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const duration = 1800; // 1.8 seconds smooth load

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgress(pct);

      if (pct >= 100) {
        clearInterval(timer);
        setTimeout(() => {
          onFinish();
        }, 200);
      }
    }, 30);

    return () => clearInterval(timer);
  }, [onFinish]);

  return (
    <div
      onClick={onFinish}
      className="relative w-full h-full flex flex-col items-center justify-between py-12 px-6 bg-gradient-to-b from-[#0b1b3d] via-[#102d68] to-[#081329] select-none cursor-pointer overflow-hidden"
    >
      {/* Background Starry Glow & Vignette */}
      <div className="absolute inset-0 bg-radial from-blue-500/20 via-transparent to-black/60 pointer-events-none" />

      {/* Floating Sparkles in Background */}
      <div className="absolute top-1/4 left-10 text-yellow-300 text-lg animate-ping">✦</div>
      <div className="absolute top-1/3 right-8 text-amber-200 text-sm animate-pulse">✨</div>
      <div className="absolute bottom-1/3 left-12 text-blue-200 text-xs animate-bounce">✦</div>
      <div className="absolute top-16 right-16 text-yellow-100 text-xl animate-pulse">✦</div>

      {/* Castle Silhouette at bottom */}
      <div className="absolute bottom-0 inset-x-0 h-44 opacity-25 pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 400 150" preserveAspectRatio="none" fill="#030712">
          <path d="M0 150 L0 100 L40 100 L40 60 L60 40 L80 60 L80 100 L120 100 L140 30 L160 30 L180 100 L220 100 L240 10 L260 10 L280 100 L320 100 L340 50 L360 50 L360 100 L400 100 L400 150 Z" />
        </svg>
      </div>

      {/* Top Banner Tag */}
      <div className="relative z-10 flex items-center gap-2 px-4 py-1 rounded-full bg-blue-900/60 border border-yellow-300/40 backdrop-blur-sm shadow-md">
        <span className="text-yellow-400 text-xs">👑</span>
        <span className="text-yellow-200 text-xs font-semibold tracking-wider uppercase">
          Royal Match-3 Adventure
        </span>
      </div>

      {/* Central Animated Royal Logo */}
      <div className="relative z-10 flex flex-col items-center gap-4 my-auto">
        <RoyalLogo size="lg" animated={true} />

        <p className="text-blue-200 text-sm font-medium tracking-wide mt-2 text-center drop-shadow">
          Kingdom Puzzles & Royal Treasures
        </p>
      </div>

      {/* Bottom Loading Progress Bar */}
      <div className="relative z-10 w-full max-w-xs flex flex-col items-center gap-2">
        <div className="w-full h-4 rounded-full bg-blue-950/80 border-2 border-yellow-400/80 p-0.5 shadow-[0_4px_12px_rgba(0,0,0,0.8)] overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-200 transition-all duration-75 shadow-[0_0_10px_rgba(250,204,21,0.8)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex justify-between w-full px-2 text-xs font-bold text-yellow-200/90">
          <span>Loading Royal Realm...</span>
          <span>{progress}%</span>
        </div>
      </div>
    </div>
  );
};

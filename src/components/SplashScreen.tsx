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
    const duration = 1600;

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgress(pct);

      if (pct >= 100) {
        clearInterval(timer);
        setTimeout(() => {
          onFinish();
        }, 150);
      }
    }, 25);

    return () => clearInterval(timer);
  }, [onFinish]);

  return (
    <div
      onClick={onFinish}
      className="relative w-full h-full flex flex-col items-center justify-between py-12 px-6 bg-[#0e031a] select-none cursor-pointer overflow-hidden"
    >
      {/* Royal Palace Wallpaper with Velvet Scrim */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-40 pointer-events-none"
        style={{ backgroundImage: "url('/royal_palace_bg.jpg')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#1c0535]/85 via-[#100220]/75 to-[#090114]/95 pointer-events-none" />

      {/* Floating Sparkles in Background */}
      <div className="absolute top-1/4 left-10 text-yellow-300 text-lg animate-ping">✦</div>
      <div className="absolute top-1/3 right-8 text-amber-200 text-sm animate-pulse">✨</div>
      <div className="absolute bottom-1/3 left-12 text-yellow-200 text-xs animate-bounce">✦</div>
      <div className="absolute top-16 right-16 text-yellow-100 text-xl animate-pulse">✦</div>

      {/* Top Banner Tag */}
      <div className="relative z-10 flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-950/80 border border-amber-400/50 backdrop-blur-sm shadow-[0_4px_16px_rgba(0,0,0,0.6)]">
        <span className="text-yellow-400 text-xs">👑</span>
        <span className="text-amber-200 text-xs font-black tracking-wider uppercase">
          Royal Match-3 Adventure
        </span>
      </div>

      {/* Central Animated Royal Logo & Crown */}
      <div className="relative z-10 flex flex-col items-center gap-4 my-auto">
        <div className="relative w-28 h-28 rounded-3xl bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-700 p-1 shadow-[0_12px_36px_rgba(245,158,11,0.6)] border-2 border-white flex items-center justify-center overflow-hidden">
          <img 
            src="/icon.png" 
            alt="Royal Dream Match" 
            className="w-full h-full object-cover rounded-2xl"
          />
        </div>

        <RoyalLogo size="lg" animated={true} />

        <p className="text-amber-200/90 text-sm font-semibold tracking-wide text-center drop-shadow">
          Kingdom Puzzles & Royal Treasures
        </p>
      </div>

      {/* Bottom Loading Progress Bar */}
      <div className="relative z-10 w-full max-w-xs flex flex-col items-center gap-2">
        <div className="w-full h-4 rounded-full bg-purple-950/90 border-2 border-amber-400 p-0.5 shadow-[0_4px_16px_rgba(0,0,0,0.8)] overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 transition-all duration-75 shadow-[0_0_12px_rgba(251,191,36,0.9)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex justify-between w-full px-2 text-xs font-black text-amber-200/90">
          <span>Loading Royal Realm...</span>
          <span>{progress}%</span>
        </div>
      </div>
    </div>
  );
};

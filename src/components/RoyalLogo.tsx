/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface RoyalLogoProps {
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export const RoyalLogo: React.FC<RoyalLogoProps> = ({
  size = 'md',
  animated = true,
}) => {
  const containerClasses = {
    sm: 'scale-75',
    md: 'scale-95',
    lg: 'scale-110 sm:scale-125',
  };

  return (
    <div className={`relative flex flex-col items-center justify-center select-none ${containerClasses[size]}`}>
      {/* Crown at top */}
      <div className={`relative z-10 -mb-3 transition-transform ${animated ? 'animate-bounce' : ''}`}>
        <svg className="w-16 h-12 filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]" viewBox="0 0 100 80">
          <path
            d="M10 70 L5 25 L30 45 L50 15 L70 45 L95 25 L90 70 Z"
            fill="url(#logoCrownGold)"
            stroke="#92400E"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          {/* Jewels */}
          <circle cx="5" cy="25" r="5" fill="#EF4444" stroke="#FFF" strokeWidth="1.5" />
          <circle cx="50" cy="15" r="6" fill="#3B82F6" stroke="#FFF" strokeWidth="1.5" />
          <circle cx="95" cy="25" r="5" fill="#10B981" stroke="#FFF" strokeWidth="1.5" />
          <circle cx="30" cy="60" r="3.5" fill="#EF4444" />
          <circle cx="50" cy="58" r="4" fill="#3B82F6" />
          <circle cx="70" cy="60" r="3.5" fill="#EF4444" />

          {/* Sparkling Star */}
          <g className={animated ? 'animate-spin-slow origin-center' : ''}>
            <polygon
              points="50,2 53,10 61,10 55,15 57,23 50,18 43,23 45,15 39,10 47,10"
              fill="#FFFFFF"
              filter="drop-shadow(0 0 4px #FDE047)"
            />
          </g>

          <defs>
            <linearGradient id="logoCrownGold" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFFBEB" />
              <stop offset="30%" stopColor="#FCD34D" />
              <stop offset="70%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#B45309" />
            </linearGradient>
          </defs>
        </svg>

        {/* Shimmer sparkle */}
        {animated && (
          <div className="absolute -top-1 -right-2 w-4 h-4 text-yellow-200 animate-ping">
            ✦
          </div>
        )}
      </div>

      {/* Main Logo Text Banner */}
      <div className="relative px-6 py-2.5 rounded-2xl bg-gradient-to-b from-blue-600 via-indigo-700 to-blue-950 border-4 border-yellow-300 shadow-[0_8px_25px_rgba(0,0,0,0.6),0_0_20px_rgba(250,204,21,0.5)] flex flex-col items-center">
        
        {/* Golden metallic rim */}
        <div className="absolute inset-0 rounded-xl border border-yellow-100/40 pointer-events-none" />

        <div className="flex items-center gap-1.5">
          <span className="text-amber-300 text-xs sm:text-sm">★</span>
          <span
            className="text-2xl sm:text-3xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-yellow-100 via-yellow-300 to-amber-500 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
            style={{ fontFamily: "'Fredoka', 'Titan One', sans-serif" }}
          >
            ROYAL
          </span>
          <span className="text-amber-300 text-xs sm:text-sm">★</span>
        </div>

        <div
          className="text-xl sm:text-2xl font-black tracking-widest text-white drop-shadow-[0_3px_5px_rgba(0,0,0,0.9)] -mt-1 flex items-center gap-2"
          style={{ fontFamily: "'Fredoka', 'Titan One', sans-serif" }}
        >
          <span>DREAM</span>
          <span className="text-yellow-300 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]">MATCH</span>
        </div>

        {/* Bottom golden ribbon flourish */}
        <div className="w-16 h-1 bg-gradient-to-r from-transparent via-yellow-300 to-transparent rounded-full mt-1" />
      </div>
    </div>
  );
};

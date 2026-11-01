/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PieceType, BoosterType, ObstacleType } from '../types/game';

interface PieceViewProps {
  piece: PieceType | null;
  booster?: BoosterType;
  obstacle?: ObstacleType;
  size?: number; // pixel size or responsive
  isMatched?: boolean;
  isHint?: boolean;
}

export const PieceView: React.FC<PieceViewProps> = ({
  piece,
  booster,
  obstacle,
  isMatched = false,
  isHint = false,
}) => {
  // Render Obstacle first if present
  if (obstacle) {
    if (obstacle.startsWith('wood')) {
      const isDamaged = obstacle === 'wood_1';
      return (
        <div className="relative w-full h-full p-0.5 flex items-center justify-center">
          <div className="w-full h-full rounded-xl bg-gradient-to-br from-amber-700 via-amber-800 to-amber-950 border-2 border-amber-500 shadow-inner flex items-center justify-center relative overflow-hidden">
            {/* Wood planks texture */}
            <div className="absolute inset-0 flex flex-col justify-between py-1 opacity-40">
              <div className="h-[2px] bg-amber-900 w-full" />
              <div className="h-[2px] bg-amber-900 w-full" />
              <div className="h-[2px] bg-amber-900 w-full" />
            </div>
            {/* Cracks if damaged */}
            {isDamaged && (
              <svg className="absolute inset-0 w-full h-full text-amber-300 opacity-80" viewBox="0 0 40 40">
                <path d="M10 5 L20 22 L15 35 M20 22 L32 18" stroke="currentColor" strokeWidth="2.5" fill="none" />
              </svg>
            )}
            <div className="w-5 h-5 rounded-md bg-amber-600/60 border border-amber-400 flex items-center justify-center shadow">
              <span className="text-[10px] font-black text-amber-200">
                {isDamaged ? '1' : '2'}
              </span>
            </div>
          </div>
        </div>
      );
    }

    if (obstacle.startsWith('crown_box')) {
      const isDamaged = obstacle === 'crown_box_1';
      return (
        <div className="relative w-full h-full p-0.5 flex items-center justify-center">
          <div className="w-full h-full rounded-xl bg-gradient-to-b from-amber-400 via-yellow-500 to-amber-700 border-2 border-yellow-200 shadow-lg flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-radial from-yellow-100/40 via-transparent to-amber-900/40" />
            <svg className="w-6 h-6 text-yellow-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5m14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
            </svg>
            <div className="absolute top-1 right-1 px-1 rounded-full bg-red-600 border border-yellow-200 text-[9px] font-extrabold text-white leading-tight">
              {isDamaged ? '1' : '2'}
            </div>
          </div>
        </div>
      );
    }

    if (obstacle.startsWith('stone')) {
      const isDamaged = obstacle === 'stone_1';
      return (
        <div className="relative w-full h-full p-0.5 flex items-center justify-center">
          <div className="w-full h-full rounded-xl bg-gradient-to-br from-slate-400 via-slate-600 to-slate-800 border-2 border-slate-300 shadow-md flex items-center justify-center relative overflow-hidden">
            <div className="absolute w-2 h-2 rounded-full bg-slate-400 top-1.5 left-1.5 opacity-60" />
            {isDamaged && (
              <svg className="absolute inset-0 w-full h-full text-slate-900 opacity-90" viewBox="0 0 40 40">
                <path d="M5 12 L18 20 L25 10 M18 20 L28 32 L35 25" stroke="currentColor" strokeWidth="2.5" fill="none" />
              </svg>
            )}
            <div className="w-5 h-5 rounded-full bg-slate-800/80 border border-slate-400 flex items-center justify-center">
              <span className="text-[10px] font-black text-slate-100">
                {isDamaged ? '1' : '2'}
              </span>
            </div>
          </div>
        </div>
      );
    }
  }

  // Render Boosters
  if (booster) {
    if (booster === 'rocket_h' || booster === 'rocket_v') {
      const isHorizontal = booster === 'rocket_h';
      return (
        <div className={`relative w-full h-full flex items-center justify-center transition-transform ${isHint ? 'scale-110 animate-pulse' : ''}`}>
          <div className="relative w-[88%] h-[88%] rounded-2xl bg-gradient-to-br from-red-500 via-orange-500 to-amber-500 border-2 border-yellow-300 shadow-[0_4px_12px_rgba(249,115,22,0.6)] flex items-center justify-center overflow-hidden">
            {/* Rocket rocket body */}
            <svg 
              className={`w-7 h-7 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] transform ${isHorizontal ? 'rotate-90' : ''}`} 
              viewBox="0 0 24 24" 
              fill="currentColor"
            >
              <path d="M12 2.5s4 4.5 4 10.5h-8c0-6 4-10.5 4-10.5z" fill="#FFFFFF"/>
              <path d="M8 13h8v3H8z" fill="#EF4444"/>
              <path d="M6 14l2-1v4l-2 2v-5zM18 14l-2-1v4l2 2v-5z" fill="#F59E0B"/>
              <circle cx="12" cy="7" r="1.5" fill="#3B82F6"/>
              <path d="M10 16l2 4 2-4z" fill="#F97316"/>
            </svg>
            {/* Arrows */}
            <div className={`absolute inset-0 pointer-events-none flex ${isHorizontal ? 'flex-row justify-between px-1' : 'flex-col justify-between py-1'} items-center`}>
              <span className="text-[10px] font-black text-yellow-200 animate-bounce">{isHorizontal ? '◀' : '▲'}</span>
              <span className="text-[10px] font-black text-yellow-200 animate-bounce">{isHorizontal ? '▶' : '▼'}</span>
            </div>
          </div>
        </div>
      );
    }

    if (booster === 'tnt') {
      return (
        <div className={`relative w-full h-full flex items-center justify-center ${isHint ? 'scale-110 animate-pulse' : ''}`}>
          <div className="relative w-[88%] h-[88%] rounded-2xl bg-gradient-to-br from-red-600 via-red-700 to-rose-950 border-2 border-yellow-400 shadow-[0_4px_14px_rgba(225,29,72,0.7)] flex flex-col items-center justify-center overflow-hidden">
            {/* TNT text & dynamite sticks */}
            <div className="flex gap-0.5 items-center justify-center my-0.5">
              <div className="w-2 h-5 rounded-t-sm bg-red-500 border-t border-yellow-200" />
              <div className="w-2.5 h-6 rounded-t-sm bg-red-400 border-t border-yellow-200" />
              <div className="w-2 h-5 rounded-t-sm bg-red-500 border-t border-yellow-200" />
            </div>
            <div className="px-1.5 py-0.5 bg-black/70 rounded border border-yellow-400/80">
              <span className="text-[10px] font-black tracking-widest text-yellow-300 drop-shadow">
                TNT
              </span>
            </div>
            <div className="absolute top-0 right-1 w-2 h-2 rounded-full bg-yellow-300 animate-ping" />
          </div>
        </div>
      );
    }

    if (booster === 'rainbow') {
      return (
        <div className={`relative w-full h-full flex items-center justify-center ${isHint ? 'scale-110 animate-pulse' : ''}`}>
          <div className="relative w-[88%] h-[88%] rounded-full bg-gradient-to-tr from-pink-500 via-yellow-400 via-emerald-400 to-blue-500 border-2 border-white shadow-[0_0_16px_rgba(244,114,182,0.9)] flex items-center justify-center overflow-hidden animate-spin-slow">
            <div className="w-5 h-5 rounded-full bg-white/90 shadow-inner flex items-center justify-center">
              <span className="text-sm">✨</span>
            </div>
            {/* Prismatic rim */}
            <div className="absolute inset-0 rounded-full border border-white/50 animate-pulse" />
          </div>
        </div>
      );
    }
  }

  // Render 5 Standard Colorful Pieces
  if (!piece) {
    return <div className="w-full h-full" />;
  }

  return (
    <div
      className={`relative w-full h-full flex items-center justify-center transition-all duration-150 select-none ${
        isMatched ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
      } ${isHint ? 'scale-110 animate-bounce' : ''}`}
    >
      {/* 1. Red Ruby */}
      {piece === 'ruby' && (
        <div className="relative w-[82%] h-[82%] flex items-center justify-center">
          <div className="w-full h-full rounded-2xl bg-gradient-to-br from-rose-400 via-red-600 to-red-900 border-2 border-rose-200 shadow-[0_4px_10px_rgba(225,29,72,0.5),inset_0_2px_4px_rgba(255,255,255,0.7)] transform rotate-45 flex items-center justify-center overflow-hidden">
            {/* Gem facet highlight */}
            <div className="w-3/5 h-3/5 border border-rose-300/80 bg-red-400/40 rounded-lg flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-white/90 shadow-[0_0_6px_#fff]" />
            </div>
          </div>
        </div>
      )}

      {/* 2. Blue Shield */}
      {piece === 'shield' && (
        <div className="relative w-[82%] h-[82%] flex items-center justify-center">
          <div className="w-full h-full rounded-b-3xl rounded-t-lg bg-gradient-to-b from-sky-300 via-blue-600 to-blue-950 border-2 border-sky-100 shadow-[0_4px_10px_rgba(37,99,235,0.6),inset_0_2px_4px_rgba(255,255,255,0.8)] flex items-center justify-center relative overflow-hidden">
            {/* Gloss sheen */}
            <div className="absolute -top-3 left-1 w-full h-6 bg-white/35 rounded-full transform -rotate-12 blur-[1px]" />
            {/* Embossed Royal Star */}
            <svg className="w-5 h-5 text-yellow-300 drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
        </div>
      )}

      {/* 3. Green Leaf */}
      {piece === 'leaf' && (
        <div className="relative w-[82%] h-[82%] flex items-center justify-center">
          <div className="w-full h-full rounded-tl-3xl rounded-br-3xl rounded-tr-lg rounded-bl-lg bg-gradient-to-br from-emerald-300 via-emerald-500 to-green-900 border-2 border-emerald-100 shadow-[0_4px_10px_rgba(16,185,129,0.5),inset_0_2px_4px_rgba(255,255,255,0.7)] flex items-center justify-center relative overflow-hidden">
            <div className="absolute top-1 left-2 w-2 h-2 rounded-full bg-white/70 blur-[0.5px]" />
            <svg className="w-5 h-5 text-emerald-100/90 drop-shadow" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.75C6.2 7.5 4 10 4 13c0 3 2 5 2 5s2-4 6-6 5-4 5-4z"/>
            </svg>
          </div>
        </div>
      )}

      {/* 4. Yellow Crown */}
      {piece === 'crown' && (
        <div className="relative w-[82%] h-[82%] flex items-center justify-center">
          <div className="w-full h-full rounded-2xl bg-gradient-to-b from-yellow-200 via-amber-400 to-amber-600 border-2 border-yellow-100 shadow-[0_4px_10px_rgba(245,158,11,0.6),inset_0_2px_4px_rgba(255,255,255,0.8)] flex items-center justify-center relative overflow-hidden">
            <div className="absolute top-0.5 w-3/4 h-2 bg-white/50 rounded-full blur-[0.5px]" />
            <svg className="w-6 h-6 text-yellow-900 drop-shadow-[0_1px_1px_rgba(255,255,255,0.7)]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5m14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
            </svg>
          </div>
        </div>
      )}

      {/* 5. Purple Gem */}
      {piece === 'gem' && (
        <div className="relative w-[82%] h-[82%] flex items-center justify-center">
          <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-300 via-fuchsia-600 to-purple-950 border-2 border-purple-200 shadow-[0_4px_10px_rgba(168,85,247,0.6),inset_0_2px_4px_rgba(255,255,255,0.8)] flex items-center justify-center relative overflow-hidden">
            {/* Hexagon facet inside */}
            <div className="w-3/5 h-3/5 border-2 border-purple-200/60 rounded-md rotate-45 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_5px_#fff]" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

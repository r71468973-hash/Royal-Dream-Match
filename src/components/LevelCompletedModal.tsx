/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { KingAvatar } from './KingAvatar';
import { sound } from '../game/sound';

interface LevelCompletedModalProps {
  levelNumber: number;
  score: number;
  stars: number;
  coinsEarned: number;
  bonusMoves: number;
  onNextLevel: () => void;
  onReplay: () => void;
  onHome: () => void;
}

export const LevelCompletedModal: React.FC<LevelCompletedModalProps> = ({
  levelNumber,
  score,
  stars,
  coinsEarned,
  bonusMoves,
  onNextLevel,
  onReplay,
  onHome,
}) => {
  useEffect(() => {
    sound.playVictory();
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.5 },
    });
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300 select-none">
      <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-blue-900 via-indigo-950 to-blue-950 border-4 border-yellow-400 p-6 shadow-[0_12px_40px_rgba(0,0,0,0.9)] text-white flex flex-col items-center text-center">
        
        {/* Victory Ribbon Header */}
        <div className="relative -mt-10 px-8 py-2 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 border-2 border-white shadow-xl flex items-center justify-center gap-2">
          <span className="text-xl">👑</span>
          <span
            className="text-2xl font-black text-blue-950 uppercase tracking-wider drop-shadow"
            style={{ fontFamily: "'Fredoka', sans-serif" }}
          >
            VICTORY!
          </span>
          <span className="text-xl">👑</span>
        </div>

        {/* Celebrating King */}
        <div className="my-3">
          <KingAvatar mood="celebrating" size="lg" />
        </div>

        <div className="text-xs font-bold text-yellow-300 uppercase tracking-widest mb-1">
          Level {levelNumber} Completed
        </div>

        {/* 3 Stars display */}
        <div className="flex items-center justify-center gap-3 my-2">
          {[1, 2, 3].map((starIdx) => {
            const hasStar = starIdx <= stars;
            return (
              <div
                key={starIdx}
                className={`transform transition-transform duration-300 ${
                  starIdx === 2 ? '-translate-y-2 scale-125' : ''
                } ${hasStar ? 'text-yellow-300 drop-shadow-[0_0_12px_rgba(250,204,21,0.9)] animate-bounce' : 'text-slate-600 opacity-40'}`}
              >
                <span className="text-4xl">★</span>
              </div>
            );
          })}
        </div>

        {/* Stats Card */}
        <div className="w-full bg-blue-950/80 rounded-2xl p-3 border border-yellow-400/40 my-3 flex flex-col gap-2">
          <div className="flex justify-between items-center text-xs font-bold px-2">
            <span className="text-blue-200">Final Score:</span>
            <span className="text-white text-sm font-black">{score.toLocaleString()}</span>
          </div>

          {bonusMoves > 0 && (
            <div className="flex justify-between items-center text-xs font-bold px-2">
              <span className="text-amber-300">Bonus Moves Left:</span>
              <span className="text-yellow-300">+{bonusMoves}</span>
            </div>
          )}

          <div className="flex justify-between items-center text-xs font-bold px-2 pt-1 border-t border-blue-800">
            <span className="text-yellow-300 flex items-center gap-1">
              <span>🪙</span> Coins Won:
            </span>
            <span className="text-yellow-300 text-sm font-black">+{coinsEarned}</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="w-full flex flex-col gap-2.5 mt-1">
          <button
            onClick={() => {
              sound.playTap();
              onNextLevel();
            }}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-b from-yellow-300 via-amber-400 to-amber-600 border-2 border-yellow-100 text-blue-950 font-black text-base uppercase tracking-wider shadow-[0_6px_20px_rgba(245,158,11,0.6)] active:scale-95 transition-transform"
          >
            NEXT LEVEL ▶
          </button>

          <div className="flex gap-2">
            <button
              onClick={() => {
                sound.playTap();
                onReplay();
              }}
              className="flex-1 py-2.5 rounded-xl bg-blue-900 border border-yellow-300/60 text-white font-bold text-xs active:scale-95 transition-transform flex items-center justify-center gap-1"
            >
              <span>🔄</span> Replay
            </button>
            <button
              onClick={() => {
                sound.playTap();
                onHome();
              }}
              className="flex-1 py-2.5 rounded-xl bg-blue-900 border border-yellow-300/60 text-white font-bold text-xs active:scale-95 transition-transform flex items-center justify-center gap-1"
            >
              <span>🏰</span> Castle
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

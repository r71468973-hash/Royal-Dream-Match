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
      particleCount: 120,
      spread: 90,
      origin: { y: 0.5 },
    });
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300 select-none">
      <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#2e0854] via-[#1c0535] to-[#100220] border-4 border-amber-400 p-6 shadow-[0_16px_40px_rgba(0,0,0,0.9),inset_0_2px_4px_rgba(251,191,36,0.4)] text-white flex flex-col items-center text-center">
        
        {/* Victory Ribbon Header */}
        <div className="relative -mt-11 px-8 py-2 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 border-2 border-white shadow-xl flex items-center justify-center gap-2">
          <span className="text-xl">👑</span>
          <span
            className="text-2xl font-black text-purple-950 uppercase tracking-wider drop-shadow"
            style={{ fontFamily: "'Fredoka', sans-serif" }}
          >
            ROYAL VICTORY!
          </span>
          <span className="text-xl">👑</span>
        </div>

        {/* Celebrating King */}
        <div className="my-3">
          <KingAvatar mood="celebrating" size="lg" />
        </div>

        <div className="text-xs font-bold text-amber-300 uppercase tracking-widest mb-1">
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
                } ${hasStar ? 'text-yellow-300 drop-shadow-[0_0_14px_rgba(250,204,21,0.95)] animate-bounce' : 'text-purple-800 opacity-40'}`}
              >
                <span className="text-4xl">★</span>
              </div>
            );
          })}
        </div>

        {/* Stats Card */}
        <div className="w-full bg-purple-950/70 rounded-2xl p-3 border border-amber-400/40 my-3 flex flex-col gap-2">
          <div className="flex justify-between items-center text-xs font-bold px-2">
            <span className="text-purple-200">Final Score:</span>
            <span className="text-white text-sm font-black">{score.toLocaleString()}</span>
          </div>

          {bonusMoves > 0 && (
            <div className="flex justify-between items-center text-xs font-bold px-2">
              <span className="text-amber-300">Moves Remaining:</span>
              <span className="text-yellow-300 font-black">+{bonusMoves} bonus</span>
            </div>
          )}

          <div className="flex justify-between items-center text-xs font-bold px-2 pt-1 border-t border-purple-800">
            <span className="text-amber-300 flex items-center gap-1">
              <span>🪙</span> Coins Awarded:
            </span>
            <span className="text-amber-300 text-sm font-black">+{coinsEarned}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2.5 mt-2">
          <button
            onClick={() => {
              sound.playTap();
              onNextLevel();
            }}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-b from-amber-300 via-yellow-500 to-amber-600 text-purple-950 font-black text-sm uppercase tracking-wider border-2 border-yellow-200 shadow-[0_5px_0_#92400e,0_8px_16px_rgba(0,0,0,0.4)] active:translate-y-1 active:shadow-[0_1px_0_#92400e] transition-all cursor-pointer"
          >
            NEXT LEVEL ▶
          </button>

          <div className="flex gap-2 w-full">
            <button
              onClick={() => {
                sound.playTap();
                onReplay();
              }}
              className="flex-1 py-2.5 rounded-xl bg-purple-900/60 hover:bg-purple-800 border border-purple-500/50 text-purple-200 font-bold text-xs uppercase tracking-wider active:scale-95 transition-all"
            >
              🔄 Replay
            </button>

            <button
              onClick={() => {
                sound.playTap();
                onHome();
              }}
              className="flex-1 py-2.5 rounded-xl bg-purple-900/60 hover:bg-purple-800 border border-purple-500/50 text-purple-200 font-bold text-xs uppercase tracking-wider active:scale-95 transition-all"
            >
              🏰 Map
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

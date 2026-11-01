/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { KingAvatar } from './KingAvatar';
import { sound } from '../game/sound';
import { LevelTarget } from '../types/game';
import { PieceView } from './PieceView';

interface LevelFailedModalProps {
  levelNumber: number;
  unmetTargets: LevelTarget[];
  coins: number;
  onBuyExtraMoves: () => void;
  onWatchAdForMoves?: () => void;
  onRetry: () => void;
  onQuit: () => void;
}

export const LevelFailedModal: React.FC<LevelFailedModalProps> = ({
  levelNumber,
  unmetTargets,
  coins,
  onBuyExtraMoves,
  onWatchAdForMoves,
  onRetry,
  onQuit,
}) => {
  useEffect(() => {
    sound.playDefeat();
  }, []);

  const canAffordExtraMoves = coins >= 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300 select-none">
      <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-blue-950 via-slate-900 to-indigo-950 border-4 border-red-500 p-6 shadow-[0_12px_40px_rgba(0,0,0,0.9)] text-white flex flex-col items-center text-center">
        
        {/* Out of Moves Ribbon */}
        <div className="relative -mt-10 px-6 py-2 rounded-2xl bg-gradient-to-r from-red-600 via-rose-500 to-red-700 border-2 border-white shadow-xl flex items-center justify-center gap-2">
          <span className="text-xl">💔</span>
          <span
            className="text-xl font-black text-white uppercase tracking-wider drop-shadow"
            style={{ fontFamily: "'Fredoka', sans-serif" }}
          >
            OUT OF MOVES!
          </span>
          <span className="text-xl">💔</span>
        </div>

        {/* Sad Crying King */}
        <div className="my-3">
          <KingAvatar mood="sad" size="lg" />
        </div>

        <div className="text-xs font-bold text-rose-300 uppercase tracking-widest mb-1">
          Level {levelNumber} Incomplete
        </div>
        <p className="text-xs text-slate-300 mb-3">
          King Leo needs your help to finish the royal targets!
        </p>

        {/* Remaining Targets needed */}
        <div className="w-full bg-blue-900/40 rounded-2xl p-3 border border-red-500/30 mb-4 flex flex-col gap-2">
          <div className="text-[10px] font-bold text-yellow-300 uppercase tracking-wider">
            Targets Remaining
          </div>
          <div className="flex justify-center gap-3">
            {unmetTargets.map((tgt, i) => {
              const remaining = Math.max(0, tgt.count - tgt.current);
              return (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-yellow-300/40 p-1 flex items-center justify-center">
                    {tgt.type === 'wood' && (
                      <div className="w-6 h-6 rounded bg-amber-800 border border-amber-500" />
                    )}
                    {tgt.type === 'crown_box' && (
                      <div className="w-6 h-6 rounded bg-yellow-500 border border-yellow-200 flex items-center justify-center text-xs">
                        👑
                      </div>
                    )}
                    {tgt.type === 'stone' && (
                      <div className="w-6 h-6 rounded bg-slate-600 border border-slate-400" />
                    )}
                    {['ruby', 'shield', 'leaf', 'crown', 'gem'].includes(tgt.type) && (
                      <PieceView piece={tgt.type as any} />
                    )}
                  </div>
                  <span className="text-xs font-black text-rose-300">
                    {remaining} left
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="w-full flex flex-col gap-2.5">
          {/* AdMob Rewarded Ad Option: +5 Free Moves */}
          {onWatchAdForMoves && (
            <button
              onClick={() => {
                sound.playTap();
                onWatchAdForMoves();
              }}
              className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 border-2 border-emerald-300 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform"
            >
              <span className="text-sm">🎬</span>
              <span>Watch Ad for +5 Moves (Free)</span>
            </button>
          )}

          {/* Rescue Option: +5 Moves for 100 Coins */}
          <button
            onClick={() => {
              if (canAffordExtraMoves) {
                sound.playTap();
                onBuyExtraMoves();
              } else {
                sound.playInvalid();
                alert('Not enough coins! You need 100 coins to buy +5 moves.');
              }
            }}
            className={`w-full py-2.5 rounded-2xl border-2 flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform ${
              canAffordExtraMoves
                ? 'bg-gradient-to-b from-yellow-300 via-amber-400 to-amber-600 border-yellow-100 text-blue-950 font-black text-xs'
                : 'bg-slate-800 border-slate-600 text-slate-400 font-bold text-xs opacity-60'
            }`}
          >
            <span className="text-sm">⏳ +5 Extra Moves</span>
            <span className="px-2 py-0.5 rounded-full bg-black/20 text-[10px]">
              🪙 100
            </span>
          </button>

          {/* Retry Level */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                sound.playTap();
                onRetry();
              }}
              className="flex-1 py-2.5 rounded-xl bg-blue-900 border border-yellow-400/60 text-white font-bold text-xs active:scale-95 transition-transform flex items-center justify-center gap-1"
            >
              <span>🔄</span> Retry (-1 ❤️)
            </button>
            <button
              onClick={() => {
                sound.playTap();
                onQuit();
              }}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 border border-slate-600 text-slate-300 font-bold text-xs active:scale-95 transition-transform flex items-center justify-center gap-1"
            >
              <span>🏰</span> Give Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

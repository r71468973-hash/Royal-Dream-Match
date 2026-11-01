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
      <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#2e0854] via-[#1a0433] to-[#0f0220] border-4 border-rose-500 p-6 shadow-[0_16px_40px_rgba(0,0,0,0.9),inset_0_2px_4px_rgba(244,63,94,0.3)] text-white flex flex-col items-center text-center">
        
        {/* Out of Moves Ribbon */}
        <div className="relative -mt-11 px-6 py-2 rounded-2xl bg-gradient-to-r from-red-600 via-rose-500 to-red-700 border-2 border-white shadow-xl flex items-center justify-center gap-2">
          <span className="text-xl">💔</span>
          <span
            className="text-xl font-black text-white uppercase tracking-wider drop-shadow"
            style={{ fontFamily: "'Fredoka', sans-serif" }}
          >
            OUT OF MOVES!
          </span>
          <span className="text-xl">💔</span>
        </div>

        {/* Sad King */}
        <div className="my-3">
          <KingAvatar mood="sad" size="lg" />
        </div>

        <div className="text-xs font-bold text-rose-300 uppercase tracking-widest mb-1">
          Level {levelNumber} Incomplete
        </div>
        <p className="text-xs text-purple-200/90 mb-3 font-medium">
          King Leo needs your help to finish the royal targets!
        </p>

        {/* Remaining Targets needed */}
        <div className="w-full bg-purple-950/70 rounded-2xl p-3 border border-rose-500/30 mb-4 flex flex-col gap-2">
          <div className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
            Targets Remaining
          </div>
          <div className="flex justify-center gap-3">
            {unmetTargets.map((tgt, i) => {
              const remaining = Math.max(0, tgt.count - tgt.current);
              return (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-xl bg-purple-900/80 border border-amber-300/40 p-1 flex items-center justify-center shadow">
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
          {/* Watch Ad for +5 Moves */}
          {onWatchAdForMoves && (
            <button
              onClick={() => {
                sound.playTap();
                onWatchAdForMoves();
              }}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 border-2 border-emerald-300 text-white font-black text-xs uppercase tracking-wider shadow-[0_4px_0_#064e3b] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>🎬</span>
              <span>Watch Video (+5 Free Moves)</span>
            </button>
          )}

          {/* Buy Extra Moves with Coins */}
          <button
            onClick={() => {
              if (canAffordExtraMoves) {
                sound.playTap();
                onBuyExtraMoves();
              } else {
                sound.playInvalid();
              }
            }}
            disabled={!canAffordExtraMoves}
            className={`w-full py-3 rounded-2xl border-2 transition-all flex items-center justify-center gap-2 font-black text-xs uppercase tracking-wider ${
              canAffordExtraMoves
                ? 'bg-gradient-to-b from-amber-300 via-yellow-400 to-amber-600 text-purple-950 border-yellow-200 shadow-[0_4px_0_#92400e] active:translate-y-1 active:shadow-none cursor-pointer'
                : 'bg-purple-950/40 text-purple-400 border-purple-800 opacity-50 cursor-not-allowed'
            }`}
          >
            <span>🪙</span>
            <span>Get +5 Moves (100 Coins)</span>
          </button>

          <div className="flex gap-2 w-full mt-1">
            {/* Retry Button */}
            <button
              onClick={() => {
                sound.playTap();
                onRetry();
              }}
              className="flex-1 py-2.5 rounded-xl bg-purple-900/60 hover:bg-purple-800 border border-purple-500/50 text-purple-200 font-bold text-xs uppercase tracking-wider active:scale-95 transition-all"
            >
              🔄 Retry
            </button>

            {/* Quit Button */}
            <button
              onClick={() => {
                sound.playTap();
                onQuit();
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

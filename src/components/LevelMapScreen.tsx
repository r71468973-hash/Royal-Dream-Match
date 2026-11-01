/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { PlayerState, LevelConfig } from '../types/game';
import { getLevelConfig } from '../game/levels';
import { sound } from '../game/sound';
import { PieceView } from './PieceView';

interface LevelMapScreenProps {
  playerState: PlayerState;
  onSelectLevel: (levelNumber: number) => void;
  onBackHome: () => void;
}

export const LevelMapScreen: React.FC<LevelMapScreenProps> = ({
  playerState,
  onSelectLevel,
  onBackHome,
}) => {
  const [selectedLevelPreview, setSelectedLevelPreview] = useState<LevelConfig | null>(null);
  const currentLevelRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to current level on mount
  useEffect(() => {
    if (currentLevelRef.current) {
      currentLevelRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  const totalLevels = 100;
  const levelNumbers = Array.from({ length: totalLevels }, (_, i) => i + 1);

  const handleLevelClick = (lvlNum: number) => {
    sound.playTap();
    if (lvlNum <= playerState.highestUnlockedLevel) {
      const config = getLevelConfig(lvlNum);
      setSelectedLevelPreview(config);
    } else {
      sound.playInvalid();
    }
  };

  const startLevel = (lvlNum: number) => {
    if (playerState.lives <= 0) {
      sound.playInvalid();
      alert('Out of lives! Wait for lives to recharge or claim daily rewards.');
      return;
    }
    sound.playVictory();
    onSelectLevel(lvlNum);
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-gradient-to-b from-[#0e1d42] via-[#142858] to-[#081329] select-none overflow-hidden">
      
      {/* Top Navigation Bar */}
      <div className="relative z-20 flex items-center justify-between px-4 py-3 bg-blue-950/80 border-b-2 border-yellow-400/40 backdrop-blur-md shadow-md">
        <button
          onClick={() => {
            sound.playTap();
            onBackHome();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-900 border border-yellow-300 text-yellow-200 text-xs font-black shadow active:scale-95 transition-transform"
        >
          <span>🏰</span>
          <span>Home</span>
        </button>

        <div className="text-center">
          <div className="text-[10px] font-bold text-yellow-300 uppercase tracking-widest">
            Royal Kingdom
          </div>
          <div className="text-sm font-black text-white">
            Level {playerState.currentLevel} of 100
          </div>
        </div>

        {/* Currency badges */}
        <div className="flex items-center gap-2">
          {/* Lives */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-950/80 border border-red-500/80 text-xs font-black text-rose-200 shadow">
            <span>❤️</span>
            <span>{playerState.lives}</span>
          </div>
          {/* Coins */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-950/80 border border-yellow-500/80 text-xs font-black text-yellow-200 shadow">
            <span>🪙</span>
            <span>{playerState.coins}</span>
          </div>
        </div>
      </div>

      {/* Scrollable Map Path */}
      <div
        ref={scrollContainerRef}
        className="relative flex-1 overflow-y-auto px-4 py-8 flex flex-col items-center"
      >
        {/* Kingdom background decorative motifs */}
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <div className="absolute top-10 left-6 text-6xl">🏰</div>
          <div className="absolute top-80 right-8 text-6xl">🌲</div>
          <div className="absolute top-[600px] left-10 text-6xl">⛲</div>
          <div className="absolute top-[1200px] right-6 text-6xl">⚔️</div>
          <div className="absolute top-[1800px] left-8 text-6xl">👑</div>
        </div>

        <div className="relative w-full max-w-sm flex flex-col items-center gap-5">
          {levelNumbers.map((lvl) => {
            const isUnlocked = lvl <= playerState.highestUnlockedLevel;
            const isCurrent = lvl === playerState.currentLevel;
            const progress = playerState.completedLevels[lvl];
            const stars = progress?.stars || 0;

            // Calculate sinusoidal winding offset for S-curve path
            const offsetX = Math.sin(lvl * 0.75) * 80;

            return (
              <div
                key={lvl}
                ref={isCurrent ? currentLevelRef : null}
                style={{ transform: `translateX(${offsetX}px)` }}
                className="relative flex flex-col items-center transition-transform"
              >
                {/* Level Circle Node */}
                <button
                  onClick={() => handleLevelClick(lvl)}
                  className={`relative w-16 h-16 rounded-full flex flex-col items-center justify-center border-4 shadow-xl active:scale-95 transition-all ${
                    isCurrent
                      ? 'bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 border-white ring-4 ring-yellow-400/80 scale-110 animate-bounce'
                      : isUnlocked
                      ? 'bg-gradient-to-b from-blue-500 via-indigo-600 to-blue-900 border-yellow-400'
                      : 'bg-gradient-to-b from-slate-700 to-slate-900 border-slate-600 opacity-60'
                  }`}
                >
                  {/* Current crown badge */}
                  {isCurrent && (
                    <div className="absolute -top-4 text-base drop-shadow animate-bounce">
                      👑
                    </div>
                  )}

                  {isUnlocked ? (
                    <>
                      <span className="text-sm font-black text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                        {lvl}
                      </span>
                      {/* Star rating dots */}
                      <div className="flex gap-0.5 mt-0.5">
                        {[1, 2, 3].map((s) => (
                          <span
                            key={s}
                            className={`text-[10px] ${
                              s <= stars ? 'text-yellow-300 drop-shadow' : 'text-slate-400 opacity-40'
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </>
                  ) : (
                    <span className="text-lg text-slate-400">🔒</span>
                  )}
                </button>

                {/* Milestone flag marker every 10 levels */}
                {lvl % 10 === 0 && (
                  <div className="absolute -right-14 top-2 px-2 py-0.5 rounded-full bg-yellow-400 border border-yellow-100 text-blue-950 text-[10px] font-black shadow">
                    Royal Gate {lvl / 10}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Jump to Current Button */}
      <button
        onClick={() => {
          sound.playTap();
          if (currentLevelRef.current) {
            currentLevelRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }}
        className="absolute bottom-4 right-4 z-20 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-500 border-2 border-white text-blue-950 font-black text-xs shadow-lg active:scale-95 transition-transform flex items-center gap-1.5"
      >
        <span>🎯</span>
        <span>My Level</span>
      </button>

      {/* Level Target Preview Modal */}
      {selectedLevelPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-xs rounded-3xl bg-gradient-to-b from-blue-900 via-indigo-950 to-blue-950 border-4 border-yellow-400 p-5 shadow-2xl text-white">
            
            <button
              onClick={() => {
                sound.playTap();
                setSelectedLevelPreview(null);
              }}
              className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-red-600 border-2 border-yellow-300 flex items-center justify-center text-white font-bold shadow-lg"
            >
              ✕
            </button>

            <div className="text-center mb-4">
              <span className="px-3 py-1 rounded-full bg-yellow-400/20 border border-yellow-400 text-yellow-300 text-xs font-bold uppercase">
                Level {selectedLevelPreview.levelNumber}
              </span>
              <h3 className="text-xl font-black text-white mt-1">
                Royal Challenge
              </h3>
              <p className="text-xs text-blue-200 mt-1">
                {selectedLevelPreview.description}
              </p>
            </div>

            {/* Target Boxes */}
            <div className="bg-blue-950/80 rounded-2xl p-3 border border-blue-800 flex flex-col gap-2 mb-4">
              <div className="text-xs font-bold text-yellow-300 uppercase tracking-wider text-center">
                Targets to Clear
              </div>
              <div className="flex justify-center gap-4">
                {selectedLevelPreview.targets.map((tgt, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div className="w-10 h-10 rounded-xl bg-blue-900/60 border border-yellow-300/40 p-1 flex items-center justify-center">
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
                    <span className="text-xs font-black text-white">
                      {tgt.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Moves info */}
            <div className="flex justify-between items-center px-4 py-2 rounded-xl bg-blue-950/60 border border-blue-800 mb-4 text-xs font-bold">
              <span className="text-blue-200">Moves Allowed:</span>
              <span className="text-yellow-300 text-sm">{selectedLevelPreview.moves} Moves</span>
            </div>

            {/* Play Button */}
            <button
              onClick={() => {
                const num = selectedLevelPreview.levelNumber;
                setSelectedLevelPreview(null);
                startLevel(num);
              }}
              className="w-full py-3 rounded-2xl bg-gradient-to-b from-yellow-300 via-amber-400 to-amber-600 border-2 border-yellow-100 text-blue-950 font-black text-base uppercase tracking-wider shadow-[0_6px_20px_rgba(245,158,11,0.6)] active:scale-95 transition-transform"
            >
              PLAY LEVEL {selectedLevelPreview.levelNumber}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

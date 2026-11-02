/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { PlayerState, LevelConfig } from '../types/game';
import { getLevelConfig } from '../game/levels';
import { sound } from '../game/sound';
import { PieceView } from './PieceView';
import { RoyalAlertModal } from './RoyalAlertModal';
import { AdMobBanner } from './AdMobBanner';

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
  const [alertState, setAlertState] = useState<{ title: string; message: string; icon?: string } | null>(null);
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

  const getMilestoneName = (lvl: number): string | null => {
    switch (lvl) {
      case 10: return '🏰 The Royal Courtyard';
      case 20: return '🛡️ Knights Armory';
      case 30: return '🌳 Castle Emerald Gardens';
      case 40: return '👑 The Gilded Ballroom';
      case 50: return '💎 The Royal Jewel Vault';
      case 60: return '⚔️ Grand Citadel Watch';
      case 70: return '🦅 High Falcon Keep';
      case 80: return '✨ Mystic Alchemist Tower';
      case 90: return '🌟 King Leo’s Sanctuary';
      case 100: return '👑 The Imperial Throne Room';
      default: return null;
    }
  };

  const handleLevelClick = (lvlNum: number) => {
    sound.playTap();
    if (lvlNum <= playerState.highestUnlockedLevel) {
      const config = getLevelConfig(lvlNum);
      setSelectedLevelPreview(config);
    } else {
      sound.playInvalid();
      setAlertState({
        title: 'LEVEL LOCKED',
        message: `Complete Level ${lvlNum - 1} to unlock this royal challenge!`,
        icon: '🔒',
      });
    }
  };

  const startLevel = (lvlNum: number) => {
    if (playerState.lives <= 0) {
      sound.playInvalid();
      setAlertState({
        title: 'OUT OF HEARTS',
        message: 'You need at least 1 heart to play. Wait for hearts to recharge or claim daily rewards!',
        icon: '💔',
      });
      return;
    }
    sound.playVictory();
    onSelectLevel(lvlNum);
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-[#0e031a] select-none overflow-hidden">
      
      {/* Royal Palace Wallpaper with Velvet Dark Scrim */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30 pointer-events-none"
        style={{ backgroundImage: "url('/royal_palace_bg.jpg')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#1c0535]/90 via-[#100220]/80 to-[#090114]/95 pointer-events-none" />

      {/* Top Navigation Bar */}
      <div className="relative z-20 flex items-center justify-between px-4 py-3 bg-purple-950/85 border-b-2 border-amber-400/50 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.6)]">
        <button
          onClick={() => {
            sound.playTap();
            onBackHome();
          }}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-b from-purple-800 to-purple-950 border border-amber-400 text-amber-200 text-xs font-black shadow-[0_3px_0_#2e1065] active:translate-y-0.5 active:shadow-none transition-all"
        >
          <span>🏰</span>
          <span>Home</span>
        </button>

        <div className="text-center">
          <div className="text-[10px] font-bold text-amber-300 uppercase tracking-widest">
            Royal Kingdom
          </div>
          <div className="text-sm font-black text-white">
            Level {playerState.currentLevel} of 100
          </div>
        </div>

        {/* Currency badges */}
        <div className="flex items-center gap-2">
          {/* Lives */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-950/90 border border-rose-500/80 text-xs font-black text-rose-200 shadow">
            <span>❤️</span>
            <span>{playerState.lives}</span>
          </div>
          {/* Coins */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-950/90 border border-amber-400 text-xs font-black text-amber-200 shadow">
            <span>🪙</span>
            <span>{playerState.coins.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Scrollable Map Path */}
      <div
        ref={scrollContainerRef}
        className="relative z-10 flex-1 overflow-y-auto px-4 py-8 flex flex-col items-center"
      >
        <div className="relative w-full max-w-sm flex flex-col items-center gap-5 pb-16">
          
          {levelNumbers.map((lvlNum) => {
            const isUnlocked = lvlNum <= playerState.highestUnlockedLevel;
            const isCurrent = lvlNum === playerState.currentLevel;
            const progress = playerState.completedLevels[lvlNum];
            const stars = progress?.stars || 0;
            const milestone = getMilestoneName(lvlNum);

            // Sine wave horizontal offset for winding castle path
            const offsetX = Math.sin(lvlNum * 0.75) * 65;

            return (
              <React.Fragment key={lvlNum}>
                {/* Milestone Banner */}
                {milestone && (
                  <div className="w-full my-2 flex items-center justify-center">
                    <div className="px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-950 via-amber-950 to-purple-950 border border-amber-400/80 text-amber-200 text-xs font-black shadow-lg flex items-center gap-2">
                      <span>{milestone}</span>
                    </div>
                  </div>
                )}

                {/* Level Stepping Stone Button */}
                <div
                  ref={isCurrent ? currentLevelRef : undefined}
                  style={{ transform: `translateX(${offsetX}px)` }}
                  className="relative transition-transform"
                >
                  <button
                    onClick={() => handleLevelClick(lvlNum)}
                    className={`relative w-15 h-15 rounded-3xl flex flex-col items-center justify-center border-3 transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-gradient-to-b from-amber-300 via-yellow-400 to-amber-600 border-white shadow-[0_0_24px_rgba(250,204,21,0.9),0_6px_0_#92400e] scale-115 z-10 animate-bounce'
                        : isUnlocked
                        ? 'bg-gradient-to-b from-amber-400 via-amber-500 to-amber-700 border-yellow-200 shadow-[0_4px_0_#78350f,0_6px_12px_rgba(0,0,0,0.5)] hover:scale-105 active:translate-y-1 active:shadow-none'
                        : 'bg-purple-950/70 border-purple-800 text-purple-400 opacity-60 shadow-inner'
                    }`}
                  >
                    {isCurrent && (
                      <span className="absolute -top-3.5 text-base drop-shadow">👑</span>
                    )}

                    <span
                      className={`text-base font-black ${
                        isCurrent
                          ? 'text-purple-950'
                          : isUnlocked
                          ? 'text-purple-950 drop-shadow-[0_1px_1px_rgba(255,255,255,0.7)]'
                          : 'text-purple-400'
                      }`}
                      style={{ fontFamily: "'Fredoka', sans-serif" }}
                    >
                      {lvlNum}
                    </span>

                    {/* Stars Earned */}
                    {isUnlocked && stars > 0 && (
                      <div className="flex gap-0.5 text-[10px] text-yellow-300 drop-shadow">
                        {[1, 2, 3].map((s) => (
                          <span key={s} className={s <= stars ? 'opacity-100' : 'opacity-25'}>
                            ★
                          </span>
                        ))}
                      </div>
                    )}

                    {!isUnlocked && (
                      <span className="text-xs text-purple-500">🔒</span>
                    )}
                  </button>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Google AdMob Banner at Bottom */}
      <div className="relative z-10 w-full shrink-0">
        <AdMobBanner />
      </div>

      {/* Level Preview Modal */}
      {selectedLevelPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in select-none">
          <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#2e0854] via-[#1c0535] to-[#100220] border-4 border-amber-400 p-6 shadow-[0_16px_40px_rgba(0,0,0,0.9),inset_0_2px_4px_rgba(251,191,36,0.4)] text-white text-center flex flex-col items-center">
            
            {/* Close Button */}
            <button
              onClick={() => {
                sound.playTap();
                setSelectedLevelPreview(null);
              }}
              className="absolute -top-3 -right-3 w-9 h-9 rounded-full bg-red-600 border-2 border-yellow-300 flex items-center justify-center text-white font-bold shadow-lg active:scale-95 transition-transform"
            >
              ✕
            </button>

            {/* Crown Icon */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-700 border-2 border-yellow-200 flex items-center justify-center text-3xl shadow-[0_6px_20px_rgba(245,158,11,0.5)] mb-2">
              👑
            </div>

            <div className="text-[10px] font-black text-amber-300 uppercase tracking-widest">
              Royal Mission
            </div>
            <h3
              className="text-2xl font-black text-white mb-2"
              style={{ fontFamily: "'Fredoka', sans-serif" }}
            >
              LEVEL {selectedLevelPreview.levelNumber}
            </h3>

            <p className="text-xs text-purple-200/90 mb-4 px-2">
              {selectedLevelPreview.description}
            </p>

            {/* Target Goals */}
            <div className="w-full bg-purple-950/70 rounded-2xl p-3 border border-amber-400/30 mb-4">
              <div className="text-[10px] font-bold text-amber-300 uppercase tracking-wider mb-2">
                Level Targets · {selectedLevelPreview.moves} Moves
              </div>
              <div className="flex justify-center items-center gap-4">
                {selectedLevelPreview.targets.map((tgt, i) => (
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
                    <span className="text-xs font-black text-white">
                      ×{tgt.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Play Button */}
            <button
              onClick={() => {
                const lvl = selectedLevelPreview.levelNumber;
                setSelectedLevelPreview(null);
                startLevel(lvl);
              }}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-b from-amber-300 via-yellow-500 to-amber-600 text-purple-950 font-black text-sm uppercase tracking-wider border-2 border-yellow-200 shadow-[0_5px_0_#92400e,0_8px_16px_rgba(0,0,0,0.4)] active:translate-y-1 active:shadow-[0_1px_0_#92400e] transition-all cursor-pointer"
            >
              ENTER LEVEL {selectedLevelPreview.levelNumber}
            </button>
          </div>
        </div>
      )}

      {/* Royal Alert Modal */}
      {alertState && (
        <RoyalAlertModal
          title={alertState.title}
          message={alertState.message}
          icon={alertState.icon}
          onConfirm={() => setAlertState(null)}
        />
      )}
    </div>
  );
};

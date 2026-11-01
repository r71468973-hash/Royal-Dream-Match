/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { sound } from '../game/sound';
import { LevelConfig } from '../types/game';
import { PieceView } from './PieceView';

interface PauseModalProps {
  levelConfig: LevelConfig;
  score: number;
  movesRemaining: number;
  soundEnabled: boolean;
  musicEnabled: boolean;
  onResume: () => void;
  onRestart: () => void;
  onQuit: () => void;
  onToggleSound: () => void;
  onToggleMusic: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  levelConfig,
  score,
  movesRemaining,
  soundEnabled,
  musicEnabled,
  onResume,
  onRestart,
  onQuit,
  onToggleSound,
  onToggleMusic,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in select-none">
      <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#2e0854] via-[#1c0535] to-[#100220] border-4 border-amber-400 p-6 shadow-[0_16px_40px_rgba(0,0,0,0.9),inset_0_2px_4px_rgba(251,191,36,0.4)] text-white text-center flex flex-col items-center">
        
        {/* Crown Badge */}
        <div className="w-14 h-14 -mt-12 rounded-2xl bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-700 border-2 border-yellow-200 flex items-center justify-center text-3xl shadow-[0_6px_20px_rgba(245,158,11,0.5)]">
          ⏸️
        </div>

        {/* Title */}
        <h3
          className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-100 drop-shadow mt-2 mb-1"
          style={{ fontFamily: "'Fredoka', sans-serif" }}
        >
          GAME PAUSED
        </h3>
        <p className="text-xs text-amber-200/80 mb-4 font-bold">
          Level {levelConfig.levelNumber} · Royal Challenge
        </p>

        {/* Level Stats Snapshot */}
        <div className="w-full bg-purple-950/70 border border-amber-400/30 rounded-2xl p-3 mb-4 flex items-center justify-around text-xs">
          <div>
            <div className="text-[10px] text-purple-300 uppercase tracking-wider font-bold">Score</div>
            <div className="text-lg font-black text-yellow-300">{score.toLocaleString()}</div>
          </div>
          <div className="w-px h-8 bg-purple-800" />
          <div>
            <div className="text-[10px] text-purple-300 uppercase tracking-wider font-bold">Moves Left</div>
            <div className="text-lg font-black text-amber-300">{movesRemaining}</div>
          </div>
        </div>

        {/* Audio Quick Toggles */}
        <div className="w-full grid grid-cols-2 gap-2 mb-5">
          <button
            onClick={() => {
              sound.playTap();
              onToggleSound();
            }}
            className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
              soundEnabled
                ? 'bg-purple-900/80 border-amber-400 text-yellow-300 shadow'
                : 'bg-purple-950/40 border-purple-800 text-purple-400'
            }`}
          >
            <span>{soundEnabled ? '🔊' : '🔇'}</span>
            <span>SFX: {soundEnabled ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={() => {
              sound.playTap();
              onToggleMusic();
            }}
            className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
              musicEnabled
                ? 'bg-purple-900/80 border-amber-400 text-yellow-300 shadow'
                : 'bg-purple-950/40 border-purple-800 text-purple-400'
            }`}
          >
            <span>{musicEnabled ? '🎵' : '🔇'}</span>
            <span>Music: {musicEnabled ? 'ON' : 'OFF'}</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2.5">
          {/* Resume */}
          <button
            onClick={() => {
              sound.playTap();
              onResume();
            }}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-b from-amber-300 via-yellow-500 to-amber-600 text-purple-950 font-black text-sm uppercase tracking-wider border-2 border-yellow-200 shadow-[0_5px_0_#92400e,0_8px_16px_rgba(0,0,0,0.4)] active:translate-y-1 active:shadow-[0_1px_0_#92400e] transition-all"
          >
            ▶ RESUME PLAY
          </button>

          {/* Restart */}
          <button
            onClick={() => {
              sound.playTap();
              onRestart();
            }}
            className="w-full py-3 rounded-2xl bg-gradient-to-b from-orange-400 via-amber-600 to-amber-700 text-white font-black text-xs uppercase tracking-wider border border-amber-300 shadow-[0_4px_0_#78350f] active:translate-y-1 active:shadow-none transition-all"
          >
            🔄 RESTART LEVEL
          </button>

          {/* Exit to Map */}
          <button
            onClick={() => {
              sound.playTap();
              onQuit();
            }}
            className="w-full py-2.5 rounded-2xl bg-purple-950/60 hover:bg-purple-900 border border-purple-500/40 text-purple-200 font-bold text-xs uppercase tracking-wider active:scale-95 transition-all"
          >
            🏰 EXIT TO MAP
          </button>
        </div>
      </div>
    </div>
  );
};

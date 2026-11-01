/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import confetti from 'canvas-confetti';
import { PlayerState } from '../types/game';
import { sound } from '../game/sound';

interface DailyRewardsModalProps {
  playerState: PlayerState;
  onUpdateState: (newState: PlayerState) => void;
  onClose: () => void;
}

interface RewardItem {
  day: number;
  label: string;
  coins: number;
  boosters?: {
    hammer?: number;
    rocket?: number;
    tnt?: number;
    rainbow?: number;
  };
  icon: string;
}

const REWARDS: RewardItem[] = [
  { day: 1, label: '100 Coins', coins: 100, icon: '🪙' },
  { day: 2, label: '1 Hammer', coins: 50, boosters: { hammer: 1 }, icon: '🔨' },
  { day: 3, label: '200 Coins', coins: 200, icon: '💰' },
  { day: 4, label: 'Rocket & TNT', coins: 100, boosters: { rocket: 1, tnt: 1 }, icon: '🚀' },
  { day: 5, label: '350 Coins', coins: 350, icon: '💎' },
  { day: 6, label: 'Rainbow Orb', coins: 150, boosters: { rainbow: 1 }, icon: '✨' },
  { day: 7, label: "King's Grand Chest", coins: 1000, boosters: { hammer: 2, rocket: 2, tnt: 2, rainbow: 2 }, icon: '👑' },
];

export const DailyRewardsModal: React.FC<DailyRewardsModalProps> = ({
  playerState,
  onUpdateState,
  onClose,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const canClaim = playerState.dailyReward.lastClaimDate !== todayStr;
  const currentStreak = playerState.dailyReward.streak % 7; // 0 to 6

  const handleClaim = () => {
    if (!canClaim) return;

    sound.playVictory();
    confetti({
      particleCount: 90,
      spread: 75,
      origin: { y: 0.6 },
    });

    const reward = REWARDS[currentStreak];
    const newStreak = playerState.dailyReward.streak + 1;

    const newState: PlayerState = {
      ...playerState,
      coins: playerState.coins + reward.coins,
      inventory: {
        hammer: playerState.inventory.hammer + (reward.boosters?.hammer || 0),
        rocket: playerState.inventory.rocket + (reward.boosters?.rocket || 0),
        tnt: playerState.inventory.tnt + (reward.boosters?.tnt || 0),
        rainbow: playerState.inventory.rainbow + (reward.boosters?.rainbow || 0),
      },
      dailyReward: {
        lastClaimDate: todayStr,
        streak: newStreak,
      },
    };

    onUpdateState(newState);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#2e0854] via-[#1c0535] to-[#100220] border-4 border-amber-400 p-5 shadow-[0_16px_40px_rgba(0,0,0,0.9),inset_0_2px_4px_rgba(251,191,36,0.4)] text-white">
        
        {/* Close Button */}
        <button
          onClick={() => {
            sound.playTap();
            onClose();
          }}
          className="absolute -top-3 -right-3 w-9 h-9 rounded-full bg-red-600 border-2 border-yellow-300 flex items-center justify-center text-white font-bold shadow-lg active:scale-95 transition-transform cursor-pointer"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="text-center mb-3">
          <div className="inline-block px-4 py-1 rounded-full bg-purple-900/80 border border-amber-400/60 text-amber-300 text-xs font-black tracking-widest uppercase mb-1">
            Royal Calendar
          </div>
          <h2
            className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-100 drop-shadow"
            style={{ fontFamily: "'Fredoka', sans-serif" }}
          >
            Daily Royal Gifts
          </h2>
          <p className="text-xs text-purple-200/90 font-medium">
            Claim royal coins & booster supplies every 24 hours!
          </p>
        </div>

        {/* 7 Days Grid */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {REWARDS.slice(0, 6).map((item, idx) => {
            const isCompleted = idx < currentStreak;
            const isToday = idx === currentStreak && canClaim;
            const isFuture = idx > currentStreak || (idx === currentStreak && !canClaim);

            return (
              <div
                key={item.day}
                className={`relative flex flex-col items-center justify-center p-2 rounded-2xl border-2 transition-transform ${
                  isToday
                    ? 'bg-gradient-to-b from-amber-400 via-amber-500 to-amber-700 border-yellow-200 shadow-[0_0_16px_rgba(250,204,21,0.7)] scale-105 z-10 animate-pulse'
                    : isCompleted
                    ? 'bg-purple-950/70 border-emerald-500/80 text-emerald-300'
                    : 'bg-purple-950/40 border-purple-800 text-purple-400 opacity-60'
                }`}
              >
                <span className="text-[10px] font-black uppercase text-amber-200">
                  Day {item.day}
                </span>
                <span className="text-2xl my-1">{item.icon}</span>
                <span className="text-[9px] font-bold text-center leading-tight">
                  {item.label}
                </span>

                {isCompleted && (
                  <div className="absolute inset-0 bg-emerald-950/70 rounded-2xl flex items-center justify-center">
                    <span className="text-lg font-black text-emerald-300">✓</span>
                  </div>
                )}
              </div>
            );
          })}

          {/* Day 7 Grand Chest (Spans 2 cols) */}
          <div
            className={`col-span-2 relative flex items-center justify-between px-3 py-2 rounded-2xl border-2 ${
              currentStreak === 6 && canClaim
                ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-600 border-white shadow-[0_0_20px_rgba(250,204,21,0.9)] scale-105 animate-bounce'
                : currentStreak > 6
                ? 'bg-purple-950/70 border-emerald-500/80 text-emerald-300'
                : 'bg-purple-950/40 border-purple-800 text-purple-400 opacity-60'
            }`}
          >
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-black uppercase text-purple-950">
                DAY 7 · GRAND CHEST
              </span>
              <span className="text-xs font-black text-purple-950">
                1000 Coins + All Boosters
              </span>
            </div>
            <span className="text-3xl">👑</span>
          </div>
        </div>

        {/* Claim Button */}
        <button
          onClick={handleClaim}
          disabled={!canClaim}
          className={`w-full py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider transition-all ${
            canClaim
              ? 'bg-gradient-to-b from-amber-300 via-yellow-500 to-amber-600 text-purple-950 border-2 border-yellow-200 shadow-[0_5px_0_#92400e,0_8px_16px_rgba(0,0,0,0.4)] active:translate-y-1 active:shadow-[0_1px_0_#92400e] cursor-pointer'
              : 'bg-purple-950/40 border-2 border-purple-800 text-purple-400 opacity-60 cursor-not-allowed'
          }`}
        >
          {canClaim ? 'CLAIM ROYAL REWARD! 🎁' : 'ALREADY CLAIMED TODAY ✓'}
        </button>
      </div>
    </div>
  );
};

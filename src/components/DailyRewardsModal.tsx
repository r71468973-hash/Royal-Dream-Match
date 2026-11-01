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
  { day: 6, label: 'Rainbow Orb', coins: 150, boosters: { rainbow: 1 }, icon: '🌈' },
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
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    const reward = REWARDS[currentStreak];
    const newStreak = (playerState.dailyReward.streak + 1);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-blue-900 via-indigo-950 to-blue-950 border-4 border-yellow-400 p-5 shadow-[0_10px_35px_rgba(0,0,0,0.8)] text-white">
        
        {/* Close Button */}
        <button
          onClick={() => {
            sound.playTap();
            onClose();
          }}
          className="absolute -top-3 -right-3 w-9 h-9 rounded-full bg-red-600 border-2 border-yellow-300 flex items-center justify-center text-white font-bold shadow-lg active:scale-95 transition-transform"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="text-center mb-4">
          <div className="inline-block px-4 py-1 rounded-full bg-yellow-400/20 border border-yellow-400 text-yellow-300 text-xs font-bold tracking-widest uppercase mb-1">
            Royal Calendar
          </div>
          <h2
            className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-yellow-400 to-amber-500 drop-shadow"
            style={{ fontFamily: "'Fredoka', sans-serif" }}
          >
            DAILY REWARDS
          </h2>
          <p className="text-xs text-blue-200">
            Log in every day to earn royal treasures & power-ups!
          </p>
        </div>

        {/* 7 Days Grid */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {REWARDS.map((item, index) => {
            const isToday = index === currentStreak;
            const isClaimed = !canClaim && index === currentStreak;
            const isPast = index < currentStreak;
            const isDay7 = item.day === 7;

            return (
              <div
                key={item.day}
                className={`relative rounded-xl p-2 flex flex-col items-center justify-between text-center border-2 transition-transform ${
                  isDay7 ? 'col-span-2' : ''
                } ${
                  isToday && canClaim
                    ? 'bg-gradient-to-b from-yellow-500/30 to-amber-600/30 border-yellow-400 ring-2 ring-yellow-400/50 scale-105'
                    : isPast || isClaimed
                    ? 'bg-blue-950/60 border-emerald-500/60 opacity-80'
                    : 'bg-blue-950/40 border-blue-800/80 opacity-70'
                }`}
              >
                {/* Day Tag */}
                <span className="text-[10px] font-bold text-yellow-200 uppercase">
                  Day {item.day}
                </span>

                {/* Reward Icon */}
                <div className="text-2xl my-1 drop-shadow">{item.icon}</div>

                {/* Reward Label */}
                <span className="text-[10px] font-extrabold text-white leading-tight">
                  {item.label}
                </span>

                {/* Status Badges */}
                {isPast || isClaimed ? (
                  <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-emerald-500 text-white text-[10px] flex items-center justify-center font-bold">
                    ✓
                  </div>
                ) : isToday && canClaim ? (
                  <div className="absolute -top-1 -right-1 px-1 rounded-full bg-red-600 text-[8px] font-black text-white animate-pulse">
                    READY
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="mt-2 flex flex-col items-center gap-2">
          {canClaim ? (
            <button
              onClick={handleClaim}
              className="w-full py-3 rounded-2xl bg-gradient-to-b from-yellow-300 via-amber-400 to-amber-600 border-2 border-yellow-100 text-blue-950 font-black text-base tracking-wider uppercase shadow-[0_6px_20px_rgba(245,158,11,0.6)] active:scale-95 transition-transform"
            >
              CLAIM REWARD NOW!
            </button>
          ) : (
            <div className="w-full py-2.5 rounded-2xl bg-blue-950/80 border border-blue-700 text-center text-xs font-bold text-blue-300">
              ✓ Reward Claimed! Next reward in tomorrow.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

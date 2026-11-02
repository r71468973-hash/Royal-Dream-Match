/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AdReward, rewardedAdService } from '../services/rewardedAdService';
import { ADMOB_CONFIG } from '../config/admob';
import { sound } from '../game/sound';

interface AdMobRewardedModalProps {
  reward: AdReward;
  countdown: number;
  status: 'idle' | 'loading' | 'playing' | 'completed' | 'cancelled';
  onClose: () => void;
}

export const AdMobRewardedModal: React.FC<AdMobRewardedModalProps> = ({
  reward,
  countdown,
  status,
  onClose,
}) => {
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const isCompleted = status === 'completed';
  const progressPercent = Math.min(100, Math.max(0, ((5 - countdown) / 5) * 100));

  const handleAttemptClose = () => {
    sound.playTap();
    if (countdown <= 0 || isCompleted) {
      onClose();
    } else {
      setShowExitConfirm(true);
    }
  };

  const handleConfirmExit = () => {
    sound.playDefeat();
    setShowExitConfirm(false);
    rewardedAdService.cancelRewardedAd();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#22073d] via-[#150426] to-[#0a0214] border-4 border-amber-400 p-5 shadow-[0_16px_50px_rgba(0,0,0,0.95)] text-white flex flex-col items-center text-center overflow-hidden">
        
        {/* Top Header Row with AdMob Tag & Countdown */}
        <div className="w-full flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5 bg-black/60 px-2.5 py-1 rounded-full border border-amber-400/40">
            <span className="px-1.5 py-0.2 rounded text-[8px] font-black uppercase bg-amber-400 text-purple-950">
              AD
            </span>
            <span className="text-[10px] font-bold text-amber-200">
              {ADMOB_CONFIG.isTestMode ? 'Google AdMob (Test Ad)' : 'Google AdMob Rewarded'}
            </span>
          </div>

          {/* Countdown timer badge */}
          <div className="flex items-center gap-1 bg-purple-950/90 border border-purple-500/60 px-2.5 py-1 rounded-full">
            {isCompleted ? (
              <span className="text-[10px] font-black text-emerald-400 flex items-center gap-1">
                <span>✓</span> REWARD EARNED!
              </span>
            ) : (
              <span className="text-[10px] font-black text-amber-300">
                Reward in {countdown}s
              </span>
            )}
          </div>
        </div>

        {/* Video Creative Frame */}
        <div className="relative w-full h-52 rounded-2xl bg-gradient-to-br from-[#2a0e4a] via-[#1a0830] to-[#0f031e] border-2 border-purple-600/80 p-4 flex flex-col items-center justify-center overflow-hidden shadow-inner mb-3">
          {/* Subtle moving particles / lights */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.15)_0,transparent_70%)] animate-pulse" />

          {/* Reward Icon & Title */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-200 border-2 border-white flex items-center justify-center text-3xl shadow-lg mb-2 animate-bounce">
              {reward.type === 'coins' ? '🪙' : reward.type === 'lives' ? '❤️' : '⚡'}
            </div>

            <div
              className="text-lg font-black text-white drop-shadow uppercase"
              style={{ fontFamily: "'Fredoka', sans-serif" }}
            >
              {reward.title}
            </div>

            <p className="text-xs text-amber-200/90 mt-1 max-w-[220px]">
              {reward.description}
            </p>
          </div>

          {/* Video Progress Bar at Bottom of Video Area */}
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/60">
            <div
              className="h-full bg-gradient-to-r from-amber-400 via-yellow-300 to-emerald-400 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Reward Status Banner */}
        <div className="w-full bg-[#1b0730]/90 rounded-2xl p-2.5 border border-amber-400/30 flex items-center justify-between mb-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-xl">
              {reward.type === 'coins' ? '💰' : reward.type === 'lives' ? '💖' : '🎯'}
            </span>
            <div className="text-left">
              <span className="text-[10px] text-purple-300 block">Reward to receive:</span>
              <span className="font-black text-amber-300">
                +{reward.amount} {reward.type === 'coins' ? 'Royal Gold Coins' : reward.type === 'lives' ? 'Royal Life' : 'Extra Moves'}
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono text-purple-300 bg-black/40 px-2 py-1 rounded-lg">
            {ADMOB_CONFIG.isTestMode ? 'Test Mode' : 'Live Unit'}
          </span>
        </div>

        {/* Early Exit Confirm Dialog or Action Buttons */}
        {showExitConfirm ? (
          <div className="w-full p-3 rounded-2xl bg-rose-950/90 border-2 border-rose-500 flex flex-col gap-2">
            <div className="text-xs font-black text-rose-200">
              Exit early? You will forfeit the +{reward.amount} {reward.type}!
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-purple-950 font-black text-xs uppercase"
              >
                Keep Watching
              </button>
              <button
                onClick={handleConfirmExit}
                className="flex-1 py-1.5 rounded-xl bg-slate-800 border border-rose-500/50 text-rose-300 font-bold text-xs uppercase"
              >
                Exit Now
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full flex gap-2">
            {isCompleted ? (
              <button
                onClick={handleAttemptClose}
                className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-xs uppercase tracking-wider border border-emerald-300 shadow-md active:scale-95 transition-transform"
              >
                ✓ CLAIM REWARD & CONTINUE
              </button>
            ) : (
              <button
                onClick={handleAttemptClose}
                className="w-full py-2 rounded-2xl bg-purple-950/70 hover:bg-purple-900 border border-purple-700 text-purple-300 font-bold text-[11px] active:scale-95 transition-transform"
              >
                Skip / Close Ad
              </button>
            )}
          </div>
        )}

        {/* AdMob Attribution Footer */}
        <div className="text-[8px] font-mono text-purple-400/80 mt-2 truncate max-w-full">
          Google AdMob Rewarded: {ADMOB_CONFIG.rewardedUnitId}
        </div>
      </div>
    </div>
  );
};

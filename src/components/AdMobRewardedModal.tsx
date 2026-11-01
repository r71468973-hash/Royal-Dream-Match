/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AdReward } from '../services/admobService';
import { admobService } from '../services/admobService';

interface AdMobRewardedModalProps {
  reward: AdReward;
  countdown: number;
  onClose: () => void;
}

export const AdMobRewardedModal: React.FC<AdMobRewardedModalProps> = ({
  reward,
  countdown,
  onClose,
}) => {
  const config = admobService.getConfig();
  const progressPct = Math.min(100, Math.max(0, ((5 - countdown) / 5) * 100));

  const rewardLabel = 
    reward.type === 'extra_moves' ? `+${reward.amount} Extra Moves` :
    reward.type === 'life' ? `+${reward.amount} Royal Heart` :
    `+${reward.amount} Coins`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in select-none">
      <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-neutral-900 via-slate-950 to-black border-4 border-amber-500/80 p-5 shadow-2xl text-white flex flex-col items-center text-center">
        
        {/* Top Header */}
        <div className="w-full flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 rounded bg-amber-400 text-[10px] font-black text-black">
              Ad
            </span>
            <span className="text-xs font-bold text-amber-300">
              {config.testMode ? 'Google AdMob: Rewarded Video (Test)' : 'Rewarded Sponsor'}
            </span>
          </div>

          <button
            onClick={() => {
              if (confirm('If you close now, you will not receive your reward. Do you want to cancel?')) {
                onClose();
              }
            }}
            className="text-xs text-neutral-400 hover:text-white px-2 py-0.5 rounded border border-neutral-700"
          >
            ✕ Close
          </button>
        </div>

        {/* Reward Goal Tag */}
        <div className="my-2.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400 text-xs font-extrabold text-amber-200">
          Reward on Completion: {rewardLabel}
        </div>

        {/* Video Simulation Screen */}
        <div className="relative w-full aspect-video rounded-2xl bg-gradient-to-tr from-blue-950 via-indigo-900 to-purple-950 border border-indigo-500/60 overflow-hidden flex flex-col items-center justify-center p-4 my-2 shadow-inner">
          <div className="text-4xl animate-bounce">🎬</div>
          <div className="text-sm font-black text-white mt-2">
            Royal Dream Match Sponsor
          </div>
          <div className="text-[11px] text-indigo-200 mt-1">
            Official AdMob Test Ad Creative
          </div>

          {/* Countdown Overlay */}
          <div className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-black/70 text-xs font-bold text-yellow-300">
            {countdown > 0 ? `Reward in ${countdown}s` : '✓ Completed!'}
          </div>

          {/* Progress Bar */}
          <div className="absolute bottom-0 inset-x-0 h-2 bg-neutral-900">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 transition-all duration-1000 ease-linear"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Ad Unit & Policy Tag */}
        <div className="text-[10px] text-neutral-400 font-mono mt-2">
          AdMob Rewarded Unit: {config.rewarded.android}
        </div>
        <p className="text-[10px] text-neutral-400 mt-1">
          Rewards are granted automatically when the video ad completes.
        </p>
      </div>
    </div>
  );
};

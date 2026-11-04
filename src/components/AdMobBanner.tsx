/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { showRealNativeBanner, hideRealNativeBanner } from '../services/nativeAdMob';
import { rewardedAdService } from '../services/rewardedAdService';
import { sound } from '../game/sound';
import { loadPlayerState, savePlayerState } from '../game/storage';

interface AdMobBannerProps {
  className?: string;
  onRewardReceived?: () => void;
}

interface AdSlide {
  id: string;
  type: 'banner' | 'rewarded_coins' | 'rewarded_life' | 'rewarded_moves';
  badge: string;
  badgeBg: string;
  title: string;
  subtitle: string;
  actionText?: string;
  icon?: string;
}

const AD_SLIDES: AdSlide[] = [
  {
    id: 'admob-live',
    type: 'banner',
    badge: 'Ad',
    badgeBg: 'bg-amber-400 text-purple-950',
    title: 'Google AdMob Banner',
    subtitle: 'Official Certified Ad Network',
  },
  {
    id: 'sponsor-coins',
    type: 'rewarded_coins',
    badge: 'Reward Ad',
    badgeBg: 'bg-yellow-400 text-yellow-950',
    icon: '🪙',
    title: 'Earn +100 Gold Coins',
    subtitle: 'Watch official sponsored video',
    actionText: 'WATCH',
  },
  {
    id: 'sponsor-life',
    type: 'rewarded_life',
    badge: 'Reward Ad',
    badgeBg: 'bg-rose-500 text-white',
    icon: '❤️',
    title: 'Replenish +1 Royal Life',
    subtitle: 'Watch video to restore life',
    actionText: 'WATCH',
  },
  {
    id: 'sponsor-moves',
    type: 'rewarded_moves',
    badge: 'Reward Ad',
    badgeBg: 'bg-emerald-500 text-white',
    icon: '⚡',
    title: '+5 Extra Moves Bonus',
    subtitle: 'Watch video for royal booster',
    actionText: 'WATCH',
  },
];

export const AdMobBanner: React.FC<AdMobBannerProps> = ({
  className = '',
  onRewardReceived,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 1. Mount legitimate native Google Mobile Ads SDK banner on Android Native
  // Policy Compliant: Follows standard AdMob lifecycle without forced synthetic SDK reloads
  useEffect(() => {
    showRealNativeBanner();
    return () => {
      hideRealNativeBanner();
    };
  }, []);

  // 2. Smooth 5-Second Rotation across legitimate ad display formats
  // Rotation is localized to this component and does NOT refresh or re-render the game
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % AD_SLIDES.length);
        setIsTransitioning(false);
      }, 350); // Mid-transition crossfade
    }, 5000); // Policy compliant 5-second rotation of display formats

    return () => clearInterval(interval);
  }, [isPaused]);

  const showToast = (msg: string) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastMsg(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMsg(null);
    }, 2800);
  };

  const handleActionClick = (slide: AdSlide) => {
    sound.playTap();

    if (slide.type === 'rewarded_coins') {
      showToast('Loading ad...');
      rewardedAdService.showRewardedAd(
        {
          type: 'coins',
          amount: 100,
          title: '100 Gold Coins',
          description: 'Watch video to earn 100 Gold Coins',
        },
        () => {
          const current = loadPlayerState();
          const updated = { ...current, coins: current.coins + 100 };
          savePlayerState(updated);
          showToast('🎉 +100 Coins Received!');
          if (onRewardReceived) onRewardReceived();
        },
        (errorMsg) => {
          showToast(errorMsg || 'Ad not available. Please try again.');
        }
      );
    } else if (slide.type === 'rewarded_life') {
      const current = loadPlayerState();
      if (current.lives >= current.maxLives) {
        showToast('Royal Lives are full (5/5)!');
        return;
      }

      showToast('Loading ad...');
      rewardedAdService.showRewardedAd(
        {
          type: 'lives',
          amount: 1,
          title: 'Extra Royal Life',
          description: 'Watch video to restore 1 Life',
        },
        () => {
          const stateNow = loadPlayerState();
          const updated = { ...stateNow, lives: Math.min(stateNow.maxLives, stateNow.lives + 1) };
          savePlayerState(updated);
          showToast('🎉 +1 Life Restored!');
          if (onRewardReceived) onRewardReceived();
        },
        (errorMsg) => {
          showToast(errorMsg || 'Ad not available. Please try again.');
        }
      );
    } else if (slide.type === 'rewarded_moves') {
      showToast('Loading ad...');
      rewardedAdService.showRewardedAd(
        {
          type: 'moves',
          amount: 5,
          title: '+5 Extra Moves',
          description: 'Watch video to receive +5 Extra Moves',
        },
        () => {
          showToast('⚡ Extra Moves Ready for your next game!');
          if (onRewardReceived) onRewardReceived();
        },
        (errorMsg) => {
          showToast(errorMsg || 'Ad not available. Please try again.');
        }
      );
    }
  };

  const currentSlide = AD_SLIDES[currentIndex];

  return (
    <div
      className={`w-full max-w-sm mx-auto h-[52px] bg-[#0c0418] border-t border-b border-amber-400/35 shadow-inner flex items-center justify-between px-2.5 select-none overflow-hidden relative shrink-0 ${className}`}
      role="banner"
      aria-label="Google AdMob Advertisement Display Section"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-950/80 via-indigo-950/70 to-purple-950/80 pointer-events-none" />

      {/* Floating Mini Toast */}
      {toastMsg && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/85 backdrop-blur-xs px-2 text-center animate-in fade-in duration-200">
          <span className="text-[11px] font-bold text-amber-300 truncate max-w-full">
            {toastMsg}
          </span>
        </div>
      )}

      {/* Rotating Advertisement Display Section */}
      <div
        className={`relative z-10 flex items-center justify-between w-full transition-all duration-300 ease-in-out ${
          isTransitioning ? 'opacity-0 scale-98 translate-y-1' : 'opacity-100 scale-100 translate-y-0'
        }`}
      >
        {/* Left Side: Badge + Title / Details */}
        <div className="flex items-center gap-2 min-w-0 pr-1">
          <span
            className={`px-1.5 py-0.5 rounded text-[8.5px] font-black uppercase tracking-wider shadow-xs shrink-0 ${currentSlide.badgeBg}`}
          >
            {currentSlide.badge}
          </span>

          <div className="flex flex-col text-left min-w-0">
            <div className="flex items-center gap-1 leading-tight truncate">
              {currentSlide.icon && <span className="text-xs">{currentSlide.icon}</span>}
              <span className="text-[11px] font-bold text-amber-200 truncate">
                {currentSlide.title}
              </span>
            </div>
            <span className="text-[8.5px] text-purple-300/90 truncate">
              {currentSlide.subtitle}
            </span>
          </div>
        </div>

        {/* Right Side: Action Button or Google AdMob Network Tag */}
        <div className="relative z-10 flex items-center gap-1.5 shrink-0 pl-1">
          {currentSlide.actionText ? (
            <button
              onClick={() => handleActionClick(currentSlide)}
              className="py-1 px-2.5 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 border border-yellow-200 text-purple-950 font-black text-[9.5px] tracking-wider uppercase shadow-[0_2px_0_#92400e] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer flex items-center gap-1"
            >
              <span>{currentSlide.actionText}</span>
              <span className="text-[8px]">▶</span>
            </button>
          ) : (
            <div className="flex items-center gap-1 text-right">
              <span className="text-[9px] font-bold text-yellow-300/90 flex items-center gap-0.5">
                <span>Google</span>
                <span className="text-white">AdMob</span>
              </span>
              <div className="w-4 h-4 rounded-full bg-amber-400/20 border border-amber-300/40 flex items-center justify-center text-[9px] text-amber-300">
                ⓘ
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mini Rotation Progress Dots (Bottom Indicator) */}
      <div className="absolute bottom-0.5 left-0 right-0 flex justify-center items-center gap-1 pointer-events-none z-10">
        {AD_SLIDES.map((_, idx) => (
          <span
            key={idx}
            className={`h-0.5 rounded-full transition-all duration-300 ${
              idx === currentIndex
                ? 'w-3 bg-amber-400'
                : 'w-1 bg-purple-700/60'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

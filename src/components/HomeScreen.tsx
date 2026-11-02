/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { PlayerState } from '../types/game';
import { KingAvatar } from './KingAvatar';
import { RoyalLogo } from './RoyalLogo';
import { sound } from '../game/sound';
import { AdMobBanner } from './AdMobBanner';
import { rewardedAdService } from '../services/rewardedAdService';
import { ApkDownloadModal } from './ApkDownloadModal';
import { RoyalAlertModal } from './RoyalAlertModal';

interface HomeScreenProps {
  playerState: PlayerState;
  onPlayLevel: (levelNumber: number) => void;
  onOpenMap: () => void;
  onOpenDailyRewards: () => void;
  onOpenSettings: () => void;
  onUpdateState: (newState: PlayerState) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  playerState,
  onPlayLevel,
  onOpenMap,
  onOpenDailyRewards,
  onOpenSettings,
  onUpdateState,
}) => {
  const [lifeCountdown, setLifeCountdown] = useState<string>('');
  const [showApkModal, setShowApkModal] = useState<boolean>(false);
  const [alertState, setAlertState] = useState<{ title: string; message: string; icon?: string } | null>(null);

  // Calculate life regeneration countdown if lives < 5
  useEffect(() => {
    if (playerState.lives >= playerState.maxLives || !playerState.lastLifeLostTimestamp) {
      setLifeCountdown('FULL');
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - (playerState.lastLifeLostTimestamp || now);
      const remainingMs = Math.max(0, 15 * 60 * 1000 - (elapsed % (15 * 60 * 1000)));
      const minutes = Math.floor(remainingMs / 60000);
      const seconds = Math.floor((remainingMs % 60000) / 1000);
      setLifeCountdown(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [playerState.lives, playerState.maxLives, playerState.lastLifeLostTimestamp]);

  const todayStr = new Date().toISOString().split('T')[0];
  const hasDailyReward = playerState.dailyReward.lastClaimDate !== todayStr;

  const toggleSound = () => {
    const next = !playerState.settings.sound;
    sound.setSoundEnabled(next);
    if (next) sound.playTap();
    onUpdateState({
      ...playerState,
      settings: { ...playerState.settings, sound: next },
    });
  };

  const handlePlay = () => {
    if (playerState.lives <= 0) {
      sound.playInvalid();
      setAlertState({
        title: 'OUT OF LIVES!',
        message: 'Your royal hearts are exhausted. Claim your Daily Reward or watch a short video to instantly restore a life!',
        icon: '💔',
      });
      return;
    }
    sound.playTap();
    onPlayLevel(playerState.currentLevel);
  };

  const handleWatchAdForCoins = () => {
    sound.playTap();
    rewardedAdService.showRewardedAd(
      {
        type: 'coins',
        amount: 100,
        title: '100 Gold Coins',
        description: 'Watch a short video to claim +100 Royal Gold Coins!',
      },
      () => {
        sound.playCoin();
        onUpdateState({
          ...playerState,
          coins: playerState.coins + 100,
        });
        setAlertState({
          title: 'Coins Received!',
          message: '+100 Royal Gold Coins have been added to your treasury!',
          icon: '🪙',
        });
      }
    );
  };

  const handleWatchAdForLife = () => {
    sound.playTap();
    if (playerState.lives >= playerState.maxLives) {
      setAlertState({
        title: 'Lives Full!',
        message: 'Your royal lives are already at maximum (5/5)!',
        icon: '❤️',
      });
      return;
    }

    rewardedAdService.showRewardedAd(
      {
        type: 'lives',
        amount: 1,
        title: 'Extra Royal Life',
        description: 'Watch a short video to restore +1 Royal Heart!',
      },
      () => {
        const nextLives = Math.min(playerState.maxLives, playerState.lives + 1);
        onUpdateState({
          ...playerState,
          lives: nextLives,
        });
        setAlertState({
          title: 'Life Restored!',
          message: '+1 Royal Life has been replenished!',
          icon: '❤️',
        });
      }
    );
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-3 pb-0 select-none overflow-hidden bg-[#0e031a]">
      
      {/* Royal Palace Background Image & Velvet Scrim */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-35 pointer-events-none"
        style={{ backgroundImage: "url('/royal_palace_bg.jpg')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#1c0535]/85 via-[#100220]/75 to-[#090114]/95 pointer-events-none" />

      {/* Floating Gold Sparkles */}
      <div className="absolute top-1/4 left-6 text-yellow-300 text-sm animate-ping pointer-events-none">✦</div>
      <div className="absolute top-1/2 right-6 text-amber-200 text-lg animate-pulse pointer-events-none">✨</div>
      <div className="absolute bottom-1/4 left-10 text-yellow-100 text-xs animate-bounce pointer-events-none">✦</div>

      {/* Top Header / Currencies */}
      <div className="relative z-10 flex items-center justify-between gap-2">
        {/* Profile Card */}
        <div className="flex items-center gap-2 p-1 pr-3.5 rounded-full bg-purple-950/85 border border-amber-400/60 backdrop-blur-md shadow-[0_4px_16px_rgba(0,0,0,0.6)]">
          <KingAvatar mood="happy" size="sm" />
          <div className="flex flex-col">
            <span className="text-[11px] font-black text-white leading-tight">
              Royal Monarch
            </span>
            <span className="text-[10px] font-bold text-amber-300">
              Level {playerState.currentLevel} of 100
            </span>
          </div>
        </div>

        {/* Currency Pods */}
        <div className="flex items-center gap-2">
          {/* Lives (Clickable to refill via video ad) */}
          <button
            onClick={handleWatchAdForLife}
            className="flex items-center gap-1 px-3 py-1 rounded-full bg-rose-950/85 hover:bg-rose-900 border border-rose-500/80 shadow-[0_4px_12px_rgba(244,63,94,0.3)] active:scale-95 transition-transform"
            title="Watch video for +1 Life"
          >
            <span className="text-xs">❤️</span>
            <div className="flex flex-col items-center">
              <span className="text-xs font-black text-white leading-none">
                {playerState.lives}/{playerState.maxLives}
              </span>
              {playerState.lives < playerState.maxLives ? (
                <span className="text-[7px] font-black text-emerald-300 leading-none mt-0.5">
                  +Free Ad
                </span>
              ) : null}
            </div>
          </button>

          {/* Coins */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/85 border border-amber-400/80 shadow-[0_4px_12px_rgba(245,158,11,0.3)]">
            <span className="text-xs">🪙</span>
            <span className="text-xs font-black text-amber-300">
              {playerState.coins.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Center Hero View / Logo */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto gap-2">
        <RoyalLogo size="md" animated={true} />

        {/* Hero Castle Emblem */}
        <div className="relative my-2">
          <div className="w-32 h-32 rounded-3xl bg-gradient-to-tr from-purple-900/60 via-amber-500/20 to-purple-800/60 border-2 border-amber-400/70 p-2 shadow-[0_8px_32px_rgba(0,0,0,0.8)] flex items-center justify-center backdrop-blur-sm">
            <KingAvatar mood="happy" size="lg" />
          </div>
          {/* Level Crown Badge */}
          <div className="absolute -bottom-2.5 inset-x-0 mx-auto w-max px-4 py-0.5 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 border border-yellow-100 text-purple-950 text-xs font-black shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
            Level {playerState.currentLevel}
          </div>
        </div>
      </div>

      {/* Main Buttons / Controls */}
      <div className="relative z-10 flex flex-col items-center gap-2.5 w-full max-w-sm mx-auto mb-1">
        
        {/* Rewarded Ads Action Row (Coins, Lives, APK) */}
        <div className="grid grid-cols-3 gap-2 w-full">
          <button
            onClick={handleWatchAdForCoins}
            className="py-2 px-1.5 rounded-2xl bg-gradient-to-b from-amber-400 to-yellow-600 border border-yellow-200 text-purple-950 font-black text-[10px] shadow-[0_3px_0_#92400e] active:translate-y-0.5 active:shadow-none transition-all flex flex-col items-center justify-center gap-0.5"
          >
            <span className="text-sm">🎬 🪙</span>
            <span>+100 Coins</span>
          </button>

          <button
            onClick={handleWatchAdForLife}
            className="py-2 px-1.5 rounded-2xl bg-gradient-to-b from-rose-500 to-red-700 border border-rose-300 text-white font-black text-[10px] shadow-[0_3px_0_#881337] active:translate-y-0.5 active:shadow-none transition-all flex flex-col items-center justify-center gap-0.5"
          >
            <span className="text-sm">🎬 ❤️</span>
            <span>+1 Free Life</span>
          </button>

          <button
            onClick={() => {
              sound.playTap();
              setShowApkModal(true);
            }}
            className="py-2 px-1.5 rounded-2xl bg-gradient-to-b from-purple-700 to-indigo-900 border border-amber-400 text-amber-200 font-black text-[10px] shadow-[0_3px_0_#2e1065] active:translate-y-0.5 active:shadow-none transition-all flex flex-col items-center justify-center gap-0.5"
          >
            <span className="text-sm">📥 👑</span>
            <span>Store Hub</span>
          </button>
        </div>

        {/* Giant Play Button */}
        <button
          onClick={handlePlay}
          className="group relative w-full py-4 rounded-3xl bg-gradient-to-b from-amber-300 via-yellow-500 to-amber-600 border-4 border-yellow-200 shadow-[0_6px_0_#92400e,0_12px_28px_rgba(0,0,0,0.7)] active:translate-y-1.5 active:shadow-[0_1px_0_#92400e] transition-all flex items-center justify-center gap-3 overflow-hidden cursor-pointer"
        >
          {/* Shimmer sweep */}
          <div className="absolute inset-0 w-1/3 bg-white/35 transform -skew-x-12 translate-x-[-150%] group-hover:translate-x-[400%] transition-transform duration-1000" />
          
          <span className="text-3xl drop-shadow">👑</span>
          <div className="flex flex-col text-left">
            <span
              className="text-2xl font-black text-purple-950 tracking-wider uppercase drop-shadow-[0_1px_1px_rgba(255,255,255,0.7)]"
              style={{ fontFamily: "'Fredoka', sans-serif" }}
            >
              PLAY LEVEL {playerState.currentLevel}
            </span>
            <span className="text-[10px] font-extrabold text-amber-950 uppercase tracking-widest">
              Tap to Enter Realm
            </span>
          </div>
          <span className="text-2xl text-purple-950 drop-shadow">▶</span>
        </button>

        {/* Bottom Utility Row */}
        <div className="grid grid-cols-4 gap-2 w-full">
          {/* Level Map Button */}
          <button
            onClick={() => {
              sound.playTap();
              onOpenMap();
            }}
            className="flex flex-col items-center justify-center p-2 rounded-2xl bg-purple-950/85 hover:bg-purple-900 border border-amber-400/50 shadow-[0_3px_0_#1e0836] active:translate-y-0.5 active:shadow-none transition-all"
          >
            <span className="text-xl">🗺️</span>
            <span className="text-[10px] font-black text-amber-200 mt-0.5">Map</span>
          </button>

          {/* Daily Rewards Button */}
          <button
            onClick={() => {
              sound.playTap();
              onOpenDailyRewards();
            }}
            className="relative flex flex-col items-center justify-center p-2 rounded-2xl bg-purple-950/85 hover:bg-purple-900 border border-amber-400/50 shadow-[0_3px_0_#1e0836] active:translate-y-0.5 active:shadow-none transition-all"
          >
            {hasDailyReward && (
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 animate-ping" />
            )}
            <span className="text-xl">🎁</span>
            <span className="text-[10px] font-black text-amber-200 mt-0.5">Daily</span>
          </button>

          {/* Sound Toggle Button */}
          <button
            onClick={toggleSound}
            className="flex flex-col items-center justify-center p-2 rounded-2xl bg-purple-950/85 hover:bg-purple-900 border border-amber-400/50 shadow-[0_3px_0_#1e0836] active:translate-y-0.5 active:shadow-none transition-all"
          >
            <span className="text-xl">{playerState.settings.sound ? '🔊' : '🔇'}</span>
            <span className="text-[10px] font-black text-amber-200 mt-0.5">
              {playerState.settings.sound ? 'Sound' : 'Mute'}
            </span>
          </button>

          {/* Settings Button */}
          <button
            onClick={() => {
              sound.playTap();
              onOpenSettings();
            }}
            className="flex flex-col items-center justify-center p-2 rounded-2xl bg-purple-950/85 hover:bg-purple-900 border border-amber-400/50 shadow-[0_3px_0_#1e0836] active:translate-y-0.5 active:shadow-none transition-all"
          >
            <span className="text-xl">⚙️</span>
            <span className="text-[10px] font-black text-amber-200 mt-0.5">Settings</span>
          </button>
        </div>
      </div>

      {/* Google AdMob Banner at Bottom */}
      <div className="relative z-10 w-full mt-1 shrink-0">
        <AdMobBanner />
      </div>

      {/* APK Modal */}
      {showApkModal && (
        <ApkDownloadModal onClose={() => setShowApkModal(false)} />
      )}

      {/* Royal In-Game Alert Modal */}
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

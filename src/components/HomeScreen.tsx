/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { PlayerState } from '../types/game';
import { KingAvatar } from './KingAvatar';
import { RoyalLogo } from './RoyalLogo';
import { sound } from '../game/sound';
import { admobService } from '../services/admobService';
import { AdMobBanner } from './AdMobBanner';
import { ApkDownloadModal } from './ApkDownloadModal';

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
      alert('You are out of lives! Watch a short ad for a free heart or wait for lives to recharge.');
      return;
    }
    sound.playTap();
    onPlayLevel(playerState.currentLevel);
  };

  const handleWatchAdForCoins = () => {
    sound.playTap();
    admobService.showRewardedAd(
      { type: 'coins', amount: 100 },
      () => {
        onUpdateState({
          ...playerState,
          coins: playerState.coins + 100,
        });
      }
    );
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-3 pb-0 bg-gradient-to-b from-[#0b1c44] via-[#122e6b] to-[#08152e] select-none overflow-hidden">
      
      {/* Background Animated Elements */}
      <div className="absolute inset-0 bg-radial from-blue-400/15 via-transparent to-black/60 pointer-events-none" />

      {/* Floating Sparkles */}
      <div className="absolute top-1/4 left-6 text-yellow-300 text-sm animate-ping">✦</div>
      <div className="absolute top-1/2 right-6 text-amber-200 text-lg animate-pulse">✨</div>
      <div className="absolute bottom-1/4 left-10 text-yellow-100 text-xs animate-bounce">✦</div>

      {/* Castle Wall Silhouette at bottom */}
      <div className="absolute bottom-10 inset-x-0 h-44 opacity-20 pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 400 150" preserveAspectRatio="none" fill="#020617">
          <path d="M0 150 L0 90 L30 90 L30 50 L50 30 L70 50 L70 90 L110 90 L130 20 L150 20 L170 90 L210 90 L230 10 L250 10 L270 90 L310 90 L330 40 L350 40 L350 90 L400 90 L400 150 Z" />
        </svg>
      </div>

      {/* Top Header / Currencies */}
      <div className="relative z-10 flex items-center justify-between gap-2">
        {/* Profile Card */}
        <div className="flex items-center gap-2 p-1 pr-3 rounded-full bg-blue-950/80 border border-yellow-400/50 backdrop-blur-md shadow-lg">
          <KingAvatar mood="happy" size="sm" />
          <div className="flex flex-col">
            <span className="text-[11px] font-black text-white leading-tight">
              Royal Monarch
            </span>
            <span className="text-[10px] font-bold text-yellow-300">
              Level {playerState.currentLevel}
            </span>
          </div>
        </div>

        {/* Currency Pods */}
        <div className="flex items-center gap-1.5">
          {/* Lives */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-950/80 border border-red-500/80 shadow-md">
            <span className="text-xs">❤️</span>
            <div className="flex flex-col items-center">
              <span className="text-xs font-black text-white leading-none">
                {playerState.lives}/{playerState.maxLives}
              </span>
              {playerState.lives < playerState.maxLives && (
                <span className="text-[8px] font-bold text-rose-300 leading-none">
                  {lifeCountdown}
                </span>
              )}
            </div>
          </div>

          {/* Coins */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-950/80 border border-yellow-500/80 shadow-md">
            <span className="text-xs">🪙</span>
            <span className="text-xs font-black text-yellow-300">
              {playerState.coins}
            </span>
          </div>
        </div>
      </div>

      {/* Center Hero View / Logo */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto gap-2">
        <RoyalLogo size="md" animated={true} />

        {/* Hero Castle Emblem */}
        <div className="relative my-1">
          <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-yellow-500/30 via-blue-500/20 to-purple-500/30 border-2 border-yellow-400/60 p-2 shadow-2xl flex items-center justify-center backdrop-blur-sm">
            <KingAvatar mood="happy" size="lg" />
          </div>
          {/* Level Crown Badge */}
          <div className="absolute -bottom-2 inset-x-0 mx-auto w-max px-3 py-0.5 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 border border-white text-blue-950 text-xs font-black shadow-lg">
            Level {playerState.currentLevel}
          </div>
        </div>
      </div>

      {/* Main Buttons / Controls */}
      <div className="relative z-10 flex flex-col items-center gap-2.5 w-full max-w-sm mx-auto mb-1">
        
        {/* Rewarded Ad & APK Download Row */}
        <div className="flex items-center justify-between gap-2 w-full">
          <button
            onClick={handleWatchAdForCoins}
            className="flex-1 py-1.5 px-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 border border-emerald-300 text-white font-black text-[11px] shadow active:scale-95 transition-transform flex items-center justify-center gap-1"
          >
            <span>🎬</span>
            <span>Free Coins (+100)</span>
          </button>

          <button
            onClick={() => {
              sound.playTap();
              setShowApkModal(true);
            }}
            className="flex-1 py-1.5 px-2 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-800 border border-yellow-300 text-yellow-200 font-black text-[11px] shadow active:scale-95 transition-transform flex items-center justify-center gap-1"
          >
            <span>📥</span>
            <span>Download APK</span>
          </button>
        </div>

        {/* Giant Play Button */}
        <button
          onClick={handlePlay}
          className="group relative w-full py-3.5 rounded-3xl bg-gradient-to-b from-yellow-300 via-amber-400 to-amber-600 border-4 border-yellow-100 shadow-[0_10px_25px_rgba(245,158,11,0.7),inset_0_2px_4px_rgba(255,255,255,0.8)] active:scale-95 transition-transform flex items-center justify-center gap-3 overflow-hidden"
        >
          {/* Shimmer sweep */}
          <div className="absolute inset-0 w-1/3 bg-white/30 transform -skew-x-12 translate-x-[-150%] group-hover:translate-x-[400%] transition-transform duration-1000" />
          
          <span className="text-2xl drop-shadow">👑</span>
          <div className="flex flex-col text-left">
            <span
              className="text-2xl font-black text-blue-950 tracking-wider uppercase drop-shadow-[0_1px_1px_rgba(255,255,255,0.7)]"
              style={{ fontFamily: "'Fredoka', sans-serif" }}
            >
              PLAY LEVEL {playerState.currentLevel}
            </span>
            <span className="text-[10px] font-bold text-amber-950 uppercase tracking-widest">
              Tap to Start Puzzle
            </span>
          </div>
          <span className="text-2xl drop-shadow">▶</span>
        </button>

        {/* Bottom Utility Row */}
        <div className="grid grid-cols-4 gap-2 w-full">
          {/* Level Map Button */}
          <button
            onClick={() => {
              sound.playTap();
              onOpenMap();
            }}
            className="flex flex-col items-center justify-center py-2 rounded-2xl bg-blue-950/80 border-2 border-yellow-400/60 shadow-lg active:scale-95 transition-transform"
          >
            <span className="text-lg">🗺️</span>
            <span className="text-[10px] font-bold text-yellow-200 mt-0.5">Map</span>
          </button>

          {/* Daily Rewards Button */}
          <button
            onClick={() => {
              sound.playTap();
              onOpenDailyRewards();
            }}
            className="relative flex flex-col items-center justify-center py-2 rounded-2xl bg-blue-950/80 border-2 border-yellow-400/60 shadow-lg active:scale-95 transition-transform"
          >
            <span className="text-lg">🎁</span>
            <span className="text-[10px] font-bold text-yellow-200 mt-0.5">Daily</span>
            {hasDailyReward && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 border border-white animate-ping" />
            )}
          </button>

          {/* Sound Toggle Button */}
          <button
            onClick={toggleSound}
            className="flex flex-col items-center justify-center py-2 rounded-2xl bg-blue-950/80 border-2 border-yellow-400/60 shadow-lg active:scale-95 transition-transform"
          >
            <span className="text-lg">{playerState.settings.sound ? '🔊' : '🔇'}</span>
            <span className="text-[10px] font-bold text-yellow-200 mt-0.5">Sound</span>
          </button>

          {/* Settings Button */}
          <button
            onClick={() => {
              sound.playTap();
              onOpenSettings();
            }}
            className="flex flex-col items-center justify-center py-2 rounded-2xl bg-blue-950/80 border-2 border-yellow-400/60 shadow-lg active:scale-95 transition-transform"
          >
            <span className="text-lg">⚙️</span>
            <span className="text-[10px] font-bold text-yellow-200 mt-0.5">Settings</span>
          </button>
        </div>
      </div>

      {/* AdMob Banner at bottom */}
      <AdMobBanner />

      {/* APK Download Modal */}
      {showApkModal && (
        <ApkDownloadModal onClose={() => setShowApkModal(false)} />
      )}
    </div>
  );
};

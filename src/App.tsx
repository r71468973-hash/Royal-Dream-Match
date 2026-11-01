/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { PlayerState, ScreenType } from './types/game';
import { loadPlayerState, savePlayerState } from './game/storage';
import { getLevelConfig } from './game/levels';
import { sound } from './game/sound';
import { admobService, AdReward } from './services/admobService';
import { SplashScreen } from './components/SplashScreen';
import { HomeScreen } from './components/HomeScreen';
import { LevelMapScreen } from './components/LevelMapScreen';
import { GameplayScreen } from './components/GameplayScreen';
import { DailyRewardsModal } from './components/DailyRewardsModal';
import { SettingsModal } from './components/SettingsModal';
import { AdMobInterstitialModal } from './components/AdMobInterstitialModal';
import { AdMobRewardedModal } from './components/AdMobRewardedModal';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('splash');
  const [playerState, setPlayerState] = useState<PlayerState>(() => loadPlayerState());
  const [activePlayingLevel, setActivePlayingLevel] = useState<number>(1);
  const [showDailyRewardsModal, setShowDailyRewardsModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);

  // Global AdMob Modals State
  const [interstitialState, setInterstitialState] = useState<{ active: boolean; countdown: number }>({
    active: false,
    countdown: 5,
  });
  const [rewardedState, setRewardedState] = useState<{ active: boolean; reward: AdReward | null; countdown: number }>({
    active: false,
    reward: null,
    countdown: 5,
  });

  // Sync sound settings with SoundManager
  useEffect(() => {
    sound.setSoundEnabled(playerState.settings.sound);
    sound.setMusicEnabled(playerState.settings.music);
  }, [playerState.settings.sound, playerState.settings.music]);

  // Register AdMob Listeners
  useEffect(() => {
    admobService.registerInterstitialListener((active, countdown) => {
      setInterstitialState({ active, countdown });
    });

    admobService.registerRewardedListener((active, reward, countdown) => {
      setRewardedState({ active, reward, countdown });
    });
  }, []);

  // Save state changes to LocalStorage
  const handleUpdatePlayerState = (newState: PlayerState) => {
    setPlayerState(newState);
    savePlayerState(newState);
  };

  // Launch a level
  const handleStartLevel = (levelNumber: number) => {
    setActivePlayingLevel(levelNumber);
    setCurrentScreen('gameplay');
  };

  // Level Win Handler
  const handleLevelComplete = (
    levelNumber: number,
    stars: number,
    score: number,
    coinsEarned: number
  ) => {
    const existingProgress = playerState.completedLevels[levelNumber];
    const prevStars = existingProgress?.stars || 0;
    const prevHighScore = existingProgress?.highScore || 0;

    const nextLevelToUnlock = Math.min(100, Math.max(playerState.highestUnlockedLevel, levelNumber + 1));
    const nextCurrentLevel = Math.min(100, levelNumber + 1);

    const updatedState: PlayerState = {
      ...playerState,
      coins: playerState.coins + coinsEarned,
      currentLevel: nextCurrentLevel,
      highestUnlockedLevel: nextLevelToUnlock,
      completedLevels: {
        ...playerState.completedLevels,
        [levelNumber]: {
          completed: true,
          stars: Math.max(prevStars, stars),
          highScore: Math.max(prevHighScore, score),
        },
      },
    };

    handleUpdatePlayerState(updatedState);
    setActivePlayingLevel(nextCurrentLevel);

    // Show Interstitial ad if cooldown period has elapsed (policy compliant)
    admobService.showInterstitial();
  };

  // Level Fail Handler (deducts 1 life)
  const handleLevelFailed = (levelNumber: number) => {
    const nextLives = Math.max(0, playerState.lives - 1);
    const updatedState: PlayerState = {
      ...playerState,
      lives: nextLives,
      lastLifeLostTimestamp: playerState.lastLifeLostTimestamp || Date.now(),
    };
    handleUpdatePlayerState(updatedState);

    // If still have lives, restart level, else back to home
    if (nextLives > 0) {
      setActivePlayingLevel(levelNumber);
    } else {
      setCurrentScreen('home');
    }
  };

  return (
    <div className="w-full h-screen bg-[#070e20] flex items-center justify-center overflow-hidden font-sans">
      {/* Mobile-first Responsive Container */}
      <div className="relative w-full h-full max-w-md max-h-[920px] sm:rounded-3xl sm:border-4 sm:border-yellow-400/60 sm:shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col bg-[#0b1c44]">
        
        {/* Screen 1: Splash Screen */}
        {currentScreen === 'splash' && (
          <SplashScreen onFinish={() => setCurrentScreen('home')} />
        )}

        {/* Screen 2: Home Screen */}
        {currentScreen === 'home' && (
          <HomeScreen
            playerState={playerState}
            onPlayLevel={handleStartLevel}
            onOpenMap={() => setCurrentScreen('map')}
            onOpenDailyRewards={() => setShowDailyRewardsModal(true)}
            onOpenSettings={() => setShowSettingsModal(true)}
            onUpdateState={handleUpdatePlayerState}
          />
        )}

        {/* Screen 3: Level Map Screen */}
        {currentScreen === 'map' && (
          <LevelMapScreen
            playerState={playerState}
            onSelectLevel={handleStartLevel}
            onBackHome={() => setCurrentScreen('home')}
          />
        )}

        {/* Screen 4: Main Match-3 Gameplay Screen */}
        {currentScreen === 'gameplay' && (
          <GameplayScreen
            levelConfig={getLevelConfig(activePlayingLevel)}
            playerState={playerState}
            onLevelComplete={handleLevelComplete}
            onLevelFailed={handleLevelFailed}
            onQuitToHome={() => setCurrentScreen('home')}
            onUpdatePlayerState={handleUpdatePlayerState}
          />
        )}

        {/* Global Modals */}
        {showDailyRewardsModal && (
          <DailyRewardsModal
            playerState={playerState}
            onUpdateState={handleUpdatePlayerState}
            onClose={() => setShowDailyRewardsModal(false)}
          />
        )}

        {showSettingsModal && (
          <SettingsModal
            playerState={playerState}
            onUpdateState={handleUpdatePlayerState}
            onClose={() => setShowSettingsModal(false)}
            isInGame={false}
          />
        )}

        {/* AdMob Interstitial Modal */}
        {interstitialState.active && (
          <AdMobInterstitialModal
            countdown={interstitialState.countdown}
            onClose={() => admobService.closeInterstitial()}
          />
        )}

        {/* AdMob Rewarded Video Modal */}
        {rewardedState.active && rewardedState.reward && (
          <AdMobRewardedModal
            reward={rewardedState.reward}
            countdown={rewardedState.countdown}
            onClose={() => admobService.cancelRewardedAd()}
          />
        )}
      </div>
    </div>
  );
}

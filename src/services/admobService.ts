/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AdMobConfig, loadAdMobConfig, saveAdMobConfig } from '../config/admob';
import { sound } from '../game/sound';

export type AdType = 'banner' | 'interstitial' | 'rewarded';

export interface AdReward {
  type: 'extra_moves' | 'coins' | 'life';
  amount: number;
}

class AdMobManager {
  private config: AdMobConfig = loadAdMobConfig();
  private lastInterstitialTime: number = 0;
  private isBannerVisible: boolean = false;
  private bannerListener: ((visible: boolean) => void) | null = null;
  private interstitialListener: ((active: boolean, countdown: number) => void) | null = null;
  private rewardedListener: ((active: boolean, reward: AdReward | null, countdown: number) => void) | null = null;

  constructor() {
    this.init();
  }

  public init() {
    this.config = loadAdMobConfig();
    console.log('[AdMob] Initialized with Mode:', this.config.testMode ? 'TEST' : 'LIVE');
  }

  public getConfig(): AdMobConfig {
    return this.config;
  }

  public updateConfig(newConfig: AdMobConfig) {
    this.config = newConfig;
    saveAdMobConfig(newConfig);
    console.log('[AdMob] Configuration updated');
  }

  public registerBannerListener(callback: (visible: boolean) => void) {
    this.bannerListener = callback;
    callback(this.isBannerVisible);
  }

  public registerInterstitialListener(callback: (active: boolean, countdown: number) => void) {
    this.interstitialListener = callback;
  }

  public registerRewardedListener(callback: (active: boolean, reward: AdReward | null, countdown: number) => void) {
    this.rewardedListener = callback;
  }

  // --- Banner Ads ---
  public showBanner() {
    this.isBannerVisible = true;
    if (this.bannerListener) {
      this.bannerListener(true);
    }
  }

  public hideBanner() {
    this.isBannerVisible = false;
    if (this.bannerListener) {
      this.bannerListener(false);
    }
  }

  // --- Interstitial Ads ---
  public canShowInterstitial(): boolean {
    const now = Date.now();
    const elapsedSeconds = (now - this.lastInterstitialTime) / 1000;
    return elapsedSeconds >= this.config.options.interstitialCooldownSeconds;
  }

  public showInterstitial(onClosed?: () => void): boolean {
    if (!this.canShowInterstitial()) {
      console.log('[AdMob] Interstitial cooldown active, skipping ad');
      if (onClosed) onClosed();
      return false;
    }

    this.lastInterstitialTime = Date.now();

    let countdown = 5;
    if (this.interstitialListener) {
      this.interstitialListener(true, countdown);
    }

    const interval = setInterval(() => {
      countdown -= 1;
      if (this.interstitialListener) {
        this.interstitialListener(true, countdown);
      }
      if (countdown <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return true;
  }

  public closeInterstitial(onClosed?: () => void) {
    if (this.interstitialListener) {
      this.interstitialListener(false, 0);
    }
    if (onClosed) {
      onClosed();
    }
  }

  // --- Rewarded Ads ---
  public showRewardedAd(reward: AdReward, onRewardGranted: (reward: AdReward) => void, onCancelled?: () => void) {
    let countdown = 5;
    if (this.rewardedListener) {
      this.rewardedListener(true, reward, countdown);
    }

    const timer = setInterval(() => {
      countdown -= 1;
      if (this.rewardedListener) {
        this.rewardedListener(true, reward, countdown);
      }

      if (countdown <= 0) {
        clearInterval(timer);
        setTimeout(() => {
          if (this.rewardedListener) {
            this.rewardedListener(false, null, 0);
          }
          sound.playVictory();
          onRewardGranted(reward);
        }, 500);
      }
    }, 1000);
  }

  public cancelRewardedAd(onCancelled?: () => void) {
    if (this.rewardedListener) {
      this.rewardedListener(false, null, 0);
    }
    if (onCancelled) {
      onCancelled();
    }
  }
}

export const admobService = new AdMobManager();

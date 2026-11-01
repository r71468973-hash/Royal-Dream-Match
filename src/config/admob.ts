/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Google AdMob Configuration & Official Test Ad Unit IDs
// Policy-compliant AdMob integration for Royal Dream Match

export interface AdMobConfig {
  testMode: boolean;
  appId: {
    android: string;
    ios: string;
  };
  banner: {
    android: string;
    ios: string;
  };
  interstitial: {
    android: string;
    ios: string;
  };
  rewarded: {
    android: string;
    ios: string;
  };
  options: {
    bannerPosition: 'bottom' | 'top';
    interstitialCooldownSeconds: number; // Minimum cooldown between interstitial ads to comply with AdMob policy
    showBannerOnHome: boolean;
    showBannerOnMap: boolean;
    showBannerOnGame: boolean;
  };
}

const envAppId = (import.meta.env.VITE_ADMOB_APP_ID as string) || '';
const envBannerId = (import.meta.env.VITE_ADMOB_BANNER_ID as string) || '';
const envInterstitialId = (import.meta.env.VITE_ADMOB_INTERSTITIAL_ID as string) || '';
const envRewardedId = (import.meta.env.VITE_ADMOB_REWARDED_ID as string) || '';
const envTestMode = import.meta.env.VITE_ADMOB_TEST_MODE === 'false' ? false : (envBannerId ? false : true);

// Official Google AdMob Test Ad Unit IDs (Google Sample IDs)
export const DEFAULT_ADMOB_CONFIG: AdMobConfig = {
  testMode: envTestMode,
  appId: {
    android: envAppId || 'ca-app-pub-3940256099942544~3347511713',
    ios: 'ca-app-pub-3940256099942544~1458002511',
  },
  banner: {
    android: envBannerId || 'ca-app-pub-3940256099942544/6300978111',
    ios: 'ca-app-pub-3940256099942544/2934735716',
  },
  interstitial: {
    android: envInterstitialId || 'ca-app-pub-3940256099942544/1033173712',
    ios: 'ca-app-pub-3940256099942544/4411468910',
  },
  rewarded: {
    android: envRewardedId || 'ca-app-pub-3940256099942544/5224354917',
    ios: 'ca-app-pub-3940256099942544/1712485313',
  },
  options: {
    bannerPosition: 'bottom',
    interstitialCooldownSeconds: 60, // 60s cooldown to comply with AdMob policy
    showBannerOnHome: true,
    showBannerOnMap: true,
    showBannerOnGame: false, // Keep puzzle board unobstructed for optimum UX & avoid invalid clicks
  },
};

const ADMOB_STORAGE_KEY = 'royal_dream_match_admob_config';

export function loadAdMobConfig(): AdMobConfig {
  try {
    const raw = localStorage.getItem(ADMOB_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_ADMOB_CONFIG,
        ...parsed,
        appId: { ...DEFAULT_ADMOB_CONFIG.appId, ...parsed.appId },
        banner: { ...DEFAULT_ADMOB_CONFIG.banner, ...parsed.banner },
        interstitial: { ...DEFAULT_ADMOB_CONFIG.interstitial, ...parsed.interstitial },
        rewarded: { ...DEFAULT_ADMOB_CONFIG.rewarded, ...parsed.rewarded },
        options: { ...DEFAULT_ADMOB_CONFIG.options, ...parsed.options },
      };
    }
  } catch (e) {
    console.warn('Failed to load AdMob config from storage', e);
  }
  return DEFAULT_ADMOB_CONFIG;
}

export function saveAdMobConfig(config: AdMobConfig): void {
  try {
    localStorage.setItem(ADMOB_STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save AdMob config to storage', e);
  }
}

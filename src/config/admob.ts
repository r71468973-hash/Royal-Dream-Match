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

// Official Google AdMob Test Ad Unit IDs (Google Sample IDs)
export const DEFAULT_ADMOB_CONFIG: AdMobConfig = {
  testMode: true,
  appId: {
    android: 'ca-app-pub-3940256099942544~3347511713',
    ios: 'ca-app-pub-3940256099942544~1458002511',
  },
  banner: {
    android: 'ca-app-pub-3940256099942544/6300978111',
    ios: 'ca-app-pub-3940256099942544/2934735716',
  },
  interstitial: {
    android: 'ca-app-pub-3940256099942544/1033173712',
    ios: 'ca-app-pub-3940256099942544/4411468910',
  },
  rewarded: {
    android: 'ca-app-pub-3940256099942544/5224354917',
    ios: 'ca-app-pub-3940256099942544/1712485313',
  },
  options: {
    bannerPosition: 'bottom',
    interstitialCooldownSeconds: 60, // 60s cooldown to prevent policy violations
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

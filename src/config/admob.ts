/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface AdMobConfig {
  appId: string;
  bannerUnitId: string;
  testBannerUnitId: string;
  rewardedUnitId: string;
  testRewardedUnitId: string;
  isTestMode: boolean;
}

// User's Real Production AdMob Credentials
export const PRODUCTION_ADMOB_APP_ID = 'ca-app-pub-4935356006715377~4516913124';
export const PRODUCTION_BANNER_UNIT_ID = 'ca-app-pub-4935356006715377/9653779021';

// Production Rewarded Ad Unit ID (configurable via env or defaults to account-scoped id)
export const PRODUCTION_REWARDED_UNIT_ID = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ADMOB_REWARDED_ID) || 
  'ca-app-pub-4935356006715377/5224354917';

// Official Google AdMob Sample Test Ad Unit IDs
export const GOOGLE_TEST_BANNER_UNIT_ID = 'ca-app-pub-3940256099942544/6300978111';
export const GOOGLE_TEST_REWARDED_UNIT_ID = 'ca-app-pub-3940256099942544/5224354917';

// Detect whether running in production release build vs development
const isProductionBuild = typeof window !== 'undefined' && (
  import.meta.env.PROD || 
  import.meta.env.MODE === 'production' ||
  localStorage.getItem('rdm_force_live_admob') === 'true'
);

export const ADMOB_CONFIG: AdMobConfig = {
  appId: PRODUCTION_ADMOB_APP_ID,
  bannerUnitId: PRODUCTION_BANNER_UNIT_ID,
  testBannerUnitId: GOOGLE_TEST_BANNER_UNIT_ID,
  rewardedUnitId: PRODUCTION_REWARDED_UNIT_ID,
  testRewardedUnitId: GOOGLE_TEST_REWARDED_UNIT_ID,
  isTestMode: !isProductionBuild,
};

export function getActiveBannerUnitId(forceTestMode?: boolean): string {
  if (forceTestMode !== undefined) {
    return forceTestMode ? GOOGLE_TEST_BANNER_UNIT_ID : PRODUCTION_BANNER_UNIT_ID;
  }
  return ADMOB_CONFIG.isTestMode ? GOOGLE_TEST_BANNER_UNIT_ID : PRODUCTION_BANNER_UNIT_ID;
}

export function getActiveRewardedUnitId(forceTestMode?: boolean): string {
  if (forceTestMode !== undefined) {
    return forceTestMode ? GOOGLE_TEST_REWARDED_UNIT_ID : PRODUCTION_REWARDED_UNIT_ID;
  }
  return ADMOB_CONFIG.isTestMode ? GOOGLE_TEST_REWARDED_UNIT_ID : PRODUCTION_REWARDED_UNIT_ID;
}

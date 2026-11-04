/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { registerPlugin, Capacitor } from '@capacitor/core';
import { getActiveBannerUnitId, getActiveInterstitialUnitId, getActiveRewardedUnitId } from '../config/admob';

interface AdMobNativePlugin {
  showBanner(options?: { adUnitId?: string }): Promise<{ status: string }>;
  hideBanner(): Promise<void>;
  showInterstitial(options?: { adUnitId?: string }): Promise<{ success: boolean; error?: string }>;
  showRewarded(options?: { adUnitId?: string }): Promise<{ rewarded: boolean; amount?: number; type?: string; error?: string }>;
}

const AdMobNative = registerPlugin<AdMobNativePlugin>('AdMobNative');

/**
 * Show a real Rewarded Video Ad via the official Google Mobile Ads SDK.
 * Only rewards if Google confirms completion.
 * If unavailable, returns { rewarded: false, error: 'Ad not available. Please try again.' }.
 */
export async function showRealNativeRewarded(unitId?: string): Promise<{ rewarded: boolean; error?: string }> {
  if (Capacitor.isNativePlatform()) {
    try {
      const activeId = unitId || getActiveRewardedUnitId();
      const res = await AdMobNative.showRewarded({ adUnitId: activeId });
      if (!res.rewarded) {
        return { rewarded: false, error: res.error || 'Ad not available. Please try again.' };
      }
      return { rewarded: true };
    } catch (e: any) {
      return { rewarded: false, error: e?.message || 'Ad not available. Please try again.' };
    }
  }

  // In non-native environments (such as web dev preview), real native AdMob cannot run.
  // Display standard message as required.
  return { rewarded: false, error: 'Ad not available. Please try again.' };
}

/**
 * Show a real Interstitial Ad via the official Google Mobile Ads SDK at natural breaks.
 */
export async function showRealNativeInterstitial(unitId?: string): Promise<{ success: boolean; error?: string }> {
  if (Capacitor.isNativePlatform()) {
    try {
      const activeId = unitId || getActiveInterstitialUnitId();
      const res = await AdMobNative.showInterstitial({ adUnitId: activeId });
      return res;
    } catch (e: any) {
      return { success: false, error: e?.message || 'Ad not available. Please try again.' };
    }
  }

  return { success: false, error: 'Ad not available. Please try again.' };
}

/**
 * Display real AdMob banner ad via native Google Mobile Ads SDK
 */
export async function showRealNativeBanner(unitId?: string) {
  if (Capacitor.isNativePlatform()) {
    try {
      const activeId = unitId || getActiveBannerUnitId();
      await AdMobNative.showBanner({ adUnitId: activeId });
    } catch (e) {
      console.warn('[AdMob Native Banner] Error showing banner:', e);
    }
  }
}

/**
 * Hide real AdMob banner ad via native Google Mobile Ads SDK
 */
export async function hideRealNativeBanner() {
  if (Capacitor.isNativePlatform()) {
    try {
      await AdMobNative.hideBanner();
    } catch (e) {
      console.warn('[AdMob Native Banner] Error hiding banner:', e);
    }
  }
}

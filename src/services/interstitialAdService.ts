/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { showRealNativeInterstitial } from './nativeAdMob';

export interface InterstitialAdState {
  isLoading: boolean;
  lastShownTimestamp: number;
}

type InterstitialListener = (state: InterstitialAdState) => void;

class InterstitialAdService {
  private state: InterstitialAdState = {
    isLoading: false,
    lastShownTimestamp: 0,
  };

  private listeners: Set<InterstitialListener> = new Set();
  private readonly MIN_INTERVAL_MS = 20000; // Natural break throttle (20s)

  public subscribe(listener: InterstitialListener): () => void {
    this.listeners.add(listener);
    listener({ ...this.state });
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    for (const listener of this.listeners) {
      listener({ ...this.state });
    }
  }

  public getState(): InterstitialAdState {
    return { ...this.state };
  }

  /**
   * Show a real Interstitial Ad via Google Mobile Ads SDK at natural breaks.
   * Never shown during active gameplay.
   * If unavailable, safely executes onClosed immediately.
   */
  public async showInterstitial(onClosed?: () => void) {
    const now = Date.now();

    // Respect throttle
    if (this.state.lastShownTimestamp > 0 && now - this.state.lastShownTimestamp < this.MIN_INTERVAL_MS) {
      if (onClosed) onClosed();
      return;
    }

    if (this.state.isLoading) {
      if (onClosed) onClosed();
      return;
    }

    this.state.isLoading = true;
    this.notify();

    try {
      this.state.lastShownTimestamp = now;
      await showRealNativeInterstitial();
    } catch (e) {
      console.warn('[AdMob Interstitial] Failed to show interstitial:', e);
    } finally {
      this.state.isLoading = false;
      this.notify();
      if (onClosed) {
        onClosed();
      }
    }
  }
}

export const interstitialAdService = new InterstitialAdService();

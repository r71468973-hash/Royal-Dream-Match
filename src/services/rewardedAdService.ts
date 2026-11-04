/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { showRealNativeRewarded } from './nativeAdMob';
import { sound } from '../game/sound';

export type RewardType = 'coins' | 'lives' | 'moves';

export interface AdReward {
  type: RewardType;
  amount: number;
  title: string;
  description: string;
}

export interface RewardedAdState {
  isLoading: boolean;
  lastError: string | null;
  lastSuccess: string | null;
}

type RewardedListener = (state: RewardedAdState) => void;

class RewardedAdService {
  private state: RewardedAdState = {
    isLoading: false,
    lastError: null,
    lastSuccess: null,
  };

  private listeners: Set<RewardedListener> = new Set();

  public subscribe(listener: RewardedListener): () => void {
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

  public getState(): RewardedAdState {
    return { ...this.state };
  }

  /**
   * Request and show a real Rewarded Video Ad via Google Mobile Ads SDK.
   * - Only awards user when Google confirms completion.
   * - Never uses fake video simulations.
   * - If unavailable, reports "Ad not available. Please try again."
   */
  public async showRewardedAd(
    reward: AdReward,
    onRewardGranted: () => void,
    onError?: (msg: string) => void
  ) {
    if (this.state.isLoading) return;

    this.state = {
      isLoading: true,
      lastError: null,
      lastSuccess: null,
    };
    this.notify();

    try {
      const res = await showRealNativeRewarded();

      if (res.rewarded) {
        this.state = {
          isLoading: false,
          lastError: null,
          lastSuccess: `+${reward.amount} ${reward.type} received!`,
        };
        this.notify();

        try {
          sound.playVictory();
        } catch {
          // Sound fallback
        }

        onRewardGranted();
      } else {
        const errorMsg = res.error || 'Ad not available. Please try again.';
        this.state = {
          isLoading: false,
          lastError: errorMsg,
          lastSuccess: null,
        };
        this.notify();

        if (onError) {
          onError(errorMsg);
        }
      }
    } catch (err: any) {
      const errorMsg = 'Ad not available. Please try again.';
      this.state = {
        isLoading: false,
        lastError: errorMsg,
        lastSuccess: null,
      };
      this.notify();

      if (onError) {
        onError(errorMsg);
      }
    }
  }
}

export const rewardedAdService = new RewardedAdService();

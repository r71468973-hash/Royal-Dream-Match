/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { getActiveRewardedUnitId, ADMOB_CONFIG } from '../config/admob';
import { sound } from '../game/sound';

export type RewardType = 'coins' | 'lives' | 'moves';

export interface AdReward {
  type: RewardType;
  amount: number;
  title: string;
  description: string;
}

export interface RewardedAdState {
  active: boolean;
  reward: AdReward | null;
  countdown: number;
  status: 'idle' | 'loading' | 'playing' | 'completed' | 'cancelled';
  unitId: string;
}

type RewardedListener = (state: RewardedAdState) => void;

class RewardedAdService {
  private state: RewardedAdState = {
    active: false,
    reward: null,
    countdown: 5,
    status: 'idle',
    unitId: getActiveRewardedUnitId(),
  };

  private listeners: Set<RewardedListener> = new Set();
  private timer: ReturnType<typeof setInterval> | null = null;
  private pendingOnReward: (() => void) | null = null;
  private pendingOnCancel: (() => void) | null = null;

  public subscribe(listener: RewardedListener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.state.unitId = getActiveRewardedUnitId();
    for (const listener of this.listeners) {
      listener({ ...this.state });
    }
  }

  public getState(): RewardedAdState {
    return { ...this.state };
  }

  /**
   * Request and show a Rewarded Video Ad
   * @param reward The reward configuration (coins, lives, or extra moves)
   * @param onRewardGranted Callback executed when the user watches the entire video
   * @param onCancelled Callback executed if user exits early before completion
   */
  public showRewardedAd(
    reward: AdReward,
    onRewardGranted: () => void,
    onCancelled?: () => void
  ) {
    if (this.state.active) {
      console.warn('[AdMob Rewarded] Ad already in progress');
      return;
    }

    this.pendingOnReward = onRewardGranted;
    this.pendingOnCancel = onCancelled || null;

    // Set state to loading/playing with 5-second watch duration
    const DURATION = 5;
    this.state = {
      active: true,
      reward,
      countdown: DURATION,
      status: 'playing',
      unitId: getActiveRewardedUnitId(),
    };
    this.notify();

    // Start countdown timer
    if (this.timer) {
      clearInterval(this.timer);
    }

    this.timer = setInterval(() => {
      if (this.state.countdown > 1) {
        this.state.countdown -= 1;
        this.notify();
      } else {
        // Countdown reached 0 -> Video completed!
        this.completeRewardedAd();
      }
    }, 1000);
  }

  /**
   * Called when the rewarded video finishes playing
   */
  public completeRewardedAd() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    this.state.status = 'completed';
    this.state.countdown = 0;
    this.notify();

    // Play victory sound
    try {
      sound.playVictory();
    } catch {
      // Sound fallback safe
    }

    // Execute reward callback
    if (this.pendingOnReward) {
      const rewardCb = this.pendingOnReward;
      this.pendingOnReward = null;
      rewardCb();
    }

    // Auto close modal after brief 600ms fanfare celebration
    setTimeout(() => {
      this.closeModal();
    }, 700);
  }

  /**
   * User cancelled/closed the rewarded ad early before countdown expired
   */
  public cancelRewardedAd() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    this.state.status = 'cancelled';
    this.notify();

    if (this.pendingOnCancel) {
      const cancelCb = this.pendingOnCancel;
      this.pendingOnCancel = null;
      cancelCb();
    }
    this.pendingOnReward = null;

    this.closeModal();
  }

  private closeModal() {
    this.state = {
      active: false,
      reward: null,
      countdown: 5,
      status: 'idle',
      unitId: getActiveRewardedUnitId(),
    };
    this.notify();
  }
}

export const rewardedAdService = new RewardedAdService();

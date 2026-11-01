/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PlayerState } from '../types/game';

const STORAGE_KEY = 'royal_dream_match_save_v1';
const LIFE_RECHARGE_TIME_MS = 15 * 60 * 1000; // 15 minutes per life

export const DEFAULT_PLAYER_STATE: PlayerState = {
  currentLevel: 1,
  highestUnlockedLevel: 1,
  completedLevels: {},
  coins: 500,
  lives: 5,
  maxLives: 5,
  lastLifeLostTimestamp: null,
  inventory: {
    hammer: 3,
    rocket: 2,
    tnt: 2,
    rainbow: 1,
  },
  dailyReward: {
    lastClaimDate: '',
    streak: 0,
  },
  settings: {
    sound: true,
    music: true,
    vibration: true,
  },
};

export function loadPlayerState(): PlayerState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PLAYER_STATE;

    const parsed: PlayerState = JSON.parse(raw);
    
    // Calculate regenerated lives if less than maxLives
    if (parsed.lives < parsed.maxLives && parsed.lastLifeLostTimestamp) {
      const now = Date.now();
      const elapsed = now - parsed.lastLifeLostTimestamp;
      const livesGained = Math.floor(elapsed / LIFE_RECHARGE_TIME_MS);

      if (livesGained > 0) {
        parsed.lives = Math.min(parsed.maxLives, parsed.lives + livesGained);
        if (parsed.lives >= parsed.maxLives) {
          parsed.lastLifeLostTimestamp = null;
        } else {
          // Advance the timestamp by the intervals consumed
          parsed.lastLifeLostTimestamp += livesGained * LIFE_RECHARGE_TIME_MS;
        }
      }
    }

    return {
      ...DEFAULT_PLAYER_STATE,
      ...parsed,
      settings: { ...DEFAULT_PLAYER_STATE.settings, ...parsed.settings },
      inventory: { ...DEFAULT_PLAYER_STATE.inventory, ...parsed.inventory },
    };
  } catch (err) {
    console.warn('Failed to load player state from localStorage', err);
    return DEFAULT_PLAYER_STATE;
  }
}

export function savePlayerState(state: PlayerState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save player state to localStorage', err);
  }
}

export function resetPlayerProgress(): PlayerState {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
  return { ...DEFAULT_PLAYER_STATE };
}

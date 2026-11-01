/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type PieceType = 'ruby' | 'shield' | 'leaf' | 'crown' | 'gem';

export type BoosterType = 'rocket_h' | 'rocket_v' | 'tnt' | 'rainbow' | null;

export type ObstacleType = 
  | 'wood_1' 
  | 'wood_2' 
  | 'crown_box_1' 
  | 'crown_box_2' 
  | 'stone_1' 
  | 'stone_2' 
  | null;

export interface Tile {
  id: string;
  row: number;
  col: number;
  piece: PieceType | null;
  booster: BoosterType;
  obstacle: ObstacleType;
  isMatched?: boolean;
  isNew?: boolean;
  isHint?: boolean;
}

export type TargetType = PieceType | 'wood' | 'crown_box' | 'stone';

export interface LevelTarget {
  type: TargetType;
  count: number;
  current: number;
}

export interface LevelConfig {
  levelNumber: number;
  moves: number;
  targets: Array<{ type: TargetType; count: number }>;
  scoreTargets: [number, number, number]; // [1 star, 2 stars, 3 stars]
  initialObstacles?: Array<{ row: number; col: number; type: ObstacleType }>;
  description: string;
}

export interface PlayerInventory {
  hammer: number;
  rocket: number;
  tnt: number;
  rainbow: number;
}

export interface LevelProgress {
  stars: number;
  highScore: number;
  completed: boolean;
}

export interface DailyRewardState {
  lastClaimDate: string; // YYYY-MM-DD
  streak: number; // 0 to 6
}

export interface PlayerSettings {
  sound: boolean;
  music: boolean;
  vibration: boolean;
}

export interface PlayerState {
  currentLevel: number;
  highestUnlockedLevel: number;
  completedLevels: Record<number, LevelProgress>;
  coins: number;
  lives: number;
  maxLives: number;
  lastLifeLostTimestamp: number | null;
  inventory: PlayerInventory;
  dailyReward: DailyRewardState;
  settings: PlayerSettings;
}

export type ScreenType = 
  | 'splash' 
  | 'home' 
  | 'map' 
  | 'gameplay' 
  | 'daily_rewards' 
  | 'settings';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LevelConfig, ObstacleType, TargetType } from '../types/game';

// Generates 100 playable levels with increasing depth and variety
export function generateLevels(): Record<number, LevelConfig> {
  const levels: Record<number, LevelConfig> = {};

  for (let lvl = 1; lvl <= 100; lvl++) {
    const moves = Math.max(18, 30 - Math.floor(lvl / 10) + (lvl % 5 === 0 ? 3 : 0));
    const targets: Array<{ type: TargetType; count: number }> = [];
    const obstacles: Array<{ row: number; col: number; type: ObstacleType }> = [];

    // Progressive milestone themes
    if (lvl === 1) {
      targets.push({ type: 'ruby', count: 15 });
      levels[lvl] = {
        levelNumber: 1,
        moves: 25,
        targets,
        scoreTargets: [1500, 3000, 5000],
        description: 'Collect 15 Red Rubies to please King Leo!',
      };
      continue;
    }

    if (lvl === 2) {
      targets.push({ type: 'shield', count: 20 });
      levels[lvl] = {
        levelNumber: 2,
        moves: 25,
        targets,
        scoreTargets: [2000, 4000, 6000],
        description: 'Gather 20 Blue Shields for the Royal Guard!',
      };
      continue;
    }

    if (lvl === 3) {
      // 10 wooden blocks in center
      const coords = [
        [3, 3], [3, 4], [3, 5],
        [4, 3], [4, 4], [4, 5],
        [5, 3], [5, 4], [5, 5],
        [4, 2]
      ];
      coords.forEach(([r, c]) => obstacles.push({ row: r, col: c, type: 'wood_1' }));
      targets.push({ type: 'wood', count: 10 });
      levels[lvl] = {
        levelNumber: 3,
        moves: 24,
        targets,
        scoreTargets: [2200, 4200, 6500],
        initialObstacles: obstacles,
        description: 'Clear 10 Wooden Blocks blocking the castle garden!',
      };
      continue;
    }

    if (lvl === 4) {
      targets.push({ type: 'leaf', count: 18 });
      targets.push({ type: 'crown', count: 12 });
      levels[lvl] = {
        levelNumber: 4,
        moves: 24,
        targets,
        scoreTargets: [2500, 4500, 7000],
        description: 'Collect 18 Green Leaves & 12 Yellow Crowns!',
      };
      continue;
    }

    if (lvl === 5) {
      // Royal Crown boxes introduced
      const coords = [
        [2, 2], [2, 6],
        [6, 2], [6, 6],
        [4, 4]
      ];
      coords.forEach(([r, c]) => obstacles.push({ row: r, col: c, type: 'crown_box_2' }));
      targets.push({ type: 'crown_box', count: 5 });
      targets.push({ type: 'gem', count: 16 });
      levels[lvl] = {
        levelNumber: 5,
        moves: 26,
        targets,
        scoreTargets: [3000, 5500, 8000],
        initialObstacles: obstacles,
        description: 'Break open 5 Royal Crown Boxes & gather 16 Amethyst Gems!',
      };
      continue;
    }

    // Systematic generation for levels 6 to 100
    const themeIndex = lvl % 6;

    if (lvl <= 20) {
      // Early kingdom levels: mostly wood crates + gem collection
      const woodCount = 6 + Math.floor((lvl - 5) * 0.8);
      
      // Place obstacles symmetrically
      for (let r = 2; r <= 6; r++) {
        for (let c = 2; c <= 6; c++) {
          if (obstacles.length < woodCount) {
            if ((r + c + lvl) % 2 === 0 || (r === 4 || c === 4)) {
              obstacles.push({
                row: r,
                col: c,
                type: lvl > 12 && (r + c) % 3 === 0 ? 'wood_2' : 'wood_1',
              });
            }
          }
        }
      }

      targets.push({ type: 'wood', count: obstacles.length });
      const gemPool: TargetType[] = ['ruby', 'shield', 'leaf', 'crown', 'gem'];
      targets.push({ type: gemPool[lvl % gemPool.length], count: 15 + (lvl % 5) * 3 });

    } else if (lvl <= 50) {
      // Mid kingdom: Wood + Crown Boxes + Stone
      const boxCount = 4 + Math.floor((lvl - 20) * 0.3);
      const woodCount = 6 + Math.floor((lvl - 20) * 0.4);
      const stoneCount = lvl > 30 ? 4 + Math.floor((lvl - 30) * 0.3) : 0;

      // Obstacle placements: perimeter walls or checkerboard
      for (let r = 1; r <= 7; r++) {
        for (let c = 1; c <= 7; c++) {
          if (obstacles.length < boxCount + woodCount + stoneCount) {
            if (r === 4 || c === 4 || (r + c) % 2 === 0) {
              if (obstacles.length < boxCount) {
                obstacles.push({ row: r, col: c, type: 'crown_box_2' });
              } else if (obstacles.length < boxCount + stoneCount) {
                obstacles.push({ row: r, col: c, type: 'stone_2' });
              } else {
                obstacles.push({ row: r, col: c, type: 'wood_2' });
              }
            }
          }
        }
      }

      if (boxCount > 0) targets.push({ type: 'crown_box', count: boxCount });
      if (stoneCount > 0) targets.push({ type: 'stone', count: stoneCount });
      targets.push({ type: 'wood', count: obstacles.filter(o => o.type?.startsWith('wood')).length });

    } else {
      // Advanced levels (51 - 100): Grand Fortress and Treasury
      const totalObstacles = Math.min(24, 12 + Math.floor((lvl - 50) * 0.25));
      const stoneTargetCount = 6 + (lvl % 6);
      const boxTargetCount = 5 + (lvl % 5);
      const woodTargetCount = Math.max(4, totalObstacles - stoneTargetCount - boxTargetCount);

      // Create intricate patterns: concentric diamonds or cross-tunnels
      for (let r = 1; r <= 7; r++) {
        for (let c = 1; c <= 7; c++) {
          const isCross = r === 2 || r === 6 || c === 2 || c === 6;
          const isCenter = (r >= 3 && r <= 5) && (c >= 3 && c <= 5);
          if ((isCross || isCenter) && obstacles.length < totalObstacles) {
            if (obstacles.length < stoneTargetCount) {
              obstacles.push({ row: r, col: c, type: 'stone_2' });
            } else if (obstacles.length < stoneTargetCount + boxTargetCount) {
              obstacles.push({ row: r, col: c, type: 'crown_box_2' });
            } else {
              obstacles.push({ row: r, col: c, type: 'wood_2' });
            }
          }
        }
      }

      if (stoneTargetCount > 0) targets.push({ type: 'stone', count: stoneTargetCount });
      if (boxTargetCount > 0) targets.push({ type: 'crown_box', count: boxTargetCount });
      targets.push({ type: 'wood', count: obstacles.filter(o => o.type?.startsWith('wood')).length });

      // Add a primary gem objective
      const gemPool: TargetType[] = ['ruby', 'crown', 'shield'];
      targets.push({ type: gemPool[lvl % gemPool.length], count: 20 + (lvl % 8) * 2 });
    }

    const baseScore = 2000 + lvl * 250;
    const scoreTargets: [number, number, number] = [
      baseScore,
      Math.floor(baseScore * 1.8),
      Math.floor(baseScore * 2.8)
    ];

    const description = `Level ${lvl}: Clear ${targets.map(t => `${t.count} ${t.type.replace('_', ' ')}`).join(' & ')}!`;

    levels[lvl] = {
      levelNumber: lvl,
      moves,
      targets,
      scoreTargets,
      initialObstacles: obstacles,
      description,
    };
  }

  return levels;
}

export const ALL_LEVELS = generateLevels();

export function getLevelConfig(levelNumber: number): LevelConfig {
  if (ALL_LEVELS[levelNumber]) {
    return ALL_LEVELS[levelNumber];
  }
  // Fallback for safety
  return {
    levelNumber,
    moves: 25,
    targets: [{ type: 'ruby', count: 20 }],
    scoreTargets: [3000, 6000, 9000],
    description: `Level ${levelNumber}: Collect royal gems!`,
  };
}

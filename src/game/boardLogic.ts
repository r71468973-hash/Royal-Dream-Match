/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PieceType, BoosterType, ObstacleType, Tile, LevelConfig } from '../types/game';

export const BOARD_ROWS = 9;
export const BOARD_COLS = 9;

export const PIECE_TYPES: PieceType[] = ['ruby', 'shield', 'leaf', 'crown', 'gem'];

let idCounter = 1;
export function generateTileId(): string {
  return `tile_${idCounter++}_${Math.random().toString(36).substring(2, 7)}`;
}

export function getRandomPiece(): PieceType {
  const index = Math.floor(Math.random() * PIECE_TYPES.length);
  return PIECE_TYPES[index];
}

// Clone grid helper
export function cloneGrid(grid: Tile[][]): Tile[][] {
  return grid.map(row => row.map(tile => ({ ...tile })));
}

// Initialize a 9x9 board with no initial matches and ensure valid moves
export function createInitialBoard(level: LevelConfig): Tile[][] {
  let grid: Tile[][] = [];
  let attempts = 0;

  do {
    grid = [];
    for (let r = 0; r < BOARD_ROWS; r++) {
      const row: Tile[] = [];
      for (let c = 0; c < BOARD_COLS; c++) {
        // Find obstacle for this cell if configured
        const obsDef = level.initialObstacles?.find(o => o.row === r && o.col === c);
        const obstacle: ObstacleType = obsDef ? obsDef.type : null;

        // Choose piece that doesn't create match with left two or top two
        let piece: PieceType = getRandomPiece();
        let tries = 0;
        while (
          ((c >= 2 && row[c - 1]?.piece === piece && row[c - 2]?.piece === piece) ||
           (r >= 2 && grid[r - 1]?.[c]?.piece === piece && grid[r - 2]?.[c]?.piece === piece)) &&
          tries < 20
        ) {
          piece = getRandomPiece();
          tries++;
        }

        row.push({
          id: generateTileId(),
          row: r,
          col: c,
          piece: obstacle ? null : piece, // if obstacle occupies cell, piece appears once broken or underneath
          booster: null,
          obstacle: obstacle,
        });
      }
      grid.push(row);
    }
    attempts++;
  } while (!hasValidMoves(grid) && attempts < 15);

  return grid;
}

// Check if two cells are adjacent (cardinal only)
export function isAdjacent(r1: number, c1: number, r2: number, c2: number): boolean {
  const dr = Math.abs(r1 - r2);
  const dc = Math.abs(c1 - c2);
  return (dr === 1 && dc === 0) || (dr === 0 && dc === 1);
}

export interface MatchResult {
  matchedCoords: Array<{ row: number; col: number }>;
  createdBoosters: Array<{ row: number; col: number; type: BoosterType }>;
}

// Find all matches on board and detect booster creation (4-in-a-row, 5-in-a-row, T/L shapes)
export function findBoardMatches(
  grid: Tile[][], 
  lastSwapped?: { r1: number; c1: number; r2: number; c2: number }
): MatchResult {
  const matchedSet = new Set<string>();
  const horizontalRuns: Array<Array<{ r: number; c: number; piece: PieceType }>> = [];
  const verticalRuns: Array<Array<{ r: number; c: number; piece: PieceType }>> = [];

  // Check horizontal runs
  for (let r = 0; r < BOARD_ROWS; r++) {
    let currentRun: Array<{ r: number; c: number; piece: PieceType }> = [];
    for (let c = 0; c < BOARD_COLS; c++) {
      const tile = grid[r][c];
      if (tile.piece && !tile.obstacle) {
        if (currentRun.length === 0 || currentRun[0].piece === tile.piece) {
          currentRun.push({ r, c, piece: tile.piece });
        } else {
          if (currentRun.length >= 3) {
            horizontalRuns.push([...currentRun]);
          }
          currentRun = [{ r, c, piece: tile.piece }];
        }
      } else {
        if (currentRun.length >= 3) {
          horizontalRuns.push([...currentRun]);
        }
        currentRun = [];
      }
    }
    if (currentRun.length >= 3) {
      horizontalRuns.push([...currentRun]);
    }
  }

  // Check vertical runs
  for (let c = 0; c < BOARD_COLS; c++) {
    let currentRun: Array<{ r: number; c: number; piece: PieceType }> = [];
    for (let r = 0; r < BOARD_ROWS; r++) {
      const tile = grid[r][c];
      if (tile.piece && !tile.obstacle) {
        if (currentRun.length === 0 || currentRun[0].piece === tile.piece) {
          currentRun.push({ r, c, piece: tile.piece });
        } else {
          if (currentRun.length >= 3) {
            verticalRuns.push([...currentRun]);
          }
          currentRun = [{ r, c, piece: tile.piece }];
        }
      } else {
        if (currentRun.length >= 3) {
          verticalRuns.push([...currentRun]);
        }
        currentRun = [];
      }
    }
    if (currentRun.length >= 3) {
      verticalRuns.push([...currentRun]);
    }
  }

  // Collect all coordinates
  horizontalRuns.forEach(run => run.forEach(pt => matchedSet.add(`${pt.r},${pt.c}`)));
  verticalRuns.forEach(run => run.forEach(pt => matchedSet.add(`${pt.r},${pt.c}`)));

  const matchedCoords: Array<{ row: number; col: number }> = [];
  matchedSet.forEach(key => {
    const [r, c] = key.split(',').map(Number);
    matchedCoords.push({ row: r, col: c });
  });

  const createdBoosters: Array<{ row: number; col: number; type: BoosterType }> = [];
  const handledRuns = new Set<string>();

  // Check intersections for T/L shapes -> TNT
  for (const hRun of horizontalRuns) {
    for (const vRun of verticalRuns) {
      if (hRun[0].piece === vRun[0].piece) {
        // Find intersection point
        const intersect = hRun.find(h => vRun.some(v => v.r === h.r && v.c === h.c));
        if (intersect) {
          createdBoosters.push({ row: intersect.r, col: intersect.c, type: 'tnt' });
          handledRuns.add(JSON.stringify(hRun));
          handledRuns.add(JSON.stringify(vRun));
        }
      }
    }
  }

  // Check 5-in-a-row -> Rainbow Booster
  [...horizontalRuns, ...verticalRuns].forEach(run => {
    if (run.length >= 5 && !handledRuns.has(JSON.stringify(run))) {
      // Pick target tile: prefer last swapped cell if inside run, otherwise center
      let target = run[Math.floor(run.length / 2)];
      if (lastSwapped) {
        const found = run.find(p => (p.r === lastSwapped.r1 && p.c === lastSwapped.c1) || 
                                   (p.r === lastSwapped.r2 && p.c === lastSwapped.c2));
        if (found) target = found;
      }
      createdBoosters.push({ row: target.r, col: target.c, type: 'rainbow' });
      handledRuns.add(JSON.stringify(run));
    }
  });

  // Check 4-in-a-row -> Rocket
  horizontalRuns.forEach(run => {
    if (run.length === 4 && !handledRuns.has(JSON.stringify(run))) {
      let target = run[1];
      if (lastSwapped) {
        const found = run.find(p => (p.r === lastSwapped.r1 && p.c === lastSwapped.c1) || 
                                   (p.r === lastSwapped.r2 && p.c === lastSwapped.c2));
        if (found) target = found;
      }
      createdBoosters.push({ row: target.r, col: target.c, type: 'rocket_h' });
    }
  });

  verticalRuns.forEach(run => {
    if (run.length === 4 && !handledRuns.has(JSON.stringify(run))) {
      let target = run[1];
      if (lastSwapped) {
        const found = run.find(p => (p.r === lastSwapped.r1 && p.c === lastSwapped.c1) || 
                                   (p.r === lastSwapped.r2 && p.c === lastSwapped.c2));
        if (found) target = found;
      }
      createdBoosters.push({ row: target.r, col: target.c, type: 'rocket_v' });
    }
  });

  return { matchedCoords, createdBoosters };
}

// Check if any valid moves remain on the board
export function hasValidMoves(grid: Tile[][]): boolean {
  // Check if any booster is on board (boosters can always be tapped or swapped)
  for (let r = 0; r < BOARD_ROWS; r++) {
    for (let c = 0; c < BOARD_COLS; c++) {
      if (grid[r][c].booster) return true;
    }
  }

  // Check adjacent swaps
  for (let r = 0; r < BOARD_ROWS; r++) {
    for (let c = 0; c < BOARD_COLS; c++) {
      const tile = grid[r][c];
      if (!tile.piece || tile.obstacle) continue;

      // Check right swap
      if (c + 1 < BOARD_COLS && grid[r][c + 1].piece && !grid[r][c + 1].obstacle) {
        const testGrid = cloneGrid(grid);
        // Swap pieces
        const temp = testGrid[r][c].piece;
        testGrid[r][c].piece = testGrid[r][c + 1].piece;
        testGrid[r][c + 1].piece = temp;

        const { matchedCoords } = findBoardMatches(testGrid);
        if (matchedCoords.length > 0) return true;
      }

      // Check down swap
      if (r + 1 < BOARD_ROWS && grid[r + 1][c].piece && !grid[r + 1][c].obstacle) {
        const testGrid = cloneGrid(grid);
        const temp = testGrid[r][c].piece;
        testGrid[r][c].piece = testGrid[r + 1][c].piece;
        testGrid[r + 1][c].piece = temp;

        const { matchedCoords } = findBoardMatches(testGrid);
        if (matchedCoords.length > 0) return true;
      }
    }
  }

  return false;
}

// Shuffle all movable pieces on the board without modifying obstacles or boosters
export function shuffleBoard(grid: Tile[][]): Tile[][] {
  const newGrid = cloneGrid(grid);
  const movablePieces: PieceType[] = [];

  for (let r = 0; r < BOARD_ROWS; r++) {
    for (let c = 0; c < BOARD_COLS; c++) {
      if (newGrid[r][c].piece && !newGrid[r][c].obstacle && !newGrid[r][c].booster) {
        movablePieces.push(newGrid[r][c].piece!);
      }
    }
  }

  let attempts = 0;
  do {
    // Fisher-Yates shuffle
    for (let i = movablePieces.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [movablePieces[i], movablePieces[j]] = [movablePieces[j], movablePieces[i]];
    }

    let pIdx = 0;
    for (let r = 0; r < BOARD_ROWS; r++) {
      for (let c = 0; c < BOARD_COLS; c++) {
        if (newGrid[r][c].piece && !newGrid[r][c].obstacle && !newGrid[r][c].booster) {
          newGrid[r][c].piece = movablePieces[pIdx++];
        }
      }
    }
    attempts++;
  } while ((!hasValidMoves(newGrid) || findBoardMatches(newGrid).matchedCoords.length > 0) && attempts < 25);

  return newGrid;
}

// Helper to determine damage to an obstacle
export function degradeObstacle(obstacle: ObstacleType): { next: ObstacleType; destroyed: boolean; obstacleType: 'wood' | 'crown_box' | 'stone' } {
  if (obstacle === 'wood_2') {
    return { next: 'wood_1', destroyed: false, obstacleType: 'wood' };
  } else if (obstacle === 'wood_1') {
    return { next: null, destroyed: true, obstacleType: 'wood' };
  } else if (obstacle === 'crown_box_2') {
    return { next: 'crown_box_1', destroyed: false, obstacleType: 'crown_box' };
  } else if (obstacle === 'crown_box_1') {
    return { next: null, destroyed: true, obstacleType: 'crown_box' };
  } else if (obstacle === 'stone_2') {
    return { next: 'stone_1', destroyed: false, obstacleType: 'stone' };
  } else if (obstacle === 'stone_1') {
    return { next: null, destroyed: true, obstacleType: 'stone' };
  }
  return { next: null, destroyed: false, obstacleType: 'wood' };
}

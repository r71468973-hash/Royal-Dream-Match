/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Tile, 
  LevelConfig, 
  PlayerState, 
  LevelTarget, 
  BoosterType, 
  PieceType,
  ObstacleType
} from '../types/game';
import { 
  BOARD_ROWS, 
  BOARD_COLS, 
  createInitialBoard, 
  cloneGrid, 
  isAdjacent, 
  findBoardMatches, 
  getRandomPiece, 
  generateTileId,
  degradeObstacle,
  hasValidMoves,
  shuffleBoard
} from '../game/boardLogic';
import { PieceView } from './PieceView';
import { KingAvatar, KingMood } from './KingAvatar';
import { sound } from '../game/sound';
import { LevelCompletedModal } from './LevelCompletedModal';
import { LevelFailedModal } from './LevelFailedModal';
import { SettingsModal } from './SettingsModal';
import { admobService } from '../services/admobService';

interface GameplayScreenProps {
  levelConfig: LevelConfig;
  playerState: PlayerState;
  onLevelComplete: (levelNumber: number, stars: number, score: number, coinsEarned: number) => void;
  onLevelFailed: (levelNumber: number) => void;
  onQuitToHome: () => void;
  onUpdatePlayerState: (state: PlayerState) => void;
}

interface FloatingText {
  id: string;
  text: string;
  row: number;
  col: number;
  color: string;
}

export const GameplayScreen: React.FC<GameplayScreenProps> = ({
  levelConfig,
  playerState,
  onLevelComplete,
  onLevelFailed,
  onQuitToHome,
  onUpdatePlayerState,
}) => {
  // Game Board State
  const [grid, setGrid] = useState<Tile[][]>(() => createInitialBoard(levelConfig));
  const [selectedCoord, setSelectedCoord] = useState<{ row: number; col: number } | null>(null);
  const [isResolving, setIsResolving] = useState<boolean>(false);
  const [movesRemaining, setMovesRemaining] = useState<number>(levelConfig.moves);
  const [score, setScore] = useState<number>(0);
  const [targets, setTargets] = useState<LevelTarget[]>(() =>
    levelConfig.targets.map(t => ({ ...t, current: 0 }))
  );
  
  // Power-up Tool Mode
  const [activeTool, setActiveTool] = useState<'hammer' | 'rocket' | 'tnt' | 'rainbow' | null>(null);

  // FX & UI
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [kingMood, setKingMood] = useState<KingMood>('happy');
  const [shuffling, setShuffling] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showVictory, setShowVictory] = useState<boolean>(false);
  const [showFailed, setShowFailed] = useState<boolean>(false);
  const [bonusMovesUsed, setBonusMovesUsed] = useState<number>(0);

  // Drag tracking for touch controls
  const pointerStartRef = useRef<{ row: number; col: number } | null>(null);
  const isResolvingRef = useRef<boolean>(false);
  isResolvingRef.current = isResolving;

  // Sound & King Mood sync
  useEffect(() => {
    if (movesRemaining <= 5 && movesRemaining > 0 && kingMood !== 'worried' && !showVictory) {
      setKingMood('worried');
    }
  }, [movesRemaining, kingMood, showVictory]);

  // Floating text helper
  const addFloatingText = (text: string, row: number, col: number, color = 'text-yellow-300') => {
    const id = `float_${Date.now()}_${Math.random()}`;
    setFloatingTexts(prev => [...prev, { id, text, row, col, color }]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(f => f.id !== id));
    }, 900);
  };

  // Check if all targets are fulfilled
  const areTargetsMet = useCallback((currentTargets: LevelTarget[]): boolean => {
    return currentTargets.every(t => t.current >= t.count);
  }, []);

  // Calculate current stars
  const calculateStars = (currentScore: number): number => {
    const [s1, s2, s3] = levelConfig.scoreTargets;
    if (currentScore >= s3) return 3;
    if (currentScore >= s2) return 2;
    if (currentScore >= s1) return 1;
    return 0;
  };

  // Execute full cascading resolution
  const resolveBoard = useCallback(
    async (
      currentGrid: Tile[][],
      initialMatchedCoords: Array<{ row: number; col: number }>,
      initialCreatedBoosters: Array<{ row: number; col: number; type: BoosterType }>,
      comboStep = 1
    ) => {
      setIsResolving(true);
      let workGrid = cloneGrid(currentGrid);
      let currentCombo = comboStep;
      let matchedCoords = [...initialMatchedCoords];
      let createdBoosters = [...initialCreatedBoosters];

      // Play combo sound
      sound.playMatch(currentCombo);

      if (currentCombo >= 2) {
        setKingMood('amazed');
        const comboLabels = ['', 'GOOD!', 'GREAT!', 'AMAZING!', 'ROYAL MATCH!', 'SPECTACULAR!'];
        const label = comboLabels[Math.min(currentCombo, comboLabels.length - 1)];
        if (matchedCoords[0]) {
          addFloatingText(label, matchedCoords[0].row, matchedCoords[0].col, 'text-amber-300 font-black');
        }
      }

      // 1. Process matches, targets, score and obstacles
      let scoreGained = matchedCoords.length * 60 * currentCombo;
      const targetsUpdated: Record<string, number> = {};

      // Check matched pieces
      matchedCoords.forEach(({ row, col }) => {
        const tile = workGrid[row][col];
        if (tile.piece) {
          targetsUpdated[tile.piece] = (targetsUpdated[tile.piece] || 0) + 1;
        }
      });

      // Check adjacent obstacles to damage
      const damagedObstacleKeys = new Set<string>();
      matchedCoords.forEach(({ row, col }) => {
        const neighbors = [
          { r: row - 1, c: col },
          { r: row + 1, c: col },
          { r: row, c: col - 1 },
          { r: row, c: col + 1 },
        ];

        neighbors.forEach(({ r, c }) => {
          if (r >= 0 && r < BOARD_ROWS && c >= 0 && c < BOARD_COLS) {
            const key = `${r},${c}`;
            if (!damagedObstacleKeys.has(key) && workGrid[r][c].obstacle) {
              damagedObstacleKeys.add(key);
              const { next, destroyed, obstacleType } = degradeObstacle(workGrid[r][c].obstacle);
              workGrid[r][c].obstacle = next;
              sound.playObstacleHit();

              if (destroyed) {
                targetsUpdated[obstacleType] = (targetsUpdated[obstacleType] || 0) + 1;
                scoreGained += 150;
                // If crown box opened, also award a crown
                if (obstacleType === 'crown_box') {
                  targetsUpdated['crown'] = (targetsUpdated['crown'] || 0) + 1;
                }
                // When obstacle is gone, spawn a fresh piece on this tile
                workGrid[r][c].piece = getRandomPiece();
              }
            }
          }
        });
      });

      // Update targets state
      let updatedTargetsSnapshot: LevelTarget[] = [];
      setTargets(prev => {
        const nextTargets = prev.map(t => {
          const added = targetsUpdated[t.type] || 0;
          return { ...t, current: Math.min(t.count, t.current + added) };
        });
        updatedTargetsSnapshot = nextTargets;
        return nextTargets;
      });

      // Update score state
      setScore(prev => prev + scoreGained);

      // 2. Mark and clear matched pieces (except where a booster is being created)
      const boosterMap = new Map<string, BoosterType>();
      createdBoosters.forEach(b => boosterMap.set(`${b.row},${b.col}`, b.type));

      matchedCoords.forEach(({ row, col }) => {
        const key = `${row},${col}`;
        if (boosterMap.has(key)) {
          workGrid[row][col].booster = boosterMap.get(key) || null;
          workGrid[row][col].piece = null;
        } else {
          workGrid[row][col].piece = null;
          workGrid[row][col].booster = null;
        }
      });

      setGrid(cloneGrid(workGrid));
      await new Promise(res => setTimeout(res, 220));

      // 3. Gravity: drop pieces down column by column
      for (let c = 0; c < BOARD_COLS; c++) {
        let writeRow = BOARD_ROWS - 1;
        for (let r = BOARD_ROWS - 1; r >= 0; r--) {
          // If tile is blocked by an active obstacle, it doesn't move
          if (workGrid[r][c].obstacle) {
            writeRow = r - 1;
            continue;
          }

          if (workGrid[r][c].piece !== null || workGrid[r][c].booster !== null) {
            if (writeRow !== r) {
              workGrid[writeRow][c].piece = workGrid[r][c].piece;
              workGrid[writeRow][c].booster = workGrid[r][c].booster;
              workGrid[r][c].piece = null;
              workGrid[r][c].booster = null;
            }
            writeRow--;
          }
        }

        // Fill remaining empty tiles from top with fresh random pieces
        for (let r = writeRow; r >= 0; r--) {
          if (!workGrid[r][c].obstacle) {
            workGrid[r][c].piece = getRandomPiece();
            workGrid[r][c].booster = null;
            workGrid[r][c].id = generateTileId();
          }
        }
      }

      setGrid(cloneGrid(workGrid));
      await new Promise(res => setTimeout(res, 220));

      // 4. Check for cascading matches
      const nextMatch = findBoardMatches(workGrid);
      if (nextMatch.matchedCoords.length > 0) {
        // Cascade again!
        await resolveBoard(workGrid, nextMatch.matchedCoords, nextMatch.createdBoosters, currentCombo + 1);
        return;
      }

      // 5. Board has stabilized! Check victory/loss conditions
      setIsResolving(false);

      // Check if targets fulfilled
      if (areTargetsMet(updatedTargetsSnapshot)) {
        triggerVictorySequence(movesRemaining);
        return;
      }

      // Check if out of moves
      if (movesRemaining <= 1) {
        // If targets not met and this was the last move
        setKingMood('sad');
        setShowFailed(true);
        return;
      }

      // 6. Check if any valid moves remain, shuffle if trapped
      if (!hasValidMoves(workGrid)) {
        setShuffling(true);
        sound.playSwap();
        await new Promise(res => setTimeout(res, 600));
        const shuffled = shuffleBoard(workGrid);
        setGrid(shuffled);
        setShuffling(false);
      }
    },
    [areTargetsMet, movesRemaining, levelConfig.scoreTargets]
  );

  // Victory Sequence & Bonus Time
  const triggerVictorySequence = async (leftoverMoves: number) => {
    setIsResolving(true);
    setKingMood('celebrating');

    // Bonus time: convert each remaining move into 250 extra score + 5 coins
    const bonusScore = leftoverMoves * 250;
    const coinsEarned = 50 + leftoverMoves * 10;
    setBonusMovesUsed(leftoverMoves);
    setScore(prev => prev + bonusScore);

    await new Promise(res => setTimeout(res, 400));
    setShowVictory(true);
  };

  // Booster Detonation Mechanics
  const detonateBoosterAt = async (
    row: number, 
    col: number, 
    boosterType: BoosterType, 
    targetColor?: PieceType | null
  ) => {
    setIsResolving(true);
    let workGrid = cloneGrid(grid);
    const affectedCoords: Array<{ row: number; col: number }> = [];

    if (boosterType === 'rocket_h') {
      sound.playRocket();
      addFloatingText('ROCKET!', row, col, 'text-orange-400');
      // Clear entire row
      for (let c = 0; c < BOARD_COLS; c++) {
        affectedCoords.push({ row, col: c });
      }
    } else if (boosterType === 'rocket_v') {
      sound.playRocket();
      addFloatingText('ROCKET!', row, col, 'text-orange-400');
      // Clear entire column
      for (let r = 0; r < BOARD_ROWS; r++) {
        affectedCoords.push({ row: r, col });
      }
    } else if (boosterType === 'tnt') {
      sound.playTNT();
      addFloatingText('BOOM!', row, col, 'text-red-400');
      // Clear 3x3 surrounding area
      for (let r = Math.max(0, row - 1); r <= Math.min(BOARD_ROWS - 1, row + 1); r++) {
        for (let c = Math.max(0, col - 1); c <= Math.min(BOARD_COLS - 1, col + 1); c++) {
          affectedCoords.push({ row: r, col: c });
        }
      }
    } else if (boosterType === 'rainbow') {
      sound.playRainbow();
      addFloatingText('RAINBOW!', row, col, 'text-pink-400');
      const chosenColor = targetColor || getRandomPiece();
      for (let r = 0; r < BOARD_ROWS; r++) {
        for (let c = 0; c < BOARD_COLS; c++) {
          if (workGrid[r][c].piece === chosenColor) {
            affectedCoords.push({ row: r, col: c });
          }
        }
      }
    }

    // Spend booster
    workGrid[row][col].booster = null;
    workGrid[row][col].piece = null;

    await resolveBoard(workGrid, affectedCoords, []);
  };

  // Booster Combo Explosions
  const triggerBoosterCombo = async (
    r1: number, 
    c1: number, 
    b1: BoosterType, 
    r2: number, 
    c2: number, 
    b2: BoosterType
  ) => {
    setIsResolving(true);
    let workGrid = cloneGrid(grid);
    const affectedCoords: Array<{ row: number; col: number }> = [];

    // Rainbow + Rainbow: clears entire board!
    if (b1 === 'rainbow' && b2 === 'rainbow') {
      sound.playVictory();
      addFloatingText('ROYAL DISCO BLAST!', r1, c1, 'text-pink-300 font-black');
      for (let r = 0; r < BOARD_ROWS; r++) {
        for (let c = 0; c < BOARD_COLS; c++) {
          affectedCoords.push({ row: r, col: c });
        }
      }
    } 
    // Rocket + Rocket: clears full row AND full column (cross)
    else if ((b1?.startsWith('rocket') && b2?.startsWith('rocket'))) {
      sound.playRocket();
      addFloatingText('CROSS ROCKET!', r1, c1, 'text-yellow-300 font-black');
      for (let c = 0; c < BOARD_COLS; c++) affectedCoords.push({ row: r1, col: c });
      for (let r = 0; r < BOARD_ROWS; r++) affectedCoords.push({ row: r, col: c1 });
    }
    // Rocket + TNT: clears 3 full rows and 3 full columns!
    else if ((b1?.startsWith('rocket') && b2 === 'tnt') || (b1 === 'tnt' && b2?.startsWith('rocket'))) {
      sound.playTNT();
      sound.playRocket();
      addFloatingText('MEGA BLAST!', r1, c1, 'text-rose-400 font-black');
      for (let r = Math.max(0, r1 - 1); r <= Math.min(BOARD_ROWS - 1, r1 + 1); r++) {
        for (let c = 0; c < BOARD_COLS; c++) affectedCoords.push({ row: r, col: c });
      }
      for (let c = Math.max(0, c1 - 1); c <= Math.min(BOARD_COLS - 1, c1 + 1); c++) {
        for (let r = 0; r < BOARD_ROWS; r++) affectedCoords.push({ row: r, col: c });
      }
    }
    // TNT + TNT: massive 5x5 explosion
    else if (b1 === 'tnt' && b2 === 'tnt') {
      sound.playTNT();
      addFloatingText('GIGA TNT!', r1, c1, 'text-red-500 font-black');
      for (let r = Math.max(0, r1 - 2); r <= Math.min(BOARD_ROWS - 1, r1 + 2); r++) {
        for (let c = Math.max(0, c1 - 2); c <= Math.min(BOARD_COLS - 1, c1 + 2); c++) {
          affectedCoords.push({ row: r, col: c });
        }
      }
    }
    // Rainbow + Rocket/TNT: transforms pieces of a random color into rockets/TNT and explodes
    else if (b1 === 'rainbow' || b2 === 'rainbow') {
      sound.playRainbow();
      const otherBooster = b1 === 'rainbow' ? b2 : b1;
      const targetCol = getRandomPiece();
      addFloatingText('RAINBOW SURGE!', r1, c1, 'text-purple-300 font-black');

      for (let r = 0; r < BOARD_ROWS; r++) {
        for (let c = 0; c < BOARD_COLS; c++) {
          if (workGrid[r][c].piece === targetCol) {
            affectedCoords.push({ row: r, col: c });
          }
        }
      }
    }

    // Clear the two combo source tiles
    workGrid[r1][c1].booster = null;
    workGrid[r1][c1].piece = null;
    workGrid[r2][c2].booster = null;
    workGrid[r2][c2].piece = null;

    setMovesRemaining(prev => Math.max(0, prev - 1));
    await resolveBoard(workGrid, affectedCoords, []);
  };

  // Perform Swap Between Two Adjacent Cells
  const performSwap = async (r1: number, c1: number, r2: number, c2: number) => {
    if (isResolvingRef.current) return;
    setIsResolving(true);

    const t1 = grid[r1][c1];
    const t2 = grid[r2][c2];

    // Check if both are boosters
    if (t1.booster && t2.booster) {
      await triggerBoosterCombo(r1, c1, t1.booster, r2, c2, t2.booster);
      return;
    }

    // Check if one is a rainbow booster and the other is a regular piece
    if (t1.booster === 'rainbow' && t2.piece) {
      setMovesRemaining(prev => Math.max(0, prev - 1));
      await detonateBoosterAt(r1, c1, 'rainbow', t2.piece);
      return;
    }
    if (t2.booster === 'rainbow' && t1.piece) {
      setMovesRemaining(prev => Math.max(0, prev - 1));
      await detonateBoosterAt(r2, c2, 'rainbow', t1.piece);
      return;
    }

    // Check if one is a rocket or TNT swapped with a piece
    if (t1.booster && !t2.booster) {
      setMovesRemaining(prev => Math.max(0, prev - 1));
      await detonateBoosterAt(r1, c1, t1.booster);
      return;
    }
    if (t2.booster && !t1.booster) {
      setMovesRemaining(prev => Math.max(0, prev - 1));
      await detonateBoosterAt(r2, c2, t2.booster);
      return;
    }

    // Regular Piece Swap Validation
    sound.playSwap();
    const tempGrid = cloneGrid(grid);
    const tempPiece = tempGrid[r1][c1].piece;
    tempGrid[r1][c1].piece = tempGrid[r2][c2].piece;
    tempGrid[r2][c2].piece = tempPiece;

    setGrid(tempGrid);

    const { matchedCoords, createdBoosters } = findBoardMatches(tempGrid, { r1, c1, r2, c2 });

    if (matchedCoords.length > 0) {
      // Valid move!
      setMovesRemaining(prev => Math.max(0, prev - 1));
      await resolveBoard(tempGrid, matchedCoords, createdBoosters, 1);
    } else {
      // Invalid swap - animate swap back
      await new Promise(res => setTimeout(res, 200));
      sound.playInvalid();
      setGrid(cloneGrid(grid)); // revert
      setIsResolving(false);
    }
  };

  // Handle Tile Click / Selection
  const handleTileClick = async (row: number, col: number) => {
    if (isResolvingRef.current) return;

    // Handle Active Tool (Hammer or Placed Boosters)
    if (activeTool) {
      handleToolActionOnTile(row, col, activeTool);
      return;
    }

    const clickedTile = grid[row][col];

    // If clicked directly on an already-placed booster, detonate it!
    if (clickedTile.booster) {
      setSelectedCoord(null);
      setMovesRemaining(prev => Math.max(0, prev - 1));
      await detonateBoosterAt(row, col, clickedTile.booster);
      return;
    }

    // Normal selection or swap
    if (!selectedCoord) {
      if (clickedTile.piece && !clickedTile.obstacle) {
        sound.playTap();
        setSelectedCoord({ row, col });
      }
    } else {
      const { row: r1, col: c1 } = selectedCoord;
      if (r1 === row && c1 === col) {
        // Deselect
        setSelectedCoord(null);
      } else if (isAdjacent(r1, c1, row, col)) {
        // Attempt swap
        setSelectedCoord(null);
        await performSwap(r1, c1, row, col);
      } else {
        // Select different tile
        sound.playTap();
        setSelectedCoord({ row, col });
      }
    }
  };

  // Handle powerup tool application
  const handleToolActionOnTile = async (
    row: number, 
    col: number, 
    tool: 'hammer' | 'rocket' | 'tnt' | 'rainbow'
  ) => {
    if (playerState.inventory[tool] <= 0) {
      sound.playInvalid();
      alert(`You do not have any ${tool} power-ups!`);
      setActiveTool(null);
      return;
    }

    // Deduct 1 from inventory
    const newInventory = {
      ...playerState.inventory,
      [tool]: playerState.inventory[tool] - 1,
    };
    onUpdatePlayerState({ ...playerState, inventory: newInventory });
    setActiveTool(null);

    let workGrid = cloneGrid(grid);

    if (tool === 'hammer') {
      sound.playObstacleHit();
      addFloatingText('HAMMER SMASH!', row, col, 'text-yellow-300 font-bold');

      if (workGrid[row][col].obstacle) {
        const { next, destroyed, obstacleType } = degradeObstacle(workGrid[row][col].obstacle);
        workGrid[row][col].obstacle = next;
        if (destroyed) {
          setTargets(prev => prev.map(t => t.type === obstacleType ? { ...t, current: t.current + 1 } : t));
          workGrid[row][col].piece = getRandomPiece();
        }
      } else if (workGrid[row][col].booster) {
        await detonateBoosterAt(row, col, workGrid[row][col].booster);
        return;
      } else {
        // Smash piece
        const pc = workGrid[row][col].piece;
        workGrid[row][col].piece = null;
        if (pc) {
          setTargets(prev => prev.map(t => t.type === pc ? { ...t, current: t.current + 1 } : t));
        }
      }

      await resolveBoard(workGrid, [{ row, col }], []);
    } else if (tool === 'rocket') {
      await detonateBoosterAt(row, col, 'rocket_h');
    } else if (tool === 'tnt') {
      await detonateBoosterAt(row, col, 'tnt');
    } else if (tool === 'rainbow') {
      await detonateBoosterAt(row, col, 'rainbow');
    }
  };

  // Touch Drag gestures for smooth mobile gameplay
  const handleTouchStart = (row: number, col: number) => {
    if (isResolvingRef.current) return;
    pointerStartRef.current = { row, col };
  };

  const handleTouchEnd = (e: React.TouchEvent, row: number, col: number) => {
    if (!pointerStartRef.current || isResolvingRef.current) return;
    const start = pointerStartRef.current;
    pointerStartRef.current = null;

    const touch = e.changedTouches[0];
    const elem = document.elementFromPoint(touch.clientX, touch.clientY);
    const targetCell = elem?.closest('[data-cell]')?.getAttribute('data-cell');

    if (targetCell) {
      const [tr, tc] = targetCell.split('-').map(Number);
      if (isAdjacent(start.row, start.col, tr, tc)) {
        performSwap(start.row, start.col, tr, tc);
      }
    }
  };

  const currentStars = calculateStars(score);

  return (
    <div className="relative w-full h-full flex flex-col justify-between bg-gradient-to-b from-[#0b1b3d] via-[#0f285e] to-[#081329] select-none overflow-hidden touch-none">
      
      {/* Background Starry Glow */}
      <div className="absolute inset-0 bg-radial from-blue-400/10 via-transparent to-black/70 pointer-events-none" />

      {/* TOP HUD BAR */}
      <div className="relative z-20 px-3 pt-2 pb-1.5 bg-blue-950/85 border-b-2 border-yellow-400/40 backdrop-blur-md shadow-md flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          
          {/* Pause / Settings Button */}
          <button
            onClick={() => {
              sound.playTap();
              setShowSettings(true);
            }}
            className="w-9 h-9 rounded-xl bg-blue-900 border border-yellow-300 flex items-center justify-center text-white text-base shadow active:scale-95 transition-transform"
          >
            ⏸
          </button>

          {/* King Avatar */}
          <div className="flex items-center gap-1.5">
            <KingAvatar mood={kingMood} size="sm" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-yellow-300 uppercase leading-none">
                Level {levelConfig.levelNumber}
              </span>
              <span className="text-xs font-black text-white leading-tight">
                {score.toLocaleString()} pts
              </span>
            </div>
          </div>

          {/* Moves Remaining Badge */}
          <div className="flex items-center gap-1 px-3 py-1 rounded-2xl bg-gradient-to-b from-yellow-300 via-amber-400 to-amber-600 border-2 border-yellow-100 shadow-[0_4px_12px_rgba(245,158,11,0.5)]">
            <div className="flex flex-col items-center">
              <span className="text-[9px] font-black text-amber-950 uppercase leading-none">
                MOVES
              </span>
              <span
                className={`text-lg font-black leading-tight ${
                  movesRemaining <= 5 ? 'text-red-950 animate-pulse' : 'text-blue-950'
                }`}
                style={{ fontFamily: "'Fredoka', sans-serif" }}
              >
                {movesRemaining}
              </span>
            </div>
          </div>

          {/* Star Progress Bar */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-blue-900/60 border border-blue-700">
            {[1, 2, 3].map((starIdx) => (
              <span
                key={starIdx}
                className={`text-sm ${
                  starIdx <= currentStars ? 'text-yellow-300 drop-shadow' : 'text-slate-500 opacity-40'
                }`}
              >
                ★
              </span>
            ))}
          </div>
        </div>

        {/* Targets Display Bar */}
        <div className="flex items-center justify-center gap-3 py-1 px-2 rounded-xl bg-blue-900/40 border border-yellow-400/20">
          <span className="text-[9px] font-bold text-yellow-200/80 uppercase tracking-widest mr-1">
            Targets:
          </span>
          <div className="flex items-center gap-3">
            {targets.map((tgt, i) => {
              const isMet = tgt.current >= tgt.count;
              return (
                <div key={i} className="flex items-center gap-1">
                  <div className="w-5 h-5 flex items-center justify-center">
                    {tgt.type === 'wood' && (
                      <div className="w-4 h-4 rounded bg-amber-800 border border-amber-500" />
                    )}
                    {tgt.type === 'crown_box' && (
                      <div className="w-4 h-4 rounded bg-yellow-500 border border-yellow-200 flex items-center justify-center text-[10px]">
                        👑
                      </div>
                    )}
                    {tgt.type === 'stone' && (
                      <div className="w-4 h-4 rounded bg-slate-600 border border-slate-400" />
                    )}
                    {['ruby', 'shield', 'leaf', 'crown', 'gem'].includes(tgt.type) && (
                      <PieceView piece={tgt.type as any} />
                    )}
                  </div>
                  <span
                    className={`text-xs font-black ${
                      isMet ? 'text-emerald-400' : 'text-white'
                    }`}
                  >
                    {tgt.current}/{tgt.count} {isMet ? '✓' : ''}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CENTER: 9x9 PUZZLE BOARD */}
      <div className="relative flex-1 flex items-center justify-center p-2">
        <div className="relative w-full max-w-[390px] aspect-square rounded-3xl bg-gradient-to-b from-blue-950 via-[#0a1838] to-[#061026] border-4 border-yellow-400/80 shadow-[0_8px_30px_rgba(0,0,0,0.8),inset_0_2px_10px_rgba(255,255,255,0.2)] p-1.5 overflow-hidden">
          
          {/* Subtle grid pattern background */}
          <div className="absolute inset-0 grid grid-cols-9 grid-rows-9 opacity-15 pointer-events-none">
            {Array.from({ length: 81 }).map((_, i) => (
              <div key={i} className="border border-white/20" />
            ))}
          </div>

          {/* Shuffling Banner */}
          {shuffling && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <div className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 border-2 border-white text-blue-950 font-black text-sm tracking-wider uppercase shadow-xl animate-pulse">
                🎲 SHUFFLING BOARD...
              </div>
            </div>
          )}

          {/* Active Tool Banner */}
          {activeTool && (
            <div className="absolute top-2 inset-x-2 z-20 flex items-center justify-between px-3 py-1.5 rounded-xl bg-amber-500 border-2 border-white text-blue-950 font-bold text-xs shadow-lg animate-bounce">
              <span>Tap a tile to use {activeTool.toUpperCase()}!</span>
              <button
                onClick={() => setActiveTool(null)}
                className="px-2 py-0.5 rounded bg-blue-950 text-white text-[10px]"
              >
                Cancel
              </button>
            </div>
          )}

          {/* The 9x9 Grid Cells */}
          <div className="w-full h-full grid grid-cols-9 grid-rows-9 gap-1">
            {grid.map((row, r) =>
              row.map((tile, c) => {
                const isSelected = selectedCoord?.row === r && selectedCoord?.col === c;

                return (
                  <div
                    key={tile.id}
                    data-cell={`${r}-${c}`}
                    onClick={() => handleTileClick(r, c)}
                    onTouchStart={() => handleTouchStart(r, c)}
                    onTouchEnd={(e) => handleTouchEnd(e, r, c)}
                    className={`relative w-full h-full rounded-xl flex items-center justify-center cursor-pointer transition-transform duration-100 ${
                      isSelected
                        ? 'ring-4 ring-yellow-300 ring-offset-1 ring-offset-blue-950 scale-105 z-10'
                        : 'hover:scale-[1.02]'
                    }`}
                  >
                    <PieceView
                      piece={tile.piece}
                      booster={tile.booster}
                      obstacle={tile.obstacle}
                    />
                  </div>
                );
              })
            )}
          </div>

          {/* Floating score & combo text popups */}
          {floatingTexts.map(f => (
            <div
              key={f.id}
              style={{
                top: `${(f.row / BOARD_ROWS) * 100}%`,
                left: `${(f.col / BOARD_COLS) * 100}%`,
              }}
              className={`absolute z-30 pointer-events-none transform -translate-x-1/2 -translate-y-full text-xs font-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] animate-out fade-out slide-out-to-top-6 duration-700 ${f.color}`}
            >
              {f.text}
            </div>
          ))}
        </div>
      </div>

      {/* BOTTOM POWER-UP HUD TRAY */}
      <div className="relative z-20 px-4 py-2.5 bg-blue-950/90 border-t-2 border-yellow-400/40 backdrop-blur-md shadow-lg flex items-center justify-around gap-2">
        {/* 1. Royal Hammer */}
        <button
          onClick={() => {
            sound.playTap();
            setActiveTool(prev => prev === 'hammer' ? null : 'hammer');
          }}
          className={`relative flex flex-col items-center justify-center p-2 rounded-2xl border-2 transition-all ${
            activeTool === 'hammer'
              ? 'bg-amber-400 border-white ring-2 ring-yellow-300 scale-105'
              : 'bg-blue-900/80 border-yellow-400/60 active:scale-95'
          }`}
        >
          <span className="text-xl">🔨</span>
          <span className="text-[9px] font-black text-yellow-200 mt-0.5">Hammer</span>
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-600 border border-white text-white text-[10px] font-bold flex items-center justify-center">
            {playerState.inventory.hammer}
          </span>
        </button>

        {/* 2. Rocket Booster */}
        <button
          onClick={() => {
            sound.playTap();
            setActiveTool(prev => prev === 'rocket' ? null : 'rocket');
          }}
          className={`relative flex flex-col items-center justify-center p-2 rounded-2xl border-2 transition-all ${
            activeTool === 'rocket'
              ? 'bg-amber-400 border-white ring-2 ring-yellow-300 scale-105'
              : 'bg-blue-900/80 border-yellow-400/60 active:scale-95'
          }`}
        >
          <span className="text-xl">🚀</span>
          <span className="text-[9px] font-black text-yellow-200 mt-0.5">Rocket</span>
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-600 border border-white text-white text-[10px] font-bold flex items-center justify-center">
            {playerState.inventory.rocket}
          </span>
        </button>

        {/* 3. TNT Bomb */}
        <button
          onClick={() => {
            sound.playTap();
            setActiveTool(prev => prev === 'tnt' ? null : 'tnt');
          }}
          className={`relative flex flex-col items-center justify-center p-2 rounded-2xl border-2 transition-all ${
            activeTool === 'tnt'
              ? 'bg-amber-400 border-white ring-2 ring-yellow-300 scale-105'
              : 'bg-blue-900/80 border-yellow-400/60 active:scale-95'
          }`}
        >
          <span className="text-xl">💣</span>
          <span className="text-[9px] font-black text-yellow-200 mt-0.5">TNT</span>
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-600 border border-white text-white text-[10px] font-bold flex items-center justify-center">
            {playerState.inventory.tnt}
          </span>
        </button>

        {/* 4. Rainbow Orb */}
        <button
          onClick={() => {
            sound.playTap();
            setActiveTool(prev => prev === 'rainbow' ? null : 'rainbow');
          }}
          className={`relative flex flex-col items-center justify-center p-2 rounded-2xl border-2 transition-all ${
            activeTool === 'rainbow'
              ? 'bg-amber-400 border-white ring-2 ring-yellow-300 scale-105'
              : 'bg-blue-900/80 border-yellow-400/60 active:scale-95'
          }`}
        >
          <span className="text-xl">🌈</span>
          <span className="text-[9px] font-black text-yellow-200 mt-0.5">Rainbow</span>
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-600 border border-white text-white text-[10px] font-bold flex items-center justify-center">
            {playerState.inventory.rainbow}
          </span>
        </button>
      </div>

      {/* MODALS */}

      {/* Settings / Pause Modal */}
      {showSettings && (
        <SettingsModal
          playerState={playerState}
          onUpdateState={onUpdatePlayerState}
          onClose={() => setShowSettings(false)}
          onRestartLevel={() => {
            setGrid(createInitialBoard(levelConfig));
            setMovesRemaining(levelConfig.moves);
            setScore(0);
            setTargets(levelConfig.targets.map(t => ({ ...t, current: 0 })));
            setSelectedCoord(null);
            setIsResolving(false);
          }}
          isInGame={true}
        />
      )}

      {/* Level Completed Modal */}
      {showVictory && (
        <LevelCompletedModal
          levelNumber={levelConfig.levelNumber}
          score={score}
          stars={calculateStars(score)}
          coinsEarned={50 + bonusMovesUsed * 10}
          bonusMoves={bonusMovesUsed}
          onNextLevel={() => {
            setShowVictory(false);
            onLevelComplete(
              levelConfig.levelNumber,
              calculateStars(score),
              score,
              50 + bonusMovesUsed * 10
            );
          }}
          onReplay={() => {
            setShowVictory(false);
            setGrid(createInitialBoard(levelConfig));
            setMovesRemaining(levelConfig.moves);
            setScore(0);
            setTargets(levelConfig.targets.map(t => ({ ...t, current: 0 })));
            setSelectedCoord(null);
            setIsResolving(false);
          }}
          onHome={() => {
            setShowVictory(false);
            onQuitToHome();
          }}
        />
      )}

      {/* Level Failed Modal */}
      {showFailed && (
        <LevelFailedModal
          levelNumber={levelConfig.levelNumber}
          unmetTargets={targets.filter(t => t.current < t.count)}
          coins={playerState.coins}
          onWatchAdForMoves={() => {
            admobService.showRewardedAd(
              { type: 'extra_moves', amount: 5 },
              () => {
                setMovesRemaining(prev => prev + 5);
                setKingMood('happy');
                setShowFailed(false);
              }
            );
          }}
          onBuyExtraMoves={() => {
            // Deduct 100 coins, grant +5 moves
            onUpdatePlayerState({ ...playerState, coins: playerState.coins - 100 });
            setMovesRemaining(prev => prev + 5);
            setKingMood('happy');
            setShowFailed(false);
          }}
          onRetry={() => {
            setShowFailed(false);
            onLevelFailed(levelConfig.levelNumber);
          }}
          onQuit={() => {
            setShowFailed(false);
            onQuitToHome();
          }}
        />
      )}
    </div>
  );
};

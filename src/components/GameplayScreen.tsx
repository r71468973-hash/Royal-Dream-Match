/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
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
import { PauseModal } from './PauseModal';
import { RoyalAlertModal } from './RoyalAlertModal';
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
  const [showPauseModal, setShowPauseModal] = useState<boolean>(false);
  const [showVictory, setShowVictory] = useState<boolean>(false);
  const [showFailed, setShowFailed] = useState<boolean>(false);
  const [bonusMovesUsed, setBonusMovesUsed] = useState<number>(0);
  const [alertState, setAlertState] = useState<{ title: string; message: string; icon?: string } | null>(null);

  // Drag tracking for touch controls
  const pointerStartPosRef = useRef<{ x: number; y: number; row: number; col: number } | null>(null);
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
    }, 800);
  };

  // Check if all targets are met
  const areAllTargetsMet = (currentTargets: LevelTarget[]) => {
    return currentTargets.every(t => t.current >= t.count);
  };

  // Calculate stars earned
  const calculateStars = (currentScore: number): number => {
    const [s1, s2, s3] = levelConfig.scoreTargets;
    if (currentScore >= s3) return 3;
    if (currentScore >= s2) return 2;
    if (currentScore >= s1) return 1;
    return 1;
  };

  // Resolve board matches, cascades, gravity, and target goals
  const resolveBoard = async (
    currentGrid: Tile[][],
    initiallyMatched: Array<{ row: number; col: number }>,
    initialBoosters: Array<{ row: number; col: number; type: BoosterType }>,
    comboChain = 1
  ) => {
    let workGrid = cloneGrid(currentGrid);
    let matchedCoords = [...initiallyMatched];
    let createdBoosters = [...initialBoosters];
    let currentCombo = comboChain;

    while (matchedCoords.length > 0) {
      sound.playMatch(currentCombo);

      if (currentCombo > 1) {
        addFloatingText(`COMBO x${currentCombo}!`, matchedCoords[0].row, matchedCoords[0].col, 'text-amber-300 font-black');
      }

      // 1. Calculate Score & Targets collection
      let scoreGained = matchedCoords.length * 50 * currentCombo;
      const targetsUpdated: Record<string, number> = {};

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
                if (obstacleType === 'crown_box') {
                  targetsUpdated['crown'] = (targetsUpdated['crown'] || 0) + 1;
                }
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

      // 2. Mark and clear matched pieces
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
      await new Promise(res => setTimeout(res, 200));

      // 3. Gravity: drop pieces down column by column
      for (let c = 0; c < BOARD_COLS; c++) {
        let writeRow = BOARD_ROWS - 1;
        for (let r = BOARD_ROWS - 1; r >= 0; r--) {
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
      await new Promise(res => setTimeout(res, 240));

      // 4. Check for Victory after this step
      if (areAllTargetsMet(updatedTargetsSnapshot)) {
        setKingMood('celebrating');
        sound.playVictory();
        await new Promise(res => setTimeout(res, 350));
        setShowVictory(true);
        setIsResolving(false);
        return;
      }

      // 5. Look for cascade matches
      currentCombo++;
      const cascadeResult = findBoardMatches(workGrid);
      matchedCoords = cascadeResult.matchedCoords;
      createdBoosters = cascadeResult.createdBoosters;
    }

    // Check if board has valid moves, shuffle if deadlock
    if (!hasValidMoves(workGrid)) {
      setShuffling(true);
      sound.playInvalid();
      await new Promise(res => setTimeout(res, 800));
      workGrid = shuffleBoard(workGrid);
      setGrid(cloneGrid(workGrid));
      setShuffling(false);
    }

    // Check if moves ran out
    if (movesRemaining <= 1 && !areAllTargetsMet(targets)) {
      setKingMood('sad');
      sound.playDefeat();
      await new Promise(res => setTimeout(res, 400));
      setShowFailed(true);
    }

    setIsResolving(false);
  };

  // Detonate Booster Action
  const detonateBoosterAt = async (
    row: number, 
    col: number, 
    boosterType: BoosterType,
    targetPieceColor?: PieceType
  ) => {
    if (isResolvingRef.current) return;
    setIsResolving(true);

    const workGrid = cloneGrid(grid);
    const affectedCoords: Array<{ row: number; col: number }> = [];

    if (boosterType === 'rocket_h') {
      sound.playRocket();
      addFloatingText('ROCKET HORIZONTAL!', row, col, 'text-orange-400 font-black');
      for (let c = 0; c < BOARD_COLS; c++) {
        affectedCoords.push({ row, col: c });
      }
    } else if (boosterType === 'rocket_v') {
      sound.playRocket();
      addFloatingText('ROCKET VERTICAL!', row, col, 'text-orange-400 font-black');
      for (let r = 0; r < BOARD_ROWS; r++) {
        affectedCoords.push({ row: r, col });
      }
    } else if (boosterType === 'tnt') {
      sound.playTNT();
      addFloatingText('TNT BLAST!', row, col, 'text-red-400 font-black');
      for (let r = Math.max(0, row - 2); r <= Math.min(BOARD_ROWS - 1, row + 2); r++) {
        for (let c = Math.max(0, col - 2); c <= Math.min(BOARD_COLS - 1, col + 2); c++) {
          affectedCoords.push({ row: r, col: c });
        }
      }
    } else if (boosterType === 'rainbow') {
      sound.playRainbow();
      const targetColor = targetPieceColor || getRandomPiece();
      addFloatingText('ROYAL RAINBOW!', row, col, 'text-purple-300 font-black');

      for (let r = 0; r < BOARD_ROWS; r++) {
        for (let c = 0; c < BOARD_COLS; c++) {
          if (workGrid[r][c].piece === targetColor) {
            affectedCoords.push({ row: r, col: c });
          }
        }
      }
      affectedCoords.push({ row, col });
    }

    workGrid[row][col].booster = null;
    workGrid[row][col].piece = null;

    await resolveBoard(workGrid, affectedCoords, []);
  };

  // Booster Combos
  const triggerBoosterCombo = async (
    r1: number, 
    c1: number, 
    b1: BoosterType, 
    r2: number, 
    c2: number, 
    b2: BoosterType
  ) => {
    const workGrid = cloneGrid(grid);
    const affectedCoords: Array<{ row: number; col: number }> = [];

    // Rocket + Rocket: Cross blast
    if (b1?.startsWith('rocket') && b2?.startsWith('rocket')) {
      sound.playRocket();
      addFloatingText('CROSS ROCKET BLAST!', r1, c1, 'text-yellow-300 font-black');
      for (let c = 0; c < BOARD_COLS; c++) affectedCoords.push({ row: r1, col: c });
      for (let r = 0; r < BOARD_ROWS; r++) affectedCoords.push({ row: r, col: c1 });
    }
    // Rocket + TNT: 3-row or 3-col Mega Blast
    else if ((b1?.startsWith('rocket') && b2 === 'tnt') || (b1 === 'tnt' && b2?.startsWith('rocket'))) {
      sound.playTNT();
      addFloatingText('MEGA CYLINDER BLAST!', r1, c1, 'text-orange-400 font-black');
      for (let r = Math.max(0, r1 - 1); r <= Math.min(BOARD_ROWS - 1, r1 + 1); r++) {
        for (let c = 0; c < BOARD_COLS; c++) affectedCoords.push({ row: r, col: c });
      }
      for (let c = Math.max(0, c1 - 1); c <= Math.min(BOARD_COLS - 1, c1 + 1); c++) {
        for (let r = 0; r < BOARD_ROWS; r++) affectedCoords.push({ row: r, col: c });
      }
    }
    // TNT + TNT: Massive 7x7 Supernova
    else if (b1 === 'tnt' && b2 === 'tnt') {
      sound.playTNT();
      addFloatingText('SUPERNOVA BLAST!', r1, c1, 'text-red-500 font-black');
      for (let r = Math.max(0, r1 - 3); r <= Math.min(BOARD_ROWS - 1, r1 + 3); r++) {
        for (let c = Math.max(0, c1 - 3); c <= Math.min(BOARD_COLS - 1, c1 + 3); c++) {
          affectedCoords.push({ row: r, col: c });
        }
      }
    }
    // Rainbow + Rainbow: Clear entire board
    else if (b1 === 'rainbow' && b2 === 'rainbow') {
      sound.playRainbow();
      addFloatingText('ROYAL BOARD CLEAR!', r1, c1, 'text-yellow-200 font-black');
      for (let r = 0; r < BOARD_ROWS; r++) {
        for (let c = 0; c < BOARD_COLS; c++) {
          affectedCoords.push({ row: r, col: c });
        }
      }
    } else {
      sound.playRainbow();
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
      setMovesRemaining(prev => Math.max(0, prev - 1));
      await resolveBoard(tempGrid, matchedCoords, createdBoosters, 1);
    } else {
      await new Promise(res => setTimeout(res, 200));
      sound.playInvalid();
      setGrid(cloneGrid(grid));
      setIsResolving(false);
    }
  };

  // Handle Tile Click / Selection
  const handleTileClick = async (row: number, col: number) => {
    if (isResolvingRef.current) return;

    if (activeTool) {
      handleToolActionOnTile(row, col, activeTool);
      return;
    }

    const clickedTile = grid[row][col];

    if (clickedTile.booster) {
      setSelectedCoord(null);
      setMovesRemaining(prev => Math.max(0, prev - 1));
      await detonateBoosterAt(row, col, clickedTile.booster);
      return;
    }

    if (!selectedCoord) {
      if (clickedTile.piece && !clickedTile.obstacle) {
        sound.playTap();
        setSelectedCoord({ row, col });
      }
    } else {
      const { row: r1, col: c1 } = selectedCoord;
      if (r1 === row && c1 === col) {
        setSelectedCoord(null);
      } else if (isAdjacent(r1, c1, row, col)) {
        setSelectedCoord(null);
        await performSwap(r1, c1, row, col);
      } else {
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
      setAlertState({
        title: 'OUT OF POWER-UPS',
        message: `You don't have any ${tool.toUpperCase()} power-ups in your royal inventory. Claim your daily rewards or earn stars to restock!`,
        icon: '🔨',
      });
      setActiveTool(null);
      return;
    }

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

  // Touch Swipe Gesture Detection for Mobile
  const handleTouchStart = (e: React.TouchEvent, row: number, col: number) => {
    if (isResolvingRef.current) return;
    const touch = e.touches[0];
    pointerStartPosRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      row,
      col,
    };
  };

  const handleTouchEnd = (e: React.TouchEvent, row: number, col: number) => {
    if (!pointerStartPosRef.current || isResolvingRef.current) return;
    const start = pointerStartPosRef.current;
    pointerStartPosRef.current = null;

    const touch = e.changedTouches[0];
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    // If swipe distance is at least 18 pixels:
    if (absX >= 18 || absY >= 18) {
      let targetRow = start.row;
      let targetCol = start.col;

      if (absX > absY) {
        if (dx > 0 && start.col < BOARD_COLS - 1) {
          targetCol = start.col + 1;
        } else if (dx < 0 && start.col > 0) {
          targetCol = start.col - 1;
        }
      } else {
        if (dy > 0 && start.row < BOARD_ROWS - 1) {
          targetRow = start.row + 1;
        } else if (dy < 0 && start.row > 0) {
          targetRow = start.row - 1;
        }
      }

      if (targetRow !== start.row || targetCol !== start.col) {
        performSwap(start.row, start.col, targetRow, targetCol);
        return;
      }
    }

    // Fallback: check if dragged onto adjacent element
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

  const handleRestartLevel = () => {
    setShowPauseModal(false);
    setGrid(createInitialBoard(levelConfig));
    setMovesRemaining(levelConfig.moves);
    setScore(0);
    setTargets(levelConfig.targets.map(t => ({ ...t, current: 0 })));
    setSelectedCoord(null);
    setIsResolving(false);
    setKingMood('happy');
    sound.playTap();
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between bg-[#0e031a] select-none overflow-hidden touch-none">
      
      {/* Royal Palace Wallpaper Background & Scrim */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-25 pointer-events-none"
        style={{ backgroundImage: "url('/royal_palace_bg.jpg')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#1c0535]/90 via-[#100220]/80 to-[#090114]/95 pointer-events-none" />

      {/* TOP HUD BAR */}
      <div className="relative z-20 px-3 pt-2 pb-1.5 bg-purple-950/85 border-b-2 border-amber-400/50 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.6)] flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          
          {/* Pause Button */}
          <button
            onClick={() => {
              sound.playTap();
              setShowPauseModal(true);
            }}
            className="w-9 h-9 rounded-xl bg-purple-900 border border-amber-400 flex items-center justify-center text-white text-base shadow active:scale-95 transition-transform"
            title="Pause Game"
          >
            ⏸
          </button>

          {/* Quick Sound Mute Toggle */}
          <button
            onClick={() => {
              const next = sound.toggleSound();
              onUpdatePlayerState({
                ...playerState,
                settings: { ...playerState.settings, sound: next }
              });
            }}
            className="w-9 h-9 rounded-xl bg-purple-900 border border-amber-400/70 flex items-center justify-center text-sm shadow active:scale-95 transition-transform"
            title={playerState.settings.sound ? 'Mute Audio' : 'Unmute Audio'}
          >
            {playerState.settings.sound ? '🔊' : '🔇'}
          </button>

          {/* King Avatar */}
          <div className="flex items-center gap-1.5">
            <KingAvatar mood={kingMood} size="sm" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-amber-300 uppercase leading-none">
                Level {levelConfig.levelNumber}
              </span>
              <span className="text-xs font-black text-white leading-tight">
                {score.toLocaleString()} pts
              </span>
            </div>
          </div>

          {/* Moves Remaining Badge */}
          <div className="flex items-center gap-1 px-3 py-1 rounded-2xl bg-gradient-to-b from-amber-300 via-yellow-400 to-amber-600 border-2 border-yellow-100 shadow-[0_4px_12px_rgba(245,158,11,0.5)]">
            <div className="flex flex-col items-center">
              <span className="text-[9px] font-black text-amber-950 uppercase leading-none">
                MOVES
              </span>
              <span
                className={`text-lg font-black leading-tight ${
                  movesRemaining <= 5 ? 'text-rose-950 animate-pulse' : 'text-purple-950'
                }`}
                style={{ fontFamily: "'Fredoka', sans-serif" }}
              >
                {movesRemaining}
              </span>
            </div>
          </div>

          {/* Star Progress Bar */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-purple-900/60 border border-amber-400/30">
            {[1, 2, 3].map((starIdx) => (
              <span
                key={starIdx}
                className={`text-sm ${
                  starIdx <= currentStars ? 'text-yellow-300 drop-shadow' : 'text-purple-700 opacity-40'
                }`}
              >
                ★
              </span>
            ))}
          </div>
        </div>

        {/* Targets Display Bar */}
        <div className="flex items-center justify-center gap-3 py-1 px-2 rounded-xl bg-purple-900/40 border border-amber-400/30">
          <span className="text-[9px] font-bold text-amber-200/90 uppercase tracking-widest mr-1">
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
        <div className="relative w-full max-w-[390px] aspect-square rounded-3xl bg-gradient-to-b from-[#240a42] via-[#16042b] to-[#0c0218] border-4 border-amber-400 shadow-[0_12px_45px_rgba(0,0,0,0.9),inset_0_2px_6px_rgba(251,191,36,0.5)] p-1.5 overflow-hidden">
          
          {/* Subtle grid pattern background */}
          <div className="absolute inset-0 grid grid-cols-9 grid-rows-9 opacity-15 pointer-events-none">
            {Array.from({ length: 81 }).map((_, i) => (
              <div key={i} className="border border-purple-400/20" />
            ))}
          </div>

          {/* Shuffling Banner */}
          {shuffling && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/70 backdrop-blur-sm">
              <div className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 border-2 border-white text-purple-950 font-black text-sm tracking-wider uppercase shadow-xl animate-pulse">
                🎲 SHUFFLING BOARD...
              </div>
            </div>
          )}

          {/* Active Tool Banner */}
          {activeTool && (
            <div className="absolute top-2 inset-x-2 z-20 flex items-center justify-between px-3 py-1.5 rounded-xl bg-amber-500 border-2 border-white text-purple-950 font-bold text-xs shadow-lg animate-bounce">
              <span>Tap a tile to use {activeTool.toUpperCase()}!</span>
              <button
                onClick={() => setActiveTool(null)}
                className="px-2 py-0.5 rounded bg-purple-950 text-white text-[10px]"
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
                    onTouchStart={(e) => handleTouchStart(e, r, c)}
                    onTouchEnd={(e) => handleTouchEnd(e, r, c)}
                    className={`relative w-full h-full rounded-xl bg-[#1c0834]/80 border border-purple-500/20 shadow-inner flex items-center justify-center cursor-pointer transition-transform duration-100 ${
                      isSelected
                        ? 'ring-4 ring-yellow-300 ring-offset-1 ring-offset-purple-950 scale-105 z-10'
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
      <div className="relative z-20 px-4 py-2.5 bg-purple-950/90 border-t-2 border-amber-400/40 backdrop-blur-md shadow-lg flex items-center justify-around gap-2">
        {/* 1. Royal Hammer */}
        <button
          onClick={() => {
            sound.playTap();
            setActiveTool(prev => prev === 'hammer' ? null : 'hammer');
          }}
          className={`relative flex flex-col items-center justify-center p-2 rounded-2xl border-2 transition-all ${
            activeTool === 'hammer'
              ? 'bg-amber-400 border-white ring-2 ring-yellow-300 scale-105'
              : 'bg-purple-900/80 border-amber-400/60 active:scale-95'
          }`}
        >
          <span className="text-xl">🔨</span>
          <span className="text-[9px] font-black text-amber-200 mt-0.5">Hammer</span>
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
              : 'bg-purple-900/80 border-amber-400/60 active:scale-95'
          }`}
        >
          <span className="text-xl">🚀</span>
          <span className="text-[9px] font-black text-amber-200 mt-0.5">Rocket</span>
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
              : 'bg-purple-900/80 border-amber-400/60 active:scale-95'
          }`}
        >
          <span className="text-xl">💣</span>
          <span className="text-[9px] font-black text-amber-200 mt-0.5">TNT</span>
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-600 border border-white text-white text-[10px] font-bold flex items-center justify-center">
            {playerState.inventory.tnt}
          </span>
        </button>

        {/* 4. Rainbow Magic */}
        <button
          onClick={() => {
            sound.playTap();
            setActiveTool(prev => prev === 'rainbow' ? null : 'rainbow');
          }}
          className={`relative flex flex-col items-center justify-center p-2 rounded-2xl border-2 transition-all ${
            activeTool === 'rainbow'
              ? 'bg-amber-400 border-white ring-2 ring-yellow-300 scale-105'
              : 'bg-purple-900/80 border-amber-400/60 active:scale-95'
          }`}
        >
          <span className="text-xl">✨</span>
          <span className="text-[9px] font-black text-amber-200 mt-0.5">Rainbow</span>
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-600 border border-white text-white text-[10px] font-bold flex items-center justify-center">
            {playerState.inventory.rainbow}
          </span>
        </button>
      </div>

      {/* Pause Modal */}
      {showPauseModal && (
        <PauseModal
          levelConfig={levelConfig}
          score={score}
          movesRemaining={movesRemaining}
          soundEnabled={playerState.settings.sound}
          musicEnabled={playerState.settings.music}
          onResume={() => setShowPauseModal(false)}
          onRestart={handleRestartLevel}
          onQuit={() => {
            setShowPauseModal(false);
            onQuitToHome();
          }}
          onToggleSound={() => {
            const next = sound.toggleSound();
            onUpdatePlayerState({
              ...playerState,
              settings: { ...playerState.settings, sound: next }
            });
          }}
          onToggleMusic={() => {
            const next = sound.toggleMusic();
            onUpdatePlayerState({
              ...playerState,
              settings: { ...playerState.settings, music: next }
            });
          }}
        />
      )}

      {/* Level Victory Modal */}
      {showVictory && (
        <LevelCompletedModal
          levelNumber={levelConfig.levelNumber}
          score={score}
          stars={calculateStars(score)}
          coinsEarned={50 + movesRemaining * 10}
          bonusMoves={movesRemaining}
          onNextLevel={() => {
            setShowVictory(false);
            onLevelComplete(
              levelConfig.levelNumber,
              calculateStars(score),
              score,
              50 + movesRemaining * 10
            );
          }}
          onReplay={handleRestartLevel}
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

      {/* Royal Alert Modal */}
      {alertState && (
        <RoyalAlertModal
          title={alertState.title}
          message={alertState.message}
          icon={alertState.icon}
          onConfirm={() => setAlertState(null)}
        />
      )}
    </div>
  );
};

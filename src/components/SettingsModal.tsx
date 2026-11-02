/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { PlayerState } from '../types/game';
import { sound } from '../game/sound';
import { resetPlayerProgress } from '../game/storage';
import { otaService, OtaState } from '../services/otaService';
import { 
  PRODUCTION_ADMOB_APP_ID, 
  PRODUCTION_BANNER_UNIT_ID, 
  GOOGLE_TEST_BANNER_UNIT_ID,
  PRODUCTION_REWARDED_UNIT_ID,
  GOOGLE_TEST_REWARDED_UNIT_ID,
  ADMOB_CONFIG 
} from '../config/admob';
import { rewardedAdService } from '../services/rewardedAdService';
import { AdMobBanner } from './AdMobBanner';
import { ApkDownloadModal } from './ApkDownloadModal';

interface SettingsModalProps {
  playerState: PlayerState;
  onUpdateState: (newState: PlayerState) => void;
  onClose: () => void;
  onRestartLevel?: () => void;
  isInGame?: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  playerState,
  onUpdateState,
  onClose,
  onRestartLevel,
  isInGame = false,
}) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'ota' | 'admob' | 'rules' | 'privacy'>('settings');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showApkModal, setShowApkModal] = useState(false);
  const [rewardToast, setRewardToast] = useState<string | null>(null);

  // AdMob Test/Live Mode toggle in UI
  const [isTestMode, setIsTestMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('rdm_force_live_admob');
    return saved === 'true' ? false : ADMOB_CONFIG.isTestMode;
  });

  // OTA Updates Local State
  const [otaState, setOtaState] = useState<OtaState>(() => otaService.getState());
  const [manifestUrlInput, setManifestUrlInput] = useState(() => otaService.getConfig().manifestUrl);
  const [otaSaveFeedback, setOtaSaveFeedback] = useState(false);
  const [isCheckingOta, setIsCheckingOta] = useState(false);

  useEffect(() => {
    const unsub = otaService.subscribe((state) => {
      setOtaState(state);
    });
    return () => unsub();
  }, []);

  const toggleSound = () => {
    const next = !playerState.settings.sound;
    sound.setSoundEnabled(next);
    if (next) sound.playTap();
    onUpdateState({
      ...playerState,
      settings: { ...playerState.settings, sound: next },
    });
  };

  const toggleMusic = () => {
    const next = !playerState.settings.music;
    sound.setMusicEnabled(next);
    sound.playTap();
    onUpdateState({
      ...playerState,
      settings: { ...playerState.settings, music: next },
    });
  };

  const toggleVibration = () => {
    const next = !playerState.settings.vibration;
    sound.playTap();
    onUpdateState({
      ...playerState,
      settings: { ...playerState.settings, vibration: next },
    });
  };

  const handleReset = () => {
    sound.playDefeat();
    const fresh = resetPlayerProgress();
    onUpdateState(fresh);
    setShowResetConfirm(false);
    onClose();
  };

  const handleToggleAdmobMode = () => {
    sound.playTap();
    const next = !isTestMode;
    setIsTestMode(next);
    localStorage.setItem('rdm_force_live_admob', next ? 'false' : 'true');
    setRewardToast(next ? 'Switched to Google Sample Test Ads' : 'Switched to Live Production Ad Unit!');
    setTimeout(() => setRewardToast(null), 3000);
  };

  const handleCheckOta = async () => {
    sound.playTap();
    setIsCheckingOta(true);
    const update = await otaService.checkForUpdates(false);
    setIsCheckingOta(false);
    if (update) {
      setRewardToast(`🎉 New Live Update Found: v${update.version}!`);
    } else {
      setRewardToast('✓ You have the latest version!');
    }
    setTimeout(() => setRewardToast(null), 3500);
  };

  const handleSimulateOta = () => {
    sound.playTap();
    otaService.simulateUpdateAvailable('1.0.1', 2);
    setRewardToast('⚡ Simulated live update v1.0.1 generated!');
    setTimeout(() => setRewardToast(null), 3000);
  };

  const handleSaveOtaUrl = () => {
    sound.playTap();
    otaService.updateConfig({ manifestUrl: manifestUrlInput });
    setOtaSaveFeedback(true);
    setTimeout(() => setOtaSaveFeedback(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#330f57] via-[#21093b] to-[#140424] border-4 border-amber-400 p-4 sm:p-5 shadow-[0_12px_45px_rgba(0,0,0,0.9)] text-white max-h-[92vh] overflow-hidden flex flex-col">
        
        {/* Close Button */}
        <button
          onClick={() => {
            sound.playTap();
            onClose();
          }}
          className="absolute top-2 right-2 sm:-top-3 sm:-right-3 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-b from-rose-500 to-rose-700 border-2 border-amber-300 flex items-center justify-center text-white font-black shadow-lg active:scale-95 transition-transform z-10"
        >
          ✕
        </button>

        {/* Modal Title */}
        <div className="text-center mb-2.5">
          <div className="text-amber-400 text-xs font-black tracking-widest uppercase flex items-center justify-center gap-1">
            <span>👑</span>
            <span>ROYAL COURT SETTINGS</span>
            <span>👑</span>
          </div>
        </div>

        {/* Toast notification for in-modal actions */}
        {rewardToast && (
          <div className="mb-2 py-1.5 px-3 rounded-xl bg-amber-400 text-amber-950 font-black text-xs text-center shadow-lg animate-bounce">
            {rewardToast}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex rounded-xl bg-[#170529]/90 p-1 border border-amber-400/40 mb-3 overflow-x-auto">
          <button
            onClick={() => {
              sound.playTap();
              setActiveTab('settings');
            }}
            className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all ${
              activeTab === 'settings'
                ? 'bg-gradient-to-b from-amber-300 to-yellow-500 text-amber-950 shadow-md'
                : 'text-amber-200/80 hover:text-white'
            }`}
          >
            Audio
          </button>
          <button
            onClick={() => {
              sound.playTap();
              setActiveTab('admob');
            }}
            className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all ${
              activeTab === 'admob'
                ? 'bg-gradient-to-b from-amber-300 to-yellow-500 text-amber-950 shadow-md'
                : 'text-amber-200/80 hover:text-white'
            }`}
          >
            AdMob
          </button>
          <button
            onClick={() => {
              sound.playTap();
              setActiveTab('ota');
            }}
            className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all ${
              activeTab === 'ota'
                ? 'bg-gradient-to-b from-amber-300 to-yellow-500 text-amber-950 shadow-md'
                : 'text-amber-200/80 hover:text-white'
            }`}
          >
            Live OTA
          </button>
          <button
            onClick={() => {
              sound.playTap();
              setActiveTab('rules');
            }}
            className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all ${
              activeTab === 'rules'
                ? 'bg-gradient-to-b from-amber-300 to-yellow-500 text-amber-950 shadow-md'
                : 'text-amber-200/80 hover:text-white'
            }`}
          >
            Rules
          </button>
          <button
            onClick={() => {
              sound.playTap();
              setActiveTab('privacy');
            }}
            className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all ${
              activeTab === 'privacy'
                ? 'bg-gradient-to-b from-amber-300 to-yellow-500 text-amber-950 shadow-md'
                : 'text-amber-200/80 hover:text-white'
            }`}
          >
            About
          </button>
        </div>

        {/* Tab 1: Settings / Audio */}
        {activeTab === 'settings' && (
          <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2.5">
            {/* Sound FX Toggle */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#1b0830]/80 border border-amber-400/30">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🔊</span>
                <div>
                  <div className="text-sm font-black text-amber-200">Sound Effects</div>
                  <div className="text-[10px] text-purple-300">Match chimes, crystal blasts & fanfare</div>
                </div>
              </div>
              <button
                onClick={toggleSound}
                className={`w-14 h-8 rounded-full p-1 transition-colors duration-200 border border-amber-300/50 ${
                  playerState.settings.sound ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                    playerState.settings.sound ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Music Toggle */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#1b0830]/80 border border-amber-400/30">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎵</span>
                <div>
                  <div className="text-sm font-black text-amber-200">Royal Music</div>
                  <div className="text-[10px] text-purple-300">Majestic Renaissance court harmony</div>
                </div>
              </div>
              <button
                onClick={toggleMusic}
                className={`w-14 h-8 rounded-full p-1 transition-colors duration-200 border border-amber-300/50 ${
                  playerState.settings.music ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                    playerState.settings.music ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Vibration Toggle */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#1b0830]/80 border border-amber-400/30">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📳</span>
                <div>
                  <div className="text-sm font-black text-amber-200">Tactile Haptics</div>
                  <div className="text-[10px] text-purple-300">Haptic rumble feedback</div>
                </div>
              </div>
              <button
                onClick={toggleVibration}
                className={`w-14 h-8 rounded-full p-1 transition-colors duration-200 border border-amber-300/50 ${
                  playerState.settings.vibration ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                    playerState.settings.vibration ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* In-Game Restart Level */}
            {isInGame && onRestartLevel && (
              <button
                onClick={() => {
                  sound.playTap();
                  onRestartLevel();
                  onClose();
                }}
                className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 border border-amber-200 text-amber-950 font-black text-sm tracking-wide shadow-md active:scale-95 transition-transform"
              >
                🔄 RESTART LEVEL
              </button>
            )}

            {/* Reset Progress */}
            <div className="pt-2 border-t border-purple-800/60">
              {!showResetConfirm ? (
                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="w-full py-2 text-xs font-semibold text-rose-300 hover:text-rose-100 transition-colors"
                >
                  ⚠️ Reset Game Progress
                </button>
              ) : (
                <div className="p-3 rounded-2xl bg-rose-950/80 border border-rose-500/80 flex flex-col gap-2 text-center">
                  <div className="text-xs font-bold text-rose-200">
                    Are you sure? All level stars and coins will be reset to Level 1!
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleReset}
                      className="flex-1 py-1.5 rounded-lg bg-rose-600 text-white font-bold text-xs"
                    >
                      Yes, Reset
                    </button>
                    <button
                      onClick={() => setShowResetConfirm(false)}
                      className="flex-1 py-1.5 rounded-lg bg-slate-700 text-white font-bold text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: AdMob Banner Configuration & Hub */}
        {activeTab === 'admob' && (
          <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2.5 text-xs">
            {/* Quick Play Store Hub button */}
            <button
              onClick={() => {
                sound.playTap();
                setShowApkModal(true);
              }}
              className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 border-2 border-amber-200 text-amber-950 font-black text-xs uppercase tracking-wider shadow active:scale-95 transition-transform flex items-center justify-center gap-1.5"
            >
              <span>📥</span>
              <span>PLAY STORE HUB & DOWNLOADS</span>
            </button>

            {/* AdMob Mode Switcher */}
            <div className="p-3 rounded-2xl bg-[#1b0830]/80 border border-amber-400/30 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-black text-amber-200 text-xs">AdMob Banner Mode</div>
                  <div className="text-[10px] text-purple-300">
                    {isTestMode ? 'Using Google Sample Test Ads' : 'Using Live Production Ad Unit'}
                  </div>
                </div>
                <button
                  onClick={handleToggleAdmobMode}
                  className={`px-3 py-1 rounded-full text-[10px] font-black border transition-colors ${
                    isTestMode
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                      : 'bg-amber-500/20 border-amber-400 text-yellow-300'
                  }`}
                >
                  {isTestMode ? 'TEST MODE' : 'LIVE MODE'}
                </button>
              </div>

              {/* Verified IDs Summary */}
              <div className="pt-2 border-t border-purple-800/60 flex flex-col gap-1 text-[10px]">
                <div className="flex justify-between py-0.5 border-b border-purple-800/40">
                  <span className="text-purple-300">AdMob App ID:</span>
                  <span className="font-mono text-amber-200 text-[9px] truncate max-w-[190px]">
                    {PRODUCTION_ADMOB_APP_ID}
                  </span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-purple-800/40">
                  <span className="text-purple-300">Banner Unit ID:</span>
                  <span className="font-mono text-emerald-300 text-[9px] truncate max-w-[190px]">
                    {isTestMode ? GOOGLE_TEST_BANNER_UNIT_ID : PRODUCTION_BANNER_UNIT_ID}
                  </span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-purple-800/40">
                  <span className="text-purple-300">Rewarded Unit ID:</span>
                  <span className="font-mono text-amber-200 text-[9px] truncate max-w-[190px]">
                    {isTestMode ? GOOGLE_TEST_REWARDED_UNIT_ID : PRODUCTION_REWARDED_UNIT_ID}
                  </span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-purple-300">Active Mode:</span>
                  <span className="font-bold text-emerald-400">
                    {isTestMode ? 'Official Sample Test Ads' : 'Live Production IDs'}
                  </span>
                </div>
              </div>

              {/* Rewarded Ad Test Buttons */}
              <div className="pt-2 border-t border-purple-800/60 flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-amber-300">Test Rewarded Video Ads:</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      sound.playTap();
                      rewardedAdService.showRewardedAd(
                        {
                          type: 'coins',
                          amount: 100,
                          title: '100 Gold Coins',
                          description: 'Sample test rewarded video ad for royal treasury coins.',
                        },
                        () => {
                          onUpdateState({
                            ...playerState,
                            coins: playerState.coins + 100,
                          });
                          setRewardToast('🎉 +100 Coins Received!');
                          setTimeout(() => setRewardToast(null), 3000);
                        }
                      );
                    }}
                    className="py-1.5 px-2 rounded-xl bg-purple-900/90 hover:bg-purple-800 border border-purple-600 text-[10px] font-bold text-amber-200 flex items-center justify-center gap-1 active:scale-95 transition-transform"
                  >
                    <span>🎬 🪙</span>
                    <span>Test +100 Coins</span>
                  </button>

                  <button
                    onClick={() => {
                      sound.playTap();
                      rewardedAdService.showRewardedAd(
                        {
                          type: 'lives',
                          amount: 1,
                          title: 'Extra Royal Life',
                          description: 'Sample test rewarded video ad for extra life.',
                        },
                        () => {
                          onUpdateState({
                            ...playerState,
                            lives: Math.min(playerState.maxLives, playerState.lives + 1),
                          });
                          setRewardToast('🎉 +1 Life Restored!');
                          setTimeout(() => setRewardToast(null), 3000);
                        }
                      );
                    }}
                    className="py-1.5 px-2 rounded-xl bg-purple-900/90 hover:bg-purple-800 border border-purple-600 text-[10px] font-bold text-rose-200 flex items-center justify-center gap-1 active:scale-95 transition-transform"
                  >
                    <span>🎬 ❤️</span>
                    <span>Test +1 Life</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Live Banner Preview */}
            <div className="bg-[#1b0830]/80 rounded-2xl p-2.5 border border-amber-400/30 flex flex-col gap-1.5">
              <span className="font-bold text-amber-300 text-[10px] uppercase tracking-wider">
                Banner Ad Preview (Non-Intrusive 50px):
              </span>
              <AdMobBanner forceTestMode={isTestMode} />
              <p className="text-[9px] text-purple-300 leading-tight">
                Docked at the bottom of the screen with fixed safe-padding so game controls, boosters, and gem swaps are never blocked.
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: Live OTA Updates */}
        {activeTab === 'ota' && (
          <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2.5 text-xs">
            {/* OTA Status Header Card */}
            <div className="bg-[#1b0830]/80 rounded-2xl p-3 border border-amber-400/30 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-black text-amber-200 text-xs">Installed Live Version</div>
                  <div className="text-[10px] text-purple-300">
                    Version: <strong className="text-white">v{otaState.currentVersion}</strong> (Build {otaState.currentBuild})
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-[10px] font-black">
                  OTA ACTIVE
                </span>
              </div>

              {otaState.lastChecked && (
                <div className="text-[10px] text-purple-300">
                  Last checked: {new Date(otaState.lastChecked).toLocaleTimeString()}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-1">
                <button
                  disabled={isCheckingOta}
                  onClick={handleCheckOta}
                  className="flex-1 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 font-black text-xs shadow active:scale-95 transition-transform disabled:opacity-50"
                >
                  {isCheckingOta ? 'Checking...' : '🔄 Check for Updates'}
                </button>
                <button
                  onClick={handleSimulateOta}
                  className="py-2 px-3 rounded-xl bg-purple-900/80 hover:bg-purple-800 border border-purple-600 text-amber-200 font-bold text-xs active:scale-95 transition-transform"
                  title="Simulate finding an update for testing"
                >
                  🧪 Test Update
                </button>
              </div>
            </div>

            {/* Server Manifest URL Card */}
            <div className="bg-[#1b0830]/80 rounded-2xl p-3 border border-amber-400/30 flex flex-col gap-2">
              <span className="font-black text-amber-300 text-xs">Update Server Manifest URL:</span>
              <p className="text-[10px] text-purple-300 leading-tight">
                Points to your GitHub raw manifest or Firebase hosting endpoint:
              </p>
              <input
                type="text"
                value={manifestUrlInput}
                onChange={(e) => setManifestUrlInput(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl bg-[#110321] border border-purple-700 text-white font-mono text-[10px]"
              />
              <button
                onClick={handleSaveOtaUrl}
                className="py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow active:scale-95 transition-transform"
              >
                {otaSaveFeedback ? '✓ URL Saved!' : 'Save Manifest URL'}
              </button>
            </div>

            {/* How OTA Updates Work Card */}
            <div className="bg-[#1b0830]/50 rounded-2xl p-3 border border-purple-800/60 text-[11px] leading-relaxed text-purple-200">
              <span className="font-bold text-amber-300 block mb-1">⚡ Automatic Live Updates:</span>
              <ul className="list-disc list-inside space-y-1 text-[10px]">
                <li>When you push code changes to GitHub, the workflow automatically generates the live update bundle.</li>
                <li>Installed APKs automatically fetch and apply updates on launch without re-installing the APK.</li>
                <li>HTML, CSS, JavaScript, game levels, and graphics update instantly!</li>
              </ul>
            </div>
          </div>
        )}

        {/* Tab 4: Rules & Booster Combos */}
        {activeTab === 'rules' && (
          <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2.5 text-xs text-amber-100">
            <div className="p-2.5 rounded-xl bg-[#1b0830]/80 border border-amber-400/30">
              <span className="font-bold text-amber-300 block mb-0.5">🚀 Royal Rocket (Match 4)</span>
              Clears an entire row or column. Directly blasts obstacles in its trajectory!
            </div>
            <div className="p-2.5 rounded-xl bg-[#1b0830]/80 border border-amber-400/30">
              <span className="font-bold text-amber-300 block mb-0.5">💣 TNT Bomb (T or L Match)</span>
              Explodes a 3x3 radius and shatters nearby royal chests, stone, and crates!
            </div>
            <div className="p-2.5 rounded-xl bg-[#1b0830]/80 border border-amber-400/30">
              <span className="font-bold text-amber-300 block mb-0.5">🌈 Rainbow Orb (Match 5)</span>
              Swap with any colored jewel to clear ALL gems of that color from the entire board!
            </div>
            <div className="p-2.5 rounded-xl bg-[#1b0830]/80 border border-amber-400/30">
              <span className="font-bold text-yellow-300 block mb-0.5">✨ Royal Combos</span>
              Swap two boosters together (e.g. Rocket + TNT, Rainbow + Rainbow) for spectacular board-clearing cascades!
            </div>
            <div className="p-2.5 rounded-xl bg-[#1b0830]/80 border border-amber-400/30">
              <span className="font-bold text-amber-300 block mb-0.5">📦 Obstacles</span>
              Break wooden boxes, royal crown chests, and granite stones by matching pieces next to them or using boosters!
            </div>
          </div>
        )}

        {/* Tab 5: Privacy & About */}
        {activeTab === 'privacy' && (
          <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3 text-xs text-purple-200">
            <div className="p-3 rounded-2xl bg-[#1b0830]/80 border border-amber-400/30 flex flex-col gap-1 text-center">
              <div className="font-black text-amber-300 text-sm">Royal Dream Match</div>
              <div>Package: <span className="font-mono text-white">com.royaldream.match</span></div>
              <div>Version 1.0.0 (Capacitor Android)</div>
              <div className="text-[10px] text-purple-300 mt-1">
                Built with Node.js 22 and Java 21. Integrated with Google AdMob & Live OTA Updates.
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#1b0830]/60 border border-purple-800 text-[11px] leading-relaxed">
              <span className="font-bold text-white block mb-1">Privacy & Ad Policy</span>
              Royal Dream Match displays non-intrusive banner advertisements compliant with the Google Play Families Policy. Advertisements do not obstruct puzzle gameplay, and all user game data is stored securely and privately on device via LocalStorage.
            </div>
          </div>
        )}

        {/* Child APK Download Modal */}
        {showApkModal && (
          <ApkDownloadModal onClose={() => setShowApkModal(false)} />
        )}
      </div>
    </div>
  );
};

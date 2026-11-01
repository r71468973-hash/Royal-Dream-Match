/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PlayerState } from '../types/game';
import { sound } from '../game/sound';
import { resetPlayerProgress } from '../game/storage';
import { admobService } from '../services/admobService';
import { AdMobConfig } from '../config/admob';
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
  const [activeTab, setActiveTab] = useState<'settings' | 'admob' | 'rules' | 'privacy'>('settings');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showApkModal, setShowApkModal] = useState(false);
  const [rewardToast, setRewardToast] = useState<string | null>(null);

  // AdMob Config Local State
  const [admobConfig, setAdmobConfig] = useState<AdMobConfig>(() => admobService.getConfig());
  const [saveFeedback, setSaveFeedback] = useState(false);

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

  const handleSaveAdmob = () => {
    sound.playTap();
    admobService.updateConfig(admobConfig);
    setSaveFeedback(true);
    setTimeout(() => setSaveFeedback(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#330f57] via-[#21093b] to-[#140424] border-4 border-amber-400 p-5 shadow-[0_12px_45px_rgba(0,0,0,0.9)] text-white">
        
        {/* Close Button */}
        <button
          onClick={() => {
            sound.playTap();
            onClose();
          }}
          className="absolute -top-3 -right-3 w-9 h-9 rounded-full bg-gradient-to-b from-rose-500 to-rose-700 border-2 border-amber-300 flex items-center justify-center text-white font-black shadow-lg active:scale-95 transition-transform"
        >
          ✕
        </button>

        {/* Modal Title */}
        <div className="text-center mb-3">
          <div className="text-amber-400 text-xs font-black tracking-widest uppercase flex items-center justify-center gap-1">
            <span>👑</span>
            <span>ROYAL COURT SETTINGS</span>
            <span>👑</span>
          </div>
        </div>

        {/* Toast notification for in-modal actions */}
        {rewardToast && (
          <div className="mb-3 py-1.5 px-3 rounded-xl bg-amber-400 text-amber-950 font-black text-xs text-center shadow-lg animate-bounce">
            {rewardToast}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex rounded-xl bg-[#170529]/90 p-1 border border-amber-400/40 mb-4 overflow-x-auto">
          <button
            onClick={() => {
              sound.playTap();
              setActiveTab('settings');
            }}
            className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-black uppercase tracking-wider whitespace-nowrap transition-all ${
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
            className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-black uppercase tracking-wider whitespace-nowrap transition-all ${
              activeTab === 'admob'
                ? 'bg-gradient-to-b from-amber-300 to-yellow-500 text-amber-950 shadow-md'
                : 'text-amber-200/80 hover:text-white'
            }`}
          >
            AdMob & APK
          </button>
          <button
            onClick={() => {
              sound.playTap();
              setActiveTab('rules');
            }}
            className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-black uppercase tracking-wider whitespace-nowrap transition-all ${
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
            className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-black uppercase tracking-wider whitespace-nowrap transition-all ${
              activeTab === 'privacy'
                ? 'bg-gradient-to-b from-amber-300 to-yellow-500 text-amber-950 shadow-md'
                : 'text-amber-200/80 hover:text-white'
            }`}
          >
            About
          </button>
        </div>

        {/* Tab 1: Settings */}
        {activeTab === 'settings' && (
          <div className="flex flex-col gap-3">
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

        {/* Tab 2: AdMob & APK Configuration */}
        {activeTab === 'admob' && (
          <div className="max-h-80 overflow-y-auto pr-1 flex flex-col gap-3 text-xs">
            {/* Quick Download APK button */}
            <button
              onClick={() => {
                sound.playTap();
                setShowApkModal(true);
              }}
              className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 border-2 border-amber-200 text-amber-950 font-black text-xs uppercase tracking-wider shadow active:scale-95 transition-transform flex items-center justify-center gap-1.5"
            >
              <span>📥</span>
              <span>DOWNLOAD ANDROID APK (v1.0.0)</span>
            </button>

            {/* AdMob Mode Switcher */}
            <div className="p-3 rounded-2xl bg-[#1b0830]/80 border border-amber-400/30 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-black text-amber-200 text-xs">AdMob Mode</div>
                  <div className="text-[10px] text-purple-300">
                    {admobConfig.testMode ? 'Using Google Sample Test IDs' : 'Using Live Production IDs'}
                  </div>
                </div>
                <button
                  onClick={() => {
                    sound.playTap();
                    setAdmobConfig(prev => ({ ...prev, testMode: !prev.testMode }));
                  }}
                  className={`px-3 py-1 rounded-full text-[10px] font-black border transition-colors ${
                    admobConfig.testMode
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                      : 'bg-amber-500/20 border-amber-400 text-yellow-300'
                  }`}
                >
                  {admobConfig.testMode ? 'TEST MODE' : 'LIVE MODE'}
                </button>
              </div>

              {/* Test Ad Buttons */}
              <div className="pt-2 border-t border-purple-800/60 flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-amber-300">Test Ad Placements:</span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => {
                      sound.playTap();
                      admobService.showInterstitial();
                    }}
                    className="py-1.5 px-2 rounded-xl bg-purple-900/80 border border-purple-600 text-[10px] font-bold text-amber-200 hover:bg-purple-800"
                  >
                    Test Interstitial
                  </button>
                  <button
                    onClick={() => {
                      sound.playTap();
                      admobService.showRewardedAd(
                        { type: 'coins', amount: 100 },
                        () => {
                          setRewardToast('🎉 Reward Granted: +100 Coins!');
                          setTimeout(() => setRewardToast(null), 3000);
                        }
                      );
                    }}
                    className="py-1.5 px-2 rounded-xl bg-purple-900/80 border border-purple-600 text-[10px] font-bold text-amber-200 hover:bg-purple-800"
                  >
                    Test Rewarded Video
                  </button>
                </div>
              </div>
            </div>

            {/* Custom Ad IDs Configuration Inputs */}
            <div className="p-3 rounded-2xl bg-[#1b0830]/80 border border-amber-400/30 flex flex-col gap-2">
              <span className="font-bold text-amber-300 text-[11px]">Android Ad Unit IDs:</span>
              
              <div className="flex flex-col gap-1">
                <label className="text-[9px] text-purple-300">Banner Unit ID:</label>
                <input
                  type="text"
                  value={admobConfig.banner.android}
                  onChange={(e) => setAdmobConfig(prev => ({
                    ...prev,
                    banner: { ...prev.banner, android: e.target.value }
                  }))}
                  className="px-2 py-1 rounded-lg bg-[#110321] border border-purple-700 text-white font-mono text-[10px]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] text-purple-300">Interstitial Unit ID:</label>
                <input
                  type="text"
                  value={admobConfig.interstitial.android}
                  onChange={(e) => setAdmobConfig(prev => ({
                    ...prev,
                    interstitial: { ...prev.interstitial, android: e.target.value }
                  }))}
                  className="px-2 py-1 rounded-lg bg-[#110321] border border-purple-700 text-white font-mono text-[10px]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] text-purple-300">Rewarded Unit ID:</label>
                <input
                  type="text"
                  value={admobConfig.rewarded.android}
                  onChange={(e) => setAdmobConfig(prev => ({
                    ...prev,
                    rewarded: { ...prev.rewarded, android: e.target.value }
                  }))}
                  className="px-2 py-1 rounded-lg bg-[#110321] border border-purple-700 text-white font-mono text-[10px]"
                />
              </div>

              <button
                onClick={handleSaveAdmob}
                className="mt-1 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow active:scale-95 transition-transform"
              >
                {saveFeedback ? '✓ Settings Saved!' : 'Save AdMob Settings'}
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Rules & Booster Combos */}
        {activeTab === 'rules' && (
          <div className="max-h-72 overflow-y-auto pr-1 flex flex-col gap-2.5 text-xs text-amber-100">
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

        {/* Tab 4: Privacy & About */}
        {activeTab === 'privacy' && (
          <div className="flex flex-col gap-3 text-xs text-purple-200">
            <div className="p-3 rounded-2xl bg-[#1b0830]/80 border border-amber-400/30 flex flex-col gap-1 text-center">
              <div className="font-black text-amber-300 text-sm">Royal Dream Match</div>
              <div>Package: <span className="font-mono text-white">com.royaldream.match</span></div>
              <div>Version 1.0.0 (Capacitor Android)</div>
              <div className="text-[10px] text-purple-300 mt-1">
                Built with Node.js 22 and Java 21. Integrated with Google AdMob & Capacitor Android build engine.
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#1b0830]/60 border border-purple-800 text-[11px] leading-relaxed">
              <span className="font-bold text-white block mb-1">Privacy & Ad Policy</span>
              Royal Dream Match adheres strictly to Google AdMob and Google Play Family policies. Advertisements are non-intrusive, do not obstruct puzzle gameplay, and all user game data is stored securely and privately on device via LocalStorage.
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

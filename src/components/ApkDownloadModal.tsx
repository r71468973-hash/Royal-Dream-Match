/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { sound } from '../game/sound';

interface ApkDownloadModalProps {
  onClose: () => void;
}

export const ApkDownloadModal: React.FC<ApkDownloadModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'build' | 'metadata' | 'assets' | 'policy'>('build');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const gitPushCommand = `git add . && git commit -m "Build Royal Dream Match AAB for Google Play" && git push origin main`;

  const appName = `Royal Dream Match`;
  const shortDesc = `Match sparkling royal gems, unlock magical boosters & conquer 100 royal levels!`;
  const fullDesc = `👑 Welcome to Royal Dream Match – The Ultimate Royal Match-3 Puzzle Adventure! 👑

Step into a magnificent kingdom of shimmering jewels, grand palace ballrooms, and thrilling match-3 puzzles! Swap, match, and blast colorful gems to conquer handcrafted levels, unlock majestic boosters, and claim royal treasures!

Whether you have a few minutes to spare or want to embark on an epic royal journey, Royal Dream Match provides endless fun with smooth touch controls, stunning visual effects, and majestic court music.

✨ GAME FEATURES:

🏰 100+ MAJESTIC HANDCRAFTED LEVELS
Journey through the royal kingdom! Explore the Castle Courtyard, Grand Ballroom, Throne Room, and the Secret Treasure Vault. Each level brings fresh objectives and exciting challenges!

🚀 POWERFUL ROYAL BOOSTERS & COMBOS
• Royal Rocket: Match 4 gems in a line to blast through entire rows or columns!
• TNT Bomb: Match in an L or T shape to trigger a massive 3x3 explosion!
• Rainbow Orb: Match 5 gems to blast all pieces of any chosen color!
• Mega Combos: Combine boosters together for spectacular board-clearing cascades!

📦 EXCITING OBSTACLES & TARGETS
Overcome wooden crates, royal crown chests, and tough granite blocks. Clear the board with clever tactical moves!

🎁 7-DAY DAILY TREASURES & REWARDS
Log in every day to claim free gold coins, rockets, bombs, and magical boosters. Complete the 7-day calendar to win the grand Crown Jackpot!

🎵 MAJESTIC AUDIO & VISUALS
Immerse yourself in rich Renaissance royal melodies, crisp crystal chimes, and smooth gem-swapping animations. Audio toggles are available directly from the HUD.

📶 100% OFFLINE PLAYABLE
No Wi-Fi or internet connection needed! Play anywhere, anytime—on the plane, subway, or in the comfort of your home.

📱 DESIGNED FOR MOBILE
Optimized with smooth cardinal swipe gestures, fast load times, and crystal-clear graphics for all Android phones and tablets.

Download Royal Dream Match today and become the true Crown Master of the Kingdom! 👑💎`;

  const copyToClipboard = (text: string, fieldName: string) => {
    sound.playTap();
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in select-none">
      <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#330f57] via-[#21093b] to-[#140424] border-4 border-amber-400 p-4 sm:p-5 shadow-[0_12px_45px_rgba(0,0,0,0.9)] text-white flex flex-col max-h-[92vh] overflow-hidden">
        
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

        {/* Modal Header */}
        <div className="text-center mb-2.5">
          <div className="inline-block px-3 py-0.5 rounded-full bg-amber-400/20 border border-amber-400 text-amber-300 text-[10px] font-black uppercase tracking-wider mb-1">
            Google Play Publishing Hub
          </div>
          <div className="flex items-center justify-center gap-2">
            <img 
              src="/icon.png" 
              alt="Royal Dream Match Icon" 
              className="w-9 h-9 rounded-xl shadow-md border-2 border-amber-400"
            />
            <h3
              className="text-lg font-black text-amber-300"
              style={{ fontFamily: "'Fredoka', sans-serif" }}
            >
              Royal Dream Match
            </h3>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex rounded-xl bg-[#170529]/90 p-1 border border-amber-400/40 mb-3 overflow-x-auto">
          <button
            onClick={() => {
              sound.playTap();
              setActiveTab('build');
            }}
            className={`flex-1 py-1.5 px-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all ${
              activeTab === 'build'
                ? 'bg-gradient-to-b from-amber-300 to-yellow-500 text-amber-950 shadow-md'
                : 'text-amber-200/80 hover:text-white'
            }`}
          >
            AAB & APK
          </button>
          <button
            onClick={() => {
              sound.playTap();
              setActiveTab('metadata');
            }}
            className={`flex-1 py-1.5 px-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all ${
              activeTab === 'metadata'
                ? 'bg-gradient-to-b from-amber-300 to-yellow-500 text-amber-950 shadow-md'
                : 'text-amber-200/80 hover:text-white'
            }`}
          >
            Listing Text
          </button>
          <button
            onClick={() => {
              sound.playTap();
              setActiveTab('assets');
            }}
            className={`flex-1 py-1.5 px-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all ${
              activeTab === 'assets'
                ? 'bg-gradient-to-b from-amber-300 to-yellow-500 text-amber-950 shadow-md'
                : 'text-amber-200/80 hover:text-white'
            }`}
          >
            Store Art
          </button>
          <button
            onClick={() => {
              sound.playTap();
              setActiveTab('policy');
            }}
            className={`flex-1 py-1.5 px-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all ${
              activeTab === 'policy'
                ? 'bg-gradient-to-b from-amber-300 to-yellow-500 text-amber-950 shadow-md'
                : 'text-amber-200/80 hover:text-white'
            }`}
          >
            Policy
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2.5 text-xs">
          
          {/* TAB 1: AAB & APK */}
          {activeTab === 'build' && (
            <>
              {/* Technical Specs Card */}
              <div className="bg-[#1b0830]/80 rounded-2xl p-2.5 border border-amber-400/30 flex flex-col gap-1.5 text-[11px]">
                <div className="flex justify-between items-center py-0.5 border-b border-purple-800/60">
                  <span className="text-purple-300 font-medium">Bundle (Play Console):</span>
                  <span className="font-mono font-bold text-amber-300">Royal-Dream-Match.aab</span>
                </div>
                <div className="flex justify-between items-center py-0.5 border-b border-purple-800/60">
                  <span className="text-purple-300 font-medium">Standalone APK:</span>
                  <span className="font-mono font-bold text-amber-300">Royal-Dream-Match.apk</span>
                </div>
                <div className="flex justify-between items-center py-0.5 border-b border-purple-800/60">
                  <span className="text-purple-300 font-medium">Package ID:</span>
                  <span className="font-mono font-bold text-yellow-300">com.royaldream.match</span>
                </div>
                <div className="flex justify-between items-center py-0.5 border-b border-purple-800/60">
                  <span className="text-purple-300 font-medium">Version / Code:</span>
                  <span className="font-bold text-white">v1.0.0 (versionCode 1)</span>
                </div>
                <div className="flex justify-between items-center py-0.5 border-b border-purple-800/60">
                  <span className="text-purple-300 font-medium">Target SDK:</span>
                  <span className="font-bold text-emerald-400">Android 15 (API 35)</span>
                </div>
                <div className="flex justify-between items-center py-0.5 border-b border-purple-800/60">
                  <span className="text-purple-300 font-medium">Signing Status:</span>
                  <span className="font-bold text-emerald-400">Production Release (PKCS12)</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-purple-300 font-medium">Key Alias:</span>
                  <span className="font-mono text-purple-200">royaldreammatch</span>
                </div>
              </div>

              {/* Exact File Locations */}
              <div className="bg-[#1b0830]/60 rounded-2xl p-2.5 border border-purple-800/60 flex flex-col gap-1 text-[11px]">
                <span className="font-bold text-amber-300">📂 Play Console Upload File Location:</span>
                <code className="p-1 rounded bg-[#110321] text-amber-200 font-mono text-[10px] break-all border border-purple-800/60">
                  build-artifacts/Royal-Dream-Match.aab
                </code>
                <span className="text-[10px] text-purple-300 mt-1">
                  Or download from GitHub Actions artifact: <strong className="text-white">Royal-Dream-Match-AAB</strong>.
                </span>
              </div>

              {/* Git Trigger Button */}
              <button
                onClick={() => copyToClipboard(gitPushCommand, 'git')}
                className="w-full py-2.5 rounded-xl bg-purple-900/80 hover:bg-purple-800 border border-amber-400/60 text-amber-200 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
              >
                <span>{copiedField === 'git' ? '✓ Command Copied!' : '📋 Copy Git Push Build Command'}</span>
              </button>
            </>
          )}

          {/* TAB 2: METADATA & LISTING TEXTS */}
          {activeTab === 'metadata' && (
            <div className="flex flex-col gap-2">
              {/* App Name */}
              <div className="bg-[#1b0830]/80 rounded-2xl p-2.5 border border-amber-400/30 flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-amber-300 uppercase">App Name (17/30 chars)</span>
                  <button
                    onClick={() => copyToClipboard(appName, 'appName')}
                    className="px-2 py-0.5 rounded bg-amber-400 text-amber-950 font-black text-[9px]"
                  >
                    {copiedField === 'appName' ? 'COPIED!' : 'COPY'}
                  </button>
                </div>
                <div className="text-white font-bold">{appName}</div>
              </div>

              {/* Short Description */}
              <div className="bg-[#1b0830]/80 rounded-2xl p-2.5 border border-amber-400/30 flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-amber-300 uppercase">Short Description (78/80 chars)</span>
                  <button
                    onClick={() => copyToClipboard(shortDesc, 'shortDesc')}
                    className="px-2 py-0.5 rounded bg-amber-400 text-amber-950 font-black text-[9px]"
                  >
                    {copiedField === 'shortDesc' ? 'COPIED!' : 'COPY'}
                  </button>
                </div>
                <div className="text-purple-100 text-[11px]">{shortDesc}</div>
              </div>

              {/* Full Description */}
              <div className="bg-[#1b0830]/80 rounded-2xl p-2.5 border border-amber-400/30 flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-amber-300 uppercase">Full Description</span>
                  <button
                    onClick={() => copyToClipboard(fullDesc, 'fullDesc')}
                    className="px-2 py-0.5 rounded bg-amber-400 text-amber-950 font-black text-[9px]"
                  >
                    {copiedField === 'fullDesc' ? 'COPIED!' : 'COPY FULL TEXT'}
                  </button>
                </div>
                <div className="max-h-28 overflow-y-auto p-1 rounded bg-[#110321] text-[10px] text-purple-200 whitespace-pre-line border border-purple-800/50">
                  {fullDesc}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: STORE ARTWORK */}
          {activeTab === 'assets' && (
            <div className="flex flex-col gap-2.5">
              {/* Feature Graphic */}
              <div className="bg-[#1b0830]/80 rounded-2xl p-2.5 border border-amber-400/30 flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-amber-300 text-[11px]">Feature Graphic (1024 x 500)</span>
                  <a
                    href="/feature_graphic.png"
                    download="feature_graphic_1024x500.png"
                    className="px-2 py-0.5 rounded bg-emerald-600 text-white font-black text-[9px]"
                  >
                    DOWNLOAD
                  </a>
                </div>
                <img
                  src="/feature_graphic.png"
                  alt="Feature Graphic"
                  className="w-full rounded-xl border border-amber-400/50 shadow"
                />
              </div>

              {/* App Icon */}
              <div className="bg-[#1b0830]/80 rounded-2xl p-2.5 border border-amber-400/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src="/icon.png"
                    alt="App Icon"
                    className="w-12 h-12 rounded-xl border border-amber-400 shadow"
                  />
                  <div>
                    <div className="font-bold text-white text-[11px]">High-Res App Icon</div>
                    <div className="text-[10px] text-purple-300">512 x 512 PNG (32-bit)</div>
                  </div>
                </div>
                <a
                  href="/icon.png"
                  download="app_icon_512x512.png"
                  className="px-2 py-1 rounded bg-emerald-600 text-white font-black text-[10px]"
                >
                  DOWNLOAD
                </a>
              </div>

              {/* Screenshots info */}
              <div className="bg-[#1b0830]/60 rounded-2xl p-2 border border-purple-800/60 text-[10px] text-purple-200">
                <strong className="text-amber-300 block mb-0.5">4 Phone Screenshots Generated:</strong>
                Located in <code className="text-amber-200">store_assets/screenshots/</code> (1080x1920 portrait PNGs ready to upload to Play Console).
              </div>
            </div>
          )}

          {/* TAB 4: PRIVACY POLICY & DATA SAFETY */}
          {activeTab === 'policy' && (
            <div className="flex flex-col gap-2.5">
              <div className="bg-[#1b0830]/80 rounded-2xl p-3 border border-amber-400/30 flex flex-col gap-2">
                <div className="font-black text-amber-300 text-xs">Privacy Policy URL</div>
                <p className="text-[11px] text-purple-200 leading-relaxed">
                  Google Play requires a public URL. A complete compliant policy is ready at:
                </p>
                <code className="p-1.5 rounded bg-[#110321] text-amber-200 font-mono text-[10px] border border-purple-800/60">
                  /privacy-policy.html
                </code>
                <a
                  href="/privacy-policy.html"
                  target="_blank"
                  rel="noreferrer"
                  className="py-1.5 rounded-xl bg-purple-900 hover:bg-purple-800 text-amber-200 font-bold text-center text-[11px] border border-purple-600"
                >
                  📄 Open Privacy Policy Page
                </a>
              </div>

              <div className="bg-[#1b0830]/80 rounded-2xl p-3 border border-amber-400/30 flex flex-col gap-1.5 text-[11px]">
                <div className="font-black text-amber-300 text-xs">Data Safety Answers (Google AdMob)</div>
                <div className="flex justify-between py-0.5 border-b border-purple-800/50">
                  <span className="text-purple-300">Data Collected:</span>
                  <span className="font-bold text-white">Device or other IDs (AdMob)</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-purple-800/50">
                  <span className="text-purple-300">Encrypted in transit:</span>
                  <span className="font-bold text-emerald-400">Yes (HTTPS/TLS)</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-purple-800/50">
                  <span className="text-purple-300">Contains Ads:</span>
                  <span className="font-bold text-emerald-400">Yes (Banner, Interstitial & Rewarded)</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-purple-300">Purpose:</span>
                  <span className="font-bold text-white">Advertising (Non-intrusive)</span>
                </div>
                <p className="text-[10px] text-purple-300 mt-1">
                  Step-by-step Play Console guide is in <code className="text-amber-200">store_assets/GOOGLE_PLAY_DATA_SAFETY.md</code>.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer OK Button */}
        <button
          onClick={() => {
            sound.playTap();
            onClose();
          }}
          className="mt-3 w-full py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 font-black text-xs uppercase tracking-wider shadow active:scale-95 transition-transform"
        >
          CLOSE PUBLISHING HUB
        </button>
      </div>
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { sound } from '../game/sound';

interface RoyalAlertModalProps {
  title: string;
  message: string;
  buttonText?: string;
  onConfirm: () => void;
  icon?: string;
  secondaryButtonText?: string;
  onSecondaryAction?: () => void;
}

export const RoyalAlertModal: React.FC<RoyalAlertModalProps> = ({
  title,
  message,
  buttonText = 'OK, GOT IT',
  onConfirm,
  icon = '👑',
  secondaryButtonText,
  onSecondaryAction,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in select-none">
      <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#2e0854] via-[#1c0535] to-[#100220] border-4 border-amber-400 p-6 shadow-[0_16px_40px_rgba(0,0,0,0.9),inset_0_2px_4px_rgba(251,191,36,0.4)] text-white text-center flex flex-col items-center">
        
        {/* Royal Crown Icon Badge */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-700 border-2 border-yellow-200 flex items-center justify-center text-3xl shadow-[0_6px_20px_rgba(245,158,11,0.5)] mb-3">
          {icon}
        </div>

        {/* Title */}
        <h3
          className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-100 drop-shadow mb-2"
          style={{ fontFamily: "'Fredoka', sans-serif" }}
        >
          {title}
        </h3>

        {/* Message */}
        <p className="text-sm text-purple-200/90 leading-relaxed mb-6 font-medium">
          {message}
        </p>

        {/* Buttons */}
        <div className="w-full flex flex-col gap-2.5">
          <button
            onClick={() => {
              sound.playTap();
              onConfirm();
            }}
            className="w-full py-3 rounded-2xl bg-gradient-to-b from-amber-300 via-yellow-500 to-amber-600 text-purple-950 font-black text-sm uppercase tracking-wider border-2 border-yellow-200 shadow-[0_5px_0_#92400e,0_8px_16px_rgba(0,0,0,0.4)] active:translate-y-1 active:shadow-[0_1px_0_#92400e] transition-all"
          >
            {buttonText}
          </button>

          {secondaryButtonText && onSecondaryAction && (
            <button
              onClick={() => {
                sound.playTap();
                onSecondaryAction();
              }}
              className="w-full py-2.5 rounded-2xl bg-purple-900/60 hover:bg-purple-800/80 border border-purple-400/50 text-purple-200 font-bold text-xs uppercase tracking-wider active:scale-95 transition-all"
            >
              {secondaryButtonText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

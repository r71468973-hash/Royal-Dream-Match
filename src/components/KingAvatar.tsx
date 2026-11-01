/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export type KingMood = 'happy' | 'amazed' | 'worried' | 'celebrating' | 'sad';

interface KingAvatarProps {
  mood?: KingMood;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const KingAvatar: React.FC<KingAvatarProps> = ({
  mood = 'happy',
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-20 h-20',
    xl: 'w-28 h-28',
  };

  return (
    <div className={`relative flex-shrink-0 flex items-center justify-center ${sizeClasses[size]} ${className}`}>
      {/* Golden Frame Bevel */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-300 to-amber-700 p-1 shadow-lg">
        <div className="w-full h-full rounded-full bg-gradient-to-b from-blue-900 to-indigo-950 overflow-hidden relative flex items-center justify-center border border-yellow-200/60">
          
          {/* King Leo Graphic */}
          <svg className="w-full h-full transform translate-y-1" viewBox="0 0 100 100" fill="none">
            {/* Royal Robe */}
            <path d="M20 95 C25 68, 75 68, 80 95 Z" fill="#DC2626" />
            <path d="M42 75 L50 95 L58 75 Z" fill="#FFFFFF" />
            <circle cx="50" cy="85" r="4" fill="#EAB308" />

            {/* King Face */}
            <ellipse cx="50" cy="54" rx="22" ry="24" fill="#FBD5B5" />
            {/* Cheeks */}
            <circle cx="36" cy="58" r="4" fill="#F472B6" opacity="0.4" />
            <circle cx="64" cy="58" r="4" fill="#F472B6" opacity="0.4" />

            {/* Eyes */}
            {mood === 'happy' && (
              <>
                <path d="M38 48 Q42 44 46 48" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                <path d="M54 48 Q58 44 62 48" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              </>
            )}
            {mood === 'amazed' && (
              <>
                <circle cx="42" cy="48" r="4.5" fill="#1E293B" />
                <circle cx="41" cy="46" r="1.5" fill="#FFFFFF" />
                <circle cx="58" cy="48" r="4.5" fill="#1E293B" />
                <circle cx="57" cy="46" r="1.5" fill="#FFFFFF" />
              </>
            )}
            {mood === 'worried' && (
              <>
                <ellipse cx="42" cy="50" rx="3.5" ry="4" fill="#1E293B" />
                <ellipse cx="58" cy="50" rx="3.5" ry="4" fill="#1E293B" />
                {/* Sweat drop */}
                <path d="M72 40 C75 44 72 48 70 47 C68 46 69 43 72 40 Z" fill="#38BDF8" />
              </>
            )}
            {mood === 'celebrating' && (
              <>
                <path d="M38 48 Q42 42 46 48" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" fill="none" />
                <path d="M54 48 Q58 42 62 48" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" fill="none" />
              </>
            )}
            {mood === 'sad' && (
              <>
                <path d="M38 47 Q42 51 46 47" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                <path d="M54 47 Q58 51 62 47" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                {/* Tear drops */}
                <ellipse cx="38" cy="58" rx="2" ry="3" fill="#38BDF8" />
                <ellipse cx="62" cy="58" rx="2" ry="3" fill="#38BDF8" />
              </>
            )}

            {/* Mustache & Beard */}
            <path
              d="M32 60 C36 57, 44 58, 50 63 C56 58, 64 57, 68 60 C72 65, 62 72, 50 69 C38 72, 28 65, 32 60 Z"
              fill="#FFFFFF"
              stroke="#E2E8F0"
              strokeWidth="1.5"
            />
            {/* Mouth */}
            {mood === 'amazed' && <ellipse cx="50" cy="65" rx="3.5" ry="4.5" fill="#881337" />}
            {mood === 'happy' && <path d="M47 64 Q50 67 53 64" stroke="#881337" strokeWidth="2" strokeLinecap="round" fill="none" />}
            {mood === 'celebrating' && (
              <path d="M45 63 Q50 69 55 63 Z" fill="#881337" />
            )}
            {mood === 'worried' && <path d="M47 65 Q50 63 53 65" stroke="#881337" strokeWidth="1.5" strokeLinecap="round" fill="none" />}
            {mood === 'sad' && <path d="M46 66 Q50 62 54 66" stroke="#881337" strokeWidth="2" strokeLinecap="round" fill="none" />}

            {/* Royal Golden Crown */}
            <path
              d="M32 36 L30 18 L40 26 L50 14 L60 26 L70 18 L68 36 Z"
              fill="url(#crownGold)"
              stroke="#B45309"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {/* Jewels on Crown */}
            <circle cx="30" cy="18" r="3" fill="#EF4444" stroke="#FFF" strokeWidth="0.8" />
            <circle cx="50" cy="14" r="3.5" fill="#3B82F6" stroke="#FFF" strokeWidth="0.8" />
            <circle cx="70" cy="18" r="3" fill="#10B981" stroke="#FFF" strokeWidth="0.8" />
            <circle cx="50" cy="30" r="2.5" fill="#EF4444" />

            <defs>
              <linearGradient id="crownGold" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FEF08A" />
                <stop offset="50%" stopColor="#EAB308" />
                <stop offset="100%" stopColor="#CA8A04" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    </div>
  );
};

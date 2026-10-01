import React from 'react';
import { DIFFICULTY_LEVELS } from '../constants/defaultData.js';

export function DifficultyBadge({ difficulty = 1, showStars = true, size = 'md' }) {
  const config = DIFFICULTY_LEVELS[difficulty] || DIFFICULTY_LEVELS[1];

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5'
  }[size] || 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border shadow-xs ${config.bg} ${config.text} ${config.border} ${sizeClasses}`}
      title={`Difficulty ${difficulty}/5: ${config.label}`}
    >
      <span className="font-semibold">Diff {difficulty}</span>
      <span className="opacity-80">·</span>
      <span>{config.label}</span>
      {showStars && (
        <span className="tracking-tight text-[11px] opacity-90 font-mono">
          {config.stars}
        </span>
      )}
    </span>
  );
}

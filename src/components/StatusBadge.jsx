import React from 'react';
import { CheckCircle2, Clock, CalendarOff } from 'lucide-react';

export function StatusBadge({ status, size = 'md' }) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5 font-semibold'
  }[size] || 'text-xs px-2.5 py-1';

  if (status === 'DONE') {
    return (
      <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-emerald-100/80 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 ${sizeClasses}`}>
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 stroke-[2.5]" />
        DONE
      </span>
    );
  }

  if (status === 'ON_LEAVE' || status === 'LEAVE') {
    return (
      <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-purple-100/90 text-purple-800 border border-purple-300 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800 ${sizeClasses}`}>
        <CalendarOff className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
        ON LEAVE
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-amber-100/90 text-amber-800 border border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800 ${sizeClasses}`}>
      <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
      PENDING
    </span>
  );
}

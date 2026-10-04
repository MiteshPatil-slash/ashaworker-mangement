import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function PriorityBadge({ level, showIcon = true, className = '' }) {
  let bg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let label = 'Normal Protocol';
  let icon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;

  if (level === 'HIGH_PRIORITY' || level === 'URGENT' || level === 'HIGH') {
    bg = 'bg-rose-50 text-rose-700 border-rose-200';
    label = 'High Priority (Alert)';
    icon = <AlertCircle className="w-3.5 h-3.5 text-rose-600" />;
  } else if (level === 'NEEDS_FOLLOW_UP' || level === 'WARNING' || level === 'OVERDUE') {
    bg = 'bg-amber-50 text-amber-700 border-amber-200';
    label = 'Needs Follow-up';
    icon = <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${bg} ${className}`}
      title="Administrative clinical-protocol indicator (Not an AI medical diagnosis)"
    >
      {showIcon && icon}
      <span>{label}</span>
    </span>
  );
}

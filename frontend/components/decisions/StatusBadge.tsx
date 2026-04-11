// components/decisions/StatusBadge.tsx
import { DecisionStatus } from '@/lib/api';

interface StatusBadgeProps {
  status: DecisionStatus;
}

const statusConfig = {
  PROPOSED: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    label: 'Proposed'
  },
  ACCEPTED: {
    bg: 'bg-green-100', 
    text: 'text-green-800',
    label: 'Accepted'
  },
  SUPERSEDED: {
    bg: 'bg-amber-100',
    text: 'text-amber-800', 
    label: 'Superseded'
  },
  DEPRECATED: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    label: 'Deprecated'
  }
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}

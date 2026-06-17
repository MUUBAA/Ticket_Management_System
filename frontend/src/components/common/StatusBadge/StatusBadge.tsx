import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
  className?: string;
}

const statusConfig: Record<string, { bg: string; text: string; icon: string }> = {
  open: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    icon: '📥',
  },
  in_progress: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-700',
    icon: '🔄',
  },
  on_hold: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-700',
    icon: '⏸️',
  },
  closed: {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    icon: '🔒',
  },
};

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  className = '',
}) => {
  const config = statusConfig[status?.toLowerCase()] || {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    icon: '⚪',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${config.bg} ${config.text} ${sizeClasses[size]} ${className}`}
    >
      <span className="text-xs">{config.icon}</span>
      <span className="capitalize">{status?.replace('_', ' ')}</span>
    </span>
  );
};

export default StatusBadge;

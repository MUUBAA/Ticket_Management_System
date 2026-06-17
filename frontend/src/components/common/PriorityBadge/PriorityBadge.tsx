import React from 'react';

interface PriorityBadgeProps {
  priority: string;
  size?: 'sm' | 'md';
  className?: string;
}

const priorityConfig: Record<string, { bg: string; text: string; icon: string }> = {
  low: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    icon: '🟢',
  },
  medium: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-700',
    icon: '🟡',
  },
  high: {
    bg: 'bg-orange-100',
    text: 'text-orange-700',
    icon: '🟠',
  },
  urgent: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    icon: '🔴',
  },
  critical: {
    bg: 'bg-purple-100',
    text: 'text-purple-700',
    icon: '🟣',
  },
};

const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  size = 'md',
  className = '',
}) => {
  const config = priorityConfig[priority?.toLowerCase()] || {
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
      <span className="capitalize">{priority}</span>
    </span>
  );
};

export default PriorityBadge;

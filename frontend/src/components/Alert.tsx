import React from 'react';
import './Alert.css';

export interface AlertProps {
  children: React.ReactNode;
  variant?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  onClose?: () => void;
  className?: string;
}

const Alert: React.FC<AlertProps> = ({
  children,
  variant = 'info',
  title,
  onClose,
  className = '',
}) => {
  const alertClasses = [
    'alert',
    `alert-${variant}`,
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={alertClasses} role="alert">
      {title && <div className="alert-title">{title}</div>}
      <div className="alert-content">{children}</div>
      {onClose && (
        <button className="alert-close-btn" onClick={onClose}>
          ✕
        </button>
      )}
    </div>
  );
};

export default Alert;

import React from 'react';
import './Card.css';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  footer?: React.ReactNode;
  padding?: 'none' | 'small' | 'medium' | 'large';
  hoverable?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  title,
  subtitle,
  footer,
  padding = 'medium',
  hoverable = false,
}) => {
  const paddingClasses = {
    none: 'card-padding-none',
    small: 'card-padding-small',
    medium: 'card-padding-medium',
    large: 'card-padding-large',
  };

  const cardClasses = [
    'card',
    hoverable ? 'card-hoverable' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClasses}>
      {(title || subtitle) && (
        <div className="card-header">
          {title && <h3 className="card-title">{title}</h3>}
          {subtitle && <p className="card-subtitle">{subtitle}</p>}
        </div>
      )}
      <div className={`card-body ${paddingClasses[padding]}`}>
        {children}
      </div>
      {footer && (
        <div className="card-footer">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;

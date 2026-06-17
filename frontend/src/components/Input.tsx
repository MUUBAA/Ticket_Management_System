import React from 'react';
import './Input.css';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  icon,
  id,
  className = '',
  ...props
}) => {
  const inputClasses = [
    'input',
    error ? 'input-error' : '',
    icon ? 'input-with-icon' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className="input-wrapper">
      {label && (
        <label htmlFor={id} className="input-label">
          {label}
        </label>
      )}
      <div className="input-container">
        {icon && <span className="input-icon">{icon}</span>}
        <input
          id={id}
          className={inputClasses}
          aria-invalid={!!error}
          aria-describedby={error || helperText ? `${id}-error` : undefined}
          {...props}
        />
      </div>
      {(error || helperText) && (
        <span className={`input-hint ${error ? 'input-hint-error' : ''}`} id={`${id}-error`}>
          {error || helperText}
        </span>
      )}
    </div>
  );
};

export default Input;

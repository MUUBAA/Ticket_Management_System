import React from 'react';
import './Select.css';

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
}

const Select: React.FC<SelectProps> = ({
  label,
  error,
  helperText,
  options,
  placeholder = 'Select an option',
  id,
  className = '',
  ...props
}) => {
  const selectClasses = [
    'select',
    error ? 'select-error' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className="select-wrapper">
      {label && (
        <label htmlFor={id} className="select-label">
          {label}
        </label>
      )}
      <div className="select-container">
        <select
          id={id}
          className={selectClasses}
          aria-invalid={!!error}
          aria-describedby={error || helperText ? `${id}-error` : undefined}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      {(error || helperText) && (
        <span className={`select-hint ${error ? 'select-hint-error' : ''}`} id={`${id}-error`}>
          {error || helperText}
        </span>
      )}
    </div>
  );
};

export default Select;

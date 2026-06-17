import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      icon,
      iconPosition = 'left',
      fullWidth = false,
      children,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const baseClasses =
      'font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2';

    const variantClasses = {
      primary:
        'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 hover:shadow-lg hover:scale-105',
      secondary:
        'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-400',
      ghost:
        'bg-transparent text-indigo-600 hover:bg-indigo-50 focus:ring-indigo-500',
      danger:
        'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 hover:shadow-lg',
    };

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    const widthClasses = fullWidth ? 'w-full' : '';

    const finalClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClasses} ${className}`;

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={finalClasses}
        {...props}
      >
        <div className="flex items-center justify-center gap-2">
          {isLoading && (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
          )}
          {icon && iconPosition === 'left' && !isLoading && <span>{icon}</span>}
          {children}
          {icon && iconPosition === 'right' && !isLoading && <span>{icon}</span>}
        </div>
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;

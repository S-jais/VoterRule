import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  className = '',
  ...props
}) => {
  const sizeClasses = {
    sm: 'btn-sm',
    md: 'min-h-[44px] px-4 py-2 text-sm',
    lg: 'min-h-[48px] px-5 py-2.5 text-base',
  };

  const variantClasses = {
    primary: 'btn-primary shadow-sm',
    secondary: 'btn-secondary',
    outline: 'btn-outline shadow-sm',
    danger: 'bg-red-700 hover:bg-red-800 text-white border border-transparent shadow-sm',
    ghost: 'btn-ghost',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`btn ${sizeClasses[size]} ${variantClasses[variant]} disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-1.5" />
      ) : null}
      {children}
    </button>
  );
};

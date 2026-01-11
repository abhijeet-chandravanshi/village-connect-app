import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  saffron: 'btn-saffron',
  ghost: 'px-4 py-2 text-earth-600 hover:bg-cream-100 rounded-lg transition-colors',
  danger: 'inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-all duration-200',
  link: 'text-primary-600 hover:text-primary-700 underline-offset-4 hover:underline',
};

const sizes = {
  sm: 'text-sm px-3 py-1.5',
  md: '', // default
  lg: 'text-lg px-8 py-4',
};

const Button = forwardRef(({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className = '',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  ...props 
}, ref) => {
  return (
    <button
      ref={ref}
      className={`${variants[variant]} ${sizes[size]} ${className} ${
        disabled || loading ? 'opacity-60 cursor-not-allowed' : ''
      }`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <>
          {leftIcon && <span>{leftIcon}</span>}
          {children}
          {rightIcon && <span>{rightIcon}</span>}
        </>
      )}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;


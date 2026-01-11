import { forwardRef } from 'react';

const Input = forwardRef(({ 
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className = '',
  ...props 
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-earth-700 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-earth-400">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          className={`
            input-field
            ${leftIcon ? 'pl-10' : ''}
            ${rightIcon ? 'pr-10' : ''}
            ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : ''}
            ${className}
          `}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-earth-400">
            {rightIcon}
          </div>
        )}
      </div>
      {(error || helperText) && (
        <p className={`mt-1.5 text-sm ${error ? 'text-red-600' : 'text-earth-500'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;


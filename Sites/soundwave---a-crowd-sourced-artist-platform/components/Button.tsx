import React from 'react';

// FIX: Add `size` prop to ButtonProps to allow for different button sizes and fix the compilation error.
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  isLoading?: boolean;
  size?: 'sm' | 'md';
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', isLoading = false, size = 'md', className, ...props }) => {
  // FIX: Padding is now controlled by size variants, so it's removed from baseClasses.
  const baseClasses = "rounded-full font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center";
  
  const variantClasses = {
    primary: 'bg-brand-accent hover:bg-brand-accent-hover text-white focus:ring-brand-accent',
    secondary: 'bg-gray-700 hover:bg-gray-600 text-white focus:ring-gray-500'
  };

  // FIX: Added sizeClasses to provide styling for different button sizes.
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-6 py-2'
  };

  return (
    <button className={[baseClasses, variantClasses[variant], sizeClasses[size], className].filter(Boolean).join(' ')} disabled={isLoading} {...props}>
      {isLoading ? (
         <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : children}
    </button>
  );
};

export default Button;
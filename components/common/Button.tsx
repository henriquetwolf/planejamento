
import React, { ButtonHTMLAttributes } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost';
    isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({ children, className = '', variant = 'primary', isLoading = false, ...props }) => {
    const baseStyles = 'inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100';

    const variantStyles = {
        primary: 'text-white bg-teal-600 hover:bg-teal-700 focus:ring-teal-500',
        secondary: 'text-teal-700 bg-teal-100 hover:bg-teal-200 focus:ring-teal-500',
        ghost: 'text-gray-600 bg-transparent hover:bg-gray-100 focus:ring-gray-400',
    };

    return (
        <button
            className={`${baseStyles} ${variantStyles[variant]} ${className}`}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading ? <LoadingSpinner /> : children}
        </button>
    );
};

export default Button;

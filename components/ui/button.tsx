import React from 'react';

type ButtonProps = {
  children: any;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
};

export const Button = ({ children, className, ...props }: ButtonProps) => {
  return (
    <button
      className={`px-4 py-2 rounded font-bold text-white transition-colors ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

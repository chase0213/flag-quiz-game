import React from 'react';

type CardProps = {
  children: any;
  className?: string;
};

export const Card = ({ children, className, ...props }: CardProps) => {
  return (
    <div
      className={`bg-white rounded-lg shadow-md p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
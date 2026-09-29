import React from 'react';
import clsx from 'clsx';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'rectangular' | 'circular';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'rectangular',
  width,
  height,
  style,
  ...props
}) => {
  const variantStyles = {
    text: 'rounded-md h-4 my-1',
    rectangular: 'rounded-md',
    circular: 'rounded-full',
  };

  return (
    <div
      aria-hidden="true"
      className={clsx(
        'animate-pulse bg-slate-200/75',
        variantStyles[variant],
        className
      )}
      style={{
        width,
        height,
        ...style,
      }}
      {...props}
    />
  );
};

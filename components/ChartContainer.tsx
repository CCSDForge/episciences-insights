'use client';

import React, { useSyncExternalStore, ReactNode } from 'react';
import { ResponsiveContainer, ResponsiveContainerProps } from 'recharts';

const emptySubscribe = () => () => {};

export default function ChartContainer({
  children,
  width = '100%',
  height = '100%',
  minWidth = 0,
  minHeight = 0,
  className,
  ...props
}: ResponsiveContainerProps & { children: ReactNode }) {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  if (!mounted) {
    return <div className={`w-full h-full min-w-0 min-h-0 ${className || ''}`} />;
  }

  return (
    <ResponsiveContainer
      width={width}
      height={height}
      minWidth={minWidth}
      minHeight={minHeight}
      className={className}
      {...props}
    >
      {children}
    </ResponsiveContainer>
  );
}

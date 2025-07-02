import React from "react";
import SkeletonLib from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  count?: number;
  circle?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

function Skeleton({ width, height, count = 1, circle = false, className, style }: SkeletonProps) {
  return (
    <SkeletonLib
      width={width}
      height={height}
      count={count}
      circle={circle}
      className={className}
      style={style}
      baseColor="#e5e7eb" // Tailwind bg-gray-200
      highlightColor="#f3f4f6" // Tailwind bg-gray-100
    />
  );
}

export { Skeleton }

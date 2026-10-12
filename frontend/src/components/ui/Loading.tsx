import React from "react";
import { Loader2 } from "lucide-react";

export interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = "md",
  className = "",
  label,
}) => {
  const sizeStyles = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-2 ${className}`}>
      <Loader2 className={`${sizeStyles[size]} animate-spin text-emerald-600 dark:text-emerald-400`} />
      {label && <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>}
    </div>
  );
};

export interface LoadingProps extends SpinnerProps {
  text?: string;
}

export const Loading: React.FC<LoadingProps> = ({ text, label, ...props }) => {
  return <Spinner label={text || label} {...props} />;
};


export const Skeleton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = "",
  ...props
}) => {
  return (
    <div
      className={`animate-pulse bg-slate-200 dark:bg-slate-800 rounded-md ${className}`}
      {...props}
    />
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="pt-2 flex justify-between">
        <Skeleton className="h-8 w-24 rounded-lg" />
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>
    </div>
  );
};

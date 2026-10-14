import React from "react";
import { AlertCircle, RotateCcw, X } from "lucide-react";
import { Button } from "./Button";

export interface ErrorBannerProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({
  title = "Something went wrong",
  message,
  onRetry,
  onDismiss,
  actionLabel,
  onAction,
  className = "",
}) => {
  return (
    <div
      className={`rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 p-4 flex items-start gap-3 relative ${className}`}
    >
      <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
      <div className="flex-1 pr-6">
        <h5 className="text-sm font-semibold text-rose-900 dark:text-rose-200">
          {title}
        </h5>
        <p className="mt-0.5 text-xs text-rose-700 dark:text-rose-300">
          {message}
        </p>
        {(onRetry || (actionLabel && onAction)) && (
          <div className="mt-2.5 flex items-center gap-2">
            {onRetry && (
              <Button
                size="sm"
                variant="outline"
                className="border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/40"
                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                onClick={onRetry}
              >
                Retry
              </Button>
            )}
            {actionLabel && onAction && (
              <Button
                size="sm"
                className="bg-rose-600 hover:bg-rose-700 text-white"
                onClick={onAction}
              >
                {actionLabel}
              </Button>
            )}
          </div>
        )}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="absolute top-3 right-3 text-rose-500 hover:text-rose-700 dark:hover:text-rose-300 transition-colors p-1 rounded-md"
          title="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};


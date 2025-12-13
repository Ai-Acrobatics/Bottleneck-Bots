import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cva, type VariantProps } from "class-variance-authority";
import { Check, AlertCircle, Loader2, Clock } from "lucide-react";

import { cn } from "@/lib/utils";

// Step status type
export type StepStatus = "pending" | "in-progress" | "completed" | "error";

// Step interface
export interface ProgressStep {
  id: string;
  label: string;
  description?: string;
  status: StepStatus;
}

// Progress variants
const progressVariants = cva(
  "relative h-2 w-full overflow-hidden rounded-full transition-all duration-300",
  {
    variants: {
      variant: {
        default: "bg-primary/20",
        success: "bg-green-500/20",
        warning: "bg-amber-500/20",
        error: "bg-destructive/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const progressIndicatorVariants = cva(
  "h-full w-full flex-1 transition-all duration-500 ease-out",
  {
    variants: {
      variant: {
        default: "bg-primary",
        success: "bg-green-500",
        warning: "bg-amber-500",
        error: "bg-destructive",
      },
      animated: {
        true: "animate-pulse",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      animated: false,
    },
  }
);

// Simple progress bar component
interface ProgressBarProps
  extends React.ComponentProps<typeof ProgressPrimitive.Root>,
    VariantProps<typeof progressVariants> {
  value?: number;
  animated?: boolean;
  indeterminate?: boolean;
  showPercentage?: boolean;
}

function ProgressBar({
  className,
  value,
  variant,
  animated = false,
  indeterminate = false,
  showPercentage = false,
  ...props
}: ProgressBarProps) {
  const displayValue = indeterminate ? undefined : value;

  return (
    <div className="w-full space-y-2">
      <ProgressPrimitive.Root
        data-slot="progress"
        className={cn(progressVariants({ variant }), className)}
        value={displayValue}
        {...props}
      >
        {indeterminate ? (
          <div
            className={cn(
              progressIndicatorVariants({ variant }),
              "absolute inset-0 animate-[progress-indeterminate_1.5s_ease-in-out_infinite]"
            )}
            style={{
              width: "40%",
            }}
          />
        ) : (
          <ProgressPrimitive.Indicator
            data-slot="progress-indicator"
            className={cn(
              progressIndicatorVariants({ variant, animated })
            )}
            style={{ transform: `translateX(-${100 - (displayValue || 0)}%)` }}
          />
        )}
      </ProgressPrimitive.Root>
      {showPercentage && !indeterminate && (
        <div className="text-sm text-muted-foreground text-right" aria-live="polite">
          {Math.round(displayValue || 0)}%
        </div>
      )}
    </div>
  );
}

// Multi-step progress component
interface MultiStepProgressProps {
  steps: ProgressStep[];
  currentStep?: number;
  variant?: "default" | "success" | "warning" | "error";
  showStepNumbers?: boolean;
  orientation?: "horizontal" | "vertical";
  className?: string;
}

function MultiStepProgress({
  steps,
  currentStep = 0,
  variant = "default",
  showStepNumbers = true,
  orientation = "horizontal",
  className,
}: MultiStepProgressProps) {
  const completedSteps = steps.filter((s) => s.status === "completed").length;
  const progress = (completedSteps / steps.length) * 100;

  const getStepIcon = (step: ProgressStep, index: number) => {
    switch (step.status) {
      case "completed":
        return <Check className="size-4" aria-label="Completed" />;
      case "error":
        return <AlertCircle className="size-4" aria-label="Error" />;
      case "in-progress":
        return <Loader2 className="size-4 animate-spin" aria-label="In progress" />;
      default:
        return showStepNumbers ? (
          <span className="text-xs font-medium">{index + 1}</span>
        ) : null;
    }
  };

  const getStepColor = (step: ProgressStep) => {
    switch (step.status) {
      case "completed":
        return "bg-green-500 text-white border-green-500";
      case "error":
        return "bg-destructive text-white border-destructive";
      case "in-progress":
        return "bg-primary text-primary-foreground border-primary";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  if (orientation === "vertical") {
    return (
      <div className={cn("space-y-4", className)} role="list" aria-label="Progress steps">
        {steps.map((step, index) => (
          <div key={step.id} className="flex gap-4" role="listitem">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300",
                  getStepColor(step)
                )}
                aria-current={step.status === "in-progress" ? "step" : undefined}
              >
                {getStepIcon(step, index)}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "w-0.5 flex-1 min-h-[24px] transition-all duration-300",
                    step.status === "completed"
                      ? "bg-green-500"
                      : "bg-border"
                  )}
                />
              )}
            </div>
            <div className="flex-1 pb-4">
              <div className="font-medium text-sm">{step.label}</div>
              {step.description && (
                <div className="text-sm text-muted-foreground mt-1">
                  {step.description}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("w-full space-y-6", className)} role="list" aria-label="Progress steps">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center gap-2 flex-1" role="listitem">
              <div
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300",
                  getStepColor(step)
                )}
                aria-current={step.status === "in-progress" ? "step" : undefined}
              >
                {getStepIcon(step, index)}
              </div>
              <div className="text-center">
                <div className="font-medium text-sm">{step.label}</div>
                {step.description && (
                  <div className="text-xs text-muted-foreground mt-1 max-w-[120px]">
                    {step.description}
                  </div>
                )}
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "h-0.5 flex-1 transition-all duration-300 mx-2",
                  step.status === "completed" ? "bg-green-500" : "bg-border"
                )}
                role="presentation"
              />
            )}
          </React.Fragment>
        ))}
      </div>
      <ProgressBar value={progress} variant={variant} />
    </div>
  );
}

// Progress with time estimation
interface ProgressWithTimeProps extends ProgressBarProps {
  timeRemaining?: number; // in seconds
  timeElapsed?: number; // in seconds
  showTime?: boolean;
}

function ProgressWithTime({
  timeRemaining,
  timeElapsed,
  showTime = true,
  ...props
}: ProgressWithTimeProps) {
  const formatTime = (seconds: number) => {
    if (seconds < 60) {
      return `${Math.round(seconds)}s`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const secs = Math.round(seconds % 60);
      return secs > 0 ? `${minutes}m ${secs}s` : `${minutes}m`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
  };

  return (
    <div className="w-full space-y-2">
      <ProgressBar {...props} />
      {showTime && (
        <div
          className="flex items-center justify-between text-sm text-muted-foreground"
          aria-live="polite"
        >
          {timeElapsed !== undefined && (
            <div className="flex items-center gap-1.5">
              <Clock className="size-3.5" />
              <span>Elapsed: {formatTime(timeElapsed)}</span>
            </div>
          )}
          {timeRemaining !== undefined && (
            <div className="flex items-center gap-1.5 ml-auto">
              <Clock className="size-3.5" />
              <span>~{formatTime(timeRemaining)} remaining</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Indeterminate progress (loading spinner mode)
interface IndeterminateProgressProps {
  label?: string;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "success" | "warning" | "error";
  className?: string;
}

function IndeterminateProgress({
  label,
  size = "default",
  variant = "default",
  className,
}: IndeterminateProgressProps) {
  const sizeClasses = {
    sm: "size-4",
    default: "size-6",
    lg: "size-8",
  };

  const colorClasses = {
    default: "text-primary",
    success: "text-green-500",
    warning: "text-amber-500",
    error: "text-destructive",
  };

  return (
    <div
      className={cn("flex items-center gap-3", className)}
      role="status"
      aria-live="polite"
    >
      <Loader2
        className={cn(
          "animate-spin shrink-0",
          sizeClasses[size],
          colorClasses[variant]
        )}
        aria-label="Loading"
      />
      {label && (
        <span className="text-sm text-muted-foreground">{label}</span>
      )}
    </div>
  );
}

export {
  ProgressBar,
  MultiStepProgress,
  ProgressWithTime,
  IndeterminateProgress,
  progressVariants,
  progressIndicatorVariants,
  type ProgressBarProps,
  type MultiStepProgressProps,
  type ProgressWithTimeProps,
  type IndeterminateProgressProps,
};

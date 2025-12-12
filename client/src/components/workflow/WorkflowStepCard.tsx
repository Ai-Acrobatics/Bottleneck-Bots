import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  ChevronDown,
  ChevronRight,
  Navigation,
  MousePointerClick,
  Eye,
  FileOutput,
  Timer,
  GitBranch,
  Repeat,
  Globe,
  Bell,
  AlertCircle,
} from 'lucide-react';

// ============================================
// TYPE DEFINITIONS
// ============================================

export type WorkflowStepType =
  | 'navigate'
  | 'act'
  | 'observe'
  | 'extract'
  | 'wait'
  | 'condition'
  | 'loop'
  | 'apiCall'
  | 'notification';

export type StepStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';

export interface StepResult {
  /** Index of the step in the workflow */
  stepIndex: number;
  /** Type of workflow step */
  type: WorkflowStepType;
  /** Whether the step completed successfully */
  success: boolean;
  /** Result data from the step execution */
  result?: unknown;
  /** Error message if the step failed */
  error?: string;
  /** Timestamp when the step completed */
  timestamp?: Date;
  /** Duration in milliseconds */
  duration?: number;
}

export interface WorkflowStepCardProps {
  /** Unique identifier for the step */
  stepIndex: number;
  /** Type of workflow step */
  stepType: WorkflowStepType;
  /** Human-readable label for the step */
  label?: string;
  /** Current execution status */
  status: StepStatus;
  /** Step configuration summary */
  configSummary?: string;
  /** Execution result data */
  result?: StepResult;
  /** Whether the card is initially expanded */
  defaultExpanded?: boolean;
  /** Callback when step is clicked */
  onClick?: (stepIndex: number) => void;
  /** Callback when retry is requested */
  onRetry?: (stepIndex: number) => void;
  /** Additional CSS classes */
  className?: string;
  /** Show step number badge */
  showStepNumber?: boolean;
  /** Compact display mode */
  compact?: boolean;
}

// ============================================
// CONSTANTS
// ============================================

const STEP_ICONS: Record<WorkflowStepType, React.ElementType> = {
  navigate: Navigation,
  act: MousePointerClick,
  observe: Eye,
  extract: FileOutput,
  wait: Timer,
  condition: GitBranch,
  loop: Repeat,
  apiCall: Globe,
  notification: Bell,
};

const STEP_LABELS: Record<WorkflowStepType, string> = {
  navigate: 'Navigate',
  act: 'Action',
  observe: 'Observe',
  extract: 'Extract Data',
  wait: 'Wait',
  condition: 'Condition',
  loop: 'Loop',
  apiCall: 'API Call',
  notification: 'Notification',
};

const STATUS_CONFIG: Record<StepStatus, {
  icon: React.ElementType;
  color: string;
  bgColor: string;
  label: string;
}> = {
  pending: {
    icon: Clock,
    color: 'text-muted-foreground',
    bgColor: 'bg-muted',
    label: 'Pending',
  },
  running: {
    icon: Loader2,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    label: 'Running',
  },
  completed: {
    icon: CheckCircle2,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    label: 'Completed',
  },
  failed: {
    icon: XCircle,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    label: 'Failed',
  },
  skipped: {
    icon: AlertCircle,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    label: 'Skipped',
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Format duration in milliseconds to human-readable string
 */
function formatDuration(ms?: number): string {
  if (ms === undefined || ms === null) return '-';
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
}

/**
 * Safely stringify result data for display
 */
function formatResultData(data: unknown): string {
  if (data === undefined || data === null) return 'No data';
  if (typeof data === 'string') return data;
  try {
    return JSON.stringify(data, null, 2);
  } catch {
    return String(data);
  }
}

// ============================================
// COMPONENT
// ============================================

export const WorkflowStepCard: React.FC<WorkflowStepCardProps> = ({
  stepIndex,
  stepType,
  label,
  status,
  configSummary,
  result,
  defaultExpanded = false,
  onClick,
  onRetry,
  className,
  showStepNumber = true,
  compact = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const StepIcon = STEP_ICONS[stepType] || AlertCircle;
  const statusConfig = STATUS_CONFIG[status];
  const StatusIcon = statusConfig.icon;
  const displayLabel = label || STEP_LABELS[stepType];

  const handleClick = useCallback(() => {
    onClick?.(stepIndex);
  }, [onClick, stepIndex]);

  const handleRetry = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onRetry?.(stepIndex);
  }, [onRetry, stepIndex]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.(stepIndex);
    }
  }, [onClick, stepIndex]);

  const hasResultData = result?.result !== undefined || result?.error !== undefined;

  // Compact mode for inline lists
  if (compact) {
    return (
      <div
        role="listitem"
        aria-label={`Step ${stepIndex + 1}: ${displayLabel} - ${statusConfig.label}`}
        className={cn(
          'flex items-center gap-3 p-2 rounded-lg transition-colors',
          statusConfig.bgColor,
          onClick && 'cursor-pointer hover:opacity-80',
          className
        )}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={onClick ? 0 : undefined}
      >
        {showStepNumber && (
          <span className="text-xs font-medium text-muted-foreground w-5">
            {stepIndex + 1}
          </span>
        )}
        <StepIcon className={cn('h-4 w-4', statusConfig.color)} aria-hidden="true" />
        <span className="flex-1 text-sm font-medium truncate">{displayLabel}</span>
        <StatusIcon
          className={cn(
            'h-4 w-4',
            statusConfig.color,
            status === 'running' && 'animate-spin'
          )}
          aria-hidden="true"
        />
        {result?.duration !== undefined && (
          <span className="text-xs text-muted-foreground">
            {formatDuration(result.duration)}
          </span>
        )}
      </div>
    );
  }

  // Full card mode
  return (
    <Card
      className={cn(
        'transition-all duration-200',
        status === 'running' && 'ring-2 ring-blue-500/50',
        status === 'failed' && 'border-red-500/50',
        onClick && 'cursor-pointer hover:shadow-md',
        className
      )}
      role="article"
      aria-label={`Workflow step ${stepIndex + 1}: ${displayLabel}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={onClick ? 0 : undefined}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {showStepNumber && (
              <Badge variant="outline" className="h-6 w-6 p-0 justify-center">
                {stepIndex + 1}
              </Badge>
            )}
            <div className={cn('p-2 rounded-lg', statusConfig.bgColor)}>
              <StepIcon
                className={cn('h-4 w-4', statusConfig.color)}
                aria-hidden="true"
              />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold">{displayLabel}</CardTitle>
              {configSummary && (
                <CardDescription className="text-xs mt-0.5 line-clamp-1">
                  {configSummary}
                </CardDescription>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {result?.duration !== undefined && (
              <span
                className="text-xs text-muted-foreground"
                aria-label={`Duration: ${formatDuration(result.duration)}`}
              >
                {formatDuration(result.duration)}
              </span>
            )}
            <Badge
              variant={status === 'failed' ? 'destructive' : 'secondary'}
              className={cn('gap-1', statusConfig.bgColor, statusConfig.color)}
            >
              <StatusIcon
                className={cn('h-3 w-3', status === 'running' && 'animate-spin')}
                aria-hidden="true"
              />
              {statusConfig.label}
            </Badge>
          </div>
        </div>
      </CardHeader>

      {hasResultData && (
        <CardContent className="pt-0">
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
                aria-expanded={isExpanded}
                aria-controls={`step-${stepIndex}-details`}
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                )}
                {isExpanded ? 'Hide Details' : 'Show Details'}
              </Button>
            </CollapsibleTrigger>

            <CollapsibleContent id={`step-${stepIndex}-details`}>
              <div className="mt-2 space-y-2">
                {result?.error && (
                  <div
                    className="p-3 rounded-lg bg-red-500/10 border border-red-500/20"
                    role="alert"
                  >
                    <p className="text-sm font-medium text-red-500 mb-1">Error</p>
                    <p className="text-xs text-red-400 font-mono whitespace-pre-wrap">
                      {result.error}
                    </p>
                  </div>
                )}

                {result?.result !== undefined && (
                  <div className="p-3 rounded-lg bg-muted">
                    <p className="text-sm font-medium mb-1">Result</p>
                    <pre className="text-xs text-muted-foreground font-mono whitespace-pre-wrap max-h-48 overflow-auto">
                      {formatResultData(result.result)}
                    </pre>
                  </div>
                )}

                {result?.timestamp && (
                  <p className="text-xs text-muted-foreground">
                    Completed at:{' '}
                    {new Date(result.timestamp).toLocaleTimeString()}
                  </p>
                )}

                {status === 'failed' && onRetry && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRetry}
                    className="mt-2"
                    aria-label={`Retry step ${stepIndex + 1}`}
                  >
                    Retry Step
                  </Button>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      )}
    </Card>
  );
};

WorkflowStepCard.displayName = 'WorkflowStepCard';

export default WorkflowStepCard;

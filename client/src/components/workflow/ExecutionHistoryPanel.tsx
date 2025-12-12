import React, { useState, useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Eye,
  RotateCw,
  Search,
  X,
} from 'lucide-react';

// ============================================
// TYPE DEFINITIONS
// ============================================

export type ExecutionStatus = 'completed' | 'failed' | 'cancelled' | 'running';

export interface ExecutionHistoryItem {
  id: number;
  workflowId: number;
  workflowName: string;
  status: ExecutionStatus;
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
  stepsCompleted: number;
  stepsTotal: number;
  error?: string;
}

export interface ExecutionHistoryPanelProps {
  workflowId?: number;
  limit?: number;
  onViewExecution?: (executionId: number) => void;
  onRerunExecution?: (executionId: number) => void;
  className?: string;
}

// ============================================
// CONSTANTS
// ============================================

const STATUS_CONFIG: Record<ExecutionStatus, {
  icon: React.ElementType;
  color: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info';
  label: string;
}> = {
  completed: {
    icon: CheckCircle2,
    color: 'text-green-600',
    variant: 'success',
    label: 'Completed',
  },
  failed: {
    icon: XCircle,
    color: 'text-red-600',
    variant: 'destructive',
    label: 'Failed',
  },
  cancelled: {
    icon: AlertCircle,
    color: 'text-amber-600',
    variant: 'warning',
    label: 'Cancelled',
  },
  running: {
    icon: Loader2,
    color: 'text-blue-600',
    variant: 'info',
    label: 'Running',
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
  if (ms < 60000) return `${(ms / 1000).toFixed(0)}s`;
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
}

/**
 * Format date to relative time string
 */
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
}

/**
 * Truncate text with ellipsis
 */
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

// ============================================
// COMPONENT
// ============================================

export const ExecutionHistoryPanel: React.FC<ExecutionHistoryPanelProps> = ({
  workflowId,
  limit = 50,
  onViewExecution,
  onRerunExecution,
  className,
}) => {
  // State
  const [executions] = useState<ExecutionHistoryItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<ExecutionStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [displayCount, setDisplayCount] = useState(limit);
  const [rerunDialogOpen, setRerunDialogOpen] = useState(false);
  const [selectedExecutionId, setSelectedExecutionId] = useState<number | null>(null);

  // Filter and search logic
  const filteredExecutions = useMemo(() => {
    let filtered = executions;

    // Filter by workflow ID if provided
    if (workflowId !== undefined) {
      filtered = filtered.filter((ex) => ex.workflowId === workflowId);
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((ex) => ex.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((ex) =>
        ex.workflowName.toLowerCase().includes(query)
      );
    }

    // Sort by started date (newest first)
    filtered.sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());

    return filtered;
  }, [executions, workflowId, statusFilter, searchQuery]);

  // Paginated executions
  const displayedExecutions = useMemo(() => {
    return filteredExecutions.slice(0, displayCount);
  }, [filteredExecutions, displayCount]);

  const hasMore = filteredExecutions.length > displayCount;

  // Handlers
  const handleLoadMore = useCallback(() => {
    setDisplayCount((prev) => prev + limit);
  }, [limit]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  const handleViewExecution = useCallback((executionId: number) => {
    onViewExecution?.(executionId);
  }, [onViewExecution]);

  const handleRerunClick = useCallback((executionId: number) => {
    setSelectedExecutionId(executionId);
    setRerunDialogOpen(true);
  }, []);

  const handleRerunConfirm = useCallback(() => {
    if (selectedExecutionId !== null) {
      onRerunExecution?.(selectedExecutionId);
    }
    setRerunDialogOpen(false);
    setSelectedExecutionId(null);
  }, [selectedExecutionId, onRerunExecution]);

  const handleRerunCancel = useCallback(() => {
    setRerunDialogOpen(false);
    setSelectedExecutionId(null);
  }, []);

  // Empty states
  const showEmptyState = executions.length === 0;
  const showNoResults = !showEmptyState && filteredExecutions.length === 0;

  return (
    <>
      <Card
        className={cn('w-full', className)}
        role="region"
        aria-label="Execution History"
      >
        <CardHeader>
          <CardTitle>Execution History</CardTitle>
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <Input
                type="search"
                role="searchbox"
                placeholder="Search workflows..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-9"
                aria-label="Search workflows"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleClearSearch}
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </Button>
              )}
            </div>

            {/* Status Filter */}
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as ExecutionStatus | 'all')}
            >
              <SelectTrigger className="w-full sm:w-48" aria-label="Filter by status">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="running">Running</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          {/* Results Count */}
          <div className="mb-4" role="status" aria-live="polite">
            <p className="text-sm text-muted-foreground">
              {showNoResults
                ? 'No matching executions found'
                : `Showing ${displayedExecutions.length} ${displayedExecutions.length === 1 ? 'execution' : 'executions'}`}
            </p>
          </div>

          {/* Empty State */}
          {showEmptyState && (
            <div className="text-center py-12">
              <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground/50" aria-hidden="true" />
              <h3 className="mt-4 text-lg font-semibold">
                {workflowId
                  ? 'No executions found for this workflow'
                  : 'No workflow executions found'}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {workflowId
                  ? 'This workflow has not been executed yet.'
                  : 'Start running workflows to see execution history here.'}
              </p>
            </div>
          )}

          {/* No Results State */}
          {showNoResults && (
            <div className="text-center py-12">
              <Search className="mx-auto h-12 w-12 text-muted-foreground/50" aria-hidden="true" />
              <h3 className="mt-4 text-lg font-semibold">No matching executions found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Try adjusting your filters or search query.
              </p>
            </div>
          )}

          {/* Execution Table */}
          {!showEmptyState && !showNoResults && (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Workflow</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Started</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Steps</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedExecutions.map((execution) => {
                    const statusConfig = STATUS_CONFIG[execution.status];
                    const StatusIcon = statusConfig.icon;
                    const canRerun = execution.status === 'completed' || execution.status === 'failed';

                    return (
                      <TableRow key={execution.id}>
                        <TableCell className="font-medium">
                          <div className="max-w-xs">
                            <span title={execution.workflowName}>
                              {truncateText(execution.workflowName, 40)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={statusConfig.variant}
                            className="gap-1"
                            aria-label={`Status: ${statusConfig.label}`}
                          >
                            <StatusIcon
                              className={cn('h-3 w-3', execution.status === 'running' && 'animate-spin')}
                              aria-hidden="true"
                            />
                            {statusConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {formatRelativeTime(execution.startedAt)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {formatDuration(execution.duration)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {execution.stepsCompleted}/{execution.stepsTotal}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewExecution(execution.id)}
                              aria-label={`View details for ${execution.workflowName}`}
                            >
                              <Eye className="h-4 w-4 mr-1" aria-hidden="true" />
                              View Details
                            </Button>
                            {canRerun && onRerunExecution && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRerunClick(execution.id)}
                                aria-label={`Re-run ${execution.workflowName}`}
                              >
                                <RotateCw className="h-4 w-4 mr-1" aria-hidden="true" />
                                Re-run
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Load More Button */}
          {hasMore && (
            <div className="mt-4 text-center">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={!hasMore}
                aria-label="Load more executions"
              >
                Load More
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Re-run Confirmation Dialog */}
      <AlertDialog open={rerunDialogOpen} onOpenChange={setRerunDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Re-run</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to re-run this workflow execution? This will start a new execution with the same configuration.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleRerunCancel}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRerunConfirm}>Re-run Workflow</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

ExecutionHistoryPanel.displayName = 'ExecutionHistoryPanel';

export default ExecutionHistoryPanel;

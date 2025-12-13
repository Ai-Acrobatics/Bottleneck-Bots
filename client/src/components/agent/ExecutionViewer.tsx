/**
 * ExecutionViewer Component
 *
 * Real-time execution viewer for agent tasks with the following features:
 * - Live step-by-step execution tracking
 * - Collapsible step details with input/output data
 * - Status indicators (pending, running, completed, error)
 * - Time elapsed per step
 * - Log streaming with auto-scroll
 * - Copy logs/output functionality
 * - Log filtering by level (info, debug, warning, error)
 * - Integration with SSE events
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAgentStore, LogEntry } from '@/stores/agentStore';
import { AgentExecution, ThinkingStep } from '@/types/agent';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  Filter,
  Terminal,
  Brain,
  Wrench,
  CircleDot,
} from 'lucide-react';

interface ExecutionViewerProps {
  execution?: AgentExecution;
  thinkingSteps?: ThinkingStep[];
  className?: string;
  showFilters?: boolean;
  autoScroll?: boolean;
  maxHeight?: string;
}

type LogLevel = 'all' | 'info' | 'success' | 'warning' | 'error' | 'system';

export function ExecutionViewer({
  execution,
  thinkingSteps = [],
  className = '',
  showFilters = true,
  autoScroll = true,
  maxHeight = '600px',
}: ExecutionViewerProps) {
  const { logs } = useAgentStore();
  const [selectedLogLevel, setSelectedLogLevel] = useState<LogLevel>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const prevLogsLength = useRef(logs.length);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (autoScroll && logs.length > prevLogsLength.current && scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
    prevLogsLength.current = logs.length;
  }, [logs.length, autoScroll]);

  // Filter logs by level
  const filteredLogs = useMemo(() => {
    if (selectedLogLevel === 'all') {
      return logs;
    }
    return logs.filter((log) => log.level === selectedLogLevel);
  }, [logs, selectedLogLevel]);

  // Toggle step expansion
  const toggleStep = (stepId: string) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId);
    } else {
      newExpanded.add(stepId);
    }
    setExpandedSteps(newExpanded);
  };

  // Expand all steps
  const expandAll = () => {
    const allStepIds = new Set([...thinkingSteps.map((s) => s.id), ...logs.map((l) => l.id)]);
    setExpandedSteps(allStepIds);
  };

  // Collapse all steps
  const collapseAll = () => {
    setExpandedSteps(new Set());
  };

  // Copy to clipboard
  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Get status color
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'planning':
        return 'bg-blue-500 text-white';
      case 'executing':
        return 'bg-yellow-500 text-white';
      case 'completed':
        return 'bg-green-500 text-white';
      case 'failed':
        return 'bg-red-500 text-white';
      case 'cancelled':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-gray-400 text-white';
    }
  };

  // Get log level color
  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'info':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'success':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'system':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Get step icon
  const getStepIcon = (type: string, status?: string) => {
    if (status === 'completed') {
      return <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />;
    }
    if (status === 'failed') {
      return <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />;
    }
    if (status === 'in_progress') {
      return <Loader2 className="h-4 w-4 text-blue-500 animate-spin flex-shrink-0" />;
    }

    switch (type) {
      case 'thinking':
        return <Brain className="h-4 w-4 text-purple-500 flex-shrink-0" />;
      case 'tool_use':
      case 'tool_result':
        return <Wrench className="h-4 w-4 text-blue-500 flex-shrink-0" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />;
      case 'plan':
        return <Terminal className="h-4 w-4 text-indigo-500 flex-shrink-0" />;
      default:
        return <CircleDot className="h-4 w-4 text-gray-400 flex-shrink-0" />;
    }
  };

  // Format duration
  const formatDuration = (ms?: number) => {
    if (!ms) return '--';
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              <Terminal className="h-5 w-5" />
              Execution Viewer
              {execution && (
                <Badge className={getStatusColor(execution.status)}>
                  {execution.status}
                </Badge>
              )}
            </CardTitle>
            {execution && (
              <CardDescription className="mt-2">
                <div className="space-y-1">
                  <div className="font-medium text-gray-900">{execution.task}</div>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Started: {new Date(execution.createdAt).toLocaleTimeString()}
                    </span>
                    {execution.metadata?.duration && (
                      <span>Duration: {formatDuration(execution.metadata.duration)}</span>
                    )}
                    {execution.metadata?.tokensUsed && (
                      <span>Tokens: {execution.metadata.tokensUsed.toLocaleString()}</span>
                    )}
                  </div>
                </div>
              </CardDescription>
            )}
          </div>
          {showFilters && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={expandAll}>
                Expand All
              </Button>
              <Button variant="outline" size="sm" onClick={collapseAll}>
                Collapse All
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Log Level Filter */}
        {showFilters && (
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select value={selectedLogLevel} onValueChange={(value) => setSelectedLogLevel(value as LogLevel)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-gray-500">
              {filteredLogs.length} {filteredLogs.length === 1 ? 'entry' : 'entries'}
            </span>
          </div>
        )}

        {/* Execution Plan */}
        {execution?.plan && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Terminal className="h-4 w-4" />
              Execution Plan
            </h4>
            <div className="space-y-2">
              {execution.plan.phases.map((phase, idx) => (
                <div
                  key={phase.id}
                  className={`p-3 rounded-lg border ${
                    phase.status === 'in_progress'
                      ? 'border-blue-300 bg-blue-50'
                      : phase.status === 'completed'
                      ? 'border-green-300 bg-green-50'
                      : phase.status === 'failed'
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {getStepIcon('plan', phase.status)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h5 className="text-sm font-medium">
                          Phase {idx + 1}: {phase.name}
                        </h5>
                        {phase.progress !== undefined && (
                          <Badge variant="outline" className="text-xs">
                            {phase.progress}%
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{phase.description}</p>
                      {phase.steps && phase.steps.length > 0 && (
                        <ul className="mt-2 space-y-1">
                          {phase.steps.map((step, stepIdx) => (
                            <li key={stepIdx} className="text-xs text-gray-600 flex items-center gap-2">
                              <div className="h-1 w-1 rounded-full bg-gray-400 flex-shrink-0" />
                              <span>{step}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {execution?.plan && <Separator />}

        {/* Thinking Steps */}
        {thinkingSteps.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Thinking Steps ({thinkingSteps.length})
            </h4>
            <ScrollArea className="rounded-lg border" style={{ height: maxHeight }} ref={scrollAreaRef}>
              <div className="p-4 space-y-2">
                {thinkingSteps.map((step) => (
                  <Collapsible
                    key={step.id}
                    open={expandedSteps.has(step.id)}
                    onOpenChange={() => toggleStep(step.id)}
                  >
                    <div className="rounded-lg border bg-white p-3">
                      <CollapsibleTrigger className="w-full">
                        <div className="flex items-start gap-2 text-left">
                          {getStepIcon(step.type)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-xs">
                                {step.type}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {new Date(step.timestamp).toLocaleTimeString()}
                              </span>
                              {step.metadata?.duration && (
                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatDuration(step.metadata.duration)}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-900 break-words">{step.content}</p>
                            {step.toolName && (
                              <div className="mt-1 text-xs text-gray-500">
                                Tool: <code className="font-mono bg-gray-100 px-1 rounded">{step.toolName}</code>
                              </div>
                            )}
                          </div>
                          {expandedSteps.has(step.id) ? (
                            <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          )}
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="mt-3 space-y-2 border-t pt-3">
                          {step.toolParams && (
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-semibold text-gray-700">Input Parameters</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 px-2"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyToClipboard(JSON.stringify(step.toolParams, null, 2), `${step.id}-params`);
                                  }}
                                >
                                  {copiedId === `${step.id}-params` ? (
                                    <Check className="h-3 w-3 text-green-500" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </Button>
                              </div>
                              <pre className="text-xs bg-gray-900 text-gray-100 p-2 rounded overflow-x-auto">
                                {JSON.stringify(step.toolParams, null, 2)}
                              </pre>
                            </div>
                          )}
                          {step.toolResult && (
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-semibold text-gray-700">Output Result</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 px-2"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyToClipboard(
                                      typeof step.toolResult === 'string'
                                        ? step.toolResult
                                        : JSON.stringify(step.toolResult, null, 2),
                                      `${step.id}-result`
                                    );
                                  }}
                                >
                                  {copiedId === `${step.id}-result` ? (
                                    <Check className="h-3 w-3 text-green-500" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </Button>
                              </div>
                              <pre className="text-xs bg-gray-900 text-gray-100 p-2 rounded overflow-x-auto">
                                {typeof step.toolResult === 'string'
                                  ? step.toolResult
                                  : JSON.stringify(step.toolResult, null, 2)}
                              </pre>
                            </div>
                          )}
                          {step.metadata?.error && (
                            <div>
                              <span className="text-xs font-semibold text-red-700">Error</span>
                              <pre className="text-xs bg-red-50 text-red-900 p-2 rounded border border-red-200 mt-1">
                                {step.metadata.error}
                              </pre>
                            </div>
                          )}
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Logs */}
        {filteredLogs.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Terminal className="h-4 w-4" />
              Logs ({filteredLogs.length})
            </h4>
            <ScrollArea className="rounded-lg border" style={{ height: maxHeight }} ref={scrollAreaRef}>
              <div className="p-4 space-y-2">
                {filteredLogs.map((log) => (
                  <Collapsible
                    key={log.id}
                    open={expandedSteps.has(log.id)}
                    onOpenChange={() => toggleStep(log.id)}
                  >
                    <div className={`rounded-lg border p-3 ${getLogLevelColor(log.level)}`}>
                      <CollapsibleTrigger className="w-full">
                        <div className="flex items-start gap-2 text-left">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-xs">
                                {log.level}
                              </Badge>
                              <span className="text-xs opacity-75">{log.timestamp}</span>
                            </div>
                            <p className="text-sm font-medium break-words">{log.message}</p>
                          </div>
                          {log.detail && (
                            <>
                              {expandedSteps.has(log.id) ? (
                                <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0" />
                              ) : (
                                <ChevronRight className="h-4 w-4 opacity-50 flex-shrink-0" />
                              )}
                            </>
                          )}
                        </div>
                      </CollapsibleTrigger>
                      {log.detail && (
                        <CollapsibleContent>
                          <div className="mt-2 pt-2 border-t border-current/20">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-semibold">Details</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyToClipboard(log.detail || '', `${log.id}-detail`);
                                }}
                              >
                                {copiedId === `${log.id}-detail` ? (
                                  <Check className="h-3 w-3" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </Button>
                            </div>
                            <pre className="text-xs opacity-90 whitespace-pre-wrap break-words">
                              {log.detail}
                            </pre>
                          </div>
                        </CollapsibleContent>
                      )}
                    </div>
                  </Collapsible>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Empty State */}
        {!execution && thinkingSteps.length === 0 && filteredLogs.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Terminal className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-sm">No execution data available</p>
            <p className="text-xs mt-1">Start an agent task to see real-time execution details</p>
          </div>
        )}

        {/* Execution Result */}
        {execution?.result && (
          <>
            <Separator />
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Execution Result
                </h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    copyToClipboard(
                      typeof execution.result === 'string'
                        ? execution.result
                        : JSON.stringify(execution.result, null, 2),
                      'result'
                    )
                  }
                >
                  {copiedId === 'result' ? (
                    <>
                      <Check className="h-4 w-4 mr-1 text-green-500" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <pre className="text-xs bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                {typeof execution.result === 'string'
                  ? execution.result
                  : JSON.stringify(execution.result, null, 2)}
              </pre>
            </div>
          </>
        )}

        {/* Execution Error */}
        {execution?.error && (
          <>
            <Separator />
            <div>
              <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
                <XCircle className="h-4 w-4 text-red-500" />
                Error
              </h4>
              <pre className="text-xs bg-red-50 text-red-900 p-4 rounded-lg border border-red-200">
                {execution.error}
              </pre>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  CheckCircle,
  Circle,
  XCircle,
  Clock,
  ChevronDown,
  ChevronRight,
  Play,
  MousePointer,
  Type,
  Eye,
  Download,
} from 'lucide-react';
import { useState } from 'react';

export interface ExecutionStep {
  id: string;
  stepNumber: number;
  action: string;
  actionType: 'navigate' | 'click' | 'type' | 'extract' | 'observe' | 'wait' | 'screenshot';
  target?: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  duration?: number;
  timestamp?: string;
  screenshot?: string;
  error?: string;
  result?: any;
}

interface StepTimelineProps {
  steps: ExecutionStep[];
  className?: string;
}

export function StepTimeline({ steps, className = '' }: StepTimelineProps) {
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

  const toggleStep = (stepId: string) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId);
    } else {
      newExpanded.add(stepId);
    }
    setExpandedSteps(newExpanded);
  };

  const getStatusConfig = (status: ExecutionStep['status']) => {
    switch (status) {
      case 'pending':
        return {
          icon: Circle,
          color: 'text-slate-400',
          bgColor: 'bg-slate-100',
          borderColor: 'border-slate-200',
        };
      case 'running':
        return {
          icon: Play,
          color: 'text-blue-500',
          bgColor: 'bg-blue-100',
          borderColor: 'border-blue-300',
        };
      case 'completed':
        return {
          icon: CheckCircle,
          color: 'text-green-500',
          bgColor: 'bg-green-100',
          borderColor: 'border-green-300',
        };
      case 'failed':
        return {
          icon: XCircle,
          color: 'text-red-500',
          bgColor: 'bg-red-100',
          borderColor: 'border-red-300',
        };
      default:
        return {
          icon: Circle,
          color: 'text-slate-400',
          bgColor: 'bg-slate-100',
          borderColor: 'border-slate-200',
        };
    }
  };

  const getActionIcon = (actionType: ExecutionStep['actionType']) => {
    switch (actionType) {
      case 'navigate':
        return Eye;
      case 'click':
        return MousePointer;
      case 'type':
        return Type;
      case 'extract':
        return Download;
      case 'observe':
        return Eye;
      case 'wait':
        return Clock;
      case 'screenshot':
        return Download;
      default:
        return Circle;
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Execution Timeline
          <Badge variant="outline" className="ml-auto">
            {steps.filter(s => s.status === 'completed').length} / {steps.length} completed
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <div className="relative space-y-2">
            {/* Timeline connector line */}
            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-slate-200" />

            {steps.map((step, index) => {
              const statusConfig = getStatusConfig(step.status);
              const StatusIcon = statusConfig.icon;
              const ActionIcon = getActionIcon(step.actionType);
              const isExpanded = expandedSteps.has(step.id);

              return (
                <div key={step.id} className="relative pl-12">
                  {/* Status indicator circle */}
                  <div
                    className={`absolute left-0 top-3 w-10 h-10 rounded-full border-2 ${statusConfig.borderColor} ${statusConfig.bgColor} flex items-center justify-center z-10`}
                  >
                    <StatusIcon className={`h-5 w-5 ${statusConfig.color}`} />
                  </div>

                  <Collapsible open={isExpanded} onOpenChange={() => toggleStep(step.id)}>
                    <CollapsibleTrigger className="w-full">
                      <div
                        className={`p-3 rounded-lg border ${statusConfig.borderColor} bg-white hover:shadow-md transition-shadow cursor-pointer`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2 flex-1">
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 text-slate-400 mt-1 flex-shrink-0" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-slate-400 mt-1 flex-shrink-0" />
                            )}
                            <div className="flex-1 text-left">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="text-xs">
                                  Step {step.stepNumber}
                                </Badge>
                                <ActionIcon className="h-3 w-3 text-slate-500" />
                                <span className="text-xs font-medium text-slate-600">
                                  {step.actionType}
                                </span>
                              </div>
                              <p className="text-sm font-medium">{step.action}</p>
                              {step.target && (
                                <p className="text-xs text-slate-500 mt-1 truncate">
                                  {step.target}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-1">
                            <Badge
                              variant={step.status === 'completed' ? 'default' : 'secondary'}
                              className={`text-xs ${statusConfig.color}`}
                            >
                              {step.status}
                            </Badge>
                            {step.duration && (
                              <span className="text-xs text-slate-500">
                                {formatDuration(step.duration)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <div className="mt-2 p-4 bg-slate-50 rounded-lg border border-slate-200">
                        {/* Timestamp */}
                        {step.timestamp && (
                          <div className="mb-3">
                            <span className="text-xs font-medium text-slate-600">Timestamp:</span>
                            <p className="text-xs text-slate-500 mt-1">
                              {new Date(step.timestamp).toLocaleString()}
                            </p>
                          </div>
                        )}

                        {/* Error */}
                        {step.error && (
                          <div className="mb-3">
                            <span className="text-xs font-medium text-red-600">Error:</span>
                            <p className="text-xs text-red-500 mt-1 font-mono bg-red-50 p-2 rounded">
                              {step.error}
                            </p>
                          </div>
                        )}

                        {/* Result */}
                        {step.result && (
                          <div className="mb-3">
                            <span className="text-xs font-medium text-slate-600">Result:</span>
                            <pre className="text-xs text-slate-700 mt-1 bg-white p-2 rounded border overflow-x-auto">
                              {JSON.stringify(step.result, null, 2)}
                            </pre>
                          </div>
                        )}

                        {/* Screenshot */}
                        {step.screenshot && (
                          <div>
                            <span className="text-xs font-medium text-slate-600 mb-2 block">
                              Screenshot:
                            </span>
                            <img
                              src={step.screenshot}
                              alt={`Step ${step.stepNumber} screenshot`}
                              className="w-full rounded border border-slate-200 cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => window.open(step.screenshot, '_blank')}
                            />
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

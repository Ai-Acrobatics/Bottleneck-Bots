import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { trpc } from '@/lib/trpc';
import type { WorkflowNode, WorkflowEdge } from '@/types/workflow';

interface TestRunDialogProps {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

interface StepResult {
  stepIndex: number;
  type: string;
  success: boolean;
  result?: any;
  error?: string;
  timestamp: Date;
  duration?: number;
}

interface TestRunResult {
  status: 'completed' | 'failed' | 'running';
  stepResults: StepResult[];
  output?: {
    extractedData?: any[];
    finalVariables?: Record<string, any>;
    duration?: number;
  };
  error?: string;
}

export const TestRunDialog: React.FC<TestRunDialogProps> = ({
  nodes,
  edges,
  open,
  onOpenChange,
  trigger,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [stepByStep, setStepByStep] = useState(false);
  const [newVarName, setNewVarName] = useState('');
  const [newVarValue, setNewVarValue] = useState('');
  const [testResult, setTestResult] = useState<TestRunResult | null>(null);
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set());

  const testRunMutation = trpc.workflows.testRun.useMutation();

  const handleOpen = (open: boolean) => {
    setIsOpen(open);
    onOpenChange?.(open);

    // Reset state when closing
    if (!open) {
      setTestResult(null);
      setVariables({});
      setStepByStep(false);
    }
  };

  const handleAddVariable = () => {
    if (newVarName.trim() && newVarValue.trim()) {
      setVariables({ ...variables, [newVarName.trim()]: newVarValue.trim() });
      setNewVarName('');
      setNewVarValue('');
    }
  };

  const handleRemoveVariable = (key: string) => {
    const newVars = { ...variables };
    delete newVars[key];
    setVariables(newVars);
  };

  const handleTestRun = async () => {
    if (nodes.length === 0) {
      return;
    }

    // Convert ReactFlow nodes to workflow steps format
    const steps = nodes.map((node, index) => ({
      type: node.data.type,
      order: index,
      config: {
        ...node.data,
        continueOnError: node.data.errorHandling?.continueOnError || false,
      },
    }));

    try {
      const result = await testRunMutation.mutateAsync({
        steps: steps as any,
        variables,
        stepByStep,
      });

      setTestResult(result as any);
    } catch (error) {
      console.error('Test run failed:', error);
      setTestResult({
        status: 'failed',
        stepResults: [],
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const toggleStepExpanded = (stepIndex: number) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepIndex)) {
      newExpanded.delete(stepIndex);
    } else {
      newExpanded.add(stepIndex);
    }
    setExpandedSteps(newExpanded);
  };

  const getStepStatusIcon = (step: StepResult) => {
    if (step.success) {
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    }
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getStepStatusBadge = (step: StepResult) => {
    if (step.success) {
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Success</Badge>;
    }
    return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Failed</Badge>;
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return 'N/A';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const isRunning = testRunMutation.isPending;
  const hasResults = testResult !== null;

  return (
    <Dialog open={open ?? isOpen} onOpenChange={handleOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Test Run Workflow</DialogTitle>
          <DialogDescription>
            Test your workflow without saving it. Configure variables and view step-by-step execution results.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6 py-4">
            {/* Variables Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Variables</Label>
                <Badge variant="secondary">{Object.keys(variables).length} variables</Badge>
              </div>

              {Object.entries(variables).length > 0 && (
                <div className="space-y-2">
                  {Object.entries(variables).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2 p-2 bg-muted rounded-md">
                      <div className="flex-1">
                        <span className="font-mono text-sm font-semibold">{key}</span>
                        <span className="text-muted-foreground mx-2">=</span>
                        <span className="font-mono text-sm">{value}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveVariable(key)}
                        disabled={isRunning}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="Variable name"
                    value={newVarName}
                    onChange={(e) => setNewVarName(e.target.value)}
                    disabled={isRunning}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddVariable();
                      }
                    }}
                  />
                </div>
                <div className="flex-1">
                  <Input
                    placeholder="Value"
                    value={newVarValue}
                    onChange={(e) => setNewVarValue(e.target.value)}
                    disabled={isRunning}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddVariable();
                      }
                    }}
                  />
                </div>
                <Button onClick={handleAddVariable} disabled={isRunning || !newVarName || !newVarValue}>
                  Add
                </Button>
              </div>
            </div>

            <Separator />

            {/* Options Section */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Options</Label>
              <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                <div className="space-y-0.5">
                  <Label htmlFor="step-by-step" className="text-sm font-medium">Step-by-Step Mode</Label>
                  <p className="text-xs text-muted-foreground">
                    Add delays between steps for easier debugging
                  </p>
                </div>
                <Switch
                  id="step-by-step"
                  checked={stepByStep}
                  onCheckedChange={setStepByStep}
                  disabled={isRunning}
                />
              </div>
            </div>

            {/* Test Results Section */}
            {(hasResults || isRunning) && (
              <>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">Execution Results</Label>
                    {testResult?.output?.duration && (
                      <Badge variant="secondary" className="gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDuration(testResult.output.duration)}
                      </Badge>
                    )}
                  </div>

                  {isRunning && (
                    <Alert>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <AlertDescription>
                        Running workflow... This may take a few moments.
                      </AlertDescription>
                    </Alert>
                  )}

                  {testResult?.error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{testResult.error}</AlertDescription>
                    </Alert>
                  )}

                  {testResult && testResult.stepResults.length > 0 && (
                    <div className="space-y-2">
                      {testResult.stepResults.map((step, index) => (
                        <div key={index} className="border rounded-lg">
                          <button
                            onClick={() => toggleStepExpanded(step.stepIndex)}
                            className="w-full p-3 flex items-center gap-3 hover:bg-muted/50 transition-colors"
                          >
                            {expandedSteps.has(step.stepIndex) ? (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            )}
                            {getStepStatusIcon(step)}
                            <div className="flex-1 text-left">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">Step {step.stepIndex + 1}</span>
                                <Badge variant="outline" className="text-xs">{step.type}</Badge>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {step.duration && (
                                <Badge variant="secondary" className="text-xs gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatDuration(step.duration)}
                                </Badge>
                              )}
                              {getStepStatusBadge(step)}
                            </div>
                          </button>

                          {expandedSteps.has(step.stepIndex) && (
                            <div className="border-t p-3 bg-muted/30 space-y-3">
                              {step.error && (
                                <div className="space-y-1">
                                  <Label className="text-xs font-semibold text-red-600">Error</Label>
                                  <pre className="text-xs bg-red-50 p-2 rounded border border-red-200 overflow-x-auto">
                                    {step.error}
                                  </pre>
                                </div>
                              )}

                              {step.result && (
                                <div className="space-y-1">
                                  <Label className="text-xs font-semibold">Result</Label>
                                  <pre className="text-xs bg-background p-2 rounded border overflow-x-auto max-h-48">
                                    {JSON.stringify(step.result, null, 2)}
                                  </pre>
                                </div>
                              )}

                              <div className="space-y-1">
                                <Label className="text-xs font-semibold">Timestamp</Label>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(step.timestamp).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {testResult?.output?.finalVariables && Object.keys(testResult.output.finalVariables).length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Final Variables</Label>
                      <pre className="text-xs bg-muted p-3 rounded border overflow-x-auto max-h-48">
                        {JSON.stringify(testResult.output.finalVariables, null, 2)}
                      </pre>
                    </div>
                  )}

                  {testResult?.output?.extractedData && testResult.output.extractedData.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Extracted Data</Label>
                      <pre className="text-xs bg-muted p-3 rounded border overflow-x-auto max-h-48">
                        {JSON.stringify(testResult.output.extractedData, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </ScrollArea>

        <Separator />

        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {nodes.length} node{nodes.length !== 1 ? 's' : ''} in workflow
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleOpen(false)} disabled={isRunning}>
              Close
            </Button>
            <Button onClick={handleTestRun} disabled={isRunning || nodes.length === 0}>
              {isRunning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Run Test
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

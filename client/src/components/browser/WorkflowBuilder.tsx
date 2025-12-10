/**
 * WorkflowBuilder Component
 * Visual workflow creator with drag-and-drop nodes and step configuration
 * Features: node creation, connections, parameter config, template save/load
 */

import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Plus,
  Save,
  FolderOpen,
  Play,
  Trash2,
  Copy,
  Settings,
  Navigation,
  MousePointerClick,
  Eye,
  Download,
  Clock,
  Code,
  ArrowRight,
  GripVertical,
  MoreVertical,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import type { WorkflowStep, WorkflowTemplate, WorkflowStepType } from './types';

interface WorkflowBuilderProps {
  initialTemplate?: WorkflowTemplate;
  onSave?: (template: WorkflowTemplate) => void;
  onExecute?: (template: WorkflowTemplate) => void;
  onLoad?: () => void;
}

const STEP_TYPE_CONFIG: Record<
  WorkflowStepType,
  { icon: React.ElementType; label: string; color: string; description: string }
> = {
  navigate: {
    icon: Navigation,
    label: 'Navigate',
    color: 'bg-blue-500',
    description: 'Navigate to a URL',
  },
  act: {
    icon: MousePointerClick,
    label: 'Act',
    color: 'bg-green-500',
    description: 'Perform an action (click, type, etc.)',
  },
  observe: {
    icon: Eye,
    label: 'Observe',
    color: 'bg-purple-500',
    description: 'Observe page state or element',
  },
  extract: {
    icon: Download,
    label: 'Extract',
    color: 'bg-orange-500',
    description: 'Extract data from page',
  },
  wait: {
    icon: Clock,
    label: 'Wait',
    color: 'bg-yellow-500',
    description: 'Wait for condition or duration',
  },
  custom: {
    icon: Code,
    label: 'Custom',
    color: 'bg-slate-500',
    description: 'Custom code or action',
  },
};

export function WorkflowBuilder({
  initialTemplate,
  onSave,
  onExecute,
  onLoad,
}: WorkflowBuilderProps) {
  // Workflow state
  const [workflowName, setWorkflowName] = useState(initialTemplate?.name || 'Untitled Workflow');
  const [workflowDescription, setWorkflowDescription] = useState(
    initialTemplate?.description || ''
  );
  const [steps, setSteps] = useState<WorkflowStep[]>(initialTemplate?.steps || []);
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [draggedStepId, setDraggedStepId] = useState<string | null>(null);

  // Dialog states
  const [addStepDialogOpen, setAddStepDialogOpen] = useState(false);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  // New step form state
  const [newStepType, setNewStepType] = useState<WorkflowStepType>('navigate');
  const [newStepLabel, setNewStepLabel] = useState('');
  const [newStepConfig, setNewStepConfig] = useState<Record<string, any>>({});

  // Selected step for configuration
  const selectedStep = useMemo(
    () => steps.find((s) => s.id === selectedStepId),
    [steps, selectedStepId]
  );

  // Add new step
  const handleAddStep = useCallback(() => {
    if (!newStepLabel.trim()) {
      toast.error('Please enter a step label');
      return;
    }

    const newStep: WorkflowStep = {
      id: crypto.randomUUID(),
      type: newStepType,
      order: steps.length,
      label: newStepLabel,
      config: getDefaultConfig(newStepType, newStepConfig),
      enabled: true,
    };

    setSteps([...steps, newStep]);
    setNewStepLabel('');
    setNewStepConfig({});
    setAddStepDialogOpen(false);
    toast.success('Step added successfully');
  }, [newStepType, newStepLabel, newStepConfig, steps]);

  // Update step
  const handleUpdateStep = useCallback(
    (stepId: string, updates: Partial<WorkflowStep>) => {
      setSteps(steps.map((s) => (s.id === stepId ? { ...s, ...updates } : s)));
      toast.success('Step updated');
    },
    [steps]
  );

  // Delete step
  const handleDeleteStep = useCallback(
    (stepId: string) => {
      setSteps(steps.filter((s) => s.id !== stepId).map((s, i) => ({ ...s, order: i })));
      if (selectedStepId === stepId) {
        setSelectedStepId(null);
      }
      toast.success('Step deleted');
    },
    [steps, selectedStepId]
  );

  // Duplicate step
  const handleDuplicateStep = useCallback(
    (stepId: string) => {
      const stepToDuplicate = steps.find((s) => s.id === stepId);
      if (!stepToDuplicate) return;

      const duplicatedStep: WorkflowStep = {
        ...stepToDuplicate,
        id: crypto.randomUUID(),
        label: `${stepToDuplicate.label} (Copy)`,
        order: steps.length,
      };

      setSteps([...steps, duplicatedStep]);
      toast.success('Step duplicated');
    },
    [steps]
  );

  // Toggle step enabled/disabled
  const toggleStepEnabled = useCallback(
    (stepId: string) => {
      const step = steps.find((s) => s.id === stepId);
      if (!step) return;

      handleUpdateStep(stepId, { enabled: !step.enabled });
    },
    [steps, handleUpdateStep]
  );

  // Drag and drop handlers
  const handleDragStart = useCallback((stepId: string) => {
    setDraggedStepId(stepId);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback(
    (targetStepId: string) => {
      if (!draggedStepId || draggedStepId === targetStepId) {
        setDraggedStepId(null);
        return;
      }

      const draggedIndex = steps.findIndex((s) => s.id === draggedStepId);
      const targetIndex = steps.findIndex((s) => s.id === targetStepId);

      if (draggedIndex === -1 || targetIndex === -1) {
        setDraggedStepId(null);
        return;
      }

      const newSteps = [...steps];
      const [draggedStep] = newSteps.splice(draggedIndex, 1);
      newSteps.splice(targetIndex, 0, draggedStep);

      // Reorder all steps
      const reorderedSteps = newSteps.map((step, index) => ({
        ...step,
        order: index,
      }));

      setSteps(reorderedSteps);
      setDraggedStepId(null);
      toast.success('Step reordered');
    },
    [draggedStepId, steps]
  );

  // Save workflow
  const handleSaveWorkflow = useCallback(() => {
    if (!workflowName.trim()) {
      toast.error('Please enter a workflow name');
      return;
    }

    const template: WorkflowTemplate = {
      id: initialTemplate?.id || crypto.randomUUID(),
      name: workflowName,
      description: workflowDescription,
      steps,
      createdAt: initialTemplate?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: [],
    };

    if (onSave) {
      onSave(template);
    } else {
      // PLACEHOLDER: Save to API/localStorage
      console.log('Saving workflow:', template);
      toast.success('Workflow saved successfully');
    }

    setSaveDialogOpen(false);
  }, [workflowName, workflowDescription, steps, initialTemplate, onSave]);

  // Execute workflow
  const handleExecuteWorkflow = useCallback(() => {
    if (steps.length === 0) {
      toast.error('Please add at least one step to the workflow');
      return;
    }

    const template: WorkflowTemplate = {
      id: initialTemplate?.id || crypto.randomUUID(),
      name: workflowName,
      description: workflowDescription,
      steps,
      createdAt: initialTemplate?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (onExecute) {
      onExecute(template);
    } else {
      // PLACEHOLDER: Execute via API
      console.log('Executing workflow:', template);
      toast.success('Workflow execution started');
    }
  }, [workflowName, workflowDescription, steps, initialTemplate, onExecute]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <Input
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                className="text-xl font-semibold border-none p-0 h-auto focus-visible:ring-0"
                placeholder="Workflow name..."
              />
              <Textarea
                value={workflowDescription}
                onChange={(e) => setWorkflowDescription(e.target.value)}
                className="mt-2 resize-none border-none p-0 focus-visible:ring-0 text-sm text-slate-600"
                placeholder="Workflow description..."
                rows={2}
              />
            </div>
            <div className="flex gap-2">
              {onLoad && (
                <Button variant="outline" size="sm" onClick={onLoad} className="gap-2">
                  <FolderOpen className="h-4 w-4" />
                  Load
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSaveDialogOpen(true)}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                Save
              </Button>
              <Button onClick={handleExecuteWorkflow} size="sm" className="gap-2">
                <Play className="h-4 w-4" />
                Execute
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Workflow Steps */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Workflow Steps</CardTitle>
              <CardDescription>
                {steps.length} step{steps.length !== 1 ? 's' : ''} configured
              </CardDescription>
            </div>
            <Button onClick={() => setAddStepDialogOpen(true)} size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Step
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {steps.length === 0 ? (
            <div className="py-12 text-center">
              <Code className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No steps added yet</h3>
              <p className="text-sm text-slate-500 mb-4">
                Add steps to build your browser automation workflow
              </p>
              <Button onClick={() => setAddStepDialogOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add First Step
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {steps.map((step, index) => {
                const config = STEP_TYPE_CONFIG[step.type];
                const Icon = config.icon;

                return (
                  <div
                    key={step.id}
                    draggable
                    onDragStart={() => handleDragStart(step.id)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(step.id)}
                    className={`group relative flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                      selectedStepId === step.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    } ${!step.enabled ? 'opacity-50' : ''} ${
                      draggedStepId === step.id ? 'opacity-50 scale-95' : ''
                    }`}
                  >
                    {/* Drag Handle */}
                    <div className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600">
                      <GripVertical className="h-5 w-5" />
                    </div>

                    {/* Step Number */}
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full ${config.color} text-white flex items-center justify-center text-sm font-medium`}
                    >
                      {index + 1}
                    </div>

                    {/* Step Icon */}
                    <div className="flex-shrink-0">
                      <Icon className="h-5 w-5 text-slate-600" />
                    </div>

                    {/* Step Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-slate-900 truncate">{step.label}</h4>
                        <Badge variant="secondary" className="text-xs">
                          {config.label}
                        </Badge>
                        {!step.enabled && (
                          <Badge variant="outline" className="text-xs text-slate-500">
                            Disabled
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1 truncate">
                        {getStepConfigSummary(step)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedStepId(step.id);
                          setConfigDialogOpen(true);
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => toggleStepEnabled(step.id)}>
                            {step.enabled ? (
                              <>
                                <AlertCircle className="h-4 w-4 mr-2" />
                                Disable Step
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Enable Step
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicateStep(step.id)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteStep(step.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Connector */}
                    {index < steps.length - 1 && (
                      <div className="absolute left-8 top-full w-0.5 h-2 bg-slate-300" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Step Dialog */}
      <Dialog open={addStepDialogOpen} onOpenChange={setAddStepDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Workflow Step</DialogTitle>
            <DialogDescription>
              Configure a new step for your browser automation workflow
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Step Type</Label>
              <Select
                value={newStepType}
                onValueChange={(v) => setNewStepType(v as WorkflowStepType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STEP_TYPE_CONFIG).map(([type, config]) => {
                    const Icon = config.icon;
                    return (
                      <SelectItem key={type} value={type}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <span>{config.label}</span>
                          <span className="text-xs text-slate-500">- {config.description}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Step Label</Label>
              <Input
                placeholder="e.g., Navigate to homepage"
                value={newStepLabel}
                onChange={(e) => setNewStepLabel(e.target.value)}
              />
            </div>

            {/* Dynamic config based on step type */}
            {renderStepConfig(newStepType, newStepConfig, setNewStepConfig)}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddStepDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddStep}>Add Step</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Configure Step Dialog */}
      <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Configure Step</DialogTitle>
            <DialogDescription>
              {selectedStep && `Editing: ${selectedStep.label}`}
            </DialogDescription>
          </DialogHeader>

          {selectedStep && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Step Label</Label>
                <Input
                  value={selectedStep.label}
                  onChange={(e) =>
                    handleUpdateStep(selectedStep.id, { label: e.target.value })
                  }
                />
              </div>

              {renderStepConfig(
                selectedStep.type,
                selectedStep.config,
                (newConfig) => handleUpdateStep(selectedStep.id, { config: newConfig })
              )}
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setConfigDialogOpen(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Save Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Workflow</DialogTitle>
            <DialogDescription>Save this workflow as a template for future use</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Workflow Name</Label>
              <Input
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                placeholder="My Workflow"
              />
            </div>

            <div className="space-y-2">
              <Label>Description (Optional)</Label>
              <Textarea
                value={workflowDescription}
                onChange={(e) => setWorkflowDescription(e.target.value)}
                placeholder="Describe what this workflow does..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveWorkflow}>Save Workflow</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper: Get default config for step type
function getDefaultConfig(type: WorkflowStepType, customConfig: Record<string, any>) {
  const defaults: Record<WorkflowStepType, Record<string, any>> = {
    navigate: { url: '' },
    act: { instruction: '', selector: '' },
    observe: { selector: '', condition: '' },
    extract: { selector: '', extractInstruction: '', schemaType: 'custom' },
    wait: { waitMs: 1000, condition: '' },
    custom: { code: '' },
  };

  return { ...defaults[type], ...customConfig };
}

// Helper: Render step configuration inputs
function renderStepConfig(
  type: WorkflowStepType,
  config: Record<string, any>,
  setConfig: (config: Record<string, any>) => void
) {
  const updateConfig = (key: string, value: any) => {
    setConfig({ ...config, [key]: value });
  };

  switch (type) {
    case 'navigate':
      return (
        <div className="space-y-2">
          <Label>URL</Label>
          <Input
            placeholder="https://example.com"
            value={config.url || ''}
            onChange={(e) => updateConfig('url', e.target.value)}
          />
        </div>
      );

    case 'act':
      return (
        <>
          <div className="space-y-2">
            <Label>Action Instruction</Label>
            <Input
              placeholder="e.g., Click the submit button"
              value={config.instruction || ''}
              onChange={(e) => updateConfig('instruction', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Selector (Optional)</Label>
            <Input
              placeholder="e.g., button.submit"
              value={config.selector || ''}
              onChange={(e) => updateConfig('selector', e.target.value)}
            />
          </div>
        </>
      );

    case 'observe':
      return (
        <>
          <div className="space-y-2">
            <Label>Element Selector</Label>
            <Input
              placeholder="e.g., .loading-indicator"
              value={config.selector || ''}
              onChange={(e) => updateConfig('selector', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Condition</Label>
            <Input
              placeholder="e.g., element is visible"
              value={config.condition || ''}
              onChange={(e) => updateConfig('condition', e.target.value)}
            />
          </div>
        </>
      );

    case 'extract':
      return (
        <>
          <div className="space-y-2">
            <Label>Extract Instruction</Label>
            <Textarea
              placeholder="Describe what data to extract"
              value={config.extractInstruction || ''}
              onChange={(e) => updateConfig('extractInstruction', e.target.value)}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>Selector (Optional)</Label>
            <Input
              placeholder="e.g., .product-list"
              value={config.selector || ''}
              onChange={(e) => updateConfig('selector', e.target.value)}
            />
          </div>
        </>
      );

    case 'wait':
      return (
        <>
          <div className="space-y-2">
            <Label>Wait Duration (ms)</Label>
            <Input
              type="number"
              placeholder="1000"
              value={config.waitMs || 1000}
              onChange={(e) => updateConfig('waitMs', parseInt(e.target.value) || 1000)}
            />
          </div>
          <div className="space-y-2">
            <Label>Wait Condition (Optional)</Label>
            <Input
              placeholder="e.g., page fully loaded"
              value={config.condition || ''}
              onChange={(e) => updateConfig('condition', e.target.value)}
            />
          </div>
        </>
      );

    case 'custom':
      return (
        <div className="space-y-2">
          <Label>Custom Code</Label>
          <Textarea
            placeholder="// Write custom JavaScript code"
            value={config.code || ''}
            onChange={(e) => updateConfig('code', e.target.value)}
            rows={6}
            className="font-mono text-sm"
          />
        </div>
      );

    default:
      return null;
  }
}

// Helper: Get step config summary for display
function getStepConfigSummary(step: WorkflowStep): string {
  const { type, config } = step;

  switch (type) {
    case 'navigate':
      return String(config.url || 'No URL configured');
    case 'act':
      return String(config.instruction || config.selector || 'No action configured');
    case 'observe':
      return String(config.selector || 'No selector configured');
    case 'extract':
      return String(config.extractInstruction || 'No extraction configured');
    case 'wait':
      return `Wait ${config.waitMs || 0}ms${config.condition ? ` - ${config.condition}` : ''}`;
    case 'custom':
      return 'Custom code';
    default:
      return 'Not configured';
  }
}

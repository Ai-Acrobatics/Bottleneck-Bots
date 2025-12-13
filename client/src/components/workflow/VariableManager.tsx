/**
 * Variable Manager Component
 *
 * Manages workflow variables with CRUD operations.
 * Supports multiple variable types: string, number, boolean, array, object.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  Type,
  Hash,
  ToggleLeft,
  Braces,
  Brackets,
} from 'lucide-react';
import { toast } from 'sonner';

// ============================================
// TYPE DEFINITIONS
// ============================================

export type VariableType = 'string' | 'number' | 'boolean' | 'array' | 'object';

export interface WorkflowVariable {
  id: string;
  name: string;
  value: any;
  type: VariableType;
  createdAt: Date;
  updatedAt: Date;
}

export interface VariableManagerProps {
  variables?: WorkflowVariable[];
  onVariablesChange?: (variables: WorkflowVariable[]) => void;
  className?: string;
  readOnly?: boolean;
}

// ============================================
// CONSTANTS
// ============================================

const VARIABLE_TYPE_CONFIG: Record<VariableType, {
  icon: React.ElementType;
  color: string;
  label: string;
  placeholder: string;
  validator: (value: string) => { valid: boolean; error?: string };
  formatter: (value: string) => any;
  serializer: (value: any) => string;
}> = {
  string: {
    icon: Type,
    color: 'text-blue-600',
    label: 'String',
    placeholder: 'Enter string value',
    validator: () => ({ valid: true }),
    formatter: (value: string) => value,
    serializer: (value: any) => String(value),
  },
  number: {
    icon: Hash,
    color: 'text-green-600',
    label: 'Number',
    placeholder: 'Enter number value',
    validator: (value: string) => {
      const num = Number(value);
      if (value.trim() === '' || isNaN(num)) {
        return { valid: false, error: 'Must be a valid number' };
      }
      return { valid: true };
    },
    formatter: (value: string) => Number(value),
    serializer: (value: any) => String(value),
  },
  boolean: {
    icon: ToggleLeft,
    color: 'text-purple-600',
    label: 'Boolean',
    placeholder: 'true or false',
    validator: (value: string) => {
      const lower = value.toLowerCase().trim();
      if (lower !== 'true' && lower !== 'false') {
        return { valid: false, error: 'Must be "true" or "false"' };
      }
      return { valid: true };
    },
    formatter: (value: string) => value.toLowerCase().trim() === 'true',
    serializer: (value: any) => String(Boolean(value)),
  },
  array: {
    icon: Brackets,
    color: 'text-orange-600',
    label: 'Array',
    placeholder: '["item1", "item2"]',
    validator: (value: string) => {
      try {
        const parsed = JSON.parse(value);
        if (!Array.isArray(parsed)) {
          return { valid: false, error: 'Must be a valid JSON array' };
        }
        return { valid: true };
      } catch (e) {
        return { valid: false, error: 'Invalid JSON format' };
      }
    },
    formatter: (value: string) => JSON.parse(value),
    serializer: (value: any) => JSON.stringify(value, null, 2),
  },
  object: {
    icon: Braces,
    color: 'text-pink-600',
    label: 'Object',
    placeholder: '{"key": "value"}',
    validator: (value: string) => {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed) || typeof parsed !== 'object' || parsed === null) {
          return { valid: false, error: 'Must be a valid JSON object' };
        }
        return { valid: true };
      } catch (e) {
        return { valid: false, error: 'Invalid JSON format' };
      }
    },
    formatter: (value: string) => JSON.parse(value),
    serializer: (value: any) => JSON.stringify(value, null, 2),
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Generate a unique ID for a new variable
 */
function generateId(): string {
  return `var_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Validate variable name
 */
function validateVariableName(name: string, existingNames: string[], currentName?: string): {
  valid: boolean;
  error?: string;
} {
  if (!name.trim()) {
    return { valid: false, error: 'Variable name is required' };
  }

  if (!/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(name)) {
    return {
      valid: false,
      error: 'Variable name must start with a letter, $, or _ and contain only letters, numbers, $, or _',
    };
  }

  if (existingNames.includes(name) && name !== currentName) {
    return { valid: false, error: 'Variable name already exists' };
  }

  return { valid: true };
}

/**
 * Truncate text with ellipsis
 */
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
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

// ============================================
// COMPONENT
// ============================================

export const VariableManager: React.FC<VariableManagerProps> = ({
  variables = [],
  onVariablesChange,
  className,
  readOnly = false,
}) => {
  // State
  const [internalVariables, setInternalVariables] = useState<WorkflowVariable[]>(variables);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<VariableType | 'all'>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingVariable, setEditingVariable] = useState<WorkflowVariable | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [variableToDelete, setVariableToDelete] = useState<WorkflowVariable | null>(null);

  // Use controlled variables if provided, otherwise use internal state
  const currentVariables = onVariablesChange ? variables : internalVariables;

  // Update variables
  const updateVariables = useCallback((newVariables: WorkflowVariable[]) => {
    if (onVariablesChange) {
      onVariablesChange(newVariables);
    } else {
      setInternalVariables(newVariables);
    }
  }, [onVariablesChange]);

  // Filter and search logic
  const filteredVariables = useMemo(() => {
    let filtered = currentVariables;

    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter((v) => v.type === typeFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((v) =>
        v.name.toLowerCase().includes(query) ||
        String(v.value).toLowerCase().includes(query)
      );
    }

    // Sort by name
    filtered.sort((a, b) => a.name.localeCompare(b.name));

    return filtered;
  }, [currentVariables, typeFilter, searchQuery]);

  // Get existing variable names
  const existingNames = useMemo(() => {
    return currentVariables.map((v) => v.name);
  }, [currentVariables]);

  // Handlers
  const handleAddVariable = useCallback((variable: Omit<WorkflowVariable, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date();
    const newVariable: WorkflowVariable = {
      ...variable,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    updateVariables([...currentVariables, newVariable]);
    setIsAddDialogOpen(false);
    toast.success(`Variable "${variable.name}" added`);
  }, [currentVariables, updateVariables]);

  const handleEditVariable = useCallback((updatedVariable: WorkflowVariable) => {
    const newVariables = currentVariables.map((v) =>
      v.id === updatedVariable.id
        ? { ...updatedVariable, updatedAt: new Date() }
        : v
    );
    updateVariables(newVariables);
    setEditingVariable(null);
    toast.success(`Variable "${updatedVariable.name}" updated`);
  }, [currentVariables, updateVariables]);

  const handleDeleteClick = useCallback((variable: WorkflowVariable) => {
    setVariableToDelete(variable);
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (variableToDelete) {
      const newVariables = currentVariables.filter((v) => v.id !== variableToDelete.id);
      updateVariables(newVariables);
      toast.success(`Variable "${variableToDelete.name}" deleted`);
    }
    setDeleteDialogOpen(false);
    setVariableToDelete(null);
  }, [variableToDelete, currentVariables, updateVariables]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteDialogOpen(false);
    setVariableToDelete(null);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  // Empty states
  const showEmptyState = currentVariables.length === 0;
  const showNoResults = !showEmptyState && filteredVariables.length === 0;

  // Variable type counts
  const typeCounts = useMemo(() => {
    const counts: Record<VariableType, number> = {
      string: 0,
      number: 0,
      boolean: 0,
      array: 0,
      object: 0,
    };
    currentVariables.forEach((v) => {
      counts[v.type] = (counts[v.type] || 0) + 1;
    });
    return counts;
  }, [currentVariables]);

  return (
    <>
      <Card
        className={cn('w-full', className)}
        role="region"
        aria-label="Variable Manager"
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Variables</CardTitle>
            {!readOnly && (
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
                    Add Variable
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add Variable</DialogTitle>
                    <DialogDescription>
                      Create a new workflow variable with a name, type, and value.
                    </DialogDescription>
                  </DialogHeader>
                  <VariableForm
                    existingNames={existingNames}
                    onSubmit={handleAddVariable}
                    onCancel={() => setIsAddDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Summary Stats */}
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge variant="outline" className="gap-1">
              <span className="font-semibold">{currentVariables.length}</span>
              Total
            </Badge>
            {Object.entries(typeCounts).map(([type, count]) => {
              if (count === 0) return null;
              const config = VARIABLE_TYPE_CONFIG[type as VariableType];
              const Icon = config.icon;
              return (
                <Badge key={type} variant="outline" className="gap-1">
                  <Icon className={cn('h-3 w-3', config.color)} aria-hidden="true" />
                  <span className="font-semibold">{count}</span>
                  {config.label}
                </Badge>
              );
            })}
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <Input
                type="search"
                role="searchbox"
                placeholder="Search variables..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-9"
                aria-label="Search variables"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearSearch}
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </Button>
              )}
            </div>

            {/* Type Filter */}
            <Select
              value={typeFilter}
              onValueChange={(value) => setTypeFilter(value as VariableType | 'all')}
            >
              <SelectTrigger className="w-full sm:w-48" aria-label="Filter by type">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="string">String</SelectItem>
                <SelectItem value="number">Number</SelectItem>
                <SelectItem value="boolean">Boolean</SelectItem>
                <SelectItem value="array">Array</SelectItem>
                <SelectItem value="object">Object</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          {/* Results Count */}
          <div className="mb-4" role="status" aria-live="polite">
            <p className="text-sm text-muted-foreground">
              {showNoResults
                ? 'No matching variables found'
                : `Showing ${filteredVariables.length} ${filteredVariables.length === 1 ? 'variable' : 'variables'}`}
            </p>
          </div>

          {/* Empty State */}
          {showEmptyState && (
            <div className="text-center py-12">
              <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground/50" aria-hidden="true" />
              <h3 className="mt-4 text-lg font-semibold">No variables defined</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {readOnly
                  ? 'No variables have been defined for this workflow.'
                  : 'Add variables to store and manage data in your workflow.'}
              </p>
              {!readOnly && (
                <Button
                  className="mt-4"
                  onClick={() => setIsAddDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
                  Add Your First Variable
                </Button>
              )}
            </div>
          )}

          {/* No Results State */}
          {showNoResults && (
            <div className="text-center py-12">
              <Search className="mx-auto h-12 w-12 text-muted-foreground/50" aria-hidden="true" />
              <h3 className="mt-4 text-lg font-semibold">No matching variables found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Try adjusting your filters or search query.
              </p>
            </div>
          )}

          {/* Variables Table */}
          {!showEmptyState && !showNoResults && (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Last Updated</TableHead>
                    {!readOnly && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVariables.map((variable) => {
                    const typeConfig = VARIABLE_TYPE_CONFIG[variable.type];
                    const TypeIcon = typeConfig.icon;
                    const displayValue = typeConfig.serializer(variable.value);

                    return (
                      <TableRow key={variable.id}>
                        <TableCell className="font-medium font-mono">
                          <div className="max-w-xs">
                            <span title={variable.name}>
                              {truncateText(variable.name, 30)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="gap-1">
                            <TypeIcon className={cn('h-3 w-3', typeConfig.color)} aria-hidden="true" />
                            {typeConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-md">
                            <code className="text-xs bg-muted px-2 py-1 rounded" title={displayValue}>
                              {truncateText(displayValue, 50)}
                            </code>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {formatRelativeTime(variable.updatedAt)}
                          </span>
                        </TableCell>
                        {!readOnly && (
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingVariable(variable)}
                                aria-label={`Edit ${variable.name}`}
                              >
                                <Edit2 className="h-4 w-4 mr-1" aria-hidden="true" />
                                Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteClick(variable)}
                                className="text-destructive hover:text-destructive"
                                aria-label={`Delete ${variable.name}`}
                              >
                                <Trash2 className="h-4 w-4 mr-1" aria-hidden="true" />
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Variable Dialog */}
      {editingVariable && (
        <Dialog open={!!editingVariable} onOpenChange={(open) => !open && setEditingVariable(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Variable</DialogTitle>
              <DialogDescription>
                Update the variable's name, type, or value.
              </DialogDescription>
            </DialogHeader>
            <VariableForm
              existingNames={existingNames}
              initialVariable={editingVariable}
              onSubmit={handleEditVariable}
              onCancel={() => setEditingVariable(null)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Variable</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the variable "{variableToDelete?.name}"?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">
              Delete Variable
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

// ============================================
// VARIABLE FORM COMPONENT
// ============================================

interface VariableFormProps {
  existingNames: string[];
  initialVariable?: WorkflowVariable;
  onSubmit: (variable: any) => void;
  onCancel: () => void;
}

const VariableForm: React.FC<VariableFormProps> = ({
  existingNames,
  initialVariable,
  onSubmit,
  onCancel,
}) => {
  const [name, setName] = useState(initialVariable?.name || '');
  const [type, setType] = useState<VariableType>(initialVariable?.type || 'string');
  const [value, setValue] = useState(
    initialVariable
      ? VARIABLE_TYPE_CONFIG[initialVariable.type].serializer(initialVariable.value)
      : ''
  );
  const [errors, setErrors] = useState<{ name?: string; value?: string }>({});

  const typeConfig = VARIABLE_TYPE_CONFIG[type];

  // Validate form
  const validate = useCallback((): boolean => {
    const newErrors: { name?: string; value?: string } = {};

    // Validate name
    const nameValidation = validateVariableName(name, existingNames, initialVariable?.name);
    if (!nameValidation.valid) {
      newErrors.name = nameValidation.error;
    }

    // Validate value
    const valueValidation = typeConfig.validator(value);
    if (!valueValidation.valid) {
      newErrors.value = valueValidation.error;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [name, value, type, existingNames, initialVariable, typeConfig]);

  // Handle submit
  const handleSubmit = useCallback(() => {
    if (!validate()) {
      return;
    }

    const formattedValue = typeConfig.formatter(value);

    if (initialVariable) {
      // Edit mode
      onSubmit({
        ...initialVariable,
        name,
        type,
        value: formattedValue,
      });
    } else {
      // Add mode
      onSubmit({
        name,
        type,
        value: formattedValue,
      });
    }
  }, [name, type, value, initialVariable, typeConfig, validate, onSubmit]);

  // Handle type change
  const handleTypeChange = useCallback((newType: VariableType) => {
    setType(newType);
    // Try to convert existing value to new type
    try {
      const currentConfig = VARIABLE_TYPE_CONFIG[type];
      const newConfig = VARIABLE_TYPE_CONFIG[newType];

      if (value) {
        const currentValue = currentConfig.formatter(value);
        const newValue = newConfig.serializer(currentValue);
        setValue(newValue);
      } else {
        setValue('');
      }
    } catch {
      setValue('');
    }
    setErrors({});
  }, [type, value]);

  const TypeIcon = typeConfig.icon;

  return (
    <div className="space-y-4">
      {/* Variable Name */}
      <div>
        <Label htmlFor="variable-name">
          Variable Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="variable-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="myVariable"
          className={cn('font-mono', errors.name && 'border-destructive')}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'name-error' : undefined}
        />
        {errors.name && (
          <p id="name-error" className="text-sm text-destructive mt-1">
            {errors.name}
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          Must start with a letter, $, or _ and contain only letters, numbers, $, or _
        </p>
      </div>

      {/* Variable Type */}
      <div>
        <Label htmlFor="variable-type">
          Type <span className="text-destructive">*</span>
        </Label>
        <Select value={type} onValueChange={handleTypeChange}>
          <SelectTrigger id="variable-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(VARIABLE_TYPE_CONFIG).map(([key, config]) => {
              const Icon = config.icon;
              return (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center gap-2">
                    <Icon className={cn('h-4 w-4', config.color)} aria-hidden="true" />
                    {config.label}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Variable Value */}
      <div>
        <Label htmlFor="variable-value" className="flex items-center gap-2">
          <TypeIcon className={cn('h-4 w-4', typeConfig.color)} aria-hidden="true" />
          Value <span className="text-destructive">*</span>
        </Label>
        {type === 'array' || type === 'object' ? (
          <Textarea
            id="variable-value"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={typeConfig.placeholder}
            className={cn('font-mono text-sm min-h-32', errors.value && 'border-destructive')}
            aria-invalid={!!errors.value}
            aria-describedby={errors.value ? 'value-error' : undefined}
          />
        ) : (
          <Input
            id="variable-value"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={typeConfig.placeholder}
            className={cn(errors.value && 'border-destructive')}
            aria-invalid={!!errors.value}
            aria-describedby={errors.value ? 'value-error' : undefined}
          />
        )}
        {errors.value && (
          <p id="value-error" className="text-sm text-destructive mt-1">
            {errors.value}
          </p>
        )}
        {!errors.value && (
          <p className="text-xs text-muted-foreground mt-1">
            {typeConfig.placeholder}
          </p>
        )}
      </div>

      {/* Actions */}
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit}>
          {initialVariable ? 'Update Variable' : 'Add Variable'}
        </Button>
      </DialogFooter>
    </div>
  );
};

VariableManager.displayName = 'VariableManager';

export default VariableManager;

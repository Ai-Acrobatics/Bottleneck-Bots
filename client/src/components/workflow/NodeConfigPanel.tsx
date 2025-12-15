import React from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { X, Copy, Trash2 } from 'lucide-react';
import { useWorkflowStore } from '@/stores/workflowStore';
import type { WorkflowNodeData } from '@/types/workflow';

export const NodeConfigPanel: React.FC = () => {
  const { selectedNode, updateNode, deleteNode, duplicateNode, selectNode } = useWorkflowStore();

  if (!selectedNode) {
    return (
      <Card className="h-full flex items-center justify-center border-l rounded-none">
        <div className="text-center text-muted-foreground p-8">
          <p className="text-sm">Select a node to configure</p>
        </div>
      </Card>
    );
  }

  const handleUpdate = (updates: Partial<WorkflowNodeData>) => {
    updateNode(selectedNode.id, updates);
  };

  const data = selectedNode.data;

  return (
    <Card className="h-full flex flex-col border-l rounded-none">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-semibold">Node Configuration</h3>
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => duplicateNode(selectedNode.id)}
            title="Duplicate"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => {
              deleteNode(selectedNode.id);
              selectNode(null);
            }}
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => selectNode(null)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Basic Settings */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="label">Label</Label>
              <Input
                id="label"
                value={data.label}
                onChange={(e) => handleUpdate({ label: e.target.value })}
                placeholder="Node label"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={data.description || ''}
                onChange={(e) => handleUpdate({ description: e.target.value })}
                placeholder="Optional description"
                rows={2}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="enabled">Enabled</Label>
              <Switch
                id="enabled"
                checked={data.enabled}
                onCheckedChange={(enabled) => handleUpdate({ enabled })}
              />
            </div>
          </div>

          <Separator />

          {/* Type-specific configurations */}
          {data.type === 'navigate' && (
            <div className="space-y-3">
              <div>
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  type="url"
                  value={data.url}
                  onChange={(e) => handleUpdate({ url: e.target.value })}
                  placeholder="https://example.com"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="waitForLoad">Wait for page load</Label>
                <Switch
                  id="waitForLoad"
                  checked={data.waitForLoad}
                  onCheckedChange={(waitForLoad) => handleUpdate({ waitForLoad })}
                />
              </div>
              <div>
                <Label htmlFor="timeout">Timeout (ms)</Label>
                <Input
                  id="timeout"
                  type="number"
                  value={data.timeout}
                  onChange={(e) => handleUpdate({ timeout: parseInt(e.target.value) })}
                />
              </div>
            </div>
          )}

          {data.type === 'click' && (
            <div className="space-y-3">
              <div>
                <Label htmlFor="selector">CSS Selector</Label>
                <Input
                  id="selector"
                  value={data.selector}
                  onChange={(e) => handleUpdate({ selector: e.target.value })}
                  placeholder=".button-class or #button-id"
                  className="font-mono text-sm"
                />
              </div>
              <div>
                <Label htmlFor="clickCount">Click Count</Label>
                <Input
                  id="clickCount"
                  type="number"
                  min="1"
                  value={data.clickCount}
                  onChange={(e) => handleUpdate({ clickCount: parseInt(e.target.value) })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="waitForNavigation">Wait for navigation</Label>
                <Switch
                  id="waitForNavigation"
                  checked={data.waitForNavigation}
                  onCheckedChange={(waitForNavigation) => handleUpdate({ waitForNavigation })}
                />
              </div>
            </div>
          )}

          {data.type === 'extract' && (
            <div className="space-y-3">
              <div>
                <Label htmlFor="selector">CSS Selector</Label>
                <Input
                  id="selector"
                  value={data.selector}
                  onChange={(e) => handleUpdate({ selector: e.target.value })}
                  placeholder=".data-class"
                  className="font-mono text-sm"
                />
              </div>
              <div>
                <Label htmlFor="extractType">Extract Type</Label>
                <Select
                  value={data.extractType}
                  onValueChange={(extractType: any) => handleUpdate({ extractType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text Content</SelectItem>
                    <SelectItem value="attribute">Attribute</SelectItem>
                    <SelectItem value="html">HTML</SelectItem>
                    <SelectItem value="table">Table Data</SelectItem>
                    <SelectItem value="list">List Items</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {data.extractType === 'attribute' && (
                <div>
                  <Label htmlFor="attribute">Attribute Name</Label>
                  <Input
                    id="attribute"
                    value={data.attribute || ''}
                    onChange={(e) => handleUpdate({ attribute: e.target.value })}
                    placeholder="href, src, data-id, etc."
                  />
                </div>
              )}
              <div>
                <Label htmlFor="variableName">Save to Variable</Label>
                <Input
                  id="variableName"
                  value={data.variableName}
                  onChange={(e) => handleUpdate({ variableName: e.target.value })}
                  placeholder="extractedData"
                  className="font-mono text-sm"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="multiple">Extract multiple elements</Label>
                <Switch
                  id="multiple"
                  checked={data.multiple}
                  onCheckedChange={(multiple) => handleUpdate({ multiple })}
                />
              </div>
            </div>
          )}

          {data.type === 'wait' && (
            <div className="space-y-3">
              <div>
                <Label htmlFor="waitCondition">Wait Condition</Label>
                <Select
                  value={data.waitCondition}
                  onValueChange={(waitCondition: any) => handleUpdate({ waitCondition })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="time">Time Delay</SelectItem>
                    <SelectItem value="element">Element Visible</SelectItem>
                    <SelectItem value="network">Network Idle</SelectItem>
                    <SelectItem value="custom">Custom Condition</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {data.waitCondition === 'time' && (
                <div>
                  <Label htmlFor="duration">Duration (ms)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={data.duration}
                    onChange={(e) => handleUpdate({ duration: parseInt(e.target.value) })}
                  />
                </div>
              )}
              {data.waitCondition === 'element' && (
                <div>
                  <Label htmlFor="selector">Element Selector</Label>
                  <Input
                    id="selector"
                    value={data.selector || ''}
                    onChange={(e) => handleUpdate({ selector: e.target.value })}
                    className="font-mono text-sm"
                  />
                </div>
              )}
              <div>
                <Label htmlFor="timeout">Timeout (ms)</Label>
                <Input
                  id="timeout"
                  type="number"
                  value={data.timeout}
                  onChange={(e) => handleUpdate({ timeout: parseInt(e.target.value) })}
                />
              </div>
            </div>
          )}

          {data.type === 'condition' && (
            <div className="space-y-3">
              <div>
                <Label htmlFor="variable">Variable</Label>
                <Input
                  id="variable"
                  value={data.variable}
                  onChange={(e) => handleUpdate({ variable: e.target.value })}
                  placeholder="variableName"
                  className="font-mono text-sm"
                />
              </div>
              <div>
                <Label htmlFor="operator">Operator</Label>
                <Select
                  value={data.operator}
                  onValueChange={(operator: any) => handleUpdate({ operator })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equals">Equals (==)</SelectItem>
                    <SelectItem value="not_equals">Not Equals (!=)</SelectItem>
                    <SelectItem value="contains">Contains</SelectItem>
                    <SelectItem value="not_contains">Not Contains</SelectItem>
                    <SelectItem value="greater_than">Greater Than (&gt;)</SelectItem>
                    <SelectItem value="less_than">Less Than (&lt;)</SelectItem>
                    <SelectItem value="exists">Exists</SelectItem>
                    <SelectItem value="not_exists">Not Exists</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="value">Value</Label>
                <Input
                  id="value"
                  value={data.value}
                  onChange={(e) => handleUpdate({ value: e.target.value })}
                  placeholder="Comparison value"
                />
              </div>
            </div>
          )}

          {data.type === 'loop' && (
            <div className="space-y-3">
              <div>
                <Label htmlFor="loopType">Loop Type</Label>
                <Select
                  value={data.loopType}
                  onValueChange={(loopType: any) => handleUpdate({ loopType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="count">Fixed Count</SelectItem>
                    <SelectItem value="while">While Condition</SelectItem>
                    <SelectItem value="foreach">For Each Item</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {data.loopType === 'count' && (
                <div>
                  <Label htmlFor="iterations">Iterations</Label>
                  <Input
                    id="iterations"
                    type="number"
                    min="1"
                    value={data.iterations}
                    onChange={(e) => handleUpdate({ iterations: parseInt(e.target.value) })}
                  />
                </div>
              )}
              {data.loopType === 'foreach' && (
                <>
                  <div>
                    <Label htmlFor="arrayVariable">Array Variable</Label>
                    <Input
                      id="arrayVariable"
                      value={data.arrayVariable || ''}
                      onChange={(e) => handleUpdate({ arrayVariable: e.target.value })}
                      className="font-mono text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="itemVariable">Item Variable</Label>
                    <Input
                      id="itemVariable"
                      value={data.itemVariable || ''}
                      onChange={(e) => handleUpdate({ itemVariable: e.target.value })}
                      className="font-mono text-sm"
                    />
                  </div>
                </>
              )}
              <div>
                <Label htmlFor="maxIterations">Max Iterations (safety)</Label>
                <Input
                  id="maxIterations"
                  type="number"
                  value={data.maxIterations}
                  onChange={(e) => handleUpdate({ maxIterations: parseInt(e.target.value) })}
                />
              </div>
            </div>
          )}

          {data.type === 'input' && (
            <div className="space-y-3">
              <div>
                <Label htmlFor="selector">Input Selector</Label>
                <Input
                  id="selector"
                  value={data.selector}
                  onChange={(e) => handleUpdate({ selector: e.target.value })}
                  className="font-mono text-sm"
                />
              </div>
              <div>
                <Label htmlFor="inputType">Input Type</Label>
                <Select
                  value={data.inputType}
                  onValueChange={(inputType: any) => handleUpdate({ inputType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="select">Select/Dropdown</SelectItem>
                    <SelectItem value="checkbox">Checkbox</SelectItem>
                    <SelectItem value="radio">Radio Button</SelectItem>
                    <SelectItem value="file">File Upload</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="value">Value</Label>
                <Input
                  id="value"
                  value={data.value}
                  onChange={(e) => handleUpdate({ value: e.target.value })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="clearFirst">Clear field first</Label>
                <Switch
                  id="clearFirst"
                  checked={data.clearFirst}
                  onCheckedChange={(clearFirst) => handleUpdate({ clearFirst })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="pressEnter">Press Enter after</Label>
                <Switch
                  id="pressEnter"
                  checked={data.pressEnter}
                  onCheckedChange={(pressEnter) => handleUpdate({ pressEnter })}
                />
              </div>
            </div>
          )}

          {data.type === 'api_call' && (
            <div className="space-y-3">
              <div>
                <Label htmlFor="method">HTTP Method</Label>
                <Select
                  value={data.method}
                  onValueChange={(method: any) => handleUpdate({ method })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                    <SelectItem value="PATCH">PATCH</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="url">API URL</Label>
                <Input
                  id="url"
                  type="url"
                  value={data.url}
                  onChange={(e) => handleUpdate({ url: e.target.value })}
                  className="font-mono text-sm"
                />
              </div>
              <div>
                <Label htmlFor="variableName">Save Response To</Label>
                <Input
                  id="variableName"
                  value={data.variableName}
                  onChange={(e) => handleUpdate({ variableName: e.target.value })}
                  className="font-mono text-sm"
                />
              </div>
            </div>
          )}

          {/* Error Handling */}
          <Separator />
          <Accordion type="single" collapsible>
            <AccordionItem value="error-handling">
              <AccordionTrigger className="text-sm">Error Handling</AccordionTrigger>
              <AccordionContent className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="continueOnError">Continue on error</Label>
                  <Switch
                    id="continueOnError"
                    checked={data.errorHandling?.continueOnError}
                    onCheckedChange={(continueOnError) =>
                      handleUpdate({
                        errorHandling: { ...data.errorHandling, continueOnError },
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="retryCount">Retry Count</Label>
                  <Input
                    id="retryCount"
                    type="number"
                    min="0"
                    max="5"
                    value={data.errorHandling?.retryCount || 0}
                    onChange={(e) =>
                      handleUpdate({
                        errorHandling: {
                          continueOnError: data.errorHandling?.continueOnError ?? false,
                          retryCount: parseInt(e.target.value),
                          retryDelay: data.errorHandling?.retryDelay,
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="retryDelay">Retry Delay (ms)</Label>
                  <Input
                    id="retryDelay"
                    type="number"
                    min="0"
                    value={data.errorHandling?.retryDelay || 1000}
                    onChange={(e) =>
                      handleUpdate({
                        errorHandling: {
                          continueOnError: data.errorHandling?.continueOnError ?? false,
                          retryCount: data.errorHandling?.retryCount,
                          retryDelay: parseInt(e.target.value),
                        },
                      })
                    }
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </ScrollArea>
    </Card>
  );
};

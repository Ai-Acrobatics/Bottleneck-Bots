import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileJson, Zap, FolderOpen } from 'lucide-react';
import { useWorkflowStore } from '@/stores/workflowStore';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import type { Workflow } from '@/types/workflow';

export const TemplateDialog: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const { loadWorkflow } = useWorkflowStore();

  // Fetch workflow templates from the database
  const { data: workflows, isLoading } = trpc.workflows.list.useQuery(
    { status: 'active', limit: 50 },
    { enabled: open }
  );

  const handleLoadTemplate = (template: Workflow) => {
    loadWorkflow(template);
    setOpen(false);
    toast.success(`Loaded template: ${template.name}`);
  };

  // Convert database workflow to Workflow type
  const convertToWorkflow = (dbWorkflow: any): Workflow => ({
    name: dbWorkflow.name,
    description: dbWorkflow.description || '',
    category: 'custom',
    version: 1,
    isTemplate: true,
    tags: [],
    nodes: Array.isArray(dbWorkflow.steps)
      ? dbWorkflow.steps.map((step: any, index: number) => ({
          id: String(index + 1),
          type: 'default',
          position: { x: 250, y: 50 + (index * 130) },
          data: {
            type: step.type,
            label: step.config?.instruction || step.config?.url || `Step ${index + 1}`,
            ...step.config,
            enabled: true,
          },
        }))
      : [],
    edges: Array.isArray(dbWorkflow.steps)
      ? dbWorkflow.steps.slice(0, -1).map((_: any, index: number) => ({
          id: `e${index + 1}-${index + 2}`,
          source: String(index + 1),
          target: String(index + 2),
          animated: true,
        }))
      : [],
    variables: {},
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FileJson className="h-4 w-4 mr-2" />
          Templates
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Workflow Templates</DialogTitle>
          <DialogDescription>
            Choose from your saved workflows to get started quickly
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[500px] pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : !workflows || workflows.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No Templates Available</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Create and save workflows to use them as templates. Your saved workflows will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {workflows.map((dbWorkflow) => {
                const template = convertToWorkflow(dbWorkflow);
                return (
                  <Card
                    key={dbWorkflow.id}
                    className="p-4 hover:border-primary transition-colors cursor-pointer"
                    onClick={() => handleLoadTemplate(template)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        <Zap className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold mb-1">{template.name}</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          {template.description || 'No description'}
                        </p>
                        {template.tags && template.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {template.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{template.nodes.length} nodes</span>
                          <span>{template.edges.length} connections</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            Click on any template to load it into the workflow builder. You can customize it to fit your needs.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

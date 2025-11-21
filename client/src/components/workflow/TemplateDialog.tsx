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
import { FileJson, Zap } from 'lucide-react';
import { SAMPLE_WORKFLOWS } from '@/config/sampleWorkflows';
import { useWorkflowStore } from '@/stores/workflowStore';
import { toast } from 'sonner';
import type { Workflow } from '@/types/workflow';

export const TemplateDialog: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const { loadWorkflow } = useWorkflowStore();

  const handleLoadTemplate = (template: Workflow) => {
    loadWorkflow(template);
    setOpen(false);
    toast.success(`Loaded template: ${template.name}`);
  };

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
            Choose from pre-built workflows to get started quickly
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[500px] pr-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SAMPLE_WORKFLOWS.map((template, index) => (
              <Card
                key={index}
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
                      {template.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {template.tags?.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{template.nodes.length} nodes</span>
                      <span>{template.edges.length} connections</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
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

import React from 'react';
import { Button } from '@/components/ui/button';
import { Pause, Play, Trash2, Download, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface BulkOperationsToolbarProps {
  selectedCount: number;
  onPause: () => void;
  onResume: () => void;
  onDelete: () => void;
  onExport: () => void;
  onDeselectAll: () => void;
}

export function BulkOperationsToolbar({
  selectedCount,
  onPause,
  onResume,
  onDelete,
  onExport,
  onDeselectAll,
}: BulkOperationsToolbarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-primary text-primary-foreground shadow-2xl rounded-lg px-6 py-4 flex items-center gap-4 border border-primary/20">
        <Badge variant="secondary" className="text-sm font-medium">
          {selectedCount} selected
        </Badge>

        <div className="h-6 w-px bg-primary-foreground/20" />

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={onPause}
            className="gap-2"
          >
            <Pause className="h-4 w-4" />
            Pause
          </Button>

          <Button
            size="sm"
            variant="secondary"
            onClick={onResume}
            className="gap-2"
          >
            <Play className="h-4 w-4" />
            Resume
          </Button>

          <Button
            size="sm"
            variant="secondary"
            onClick={onExport}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>

          <Button
            size="sm"
            variant="destructive"
            onClick={onDelete}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>

        <div className="h-6 w-px bg-primary-foreground/20" />

        <Button
          size="sm"
          variant="ghost"
          onClick={onDeselectAll}
          className="h-8 w-8 p-0 hover:bg-primary-foreground/20"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

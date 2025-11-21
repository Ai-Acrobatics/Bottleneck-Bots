import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Eye, Zap, Download, Trash2, Coins } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface LeadList {
  id: string;
  name: string;
  totalLeads: number;
  enrichedCount: number;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  creditsCost: number;
  createdAt: Date;
  description?: string;
}

interface LeadListCardProps {
  leadList: LeadList;
  onView: () => void;
  onEnrich: () => void;
  onExport: () => void;
  onDelete: () => void;
}

export function LeadListCard({
  leadList,
  onView,
  onEnrich,
  onExport,
  onDelete
}: LeadListCardProps) {
  const enrichmentPercentage =
    leadList.totalLeads > 0
      ? (leadList.enrichedCount / leadList.totalLeads) * 100
      : 0;

  const getStatusBadge = () => {
    switch (leadList.status) {
      case 'uploading':
        return <Badge variant="secondary">Uploading</Badge>;
      case 'processing':
        return <Badge className="bg-blue-500">Processing</Badge>;
      case 'completed':
        return <Badge className="bg-green-500">Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg leading-none">{leadList.name}</h3>
            {leadList.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {leadList.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge()}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onView}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onEnrich}>
                  <Zap className="mr-2 h-4 w-4" />
                  Enrich
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onExport}>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDelete} className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <p className="text-2xl font-bold">{leadList.totalLeads}</p>
            <p className="text-xs text-muted-foreground">Total Leads</p>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold">{leadList.enrichedCount}</p>
            <p className="text-xs text-muted-foreground">Enriched</p>
          </div>
          <div className="space-y-1 flex items-start gap-1">
            <Coins className="h-4 w-4 text-muted-foreground mt-1" />
            <div>
              <p className="text-2xl font-bold">{leadList.creditsCost}</p>
              <p className="text-xs text-muted-foreground">Credits Used</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Enrichment Progress</span>
            <span className="font-medium">{enrichmentPercentage.toFixed(0)}%</span>
          </div>
          <Progress value={enrichmentPercentage} className="h-2" />
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            Uploaded {formatDistanceToNow(leadList.createdAt, { addSuffix: true })}
          </p>
          <Button onClick={onView} variant="outline" size="sm">
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

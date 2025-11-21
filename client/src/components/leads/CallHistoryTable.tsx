import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Call {
  id: string;
  leadName: string;
  phoneNumber: string;
  status: 'completed' | 'failed' | 'in_progress' | 'no_answer';
  duration: number; // in seconds
  outcome?: string;
  timestamp: Date;
  recordingUrl?: string;
  transcript?: string;
}

interface CallHistoryTableProps {
  calls: Call[];
  onPlayRecording?: (call: Call) => void;
  onViewTranscript?: (call: Call) => void;
}

export function CallHistoryTable({
  calls,
  onPlayRecording,
  onViewTranscript
}: CallHistoryTableProps) {
  const getStatusBadge = (status: Call['status']) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500">Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-500">In Progress</Badge>;
      case 'no_answer':
        return <Badge variant="secondary">No Answer</Badge>;
      default:
        return null;
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Lead Name</TableHead>
            <TableHead>Phone Number</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Outcome</TableHead>
            <TableHead>Timestamp</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {calls.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                No calls found
              </TableCell>
            </TableRow>
          ) : (
            calls.map((call) => (
              <TableRow key={call.id}>
                <TableCell className="font-medium">{call.leadName}</TableCell>
                <TableCell className="font-mono text-sm">{call.phoneNumber}</TableCell>
                <TableCell>{getStatusBadge(call.status)}</TableCell>
                <TableCell>{formatDuration(call.duration)}</TableCell>
                <TableCell>
                  {call.outcome ? (
                    <span className="text-sm">{call.outcome}</span>
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDistanceToNow(call.timestamp, { addSuffix: true })}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {call.recordingUrl && onPlayRecording && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onPlayRecording(call)}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    )}
                    {call.transcript && onViewTranscript && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewTranscript(call)}
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

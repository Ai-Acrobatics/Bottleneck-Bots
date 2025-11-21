import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Globe,
  Clock,
  Copy,
  Play,
  Video,
  FileText,
  Database,
  XCircle,
  Trash2,
  MoreVertical,
  ExternalLink,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface BrowserSession {
  id: string;
  sessionId: string;
  url?: string;
  status: 'running' | 'completed' | 'failed' | 'expired';
  debugUrl?: string;
  recordingUrl?: string;
  createdAt: string;
  completedAt?: string;
  duration?: number;
}

interface BrowserSessionCardProps {
  session: BrowserSession;
  onLiveView?: (session: BrowserSession) => void;
  onViewRecording?: (session: BrowserSession) => void;
  onViewLogs?: (session: BrowserSession) => void;
  onViewData?: (session: BrowserSession) => void;
  onTerminate?: (session: BrowserSession) => void;
  onDelete?: (session: BrowserSession) => void;
  isSelected?: boolean;
  onSelect?: (selected: boolean) => void;
}

export function BrowserSessionCard({
  session,
  onLiveView,
  onViewRecording,
  onViewLogs,
  onViewData,
  onTerminate,
  onDelete,
  isSelected,
  onSelect,
}: BrowserSessionCardProps) {
  const getStatusConfig = (status: BrowserSession['status']) => {
    switch (status) {
      case 'running':
        return {
          variant: 'default' as const,
          className: 'bg-blue-500 hover:bg-blue-600',
          icon: Play,
          label: 'Running',
        };
      case 'completed':
        return {
          variant: 'default' as const,
          className: 'bg-green-500 hover:bg-green-600',
          icon: CheckCircle,
          label: 'Completed',
        };
      case 'failed':
        return {
          variant: 'destructive' as const,
          className: 'bg-red-500 hover:bg-red-600',
          icon: XCircle,
          label: 'Failed',
        };
      case 'expired':
        return {
          variant: 'secondary' as const,
          className: 'bg-gray-500 hover:bg-gray-600',
          icon: AlertCircle,
          label: 'Expired',
        };
      default:
        return {
          variant: 'secondary' as const,
          className: '',
          icon: Clock,
          label: status,
        };
    }
  };

  const statusConfig = getStatusConfig(session.status);
  const StatusIcon = statusConfig.icon;

  const copySessionId = () => {
    navigator.clipboard.writeText(session.sessionId);
    toast.success('Session ID copied to clipboard');
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <Card className={`hover:shadow-md transition-shadow ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          {/* Left: Checkbox and Session Info */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {onSelect && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => onSelect(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300"
              />
            )}

            <div className="flex-1 min-w-0">
              {/* Session ID */}
              <div className="flex items-center gap-2 mb-2">
                <code className="text-xs font-mono bg-slate-100 px-2 py-1 rounded truncate max-w-[200px]">
                  {session.sessionId}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copySessionId}
                  className="h-6 w-6 p-0"
                >
                  <Copy className="h-3 w-3" />
                </Button>
                <Badge className={statusConfig.className}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {statusConfig.label}
                </Badge>
              </div>

              {/* URL */}
              {session.url && (
                <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                  <Globe className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{session.url}</span>
                </div>
              )}

              {/* Timestamps */}
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>
                    {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}
                  </span>
                </div>
                {session.duration && (
                  <div className="flex items-center gap-1">
                    <span>Duration: {formatDuration(session.duration)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Quick Actions */}
            <div className="flex gap-1">
              {session.status === 'running' && session.debugUrl && onLiveView && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onLiveView(session)}
                  className="gap-1"
                >
                  <ExternalLink className="h-3 w-3" />
                  <span className="hidden sm:inline">Live</span>
                </Button>
              )}

              {session.recordingUrl && onViewRecording && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewRecording(session)}
                  className="gap-1"
                >
                  <Video className="h-3 w-3" />
                  <span className="hidden sm:inline">Recording</span>
                </Button>
              )}
            </div>

            {/* More Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {session.debugUrl && onLiveView && (
                  <DropdownMenuItem onClick={() => onLiveView(session)}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Live View
                  </DropdownMenuItem>
                )}
                {session.recordingUrl && onViewRecording && (
                  <DropdownMenuItem onClick={() => onViewRecording(session)}>
                    <Video className="h-4 w-4 mr-2" />
                    Watch Recording
                  </DropdownMenuItem>
                )}
                {onViewLogs && (
                  <DropdownMenuItem onClick={() => onViewLogs(session)}>
                    <FileText className="h-4 w-4 mr-2" />
                    View Logs
                  </DropdownMenuItem>
                )}
                {onViewData && (
                  <DropdownMenuItem onClick={() => onViewData(session)}>
                    <Database className="h-4 w-4 mr-2" />
                    View Extracted Data
                  </DropdownMenuItem>
                )}
                {session.status === 'running' && onTerminate && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onTerminate(session)}
                      className="text-orange-600"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Terminate Session
                    </DropdownMenuItem>
                  </>
                )}
                {onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(session)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Session
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

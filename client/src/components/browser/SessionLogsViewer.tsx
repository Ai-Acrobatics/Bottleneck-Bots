import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FileText,
  Download,
  Search,
  Copy,
  PlayCircle,
  PauseCircle,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';
import { useBrowserSession } from '@/hooks/useBrowserSession';

interface SessionLog {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  data?: any;
}

interface SessionLogsViewerProps {
  sessionId: string;
  className?: string;
}

export function SessionLogsViewer({ sessionId, className = '' }: SessionLogsViewerProps) {
  const { logs, isLoading } = useBrowserSession(sessionId);
  const [logFilter, setLogFilter] = useState<'all' | 'info' | 'warn' | 'error' | 'debug'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const getLogLevelConfig = (level: SessionLog['level']) => {
    switch (level) {
      case 'error':
        return {
          icon: XCircle,
          className: 'text-red-600 bg-red-50 border-red-200',
          badgeClassName: 'bg-red-100 text-red-800',
        };
      case 'warn':
        return {
          icon: AlertCircle,
          className: 'text-orange-600 bg-orange-50 border-orange-200',
          badgeClassName: 'bg-orange-100 text-orange-800',
        };
      case 'debug':
        return {
          icon: Info,
          className: 'text-slate-600 bg-slate-50 border-slate-200',
          badgeClassName: 'bg-slate-100 text-slate-800',
        };
      case 'info':
      default:
        return {
          icon: CheckCircle,
          className: 'text-blue-600 bg-blue-50 border-blue-200',
          badgeClassName: 'bg-blue-100 text-blue-800',
        };
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3,
    });
  };

  const filteredLogs = logs.filter((log: SessionLog) => {
    // Filter by level
    if (logFilter !== 'all' && log.level !== logFilter) return false;

    // Filter by search query
    if (searchQuery && !log.message.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    return true;
  });

  const exportLogs = (format: 'json' | 'txt') => {
    let content: string;
    let filename: string;
    let mimeType: string;

    if (format === 'json') {
      content = JSON.stringify(
        {
          sessionId,
          timestamp: new Date().toISOString(),
          logs: filteredLogs,
        },
        null,
        2
      );
      filename = `session-${sessionId}-logs.json`;
      mimeType = 'application/json';
    } else {
      content = filteredLogs
        .map(
          (log: SessionLog) =>
            `[${formatTimestamp(log.timestamp)}] [${log.level.toUpperCase()}] ${log.message}${
              log.data ? `\nData: ${JSON.stringify(log.data, null, 2)}` : ''
            }`
        )
        .join('\n\n');
      filename = `session-${sessionId}-logs.txt`;
      mimeType = 'text/plain';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    toast.success(`Logs exported as ${format.toUpperCase()}`);
  };

  const copyAllLogs = () => {
    const content = filteredLogs
      .map(
        (log: SessionLog) =>
          `[${formatTimestamp(log.timestamp)}] [${log.level.toUpperCase()}] ${log.message}`
      )
      .join('\n');

    navigator.clipboard.writeText(content);
    toast.success('Logs copied to clipboard');
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Session Logs
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportLogs('json')}
              className="gap-1"
            >
              <Download className="h-3 w-3" />
              JSON
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportLogs('txt')}
              className="gap-1"
            >
              <Download className="h-3 w-3" />
              TXT
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={copyAllLogs}
              className="gap-1"
            >
              <Copy className="h-3 w-3" />
              Copy
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <Select value={logFilter} onValueChange={(value: any) => setLogFilter(value)}>
            <SelectTrigger className="w-36 h-8 text-xs">
              <SelectValue placeholder="Filter logs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="warn">Warning</SelectItem>
              <SelectItem value="error">Error</SelectItem>
              <SelectItem value="debug">Debug</SelectItem>
            </SelectContent>
          </Select>

          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search logs..."
              className="pl-7 h-8 text-xs"
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoScroll(!autoScroll)}
            className="gap-1 h-8"
          >
            {autoScroll ? (
              <>
                <PauseCircle className="h-3 w-3" />
                Pause
              </>
            ) : (
              <>
                <PlayCircle className="h-3 w-3" />
                Resume
              </>
            )}
          </Button>

          <Badge variant="outline" className="text-xs">
            {filteredLogs.length} / {logs.length} logs
          </Badge>
        </div>

        {/* Logs Display */}
        <ScrollArea className="h-[400px] rounded-lg border bg-slate-950 p-4">
          <div className="space-y-2 font-mono text-xs">
            {isLoading ? (
              <div className="text-center text-slate-400 py-8">
                Loading logs...
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="text-center text-slate-400 py-8">
                No logs to display
              </div>
            ) : (
              filteredLogs.map((log: SessionLog, index: number) => {
                const config = getLogLevelConfig(log.level);
                const Icon = config.icon;

                return (
                  <div
                    key={index}
                    className={`rounded border p-3 ${config.className}`}
                  >
                    <div className="flex items-start gap-2">
                      <Icon className="h-4 w-4 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs opacity-75">
                            {formatTimestamp(log.timestamp)}
                          </span>
                          <Badge variant="outline" className={`text-xs ${config.badgeClassName}`}>
                            {log.level.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm break-words">{log.message}</p>
                        {log.data && (
                          <pre className="mt-2 text-xs bg-black/5 rounded p-2 overflow-x-auto">
                            {JSON.stringify(log.data, null, 2)}
                          </pre>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={logsEndRef} />
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

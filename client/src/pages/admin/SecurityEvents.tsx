import React, { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Shield,
  AlertTriangle,
  Ban,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Loader2,
  AlertCircle,
  Activity,
  TrendingUp,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';
import { format, formatDistanceToNow } from 'date-fns';

// ========================================
// TYPES
// ========================================

type Severity = 'critical' | 'high' | 'medium' | 'low';

interface SecurityEvent {
  id: number;
  userId: number | null;
  eventType: string;
  severity: Severity;
  description: string;
  metadata: any;
  ipAddress: string | null;
  userAgent: string | null;
  geoLocation: any;
  resolved: boolean;
  resolvedBy: number | null;
  resolvedAt: Date | null;
  notes: string | null;
  createdAt: Date;
  userName: string | null;
  userEmail: string | null;
}

// ========================================
// HELPER FUNCTIONS
// ========================================

const getSeverityBadge = (severity: string) => {
  const styles = {
    critical: 'bg-red-500/20 text-red-400 border-red-500/30',
    high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  };

  const icons = {
    critical: AlertTriangle,
    high: AlertTriangle,
    medium: AlertCircle,
    low: Activity,
  };

  const Icon = icons[severity as Severity] || Activity;
  const style = styles[severity as Severity] || styles.low;

  return (
    <Badge className={style}>
      <Icon className="mr-1 h-3 w-3" />
      {severity.toUpperCase()}
    </Badge>
  );
};

const getStatusBadge = (resolved: boolean) => {
  if (resolved) {
    return (
      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
        <CheckCircle className="mr-1 h-3 w-3" />
        Resolved
      </Badge>
    );
  }
  return (
    <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
      <AlertCircle className="mr-1 h-3 w-3" />
      Unresolved
    </Badge>
  );
};

const formatEventType = (eventType: string) => {
  return eventType
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// ========================================
// MAIN COMPONENT
// ========================================

export const SecurityEvents: React.FC = () => {
  // State
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all');
  const [resolvedFilter, setResolvedFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [page, setPage] = useState(0);
  const pageSize = 20;

  // Expandable rows
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  // Dialogs
  const [showResolveDialog, setShowResolveDialog] = useState(false);
  const [showBlockIpDialog, setShowBlockIpDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);
  const [resolveNotes, setResolveNotes] = useState('');
  const [blockReason, setBlockReason] = useState('');

  // Auto-refresh every 30 seconds
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Build query parameters
  const queryParams = {
    limit: pageSize,
    offset: page * pageSize,
    severity: severityFilter !== 'all' ? (severityFilter as any) : 'all',
    eventType: eventTypeFilter !== 'all' ? eventTypeFilter : undefined,
    resolved: resolvedFilter as any,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    sortOrder: 'desc' as const,
  };

  // Queries
  const { data: eventsData, isLoading, error, refetch } = trpc.admin.security.list.useQuery(queryParams);
  const { data: statsData } = trpc.admin.security.getStats.useQuery();

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refetch();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, refetch]);

  // Mutations
  const resolveMutation = trpc.admin.security.resolve.useMutation({
    onSuccess: () => {
      toast.success('Security event resolved successfully');
      refetch();
      setShowResolveDialog(false);
      setSelectedEvent(null);
      setResolveNotes('');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to resolve event');
    },
  });

  const blockIpMutation = trpc.admin.security.blockIp.useMutation({
    onSuccess: () => {
      toast.success('IP address blocked successfully');
      refetch();
      setShowBlockIpDialog(false);
      setSelectedEvent(null);
      setBlockReason('');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to block IP address');
    },
  });

  // Get unique event types from data
  const eventTypes = eventsData?.events
    ? Array.from(new Set(eventsData.events.map(e => e.eventType)))
    : [];

  // Event handlers
  const toggleRowExpansion = (eventId: number) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      return newSet;
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleResolveClick = (event: any) => {
    setSelectedEvent(event as SecurityEvent);
    setShowResolveDialog(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleBlockIpClick = (event: any) => {
    if (!event.ipAddress) {
      toast.error('No IP address associated with this event');
      return;
    }
    setSelectedEvent(event as SecurityEvent);
    setShowBlockIpDialog(true);
  };

  const confirmResolve = () => {
    if (selectedEvent) {
      resolveMutation.mutate({
        eventId: selectedEvent.id,
        notes: resolveNotes || undefined,
      });
    }
  };

  const confirmBlockIp = () => {
    if (selectedEvent && selectedEvent.ipAddress) {
      blockIpMutation.mutate({
        ipAddress: selectedEvent.ipAddress,
        reason: blockReason,
      });
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetFilters = () => {
    setSeverityFilter('all');
    setEventTypeFilter('all');
    setResolvedFilter('all');
    setStartDate('');
    setEndDate('');
    setPage(0);
  };

  // ========================================
  // RENDER
  // ========================================

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Security Events</h1>
            <p className="text-slate-400 mt-1">Monitor and respond to security threats</p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
              className="border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Activity className="h-4 w-4" />
              )}
              <span className="ml-2">Refresh</span>
            </Button>

            <Button
              variant={autoRefresh ? "default" : "outline"}
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={autoRefresh
                ? "bg-green-600 hover:bg-green-700"
                : "border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700"
              }
            >
              <TrendingUp className="h-4 w-4" />
              <span className="ml-2">Auto-refresh {autoRefresh ? 'ON' : 'OFF'}</span>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-slate-800 bg-slate-900/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">
                Events (24h)
              </CardTitle>
              <Activity className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {statsData?.total24h ?? 0}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Security events in last 24 hours
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">
                Critical Alerts
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-400">
                {statsData?.criticalAlerts ?? 0}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Unresolved critical events
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">
                Blocked IPs
              </CardTitle>
              <Ban className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-400">
                {statsData?.blockedIpsCount ?? 0}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                IP addresses on blocklist
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">
                Resolved Rate
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">
                {statsData?.resolvedRate ?? 0}%
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Events successfully resolved
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader>
            <CardTitle className="text-white">Filter Events</CardTitle>
            <CardDescription className="text-slate-400">
              Filter security events by severity, type, status, and date range
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              {/* Severity Filter */}
              <div className="space-y-2">
                <Label className="text-slate-300">Severity</Label>
                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger className="border-slate-700 bg-slate-800 text-slate-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-slate-700 bg-slate-800">
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Event Type Filter */}
              <div className="space-y-2">
                <Label className="text-slate-300">Event Type</Label>
                <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
                  <SelectTrigger className="border-slate-700 bg-slate-800 text-slate-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-slate-700 bg-slate-800">
                    <SelectItem value="all">All Types</SelectItem>
                    {eventTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {formatEventType(type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Resolved Filter */}
              <div className="space-y-2">
                <Label className="text-slate-300">Status</Label>
                <Select value={resolvedFilter} onValueChange={setResolvedFilter}>
                  <SelectTrigger className="border-slate-700 bg-slate-800 text-slate-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-slate-700 bg-slate-800">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="unresolved">Unresolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Start Date */}
              <div className="space-y-2">
                <Label className="text-slate-300">Start Date</Label>
                <Input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border-slate-700 bg-slate-800 text-slate-300"
                />
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <Label className="text-slate-300">End Date</Label>
                <Input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="border-slate-700 bg-slate-800 text-slate-300"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                Reset Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Events Table */}
        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">Security Events</CardTitle>
                <CardDescription className="text-slate-400">
                  {eventsData?.pagination.total ?? 0} total events
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Loading State */}
            {isLoading && (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <AlertCircle className="h-12 w-12 mb-4 text-red-500" />
                <p className="text-lg font-semibold">Failed to load security events</p>
                <p className="text-sm text-slate-500 mt-2">{error.message}</p>
                <Button
                  variant="outline"
                  onClick={() => refetch()}
                  className="mt-4 border-slate-700 bg-slate-800"
                >
                  Try Again
                </Button>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && eventsData?.events.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <Shield className="h-12 w-12 mb-4 text-green-500" />
                <p className="text-lg font-semibold">No security events found</p>
                <p className="text-sm text-slate-500 mt-2">
                  Your system is secure. No events match the current filters.
                </p>
              </div>
            )}

            {/* Events Table */}
            {!isLoading && !error && eventsData && eventsData.events.length > 0 && (
              <div className="rounded-md border border-slate-800">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-800 hover:bg-slate-800/50">
                      <TableHead className="text-slate-300 w-[30px]"></TableHead>
                      <TableHead className="text-slate-300">Time</TableHead>
                      <TableHead className="text-slate-300">Type</TableHead>
                      <TableHead className="text-slate-300">Severity</TableHead>
                      <TableHead className="text-slate-300">User</TableHead>
                      <TableHead className="text-slate-300">IP Address</TableHead>
                      <TableHead className="text-slate-300">Status</TableHead>
                      <TableHead className="text-slate-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {eventsData.events.map((event) => (
                      <React.Fragment key={event.id}>
                        {/* Main Row */}
                        <TableRow className="border-slate-800 hover:bg-slate-800/30">
                          <TableCell>
                            <button
                              onClick={() => toggleRowExpansion(event.id)}
                              className="text-slate-400 hover:text-slate-300"
                            >
                              {expandedRows.has(event.id) ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </button>
                          </TableCell>
                          <TableCell className="text-slate-300">
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {format(new Date(event.createdAt), 'MMM d, HH:mm')}
                              </span>
                              <span className="text-xs text-slate-500">
                                {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-300">
                            {formatEventType(event.eventType)}
                          </TableCell>
                          <TableCell>
                            {getSeverityBadge(event.severity)}
                          </TableCell>
                          <TableCell className="text-slate-300">
                            {event.userName ? (
                              <div className="flex flex-col">
                                <span className="font-medium">{event.userName}</span>
                                <span className="text-xs text-slate-500">{event.userEmail}</span>
                              </div>
                            ) : (
                              <span className="text-slate-500">Anonymous</span>
                            )}
                          </TableCell>
                          <TableCell className="font-mono text-sm text-slate-300">
                            {event.ipAddress || '-'}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(event.resolved)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {!event.resolved && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleResolveClick(event)}
                                  className="border-green-700 bg-green-900/30 text-green-400 hover:bg-green-900/50"
                                >
                                  Resolve
                                </Button>
                              )}
                              {event.ipAddress && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleBlockIpClick(event)}
                                  className="border-red-700 bg-red-900/30 text-red-400 hover:bg-red-900/50"
                                >
                                  Block IP
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>

                        {/* Expanded Details Row */}
                        {expandedRows.has(event.id) && (
                          <TableRow className="border-slate-800 bg-slate-800/20">
                            <TableCell colSpan={8} className="p-6">
                              <div className="space-y-4">
                                <div>
                                  <h4 className="text-sm font-semibold text-slate-300 mb-2">Description</h4>
                                  <p className="text-sm text-slate-400">{event.description}</p>
                                </div>

                                {event.userAgent && (
                                  <div>
                                    <h4 className="text-sm font-semibold text-slate-300 mb-2">User Agent</h4>
                                    <p className="text-sm text-slate-400 font-mono">{event.userAgent}</p>
                                  </div>
                                )}

                                {event.metadata && typeof event.metadata === 'object' && Object.keys(event.metadata as Record<string, unknown>).length > 0 ? (
                                  <div>
                                    <h4 className="text-sm font-semibold text-slate-300 mb-2">Metadata</h4>
                                    <pre className="text-xs text-slate-400 bg-slate-900/50 p-3 rounded border border-slate-700 overflow-x-auto">
                                      {JSON.stringify(event.metadata, null, 2)}
                                    </pre>
                                  </div>
                                ) : null}

                                {event.geoLocation && typeof event.geoLocation === 'object' ? (
                                  <div>
                                    <h4 className="text-sm font-semibold text-slate-300 mb-2">Geo Location</h4>
                                    <pre className="text-xs text-slate-400 bg-slate-900/50 p-3 rounded border border-slate-700 overflow-x-auto">
                                      {JSON.stringify(event.geoLocation, null, 2)}
                                    </pre>
                                  </div>
                                ) : null}

                                {event.resolved && event.notes && (
                                  <div>
                                    <h4 className="text-sm font-semibold text-slate-300 mb-2">Resolution Notes</h4>
                                    <p className="text-sm text-slate-400">{event.notes}</p>
                                    {event.resolvedAt && (
                                      <p className="text-xs text-slate-500 mt-1">
                                        Resolved {formatDistanceToNow(new Date(event.resolvedAt), { addSuffix: true })}
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Pagination */}
            {!isLoading && eventsData && eventsData.events.length > 0 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-slate-400">
                  Showing {page * pageSize + 1} to {Math.min((page + 1) * pageSize, eventsData.pagination.total)} of{' '}
                  {eventsData.pagination.total} events
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 0}
                    className="border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-50"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={!eventsData.pagination.hasMore}
                    className="border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-50"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Resolve Event Dialog */}
      <Dialog open={showResolveDialog} onOpenChange={setShowResolveDialog}>
        <DialogContent className="border-slate-800 bg-slate-900">
          <DialogHeader>
            <DialogTitle className="text-white">Resolve Security Event</DialogTitle>
            <DialogDescription className="text-slate-400">
              Mark this security event as resolved. You can optionally add notes about the resolution.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {selectedEvent && (
              <div className="space-y-2">
                <p className="text-sm text-slate-300">
                  <span className="font-semibold">Event:</span> {formatEventType(selectedEvent.eventType)}
                </p>
                <p className="text-sm text-slate-300">
                  <span className="font-semibold">Severity:</span> {selectedEvent.severity}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="resolve-notes" className="text-slate-300">
                Resolution Notes (Optional)
              </Label>
              <Textarea
                id="resolve-notes"
                value={resolveNotes}
                onChange={(e) => setResolveNotes(e.target.value)}
                placeholder="Enter details about how this event was resolved..."
                className="border-slate-700 bg-slate-800 text-slate-300"
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowResolveDialog(false);
                setResolveNotes('');
              }}
              className="border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmResolve}
              disabled={resolveMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {resolveMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Resolve Event'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Block IP Dialog */}
      <AlertDialog open={showBlockIpDialog} onOpenChange={setShowBlockIpDialog}>
        <AlertDialogContent className="border-slate-800 bg-slate-900">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Block IP Address</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              This will add the IP address to the blocklist and prevent future access from this IP.
              {selectedEvent && (
                <div className="mt-4 p-3 bg-slate-800/50 rounded border border-slate-700">
                  <p className="text-sm text-slate-300 font-mono">
                    IP: {selectedEvent.ipAddress}
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-2 py-4">
            <Label htmlFor="block-reason" className="text-slate-300">
              Reason for blocking *
            </Label>
            <Textarea
              id="block-reason"
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              placeholder="Enter the reason for blocking this IP address..."
              className="border-slate-700 bg-slate-800 text-slate-300"
              rows={3}
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowBlockIpDialog(false);
                setBlockReason('');
              }}
              className="border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBlockIp}
              disabled={!blockReason.trim() || blockIpMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {blockIpMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Block IP Address'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

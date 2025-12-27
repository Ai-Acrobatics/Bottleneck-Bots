/**
 * BrowserSessionManager Component
 * Main dashboard for managing browser automation sessions
 * Features: session listing, filtering, bulk operations, real-time updates
 */

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useBrowserSessions } from '@/hooks/useBrowserSessions';
import { BrowserSessionCard } from './BrowserSessionCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Kbd, KbdGroup } from '@/components/ui/kbd';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Plus,
  RefreshCw,
  Search,
  Filter,
  XCircle,
  Trash2,
  CheckSquare,
  Square,
  AlertCircle,
  Activity,
  CheckCircle,
  Clock,
  X,
  Keyboard,
  Inbox,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import type { BrowserSession, SessionFilter, SessionSortField, SessionSortOrder } from './types';

interface BrowserSessionManagerProps {
  onCreateSession?: () => void;
  onViewSession?: (session: BrowserSession) => void;
}

export function BrowserSessionManager({
  onCreateSession,
  onViewSession,
}: BrowserSessionManagerProps) {
  const {
    sessions,
    isLoading,
    error,
    refetch,
    terminateSession,
    deleteSession,
    bulkTerminate,
    bulkDelete,
    isTerminating,
    isDeleting,
  } = useBrowserSessions();

  // Local state
  const [selectedSessions, setSelectedSessions] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SessionSortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SessionSortOrder>('desc');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [terminateDialogOpen, setTerminateDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<BrowserSession | null>(null);

  // Ref for search input (for keyboard shortcuts)
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Computed values
  const sessionStats = useMemo(() => {
    const total = sessions.length;
    const running = sessions.filter((s) => s.status === 'running').length;
    const completed = sessions.filter((s) => s.status === 'completed').length;
    const failed = sessions.filter((s) => s.status === 'failed').length;

    return { total, running, completed, failed };
  }, [sessions]);

  // Filter and sort sessions
  const filteredSessions = useMemo(() => {
    let filtered = [...sessions];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (session) =>
          session.sessionId.toLowerCase().includes(query) ||
          session.url?.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((session) => session.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = (a as any)[sortField];
      let bValue: any = (b as any)[sortField];

      if (!aValue) return 1;
      if (!bValue) return -1;

      if (sortField === 'createdAt' || sortField === 'completedAt') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [sessions, searchQuery, statusFilter, sortField, sortOrder]);

  // Selection handlers
  const toggleSelectAll = useCallback(() => {
    if (selectedSessions.size === filteredSessions.length) {
      setSelectedSessions(new Set());
    } else {
      setSelectedSessions(new Set(filteredSessions.map((s) => s.sessionId)));
    }
  }, [filteredSessions, selectedSessions]);

  const toggleSelectSession = useCallback((sessionId: string, selected: boolean) => {
    setSelectedSessions((prev) => {
      const next = new Set(prev);
      if (selected) {
        next.add(sessionId);
      } else {
        next.delete(sessionId);
      }
      return next;
    });
  }, []);

  // Action handlers
  const handleTerminateSession = useCallback(
    async (session: BrowserSession) => {
      try {
        await terminateSession(session.sessionId);
      } catch (error: any) {
        toast.error(error.message || 'Failed to terminate session');
      }
    },
    [terminateSession]
  );

  const handleDeleteSession = useCallback(
    async (session: BrowserSession) => {
      setSessionToDelete(session);
      setDeleteDialogOpen(true);
    },
    []
  );

  const confirmDelete = useCallback(async () => {
    if (!sessionToDelete) return;

    try {
      await deleteSession(sessionToDelete.sessionId);
      setDeleteDialogOpen(false);
      setSessionToDelete(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete session');
    }
  }, [sessionToDelete, deleteSession]);

  const handleBulkTerminate = useCallback(async () => {
    const sessionIds = Array.from(selectedSessions);
    const runningSessions = sessions
      .filter((s) => sessionIds.includes(s.sessionId) && s.status === 'running')
      .map((s) => s.sessionId);

    if (runningSessions.length === 0) {
      toast.error('No running sessions selected');
      return;
    }

    try {
      await bulkTerminate(runningSessions);
      setSelectedSessions(new Set());
      setTerminateDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to terminate sessions');
    }
  }, [selectedSessions, sessions, bulkTerminate]);

  const handleBulkDelete = useCallback(async () => {
    const sessionIds = Array.from(selectedSessions);
    if (sessionIds.length === 0) {
      toast.error('No sessions selected');
      return;
    }

    try {
      await bulkDelete(sessionIds);
      setSelectedSessions(new Set());
      setDeleteDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete sessions');
    }
  }, [selectedSessions, bulkDelete]);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setSearchQuery('');
    setStatusFilter('all');
    setSortField('createdAt');
    setSortOrder('desc');
    toast.success('Filters cleared');
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifierKey = isMac ? e.metaKey : e.ctrlKey;

      // Cmd/Ctrl + K: Focus search
      if (modifierKey && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }

      // Cmd/Ctrl + N: New session
      if (modifierKey && e.key === 'n' && onCreateSession) {
        e.preventDefault();
        onCreateSession();
      }

      // Cmd/Ctrl + R: Refresh
      if (modifierKey && e.key === 'r') {
        e.preventDefault();
        refetch();
        toast.info('Refreshing sessions...');
      }

      // Cmd/Ctrl + A: Select all (when not in input)
      if (modifierKey && e.key === 'a' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        toggleSelectAll();
      }

      // Escape: Clear selection
      if (e.key === 'Escape' && selectedSessions.size > 0) {
        e.preventDefault();
        setSelectedSessions(new Set());
        toast.info('Selection cleared');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCreateSession, refetch, toggleSelectAll, selectedSessions]);

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchQuery) count++;
    if (statusFilter !== 'all') count++;
    return count;
  }, [searchQuery, statusFilter]);

  // Loading state with skeleton
  if (isLoading && sessions.length === 0) {
    return (
      <div className="space-y-6 animate-in fade-in-50 duration-500">
        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-in slide-in-from-top-4 duration-500" style={{ animationDelay: `${i * 50}ms` }}>
              <CardHeader className="pb-3">
                <Skeleton className="h-4 w-24 animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-8 w-16 animate-pulse" />
                  <Skeleton className="h-5 w-5 rounded-full animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Toolbar Skeleton */}
        <Card className="animate-in slide-in-from-top-4 duration-500" style={{ animationDelay: '200ms' }}>
          <CardContent className="p-4">
            <div className="flex gap-4">
              <Skeleton className="h-10 flex-1 animate-pulse" />
              <Skeleton className="h-10 w-32 animate-pulse" />
              <Skeleton className="h-10 w-32 animate-pulse" />
            </div>
          </CardContent>
        </Card>

        {/* Session Cards Skeleton */}
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${i * 100 + 300}ms` }}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-6 w-48 animate-pulse" />
                    <Skeleton className="h-4 w-full max-w-md animate-pulse" />
                    <div className="flex gap-2">
                      <Skeleton className="h-4 w-32 animate-pulse" />
                      <Skeleton className="h-4 w-24 animate-pulse" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-24 animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <AlertCircle className="h-5 w-5" />
            Failed to load sessions
          </CardTitle>
          <CardDescription className="text-red-600">
            {error.message || 'An error occurred while loading browser sessions'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => refetch()} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className={`transition-all duration-300 ${isLoading ? 'opacity-60 scale-[0.99]' : 'opacity-100 scale-100'}`}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-500">Total Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{sessionStats.total}</span>
              <Activity className={`h-5 w-5 text-slate-400 transition-all ${isLoading ? 'animate-pulse scale-110' : ''}`} />
            </div>
          </CardContent>
        </Card>

        <Card className={`transition-all duration-300 ${isLoading ? 'opacity-60 scale-[0.99]' : 'opacity-100 scale-100'}`}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-500">Running</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-blue-600">{sessionStats.running}</span>
              <Activity className={`h-5 w-5 text-blue-500 animate-pulse ${isLoading ? 'scale-110' : ''}`} />
            </div>
          </CardContent>
        </Card>

        <Card className={`transition-all duration-300 ${isLoading ? 'opacity-60 scale-[0.99]' : 'opacity-100 scale-100'}`}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-500">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-green-600">{sessionStats.completed}</span>
              <CheckCircle className={`h-5 w-5 text-green-500 transition-all ${isLoading ? 'animate-pulse scale-110' : ''}`} />
            </div>
          </CardContent>
        </Card>

        <Card className={`transition-all duration-300 ${isLoading ? 'opacity-60 scale-[0.99]' : 'opacity-100 scale-100'}`}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-500">Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-red-600">{sessionStats.failed}</span>
              <XCircle className={`h-5 w-5 text-red-500 transition-all ${isLoading ? 'animate-pulse scale-110' : ''}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                ref={searchInputRef}
                placeholder="Search by session ID or URL..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-20"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <KbdGroup>
                        <Kbd>{navigator.platform.toUpperCase().indexOf('MAC') >= 0 ? '⌘' : 'Ctrl'}</Kbd>
                        <Kbd>K</Kbd>
                      </KbdGroup>
                    </TooltipTrigger>
                    <TooltipContent>Focus search</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 flex-wrap items-center">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="running">Running</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortField} onValueChange={(v) => setSortField(v as SessionSortField)}>
                <SelectTrigger className="w-[140px]">
                  <Clock className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Created</SelectItem>
                  <SelectItem value="completedAt">Completed</SelectItem>
                  <SelectItem value="duration">Duration</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </Button>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
                      <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <KbdGroup>
                      <Kbd>{navigator.platform.toUpperCase().indexOf('MAC') >= 0 ? '⌘' : 'Ctrl'}</Kbd>
                      <Kbd>R</Kbd>
                    </KbdGroup>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {onCreateSession && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button onClick={onCreateSession} className="gap-2">
                        <Plus className="h-4 w-4" />
                        New Session
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <KbdGroup>
                        <Kbd>{navigator.platform.toUpperCase().indexOf('MAC') >= 0 ? '⌘' : 'Ctrl'}</Kbd>
                        <Kbd>N</Kbd>
                      </KbdGroup>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="sm" className="gap-2">
                          <Keyboard className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <div className="space-y-4">
                          <h4 className="font-medium text-sm">Keyboard Shortcuts</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-600">Focus search</span>
                              <KbdGroup>
                                <Kbd>{navigator.platform.toUpperCase().indexOf('MAC') >= 0 ? '⌘' : 'Ctrl'}</Kbd>
                                <Kbd>K</Kbd>
                              </KbdGroup>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-600">New session</span>
                              <KbdGroup>
                                <Kbd>{navigator.platform.toUpperCase().indexOf('MAC') >= 0 ? '⌘' : 'Ctrl'}</Kbd>
                                <Kbd>N</Kbd>
                              </KbdGroup>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-600">Refresh</span>
                              <KbdGroup>
                                <Kbd>{navigator.platform.toUpperCase().indexOf('MAC') >= 0 ? '⌘' : 'Ctrl'}</Kbd>
                                <Kbd>R</Kbd>
                              </KbdGroup>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-600">Select all</span>
                              <KbdGroup>
                                <Kbd>{navigator.platform.toUpperCase().indexOf('MAC') >= 0 ? '⌘' : 'Ctrl'}</Kbd>
                                <Kbd>A</Kbd>
                              </KbdGroup>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-600">Clear selection</span>
                              <Kbd>Esc</Kbd>
                            </div>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </TooltipTrigger>
                  <TooltipContent>Keyboard shortcuts</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* Active Filter Badges */}
          {activeFiltersCount > 0 && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t animate-in fade-in-50 slide-in-from-top-2 duration-300">
              <span className="text-xs text-slate-500 font-medium">Active filters:</span>
              {searchQuery && (
                <Badge variant="secondary" className="gap-1 animate-in zoom-in-95 duration-200">
                  <Search className="h-2.5 w-2.5" />
                  {searchQuery}
                  <button
                    onClick={() => setSearchQuery('')}
                    className="ml-1 hover:bg-slate-300 rounded-full p-0.5 transition-colors"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </Badge>
              )}
              {statusFilter !== 'all' && (
                <Badge variant="secondary" className="gap-1 animate-in zoom-in-95 duration-200 delay-75">
                  <Filter className="h-2.5 w-2.5" />
                  {statusFilter}
                  <button
                    onClick={() => setStatusFilter('all')}
                    className="ml-1 hover:bg-slate-300 rounded-full p-0.5 transition-colors"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="h-6 text-xs ml-auto hover:text-red-600 transition-colors"
              >
                Clear all
              </Button>
            </div>
          )}

          {/* Bulk Actions */}
          {selectedSessions.size > 0 && (
            <div className="flex items-center gap-3 mt-4 pt-4 border-t">
              <Badge variant="secondary" className="gap-1">
                {selectedSessions.size} selected
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTerminateDialogOpen(true)}
                disabled={isTerminating}
                className="gap-2"
              >
                <XCircle className="h-4 w-4" />
                Terminate
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkDelete}
                disabled={isDeleting}
                className="gap-2 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setSelectedSessions(new Set())}>
                Clear Selection
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Session List */}
      <div className="space-y-3">
        {filteredSessions.length > 0 && (
          <div className="flex items-center justify-between px-1">
            <Button variant="ghost" size="sm" onClick={toggleSelectAll} className="gap-2">
              {selectedSessions.size === filteredSessions.length ? (
                <CheckSquare className="h-4 w-4" />
              ) : (
                <Square className="h-4 w-4" />
              )}
              Select All
            </Button>
            <span className="text-sm text-slate-500">
              Showing {filteredSessions.length} of {sessions.length} sessions
            </span>
          </div>
        )}

        {filteredSessions.length === 0 ? (
          <Card className="border-dashed animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
            <CardContent className="py-16">
              <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
                {searchQuery || statusFilter !== 'all' ? (
                  <>
                    <div className="rounded-full bg-slate-100 p-4 mb-4 animate-in zoom-in-50 duration-500">
                      <Search className="h-12 w-12 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2 animate-in slide-in-from-bottom-2 duration-500 delay-100">No sessions found</h3>
                    <p className="text-sm text-slate-500 mb-6 animate-in slide-in-from-bottom-2 duration-500 delay-200">
                      No sessions match your current filters. Try adjusting your search criteria or clearing filters.
                    </p>
                    <div className="flex gap-2 animate-in slide-in-from-bottom-2 duration-500 delay-300">
                      <Button onClick={clearAllFilters} variant="outline" className="gap-2">
                        <X className="h-4 w-4" />
                        Clear Filters
                      </Button>
                      {onCreateSession && (
                        <Button onClick={onCreateSession} className="gap-2">
                          <Plus className="h-4 w-4" />
                          New Session
                        </Button>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 p-4 mb-4 animate-in zoom-in-50 duration-500">
                      <Inbox className="h-12 w-12 text-blue-500 animate-in spin-in-180 duration-700 delay-200" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2 animate-in slide-in-from-bottom-2 duration-500 delay-300">No browser sessions yet</h3>
                    <p className="text-sm text-slate-500 mb-6 animate-in slide-in-from-bottom-2 duration-500 delay-400">
                      Get started by creating your first browser automation session. You'll be able to control browsers, capture data, and automate tasks.
                    </p>
                    {onCreateSession && (
                      <Button onClick={onCreateSession} size="lg" className="gap-2 animate-in zoom-in-50 duration-500 delay-500">
                        <Sparkles className="h-5 w-5" />
                        Create Your First Session
                      </Button>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredSessions.map((session) => (
            <BrowserSessionCard
              key={session.sessionId}
              session={{ ...session, id: String(session.id), createdAt: (session.createdAt as any)?.toISOString?.() ?? String(session.createdAt) } as any}
              onLiveView={onViewSession}
              onViewRecording={onViewSession}
              onViewLogs={onViewSession}
              onTerminate={handleTerminateSession}
              onDelete={handleDeleteSession}
              isSelected={selectedSessions.has(session.sessionId)}
              onSelect={(selected) => toggleSelectSession(session.sessionId, selected)}
            />
          ))
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedSessions.size > 0
                ? `Delete ${selectedSessions.size} sessions?`
                : 'Delete session?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the session data and all
              associated recordings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={selectedSessions.size > 0 ? handleBulkDelete : confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Terminate Confirmation Dialog */}
      <AlertDialog open={terminateDialogOpen} onOpenChange={setTerminateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Terminate running sessions?</AlertDialogTitle>
            <AlertDialogDescription>
              This will stop all selected running sessions. Terminated sessions can still be viewed
              but cannot be resumed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkTerminate}>Terminate</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

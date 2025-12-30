import React, { useEffect, useState } from 'react';
import { useAgentStore } from '@/stores/agentStore';
import { useAgentSSE } from '@/hooks/useAgentSSE';
import {
  AgentThinkingViewer,
  ExecutionHistory,
  TaskInput,
  TaskTemplates,
} from '@/components/agent';
import type { TaskTemplate } from '@/components/agent';
import { LiveBrowserView } from '@/components/browser/LiveBrowserView';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Plus,
  RefreshCw,
  Monitor,
  Sparkles,
  X,
  ExternalLink,
  Activity,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  PanelRight,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { trpcClient } from '@/lib/trpc';

export function AgentDashboard() {
  const {
    currentExecution,
    thinkingSteps,
    isExecuting,
    activeBrowserSession,
    startExecution,
    cancelExecution,
    clearCurrentExecution,
    loadExecutionHistory,
    stats,
    loadStats,
    fetchActiveBrowserSession,
  } = useAgentStore();

  const [selectedExecutionId, setSelectedExecutionId] = useState<string | undefined>(undefined);
  const [selectedTemplate, setSelectedTemplate] = useState<TaskTemplate | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [rightPanelTab, setRightPanelTab] = useState<'preview' | 'templates'>('preview');
  const [mobileView, setMobileView] = useState<'chat' | 'preview'>('chat');
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  // SSE connection for real-time execution updates
  const { isConnected: sseConnected, connectionState } = useAgentSSE({
    executionId: currentExecution?.id,
    autoConnect: isExecuting,
  });

  // Load execution history and stats on mount
  useEffect(() => {
    loadExecutionHistory();
    loadStats();
  }, [loadExecutionHistory, loadStats]);

  // Update selected execution ID when current execution changes
  useEffect(() => {
    if (currentExecution) {
      setSelectedExecutionId(String(currentExecution.id));
    }
  }, [currentExecution]);

  // Fetch active browser sessions when executing (SSE may also update this)
  useEffect(() => {
    if (!isExecuting) {
      return;
    }

    // Initial fetch
    fetchActiveBrowserSession();

    // Poll as backup if SSE isn't connected (every 5 seconds)
    const intervalId = setInterval(() => {
      if (!sseConnected) {
        fetchActiveBrowserSession();
      }
    }, 5000);

    return () => {
      clearInterval(intervalId);
    };
  }, [isExecuting, fetchActiveBrowserSession, sseConnected]);

  const handleSubmitTask = async (task: string) => {
    setSelectedTemplate(null);
    await startExecution(task);
  };

  const handleCancelExecution = async () => {
    await cancelExecution();
  };

  const handleNewExecution = () => {
    clearCurrentExecution();
    setSelectedExecutionId(undefined);
  };

  const handleSelectExecution = (executionId: string) => {
    setSelectedExecutionId(executionId);
    useAgentStore.getState().loadExecution(executionId);
  };

  const handleSelectTemplate = (template: TaskTemplate) => {
    setSelectedTemplate(template);
    setShowTemplates(false);
  };

  const handleClearTemplate = () => {
    setSelectedTemplate(null);
  };

  // Determine execution status for visual indicators
  const getStatusInfo = () => {
    if (!currentExecution) return null;

    const statusMap: Record<string, { icon: React.ElementType; color: string; label: string }> = {
      running: { icon: Activity, color: 'text-blue-500', label: 'Running' },
      planning: { icon: Clock, color: 'text-amber-500', label: 'Planning' },
      executing: { icon: Activity, color: 'text-blue-500', label: 'Executing' },
      completed: { icon: CheckCircle2, color: 'text-green-500', label: 'Completed' },
      success: { icon: CheckCircle2, color: 'text-green-500', label: 'Success' },
      failed: { icon: AlertCircle, color: 'text-red-500', label: 'Failed' },
      cancelled: { icon: X, color: 'text-gray-500', label: 'Cancelled' },
    };

    return statusMap[currentExecution.status] || { icon: Clock, color: 'text-gray-500', label: currentExecution.status };
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile view toggle - only visible on small screens */}
      <div className="xl:hidden fixed bottom-4 right-4 z-50 flex gap-2">
        {activeBrowserSession?.debugUrl && (
          <Button
            onClick={() => setShowMobilePreview(true)}
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 shadow-lg rounded-full h-12 w-12 p-0"
          >
            <Monitor className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Mobile Live Preview Sheet */}
      <Sheet open={showMobilePreview} onOpenChange={setShowMobilePreview}>
        <SheetContent side="bottom" className="h-[80vh] p-0">
          <SheetHeader className="p-4 border-b">
            <SheetTitle className="flex items-center gap-2">
              <Monitor className="w-5 h-5 text-emerald-600" />
              Live Browser Preview
            </SheetTitle>
          </SheetHeader>
          {activeBrowserSession?.debugUrl ? (
            <div className="h-[calc(80vh-80px)] flex flex-col">
              <div className="px-4 py-2 bg-gray-50 border-b flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <span className="text-xs font-medium text-gray-600">Live Session</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={() => window.open(activeBrowserSession.debugUrl, '_blank')}
                >
                  <ExternalLink className="w-3 h-3" />
                  Open in Tab
                </Button>
              </div>
              <div className="flex-1 relative">
                <iframe
                  src={activeBrowserSession.debugUrl}
                  className="absolute inset-0 w-full h-full border-none"
                  title="Live Browser Preview"
                  allow="clipboard-read; clipboard-write"
                />
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center">
              <Monitor className="w-12 h-12 text-gray-300 mb-4" />
              <p className="text-gray-500">No active browser session</p>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Sidebar with execution history */}
      <aside className="hidden md:flex w-80 border-r border-gray-200 bg-white flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-gray-900">Agent Dashboard</h1>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => {
                loadExecutionHistory();
                loadStats();
              }}
              title="Refresh history"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>

          {/* Quick Stats */}
          {stats && (
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="bg-gray-50 rounded-lg p-2 text-center">
                <div className="text-lg font-bold text-gray-900">{stats.total}</div>
                <div className="text-[10px] text-gray-500">Total</div>
              </div>
              <div className="bg-green-50 rounded-lg p-2 text-center">
                <div className="text-lg font-bold text-green-600">
                  {Math.round(stats.successRate * 100)}%
                </div>
                <div className="text-[10px] text-gray-500">Success</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-2 text-center">
                <div className="text-lg font-bold text-blue-600">
                  {stats.averageDuration ? `${Math.round(stats.averageDuration / 1000)}s` : '-'}
                </div>
                <div className="text-[10px] text-gray-500">Avg Time</div>
              </div>
            </div>
          )}

          <Button
            onClick={handleNewExecution}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Plus className="w-4 h-4" />
            New Execution
          </Button>
        </div>

        <ExecutionHistory
          onSelectExecution={handleSelectExecution}
          selectedExecutionId={selectedExecutionId}
        />
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header - only visible when sidebar is hidden */}
        <div className="md:hidden p-4 border-b border-gray-200 bg-white flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900">AI Agent</h1>
          <div className="flex items-center gap-2">
            {stats && (
              <Badge variant="secondary" className="text-xs">
                {stats.total} runs
              </Badge>
            )}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => {
                loadExecutionHistory();
                loadStats();
              }}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Task input with template support */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <TaskInput
            onSubmit={handleSubmitTask}
            isLoading={isExecuting}
            disabled={isExecuting}
            selectedTemplate={selectedTemplate}
            onClearTemplate={handleClearTemplate}
            onShowTemplates={() => setShowTemplates(true)}
          />
        </div>

        {/* Thinking visualization */}
        <div className="flex-1 overflow-hidden">
          <AgentThinkingViewer
            execution={currentExecution ? {
              id: String(currentExecution.id),
              task: currentExecution.taskDescription || '',
              status: currentExecution.status === 'running' || currentExecution.status === 'started' ? 'executing' :
                      currentExecution.status === 'success' || currentExecution.status === 'completed' ? 'completed' :
                      currentExecution.status === 'failed' || currentExecution.status === 'timeout' ? 'failed' :
                      currentExecution.status === 'cancelled' ? 'cancelled' :
                      currentExecution.status === 'planning' ? 'planning' : 'executing',
              plan: currentExecution.plan || undefined,
              createdAt: new Date(),
              updatedAt: new Date(),
              completedAt: currentExecution.status === 'completed' || currentExecution.status === 'success' ? new Date() : undefined,
              error: currentExecution.error,
              result: currentExecution.output,
              metadata: {
                duration: currentExecution.duration,
              },
            } : null}
            thinkingSteps={thinkingSteps}
            isExecuting={isExecuting}
            onCancel={handleCancelExecution}
          />
        </div>
      </main>

      {/* Right panel - Live Browser Preview & Templates - Desktop only */}
      <aside className="hidden xl:flex w-[420px] border-l border-gray-200 bg-white flex-col">
        <Tabs value={rightPanelTab} onValueChange={(v) => setRightPanelTab(v as any)} className="flex flex-col h-full">
          <div className="border-b border-gray-200 px-2">
            <TabsList className="w-full justify-start bg-transparent h-12">
              <TabsTrigger
                value="preview"
                className="gap-2 data-[state=active]:bg-gray-100"
              >
                <Monitor className="w-4 h-4" />
                Live Preview
              </TabsTrigger>
              <TabsTrigger
                value="templates"
                className="gap-2 data-[state=active]:bg-gray-100"
              >
                <Sparkles className="w-4 h-4" />
                Templates
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="preview" className="flex-1 m-0 overflow-hidden">
            {activeBrowserSession?.debugUrl ? (
              <div className="h-full flex flex-col">
                {/* Status bar */}
                <div className="px-4 py-2 bg-gray-50 border-b flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                      <span className="text-xs font-medium text-gray-600">Live Session</span>
                    </div>
                    {/* SSE Connection Status */}
                    <div className="flex items-center gap-1 text-xs">
                      {sseConnected ? (
                        <Wifi className="w-3 h-3 text-green-500" />
                      ) : (
                        <WifiOff className="w-3 h-3 text-gray-400" />
                      )}
                      <span className={sseConnected ? 'text-green-600' : 'text-gray-400'}>
                        {connectionState === 'connecting' ? 'Connecting...' : sseConnected ? 'Real-time' : 'Polling'}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs gap-1"
                    onClick={() => window.open(activeBrowserSession.debugUrl, '_blank')}
                  >
                    <ExternalLink className="w-3 h-3" />
                    Open in Tab
                  </Button>
                </div>

                {/* Browser iframe */}
                <div className="flex-1 relative">
                  <iframe
                    src={activeBrowserSession.debugUrl}
                    className="absolute inset-0 w-full h-full border-none"
                    title="Live Browser Preview"
                    allow="clipboard-read; clipboard-write"
                  />
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Monitor className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">No Active Session</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Start an agent task that uses browser automation to see the live preview here.
                </p>
                {currentExecution && statusInfo && (
                  <Badge variant="secondary" className={cn('gap-1', statusInfo.color)}>
                    <statusInfo.icon className="w-3 h-3" />
                    {statusInfo.label}
                  </Badge>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="templates" className="flex-1 m-0 overflow-hidden">
            <TaskTemplates
              onSelectTemplate={handleSelectTemplate}
              className="h-full"
            />
          </TabsContent>
        </Tabs>
      </aside>

      {/* Mobile/Tablet Templates Sheet */}
      <Sheet open={showTemplates} onOpenChange={setShowTemplates}>
        <SheetContent side="right" className="w-full sm:max-w-md p-0">
          <SheetHeader className="p-4 border-b">
            <SheetTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              Task Templates
            </SheetTitle>
          </SheetHeader>
          <TaskTemplates
            onSelectTemplate={handleSelectTemplate}
            className="h-[calc(100vh-80px)]"
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}

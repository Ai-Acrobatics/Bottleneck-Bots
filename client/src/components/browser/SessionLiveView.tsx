/**
 * SessionLiveView Component
 * Live browser feed with real-time controls and screenshot capture
 * Features: live streaming, browser controls, recording, screenshots
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useBrowserSession } from '@/hooks/useBrowserSession';
import { useWebSocketStore } from '@/stores/websocketStore';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Monitor,
  Play,
  Pause,
  Camera,
  Download,
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Navigation,
  Type,
  MousePointerClick,
  Activity,
  Wifi,
  WifiOff,
  Maximize2,
  Minimize2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import type { BrowserAction, BrowserActionType, LiveViewState } from './types';

interface SessionLiveViewProps {
  sessionId: string;
  onClose?: () => void;
}

export function SessionLiveView({ sessionId, onClose }: SessionLiveViewProps) {
  const { liveView, logs, connectionState, isLoading, error, refetch } =
    useBrowserSession(sessionId);
  const { isConnected } = useWebSocketStore();

  // Local state
  const [isRecording, setIsRecording] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [navigationUrl, setNavigationUrl] = useState('');
  const [actionType, setActionType] = useState<BrowserActionType>('click');
  const [actionTarget, setActionTarget] = useState('');
  const [actionValue, setActionValue] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState<string | undefined>();
  const [liveState, setLiveState] = useState<LiveViewState>({
    isConnected: false,
    isRecording: false,
    lastUpdate: new Date().toISOString(),
    fps: 0,
    latency: 0,
  });

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Update live state
  useEffect(() => {
    setLiveState((prev) => ({
      ...prev,
      isConnected,
      lastUpdate: new Date().toISOString(),
    }));
  }, [isConnected]);

  // Handle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!iframeRef.current) return;

    if (!document.fullscreenElement) {
      iframeRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // tRPC mutations
  const navigateMutation = trpc.browser.navigateTo.useMutation();
  const clickMutation = trpc.browser.clickElement.useMutation();
  const typeMutation = trpc.browser.typeText.useMutation();
  const screenshotMutation = trpc.browser.takeScreenshot.useMutation();
  const actMutation = trpc.browser.act.useMutation();

  // Browser control actions
  const executeAction = useCallback(
    async (action: BrowserAction) => {
      try {
        toast.info(`Executing: ${action.type} ${action.target || ''}`);

        switch (action.type) {
          case 'navigate':
            if (action.target) {
              await navigateMutation.mutateAsync({
                sessionId,
                url: action.target.startsWith('http') ? action.target : `https://${action.target}`,
                waitUntil: 'load',
              });
            }
            break;

          case 'click':
            if (action.target) {
              await clickMutation.mutateAsync({
                sessionId,
                selector: action.target,
                instruction: typeof action.value === 'string' ? action.value : undefined,
              });
            }
            break;

          case 'type':
            if (action.target) {
              await typeMutation.mutateAsync({
                sessionId,
                selector: action.target,
                text: typeof action.value === 'string' ? action.value : '',
              });
            }
            break;

          case 'back':
          case 'forward':
          case 'refresh':
            // Use act mutation for browser navigation commands
            await actMutation.mutateAsync({
              sessionId,
              instruction: `Click the browser ${action.type} button`,
            });
            break;

          case 'scroll':
            await actMutation.mutateAsync({
              sessionId,
              instruction: `Scroll ${action.target || 'down'} on the page`,
            });
            break;

          case 'extract':
            await actMutation.mutateAsync({
              sessionId,
              instruction: action.target || 'Extract all visible text content',
            });
            break;

          case 'wait':
            await actMutation.mutateAsync({
              sessionId,
              instruction: `Wait for ${action.target || 'page to load'}`,
            });
            break;

          default:
            // Generic action via AI instruction
            await actMutation.mutateAsync({
              sessionId,
              instruction: `${action.type}: ${action.target || ''} ${action.value || ''}`.trim(),
            });
        }

        toast.success(`Action completed: ${action.type}`);
        refetch(); // Refresh session data
      } catch (error: any) {
        console.error('Browser action error:', error);
        toast.error(`Action failed: ${error.message || 'Unknown error'}`);
      }
    },
    [sessionId, navigateMutation, clickMutation, typeMutation, actMutation, refetch]
  );

  // Navigation handlers
  const handleNavigate = useCallback(async () => {
    if (!navigationUrl.trim()) {
      toast.error('Please enter a URL');
      return;
    }

    await executeAction({
      type: 'navigate',
      target: navigationUrl,
    });
  }, [navigationUrl, executeAction]);

  const handleBack = useCallback(() => executeAction({ type: 'back' }), [executeAction]);
  const handleForward = useCallback(() => executeAction({ type: 'forward' }), [executeAction]);
  const handleRefresh = useCallback(() => executeAction({ type: 'refresh' }), [executeAction]);

  // Screenshot handler
  const handleScreenshot = useCallback(async () => {
    try {
      toast.info('Capturing screenshot...');

      const result = await screenshotMutation.mutateAsync({
        sessionId,
        fullPage: false,
        quality: 90,
      });

      if (result.screenshot) {
        setScreenshotUrl(result.screenshot);
        toast.success('Screenshot captured successfully');
      } else {
        toast.success('Screenshot captured');
      }
    } catch (error: any) {
      console.error('Screenshot error:', error);
      toast.error(`Screenshot failed: ${error.message || 'Unknown error'}`);
    }
  }, [sessionId, screenshotMutation]);

  // Recording handlers
  const toggleRecording = useCallback(async () => {
    try {
      if (isRecording) {
        // PLACEHOLDER: Stop recording API call
        toast.info('Stopping recording...');
        setIsRecording(false);
        setLiveState((prev) => ({ ...prev, isRecording: false }));
        toast.success('Recording stopped');
      } else {
        // PLACEHOLDER: Start recording API call
        toast.info('Starting recording...');
        setIsRecording(true);
        setLiveState((prev) => ({ ...prev, isRecording: true }));
        toast.success('Recording started');
      }
    } catch (error: any) {
      toast.error(`Recording failed: ${error.message || 'Unknown error'}`);
    }
  }, [isRecording]);

  // Custom action handler
  const handleCustomAction = useCallback(async () => {
    if (!actionTarget.trim()) {
      toast.error('Please enter a target selector');
      return;
    }

    await executeAction({
      type: actionType,
      target: actionTarget,
      value: actionValue || undefined,
    });

    // Clear inputs after execution
    setActionTarget('');
    setActionValue('');
  }, [actionType, actionTarget, actionValue, executeAction]);

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center gap-4">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
            <p className="text-sm text-slate-500">Loading live view...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <AlertCircle className="h-5 w-5" />
            Failed to load live view
          </CardTitle>
          <CardDescription className="text-red-600">
            {error.message || 'An error occurred while loading the live view'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button onClick={() => refetch()} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
            {onClose && (
              <Button onClick={onClose} variant="ghost">
                Close
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Live Browser Session
              </CardTitle>
              <CardDescription className="mt-1">Session ID: {sessionId}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={liveState.isConnected ? 'default' : 'secondary'} className="gap-1">
                {liveState.isConnected ? (
                  <Wifi className="h-3 w-3" />
                ) : (
                  <WifiOff className="h-3 w-3" />
                )}
                {liveState.isConnected ? 'Connected' : 'Disconnected'}
              </Badge>
              {liveState.isRecording && (
                <Badge variant="destructive" className="gap-1 animate-pulse">
                  <Activity className="h-3 w-3" />
                  Recording
                </Badge>
              )}
              {onClose && (
                <Button onClick={onClose} variant="outline" size="sm">
                  Close
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Control Toolbar */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Navigation Controls */}
            <div className="flex gap-2 items-center">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" onClick={handleBack} className="px-3">
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Back</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" onClick={handleForward} className="px-3">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Forward</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" onClick={handleRefresh} className="px-3">
                      <RotateCw className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Refresh</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <div className="flex-1 flex gap-2">
                <div className="relative flex-1">
                  <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Enter URL to navigate..."
                    value={navigationUrl}
                    onChange={(e) => setNavigationUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleNavigate()}
                    className="pl-10"
                  />
                </div>
                <Button onClick={handleNavigate} size="sm">
                  Go
                </Button>
              </div>
            </div>

            {/* Action Controls */}
            <div className="flex gap-2 items-end">
              <div className="flex-1 space-y-2">
                <label className="text-xs font-medium text-slate-700">Custom Action</label>
                <div className="flex gap-2">
                  <select
                    value={actionType}
                    onChange={(e) => setActionType(e.target.value as BrowserActionType)}
                    className="px-3 py-2 text-sm border rounded-md bg-white"
                  >
                    <option value="click">Click</option>
                    <option value="type">Type</option>
                    <option value="navigate">Navigate</option>
                    <option value="scroll">Scroll</option>
                    <option value="extract">Extract</option>
                    <option value="wait">Wait</option>
                  </select>

                  <Input
                    placeholder="Target selector (e.g., button.submit)"
                    value={actionTarget}
                    onChange={(e) => setActionTarget(e.target.value)}
                    className="flex-1"
                  />

                  {actionType === 'type' && (
                    <Input
                      placeholder="Text to type"
                      value={actionValue}
                      onChange={(e) => setActionValue(e.target.value)}
                      className="flex-1"
                    />
                  )}

                  <Button onClick={handleCustomAction} size="sm">
                    Execute
                  </Button>
                </div>
              </div>
            </div>

            {/* Recording and Screenshot Controls */}
            <div className="flex gap-2 pt-2 border-t">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={isRecording ? 'destructive' : 'outline'}
                      size="sm"
                      onClick={toggleRecording}
                      className="gap-2"
                    >
                      {isRecording ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      {isRecording ? 'Stop' : 'Record'}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isRecording ? 'Stop recording session' : 'Start recording session'}
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" onClick={handleScreenshot} className="gap-2">
                      <Camera className="h-4 w-4" />
                      Screenshot
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Capture screenshot</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" onClick={toggleFullscreen} className="gap-2">
                      {isFullscreen ? (
                        <Minimize2 className="h-4 w-4" />
                      ) : (
                        <Maximize2 className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                  </TooltipContent>
                </Tooltip>

                {screenshotUrl && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(screenshotUrl, '_blank')}
                        className="gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Download screenshot</TooltipContent>
                  </Tooltip>
                )}
              </TooltipProvider>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live View Display */}
      <Card>
        <CardContent className="p-0">
          <div className="relative bg-slate-900 rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
            {liveView?.liveViewUrl ? (
              <iframe
                ref={iframeRef}
                src={liveView.liveViewUrl}
                className="w-full h-full"
                title="Live Browser View"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Monitor className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">No live view available</p>
                  <p className="text-sm text-slate-500 mt-2">
                    {/* PLACEHOLDER: Add instructions for starting live view */}
                    The session may not support live viewing or has ended
                  </p>
                </div>
              </div>
            )}

            {/* Overlay Stats */}
            {liveView?.liveViewUrl && (
              <div className="absolute top-4 right-4 flex gap-2">
                <Badge className="bg-black/50 backdrop-blur-sm">
                  FPS: {liveState.fps || 0}
                </Badge>
                <Badge className="bg-black/50 backdrop-blur-sm">
                  Latency: {liveState.latency || 0}ms
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Session Logs */}
      {logs && logs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Session Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 max-h-64 overflow-y-auto font-mono text-xs">
              {logs.map((log, index) => (
                <div
                  key={`${log.timestamp}-${index}`}
                  className={`p-2 rounded ${
                    log.level === 'error'
                      ? 'bg-red-50 text-red-700'
                      : log.level === 'warn'
                      ? 'bg-yellow-50 text-yellow-700'
                      : 'bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="text-slate-500">{log.timestamp}</span> {log.message}
                  {log.metadata && (
                    <div className="text-xs opacity-75 mt-1">
                      {JSON.stringify(log.metadata, null, 2)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

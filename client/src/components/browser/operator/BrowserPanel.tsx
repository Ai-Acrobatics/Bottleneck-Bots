/**
 * BrowserPanel - Live browser view with URL bar and controls
 */

import React, { useRef, useState } from 'react';
import { useOperatorStore } from '@/stores/operatorStore';
import { trpc } from '@/lib/trpc';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Globe,
  Loader2,
  Monitor,
  ExternalLink,
  Camera,
  Maximize2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface BrowserPanelProps {
  className?: string;
}

export function BrowserPanel({ className }: BrowserPanelProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  const {
    sessionId,
    liveViewUrl,
    currentUrl,
    setCurrentUrl,
    isSessionActive,
    addMessage,
  } = useOperatorStore();

  // tRPC mutations
  const navigateMutation = trpc.browser.navigateTo.useMutation();
  const screenshotMutation = trpc.browser.takeScreenshot.useMutation();
  const actMutation = trpc.browser.act.useMutation();

  // Handle navigation
  const handleNavigate = async () => {
    if (!urlInput.trim() || !sessionId) return;

    setIsNavigating(true);
    try {
      const url = urlInput.startsWith('http') ? urlInput : `https://${urlInput}`;
      await navigateMutation.mutateAsync({
        sessionId,
        url,
        waitUntil: 'load',
      });
      setCurrentUrl(url);
      addMessage({
        type: 'action',
        content: `Navigated to ${url}`,
        actionType: 'navigate',
        actionStatus: 'completed',
      });
      toast.success('Navigation complete');
    } catch (error: any) {
      toast.error(error.message || 'Navigation failed');
    } finally {
      setIsNavigating(false);
    }
  };

  // Handle back/forward/refresh
  const handleBrowserAction = async (action: 'back' | 'forward' | 'refresh') => {
    if (!sessionId) return;

    try {
      await actMutation.mutateAsync({
        sessionId,
        instruction: `Click the browser ${action} button`,
      });
      toast.success(`${action} completed`);
    } catch (error: any) {
      toast.error(error.message || `${action} failed`);
    }
  };

  // Handle screenshot
  const handleScreenshot = async () => {
    if (!sessionId) return;

    try {
      const result = await screenshotMutation.mutateAsync({
        sessionId,
        fullPage: false,
        quality: 90,
      });

      if (result.screenshot) {
        addMessage({
          type: 'screenshot',
          content: 'Screenshot captured',
          screenshotUrl: result.screenshot,
        });
        toast.success('Screenshot captured');
      }
    } catch (error: any) {
      toast.error(error.message || 'Screenshot failed');
    }
  };

  // Open in new tab
  const handleOpenExternal = () => {
    if (liveViewUrl) {
      window.open(liveViewUrl, '_blank');
    }
  };

  // Handle fullscreen
  const handleFullscreen = () => {
    if (iframeRef.current) {
      iframeRef.current.requestFullscreen();
    }
  };

  return (
    <Card className={cn('flex flex-col overflow-hidden', className)}>
      {/* URL Bar */}
      <div className="flex items-center gap-2 p-2 bg-slate-100 border-b">
        {/* Navigation buttons */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => handleBrowserAction('back')}
            disabled={!isSessionActive}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => handleBrowserAction('forward')}
            disabled={!isSessionActive}
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => handleBrowserAction('refresh')}
            disabled={!isSessionActive}
          >
            <RotateCw className={cn('h-4 w-4', isNavigating && 'animate-spin')} />
          </Button>
        </div>

        {/* URL input */}
        <div className="flex-1 flex items-center gap-2 bg-white rounded-lg px-3 py-1.5 border">
          <Globe className="h-4 w-4 text-slate-400 flex-shrink-0" />
          <Input
            value={urlInput || currentUrl}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleNavigate()}
            placeholder="Enter URL..."
            className="border-0 h-auto p-0 focus-visible:ring-0 text-sm"
            disabled={!isSessionActive}
          />
          {isNavigating && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={handleScreenshot}
            disabled={!isSessionActive}
            title="Take screenshot"
          >
            <Camera className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={handleOpenExternal}
            disabled={!liveViewUrl}
            title="Open in new tab"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={handleFullscreen}
            disabled={!liveViewUrl}
            title="Fullscreen"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Browser View */}
      <div className="flex-1 bg-slate-900 relative">
        {liveViewUrl ? (
          <iframe
            ref={iframeRef}
            src={liveViewUrl}
            className="w-full h-full border-0"
            title="Live Browser View"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
            <Monitor className="h-16 w-16 text-slate-600 mb-4" />
            <h3 className="text-lg font-medium text-slate-400 mb-2">No Active Session</h3>
            <p className="text-sm text-slate-500 text-center max-w-xs">
              Send a command in the chat to start a browser session
            </p>
          </div>
        )}

        {/* Session indicator */}
        {isSessionActive && (
          <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/70 text-white px-3 py-1.5 rounded-full text-xs backdrop-blur-sm">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Session: {sessionId?.slice(0, 8)}...
          </div>
        )}
      </div>
    </Card>
  );
}

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Maximize2, Minimize2, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface LiveBrowserViewProps {
  sessionId?: string;
  debugUrl?: string;
  className?: string;
}

export function LiveBrowserView({ sessionId, debugUrl, className = '' }: LiveBrowserViewProps) {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  if (!sessionId || !debugUrl) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-sm">Live Browser View</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No active session available. Start a browser automation to see the live view.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const BrowserIframe = () => (
    <div className="relative w-full h-full min-h-[400px]">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-2" />
            <p className="text-sm text-slate-600">Loading live browser view...</p>
          </div>
        </div>
      )}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load live browser view. The session may have expired or the debug URL is invalid.
            </AlertDescription>
          </Alert>
        </div>
      )}
      <iframe
        src={debugUrl}
        className="w-full h-full border-none"
        title={`Live Browser View - ${sessionId}`}
        allow="clipboard-read; clipboard-write"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
      />
    </div>
  );

  return (
    <>
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Live Browser View</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              onClick={() => window.open(debugUrl, '_blank')}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              onClick={() => setIsFullScreen(true)}
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <BrowserIframe />
        </CardContent>
      </Card>

      {/* Full Screen Dialog */}
      <Dialog open={isFullScreen} onOpenChange={setIsFullScreen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h3 className="font-semibold">Live Browser View</h3>
                <p className="text-xs text-slate-500">Session: {sessionId}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFullScreen(false)}
              >
                <Minimize2 className="h-4 w-4 mr-2" />
                Exit Full Screen
              </Button>
            </div>
            <div className="flex-1 overflow-hidden">
              <BrowserIframe />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

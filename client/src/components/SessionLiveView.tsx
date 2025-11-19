import { useEffect, useState, useRef } from 'react';

interface SessionLiveViewProps {
  sessionId: string;
  liveViewUrl: string;
  readOnly?: boolean;
  hideNavbar?: boolean;
  onDisconnect?: () => void;
  className?: string;
}

interface BrowserbaseDisconnectedMessage {
  type: 'browserbase-disconnected';
  sessionId: string;
}

export default function SessionLiveView({
  sessionId,
  liveViewUrl,
  readOnly = false,
  hideNavbar = false,
  onDisconnect,
  className = '',
}: SessionLiveViewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isDisconnected, setIsDisconnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Construct the iframe URL with query parameters
  const iframeUrl = (() => {
    try {
      const url = new URL(liveViewUrl);
      if (hideNavbar) {
        url.searchParams.set('navbar', 'false');
      }
      return url.toString();
    } catch (err) {
      setError('Invalid live view URL provided');
      return '';
    }
  })();

  useEffect(() => {
    // Handle postMessage events from the Browserbase iframe
    const handleMessage = (event: MessageEvent) => {
      // Verify the message is from Browserbase (optional: add origin validation)
      if (event.data && typeof event.data === 'object') {
        const message = event.data as BrowserbaseDisconnectedMessage;

        if (message.type === 'browserbase-disconnected' && message.sessionId === sessionId) {
          setIsDisconnected(true);
          setIsLoading(false);
          onDisconnect?.();
        }
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [sessionId, onDisconnect]);

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setError('Failed to load live session view');
  };

  if (error) {
    return (
      <div className={`flex items-center justify-center min-h-[600px] bg-gray-50 rounded-lg border-2 border-red-200 ${className}`}>
        <div className="text-center p-8">
          <svg
            className="mx-auto h-12 w-12 text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Error Loading Session</h3>
          <p className="mt-2 text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (isDisconnected) {
    return (
      <div className={`flex items-center justify-center min-h-[600px] bg-gray-50 rounded-lg border-2 border-gray-200 ${className}`}>
        <div className="text-center p-8">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Session Disconnected</h3>
          <p className="mt-2 text-sm text-gray-500">
            The browser session has ended or disconnected.
          </p>
          <p className="mt-1 text-xs text-gray-400">Session ID: {sessionId}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full min-h-[600px] ${className}`}>
      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-gray-200 z-10">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-4 text-sm text-gray-600">Loading live session view...</p>
            {readOnly && (
              <p className="mt-2 text-xs text-gray-500">Read-only mode</p>
            )}
          </div>
        </div>
      )}

      {/* Iframe */}
      {iframeUrl && (
        <iframe
          ref={iframeRef}
          src={iframeUrl}
          title={`Browserbase Live Session - ${sessionId}`}
          className="w-full h-full min-h-[600px] rounded-lg border-2 border-gray-200"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-downloads"
          allow="clipboard-read; clipboard-write; fullscreen; display-capture"
          style={{
            display: isLoading ? 'none' : 'block',
          }}
        />
      )}

      {/* Session Info Badge (optional) */}
      {!isLoading && !isDisconnected && (
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-md px-3 py-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="font-medium text-gray-700">Live</span>
            </div>
            {readOnly && (
              <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                Read Only
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

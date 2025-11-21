import React, { useEffect, useRef } from 'react';

interface OAuthPopupProps {
  url: string;
  onSuccess: (data: any) => void;
  onError: (error: string) => void;
  onClose: () => void;
  width?: number;
  height?: number;
}

export function useOAuthPopup() {
  const popupRef = useRef<Window | null>(null);

  const openPopup = ({
    url,
    onSuccess,
    onError,
    onClose,
    width = 800,
    height = 600,
  }: OAuthPopupProps) => {
    // Close existing popup if any
    if (popupRef.current && !popupRef.current.closed) {
      popupRef.current.close();
    }

    // Calculate center position
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    // Open popup window
    popupRef.current = window.open(
      url,
      'OAuth',
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,location=no,status=no,scrollbars=yes,resizable=yes`
    );

    if (!popupRef.current) {
      onError('Failed to open popup. Please allow popups for this site.');
      return;
    }

    // Listen for messages from popup
    const handleMessage = (event: MessageEvent) => {
      // Validate origin for security
      if (event.origin !== window.location.origin) return;

      if (event.data.type === 'oauth-success') {
        onSuccess(event.data.data);
        if (popupRef.current) {
          popupRef.current.close();
        }
        window.removeEventListener('message', handleMessage);
      } else if (event.data.type === 'oauth-error') {
        onError(event.data.error);
        if (popupRef.current) {
          popupRef.current.close();
        }
        window.removeEventListener('message', handleMessage);
      }
    };

    window.addEventListener('message', handleMessage);

    // Check if popup was closed by user
    const checkPopupClosed = setInterval(() => {
      if (popupRef.current && popupRef.current.closed) {
        clearInterval(checkPopupClosed);
        window.removeEventListener('message', handleMessage);
        onClose();
      }
    }, 500);

    return () => {
      clearInterval(checkPopupClosed);
      window.removeEventListener('message', handleMessage);
      if (popupRef.current && !popupRef.current.closed) {
        popupRef.current.close();
      }
    };
  };

  return { openPopup };
}

// Component to be used in the OAuth callback page
export function OAuthCallback() {
  useEffect(() => {
    // Parse URL params to get OAuth result
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const error = params.get('error');
    const state = params.get('state');

    if (window.opener) {
      if (error) {
        window.opener.postMessage(
          {
            type: 'oauth-error',
            error: error,
          },
          window.location.origin
        );
      } else if (code) {
        window.opener.postMessage(
          {
            type: 'oauth-success',
            data: { code, state },
          },
          window.location.origin
        );
      }
    }
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Completing authentication...</p>
      </div>
    </div>
  );
}

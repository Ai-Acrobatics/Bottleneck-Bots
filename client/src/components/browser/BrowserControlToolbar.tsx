import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Camera,
  Terminal,
  Network,
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';

interface BrowserControlToolbarProps {
  currentUrl?: string;
  isLoading?: boolean;
  onRefresh?: () => void;
  onScreenshot?: () => void;
  onToggleConsole?: () => void;
  onToggleNetwork?: () => void;
  consoleVisible?: boolean;
  networkVisible?: boolean;
}

export function BrowserControlToolbar({
  currentUrl = 'about:blank',
  isLoading = false,
  onRefresh,
  onScreenshot,
  onToggleConsole,
  onToggleNetwork,
  consoleVisible = false,
  networkVisible = false,
}: BrowserControlToolbarProps) {
  const handleScreenshot = () => {
    if (onScreenshot) {
      onScreenshot();
    } else {
      toast.info('Screenshot functionality not available');
    }
  };

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      toast.info('Refresh functionality not available');
    }
  };

  return (
    <div className="bg-white border-b border-slate-200 px-3 py-2">
      {/* Top Row: Browser Controls */}
      <div className="flex items-center gap-2 mb-2">
        {/* Navigation Buttons */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 opacity-50 cursor-not-allowed"
            disabled
            title="Back (Not available)"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 opacity-50 cursor-not-allowed"
            disabled
            title="Forward (Not available)"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={handleRefresh}
            disabled={isLoading}
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* URL Bar */}
        <div className="flex-1 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
          <Lock className="h-3 w-3 text-green-600 flex-shrink-0" />
          <Input
            value={currentUrl}
            readOnly
            className="border-0 bg-transparent text-xs font-mono p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 gap-1"
            onClick={handleScreenshot}
            title="Take Screenshot"
          >
            <Camera className="h-4 w-4" />
            <span className="hidden md:inline text-xs">Screenshot</span>
          </Button>
        </div>
      </div>

      {/* Bottom Row: Developer Tools */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500 font-medium">Developer Tools:</span>
        <Button
          variant={consoleVisible ? 'default' : 'outline'}
          size="sm"
          className="h-7 px-2 gap-1 text-xs"
          onClick={onToggleConsole}
        >
          <Terminal className="h-3 w-3" />
          Console
        </Button>
        <Button
          variant={networkVisible ? 'default' : 'outline'}
          size="sm"
          className="h-7 px-2 gap-1 text-xs"
          onClick={onToggleNetwork}
        >
          <Network className="h-3 w-3" />
          Network
        </Button>
      </div>
    </div>
  );
}

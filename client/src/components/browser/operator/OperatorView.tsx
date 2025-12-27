/**
 * OperatorView - Main AI Browser Operator Component
 * Manus/ChatGPT Operator-style interface with flexible layouts
 */

import React, { useEffect } from 'react';
import { useOperatorStore, LayoutMode } from '@/stores/operatorStore';
import { ChatPanel } from './ChatPanel';
import { BrowserPanel } from './BrowserPanel';
import { FloatingChat } from './FloatingChat';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  LayoutPanelLeft,
  Maximize2,
  LayoutGrid,
  Monitor,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function OperatorView() {
  const {
    layoutMode,
    setLayoutMode,
    splitRatio,
    setSplitRatio,
    activeTab,
    setActiveTab,
    isSessionActive,
  } = useOperatorStore();

  // Layout mode buttons
  const layoutButtons = [
    { mode: 'split' as LayoutMode, icon: LayoutPanelLeft, label: 'Split View' },
    { mode: 'fullBrowser' as LayoutMode, icon: Maximize2, label: 'Full Browser' },
    { mode: 'tabbed' as LayoutMode, icon: LayoutGrid, label: 'Tabbed' },
  ];

  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b">
        <div className="flex items-center gap-2">
          <Monitor className="h-5 w-5 text-purple-600" />
          <span className="font-semibold text-slate-800">AI Browser</span>
          {isSessionActive && (
            <span className="flex items-center gap-1.5 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              Live
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
          {layoutButtons.map(({ mode, icon: Icon, label }) => (
            <Button
              key={mode}
              variant={layoutMode === mode ? 'default' : 'ghost'}
              size="sm"
              className={cn(
                'h-8 px-3 gap-1.5',
                layoutMode === mode && 'bg-white shadow-sm'
              )}
              onClick={() => setLayoutMode(mode)}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline text-xs">{label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {layoutMode === 'split' && (
          <ResizablePanelGroup
            direction="horizontal"
            className="h-full"
            onLayout={(sizes) => setSplitRatio(sizes[0] / 100)}
          >
            <ResizablePanel
              defaultSize={splitRatio * 100}
              minSize={20}
              maxSize={60}
            >
              <ChatPanel className="h-full" />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={(1 - splitRatio) * 100} minSize={40}>
              <BrowserPanel className="h-full" />
            </ResizablePanel>
          </ResizablePanelGroup>
        )}

        {layoutMode === 'fullBrowser' && (
          <div className="relative h-full">
            <BrowserPanel className="h-full" />
            <FloatingChat />
          </div>
        )}

        {layoutMode === 'tabbed' && (
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as 'chat' | 'browser')}
            className="h-full flex flex-col"
          >
            <TabsList className="mx-4 mt-2 grid w-auto grid-cols-2 max-w-xs">
              <TabsTrigger value="chat" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="browser" className="gap-2">
                <Monitor className="h-4 w-4" />
                Browser
              </TabsTrigger>
            </TabsList>
            <TabsContent value="chat" className="flex-1 mt-0 p-4">
              <ChatPanel className="h-full" />
            </TabsContent>
            <TabsContent value="browser" className="flex-1 mt-0 p-4">
              <BrowserPanel className="h-full" />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}

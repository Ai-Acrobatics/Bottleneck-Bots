/**
 * FloatingChat - Draggable floating panel for full-browser mode
 * Condensed chat view with collapse/expand functionality
 */

import React, { useState, useRef, useEffect } from 'react';
import { useOperatorStore, OperatorMessage } from '@/stores/operatorStore';
import { trpc } from '@/lib/trpc';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Send,
  Loader2,
  GripVertical,
  X,
  Minimize2,
  Bot,
  User,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface FloatingChatProps {
  className?: string;
}

// Compact message component
function CompactMessage({ message }: { message: OperatorMessage }) {
  const isUser = message.type === 'user';
  const isError = message.type === 'error';
  const isAction = message.type === 'action';

  return (
    <div
      className={cn(
        'flex items-start gap-2 p-2 rounded text-xs',
        isUser && 'bg-purple-50',
        isError && 'bg-red-50',
        !isUser && !isError && 'bg-slate-50'
      )}
    >
      <div className={cn(
        'flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px]',
        isUser ? 'bg-purple-600 text-white' : isError ? 'bg-red-100 text-red-600' : 'bg-slate-200 text-slate-600'
      )}>
        {isUser ? <User className="h-3 w-3" /> : isError ? <AlertCircle className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
      </div>
      <div className="flex-1 min-w-0">
        {isAction && message.actionStatus && (
          <Badge
            variant={message.actionStatus === 'completed' ? 'default' : message.actionStatus === 'failed' ? 'destructive' : 'secondary'}
            className="text-[10px] h-4 mb-1"
          >
            {message.actionType}
          </Badge>
        )}
        <p className="truncate text-slate-700">{message.content}</p>
      </div>
    </div>
  );
}

export function FloatingChat({ className }: FloatingChatProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [localInput, setLocalInput] = useState('');

  const {
    messages,
    addMessage,
    updateMessage,
    isLoading,
    setLoading,
    floatingPanelPosition,
    setFloatingPanelPosition,
    floatingPanelCollapsed,
    setFloatingPanelCollapsed,
    setSession,
    setCurrentUrl,
  } = useOperatorStore();

  // tRPC mutations
  const chatMutation = trpc.ai.chat.useMutation();

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current && !floatingPanelCollapsed) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, floatingPanelCollapsed]);

  // Handle drag start
  const handleDragStart = (e: React.MouseEvent) => {
    if (!panelRef.current) return;

    const rect = panelRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setIsDragging(true);
  };

  // Handle drag move
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;

      // Keep panel within viewport
      const maxX = window.innerWidth - (panelRef.current?.offsetWidth || 320);
      const maxY = window.innerHeight - (panelRef.current?.offsetHeight || 400);

      setFloatingPanelPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, setFloatingPanelPosition]);

  // Handle send
  const handleSend = async () => {
    const input = localInput.trim();
    if (!input || isLoading) return;

    addMessage({ type: 'user', content: input });
    setLocalInput('');
    setLoading(true);

    const actionId = Date.now().toString();
    addMessage({
      type: 'action',
      content: `Executing: ${input}`,
      actionType: 'click',
      actionStatus: 'running',
    });

    try {
      const result = await chatMutation.mutateAsync({
        instruction: input,
      });

      if (result.sessionId && result.liveViewUrl) {
        setSession(result.sessionId, result.liveViewUrl);
      }

      if (result.currentUrl) {
        setCurrentUrl(result.currentUrl);
      }

      updateMessage(actionId, { actionStatus: 'completed' });

      addMessage({
        type: 'assistant',
        content: result.message || 'Action completed',
      });

      if (result.screenshot) {
        addMessage({
          type: 'screenshot',
          content: 'Screenshot captured',
          screenshotUrl: result.screenshot,
        });
      }
    } catch (error: any) {
      updateMessage(actionId, { actionStatus: 'failed' });
      addMessage({
        type: 'error',
        content: error.message || 'Action failed',
        canRetry: true,
      });
      toast.error('Action failed');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Get last few messages for collapsed view
  const recentMessages = messages.slice(-3);

  return (
    <Card
      ref={panelRef}
      className={cn(
        'fixed shadow-2xl border-2 transition-all duration-200',
        floatingPanelCollapsed ? 'w-72' : 'w-80',
        isDragging && 'cursor-grabbing',
        className
      )}
      style={{
        left: floatingPanelPosition.x,
        top: floatingPanelPosition.y,
        zIndex: 1000,
      }}
    >
      {/* Header - Draggable */}
      <div
        className={cn(
          'flex items-center gap-2 px-3 py-2 bg-slate-100 border-b cursor-grab',
          isDragging && 'cursor-grabbing'
        )}
        onMouseDown={handleDragStart}
      >
        <GripVertical className="h-4 w-4 text-slate-400" />
        <MessageSquare className="h-4 w-4 text-purple-600" />
        <span className="flex-1 text-sm font-medium text-slate-700">Chat</span>

        {messages.length > 0 && (
          <Badge variant="secondary" className="text-xs">
            {messages.length}
          </Badge>
        )}

        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={() => setFloatingPanelCollapsed(!floatingPanelCollapsed)}
        >
          {floatingPanelCollapsed ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Collapsed View - Recent messages preview */}
      {floatingPanelCollapsed && recentMessages.length > 0 && (
        <div className="p-2 space-y-1 max-h-32 overflow-hidden">
          {recentMessages.map((msg) => (
            <div key={msg.id} className="text-xs text-slate-500 truncate">
              <span className="font-medium">{msg.type === 'user' ? 'You' : 'AI'}:</span>{' '}
              {msg.content}
            </div>
          ))}
        </div>
      )}

      {/* Expanded View */}
      {!floatingPanelCollapsed && (
        <>
          {/* Messages */}
          <ScrollArea className="h-64 p-2" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 text-xs py-8">
                <MessageSquare className="h-8 w-8 mb-2 opacity-50" />
                <p>Type a command to start</p>
              </div>
            ) : (
              <div className="space-y-2">
                {messages.map((message) => (
                  <CompactMessage key={message.id} message={message} />
                ))}
                {isLoading && (
                  <div className="flex items-center gap-2 text-xs text-slate-500 p-2">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Processing...
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Input */}
          <div className="p-2 border-t">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={localInput}
                onChange={(e) => setLocalInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type command..."
                className="flex-1 h-8 text-sm"
                disabled={isLoading}
              />
              <Button
                onClick={handleSend}
                disabled={!localInput.trim() || isLoading}
                size="sm"
                className="h-8 w-8 p-0"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}

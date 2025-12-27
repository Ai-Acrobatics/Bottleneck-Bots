/**
 * ChatPanel - Chat interface for AI Browser Operator
 * Natural language input with message history
 */

import React, { useRef, useEffect, useState } from 'react';
import { useOperatorStore, OperatorMessage } from '@/stores/operatorStore';
import { trpc } from '@/lib/trpc';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Send,
  Loader2,
  User,
  Bot,
  MousePointerClick,
  Navigation,
  Type,
  Eye,
  Database,
  Camera,
  AlertCircle,
  RotateCw,
  Globe,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ChatPanelProps {
  className?: string;
}

// Action type icons
const actionIcons = {
  navigate: Navigation,
  click: MousePointerClick,
  type: Type,
  observe: Eye,
  extract: Database,
  screenshot: Camera,
};

// Message bubble component
function MessageBubble({ message }: { message: OperatorMessage }) {
  const isUser = message.type === 'user';
  const isAction = message.type === 'action';
  const isScreenshot = message.type === 'screenshot';
  const isError = message.type === 'error';
  const isSystem = message.type === 'system';

  const ActionIcon = message.actionType ? actionIcons[message.actionType] : null;

  return (
    <div
      className={cn(
        'flex gap-3 p-3 rounded-lg',
        isUser && 'bg-purple-50 ml-8',
        !isUser && !isError && 'bg-white border mr-8',
        isError && 'bg-red-50 border-red-200 mr-8',
        isSystem && 'bg-blue-50 border-blue-200 mx-4 text-center'
      )}
    >
      {!isUser && !isSystem && (
        <div className={cn(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
          isError ? 'bg-red-100' : 'bg-purple-100'
        )}>
          {isError ? (
            <AlertCircle className="h-4 w-4 text-red-600" />
          ) : isAction && ActionIcon ? (
            <ActionIcon className="h-4 w-4 text-purple-600" />
          ) : (
            <Bot className="h-4 w-4 text-purple-600" />
          )}
        </div>
      )}

      <div className="flex-1 min-w-0">
        {isAction && (
          <div className="flex items-center gap-2 mb-1">
            <Badge
              variant={
                message.actionStatus === 'completed' ? 'default' :
                message.actionStatus === 'failed' ? 'destructive' :
                message.actionStatus === 'running' ? 'secondary' : 'outline'
              }
              className="text-xs"
            >
              {message.actionType}
              {message.actionStatus === 'running' && (
                <Loader2 className="ml-1 h-3 w-3 animate-spin" />
              )}
            </Badge>
          </div>
        )}

        <p className={cn(
          'text-sm whitespace-pre-wrap break-words',
          isUser && 'text-purple-900',
          isError && 'text-red-700'
        )}>
          {message.content}
        </p>

        {isScreenshot && message.screenshotUrl && (
          <div className="mt-2">
            <img
              src={message.screenshotUrl}
              alt="Screenshot"
              className="max-w-full h-auto rounded-lg border cursor-pointer hover:opacity-90 transition"
              onClick={() => window.open(message.screenshotUrl, '_blank')}
            />
          </div>
        )}

        {isError && message.canRetry && (
          <Button variant="outline" size="sm" className="mt-2 gap-1">
            <RotateCw className="h-3 w-3" />
            Retry
          </Button>
        )}

        <p className="text-[10px] text-slate-400 mt-1">
          {message.timestamp.toLocaleTimeString()}
        </p>
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
          <User className="h-4 w-4 text-white" />
        </div>
      )}
    </div>
  );
}

export function ChatPanel({ className }: ChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [startUrl, setStartUrl] = useState('');

  const {
    messages,
    addMessage,
    updateMessage,
    inputValue,
    setInputValue,
    isLoading,
    setLoading,
    isSessionActive,
    setSession,
    setCurrentUrl,
  } = useOperatorStore();

  // tRPC mutations
  const chatMutation = trpc.ai.chat.useMutation();
  const observeMutation = trpc.ai.observePage.useMutation();
  const extractMutation = trpc.ai.extractData.useMutation();

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Parse input to determine action type
  const parseInput = (input: string): { action: string; isNavigate: boolean; isObserve: boolean; isExtract: boolean } => {
    const lower = input.toLowerCase();
    return {
      action: input,
      isNavigate: lower.startsWith('go to ') || lower.startsWith('navigate to ') || lower.startsWith('open '),
      isObserve: lower.startsWith('what') || lower.includes('observe') || lower.includes('look at'),
      isExtract: lower.includes('extract') || lower.includes('get the') || lower.includes('find the'),
    };
  };

  // Handle send message
  const handleSend = async () => {
    const input = inputValue.trim();
    if (!input || isLoading) return;

    // Add user message
    addMessage({ type: 'user', content: input });
    setInputValue('');
    setLoading(true);

    const { isNavigate, isObserve, isExtract } = parseInput(input);

    // Add action message
    const actionId = Date.now().toString();
    const actionType = isNavigate ? 'navigate' : isObserve ? 'observe' : isExtract ? 'extract' : 'click';

    addMessage({
      type: 'action',
      content: `Executing: ${input}`,
      actionType,
      actionStatus: 'running',
    });

    try {
      let result;

      if (isObserve) {
        result = await observeMutation.mutateAsync({
          url: startUrl || '',
          instruction: input,
        } as any);

        updateMessage(actionId, { actionStatus: 'completed' });

        if (result.actions?.length) {
          addMessage({
            type: 'assistant',
            content: `Found ${result.actions.length} possible actions:\n${result.actions.map((a: any, i: number) => `${i + 1}. ${a.description || a.action}`).join('\n')}`,
          });
        }
      } else if (isExtract) {
        result = await extractMutation.mutateAsync({
          url: startUrl || '',
          instruction: input,
          schemaType: 'custom',
        } as any);

        updateMessage(actionId, { actionStatus: 'completed' });

        addMessage({
          type: 'assistant',
          content: `Extracted data:\n\`\`\`json\n${JSON.stringify(result.data, null, 2)}\n\`\`\``,
        });
      } else {
        // Default: use chat for general instructions
        result = await chatMutation.mutateAsync({
          messages: [{ role: 'user' as const, content: input }],
          startUrl: startUrl || undefined,
        }) as any;

        // Update session if we got one
        if (result.sessionId && result.liveViewUrl) {
          setSession(result.sessionId, result.liveViewUrl);
        }

        if (result.currentUrl) {
          setCurrentUrl(result.currentUrl);
          setStartUrl(result.currentUrl);
        }

        updateMessage(actionId, { actionStatus: 'completed' });

        addMessage({
          type: 'assistant',
          content: result.message || 'Action completed successfully',
        });

        // Add screenshot if available
        if (result.screenshot) {
          addMessage({
            type: 'screenshot',
            content: 'Screenshot captured',
            screenshotUrl: result.screenshot,
          });
        }
      }

      toast.success('Action completed');
    } catch (error: any) {
      updateMessage(actionId, { actionStatus: 'failed' });

      addMessage({
        type: 'error',
        content: error.message || 'An error occurred',
        error: error.message,
        canRetry: true,
      });

      toast.error('Action failed');
    } finally {
      setLoading(false);
    }
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className={cn('flex flex-col', className)}>
      {/* Header with URL input */}
      <div className="flex items-center gap-2 p-3 border-b bg-slate-50">
        <Globe className="h-4 w-4 text-slate-400" />
        <Input
          value={startUrl}
          onChange={(e) => setStartUrl(e.target.value)}
          placeholder="Enter start URL (optional)"
          className="flex-1 h-8 text-sm bg-white"
        />
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 py-12">
            <Sparkles className="h-12 w-12 text-purple-300 mb-4" />
            <h3 className="font-semibold text-slate-700 mb-2">AI Browser Ready</h3>
            <p className="text-sm max-w-xs">
              Type a command like "Go to google.com and search for React tutorials"
            </p>
            <div className="flex flex-wrap gap-2 mt-4 justify-center">
              {['Navigate to...', 'Click on...', 'Extract data from...', 'What do you see?'].map((suggestion) => (
                <Button
                  key={suggestion}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => setInputValue(suggestion)}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 text-sm text-slate-500 p-3">
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="p-3 border-t bg-white">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a command... (e.g., 'Click the login button')"
            className="flex-1"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}

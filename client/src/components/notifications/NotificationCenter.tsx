/**
 * NotificationCenter Component
 *
 * UI component for displaying notification history with bell icon and badge.
 * Provides a dropdown interface to view, manage, and configure notifications.
 */

import React, { useContext, useState } from 'react';
import {
  Bell,
  CheckCheck,
  Trash2,
  Settings,
  X,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  Bot,
} from 'lucide-react';
import { NotificationContext } from './NotificationProvider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { Notification, NotificationType } from '@/types/notifications';

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'success':
      return <CheckCircle2 className="size-4 text-green-600" />;
    case 'error':
      return <AlertCircle className="size-4 text-red-600" />;
    case 'warning':
      return <AlertTriangle className="size-4 text-amber-600" />;
    case 'info':
      return <Info className="size-4 text-blue-600" />;
    case 'agent-update':
      return <Bot className="size-4 text-purple-600" />;
  }
};

const getNotificationColor = (type: NotificationType) => {
  switch (type) {
    case 'success':
      return 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30';
    case 'error':
      return 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30';
    case 'warning':
      return 'border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30';
    case 'info':
      return 'border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30';
    case 'agent-update':
      return 'border-purple-200 bg-purple-50 dark:border-purple-900 dark:bg-purple-950/30';
  }
};

const formatTimestamp = (timestamp: number) => {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return new Date(timestamp).toLocaleDateString();
};

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onRemove: (id: string) => void;
}

function NotificationItem({ notification, onMarkAsRead, onRemove }: NotificationItemProps) {
  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
  };

  return (
    <div
      className={cn(
        'group relative rounded-lg border p-3 transition-colors',
        notification.read ? 'opacity-60 hover:opacity-80' : '',
        getNotificationColor(notification.type)
      )}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick();
        }
      }}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0">{getNotificationIcon(notification.type)}</div>

        <div className="flex-1 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium leading-tight">
              {notification.title}
              {notification.grouped && notification.groupCount && notification.groupCount > 1 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {notification.groupCount}
                </Badge>
              )}
            </p>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(notification.id);
              }}
              className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
              aria-label="Remove notification"
            >
              <X className="size-3 text-muted-foreground hover:text-foreground" />
            </button>
          </div>

          {notification.message && (
            <p className="text-xs text-muted-foreground">{notification.message}</p>
          )}

          <p className="text-xs text-muted-foreground">
            {formatTimestamp(notification.timestamp)}
          </p>
        </div>

        {!notification.read && (
          <div className="mt-2 size-2 shrink-0 rounded-full bg-blue-600" aria-label="Unread" />
        )}
      </div>
    </div>
  );
}

interface SettingsPanelProps {
  onClose: () => void;
}

function SettingsPanel({ onClose }: SettingsPanelProps) {
  const context = useContext(NotificationContext);

  if (!context) return null;

  const { settings, updateSettings } = context;

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Notification Settings</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="size-4" />
        </Button>
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="sound-enabled" className="text-sm">
            Sound alerts
          </Label>
          <Switch
            id="sound-enabled"
            checked={settings.soundEnabled}
            onCheckedChange={(checked) => updateSettings({ soundEnabled: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="group-similar" className="text-sm">
            Group similar notifications
          </Label>
          <Switch
            id="group-similar"
            checked={settings.groupSimilar}
            onCheckedChange={(checked) => updateSettings({ groupSimilar: checked })}
          />
        </div>
      </div>
    </div>
  );
}

export function NotificationCenter() {
  const context = useContext(NotificationContext);
  const [open, setOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  if (!context) {
    throw new Error('NotificationCenter must be used within NotificationProvider');
  }

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
  } = context;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative"
          aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
        >
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 size-5 items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md p-0" showCloseButton={false}>
        <div className="flex items-center justify-between border-b p-4">
          <DialogHeader className="space-y-0">
            <DialogTitle>Notifications</DialogTitle>
            {unreadCount > 0 && (
              <DialogDescription>{unreadCount} unread</DialogDescription>
            )}
          </DialogHeader>

          <div className="flex items-center gap-1">
            {!showSettings && notifications.length > 0 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                  title="Mark all as read"
                >
                  <CheckCheck className="size-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAll}
                  title="Clear all"
                >
                  <Trash2 className="size-4" />
                </Button>
              </>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              title="Settings"
            >
              <Settings className="size-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
              title="Close"
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>

        {showSettings ? (
          <SettingsPanel onClose={() => setShowSettings(false)} />
        ) : (
          <ScrollArea className="h-[400px]">
            <div
              className="space-y-2 p-4"
              role="region"
              aria-label="Notification list"
              aria-live="polite"
              aria-relevant="additions removals"
            >
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Bell className="mb-3 size-12 text-muted-foreground opacity-20" />
                  <p className="text-sm text-muted-foreground">No notifications</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={markAsRead}
                    onRemove={removeNotification}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}

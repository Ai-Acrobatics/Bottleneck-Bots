/**
 * Notification Types and Interfaces
 *
 * Type definitions for the notification system.
 */

export type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'agent-update';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  timestamp: number;
  read: boolean;
  grouped?: boolean;
  groupCount?: number;
  metadata?: {
    agentId?: string;
    taskId?: string;
    sessionId?: string;
    [key: string]: any;
  };
}

export interface NotificationGroup {
  type: NotificationType;
  title: string;
  notifications: Notification[];
  count: number;
  latestTimestamp: number;
}

export interface NotificationSettings {
  soundEnabled: boolean;
  groupSimilar: boolean;
  maxNotifications: number;
  autoMarkReadDelay?: number;
}

export interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  settings: NotificationSettings;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  updateSettings: (settings: Partial<NotificationSettings>) => void;
}

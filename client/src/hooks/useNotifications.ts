/**
 * useNotifications Hook
 *
 * Custom React hook for accessing notification context.
 * Provides convenient access to notification state and actions.
 */

import { useContext } from 'react';
import { NotificationContext } from '@/components/notifications/NotificationProvider';
import type { NotificationContextValue } from '@/types/notifications';

export function useNotifications(): NotificationContextValue {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }

  return context;
}

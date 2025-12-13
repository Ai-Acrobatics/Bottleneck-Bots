/**
 * Notification System Integration Example
 *
 * This file demonstrates how to integrate the notification system
 * into your application and use it with various features.
 */

import React from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Example 1: Basic notification usage
 */
export function BasicNotificationExample() {
  const { addNotification } = useNotifications();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Notifications</CardTitle>
        <CardDescription>Click buttons to trigger different notification types</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button
          onClick={() =>
            addNotification({
              type: 'success',
              title: 'Success!',
              message: 'Operation completed successfully',
            })
          }
        >
          Success Notification
        </Button>

        <Button
          onClick={() =>
            addNotification({
              type: 'error',
              title: 'Error occurred',
              message: 'Failed to complete operation',
            })
          }
          variant="destructive"
        >
          Error Notification
        </Button>

        <Button
          onClick={() =>
            addNotification({
              type: 'warning',
              title: 'Warning',
              message: 'Please review before proceeding',
            })
          }
        >
          Warning Notification
        </Button>

        <Button
          onClick={() =>
            addNotification({
              type: 'info',
              title: 'Information',
              message: 'New update available',
            })
          }
        >
          Info Notification
        </Button>

        <Button
          onClick={() =>
            addNotification({
              type: 'agent-update',
              title: 'Agent started task',
              message: 'Processing your request',
            })
          }
        >
          Agent Update
        </Button>
      </CardContent>
    </Card>
  );
}

/**
 * Example 2: Notification with metadata
 */
export function NotificationWithMetadata() {
  const { addNotification } = useNotifications();

  const handleTaskComplete = (taskId: string, taskName: string) => {
    addNotification({
      type: 'success',
      title: `Task ${taskName} completed`,
      message: 'View details in the task panel',
      metadata: {
        taskId,
        taskName,
        completedAt: new Date().toISOString(),
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications with Metadata</CardTitle>
        <CardDescription>Store additional data with notifications</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={() => handleTaskComplete('task-123', 'Data Analysis')}>
          Complete Task
        </Button>
      </CardContent>
    </Card>
  );
}

/**
 * Example 3: Notification settings management
 */
export function NotificationSettings() {
  const { settings, updateSettings } = useNotifications();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Settings</CardTitle>
        <CardDescription>Configure notification behavior</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <label htmlFor="sound-toggle" className="text-sm font-medium">
            Enable Sound Alerts
          </label>
          <input
            id="sound-toggle"
            type="checkbox"
            checked={settings.soundEnabled}
            onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
            className="size-4"
          />
        </div>

        <div className="flex items-center justify-between">
          <label htmlFor="group-toggle" className="text-sm font-medium">
            Group Similar Notifications
          </label>
          <input
            id="group-toggle"
            type="checkbox"
            checked={settings.groupSimilar}
            onChange={(e) => updateSettings({ groupSimilar: e.target.checked })}
            className="size-4"
          />
        </div>

        <div className="flex items-center justify-between">
          <label htmlFor="max-notifications" className="text-sm font-medium">
            Max Notifications: {settings.maxNotifications}
          </label>
          <input
            id="max-notifications"
            type="range"
            min="10"
            max="200"
            step="10"
            value={settings.maxNotifications}
            onChange={(e) => updateSettings({ maxNotifications: parseInt(e.target.value) })}
            className="w-32"
          />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Example 4: Notification management
 */
export function NotificationManagement() {
  const { notifications, unreadCount, markAllAsRead, clearAll } = useNotifications();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Management</CardTitle>
        <CardDescription>
          {notifications.length} total, {unreadCount} unread
        </CardDescription>
      </CardHeader>
      <CardContent className="space-x-2">
        <Button onClick={markAllAsRead} disabled={unreadCount === 0}>
          Mark All Read
        </Button>

        <Button onClick={clearAll} variant="destructive" disabled={notifications.length === 0}>
          Clear All
        </Button>
      </CardContent>
    </Card>
  );
}

/**
 * Example 5: Simulated batch operations
 */
export function BatchOperationExample() {
  const { addNotification } = useNotifications();

  const simulateBatchUpload = async () => {
    const files = ['file1.pdf', 'file2.jpg', 'file3.docx'];

    for (let i = 0; i < files.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      addNotification({
        type: 'success',
        title: 'File uploaded',
        message: files[i],
        metadata: {
          fileName: files[i],
          progress: ((i + 1) / files.length) * 100,
        },
      });
    }

    addNotification({
      type: 'success',
      title: 'All files uploaded',
      message: `${files.length} files uploaded successfully`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Batch Operations</CardTitle>
        <CardDescription>Multiple notifications from batch processes</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={simulateBatchUpload}>Simulate Batch Upload</Button>
      </CardContent>
    </Card>
  );
}

/**
 * Example 6: Error handling with notifications
 */
export function ErrorHandlingExample() {
  const { addNotification } = useNotifications();

  const handleApiCall = async () => {
    try {
      // Simulated API call
      const response = await fetch('/api/test');

      if (!response.ok) {
        throw new Error('API request failed');
      }

      addNotification({
        type: 'success',
        title: 'API call successful',
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'API call failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: Date.now(),
        },
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Error Handling</CardTitle>
        <CardDescription>Notifications for error scenarios</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleApiCall}>Make API Call</Button>
      </CardContent>
    </Card>
  );
}

/**
 * Complete Integration Example
 *
 * Shows how to set up the notification system in your app root.
 */
export function AppIntegrationExample() {
  return `
// In your app root (e.g., App.tsx or _app.tsx):

import { NotificationProvider } from '@/components/notifications/NotificationProvider';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { Toaster } from '@/components/ui/sonner';

function App() {
  return (
    <NotificationProvider>
      <YourAppLayout>
        <YourRoutes />

        {/* Add NotificationCenter to your header/navbar */}
        <header>
          <nav>
            {/* ... other nav items ... */}
            <NotificationCenter />
          </nav>
        </header>
      </YourAppLayout>

      {/* Sonner toaster for toast notifications */}
      <Toaster />
    </NotificationProvider>
  );
}
  `.trim();
}

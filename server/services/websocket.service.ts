/**
 * WebSocket Service
 * Manages real-time WebSocket connections and broadcasts
 */

interface WebSocketMessage {
  event: string;
  data: any;
  timestamp: Date;
}

class WebSocketService {
  private connections: Map<number, Set<any>> = new Map(); // userId -> Set of connections

  /**
   * Register a WebSocket connection for a user
   */
  registerConnection(userId: number, connection: any): void {
    if (!this.connections.has(userId)) {
      this.connections.set(userId, new Set());
    }
    this.connections.get(userId)!.add(connection);
    console.log(`[WebSocket] Registered connection for user ${userId}`);
  }

  /**
   * Unregister a WebSocket connection
   */
  unregisterConnection(userId: number, connection: any): void {
    const userConnections = this.connections.get(userId);
    if (userConnections) {
      userConnections.delete(connection);
      if (userConnections.size === 0) {
        this.connections.delete(userId);
      }
    }
    console.log(`[WebSocket] Unregistered connection for user ${userId}`);
  }

  /**
   * Broadcast a message to all connected clients
   */
  broadcast(event: string, data: any): void {
    const message: WebSocketMessage = {
      event,
      data,
      timestamp: new Date(),
    };

    let totalSent = 0;
    const allConnections = Array.from(this.connections.values());
    for (const connections of allConnections) {
      const connectionArray = Array.from(connections);
      for (const connection of connectionArray) {
        try {
          if (connection && typeof connection.send === 'function') {
            connection.send(JSON.stringify(message));
            totalSent++;
          }
        } catch (error) {
          console.error('[WebSocket] Error broadcasting message:', error);
        }
      }
    }

    console.log(`[WebSocket] Broadcasted ${event} to ${totalSent} connections`);
  }

  /**
   * Broadcast a message to a specific user's connections
   */
  broadcastToUser(userId: number, event: string, data: any): void {
    const userConnections = this.connections.get(userId);
    if (!userConnections || userConnections.size === 0) {
      console.log(`[WebSocket] No connections found for user ${userId}`);
      return;
    }

    const message: WebSocketMessage = {
      event,
      data,
      timestamp: new Date(),
    };

    let totalSent = 0;
    const connectionArray = Array.from(userConnections);
    for (const connection of connectionArray) {
      try {
        if (connection && typeof connection.send === 'function') {
          connection.send(JSON.stringify(message));
          totalSent++;
        }
      } catch (error) {
        console.error('[WebSocket] Error sending message to user:', error);
      }
    }

    console.log(`[WebSocket] Sent ${event} to ${totalSent} connections for user ${userId}`);
  }

  /**
   * Get connection count for a user
   */
  getUserConnectionCount(userId: number): number {
    return this.connections.get(userId)?.size || 0;
  }

  /**
   * Get total connection count
   */
  getTotalConnectionCount(): number {
    let total = 0;
    const allConnections = Array.from(this.connections.values());
    for (const connections of allConnections) {
      total += connections.size;
    }
    return total;
  }

  /**
   * Clear all connections
   */
  clearAllConnections(): void {
    this.connections.clear();
    console.log('[WebSocket] Cleared all connections');
  }
}

// Export singleton instance
export const websocketService = new WebSocketService();

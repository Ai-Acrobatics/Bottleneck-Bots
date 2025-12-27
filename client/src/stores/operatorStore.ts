/**
 * Operator Store
 * State management for the AI Browser Operator interface
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Message types for the chat interface
export type MessageType = 'user' | 'assistant' | 'action' | 'screenshot' | 'error' | 'system';

export interface OperatorMessage {
  id: string;
  type: MessageType;
  content: string;
  timestamp: Date;
  // For action messages
  actionType?: 'navigate' | 'click' | 'type' | 'extract' | 'observe' | 'screenshot';
  actionStatus?: 'pending' | 'running' | 'completed' | 'failed';
  // For screenshot messages
  screenshotUrl?: string;
  // For error messages
  error?: string;
  canRetry?: boolean;
}

export type LayoutMode = 'split' | 'fullBrowser' | 'tabbed';

interface OperatorState {
  // Session
  sessionId: string | null;
  liveViewUrl: string | null;
  currentUrl: string;
  isSessionActive: boolean;
  isLoading: boolean;

  // Layout
  layoutMode: LayoutMode;
  splitRatio: number; // 0-1, default 0.4 (40% chat, 60% browser)
  floatingPanelPosition: { x: number; y: number };
  floatingPanelCollapsed: boolean;
  activeTab: 'chat' | 'browser'; // For tabbed mode

  // Chat
  messages: OperatorMessage[];
  inputValue: string;
  isTyping: boolean;

  // Actions
  setSession: (sessionId: string | null, liveViewUrl: string | null) => void;
  setCurrentUrl: (url: string) => void;
  setLoading: (loading: boolean) => void;
  setLayoutMode: (mode: LayoutMode) => void;
  setSplitRatio: (ratio: number) => void;
  setFloatingPanelPosition: (position: { x: number; y: number }) => void;
  setFloatingPanelCollapsed: (collapsed: boolean) => void;
  setActiveTab: (tab: 'chat' | 'browser') => void;
  addMessage: (message: Omit<OperatorMessage, 'id' | 'timestamp'>) => void;
  updateMessage: (id: string, updates: Partial<OperatorMessage>) => void;
  setInputValue: (value: string) => void;
  setTyping: (typing: boolean) => void;
  clearMessages: () => void;
  endSession: () => void;
}

// Generate unique ID for messages
const generateId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useOperatorStore = create<OperatorState>()(
  persist(
    (set, get) => ({
      // Initial state
      sessionId: null,
      liveViewUrl: null,
      currentUrl: '',
      isSessionActive: false,
      isLoading: false,

      layoutMode: 'split',
      splitRatio: 0.4,
      floatingPanelPosition: { x: 20, y: 20 },
      floatingPanelCollapsed: false,
      activeTab: 'chat',

      messages: [],
      inputValue: '',
      isTyping: false,

      // Actions
      setSession: (sessionId, liveViewUrl) => set({
        sessionId,
        liveViewUrl,
        isSessionActive: !!sessionId,
      }),

      setCurrentUrl: (url) => set({ currentUrl: url }),

      setLoading: (loading) => set({ isLoading: loading }),

      setLayoutMode: (mode) => set({ layoutMode: mode }),

      setSplitRatio: (ratio) => set({ splitRatio: Math.max(0.2, Math.min(0.8, ratio)) }),

      setFloatingPanelPosition: (position) => set({ floatingPanelPosition: position }),

      setFloatingPanelCollapsed: (collapsed) => set({ floatingPanelCollapsed: collapsed }),

      setActiveTab: (tab) => set({ activeTab: tab }),

      addMessage: (message) => set((state) => ({
        messages: [
          ...state.messages,
          {
            ...message,
            id: generateId(),
            timestamp: new Date(),
          },
        ],
      })),

      updateMessage: (id, updates) => set((state) => ({
        messages: state.messages.map((msg) =>
          msg.id === id ? { ...msg, ...updates } : msg
        ),
      })),

      setInputValue: (value) => set({ inputValue: value }),

      setTyping: (typing) => set({ isTyping: typing }),

      clearMessages: () => set({ messages: [] }),

      endSession: () => set({
        sessionId: null,
        liveViewUrl: null,
        currentUrl: '',
        isSessionActive: false,
        isLoading: false,
      }),
    }),
    {
      name: 'operator-storage',
      partialize: (state) => ({
        // Only persist layout preferences, not session data
        layoutMode: state.layoutMode,
        splitRatio: state.splitRatio,
        floatingPanelPosition: state.floatingPanelPosition,
      }),
    }
  )
);

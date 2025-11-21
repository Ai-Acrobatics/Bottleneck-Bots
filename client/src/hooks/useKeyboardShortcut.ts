import { useEffect, useCallback } from 'react';

type ModifierKeys = {
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
};

export interface ShortcutConfig extends ModifierKeys {
  key: string;
  action: () => void;
  preventDefault?: boolean;
  description?: string;
}

function matchesModifiers(event: KeyboardEvent, modifiers: ModifierKeys): boolean {
  return (
    (modifiers.ctrl === undefined || event.ctrlKey === modifiers.ctrl) &&
    (modifiers.shift === undefined || event.shiftKey === modifiers.shift) &&
    (modifiers.alt === undefined || event.altKey === modifiers.alt) &&
    (modifiers.meta === undefined || event.metaKey === modifiers.meta)
  );
}

export function useKeyboardShortcut(shortcuts: ShortcutConfig | ShortcutConfig[]) {
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      const shortcutArray = Array.isArray(shortcuts) ? shortcuts : [shortcuts];

      for (const shortcut of shortcutArray) {
        // Check if the key matches and modifiers match
        if (
          event.key.toLowerCase() === shortcut.key.toLowerCase() &&
          matchesModifiers(event, {
            ctrl: shortcut.ctrl,
            shift: shortcut.shift,
            alt: shortcut.alt,
            meta: shortcut.meta,
          })
        ) {
          if (shortcut.preventDefault !== false) {
            event.preventDefault();
          }
          shortcut.action();
          break;
        }
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);
}

// Helper to detect if we're on Mac
export const isMac = typeof navigator !== 'undefined' && /Mac/.test(navigator.platform);

// Helper to format shortcut display
export function formatShortcut(shortcut: Omit<ShortcutConfig, 'action'>): string {
  const parts: string[] = [];

  if (shortcut.ctrl || shortcut.meta) {
    parts.push(isMac ? '⌘' : 'Ctrl');
  }
  if (shortcut.shift) {
    parts.push(isMac ? '⇧' : 'Shift');
  }
  if (shortcut.alt) {
    parts.push(isMac ? '⌥' : 'Alt');
  }

  parts.push(shortcut.key.toUpperCase());

  return parts.join(isMac ? '' : '+');
}

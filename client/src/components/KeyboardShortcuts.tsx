import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { useKeyboardShortcut, formatShortcut, isMac } from '@/hooks/useKeyboardShortcut';
import { Kbd } from '@/components/ui/kbd';
import {
  Plus,
  Save,
  Search,
  Calendar,
  Settings,
  LayoutDashboard,
  Users,
  HelpCircle,
} from 'lucide-react';
import { useLocation } from 'wouter';

interface KeyboardShortcut {
  key: string;
  label: string;
  description: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  alt?: boolean;
}

const SHORTCUTS: KeyboardShortcut[] = [
  {
    key: 'k',
    label: 'Command Palette',
    description: 'Open command palette',
    ctrl: !isMac,
    meta: isMac,
  },
  {
    key: 'n',
    label: 'New Task',
    description: 'Create a new scheduled task',
    ctrl: !isMac,
    meta: isMac,
  },
  {
    key: 's',
    label: 'Save',
    description: 'Save current form',
    ctrl: !isMac,
    meta: isMac,
  },
  {
    key: 'Escape',
    label: 'Close',
    description: 'Close dialogs and modals',
  },
  {
    key: '?',
    label: 'Help',
    description: 'Show keyboard shortcuts',
    shift: true,
  },
  {
    key: '/',
    label: 'Search',
    description: 'Focus search input',
  },
];

interface KeyboardShortcutsProps {
  onNewTask?: () => void;
  onSave?: () => void;
}

export function KeyboardShortcuts({ onNewTask, onSave }: KeyboardShortcutsProps) {
  const [helpOpen, setHelpOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [, setLocation] = useLocation();

  // Help dialog shortcut
  useKeyboardShortcut({
    key: '?',
    shift: true,
    action: () => setHelpOpen(true),
  });

  // Command palette shortcut
  useKeyboardShortcut({
    key: 'k',
    ctrl: !isMac,
    meta: isMac,
    action: () => setCommandOpen(true),
  });

  // New task shortcut
  useKeyboardShortcut({
    key: 'n',
    ctrl: !isMac,
    meta: isMac,
    action: () => onNewTask?.(),
  });

  // Save shortcut
  useKeyboardShortcut({
    key: 's',
    ctrl: !isMac,
    meta: isMac,
    action: () => onSave?.(),
  });

  // Escape to close command palette
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setCommandOpen(false);
        setHelpOpen(false);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <>
      {/* Help Dialog */}
      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Keyboard Shortcuts
            </DialogTitle>
            <DialogDescription>
              Use these keyboard shortcuts to navigate and perform actions quickly
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {SHORTCUTS.map((shortcut) => (
              <div
                key={shortcut.key}
                className="flex items-center justify-between py-3 border-b last:border-0"
              >
                <div>
                  <div className="font-medium text-sm">{shortcut.label}</div>
                  <div className="text-sm text-muted-foreground">
                    {shortcut.description}
                  </div>
                </div>
                <Kbd>{formatShortcut(shortcut)}</Kbd>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Command Palette */}
      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Navigation">
            <CommandItem
              onSelect={() => {
                setLocation('/');
                setCommandOpen(false);
              }}
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setLocation('/scheduled-tasks');
                setCommandOpen(false);
              }}
            >
              <Calendar className="mr-2 h-4 w-4" />
              <span>Scheduled Tasks</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setLocation('/settings');
                setCommandOpen(false);
              }}
            >
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setLocation('/team');
                setCommandOpen(false);
              }}
            >
              <Users className="mr-2 h-4 w-4" />
              <span>Team</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Actions">
            <CommandItem
              onSelect={() => {
                onNewTask?.();
                setCommandOpen(false);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              <span>New Task</span>
              <span className="ml-auto text-xs text-muted-foreground">
                {isMac ? '⌘N' : 'Ctrl+N'}
              </span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                onSave?.();
                setCommandOpen(false);
              }}
            >
              <Save className="mr-2 h-4 w-4" />
              <span>Save</span>
              <span className="ml-auto text-xs text-muted-foreground">
                {isMac ? '⌘S' : 'Ctrl+S'}
              </span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setHelpOpen(true);
                setCommandOpen(false);
              }}
            >
              <HelpCircle className="mr-2 h-4 w-4" />
              <span>Show Keyboard Shortcuts</span>
              <span className="ml-auto text-xs text-muted-foreground">?</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}

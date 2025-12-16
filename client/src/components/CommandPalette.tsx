import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './ui/command';
import {
  LayoutDashboard,
  Globe,
  Calendar,
  Workflow,
  Users,
  Megaphone,
  CreditCard,
  Settings,
  LifeBuoy,
  Search,
} from 'lucide-react';

const commands = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/', keywords: ['home', 'main'] },
  { icon: Globe, label: 'Browser Sessions', path: '/browser-sessions', keywords: ['browser', 'sessions', 'automation'] },
  { icon: Calendar, label: 'Scheduled Tasks', path: '/scheduled-tasks', keywords: ['schedule', 'tasks', 'cron'] },
  { icon: Workflow, label: 'Workflow Builder', path: '/workflow-builder', keywords: ['workflow', 'automation', 'builder'] },
  { icon: Users, label: 'Lead Lists', path: '/lead-lists', keywords: ['leads', 'contacts', 'crm'] },
  { icon: Megaphone, label: 'AI Campaigns', path: '/ai-campaigns', keywords: ['campaign', 'marketing', 'ai'] },
  { icon: CreditCard, label: 'Credits', path: '/credits', keywords: ['billing', 'credits', 'usage'] },
  { icon: Settings, label: 'Settings', path: '/settings', keywords: ['preferences', 'config'] },
  { icon: LifeBuoy, label: 'Support', path: '/support', keywords: ['help', 'support', 'docs'] },
];

interface CommandPaletteProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CommandPalette({ open: controlledOpen, onOpenChange }: CommandPaletteProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [, setLocation] = useLocation();

  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, setOpen]);

  const handleSelect = useCallback(
    (path: string) => {
      setOpen(false);
      setLocation(path);
    },
    [setOpen, setLocation]
  );

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          {commands.map((command) => (
            <CommandItem
              key={command.path}
              onSelect={() => handleSelect(command.path)}
              className="cursor-pointer"
            >
              <command.icon className="mr-2 h-4 w-4" />
              <span>{command.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

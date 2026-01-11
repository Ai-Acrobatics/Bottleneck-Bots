# PRD: Command Palette & Shortcuts

## Overview
Implement a global command palette (Cmd+K / Ctrl+K) providing quick access to all application features, navigation, and actions. Combined with comprehensive keyboard shortcuts, this enables power users to navigate and operate Bottleneck-Bots efficiently without touching the mouse, significantly improving productivity.

## Problem Statement
As applications grow in complexity, users struggle to discover and quickly access features buried in nested menus. Power users require keyboard-driven workflows to maintain productivity. Without a command palette:
- Feature discovery is poor
- Navigation is slow and mouse-dependent
- Repetitive actions waste time
- Expert users cannot optimize their workflows

## Goals & Objectives
- **Primary Goals**
  - Provide instant access to any feature via Cmd+K command palette
  - Implement comprehensive keyboard shortcuts for all common actions
  - Enable natural language search for features and navigation
  - Support customizable shortcut bindings
  - Improve feature discoverability through search

- **Success Metrics**
  - 40% of power users adopt command palette as primary navigation
  - 30% reduction in time-to-action for common tasks
  - 95% of features accessible via keyboard
  - < 100ms command palette open time

## User Stories
- As a power user, I want to press Cmd+K and type to navigate so that I can move faster than clicking through menus
- As a new user, I want to search for features by name so that I can discover what the app can do
- As a developer, I want keyboard shortcuts for common actions so that I can work without context switching
- As an admin, I want to view all available shortcuts so that I can learn the system efficiently
- As a user with motor impairments, I want customizable shortcuts so that I can use bindings that work for me
- As a team lead, I want to create custom commands so that my team can automate repetitive workflows

## Functional Requirements

### Must Have (P0)
- **Command Palette Modal**: Global modal triggered by Cmd/Ctrl+K with instant open
- **Fuzzy Search**: Match commands by partial strings, typos, and synonyms
- **Navigation Commands**: Quick jump to any page, section, or entity
- **Action Commands**: Execute actions (create, delete, export, etc.) directly
- **Recent Commands**: Show recently used commands at top of list
- **Keyboard Navigation**: Arrow keys to navigate, Enter to execute, Escape to close
- **Category Filtering**: Filter commands by type (Navigation, Actions, Settings)
- **Shortcut Display**: Show associated keyboard shortcut for each command

### Should Have (P1)
- **Nested Commands**: Hierarchical command structure (e.g., "Create > Bot" or "Create > Workflow")
- **Global Shortcuts**: Configurable shortcuts for frequent actions (Cmd+N for new, etc.)
- **Shortcut Customization**: User-defined shortcut bindings with conflict detection
- **Command Arguments**: Commands that accept inline arguments (e.g., "go to bot:my-bot-name")
- **Search History**: Remember and suggest from past searches
- **Contextual Commands**: Show context-relevant commands based on current page
- **Help Command**: Built-in help displaying all shortcuts and commands

### Nice to Have (P2)
- **Natural Language**: Parse natural language queries ("show me all active bots")
- **AI Suggestions**: ML-powered command suggestions based on user patterns
- **Custom Commands**: User-defined command macros
- **Voice Input**: Voice-to-command capability
- **Vim Mode**: Vim-style navigation bindings for editors
- **Command Chaining**: Execute multiple commands in sequence

## Non-Functional Requirements

### Performance
- Command palette opens in < 100ms
- Search results update in < 50ms as user types
- Shortcut detection and execution in < 20ms
- Index 1000+ commands without performance degradation

### Accessibility
- Full keyboard operability
- Screen reader announcements for results
- Focus management on open/close
- High contrast support for palette UI

### Scalability
- Support 100+ categories of commands
- Handle organizations with 1000+ entities (bots, workflows)
- Efficient search index updates as data changes

## Technical Requirements

### Architecture
```
/src/features/command-palette/
  ├── components/
  │   ├── command-palette.tsx       # Main palette component
  │   ├── command-list.tsx          # Virtualized command list
  │   ├── command-item.tsx          # Individual command row
  │   ├── command-input.tsx         # Search input with icons
  │   ├── category-filter.tsx       # Category tab bar
  │   └── shortcut-badge.tsx        # Keyboard shortcut display
  ├── hooks/
  │   ├── use-command-palette.ts    # Palette state management
  │   ├── use-commands.ts           # Command registration
  │   ├── use-shortcuts.ts          # Global shortcut handling
  │   └── use-fuzzy-search.ts       # Fuzzy matching logic
  ├── registry/
  │   ├── command-registry.ts       # Central command store
  │   ├── shortcut-registry.ts      # Shortcut mappings
  │   └── built-in-commands.ts      # Default commands
  ├── utils/
  │   ├── fuzzy-matcher.ts          # Fuzzy search algorithm
  │   ├── shortcut-parser.ts        # Parse shortcut strings
  │   └── platform-keys.ts          # Cross-platform key handling
  └── context/
      └── command-context.tsx       # React context provider
```

### Command Registry Schema
```typescript
interface Command {
  id: string;
  label: string;
  description?: string;
  icon?: React.ComponentType;
  category: CommandCategory;
  keywords: string[];           // Additional search terms
  shortcut?: string;            // e.g., "mod+shift+n"
  action: () => void | Promise<void>;
  canExecute?: () => boolean;   // Conditional availability
  children?: Command[];         // Nested commands
  recently?: number;            // Usage timestamp
}

type CommandCategory =
  | 'navigation'
  | 'actions'
  | 'create'
  | 'settings'
  | 'help'
  | 'search';

interface ShortcutBinding {
  id: string;
  keys: string;                 // Platform-normalized keys
  commandId: string;
  scope: 'global' | 'page' | 'component';
  enabled: boolean;
}
```

### Dependencies
- `cmdk` - Headless command palette primitives
- `@tanstack/react-virtual` - Virtualized list for large command sets
- `fuse.js` - Fuzzy search library
- `tinykeys` - Minimal keyboard shortcut library
- Radix UI Dialog - Modal primitives

### APIs & Integrations
```typescript
// Command Registration API
const { registerCommand, unregisterCommand } = useCommands();

registerCommand({
  id: 'create-bot',
  label: 'Create New Bot',
  category: 'create',
  shortcut: 'mod+shift+b',
  keywords: ['new', 'add', 'robot'],
  action: () => navigate('/bots/new'),
});

// Shortcut Hook API
const { isPressed } = useShortcut('mod+k', () => {
  openCommandPalette();
});

// Palette Control API
const { open, close, toggle, isOpen } = useCommandPalette();
```

### Built-in Commands (Initial Set)
```typescript
const builtInCommands: Command[] = [
  // Navigation
  { id: 'goto-dashboard', label: 'Go to Dashboard', shortcut: 'g d' },
  { id: 'goto-bots', label: 'Go to Bots', shortcut: 'g b' },
  { id: 'goto-workflows', label: 'Go to Workflows', shortcut: 'g w' },
  { id: 'goto-analytics', label: 'Go to Analytics', shortcut: 'g a' },
  { id: 'goto-settings', label: 'Go to Settings', shortcut: 'g s' },

  // Actions
  { id: 'create-bot', label: 'Create Bot', shortcut: 'mod+shift+b' },
  { id: 'create-workflow', label: 'Create Workflow', shortcut: 'mod+shift+w' },
  { id: 'search', label: 'Search Everything', shortcut: 'mod+shift+f' },
  { id: 'toggle-sidebar', label: 'Toggle Sidebar', shortcut: 'mod+\\' },

  // Help
  { id: 'show-shortcuts', label: 'Show All Shortcuts', shortcut: '?' },
  { id: 'docs', label: 'Open Documentation', shortcut: 'mod+shift+d' },
];
```

## Success Metrics
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Command palette adoption | 40% of power users | Analytics tracking |
| Time-to-action reduction | 30% faster | Task timing comparison |
| Keyboard feature coverage | 95% accessible | Feature audit |
| Palette open latency | < 100ms | Performance monitoring |
| Search result relevance | 90% first-result accuracy | User feedback |

## Dependencies
- React Router for navigation commands
- Analytics system for usage tracking
- User preferences storage for custom shortcuts
- Feature flags for command availability

## Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Shortcut conflicts with browser/OS | High - Broken shortcuts | Platform detection; avoid system shortcuts; user customization |
| Performance with large command sets | Medium - Slow search | Virtual list rendering; search index optimization |
| Poor search relevance | Medium - User frustration | Fuzzy matching tuning; usage-based ranking; synonym support |
| Accessibility gaps | High - Exclusion | Follow ARIA combobox patterns; screen reader testing |
| Low discoverability of palette itself | Medium - Low adoption | Onboarding tooltip; empty state prompts; menu item |
| Maintenance burden of command sync | Medium - Stale commands | Automated command generation from routes; type safety |

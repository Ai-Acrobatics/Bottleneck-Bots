# PRD: Theme & Styling System

## Overview
Implement a comprehensive theming system supporting light/dark modes, customizable color schemes, and consistent design tokens. Built on Tailwind CSS 4 and Radix UI primitives, the system provides responsive design, accessible color contrast, and a cohesive visual language across all Bottleneck-Bots interfaces.

## Problem Statement
Inconsistent styling across an application leads to poor user experience, accessibility issues, and maintenance burden. Users expect modern apps to support dark mode and respect system preferences. Without a robust theming system:
- Developers make inconsistent styling decisions
- Dark mode is difficult to implement retroactively
- Accessibility (color contrast) is not enforced
- Brand updates require touching hundreds of files
- Mobile responsiveness is inconsistent

## Goals & Objectives
- **Primary Goals**
  - Implement seamless light/dark mode switching with system preference detection
  - Establish comprehensive design token system (colors, spacing, typography)
  - Ensure WCAG AA color contrast compliance in all themes
  - Provide consistent responsive breakpoints and component sizing
  - Enable future white-labeling and custom branding capabilities

- **Success Metrics**
  - 100% of components support both light and dark themes
  - Zero color contrast violations in accessibility audits
  - < 50ms theme switch time
  - 90%+ design token adoption (vs. hardcoded values)

## User Stories
- As a user, I want dark mode to reduce eye strain so that I can work comfortably at night
- As a user, I want the app to respect my system theme preference so that it matches my other apps
- As a developer, I want consistent design tokens so that I can style components correctly
- As a designer, I want a systematic color palette so that the UI remains cohesive
- As an admin, I want to customize brand colors so that the app matches our identity
- As a mobile user, I want responsive layouts so that the app works well on my phone

## Functional Requirements

### Must Have (P0)
- **Theme Modes**: Light, dark, and system-preference modes with instant switching
- **Color Tokens**: Semantic color variables (background, foreground, primary, destructive, etc.)
- **Typography Scale**: Consistent font sizes, weights, and line heights
- **Spacing Scale**: Standardized spacing values for margin/padding
- **Border Radius**: Consistent corner radius tokens
- **Shadow System**: Elevation shadows for depth hierarchy
- **Responsive Breakpoints**: sm, md, lg, xl, 2xl with Tailwind defaults
- **Theme Persistence**: Remember user's theme choice across sessions
- **Radix Integration**: Theme-aware Radix UI components

### Should Have (P1)
- **Color Palette Generator**: Automatic shade generation from primary color
- **High Contrast Mode**: Enhanced contrast theme for accessibility
- **Component Variants**: Size variants (sm, md, lg) for interactive elements
- **Animation Tokens**: Consistent transition durations and easings
- **Focus Ring Styles**: Visible, consistent focus indicators
- **Custom Theme Editor**: UI for modifying theme values (admin)
- **CSS Custom Properties**: Runtime theme switching without full reload

### Nice to Have (P2)
- **Multiple Color Schemes**: Beyond light/dark (sepia, high-contrast, etc.)
- **White-Label Support**: Organization-specific branding
- **Theme Presets**: Pre-built theme combinations
- **Contrast Checker**: Built-in tool to verify color combinations
- **Theme Export/Import**: Share and apply custom themes
- **Gradients System**: Consistent gradient definitions

## Non-Functional Requirements

### Performance
- Theme switch completes in < 50ms
- No flash of unstyled content (FOUC) on page load
- CSS bundle size < 50KB (gzipped) with Tailwind purging
- First contentful paint not delayed by theme loading

### Accessibility
- All color combinations meet WCAG AA (4.5:1 text, 3:1 UI)
- Theme respects `prefers-color-scheme` and `prefers-contrast`
- Focus indicators visible in all themes
- Reduced motion support for animations

### Scalability
- Token system supports 100+ components
- Theme updates propagate automatically to all components
- CSS architecture allows tree-shaking of unused styles

## Technical Requirements

### Architecture
```
/src/styles/
  ├── globals.css              # Global styles, CSS custom properties
  ├── tailwind.config.ts       # Tailwind configuration
  └── themes/
      ├── tokens.ts            # Design token definitions
      ├── light.ts             # Light theme values
      ├── dark.ts              # Dark theme values
      └── high-contrast.ts     # High contrast theme

/src/lib/theme/
  ├── theme-provider.tsx       # React context provider
  ├── use-theme.ts             # Theme hook
  ├── theme-toggle.tsx         # Theme switch component
  └── utils.ts                 # Theme utilities

/src/components/ui/
  ├── button.tsx               # Themed button variants
  ├── input.tsx                # Themed form inputs
  ├── card.tsx                 # Themed containers
  └── ... (Radix primitives)
```

### Design Token System
```typescript
// tokens.ts
export const tokens = {
  colors: {
    // Semantic tokens
    background: 'var(--background)',
    foreground: 'var(--foreground)',
    primary: 'var(--primary)',
    primaryForeground: 'var(--primary-foreground)',
    secondary: 'var(--secondary)',
    secondaryForeground: 'var(--secondary-foreground)',
    muted: 'var(--muted)',
    mutedForeground: 'var(--muted-foreground)',
    accent: 'var(--accent)',
    accentForeground: 'var(--accent-foreground)',
    destructive: 'var(--destructive)',
    destructiveForeground: 'var(--destructive-foreground)',
    border: 'var(--border)',
    input: 'var(--input)',
    ring: 'var(--ring)',
  },
  radius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    full: '9999px',
  },
  spacing: {
    px: '1px',
    0.5: '0.125rem',
    1: '0.25rem',
    // ... standard Tailwind scale
  },
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'monospace'],
    },
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }],
      sm: ['0.875rem', { lineHeight: '1.25rem' }],
      base: ['1rem', { lineHeight: '1.5rem' }],
      lg: ['1.125rem', { lineHeight: '1.75rem' }],
      xl: ['1.25rem', { lineHeight: '1.75rem' }],
      // ...
    },
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  },
  animation: {
    duration: {
      fast: '150ms',
      normal: '200ms',
      slow: '300ms',
    },
    easing: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
    },
  },
};
```

### CSS Custom Properties (globals.css)
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    /* ... dark theme values */
  }
}
```

### Dependencies
- `tailwindcss` (v4) - Utility-first CSS framework
- `@radix-ui/themes` - Pre-built Radix components (or primitives)
- `next-themes` - Next.js theme management
- `clsx` / `tailwind-merge` - Class name utilities
- `@fontsource/inter` - Primary font
- `@fontsource/jetbrains-mono` - Monospace font

### APIs & Integrations
```typescript
// Theme Provider API
<ThemeProvider
  attribute="class"
  defaultTheme="system"
  enableSystem
  disableTransitionOnChange
>
  {children}
</ThemeProvider>

// useTheme Hook
const { theme, setTheme, resolvedTheme, systemTheme } = useTheme();

// Theme values: 'light' | 'dark' | 'system'
setTheme('dark');

// Component Styling Pattern
const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);
```

## Success Metrics
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Theme support coverage | 100% of components | Component audit |
| Contrast compliance | Zero violations | Automated accessibility testing |
| Theme switch latency | < 50ms | Performance monitoring |
| Design token adoption | 90%+ usage | Codebase analysis |
| User dark mode usage | Track adoption | Analytics |

## Dependencies
- Next.js for server-side theme detection
- localStorage for theme persistence
- CSS custom properties browser support (all modern browsers)
- Font loading infrastructure

## Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Flash of unstyled/wrong theme on load | Medium - Poor UX | Script in head to set theme before render; cookie-based detection |
| Tailwind v4 breaking changes | High - Major refactor | Monitor beta releases; maintain upgrade path |
| Color contrast failures in custom themes | High - Accessibility | Enforce minimum contrast in theme editor; validation |
| Large CSS bundle size | Medium - Performance | Aggressive tree-shaking; component-level purging |
| Inconsistent third-party component styling | Medium - Visual bugs | Wrap third-party components with theme adapters |
| Browser compatibility for CSS features | Low - Edge cases | Provide fallbacks; test on target browsers |

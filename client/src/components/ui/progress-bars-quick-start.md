# Progress Bars - Quick Start Guide

## Import

```tsx
import {
  ProgressBar,
  MultiStepProgress,
  ProgressWithTime,
  IndeterminateProgress,
  type ProgressStep,
} from "@/components/ui/progress-bars";
```

## Common Patterns

### 1. Simple Progress (25%)
```tsx
<ProgressBar value={25} showPercentage />
```

### 2. File Upload with Time
```tsx
<ProgressWithTime
  value={progress}
  timeElapsed={elapsed}
  timeRemaining={remaining}
  showPercentage
/>
```

### 3. Three-Step Workflow
```tsx
const steps: ProgressStep[] = [
  { id: "1", label: "Start", status: "completed" },
  { id: "2", label: "Process", status: "in-progress" },
  { id: "3", label: "Done", status: "pending" },
];

<MultiStepProgress steps={steps} />
```

### 4. Loading Spinner
```tsx
<IndeterminateProgress label="Loading..." />
```

### 5. Success State
```tsx
<ProgressBar value={100} variant="success" showPercentage />
```

### 6. Error State
```tsx
<MultiStepProgress
  steps={stepsWithError}
  variant="error"
/>
```

### 7. Vertical Steps
```tsx
<MultiStepProgress
  steps={steps}
  orientation="vertical"
/>
```

### 8. Animated Progress
```tsx
<ProgressBar value={50} animated />
```

### 9. Indeterminate Bar
```tsx
<ProgressBar indeterminate />
```

### 10. Large Spinner
```tsx
<IndeterminateProgress size="lg" label="Processing..." />
```

## Variants

| Variant | Color | Use Case |
|---------|-------|----------|
| `default` | Primary (green) | Normal progress |
| `success` | Green | Completed tasks |
| `warning` | Amber | Caution states |
| `error` | Red | Failed tasks |

## Status Types

| Status | Icon | Color | When to Use |
|--------|------|-------|-------------|
| `pending` | Number | Gray | Not started |
| `in-progress` | Spinner | Primary | Active |
| `completed` | Check | Green | Done |
| `error` | Alert | Red | Failed |

## Real-World Example

```tsx
function DataImport() {
  const [progress, setProgress] = useState(0);
  const [steps, setSteps] = useState<ProgressStep[]>([
    { id: "1", label: "Upload", status: "in-progress" },
    { id: "2", label: "Validate", status: "pending" },
    { id: "3", label: "Import", status: "pending" },
  ]);

  return (
    <div className="space-y-6">
      <MultiStepProgress steps={steps} />
      <ProgressWithTime
        value={progress}
        timeRemaining={estimateTime(progress)}
        showPercentage
      />
    </div>
  );
}
```

## File Locations

- Component: `client/src/components/ui/progress-bars.tsx`
- Tests: `client/src/components/ui/progress-bars.test.tsx`
- Examples: `client/src/components/ui/progress-bars.example.tsx`
- Full Docs: `client/src/components/ui/PROGRESS_BARS_README.md`

## Run Tests

```bash
npm test -- progress-bars.test.tsx
```

Expected: ✓ 74 tests passed

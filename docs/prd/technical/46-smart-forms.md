# PRD: Smart Forms & Dialogs

## Overview
Implement a comprehensive forms system using React Hook Form and Zod validation, providing type-safe, performant, and accessible form handling across Bottleneck-Bots. This includes dynamic form builders, reusable form components, modal dialogs, and inline editing capabilities.

## Problem Statement
Forms are the primary mechanism for user input but are often poorly implemented, leading to:
- Inconsistent validation and error messaging
- Poor user experience with slow, unresponsive forms
- Accessibility issues in custom form controls
- Code duplication across similar forms
- Runtime type errors from unvalidated data
- Complex state management for multi-step forms

## Goals & Objectives
- **Primary Goals**
  - Implement type-safe forms with Zod schema validation
  - Provide reusable, accessible form components
  - Enable dynamic form generation from schemas
  - Create consistent modal/dialog patterns
  - Support complex form patterns (multi-step, conditional fields, arrays)

- **Success Metrics**
  - 100% form validation coverage (no unvalidated user input)
  - < 100ms form re-render time on input change
  - Zero accessibility violations in form components
  - 50% reduction in form-related bugs

## User Stories
- As a user, I want immediate feedback on form errors so that I can fix issues before submitting
- As a user, I want forms to remember my input if validation fails so that I don't lose my work
- As a developer, I want type-safe form handling so that I catch errors at compile time
- As a developer, I want reusable form components so that I can build forms quickly
- As a developer, I want to generate forms from schemas so that I don't duplicate validation logic
- As a user, I want confirmation dialogs for destructive actions so that I don't accidentally delete things

## Functional Requirements

### Must Have (P0)
- **React Hook Form Integration**: Performant form state management with minimal re-renders
- **Zod Validation**: Schema-based validation with type inference
- **Base Form Components**: Input, Textarea, Select, Checkbox, Radio, Switch with consistent styling
- **Error Display**: Inline error messages with accessible announcements
- **Form Layout Components**: FormField, FormLabel, FormDescription, FormMessage
- **Modal Dialogs**: Accessible modal system with focus trapping
- **Confirmation Dialogs**: Reusable confirm/cancel patterns for destructive actions
- **Loading States**: Disabled inputs and loading indicators during submission
- **Form Submission**: Integrated submission with loading, success, and error handling

### Should Have (P1)
- **Multi-Step Forms**: Wizard pattern with step validation and progress indicator
- **Dynamic Arrays**: Add/remove field groups (e.g., multiple phone numbers)
- **Conditional Fields**: Show/hide fields based on other field values
- **Inline Editing**: Edit-in-place pattern for table cells and detail views
- **Autosave**: Debounced auto-save for long forms
- **Form Persistence**: Save draft state to localStorage/database
- **Date/Time Pickers**: Accessible date and time selection components
- **File Upload**: Drag-and-drop file upload with preview

### Nice to Have (P2)
- **Form Builder UI**: Visual form construction interface
- **Schema-to-Form**: Auto-generate forms from Zod/JSON schemas
- **Form Analytics**: Track field interaction, abandonment, error frequency
- **Voice Input**: Voice-to-text for text fields
- **AI-Assisted Input**: Smart suggestions and auto-complete
- **Signature Capture**: Touch/mouse signature input

## Non-Functional Requirements

### Performance
- Form re-renders scoped to changed fields only (< 5ms per keystroke)
- Validation runs < 10ms for typical schemas
- Modal open/close animation < 200ms
- Large forms (50+ fields) remain responsive

### Accessibility
- All form controls have associated labels
- Error messages linked via aria-describedby
- Required fields indicated visually and programmatically
- Focus management in dialogs and multi-step forms
- Screen reader announcements for async validation

### Scalability
- Form components tree-shakeable
- Validation schemas composable and reusable
- Pattern scales to 100+ unique forms in application

## Technical Requirements

### Architecture
```
/src/components/ui/form/
  ├── form.tsx                    # Base form components
  ├── form-field.tsx              # Field wrapper with label, error
  ├── input.tsx                   # Text input
  ├── textarea.tsx                # Multi-line text
  ├── select.tsx                  # Dropdown select
  ├── checkbox.tsx                # Checkbox input
  ├── radio-group.tsx             # Radio button group
  ├── switch.tsx                  # Toggle switch
  ├── date-picker.tsx             # Date selection
  ├── file-upload.tsx             # File upload area
  └── combobox.tsx                # Searchable select

/src/components/ui/dialog/
  ├── dialog.tsx                  # Base dialog component
  ├── alert-dialog.tsx            # Confirmation dialogs
  ├── drawer.tsx                  # Slide-out drawer
  └── sheet.tsx                   # Side sheet panel

/src/lib/forms/
  ├── use-form.ts                 # Enhanced useForm hook
  ├── use-multi-step-form.ts      # Wizard form logic
  ├── use-autosave.ts             # Autosave hook
  ├── field-array.ts              # Dynamic array utilities
  └── validation.ts               # Common validation schemas

/src/schemas/
  ├── user.schema.ts              # User form schemas
  ├── bot.schema.ts               # Bot form schemas
  ├── workflow.schema.ts          # Workflow form schemas
  └── common.schema.ts            # Reusable schema parts
```

### Form Component Pattern
```typescript
// Base form setup with React Hook Form + Zod
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Schema definition with type inference
const botSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  schedule: z.enum(['hourly', 'daily', 'weekly']).optional(),
  config: z.object({
    timeout: z.number().min(0).max(300),
    retries: z.number().min(0).max(10),
  }),
});

type BotFormValues = z.infer<typeof botSchema>;

// Form component
function BotForm({ onSubmit, defaultValues }: BotFormProps) {
  const form = useForm<BotFormValues>({
    resolver: zodResolver(botSchema),
    defaultValues: {
      name: '',
      isActive: true,
      config: { timeout: 30, retries: 3 },
      ...defaultValues,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bot Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter bot name" {...field} />
              </FormControl>
              <FormDescription>
                A unique name for your bot
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex items-center gap-2">
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel>Active</FormLabel>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Saving...' : 'Save Bot'}
        </Button>
      </form>
    </Form>
  );
}
```

### Dialog Component Pattern
```typescript
// Confirmation dialog component
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

function DeleteBotDialog({ bot, onDelete }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(bot.id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Delete Bot</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {bot.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete
            the bot and all associated data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

### Multi-Step Form Hook
```typescript
// Multi-step form logic
interface UseMultiStepFormOptions<T> {
  steps: StepConfig[];
  defaultValues: T;
  onComplete: (data: T) => Promise<void>;
}

function useMultiStepForm<T>({ steps, defaultValues, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<Partial<T>>(defaultValues);

  const form = useForm({
    resolver: zodResolver(steps[currentStep].schema),
    defaultValues: data,
  });

  const next = async () => {
    const valid = await form.trigger();
    if (valid) {
      setData((prev) => ({ ...prev, ...form.getValues() }));
      if (currentStep < steps.length - 1) {
        setCurrentStep((s) => s + 1);
      } else {
        await onComplete(data as T);
      }
    }
  };

  const back = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  };

  return {
    form,
    currentStep,
    totalSteps: steps.length,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === steps.length - 1,
    next,
    back,
    progress: ((currentStep + 1) / steps.length) * 100,
  };
}
```

### Dependencies
- `react-hook-form` (v7) - Form state management
- `@hookform/resolvers` - Zod resolver integration
- `zod` - Schema validation
- `@radix-ui/react-dialog` - Dialog primitives
- `@radix-ui/react-alert-dialog` - Alert dialog primitives
- `@radix-ui/react-select` - Select primitives
- `react-dropzone` - File upload
- `date-fns` - Date formatting/parsing

### APIs & Integrations
```typescript
// Form submission with tRPC
const mutation = api.bots.create.useMutation({
  onSuccess: () => {
    toast.success('Bot created successfully');
    router.push('/bots');
  },
  onError: (error) => {
    if (error.data?.zodError) {
      // Server-side validation errors
      Object.entries(error.data.zodError.fieldErrors).forEach(
        ([field, errors]) => {
          form.setError(field as keyof BotFormValues, {
            message: errors?.[0],
          });
        }
      );
    } else {
      toast.error(error.message);
    }
  },
});

const onSubmit = (data: BotFormValues) => {
  mutation.mutate(data);
};
```

## Success Metrics
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Validation coverage | 100% | Code audit |
| Form re-render time | < 100ms | Performance profiling |
| Accessibility violations | Zero | Automated testing |
| Form bug reduction | 50% decrease | Bug tracking |
| Developer velocity | 30% faster form creation | Sprint metrics |

## Dependencies
- UI component library (Radix primitives)
- Theme system for consistent styling
- Toast/notification system for feedback
- tRPC for type-safe submission

## Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Complex validation logic slows forms | Medium - Poor UX | Debounce validation; async validation for expensive checks |
| Form state lost on navigation | High - User frustration | Form persistence to localStorage; unsaved changes warning |
| Accessibility issues in custom controls | High - Exclusion | Use Radix primitives; comprehensive screen reader testing |
| Large forms cause performance issues | Medium - Slow UI | Virtualized field lists; lazy field rendering |
| Server/client validation mismatch | Medium - Inconsistent behavior | Share Zod schemas between frontend/backend |
| Modal z-index conflicts | Low - Visual bugs | Centralized portal management; z-index tokens |

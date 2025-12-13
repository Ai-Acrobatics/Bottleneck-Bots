import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  VariableManager,
  type VariableManagerProps,
  type WorkflowVariable,
  type VariableType,
} from './VariableManager';

// ============================================
// MOCK DATA
// ============================================

const mockVariables: WorkflowVariable[] = [
  {
    id: '1',
    name: 'apiKey',
    value: 'sk-1234567890abcdef',
    type: 'string',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
  {
    id: '2',
    name: 'maxRetries',
    value: 3,
    type: 'number',
    createdAt: new Date('2025-01-02'),
    updatedAt: new Date('2025-01-02'),
  },
  {
    id: '3',
    name: 'isDebugMode',
    value: true,
    type: 'boolean',
    createdAt: new Date('2025-01-03'),
    updatedAt: new Date('2025-01-03'),
  },
  {
    id: '4',
    name: 'tags',
    value: ['api', 'workflow', 'test'],
    type: 'array',
    createdAt: new Date('2025-01-04'),
    updatedAt: new Date('2025-01-04'),
  },
  {
    id: '5',
    name: 'config',
    value: { timeout: 5000, retries: 3 },
    type: 'object',
    createdAt: new Date('2025-01-05'),
    updatedAt: new Date('2025-01-05'),
  },
];

// ============================================
// TEST HELPERS
// ============================================

const defaultProps: VariableManagerProps = {
  variables: [],
  onVariablesChange: vi.fn(),
};

function renderComponent(props: Partial<VariableManagerProps> = {}) {
  return render(<VariableManager {...defaultProps} {...props} />);
}

// ============================================
// LIST RENDERING TESTS
// ============================================

describe('VariableManager - List Rendering', () => {
  it('renders without crashing', () => {
    renderComponent();
    expect(screen.getByRole('region', { name: /variable manager/i })).toBeInTheDocument();
  });

  it('displays empty state when no variables', () => {
    renderComponent({ variables: [] });
    expect(screen.getByText(/no variables/i)).toBeInTheDocument();
  });

  it('renders variable list when variables exist', () => {
    renderComponent({ variables: mockVariables });
    mockVariables.forEach((variable) => {
      expect(screen.getByText(variable.name)).toBeInTheDocument();
    });
  });

  it('displays variable name for each item', () => {
    renderComponent({ variables: mockVariables });
    mockVariables.forEach((variable) => {
      expect(screen.getByText(variable.name)).toBeInTheDocument();
    });
  });

  it('displays variable type badge for each item', () => {
    renderComponent({ variables: mockVariables });
    const typeBadges = screen.getAllByText(/string|number|boolean|array|object/i);
    expect(typeBadges.length).toBeGreaterThanOrEqual(mockVariables.length);
  });

  it('displays correct variable count', () => {
    renderComponent({ variables: mockVariables });
    expect(screen.getByText(/5 variable/i)).toBeInTheDocument();
  });

  it('applies custom className to container', () => {
    renderComponent({ variables: mockVariables, className: 'custom-test-class' });
    const region = screen.getByRole('region');
    expect(region).toHaveClass('custom-test-class');
  });
});

// ============================================
// ADD VARIABLE TESTS
// ============================================

describe('VariableManager - Add Variable', () => {
  it('displays add variable button', () => {
    renderComponent({ variables: [] });
    expect(screen.getByRole('button', { name: /add variable/i })).toBeInTheDocument();
  });

  it('opens form when add button clicked', async () => {
    const user = userEvent.setup();
    renderComponent({ variables: [] });

    const addBtn = screen.getByRole('button', { name: /add variable/i });
    await user.click(addBtn);

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
  });

  it('displays form with name input', async () => {
    const user = userEvent.setup();
    renderComponent({ variables: [] });

    const addBtn = screen.getByRole('button', { name: /add variable/i });
    await user.click(addBtn);

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
  });

  it('displays form with value input', async () => {
    const user = userEvent.setup();
    renderComponent({ variables: [] });

    const addBtn = screen.getByRole('button', { name: /add variable/i });
    await user.click(addBtn);

    expect(screen.getByLabelText(/value/i)).toBeInTheDocument();
  });

  it('displays form with type selector', async () => {
    const user = userEvent.setup();
    renderComponent({ variables: [] });

    const addBtn = screen.getByRole('button', { name: /add variable/i });
    await user.click(addBtn);

    // Type selector uses a combobox role
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('adds new variable on submit', async () => {
    const user = userEvent.setup();
    const onVariablesChange = vi.fn();
    renderComponent({ variables: [], onVariablesChange });

    const addBtn = screen.getByRole('button', { name: /add variable/i });
    await user.click(addBtn);

    const nameInput = screen.getByLabelText(/name/i);
    const valueInput = screen.getByLabelText(/value/i);

    await user.type(nameInput, 'newVariable');
    await user.type(valueInput, 'newValue');

    const submitBtn = screen.getByRole('button', { name: /add|save|create/i });
    await user.click(submitBtn);

    expect(onVariablesChange).toHaveBeenCalled();
  });

  it('displays cancel button in form', async () => {
    const user = userEvent.setup();
    renderComponent({ variables: [] });

    const addBtn = screen.getByRole('button', { name: /add variable/i });
    await user.click(addBtn);

    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('closes form when cancel button clicked', async () => {
    const user = userEvent.setup();
    renderComponent({ variables: [] });

    const addBtn = screen.getByRole('button', { name: /add variable/i });
    await user.click(addBtn);

    const cancelBtn = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelBtn);

    await waitFor(() => {
      expect(screen.queryByLabelText(/name/i)).not.toBeInTheDocument();
    });
  });
});

// ============================================
// TYPE SELECTION TESTS
// ============================================

describe('VariableManager - Type Selection', () => {
  it('displays type badge for string type', () => {
    renderComponent({ variables: [mockVariables[0]] });
    // Component uses capitalized labels like "String"
    // There may be multiple occurrences (summary + row), so use getAllByText
    const stringBadges = screen.getAllByText('String');
    expect(stringBadges.length).toBeGreaterThan(0);
  });

  it('displays type badge for number type', () => {
    // Use inline variable to ensure correct type
    const numberVar: WorkflowVariable = {
      id: 'num-test',
      name: 'testNumber',
      value: 42,
      type: 'number',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const { container } = renderComponent({ variables: [numberVar] });
    expect(container.textContent).toContain('Number');
  });

  it('displays type badge for boolean type', () => {
    renderComponent({ variables: [mockVariables[2]] });
    const boolBadges = screen.getAllByText('Boolean');
    expect(boolBadges.length).toBeGreaterThan(0);
  });

  it('displays type badge for array type', () => {
    // Use inline variable to ensure correct type
    const arrayVar: WorkflowVariable = {
      id: 'arr-test',
      name: 'testArray',
      value: ['a', 'b', 'c'],
      type: 'array',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const { container } = renderComponent({ variables: [arrayVar] });
    expect(container.textContent).toContain('Array');
  });

  it('displays type badge for object type', () => {
    // Use inline variable to ensure correct type
    const objectVar: WorkflowVariable = {
      id: 'obj-test',
      name: 'testObject',
      value: { foo: 'bar' },
      type: 'object',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const { container } = renderComponent({ variables: [objectVar] });
    expect(container.textContent).toContain('Object');
  });
});

// ============================================
// EDIT VARIABLE TESTS
// ============================================

describe('VariableManager - Edit Variable', () => {
  it('displays edit button for each variable', () => {
    renderComponent({ variables: mockVariables });
    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    expect(editButtons.length).toBeGreaterThanOrEqual(mockVariables.length);
  });

  it('opens edit form when edit button clicked', async () => {
    const user = userEvent.setup();
    renderComponent({ variables: mockVariables });

    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    await user.click(editButtons[0]);

    expect(screen.getByDisplayValue(mockVariables[0].name)).toBeInTheDocument();
  });

  it('populates form with variable data', async () => {
    const user = userEvent.setup();
    renderComponent({ variables: mockVariables });

    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    await user.click(editButtons[0]);

    expect(screen.getByDisplayValue(mockVariables[0].name)).toBeInTheDocument();
  });

  it('displays cancel button in edit form', async () => {
    const user = userEvent.setup();
    renderComponent({ variables: mockVariables });

    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    await user.click(editButtons[0]);

    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('cancels edit without saving changes', async () => {
    const user = userEvent.setup();
    const onVariablesChange = vi.fn();
    renderComponent({ variables: mockVariables, onVariablesChange });

    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    await user.click(editButtons[0]);

    const cancelBtn = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelBtn);

    expect(onVariablesChange).not.toHaveBeenCalled();
  });
});

// ============================================
// DELETE VARIABLE TESTS
// ============================================

describe('VariableManager - Delete Variable', () => {
  it('displays delete button for each variable', () => {
    renderComponent({ variables: mockVariables });
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    expect(deleteButtons.length).toBeGreaterThanOrEqual(mockVariables.length);
  });

  it('shows confirmation dialog when delete clicked', async () => {
    const user = userEvent.setup();
    renderComponent({ variables: mockVariables });

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    await user.click(deleteButtons[0]);

    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  });

  it('shows confirmation message with variable name', async () => {
    const user = userEvent.setup();
    renderComponent({ variables: mockVariables });

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    await user.click(deleteButtons[0]);

    // The dialog shows the variable name in quotes
    expect(screen.getByText(new RegExp(`"${mockVariables[0].name}"`, 'i'))).toBeInTheDocument();
  });

  it('removes variable when delete confirmed', async () => {
    const user = userEvent.setup();
    const onVariablesChange = vi.fn();
    renderComponent({ variables: mockVariables, onVariablesChange });

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    await user.click(deleteButtons[0]);

    const confirmBtn = screen.getByRole('button', { name: /confirm|yes|delete/i });
    await user.click(confirmBtn);

    expect(onVariablesChange).toHaveBeenCalled();
  });

  it('closes dialog after canceling deletion', async () => {
    const user = userEvent.setup();
    renderComponent({ variables: mockVariables });

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    await user.click(deleteButtons[0]);

    const cancelBtn = screen.getByRole('button', { name: /cancel|no/i });
    await user.click(cancelBtn);

    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });
  });
});

// ============================================
// SEARCH/FILTER TESTS
// ============================================

describe('VariableManager - Search and Filter', () => {
  it('displays search input', () => {
    renderComponent({ variables: mockVariables });
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
  });

  it('filters variables by name', async () => {
    const user = userEvent.setup();
    renderComponent({ variables: mockVariables });

    const searchInput = screen.getByPlaceholderText(/search/i);
    await user.type(searchInput, 'api');

    expect(screen.getByText('apiKey')).toBeInTheDocument();
    expect(screen.queryByText('maxRetries')).not.toBeInTheDocument();
  });

  it('filters variables case-insensitively', async () => {
    const user = userEvent.setup();
    renderComponent({ variables: mockVariables });

    const searchInput = screen.getByPlaceholderText(/search/i);
    await user.type(searchInput, 'API');

    expect(screen.getByText('apiKey')).toBeInTheDocument();
  });

  it('shows no results message when filter matches nothing', async () => {
    const user = userEvent.setup();
    renderComponent({ variables: mockVariables });

    const searchInput = screen.getByPlaceholderText(/search/i);
    await user.type(searchInput, 'nonexistent12345');

    // Component shows "No matching variables found" in multiple places
    const noResultsMessages = screen.getAllByText(/no matching variables/i);
    expect(noResultsMessages.length).toBeGreaterThan(0);
  });

  it('clears filter when clear button clicked', async () => {
    const user = userEvent.setup();
    renderComponent({ variables: mockVariables });

    const searchInput = screen.getByPlaceholderText(/search/i);
    await user.type(searchInput, 'api');

    expect(screen.queryByText('maxRetries')).not.toBeInTheDocument();

    const clearBtn = screen.getByRole('button', { name: /clear/i });
    await user.click(clearBtn);

    expect(screen.getByText('maxRetries')).toBeInTheDocument();
  });
});

// ============================================
// ACCESSIBILITY TESTS
// ============================================

describe('VariableManager - Accessibility', () => {
  it('has proper aria-label for main region', () => {
    renderComponent({ variables: mockVariables });
    const region = screen.getByRole('region', { name: /variable manager/i });
    expect(region).toBeInTheDocument();
  });

  it('has proper aria-label for add button', () => {
    renderComponent({ variables: [] });
    const addBtn = screen.getByRole('button', { name: /add variable/i });
    expect(addBtn).toHaveAccessibleName();
  });

  it('has proper aria-label for edit buttons', () => {
    renderComponent({ variables: mockVariables });
    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    editButtons.forEach((btn) => {
      expect(btn).toHaveAccessibleName();
    });
  });

  it('has proper aria-label for delete buttons', () => {
    renderComponent({ variables: mockVariables });
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    deleteButtons.forEach((btn) => {
      expect(btn).toHaveAccessibleName();
    });
  });

  it('keyboard navigation for edit button', async () => {
    renderComponent({ variables: mockVariables });
    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    editButtons[0].focus();
    expect(editButtons[0]).toHaveFocus();
  });

  it('keyboard navigation for delete button', async () => {
    renderComponent({ variables: mockVariables });
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    deleteButtons[0].focus();
    expect(deleteButtons[0]).toHaveFocus();
  });

  it('form has proper labels for all inputs', async () => {
    const user = userEvent.setup();
    renderComponent({ variables: [] });

    const addBtn = screen.getByRole('button', { name: /add variable/i });
    await user.click(addBtn);

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/value/i)).toBeInTheDocument();
    // Type selector is a combobox
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('confirmation dialog has proper role', async () => {
    const user = userEvent.setup();
    renderComponent({ variables: mockVariables });

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    await user.click(deleteButtons[0]);

    const dialog = screen.getByRole('alertdialog');
    expect(dialog).toBeInTheDocument();
  });
});

// ============================================
// EDGE CASES TESTS
// ============================================

describe('VariableManager - Edge Cases', () => {
  it('handles very long variable names', () => {
    const longNameVariable: WorkflowVariable = {
      id: '100',
      name: 'this_is_a_very_long_variable_name_that_might_not_fit_in_the_ui_properly',
      value: 'test',
      type: 'string',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    renderComponent({ variables: [longNameVariable] });
    // Component truncates names at 30 chars, but full name is in title attribute
    const truncatedName = longNameVariable.name.slice(0, 30) + '...';
    expect(screen.getByText(truncatedName)).toBeInTheDocument();
    expect(screen.getByTitle(longNameVariable.name)).toBeInTheDocument();
  });

  it('handles very long variable values', () => {
    const longValueVariable: WorkflowVariable = {
      id: '101',
      name: 'longValue',
      value: 'a'.repeat(500),
      type: 'string',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    renderComponent({ variables: [longValueVariable] });
    expect(screen.getByText('longValue')).toBeInTheDocument();
  });

  it('handles special characters in variable name', () => {
    const specialCharVariable: WorkflowVariable = {
      id: '102',
      name: 'var_name-123',
      value: 'value',
      type: 'string',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    renderComponent({ variables: [specialCharVariable] });
    expect(screen.getByText('var_name-123')).toBeInTheDocument();
  });

  it('handles empty variable value', () => {
    const emptyValueVariable: WorkflowVariable = {
      id: '103',
      name: 'emptyVar',
      value: '',
      type: 'string',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    renderComponent({ variables: [emptyValueVariable] });
    expect(screen.getByText('emptyVar')).toBeInTheDocument();
  });

  it('handles JSON object with nested properties', () => {
    const complexVariable: WorkflowVariable = {
      id: '104',
      name: 'complexObject',
      value: { nested: { deep: { value: 123 } } },
      type: 'object',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    renderComponent({ variables: [complexVariable] });
    expect(screen.getByText('complexObject')).toBeInTheDocument();
  });

  it('handles array with mixed types', () => {
    const mixedArrayVariable: WorkflowVariable = {
      id: '105',
      name: 'mixedArray',
      value: [1, 'string', true, { obj: 'value' }],
      type: 'array',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    renderComponent({ variables: [mixedArrayVariable] });
    expect(screen.getByText('mixedArray')).toBeInTheDocument();
  });

  it('handles many variables efficiently', () => {
    const manyVariables: WorkflowVariable[] = Array.from({ length: 100 }, (_, i) => ({
      id: `${i}`,
      name: `variable${i}`,
      value: `value${i}`,
      type: 'string' as VariableType,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    renderComponent({ variables: manyVariables });
    expect(screen.getByText('variable0')).toBeInTheDocument();
    expect(screen.getByText('variable99')).toBeInTheDocument();
  });
});

// ============================================
// STATE MANAGEMENT TESTS
// ============================================

describe('VariableManager - State Management', () => {
  it('calls onVariablesChange when variable is added', async () => {
    const user = userEvent.setup();
    const onVariablesChange = vi.fn();
    renderComponent({ variables: [], onVariablesChange });

    const addBtn = screen.getByRole('button', { name: /add variable/i });
    await user.click(addBtn);

    const nameInput = screen.getByLabelText(/name/i);
    const valueInput = screen.getByLabelText(/value/i);

    await user.type(nameInput, 'newVar');
    await user.type(valueInput, 'newValue');

    const submitBtn = screen.getByRole('button', { name: /add|save|create/i });
    await user.click(submitBtn);

    expect(onVariablesChange).toHaveBeenCalledWith(expect.any(Array));
  });

  it('does not call onVariablesChange when form is cancelled', async () => {
    const user = userEvent.setup();
    const onVariablesChange = vi.fn();
    renderComponent({ variables: mockVariables, onVariablesChange });

    const addBtn = screen.getByRole('button', { name: /add variable/i });
    await user.click(addBtn);

    const cancelBtn = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelBtn);

    expect(onVariablesChange).not.toHaveBeenCalled();
  });

  it('updates component when variables prop changes', () => {
    const { rerender } = renderComponent({ variables: mockVariables });

    expect(screen.getByText('apiKey')).toBeInTheDocument();

    const newVariables = mockVariables.slice(0, 2);
    rerender(<VariableManager {...defaultProps} variables={newVariables} />);

    expect(screen.getByText('apiKey')).toBeInTheDocument();
  });

  it('handles readOnly mode', () => {
    renderComponent({ variables: mockVariables, readOnly: true });

    expect(screen.queryByRole('button', { name: /add variable/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
  });
});

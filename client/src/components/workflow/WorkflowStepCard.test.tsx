import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { screen, fireEvent, within } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import {
  WorkflowStepCard,
  WorkflowStepCardProps,
  StepStatus,
  WorkflowStepType,
} from './WorkflowStepCard';

// ============================================
// TEST HELPERS
// ============================================

const defaultProps: WorkflowStepCardProps = {
  stepIndex: 0,
  stepType: 'navigate',
  status: 'pending',
};

function renderComponent(props: Partial<WorkflowStepCardProps> = {}) {
  return render(<WorkflowStepCard {...defaultProps} {...props} />);
}

// ============================================
// BASIC RENDERING TESTS
// ============================================

describe('WorkflowStepCard', () => {
  describe('Basic Rendering', () => {
    it('renders without crashing', () => {
      renderComponent();
      expect(screen.getByRole('article')).toBeInTheDocument();
    });

    it('displays the step number when showStepNumber is true', () => {
      renderComponent({ stepIndex: 2, showStepNumber: true });
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('hides the step number when showStepNumber is false', () => {
      renderComponent({ stepIndex: 2, showStepNumber: false });
      expect(screen.queryByText('3')).not.toBeInTheDocument();
    });

    it('displays the default label for step type', () => {
      renderComponent({ stepType: 'navigate' });
      expect(screen.getByText('Navigate')).toBeInTheDocument();
    });

    it('displays custom label when provided', () => {
      renderComponent({ label: 'Custom Step Name' });
      expect(screen.getByText('Custom Step Name')).toBeInTheDocument();
    });

    it('displays config summary when provided', () => {
      renderComponent({ configSummary: 'https://example.com' });
      expect(screen.getByText('https://example.com')).toBeInTheDocument();
    });
  });

  // ============================================
  // STATUS DISPLAY TESTS
  // ============================================

  describe('Status Display', () => {
    const statuses: StepStatus[] = ['pending', 'running', 'completed', 'failed', 'skipped'];

    it.each(statuses)('displays %s status correctly', (status) => {
      renderComponent({ status });
      const statusLabels: Record<StepStatus, string> = {
        pending: 'Pending',
        running: 'Running',
        completed: 'Completed',
        failed: 'Failed',
        skipped: 'Skipped',
      };
      expect(screen.getByText(statusLabels[status])).toBeInTheDocument();
    });

    it('applies running animation class when status is running', () => {
      renderComponent({ status: 'running' });
      const card = screen.getByRole('article');
      expect(card).toHaveClass('ring-2');
    });

    it('applies error border when status is failed', () => {
      renderComponent({ status: 'failed' });
      const card = screen.getByRole('article');
      expect(card).toHaveClass('border-red-500/50');
    });
  });

  // ============================================
  // STEP TYPE ICONS TESTS
  // ============================================

  describe('Step Types', () => {
    const stepTypes: WorkflowStepType[] = [
      'navigate',
      'act',
      'observe',
      'extract',
      'wait',
      'condition',
      'loop',
      'apiCall',
      'notification',
    ];

    it.each(stepTypes)('renders %s step type with correct label', (stepType) => {
      renderComponent({ stepType });
      const labels: Record<WorkflowStepType, string> = {
        navigate: 'Navigate',
        act: 'Action',
        observe: 'Observe',
        extract: 'Extract Data',
        wait: 'Wait',
        condition: 'Condition',
        loop: 'Loop',
        apiCall: 'API Call',
        notification: 'Notification',
      };
      expect(screen.getByText(labels[stepType])).toBeInTheDocument();
    });
  });

  // ============================================
  // RESULT DISPLAY TESTS
  // ============================================

  describe('Result Display', () => {
    it('shows details button when result is provided', () => {
      renderComponent({
        status: 'completed',
        result: {
          stepIndex: 0,
          type: 'navigate',
          success: true,
          result: { url: 'https://example.com' },
        },
      });
      expect(screen.getByText('Show Details')).toBeInTheDocument();
    });

    it('does not show details button when no result', () => {
      renderComponent({ status: 'pending' });
      expect(screen.queryByText('Show Details')).not.toBeInTheDocument();
    });

    it('expands to show result data when clicked', async () => {
      const user = userEvent.setup();
      renderComponent({
        status: 'completed',
        result: {
          stepIndex: 0,
          type: 'navigate',
          success: true,
          result: { url: 'https://example.com' },
        },
      });

      await user.click(screen.getByText('Show Details'));
      expect(screen.getByText('Result')).toBeInTheDocument();
      expect(screen.getByText(/example\.com/)).toBeInTheDocument();
    });

    it('displays error message for failed steps', async () => {
      const user = userEvent.setup();
      renderComponent({
        status: 'failed',
        result: {
          stepIndex: 0,
          type: 'navigate',
          success: false,
          error: 'Navigation failed: timeout',
        },
      });

      await user.click(screen.getByText('Show Details'));
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Navigation failed: timeout')).toBeInTheDocument();
    });

    it('displays duration when provided', () => {
      renderComponent({
        status: 'completed',
        result: {
          stepIndex: 0,
          type: 'navigate',
          success: true,
          duration: 1500,
        },
      });
      expect(screen.getByText('1.5s')).toBeInTheDocument();
    });

    it('formats duration correctly for milliseconds', () => {
      renderComponent({
        status: 'completed',
        result: {
          stepIndex: 0,
          type: 'navigate',
          success: true,
          duration: 250,
        },
      });
      expect(screen.getByText('250ms')).toBeInTheDocument();
    });

    it('formats duration correctly for minutes', () => {
      renderComponent({
        status: 'completed',
        result: {
          stepIndex: 0,
          type: 'navigate',
          success: true,
          duration: 125000, // 2m 5s
        },
      });
      expect(screen.getByText('2m 5s')).toBeInTheDocument();
    });

    it('displays timestamp when provided', async () => {
      const user = userEvent.setup();
      const timestamp = new Date('2024-01-15T10:30:00');
      renderComponent({
        status: 'completed',
        result: {
          stepIndex: 0,
          type: 'navigate',
          success: true,
          result: {},
          timestamp,
        },
      });

      await user.click(screen.getByText('Show Details'));
      expect(screen.getByText(/Completed at:/)).toBeInTheDocument();
    });
  });

  // ============================================
  // INTERACTION TESTS
  // ============================================

  describe('Interactions', () => {
    it('calls onClick when card is clicked', async () => {
      const onClick = vi.fn();
      const user = userEvent.setup();
      renderComponent({ onClick, stepIndex: 5 });

      await user.click(screen.getByRole('article'));
      expect(onClick).toHaveBeenCalledWith(5);
    });

    it('calls onClick with Enter key', async () => {
      const onClick = vi.fn();
      renderComponent({ onClick, stepIndex: 3 });

      const card = screen.getByRole('article');
      fireEvent.keyDown(card, { key: 'Enter' });
      expect(onClick).toHaveBeenCalledWith(3);
    });

    it('calls onClick with Space key', async () => {
      const onClick = vi.fn();
      renderComponent({ onClick, stepIndex: 3 });

      const card = screen.getByRole('article');
      fireEvent.keyDown(card, { key: ' ' });
      expect(onClick).toHaveBeenCalledWith(3);
    });

    it('calls onRetry when retry button is clicked', async () => {
      const onRetry = vi.fn();
      const user = userEvent.setup();
      renderComponent({
        status: 'failed',
        stepIndex: 2,
        onRetry,
        result: {
          stepIndex: 2,
          type: 'navigate',
          success: false,
          error: 'Failed',
        },
      });

      await user.click(screen.getByText('Show Details'));
      await user.click(screen.getByText('Retry Step'));
      expect(onRetry).toHaveBeenCalledWith(2);
    });

    it('does not show retry button when onRetry is not provided', async () => {
      const user = userEvent.setup();
      renderComponent({
        status: 'failed',
        result: {
          stepIndex: 0,
          type: 'navigate',
          success: false,
          error: 'Failed',
        },
      });

      await user.click(screen.getByText('Show Details'));
      expect(screen.queryByText('Retry Step')).not.toBeInTheDocument();
    });

    it('does not show retry button for non-failed steps', async () => {
      const onRetry = vi.fn();
      const user = userEvent.setup();
      renderComponent({
        status: 'completed',
        onRetry,
        result: {
          stepIndex: 0,
          type: 'navigate',
          success: true,
          result: {},
        },
      });

      await user.click(screen.getByText('Show Details'));
      expect(screen.queryByText('Retry Step')).not.toBeInTheDocument();
    });

    it('toggles expanded state correctly', async () => {
      const user = userEvent.setup();
      renderComponent({
        status: 'completed',
        result: {
          stepIndex: 0,
          type: 'navigate',
          success: true,
          result: { data: 'test' },
        },
      });

      expect(screen.getByText('Show Details')).toBeInTheDocument();
      await user.click(screen.getByText('Show Details'));
      expect(screen.getByText('Hide Details')).toBeInTheDocument();
      await user.click(screen.getByText('Hide Details'));
      expect(screen.getByText('Show Details')).toBeInTheDocument();
    });
  });

  // ============================================
  // COMPACT MODE TESTS
  // ============================================

  describe('Compact Mode', () => {
    it('renders in compact mode', () => {
      renderComponent({ compact: true });
      expect(screen.getByRole('listitem')).toBeInTheDocument();
      expect(screen.queryByRole('article')).not.toBeInTheDocument();
    });

    it('displays step number in compact mode', () => {
      renderComponent({ compact: true, stepIndex: 4, showStepNumber: true });
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('displays label in compact mode', () => {
      renderComponent({ compact: true, label: 'Compact Step' });
      expect(screen.getByText('Compact Step')).toBeInTheDocument();
    });

    it('displays duration in compact mode', () => {
      renderComponent({
        compact: true,
        status: 'completed',
        result: {
          stepIndex: 0,
          type: 'navigate',
          success: true,
          duration: 500,
        },
      });
      expect(screen.getByText('500ms')).toBeInTheDocument();
    });

    it('is clickable in compact mode', async () => {
      const onClick = vi.fn();
      const user = userEvent.setup();
      renderComponent({ compact: true, onClick, stepIndex: 1 });

      await user.click(screen.getByRole('listitem'));
      expect(onClick).toHaveBeenCalledWith(1);
    });
  });

  // ============================================
  // ACCESSIBILITY TESTS
  // ============================================

  describe('Accessibility', () => {
    it('has correct aria-label for full card', () => {
      renderComponent({ stepIndex: 0, stepType: 'navigate' });
      expect(
        screen.getByRole('article', { name: /Workflow step 1: Navigate/i })
      ).toBeInTheDocument();
    });

    it('has correct aria-label for compact mode', () => {
      renderComponent({ compact: true, stepIndex: 1, stepType: 'extract', status: 'completed' });
      expect(
        screen.getByRole('listitem', { name: /Step 2: Extract Data - Completed/i })
      ).toBeInTheDocument();
    });

    it('has tabindex when clickable', () => {
      const onClick = vi.fn();
      renderComponent({ onClick });
      expect(screen.getByRole('article')).toHaveAttribute('tabindex', '0');
    });

    it('does not have tabindex when not clickable', () => {
      renderComponent();
      expect(screen.getByRole('article')).not.toHaveAttribute('tabindex');
    });

    it('has aria-expanded on collapsible trigger', async () => {
      const user = userEvent.setup();
      renderComponent({
        status: 'completed',
        result: {
          stepIndex: 0,
          type: 'navigate',
          success: true,
          result: {},
        },
      });

      const trigger = screen.getByRole('button', { name: /Show Details/i });
      expect(trigger).toHaveAttribute('aria-expanded', 'false');

      await user.click(trigger);
      expect(screen.getByRole('button', { name: /Hide Details/i })).toHaveAttribute(
        'aria-expanded',
        'true'
      );
    });

    it('error message has alert role', async () => {
      const user = userEvent.setup();
      renderComponent({
        status: 'failed',
        result: {
          stepIndex: 0,
          type: 'navigate',
          success: false,
          error: 'Test error',
        },
      });

      await user.click(screen.getByText('Show Details'));
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('duration has aria-label', () => {
      renderComponent({
        status: 'completed',
        result: {
          stepIndex: 0,
          type: 'navigate',
          success: true,
          duration: 2000,
        },
      });
      expect(screen.getByLabelText('Duration: 2.0s')).toBeInTheDocument();
    });
  });

  // ============================================
  // DEFAULT EXPANDED TESTS
  // ============================================

  describe('Default Expanded', () => {
    it('starts collapsed by default', () => {
      renderComponent({
        status: 'completed',
        result: {
          stepIndex: 0,
          type: 'navigate',
          success: true,
          result: {},
        },
      });
      expect(screen.queryByText('Result')).not.toBeInTheDocument();
    });

    it('starts expanded when defaultExpanded is true', () => {
      renderComponent({
        defaultExpanded: true,
        status: 'completed',
        result: {
          stepIndex: 0,
          type: 'navigate',
          success: true,
          result: { test: 'data' },
        },
      });
      expect(screen.getByText('Result')).toBeInTheDocument();
    });
  });

  // ============================================
  // EDGE CASES
  // ============================================

  describe('Edge Cases', () => {
    it('handles null result gracefully', () => {
      renderComponent({
        status: 'completed',
        result: {
          stepIndex: 0,
          type: 'navigate',
          success: true,
          result: null,
        },
      });
      expect(screen.getByRole('article')).toBeInTheDocument();
    });

    it('handles undefined result gracefully', () => {
      renderComponent({
        status: 'completed',
        result: {
          stepIndex: 0,
          type: 'navigate',
          success: true,
          result: undefined,
        },
      });
      expect(screen.getByRole('article')).toBeInTheDocument();
    });

    it('handles complex nested result data', async () => {
      const user = userEvent.setup();
      const complexResult = {
        data: [
          { id: 1, name: 'Item 1' },
          { id: 2, name: 'Item 2' },
        ],
        meta: { total: 2, page: 1 },
      };

      renderComponent({
        status: 'completed',
        result: {
          stepIndex: 0,
          type: 'extract',
          success: true,
          result: complexResult,
        },
      });

      await user.click(screen.getByText('Show Details'));
      expect(screen.getByText(/Item 1/)).toBeInTheDocument();
    });

    it('applies custom className', () => {
      renderComponent({ className: 'custom-test-class' });
      expect(screen.getByRole('article')).toHaveClass('custom-test-class');
    });

    it('handles very long error messages', async () => {
      const user = userEvent.setup();
      const longError = 'A'.repeat(500);
      renderComponent({
        status: 'failed',
        result: {
          stepIndex: 0,
          type: 'navigate',
          success: false,
          error: longError,
        },
      });

      await user.click(screen.getByText('Show Details'));
      expect(screen.getByText(longError)).toBeInTheDocument();
    });

    it('handles string result', async () => {
      const user = userEvent.setup();
      renderComponent({
        status: 'completed',
        result: {
          stepIndex: 0,
          type: 'notification',
          success: true,
          result: 'Notification sent successfully',
        },
      });

      await user.click(screen.getByText('Show Details'));
      expect(screen.getByText('Notification sent successfully')).toBeInTheDocument();
    });
  });
});

/**
 * GHLConnectStep Component Tests
 *
 * Tests for the GoHighLevel API key connection step including:
 * - Basic rendering
 * - API key input and validation
 * - Connection testing
 * - Success and error states
 * - Navigation (back, skip, continue)
 * - Show/hide API key toggle
 */

import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GHLConnectStep } from '../GHLConnectStep';
import type { OnboardingData } from '../OnboardingWizard';

// Mock trpc with the validateGHLApiKey mutation
const mockMutateAsync = vi.fn();

vi.mock('@/lib/trpc', () => ({
  trpc: {
    onboarding: {
      validateGHLApiKey: {
        useMutation: () => ({
          mutateAsync: mockMutateAsync,
          isLoading: false,
          isPending: false,
        }),
      },
    },
  },
}));

// Sample test data
const defaultOnboardingData: OnboardingData = {
  fullName: 'Test User',
  companyName: 'Test Company',
  phoneNumber: '555-123-4567',
  industry: 'technology',
  monthlyRevenue: '100k-500k',
  employeeCount: '10-50',
  websiteUrl: 'https://example.com',
  goals: ['automation', 'scaling'],
  ghlApiKey: '',
  brandVoice: '',
  brandGuidelines: [],
  logoFile: null,
  integrations: [],
};

describe('GHLConnectStep', () => {
  const mockOnNext = vi.fn();
  const mockOnBack = vi.fn();
  const mockOnSkip = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock success response
    mockMutateAsync.mockResolvedValue({ success: true, details: { plan: 'Pro Plan' } });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('renders the step header with title and description', () => {
      render(
        <GHLConnectStep
          data={defaultOnboardingData}
          onNext={mockOnNext}
          onBack={mockOnBack}
          onSkip={mockOnSkip}
        />
      );

      expect(screen.getByText('Connect GoHighLevel')).toBeInTheDocument();
      expect(
        screen.getByText('Link your GoHighLevel account to enable powerful automation features')
      ).toBeInTheDocument();
    });

    it('renders the API key input field', () => {
      render(
        <GHLConnectStep
          data={defaultOnboardingData}
          onNext={mockOnNext}
          onBack={mockOnBack}
          onSkip={mockOnSkip}
        />
      );

      expect(screen.getByLabelText(/GoHighLevel Agency API Key/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText('pit_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx')).toBeInTheDocument();
    });

    it('renders how-to instructions', () => {
      render(
        <GHLConnectStep
          data={defaultOnboardingData}
          onNext={mockOnNext}
          onBack={mockOnBack}
          onSkip={mockOnSkip}
        />
      );

      expect(screen.getByText('How to get your GHL API Key:')).toBeInTheDocument();
      expect(screen.getByText('Log into your GoHighLevel account')).toBeInTheDocument();
    });

    it('renders benefits list', () => {
      render(
        <GHLConnectStep
          data={defaultOnboardingData}
          onNext={mockOnNext}
          onBack={mockOnBack}
          onSkip={mockOnSkip}
        />
      );

      expect(screen.getByText("What you'll unlock:")).toBeInTheDocument();
      expect(screen.getByText('Automatic sub-account discovery and syncing')).toBeInTheDocument();
      expect(screen.getByText('Seamless contact and lead management')).toBeInTheDocument();
    });

    it('renders skip info message', () => {
      render(
        <GHLConnectStep
          data={defaultOnboardingData}
          onNext={mockOnNext}
          onBack={mockOnBack}
          onSkip={mockOnSkip}
        />
      );

      expect(screen.getByText(/Don't have your API key handy/)).toBeInTheDocument();
    });

    it('renders navigation buttons', () => {
      render(
        <GHLConnectStep
          data={defaultOnboardingData}
          onNext={mockOnNext}
          onBack={mockOnBack}
          onSkip={mockOnSkip}
        />
      );

      expect(screen.getByRole('button', { name: /Back/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Skip for now/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Continue/i })).toBeInTheDocument();
    });

    it('renders test connection button', () => {
      render(
        <GHLConnectStep
          data={defaultOnboardingData}
          onNext={mockOnNext}
          onBack={mockOnBack}
          onSkip={mockOnSkip}
        />
      );

      expect(screen.getByRole('button', { name: /Test Connection/i })).toBeInTheDocument();
    });
  });

  describe('API Key Input', () => {
    it('allows typing in the API key field', async () => {
      const user = userEvent.setup();
      render(
        <GHLConnectStep
          data={defaultOnboardingData}
          onNext={mockOnNext}
          onBack={mockOnBack}
          onSkip={mockOnSkip}
        />
      );

      const input = screen.getByPlaceholderText('pit_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
      await user.type(input, 'test-api-key-12345');

      expect(input).toHaveValue('test-api-key-12345');
    });

    it('pre-fills API key if data contains one', () => {
      const dataWithKey = { ...defaultOnboardingData, ghlApiKey: 'existing-api-key' };
      render(
        <GHLConnectStep
          data={dataWithKey}
          onNext={mockOnNext}
          onBack={mockOnBack}
          onSkip={mockOnSkip}
        />
      );

      const input = screen.getByPlaceholderText('pit_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
      expect(input).toHaveValue('existing-api-key');
    });

    it('hides API key by default (password type)', () => {
      render(
        <GHLConnectStep
          data={defaultOnboardingData}
          onNext={mockOnNext}
          onBack={mockOnBack}
          onSkip={mockOnSkip}
        />
      );

      const input = screen.getByPlaceholderText('pit_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
      expect(input).toHaveAttribute('type', 'password');
    });

    it('shows API key when Show button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <GHLConnectStep
          data={defaultOnboardingData}
          onNext={mockOnNext}
          onBack={mockOnBack}
          onSkip={mockOnSkip}
        />
      );

      const showBtn = screen.getByText('Show');
      await user.click(showBtn);

      const input = screen.getByPlaceholderText('pit_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
      expect(input).toHaveAttribute('type', 'text');
      expect(screen.getByText('Hide')).toBeInTheDocument();
    });

    it('hides API key when Hide button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <GHLConnectStep
          data={defaultOnboardingData}
          onNext={mockOnNext}
          onBack={mockOnBack}
          onSkip={mockOnSkip}
        />
      );

      // Show first
      await user.click(screen.getByText('Show'));
      // Then hide
      await user.click(screen.getByText('Hide'));

      const input = screen.getByPlaceholderText('pit_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
      expect(input).toHaveAttribute('type', 'password');
    });
  });

  describe('Test Connection Button', () => {
    it('is disabled when API key is empty', () => {
      render(
        <GHLConnectStep
          data={defaultOnboardingData}
          onNext={mockOnNext}
          onBack={mockOnBack}
          onSkip={mockOnSkip}
        />
      );

      const testBtn = screen.getByRole('button', { name: /Test Connection/i });
      expect(testBtn).toBeDisabled();
    });

    it('is enabled when API key has value', async () => {
      const user = userEvent.setup();
      render(
        <GHLConnectStep
          data={defaultOnboardingData}
          onNext={mockOnNext}
          onBack={mockOnBack}
          onSkip={mockOnSkip}
        />
      );

      const input = screen.getByPlaceholderText('pit_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
      await user.type(input, 'valid-api-key');

      const testBtn = screen.getByRole('button', { name: /Test Connection/i });
      expect(testBtn).not.toBeDisabled();
    });

    it('shows success message on successful test', async () => {
      const user = userEvent.setup();
      mockMutateAsync.mockResolvedValueOnce({ success: true });

      render(
        <GHLConnectStep
          data={defaultOnboardingData}
          onNext={mockOnNext}
          onBack={mockOnBack}
          onSkip={mockOnSkip}
        />
      );

      const input = screen.getByPlaceholderText('pit_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
      await user.type(input, 'valid-api-key-long-enough');

      const testBtn = screen.getByRole('button', { name: /Test Connection/i });
      await user.click(testBtn);

      await waitFor(() => {
        expect(screen.getByText(/Connection successful/)).toBeInTheDocument();
      });
    });

    it('shows error message for invalid API key (too short)', async () => {
      const user = userEvent.setup();
      render(
        <GHLConnectStep
          data={defaultOnboardingData}
          onNext={mockOnNext}
          onBack={mockOnBack}
          onSkip={mockOnSkip}
        />
      );

      const input = screen.getByPlaceholderText('pit_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
      await user.type(input, 'short'); // Less than 10 characters

      const testBtn = screen.getByRole('button', { name: /Test Connection/i });
      await user.click(testBtn);

      // Client-side validation should show error immediately (no API call)
      await waitFor(() => {
        expect(screen.getByText(/Invalid API key format/)).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    it('calls onBack when Back button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <GHLConnectStep
          data={defaultOnboardingData}
          onNext={mockOnNext}
          onBack={mockOnBack}
          onSkip={mockOnSkip}
        />
      );

      const backBtn = screen.getByRole('button', { name: /Back/i });
      await user.click(backBtn);

      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });

    it('calls onSkip when Skip button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <GHLConnectStep
          data={defaultOnboardingData}
          onNext={mockOnNext}
          onBack={mockOnBack}
          onSkip={mockOnSkip}
        />
      );

      const skipBtn = screen.getByRole('button', { name: /Skip for now/i });
      await user.click(skipBtn);

      expect(mockOnSkip).toHaveBeenCalledTimes(1);
    });

    it('calls onNext with API key when Continue is clicked (no key)', async () => {
      const user = userEvent.setup();
      render(
        <GHLConnectStep
          data={defaultOnboardingData}
          onNext={mockOnNext}
          onBack={mockOnBack}
          onSkip={mockOnSkip}
        />
      );

      const continueBtn = screen.getByRole('button', { name: /Continue/i });
      await user.click(continueBtn);

      expect(mockOnNext).toHaveBeenCalledWith({ ghlApiKey: '' });
    });

    it('calls onNext with API key when Continue is clicked after successful test', async () => {
      const user = userEvent.setup();
      mockMutateAsync.mockResolvedValueOnce({ success: true });

      render(
        <GHLConnectStep
          data={defaultOnboardingData}
          onNext={mockOnNext}
          onBack={mockOnBack}
          onSkip={mockOnSkip}
        />
      );

      const input = screen.getByPlaceholderText('pit_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
      await user.type(input, 'valid-api-key-12345');

      // Test connection first
      const testBtn = screen.getByRole('button', { name: /Test Connection/i });
      await user.click(testBtn);

      await waitFor(() => {
        expect(screen.getByText(/Connection successful/)).toBeInTheDocument();
      });

      // Now continue
      const continueBtn = screen.getByRole('button', { name: /Continue/i });
      await user.click(continueBtn);

      expect(mockOnNext).toHaveBeenCalledWith({ ghlApiKey: 'valid-api-key-12345' });
    });
  });

  describe('Continue Button State', () => {
    it('is enabled when no API key is entered', () => {
      render(
        <GHLConnectStep
          data={defaultOnboardingData}
          onNext={mockOnNext}
          onBack={mockOnBack}
          onSkip={mockOnSkip}
        />
      );

      const continueBtn = screen.getByRole('button', { name: /Continue/i });
      expect(continueBtn).not.toBeDisabled();
    });

    it('is disabled when API key is entered but not tested successfully', async () => {
      const user = userEvent.setup();
      render(
        <GHLConnectStep
          data={defaultOnboardingData}
          onNext={mockOnNext}
          onBack={mockOnBack}
          onSkip={mockOnSkip}
        />
      );

      const input = screen.getByPlaceholderText('pit_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
      await user.type(input, 'some-api-key');

      const continueBtn = screen.getByRole('button', { name: /Continue/i });
      expect(continueBtn).toBeDisabled();
    });

    it('is enabled after successful test', async () => {
      const user = userEvent.setup();
      mockMutateAsync.mockResolvedValueOnce({ success: true });

      render(
        <GHLConnectStep
          data={defaultOnboardingData}
          onNext={mockOnNext}
          onBack={mockOnBack}
          onSkip={mockOnSkip}
        />
      );

      const input = screen.getByPlaceholderText('pit_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
      await user.type(input, 'valid-api-key-12345');

      const testBtn = screen.getByRole('button', { name: /Test Connection/i });
      await user.click(testBtn);

      await waitFor(() => {
        expect(screen.getByText(/Connection successful/)).toBeInTheDocument();
      });

      const continueBtn = screen.getByRole('button', { name: /Continue/i });
      expect(continueBtn).not.toBeDisabled();
    });
  });

  describe('Security Info', () => {
    it('displays encryption notice', () => {
      render(
        <GHLConnectStep
          data={defaultOnboardingData}
          onNext={mockOnNext}
          onBack={mockOnBack}
          onSkip={mockOnSkip}
        />
      );

      expect(screen.getByText(/encrypted with AES-256/i)).toBeInTheDocument();
    });
  });

  describe('External Links', () => {
    it('renders link to GHL help documentation', () => {
      render(
        <GHLConnectStep
          data={defaultOnboardingData}
          onNext={mockOnNext}
          onBack={mockOnBack}
          onSkip={mockOnSkip}
        />
      );

      const helpLink = screen.getByRole('link', { name: /View detailed instructions/i });
      expect(helpLink).toHaveAttribute(
        'href',
        'https://help.gohighlevel.com/support/solutions/articles/155000001808-agency-api-keys'
      );
      expect(helpLink).toHaveAttribute('target', '_blank');
      expect(helpLink).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });
});

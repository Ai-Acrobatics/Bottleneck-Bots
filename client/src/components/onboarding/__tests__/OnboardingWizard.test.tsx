/**
 * OnboardingWizard Component Tests
 *
 * Tests for the multi-step onboarding wizard including:
 * - Step navigation (next, back, skip)
 * - Progress indicator updates
 * - Data persistence to localStorage
 * - Form submission
 * - Error handling
 */

import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { OnboardingWizard } from '../OnboardingWizard';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock trpc with all required mutations - using factory pattern to return fresh mocks
const createMockMutation = () => {
  const mockMutateAsync = vi.fn().mockResolvedValue({});
  return {
    useMutation: () => ({
      mutateAsync: mockMutateAsync,
      mutate: vi.fn(),
      isLoading: false,
      isPending: false,
      isError: false,
      error: null,
      data: null,
    }),
    _mockMutateAsync: mockMutateAsync,
  };
};

const submitMock = createMockMutation();
const uploadBrandAssetsMock = createMockMutation();
const saveBrandVoiceMock = createMockMutation();
const initializeIntegrationsMock = createMockMutation();

vi.mock('@/lib/trpc', () => ({
  trpc: {
    onboarding: {
      submit: submitMock,
      uploadBrandAssets: uploadBrandAssetsMock,
      saveBrandVoice: saveBrandVoiceMock,
      initializeIntegrations: initializeIntegrationsMock,
    },
  },
}));

// Mock child step components
vi.mock('../WelcomeStep', () => ({
  WelcomeStep: ({ onNext, onBack, isFirstStep }: any) => (
    <div data-testid="welcome-step">
      <h2>Welcome Step</h2>
      <button onClick={() => onNext({ fullName: 'Test User', companyName: 'Test Co' })} data-testid="welcome-next">
        Next
      </button>
      {!isFirstStep && <button onClick={onBack} data-testid="welcome-back">Back</button>}
    </div>
  ),
}));

vi.mock('../QuickDemoStep', () => ({
  QuickDemoStep: ({ onNext, onBack, onSkip }: any) => (
    <div data-testid="demo-step">
      <h2>Quick Demo Step</h2>
      <button onClick={() => onNext({})} data-testid="demo-next">Next</button>
      <button onClick={onBack} data-testid="demo-back">Back</button>
      <button onClick={onSkip} data-testid="demo-skip">Skip</button>
    </div>
  ),
}));

vi.mock('../GHLConnectStep', () => ({
  GHLConnectStep: ({ onNext, onBack, onSkip }: any) => (
    <div data-testid="ghl-step">
      <h2>GHL Connect Step</h2>
      <button onClick={() => onNext({ ghlApiKey: 'test-key' })} data-testid="ghl-next">Next</button>
      <button onClick={onBack} data-testid="ghl-back">Back</button>
      <button onClick={onSkip} data-testid="ghl-skip">Skip</button>
    </div>
  ),
}));

vi.mock('../BrandSetupStep', () => ({
  BrandSetupStep: ({ onNext, onBack, onSkip }: any) => (
    <div data-testid="brand-step">
      <h2>Brand Setup Step</h2>
      <button onClick={() => onNext({ brandVoice: 'professional' })} data-testid="brand-next">Next</button>
      <button onClick={onBack} data-testid="brand-back">Back</button>
      <button onClick={onSkip} data-testid="brand-skip">Skip</button>
    </div>
  ),
}));

vi.mock('../IntegrationsStep', () => ({
  IntegrationsStep: ({ onNext, onBack, onSkip }: any) => (
    <div data-testid="integrations-step">
      <h2>Integrations Step</h2>
      <button onClick={() => onNext({ integrations: ['slack'] })} data-testid="integrations-next">Next</button>
      <button onClick={onBack} data-testid="integrations-back">Back</button>
      <button onClick={onSkip} data-testid="integrations-skip">Skip</button>
    </div>
  ),
}));

vi.mock('../CompletionStep', () => ({
  CompletionStep: ({ onComplete, onBack, isLoading }: any) => (
    <div data-testid="completion-step">
      <h2>Completion Step</h2>
      <button onClick={onComplete} data-testid="complete-btn" disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Complete'}
      </button>
      <button onClick={onBack} data-testid="completion-back">Back</button>
    </div>
  ),
}));

// Mock GlassPane component
vi.mock('../../GlassPane', () => ({
  GlassPane: ({ children, className }: any) => (
    <div className={className} data-testid="glass-pane">{children}</div>
  ),
}));

describe('OnboardingWizard', () => {
  const mockOnComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    // Reset mock implementations
    submitMock._mockMutateAsync.mockResolvedValue({});
    uploadBrandAssetsMock._mockMutateAsync.mockResolvedValue({ assets: [] });
    saveBrandVoiceMock._mockMutateAsync.mockResolvedValue({});
    initializeIntegrationsMock._mockMutateAsync.mockResolvedValue({});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('renders the wizard header with title', () => {
      render(<OnboardingWizard onComplete={mockOnComplete} />);

      expect(screen.getByText('Welcome to Bottleneck Bots')).toBeInTheDocument();
      expect(screen.getByText("Let's get you set up in just a few steps")).toBeInTheDocument();
    });

    it('renders step indicators', () => {
      render(<OnboardingWizard onComplete={mockOnComplete} />);

      expect(screen.getByText('Welcome')).toBeInTheDocument();
      expect(screen.getByText('Quick Demo')).toBeInTheDocument();
      expect(screen.getByText('Connect GHL')).toBeInTheDocument();
      expect(screen.getByText('Brand Setup')).toBeInTheDocument();
      expect(screen.getByText('Integrations')).toBeInTheDocument();
      expect(screen.getByText('Complete')).toBeInTheDocument();
    });

    it('renders progress bar', () => {
      render(<OnboardingWizard onComplete={mockOnComplete} />);

      expect(screen.getByText('Step 1 of 6')).toBeInTheDocument();
    });

    it('starts at step 1 with WelcomeStep', () => {
      render(<OnboardingWizard onComplete={mockOnComplete} />);

      expect(screen.getByTestId('welcome-step')).toBeInTheDocument();
    });
  });

  describe('Step Navigation', () => {
    it('navigates to next step when clicking next', async () => {
      const user = userEvent.setup();
      render(<OnboardingWizard onComplete={mockOnComplete} />);

      expect(screen.getByTestId('welcome-step')).toBeInTheDocument();

      const nextBtn = screen.getByTestId('welcome-next');
      await user.click(nextBtn);

      await waitFor(() => {
        expect(screen.getByTestId('demo-step')).toBeInTheDocument();
      });
      expect(screen.getByText('Step 2 of 6')).toBeInTheDocument();
    });

    it('navigates back to previous step when clicking back', async () => {
      const user = userEvent.setup();
      render(<OnboardingWizard onComplete={mockOnComplete} />);

      // Go to step 2
      await user.click(screen.getByTestId('welcome-next'));
      await waitFor(() => {
        expect(screen.getByTestId('demo-step')).toBeInTheDocument();
      });

      // Go back to step 1
      await user.click(screen.getByTestId('demo-back'));
      await waitFor(() => {
        expect(screen.getByTestId('welcome-step')).toBeInTheDocument();
      });
    });

    it('skips to next step when clicking skip', async () => {
      const user = userEvent.setup();
      render(<OnboardingWizard onComplete={mockOnComplete} />);

      // Go to step 2
      await user.click(screen.getByTestId('welcome-next'));
      await waitFor(() => {
        expect(screen.getByTestId('demo-step')).toBeInTheDocument();
      });

      // Skip to step 3
      await user.click(screen.getByTestId('demo-skip'));
      await waitFor(() => {
        expect(screen.getByTestId('ghl-step')).toBeInTheDocument();
      });
    });

    it('progresses through all steps to completion', async () => {
      const user = userEvent.setup();
      render(<OnboardingWizard onComplete={mockOnComplete} />);

      // Step 1 -> 2
      await user.click(screen.getByTestId('welcome-next'));
      await waitFor(() => expect(screen.getByTestId('demo-step')).toBeInTheDocument());

      // Step 2 -> 3
      await user.click(screen.getByTestId('demo-next'));
      await waitFor(() => expect(screen.getByTestId('ghl-step')).toBeInTheDocument());

      // Step 3 -> 4
      await user.click(screen.getByTestId('ghl-next'));
      await waitFor(() => expect(screen.getByTestId('brand-step')).toBeInTheDocument());

      // Step 4 -> 5
      await user.click(screen.getByTestId('brand-next'));
      await waitFor(() => expect(screen.getByTestId('integrations-step')).toBeInTheDocument());

      // Step 5 -> 6
      await user.click(screen.getByTestId('integrations-next'));
      await waitFor(() => expect(screen.getByTestId('completion-step')).toBeInTheDocument());
    });
  });

  describe('Progress Indicator', () => {
    it('updates progress text as user advances', async () => {
      const user = userEvent.setup();
      render(<OnboardingWizard onComplete={mockOnComplete} />);

      expect(screen.getByText('Step 1 of 6')).toBeInTheDocument();

      await user.click(screen.getByTestId('welcome-next'));
      await waitFor(() => {
        expect(screen.getByText('Step 2 of 6')).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('demo-next'));
      await waitFor(() => {
        expect(screen.getByText('Step 3 of 6')).toBeInTheDocument();
      });
    });
  });

  describe('Data Persistence', () => {
    it('saves progress to localStorage when advancing steps', async () => {
      const user = userEvent.setup();
      render(<OnboardingWizard onComplete={mockOnComplete} />);

      await user.click(screen.getByTestId('welcome-next'));

      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          'ghl_onboarding_progress',
          expect.any(String)
        );
      });

      const savedData = JSON.parse(
        localStorageMock.setItem.mock.calls[
          localStorageMock.setItem.mock.calls.length - 1
        ][1]
      );
      expect(savedData.currentStep).toBe(2);
      expect(savedData.data.fullName).toBe('Test User');
    });

    it('loads saved progress from localStorage on mount', () => {
      const savedProgress = {
        currentStep: 3,
        data: {
          fullName: 'Saved User',
          companyName: 'Saved Co',
        },
      };
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(savedProgress));

      render(<OnboardingWizard onComplete={mockOnComplete} />);

      expect(localStorageMock.getItem).toHaveBeenCalledWith('ghl_onboarding_progress');
      expect(screen.getByTestId('ghl-step')).toBeInTheDocument();
    });

    it('handles corrupted localStorage data gracefully', () => {
      localStorageMock.getItem.mockReturnValueOnce('invalid json');

      render(<OnboardingWizard onComplete={mockOnComplete} />);

      // Should start at step 1 when data is corrupted
      expect(screen.getByTestId('welcome-step')).toBeInTheDocument();
    });
  });

  describe('Completion', () => {
    it('calls onboarding submit mutation on completion', async () => {
      const user = userEvent.setup();

      render(<OnboardingWizard onComplete={mockOnComplete} />);

      // Navigate through all steps
      await user.click(screen.getByTestId('welcome-next'));
      await waitFor(() => expect(screen.getByTestId('demo-step')).toBeInTheDocument());

      await user.click(screen.getByTestId('demo-next'));
      await waitFor(() => expect(screen.getByTestId('ghl-step')).toBeInTheDocument());

      await user.click(screen.getByTestId('ghl-next'));
      await waitFor(() => expect(screen.getByTestId('brand-step')).toBeInTheDocument());

      await user.click(screen.getByTestId('brand-next'));
      await waitFor(() => expect(screen.getByTestId('integrations-step')).toBeInTheDocument());

      await user.click(screen.getByTestId('integrations-next'));
      await waitFor(() => expect(screen.getByTestId('completion-step')).toBeInTheDocument());

      // Complete onboarding
      await user.click(screen.getByTestId('complete-btn'));

      await waitFor(() => {
        expect(submitMock._mockMutateAsync).toHaveBeenCalled();
      });
    });

    it('clears localStorage on successful completion', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

      render(<OnboardingWizard onComplete={mockOnComplete} />);

      // Navigate to completion
      await user.click(screen.getByTestId('welcome-next'));
      await waitFor(() => expect(screen.getByTestId('demo-step')).toBeInTheDocument());

      await user.click(screen.getByTestId('demo-skip'));
      await waitFor(() => expect(screen.getByTestId('ghl-step')).toBeInTheDocument());

      await user.click(screen.getByTestId('ghl-skip'));
      await waitFor(() => expect(screen.getByTestId('brand-step')).toBeInTheDocument());

      await user.click(screen.getByTestId('brand-skip'));
      await waitFor(() => expect(screen.getByTestId('integrations-step')).toBeInTheDocument());

      await user.click(screen.getByTestId('integrations-skip'));
      await waitFor(() => expect(screen.getByTestId('completion-step')).toBeInTheDocument());

      await user.click(screen.getByTestId('complete-btn'));

      await waitFor(() => {
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('ghl_onboarding_progress');
      });

      vi.useRealTimers();
    });

    it('calls onComplete callback after successful submission', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

      render(<OnboardingWizard onComplete={mockOnComplete} />);

      // Fast track to completion using skips
      await user.click(screen.getByTestId('welcome-next'));
      await waitFor(() => expect(screen.getByTestId('demo-step')).toBeInTheDocument());

      await user.click(screen.getByTestId('demo-skip'));
      await waitFor(() => expect(screen.getByTestId('ghl-step')).toBeInTheDocument());

      await user.click(screen.getByTestId('ghl-skip'));
      await waitFor(() => expect(screen.getByTestId('brand-step')).toBeInTheDocument());

      await user.click(screen.getByTestId('brand-skip'));
      await waitFor(() => expect(screen.getByTestId('integrations-step')).toBeInTheDocument());

      await user.click(screen.getByTestId('integrations-skip'));
      await waitFor(() => expect(screen.getByTestId('completion-step')).toBeInTheDocument());

      await user.click(screen.getByTestId('complete-btn'));

      // Wait for the setTimeout in handleComplete
      await vi.advanceTimersByTimeAsync(3000);

      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalled();
      });

      vi.useRealTimers();
    });
  });

  describe('Error Handling', () => {
    it('displays error message when submission fails', async () => {
      const user = userEvent.setup();
      submitMock._mockMutateAsync.mockRejectedValueOnce(new Error('Submission failed'));

      render(<OnboardingWizard onComplete={mockOnComplete} />);

      // Navigate to completion
      await user.click(screen.getByTestId('welcome-next'));
      await waitFor(() => expect(screen.getByTestId('demo-step')).toBeInTheDocument());

      await user.click(screen.getByTestId('demo-skip'));
      await waitFor(() => expect(screen.getByTestId('ghl-step')).toBeInTheDocument());

      await user.click(screen.getByTestId('ghl-skip'));
      await waitFor(() => expect(screen.getByTestId('brand-step')).toBeInTheDocument());

      await user.click(screen.getByTestId('brand-skip'));
      await waitFor(() => expect(screen.getByTestId('integrations-step')).toBeInTheDocument());

      await user.click(screen.getByTestId('integrations-skip'));
      await waitFor(() => expect(screen.getByTestId('completion-step')).toBeInTheDocument());

      await user.click(screen.getByTestId('complete-btn'));

      await waitFor(() => {
        expect(screen.getByText('Submission failed')).toBeInTheDocument();
      });
    });

    it('clears error when navigating away', async () => {
      const user = userEvent.setup();
      submitMock._mockMutateAsync.mockRejectedValueOnce(new Error('Submission failed'));

      render(<OnboardingWizard onComplete={mockOnComplete} />);

      // Navigate to completion
      await user.click(screen.getByTestId('welcome-next'));
      await waitFor(() => expect(screen.getByTestId('demo-step')).toBeInTheDocument());

      await user.click(screen.getByTestId('demo-skip'));
      await waitFor(() => expect(screen.getByTestId('ghl-step')).toBeInTheDocument());

      await user.click(screen.getByTestId('ghl-skip'));
      await waitFor(() => expect(screen.getByTestId('brand-step')).toBeInTheDocument());

      await user.click(screen.getByTestId('brand-skip'));
      await waitFor(() => expect(screen.getByTestId('integrations-step')).toBeInTheDocument());

      await user.click(screen.getByTestId('integrations-skip'));
      await waitFor(() => expect(screen.getByTestId('completion-step')).toBeInTheDocument());

      await user.click(screen.getByTestId('complete-btn'));

      await waitFor(() => {
        expect(screen.getByText('Submission failed')).toBeInTheDocument();
      });

      // Go back and error should be cleared
      await user.click(screen.getByTestId('completion-back'));

      await waitFor(() => {
        expect(screen.queryByText('Submission failed')).not.toBeInTheDocument();
      });
    });
  });
});

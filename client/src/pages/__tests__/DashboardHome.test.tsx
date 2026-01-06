/**
 * DashboardHome Component Tests
 *
 * Tests for the main dashboard page including:
 * - Rendering of metrics cards
 * - Quick action buttons
 * - Subscription usage display
 * - Modal interactions
 */

import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DashboardHome from '../DashboardHome';

// Mock wouter
const mockSetLocation = vi.fn();
vi.mock('wouter', () => ({
  useLocation: () => ['/dashboard', mockSetLocation],
}));

// Mock trpc
const mockSubscriptionQuery = {
  data: {
    tier: { slug: 'pro' },
    usage: { executionsUsed: 50, executionLimit: 100 },
    limits: { maxAgents: 5 },
  },
  isLoading: false,
  error: null,
};

vi.mock('@/lib/trpc', () => ({
  trpc: {
    subscription: {
      getMySubscription: {
        useQuery: () => mockSubscriptionQuery,
      },
    },
  },
}));

// Mock subscription components
vi.mock('@/components/subscription', () => ({
  SubscriptionUsageCard: ({ onUpgradeClick, onBuyPackClick }: any) => (
    <div data-testid="subscription-usage-card">
      <button onClick={onUpgradeClick} data-testid="upgrade-btn">
        Upgrade
      </button>
      <button onClick={onBuyPackClick} data-testid="buy-pack-btn">
        Buy Pack
      </button>
    </div>
  ),
  UpgradeModal: ({ isOpen, onClose }: any) =>
    isOpen ? (
      <div data-testid="upgrade-modal">
        <button onClick={onClose}>Close Upgrade</button>
      </div>
    ) : null,
  ExecutionPacksModal: ({ isOpen, onClose }: any) =>
    isOpen ? (
      <div data-testid="packs-modal">
        <button onClick={onClose}>Close Packs</button>
      </div>
    ) : null,
}));

// Mock UI components
vi.mock('@/components/ui/breadcrumb', () => ({
  Breadcrumb: ({ items }: any) => (
    <nav data-testid="breadcrumb">
      {items.map((item: any, i: number) => (
        <span key={i}>{item.label}</span>
      ))}
    </nav>
  ),
}));

describe('DashboardHome', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders dashboard header with title', () => {
      render(<DashboardHome />);

      // Use getByRole for the heading to be specific
      expect(screen.getByRole('heading', { name: 'Dashboard', level: 1 })).toBeInTheDocument();
      expect(
        screen.getByText('Welcome to your Bottleneck Bots Dashboard')
      ).toBeInTheDocument();
    });

    it('renders breadcrumb navigation', () => {
      render(<DashboardHome />);

      expect(screen.getByTestId('breadcrumb')).toBeInTheDocument();
    });

    it('renders subscription usage card', () => {
      render(<DashboardHome />);

      expect(screen.getByTestId('subscription-usage-card')).toBeInTheDocument();
    });

    it('renders AI agent card with slots count', () => {
      render(<DashboardHome />);

      expect(screen.getByText('AI Agent')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('agent slots')).toBeInTheDocument();
    });

    it('renders Launch Agent button', async () => {
      render(<DashboardHome />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /launch agent/i })
        ).toBeInTheDocument();
      }, { timeout: 10000 });
    }, 15000);
  });

  describe('Metrics Cards', () => {
    it('renders executions used metric', () => {
      render(<DashboardHome />);

      expect(screen.getByText('Executions Used')).toBeInTheDocument();
      expect(screen.getByText('50')).toBeInTheDocument();
      expect(screen.getByText('of 100 this month')).toBeInTheDocument();
    });

    it('renders active workflows metric', () => {
      render(<DashboardHome />);

      expect(screen.getByText('Active Workflows')).toBeInTheDocument();
      // Use getAllByText since '0' appears in multiple cards, check at least one exists
      const zeros = screen.getAllByText('0');
      expect(zeros.length).toBeGreaterThan(0);
      expect(screen.getByText('No active workflows')).toBeInTheDocument();
    });

    it('renders team members metric', () => {
      render(<DashboardHome />);

      expect(screen.getByText('Team Members')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('Just you for now')).toBeInTheDocument();
    });

    it('renders integrations metric', () => {
      render(<DashboardHome />);

      expect(screen.getByText('Integrations')).toBeInTheDocument();
      expect(screen.getByText('No integrations configured')).toBeInTheDocument();
    });
  });

  describe('Quick Actions', () => {
    it('renders quick actions section', () => {
      render(<DashboardHome />);

      // Use getAllByText since text might appear in multiple places
      const quickActionsHeadings = screen.getAllByText('Quick Actions');
      expect(quickActionsHeadings.length).toBeGreaterThan(0);
      const descriptions = screen.getAllByText('Get started with your AI-powered agency automation');
      expect(descriptions.length).toBeGreaterThan(0);
    });

    it('renders Create Campaign button', () => {
      render(<DashboardHome />);

      expect(screen.getByText('Create Campaign')).toBeInTheDocument();
      expect(screen.getByText('Start a new AI calling campaign')).toBeInTheDocument();
    });

    it('renders Manage Leads button', () => {
      render(<DashboardHome />);

      expect(screen.getByText('Manage Leads')).toBeInTheDocument();
      expect(screen.getByText('View and organize your lead lists')).toBeInTheDocument();
    });

    it('renders Configure Settings button', () => {
      render(<DashboardHome />);

      expect(screen.getByText('Configure Settings')).toBeInTheDocument();
      expect(screen.getByText('Set up API keys and integrations')).toBeInTheDocument();
    });

    it('navigates to campaigns page when Create Campaign is clicked', async () => {
      const user = userEvent.setup();
      render(<DashboardHome />);

      const campaignButton = screen.getByText('Create Campaign').closest('button');
      await user.click(campaignButton!);

      expect(mockSetLocation).toHaveBeenCalledWith('/ai-campaigns');
    });

    it('navigates to lead lists when Manage Leads is clicked', async () => {
      const user = userEvent.setup();
      render(<DashboardHome />);

      const leadsButton = screen.getByText('Manage Leads').closest('button');
      await user.click(leadsButton!);

      expect(mockSetLocation).toHaveBeenCalledWith('/lead-lists');
    });

    it('navigates to settings when Configure Settings is clicked', async () => {
      const user = userEvent.setup();
      render(<DashboardHome />);

      const settingsButton = screen.getByText('Configure Settings').closest('button');
      await user.click(settingsButton!);

      expect(mockSetLocation).toHaveBeenCalledWith('/settings');
    });
  });

  describe('Quick Start Guide', () => {
    it('renders quick start guide section', () => {
      render(<DashboardHome />);

      expect(screen.getByText('Quick Start Guide')).toBeInTheDocument();
    });

    it('renders step 1 - Configure API Keys', () => {
      render(<DashboardHome />);

      expect(screen.getByText('1. Configure API Keys')).toBeInTheDocument();
      expect(
        screen.getByText('Head to Settings to add your OpenAI and Browserbase API keys')
      ).toBeInTheDocument();
    });

    it('renders step 2 - Create Lead Lists', () => {
      render(<DashboardHome />);

      expect(screen.getByText('2. Create Lead Lists')).toBeInTheDocument();
      expect(
        screen.getByText('Import or manually add leads to organize your outreach')
      ).toBeInTheDocument();
    });

    it('renders step 3 - Launch AI Campaigns', () => {
      render(<DashboardHome />);

      expect(screen.getByText('3. Launch AI Campaigns')).toBeInTheDocument();
      expect(
        screen.getByText('Create and manage AI calling campaigns to automate outreach')
      ).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('navigates to agent page when Launch Agent is clicked', async () => {
      const user = userEvent.setup();
      render(<DashboardHome />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /launch agent/i })).toBeInTheDocument();
      }, { timeout: 10000 });

      const launchButton = screen.getByRole('button', { name: /launch agent/i });
      await user.click(launchButton);

      expect(mockSetLocation).toHaveBeenCalledWith('/agent');
    }, 15000);
  });

  describe('Modal Interactions', () => {
    it('opens upgrade modal when upgrade button is clicked', async () => {
      const user = userEvent.setup();
      render(<DashboardHome />);

      expect(screen.queryByTestId('upgrade-modal')).not.toBeInTheDocument();

      const upgradeBtn = screen.getByTestId('upgrade-btn');
      await user.click(upgradeBtn);

      expect(screen.getByTestId('upgrade-modal')).toBeInTheDocument();
    });

    it('opens execution packs modal when buy pack button is clicked', async () => {
      const user = userEvent.setup();
      render(<DashboardHome />);

      expect(screen.queryByTestId('packs-modal')).not.toBeInTheDocument();

      const buyPackBtn = screen.getByTestId('buy-pack-btn');
      await user.click(buyPackBtn);

      expect(screen.getByTestId('packs-modal')).toBeInTheDocument();
    });

    it('closes upgrade modal when close is clicked', async () => {
      const user = userEvent.setup();
      render(<DashboardHome />);

      // Open modal
      const upgradeBtn = screen.getByTestId('upgrade-btn');
      await user.click(upgradeBtn);

      expect(screen.getByTestId('upgrade-modal')).toBeInTheDocument();

      // Close modal
      const closeBtn = screen.getByText('Close Upgrade');
      await user.click(closeBtn);

      expect(screen.queryByTestId('upgrade-modal')).not.toBeInTheDocument();
    });

    it('closes packs modal when close is clicked', async () => {
      const user = userEvent.setup();
      render(<DashboardHome />);

      // Open modal
      const buyPackBtn = screen.getByTestId('buy-pack-btn');
      await user.click(buyPackBtn);

      expect(screen.getByTestId('packs-modal')).toBeInTheDocument();

      // Close modal
      const closeBtn = screen.getByText('Close Packs');
      await user.click(closeBtn);

      expect(screen.queryByTestId('packs-modal')).not.toBeInTheDocument();
    });
  });

  describe('Data Tour Attributes', () => {
    it('has data-tour attribute on dashboard header', () => {
      render(<DashboardHome />);

      const header = document.querySelector('[data-tour="dashboard-header"]');
      expect(header).toBeInTheDocument();
    });

    it('has data-tour attribute on quick actions', () => {
      render(<DashboardHome />);

      const quickActions = document.querySelector('[data-tour="quick-actions"]');
      expect(quickActions).toBeInTheDocument();
    });

    it('has data-tour attribute on quick start guide', () => {
      render(<DashboardHome />);

      const quickStart = document.querySelector('[data-tour="quick-start-guide"]');
      expect(quickStart).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('handles null subscription data gracefully', () => {
      // Temporarily override the mock to return null data
      vi.mocked(mockSubscriptionQuery).data = null as any;

      render(<DashboardHome />);

      // Should still render without crashing - use heading role to be specific
      expect(screen.getByRole('heading', { name: 'Dashboard', level: 1 })).toBeInTheDocument();
      // Metrics should show 0 when data is null
      expect(screen.getByText('Executions Used')).toBeInTheDocument();
    });
  });
});

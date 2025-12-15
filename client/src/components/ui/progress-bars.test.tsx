import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { screen, within } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import {
  ProgressBar,
  MultiStepProgress,
  ProgressWithTime,
  IndeterminateProgress,
  type ProgressStep,
} from "./progress-bars";

describe("ProgressBar", () => {
  describe("Basic Rendering", () => {
    it("renders a progress bar with correct value", () => {
      render(<ProgressBar value={50} data-testid="progress" />);
      const progress = screen.getByTestId("progress");
      expect(progress).toBeInTheDocument();
      expect(progress).toHaveAttribute("data-value", "50");
    });

    it("renders with 0% progress", () => {
      render(<ProgressBar value={0} data-testid="progress" />);
      const progress = screen.getByTestId("progress");
      expect(progress).toHaveAttribute("data-value", "0");
    });

    it("renders with 100% progress", () => {
      render(<ProgressBar value={100} data-testid="progress" />);
      const progress = screen.getByTestId("progress");
      expect(progress).toHaveAttribute("data-value", "100");
    });

    it("applies custom className", () => {
      render(<ProgressBar value={50} className="custom-class" data-testid="progress" />);
      const progress = screen.getByTestId("progress");
      expect(progress).toHaveClass("custom-class");
    });
  });

  describe("Variants", () => {
    it("renders default variant", () => {
      const { container } = render(<ProgressBar value={50} variant="default" />);
      expect(container.querySelector('[data-slot="progress"]')).toHaveClass("bg-primary/20");
    });

    it("renders success variant", () => {
      const { container } = render(<ProgressBar value={50} variant="success" />);
      expect(container.querySelector('[data-slot="progress"]')).toHaveClass("bg-green-500/20");
    });

    it("renders warning variant", () => {
      const { container } = render(<ProgressBar value={50} variant="warning" />);
      expect(container.querySelector('[data-slot="progress"]')).toHaveClass("bg-amber-500/20");
    });

    it("renders error variant", () => {
      const { container } = render(<ProgressBar value={50} variant="error" />);
      expect(container.querySelector('[data-slot="progress"]')).toHaveClass("bg-destructive/20");
    });
  });

  describe("Indeterminate Mode", () => {
    it("renders indeterminate progress bar", () => {
      const { container } = render(<ProgressBar indeterminate />);
      const indicator = container.querySelector(".animate-\\[progress-indeterminate_1\\.5s_ease-in-out_infinite\\]");
      expect(indicator).toBeInTheDocument();
    });

    it("does not show percentage in indeterminate mode", () => {
      render(<ProgressBar indeterminate showPercentage />);
      expect(screen.queryByText(/%/)).not.toBeInTheDocument();
    });
  });

  describe("Percentage Display", () => {
    it("shows percentage when enabled", () => {
      render(<ProgressBar value={75} showPercentage />);
      expect(screen.getByText("75%")).toBeInTheDocument();
    });

    it("does not show percentage by default", () => {
      render(<ProgressBar value={75} />);
      expect(screen.queryByText("75%")).not.toBeInTheDocument();
    });

    it("rounds percentage to nearest integer", () => {
      render(<ProgressBar value={33.7} showPercentage />);
      expect(screen.getByText("34%")).toBeInTheDocument();
    });

    it("has aria-live for percentage updates", () => {
      render(<ProgressBar value={50} showPercentage />);
      const percentage = screen.getByText("50%");
      expect(percentage).toHaveAttribute("aria-live", "polite");
    });
  });

  describe("Animation", () => {
    it("applies animation when animated prop is true", () => {
      const { container } = render(<ProgressBar value={50} animated />);
      const indicator = container.querySelector('[data-slot="progress-indicator"]');
      expect(indicator).toHaveClass("animate-pulse");
    });

    it("does not animate by default", () => {
      const { container } = render(<ProgressBar value={50} />);
      const indicator = container.querySelector('[data-slot="progress-indicator"]');
      expect(indicator).not.toHaveClass("animate-pulse");
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA role from Radix", () => {
      const { container } = render(<ProgressBar value={50} />);
      const progress = container.querySelector('[data-slot="progress"]');
      expect(progress).toBeInTheDocument();
    });

    it("supports custom aria-label", () => {
      render(<ProgressBar value={50} aria-label="Upload progress" data-testid="progress" />);
      const progress = screen.getByTestId("progress");
      expect(progress).toHaveAttribute("aria-label", "Upload progress");
    });
  });
});

describe("MultiStepProgress", () => {
  const mockSteps: ProgressStep[] = [
    { id: "1", label: "Step 1", status: "completed" },
    { id: "2", label: "Step 2", status: "in-progress" },
    { id: "3", label: "Step 3", status: "pending" },
  ];

  describe("Basic Rendering", () => {
    it("renders all steps", () => {
      render(<MultiStepProgress steps={mockSteps} />);
      expect(screen.getByText("Step 1")).toBeInTheDocument();
      expect(screen.getByText("Step 2")).toBeInTheDocument();
      expect(screen.getByText("Step 3")).toBeInTheDocument();
    });

    it("renders with step descriptions", () => {
      const stepsWithDesc: ProgressStep[] = [
        { id: "1", label: "Step 1", description: "First step", status: "completed" },
        { id: "2", label: "Step 2", description: "Second step", status: "pending" },
      ];
      render(<MultiStepProgress steps={stepsWithDesc} />);
      expect(screen.getByText("First step")).toBeInTheDocument();
      expect(screen.getByText("Second step")).toBeInTheDocument();
    });

    it("renders step numbers by default", () => {
      const pendingSteps: ProgressStep[] = [
        { id: "1", label: "Step 1", status: "pending" },
      ];
      render(<MultiStepProgress steps={pendingSteps} />);
      expect(screen.getByText("1")).toBeInTheDocument();
    });

    it("hides step numbers when showStepNumbers is false", () => {
      const pendingSteps: ProgressStep[] = [
        { id: "1", label: "Step 1", status: "pending" },
      ];
      render(<MultiStepProgress steps={pendingSteps} showStepNumbers={false} />);
      expect(screen.queryByText("1")).not.toBeInTheDocument();
    });
  });

  describe("Step Status Icons", () => {
    it("shows check icon for completed steps", () => {
      const steps: ProgressStep[] = [
        { id: "1", label: "Step 1", status: "completed" },
      ];
      render(<MultiStepProgress steps={steps} />);
      expect(screen.getByLabelText("Completed")).toBeInTheDocument();
    });

    it("shows spinner for in-progress steps", () => {
      const steps: ProgressStep[] = [
        { id: "1", label: "Step 1", status: "in-progress" },
      ];
      render(<MultiStepProgress steps={steps} />);
      expect(screen.getByLabelText("In progress")).toBeInTheDocument();
    });

    it("shows alert icon for error steps", () => {
      const steps: ProgressStep[] = [
        { id: "1", label: "Step 1", status: "error" },
      ];
      render(<MultiStepProgress steps={steps} />);
      expect(screen.getByLabelText("Error")).toBeInTheDocument();
    });
  });

  describe("Progress Calculation", () => {
    it("calculates progress correctly with completed steps", () => {
      const steps: ProgressStep[] = [
        { id: "1", label: "Step 1", status: "completed" },
        { id: "2", label: "Step 2", status: "completed" },
        { id: "3", label: "Step 3", status: "pending" },
        { id: "4", label: "Step 4", status: "pending" },
      ];
      const { container } = render(<MultiStepProgress steps={steps} />);
      const progressBar = container.querySelector('[data-slot="progress"]');
      expect(progressBar).toHaveAttribute("data-value", "50");
    });

    it("shows 0% when no steps completed", () => {
      const steps: ProgressStep[] = [
        { id: "1", label: "Step 1", status: "pending" },
        { id: "2", label: "Step 2", status: "pending" },
      ];
      const { container } = render(<MultiStepProgress steps={steps} />);
      const progressBar = container.querySelector('[data-slot="progress"]');
      expect(progressBar).toHaveAttribute("data-value", "0");
    });

    it("shows 100% when all steps completed", () => {
      const steps: ProgressStep[] = [
        { id: "1", label: "Step 1", status: "completed" },
        { id: "2", label: "Step 2", status: "completed" },
      ];
      const { container } = render(<MultiStepProgress steps={steps} />);
      const progressBar = container.querySelector('[data-slot="progress"]');
      expect(progressBar).toHaveAttribute("data-value", "100");
    });
  });

  describe("Orientation", () => {
    it("renders horizontal orientation by default", () => {
      const { container } = render(<MultiStepProgress steps={mockSteps} />);
      expect(container.querySelector(".flex.items-center.justify-between")).toBeInTheDocument();
    });

    it("renders vertical orientation", () => {
      const { container } = render(<MultiStepProgress steps={mockSteps} orientation="vertical" />);
      expect(container.querySelector(".space-y-4")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("has role=list for step container", () => {
      render(<MultiStepProgress steps={mockSteps} />);
      expect(screen.getByRole("list", { name: /progress steps/i })).toBeInTheDocument();
    });

    it("marks current step with aria-current", () => {
      const { container } = render(<MultiStepProgress steps={mockSteps} />);
      const currentStep = container.querySelector('[aria-current="step"]');
      expect(currentStep).toBeInTheDocument();
    });

    it("has accessible step labels", () => {
      render(<MultiStepProgress steps={mockSteps} />);
      const list = screen.getByRole("list");
      const items = within(list).getAllByRole("listitem");
      expect(items).toHaveLength(3);
    });
  });

  describe("Step Colors", () => {
    it("applies correct color for completed step", () => {
      const steps: ProgressStep[] = [
        { id: "1", label: "Step 1", status: "completed" },
      ];
      const { container } = render(<MultiStepProgress steps={steps} />);
      const stepIndicator = container.querySelector(".bg-green-500");
      expect(stepIndicator).toBeInTheDocument();
    });

    it("applies correct color for error step", () => {
      const steps: ProgressStep[] = [
        { id: "1", label: "Step 1", status: "error" },
      ];
      const { container } = render(<MultiStepProgress steps={steps} />);
      const stepIndicator = container.querySelector(".bg-destructive");
      expect(stepIndicator).toBeInTheDocument();
    });

    it("applies correct color for in-progress step", () => {
      const steps: ProgressStep[] = [
        { id: "1", label: "Step 1", status: "in-progress" },
      ];
      const { container } = render(<MultiStepProgress steps={steps} />);
      const stepIndicator = container.querySelector(".bg-primary");
      expect(stepIndicator).toBeInTheDocument();
    });
  });
});

describe("ProgressWithTime", () => {
  describe("Time Formatting", () => {
    it("formats seconds correctly", () => {
      render(<ProgressWithTime value={50} timeRemaining={30} />);
      expect(screen.getByText(/30s remaining/)).toBeInTheDocument();
    });

    it("formats minutes and seconds correctly", () => {
      render(<ProgressWithTime value={50} timeRemaining={90} />);
      expect(screen.getByText(/1m 30s remaining/)).toBeInTheDocument();
    });

    it("formats minutes without seconds when seconds are 0", () => {
      render(<ProgressWithTime value={50} timeRemaining={120} />);
      expect(screen.getByText(/2m remaining/)).toBeInTheDocument();
    });

    it("formats hours and minutes correctly", () => {
      render(<ProgressWithTime value={50} timeRemaining={3660} />);
      expect(screen.getByText(/1h 1m remaining/)).toBeInTheDocument();
    });

    it("formats hours without minutes when minutes are 0", () => {
      render(<ProgressWithTime value={50} timeRemaining={3600} />);
      expect(screen.getByText(/1h remaining/)).toBeInTheDocument();
    });
  });

  describe("Time Display", () => {
    it("shows time remaining when provided", () => {
      render(<ProgressWithTime value={50} timeRemaining={60} />);
      expect(screen.getByText(/1m remaining/)).toBeInTheDocument();
    });

    it("shows elapsed time when provided", () => {
      render(<ProgressWithTime value={50} timeElapsed={45} />);
      expect(screen.getByText(/Elapsed: 45s/)).toBeInTheDocument();
    });

    it("shows both elapsed and remaining time", () => {
      render(<ProgressWithTime value={50} timeElapsed={30} timeRemaining={30} />);
      expect(screen.getByText(/Elapsed: 30s/)).toBeInTheDocument();
      expect(screen.getByText(/30s remaining/)).toBeInTheDocument();
    });

    it("hides time when showTime is false", () => {
      render(<ProgressWithTime value={50} timeRemaining={60} showTime={false} />);
      expect(screen.queryByText(/remaining/)).not.toBeInTheDocument();
    });

    it("shows time by default", () => {
      render(<ProgressWithTime value={50} timeRemaining={60} />);
      expect(screen.getByText(/1m remaining/)).toBeInTheDocument();
    });
  });

  describe("Progress Bar Integration", () => {
    it("passes through progress bar props", () => {
      const { container } = render(
        <ProgressWithTime value={75} variant="success" data-testid="progress" />
      );
      const progress = container.querySelector('[data-slot="progress"]');
      expect(progress).toHaveClass("bg-green-500/20");
    });

    it("supports indeterminate mode with time", () => {
      render(<ProgressWithTime indeterminate timeRemaining={60} />);
      expect(screen.getByText(/1m remaining/)).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("has aria-live for time updates", () => {
      const { container } = render(<ProgressWithTime value={50} timeRemaining={60} />);
      const timeContainer = container.querySelector('[aria-live="polite"]');
      expect(timeContainer).toBeInTheDocument();
      expect(timeContainer).toHaveTextContent(/1m remaining/);
    });
  });

  describe("Clock Icon", () => {
    it("displays clock icon with time", () => {
      const { container } = render(<ProgressWithTime value={50} timeRemaining={60} />);
      const clockIcons = container.querySelectorAll("svg.lucide-clock");
      expect(clockIcons.length).toBeGreaterThan(0);
    });
  });
});

describe("IndeterminateProgress", () => {
  describe("Basic Rendering", () => {
    it("renders loading spinner", () => {
      const { container } = render(<IndeterminateProgress />);
      const spinner = container.querySelector(".animate-spin");
      expect(spinner).toBeInTheDocument();
    });

    it("renders with label", () => {
      render(<IndeterminateProgress label="Loading data..." />);
      expect(screen.getByText("Loading data...")).toBeInTheDocument();
    });

    it("renders without label", () => {
      const { container } = render(<IndeterminateProgress />);
      expect(container.querySelector("span")).not.toBeInTheDocument();
    });
  });

  describe("Size Variants", () => {
    it("renders small size", () => {
      const { container } = render(<IndeterminateProgress size="sm" />);
      const spinner = container.querySelector(".size-4");
      expect(spinner).toBeInTheDocument();
    });

    it("renders default size", () => {
      const { container } = render(<IndeterminateProgress size="default" />);
      const spinner = container.querySelector(".size-6");
      expect(spinner).toBeInTheDocument();
    });

    it("renders large size", () => {
      const { container } = render(<IndeterminateProgress size="lg" />);
      const spinner = container.querySelector(".size-8");
      expect(spinner).toBeInTheDocument();
    });

    it("uses default size when not specified", () => {
      const { container } = render(<IndeterminateProgress />);
      const spinner = container.querySelector(".size-6");
      expect(spinner).toBeInTheDocument();
    });
  });

  describe("Color Variants", () => {
    it("renders default variant", () => {
      const { container } = render(<IndeterminateProgress variant="default" />);
      const spinner = container.querySelector(".text-primary");
      expect(spinner).toBeInTheDocument();
    });

    it("renders success variant", () => {
      const { container } = render(<IndeterminateProgress variant="success" />);
      const spinner = container.querySelector(".text-green-500");
      expect(spinner).toBeInTheDocument();
    });

    it("renders warning variant", () => {
      const { container } = render(<IndeterminateProgress variant="warning" />);
      const spinner = container.querySelector(".text-amber-500");
      expect(spinner).toBeInTheDocument();
    });

    it("renders error variant", () => {
      const { container } = render(<IndeterminateProgress variant="error" />);
      const spinner = container.querySelector(".text-destructive");
      expect(spinner).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("has role=status", () => {
      render(<IndeterminateProgress />);
      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("has aria-live=polite", () => {
      render(<IndeterminateProgress />);
      const status = screen.getByRole("status");
      expect(status).toHaveAttribute("aria-live", "polite");
    });

    it("has aria-label on spinner", () => {
      const { container } = render(<IndeterminateProgress />);
      const spinner = container.querySelector('[aria-label="Loading"]');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe("Custom Styling", () => {
    it("applies custom className", () => {
      render(<IndeterminateProgress className="custom-class" />);
      const container = screen.getByRole("status");
      expect(container).toHaveClass("custom-class");
    });
  });
});

describe("Integration Tests", () => {
  it("can combine multiple progress components", () => {
    const steps: ProgressStep[] = [
      { id: "1", label: "Upload", status: "completed" },
      { id: "2", label: "Process", status: "in-progress" },
      { id: "3", label: "Complete", status: "pending" },
    ];

    render(
      <div>
        <MultiStepProgress steps={steps} />
        <ProgressWithTime value={66} timeRemaining={120} />
        <IndeterminateProgress label="Processing..." />
      </div>
    );

    expect(screen.getByText("Upload")).toBeInTheDocument();
    expect(screen.getByText(/2m remaining/)).toBeInTheDocument();
    expect(screen.getByText("Processing...")).toBeInTheDocument();
  });

  it("handles dynamic step updates", () => {
    const { rerender } = render(
      <MultiStepProgress
        steps={[
          { id: "1", label: "Step 1", status: "in-progress" },
          { id: "2", label: "Step 2", status: "pending" },
        ]}
      />
    );

    expect(screen.getByLabelText("In progress")).toBeInTheDocument();

    rerender(
      <MultiStepProgress
        steps={[
          { id: "1", label: "Step 1", status: "completed" },
          { id: "2", label: "Step 2", status: "in-progress" },
        ]}
      />
    );

    expect(screen.getByLabelText("Completed")).toBeInTheDocument();
    expect(screen.getByLabelText("In progress")).toBeInTheDocument();
  });

  it("handles progress updates smoothly", () => {
    const { rerender } = render(<ProgressBar value={25} showPercentage />);
    expect(screen.getByText("25%")).toBeInTheDocument();

    rerender(<ProgressBar value={50} showPercentage />);
    expect(screen.getByText("50%")).toBeInTheDocument();

    rerender(<ProgressBar value={75} showPercentage />);
    expect(screen.getByText("75%")).toBeInTheDocument();
  });
});

describe("Edge Cases", () => {
  it("handles empty steps array", () => {
    const { container } = render(<MultiStepProgress steps={[]} />);
    const progressBar = container.querySelector('[data-slot="progress"]');
    // With no steps, progress should be 0/0 which results in 0
    expect(progressBar).toBeInTheDocument();
  });

  it("handles single step", () => {
    const steps: ProgressStep[] = [
      { id: "1", label: "Only Step", status: "completed" },
    ];
    const { container } = render(<MultiStepProgress steps={steps} />);
    const progressBar = container.querySelector('[data-slot="progress"]');
    expect(progressBar).toHaveAttribute("data-value", "100");
  });

  it("handles negative time values gracefully", () => {
    render(<ProgressWithTime value={50} timeRemaining={-10} />);
    // Should still render without crashing
    expect(screen.getByText(/remaining/)).toBeInTheDocument();
  });

  it("handles very large time values", () => {
    render(<ProgressWithTime value={50} timeRemaining={86400} />);
    expect(screen.getByText(/24h remaining/)).toBeInTheDocument();
  });

  it("handles progress value over 100", () => {
    render(<ProgressBar value={150} showPercentage data-testid="progress" />);
    expect(screen.getByText("150%")).toBeInTheDocument();
  });

  it("handles negative progress value", () => {
    render(<ProgressBar value={-10} showPercentage data-testid="progress" />);
    expect(screen.getByText("-10%")).toBeInTheDocument();
  });
});

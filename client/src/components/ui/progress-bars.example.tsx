/**
 * Progress Bars Component - Usage Examples
 *
 * This file demonstrates various use cases for the ProgressBars component suite.
 * It includes examples for simple progress bars, multi-step workflows, time-based
 * progress tracking, and indeterminate loading states.
 */

import React, { useState, useEffect } from "react";
import {
  ProgressBar,
  MultiStepProgress,
  ProgressWithTime,
  IndeterminateProgress,
  type ProgressStep,
} from "./progress-bars";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";
import { Button } from "./button";

/**
 * Example 1: Simple Progress Bar
 * Basic usage with percentage display
 */
export function SimpleProgressExample() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 0 : prev + 10));
    }, 500);
    return () => clearInterval(timer);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Simple Progress Bar</CardTitle>
        <CardDescription>Basic progress with percentage display</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ProgressBar value={progress} showPercentage />
        <ProgressBar value={progress} variant="success" showPercentage />
        <ProgressBar value={progress} variant="warning" showPercentage />
        <ProgressBar value={progress} variant="error" showPercentage />
      </CardContent>
    </Card>
  );
}

/**
 * Example 2: File Upload Progress
 * Real-world example showing file upload with time estimation
 */
export function FileUploadExample() {
  const [progress, setProgress] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const startUpload = () => {
    setIsUploading(true);
    setProgress(0);
    setTimeElapsed(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setIsUploading(false);
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
      setTimeElapsed((prev) => prev + 1);
    }, 500);
  };

  const totalTime = 20; // seconds
  const timeRemaining = Math.max(0, totalTime - timeElapsed);

  return (
    <Card>
      <CardHeader>
        <CardTitle>File Upload Progress</CardTitle>
        <CardDescription>Upload with time estimation</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ProgressWithTime
          value={progress}
          variant={progress === 100 ? "success" : "default"}
          timeElapsed={timeElapsed}
          timeRemaining={isUploading ? timeRemaining : undefined}
          showPercentage
        />
        <Button onClick={startUpload} disabled={isUploading}>
          {isUploading ? "Uploading..." : "Start Upload"}
        </Button>
      </CardContent>
    </Card>
  );
}

/**
 * Example 3: Multi-Step Workflow
 * Horizontal step indicator for multi-step processes
 */
export function WorkflowProgressExample() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [steps, setSteps] = useState<ProgressStep[]>([
    { id: "1", label: "Upload Files", description: "Select and upload files", status: "in-progress" },
    { id: "2", label: "Process Data", description: "Analyzing content", status: "pending" },
    { id: "3", label: "Validate", description: "Check for errors", status: "pending" },
    { id: "4", label: "Complete", description: "Finalize import", status: "pending" },
  ]);

  const nextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      const newSteps = [...steps];
      newSteps[currentStepIndex].status = "completed";
      newSteps[currentStepIndex + 1].status = "in-progress";
      setSteps(newSteps);
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      const newSteps = [...steps];
      newSteps[currentStepIndex].status = "completed";
      setSteps(newSteps);
    }
  };

  const reset = () => {
    setCurrentStepIndex(0);
    setSteps([
      { id: "1", label: "Upload Files", description: "Select and upload files", status: "in-progress" },
      { id: "2", label: "Process Data", description: "Analyzing content", status: "pending" },
      { id: "3", label: "Validate", description: "Check for errors", status: "pending" },
      { id: "4", label: "Complete", description: "Finalize import", status: "pending" },
    ]);
  };

  const allComplete = steps.every((s) => s.status === "completed");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Multi-Step Workflow</CardTitle>
        <CardDescription>Horizontal step indicator</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <MultiStepProgress steps={steps} />
        <div className="flex gap-2">
          <Button onClick={nextStep} disabled={allComplete}>
            {allComplete ? "Completed" : "Next Step"}
          </Button>
          <Button onClick={reset} variant="outline">
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Example 4: Vertical Step Progress
 * Vertical layout for detailed step information
 */
export function VerticalProgressExample() {
  const steps: ProgressStep[] = [
    {
      id: "1",
      label: "Account Created",
      description: "Your account has been successfully created",
      status: "completed",
    },
    {
      id: "2",
      label: "Email Verification",
      description: "Verifying your email address",
      status: "in-progress",
    },
    {
      id: "3",
      label: "Profile Setup",
      description: "Complete your profile information",
      status: "pending",
    },
    {
      id: "4",
      label: "Integration",
      description: "Connect your third-party services",
      status: "pending",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Onboarding Progress</CardTitle>
        <CardDescription>Vertical step indicator</CardDescription>
      </CardHeader>
      <CardContent>
        <MultiStepProgress steps={steps} orientation="vertical" />
      </CardContent>
    </Card>
  );
}

/**
 * Example 5: Error Handling
 * Progress with error states
 */
export function ErrorProgressExample() {
  const steps: ProgressStep[] = [
    { id: "1", label: "Initialize", status: "completed" },
    { id: "2", label: "Process", status: "completed" },
    { id: "3", label: "Validate", status: "error", description: "Validation failed" },
    { id: "4", label: "Complete", status: "pending" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Error State</CardTitle>
        <CardDescription>Handling errors in progress</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <MultiStepProgress steps={steps} variant="error" />
        <ProgressBar value={50} variant="error" showPercentage />
      </CardContent>
    </Card>
  );
}

/**
 * Example 6: Indeterminate Progress
 * Loading states without specific progress
 */
export function IndeterminateProgressExample() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Loading States</CardTitle>
        <CardDescription>Indeterminate progress indicators</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-medium">Indeterminate Bar</p>
          <ProgressBar indeterminate />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Loading Spinners</p>
          <div className="flex items-center gap-6">
            <IndeterminateProgress size="sm" label="Small" />
            <IndeterminateProgress size="default" label="Default" />
            <IndeterminateProgress size="lg" label="Large" />
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Variant Colors</p>
          <div className="space-y-3">
            <IndeterminateProgress variant="default" label="Processing..." />
            <IndeterminateProgress variant="success" label="Syncing..." />
            <IndeterminateProgress variant="warning" label="Analyzing..." />
            <IndeterminateProgress variant="error" label="Retrying..." />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Example 7: Data Processing Pipeline
 * Complete example showing a data processing workflow
 */
export function DataProcessingExample() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [steps, setSteps] = useState<ProgressStep[]>([
    { id: "1", label: "Load Data", status: "pending" },
    { id: "2", label: "Transform", status: "pending" },
    { id: "3", label: "Validate", status: "pending" },
    { id: "4", label: "Save", status: "pending" },
  ]);

  const startProcessing = () => {
    setIsProcessing(true);
    setProgress(0);
    setTimeElapsed(0);

    const newSteps = [...steps];
    newSteps[0].status = "in-progress";
    setSteps(newSteps);

    // Simulate processing
    let currentProgress = 0;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentProgress += 2.5;
      setProgress(currentProgress);
      setTimeElapsed((prev) => prev + 1);

      // Update steps
      const stepProgress = Math.floor(currentProgress / 25);
      if (stepProgress > currentStep && stepProgress < 4) {
        const updatedSteps = [...steps];
        updatedSteps[currentStep].status = "completed";
        updatedSteps[stepProgress].status = "in-progress";
        setSteps(updatedSteps);
        currentStep = stepProgress;
      }

      if (currentProgress >= 100) {
        clearInterval(interval);
        const finalSteps = [...steps];
        finalSteps.forEach((step) => (step.status = "completed"));
        setSteps(finalSteps);
        setIsProcessing(false);
        setProgress(100);
      }
    }, 250);
  };

  const estimatedTotal = 40; // seconds
  const timeRemaining = Math.max(0, estimatedTotal - timeElapsed);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Processing Pipeline</CardTitle>
        <CardDescription>Complete workflow with progress tracking</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <MultiStepProgress steps={steps} />

        <ProgressWithTime
          value={progress}
          variant={progress === 100 ? "success" : "default"}
          timeElapsed={timeElapsed}
          timeRemaining={isProcessing ? timeRemaining : undefined}
          showPercentage
          animated={isProcessing}
        />

        <Button onClick={startProcessing} disabled={isProcessing} className="w-full">
          {isProcessing ? "Processing..." : progress === 100 ? "Process Again" : "Start Processing"}
        </Button>
      </CardContent>
    </Card>
  );
}

/**
 * Example 8: All Components Showcase
 * Comprehensive demo of all progress components
 */
export function ProgressShowcase() {
  return (
    <div className="space-y-6 p-6">
      <div className="grid gap-6 md:grid-cols-2">
        <SimpleProgressExample />
        <FileUploadExample />
        <WorkflowProgressExample />
        <VerticalProgressExample />
        <ErrorProgressExample />
        <IndeterminateProgressExample />
      </div>

      <div className="grid gap-6">
        <DataProcessingExample />
      </div>
    </div>
  );
}

export default ProgressShowcase;

/**
 * Task Execution Examples
 *
 * This file demonstrates how to create and execute different types of tasks
 * using the Task Execution Service.
 */

import { trpc } from "../client/src/lib/trpc";

// ============================================
// EXAMPLE 1: Browser Automation Task
// ============================================

async function createBrowserAutomationTask() {
  const task = await trpc.agencyTasks.create.mutate({
    title: "Extract pricing data from competitor website",
    description: "Navigate to competitor pricing page and extract all plan details",
    taskType: "browser_automation",
    category: "data_collection",
    priority: "medium",
    urgency: "normal",
    executionType: "automatic",
    assignedToBot: true,
    requiresHumanReview: false,
    executionConfig: {
      automationSteps: [
        {
          type: "navigate",
          config: { url: "https://example.com/pricing" }
        },
        {
          type: "wait",
          config: { duration: 2000 }
        },
        {
          type: "extract",
          config: {
            instruction: "Extract all pricing plans with their names, prices, and features"
          }
        },
        {
          type: "screenshot",
          config: {}
        }
      ]
    }
  });

  console.log("Browser automation task created:", task.id);
  // Task will execute automatically
}

// ============================================
// EXAMPLE 2: API Call Task
// ============================================

async function createApiCallTask() {
  const task = await trpc.agencyTasks.create.mutate({
    title: "Sync user data with external CRM",
    description: "POST user data to external CRM system",
    taskType: "api_call",
    category: "integration",
    priority: "high",
    urgency: "urgent",
    executionType: "automatic",
    assignedToBot: true,
    executionConfig: {
      apiEndpoint: "https://api.external-crm.com/v1/contacts",
      apiMethod: "POST",
      apiPayload: {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        phone: "+1234567890",
        company: "Acme Inc",
        tags: ["lead", "high-value"]
      },
      authType: "bearer",
      bearerToken: process.env.EXTERNAL_CRM_API_KEY,
      customHeaders: {
        "X-API-Version": "2024-01-01"
      },
      timeout: 30000
    }
  });

  console.log("API call task created:", task.id);
}

// ============================================
// EXAMPLE 3: GoHighLevel Action
// ============================================

async function createGhlActionTask() {
  const task = await trpc.agencyTasks.create.mutate({
    title: "Add new lead to GoHighLevel",
    description: "Create contact and add to nurture pipeline",
    taskType: "ghl_action",
    category: "crm_automation",
    priority: "high",
    urgency: "immediate",
    executionType: "automatic",
    assignedToBot: true,
    executionConfig: {
      ghlAction: "add_contact",
      firstName: "Jane",
      lastName: "Smith",
      email: "jane@example.com",
      phone: "+1987654321",
      customFields: {
        source: "website_form",
        interest: "premium_plan",
        budget: "10000"
      }
    }
  });

  console.log("GHL action task created:", task.id);
}

// ============================================
// EXAMPLE 4: Send SMS via GoHighLevel
// ============================================

async function createGhlSmsTask() {
  const task = await trpc.agencyTasks.create.mutate({
    title: "Send follow-up SMS to lead",
    taskType: "ghl_action",
    executionType: "automatic",
    assignedToBot: true,
    executionConfig: {
      ghlAction: "send_sms",
      contactId: "contact_id_here",
      message: "Hi! Thanks for your interest in our services. Is now a good time to chat?"
    }
  });

  console.log("GHL SMS task created:", task.id);
}

// ============================================
// EXAMPLE 5: Notification Task
// ============================================

async function createNotificationTask() {
  const task = await trpc.agencyTasks.create.mutate({
    title: "Notify owner about new high-value lead",
    description: "Send notification when lead value exceeds threshold",
    taskType: "notification",
    category: "alerts",
    priority: "high",
    urgency: "immediate",
    executionType: "automatic",
    assignedToBot: true,
    executionConfig: {
      recipient: "owner"
    }
  });

  console.log("Notification task created:", task.id);
}

// ============================================
// EXAMPLE 6: Scheduled Reminder
// ============================================

async function createReminderTask() {
  const reminderDate = new Date();
  reminderDate.setDate(reminderDate.getDate() + 7); // 7 days from now

  const task = await trpc.agencyTasks.create.mutate({
    title: "Follow up with prospect about proposal",
    taskType: "reminder",
    priority: "medium",
    executionType: "automatic",
    assignedToBot: true,
    executionConfig: {
      reminderTime: reminderDate.toISOString(),
      reminderMessage: "Don't forget to follow up with John Doe about the premium proposal sent last week",
      recipient: "owner"
    }
  });

  console.log("Reminder task created:", task.id);
}

// ============================================
// EXAMPLE 7: Report Generation
// ============================================

async function createReportTask() {
  const task = await trpc.agencyTasks.create.mutate({
    title: "Generate weekly task summary report",
    taskType: "report_generation",
    category: "analytics",
    priority: "low",
    executionType: "automatic",
    assignedToBot: true,
    executionConfig: {
      reportType: "task_summary",
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date().toISOString(),
      sendNotification: true,
      recipient: "owner"
    }
  });

  console.log("Report task created:", task.id);
}

// ============================================
// EXAMPLE 8: Data Extraction Task
// ============================================

async function createDataExtractionTask() {
  const task = await trpc.agencyTasks.create.mutate({
    title: "Extract company info from LinkedIn",
    taskType: "data_extraction",
    category: "lead_enrichment",
    priority: "medium",
    executionType: "automatic",
    assignedToBot: true,
    executionConfig: {
      automationSteps: [
        {
          type: "navigate",
          config: { url: "https://www.linkedin.com/company/example-company" }
        },
        {
          type: "extract",
          config: {
            instruction: "Extract company name, industry, size, location, and description"
          }
        }
      ]
    }
  });

  console.log("Data extraction task created:", task.id);
}

// ============================================
// EXAMPLE 9: Task with Human Review
// ============================================

async function createTaskWithReview() {
  const task = await trpc.agencyTasks.create.mutate({
    title: "Delete old customer data (REQUIRES REVIEW)",
    description: "Remove customer records older than 7 years for GDPR compliance",
    taskType: "api_call",
    priority: "critical",
    urgency: "normal",
    executionType: "automatic",
    assignedToBot: true,
    requiresHumanReview: true, // Task won't execute until approved
    executionConfig: {
      apiEndpoint: "https://api.internal.com/gdpr/delete-old-records",
      apiMethod: "DELETE",
      authType: "bearer",
      bearerToken: process.env.INTERNAL_API_KEY
    }
  });

  console.log("Task created requiring human review:", task.id);

  // Later, approve the task
  await trpc.agencyTasks.approve.mutate({
    id: task.id,
    notes: "Reviewed data retention policy, approved for execution"
  });

  console.log("Task approved and will execute automatically");
}

// ============================================
// EXAMPLE 10: Manual Task Execution
// ============================================

async function manualTaskExecution() {
  // Create a task with manual trigger
  const task = await trpc.agencyTasks.create.mutate({
    title: "Import contacts from CSV",
    taskType: "api_call",
    executionType: "manual_trigger", // Won't auto-execute
    assignedToBot: true,
    executionConfig: {
      apiEndpoint: "https://api.internal.com/import/contacts",
      apiMethod: "POST",
      authType: "api_key",
      apiKeyHeader: "X-API-Key",
      apiKey: process.env.INTERNAL_API_KEY
    }
  });

  console.log("Manual task created:", task.id);

  // Execute when ready
  const result = await trpc.agencyTasks.execute.mutate({ id: task.id });
  console.log("Task execution started:", result);
}

// ============================================
// EXAMPLE 11: View Task Execution History
// ============================================

async function viewExecutionHistory(taskId: number) {
  const executions = await trpc.agencyTasks.getExecutions.query({
    taskId,
    limit: 10
  });

  console.log(`Execution history for task ${taskId}:`);
  executions.forEach(exec => {
    console.log(`- Attempt ${exec.attemptNumber}: ${exec.status}`);
    console.log(`  Duration: ${exec.duration}ms`);
    console.log(`  Started: ${exec.startedAt}`);
    if (exec.error) {
      console.log(`  Error: ${exec.error}`);
    }
  });
}

// ============================================
// EXAMPLE 12: Get Task Statistics
// ============================================

async function viewTaskStats() {
  const stats = await trpc.agencyTasks.getStats.query();

  console.log("Task Statistics:");
  console.log("- By Status:", stats.byStatus);
  console.log("- By Priority:", stats.byPriority);
  console.log("- Pending Review:", stats.pendingReview);
  console.log("- Overdue:", stats.overdue);
  console.log("- Scheduled Today:", stats.scheduledToday);
}

// ============================================
// Export examples
// ============================================

export {
  createBrowserAutomationTask,
  createApiCallTask,
  createGhlActionTask,
  createGhlSmsTask,
  createNotificationTask,
  createReminderTask,
  createReportTask,
  createDataExtractionTask,
  createTaskWithReview,
  manualTaskExecution,
  viewExecutionHistory,
  viewTaskStats
};

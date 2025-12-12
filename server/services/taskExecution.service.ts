/**
 * Task Execution Service
 * Executes agency tasks using browser automation, API calls, or custom handlers
 */

import { getDb } from "../db";
import { eq, and, or, lte, gte, isNull } from "drizzle-orm";
import {
  agencyTasks,
  taskExecutions,
  outboundMessages,
  userWebhooks,
  inboundMessages,
} from "../../drizzle/schema-webhooks";
import { browserbaseSDK } from "../_core/browserbaseSDK";
import { Stagehand } from "@browserbasehq/stagehand";

// ========================================
// TYPES
// ========================================

export interface ExecutionResult {
  success: boolean;
  output?: any;
  error?: string;
  duration?: number;
  screenshots?: string[];
}

export interface TaskExecutionConfig {
  workflowId?: number;
  automationSteps?: AutomationStep[];
  apiEndpoint?: string;
  apiMethod?: "GET" | "POST" | "PUT" | "DELETE";
  apiPayload?: any;
  browserActions?: BrowserAction[];
  timeout?: number;
  retryCount?: number;
}

export interface AutomationStep {
  type: "navigate" | "click" | "type" | "extract" | "wait" | "screenshot";
  config: Record<string, any>;
}

export interface BrowserAction {
  action: string;
  selector?: string;
  value?: string;
  waitFor?: string;
}

// ========================================
// TASK EXECUTION SERVICE
// ========================================

export class TaskExecutionService {
  /**
   * Validate task configuration before execution
   */
  private validateTaskConfig(task: typeof agencyTasks.$inferSelect): { valid: boolean; error?: string } {
    // Check if execution config exists for tasks that need it
    const requiresConfig = ["browser_automation", "api_call", "ghl_action", "report_generation"];

    if (requiresConfig.includes(task.taskType) && !task.executionConfig) {
      return { valid: false, error: `Task type ${task.taskType} requires execution configuration` };
    }

    // Validate specific configurations
    const config = task.executionConfig as any;

    switch (task.taskType) {
      case "browser_automation":
      case "data_extraction":
        if (!config?.browserActions && !config?.automationSteps) {
          return { valid: false, error: "Browser automation requires browserActions or automationSteps" };
        }
        break;

      case "api_call":
        if (!config?.apiEndpoint) {
          return { valid: false, error: "API call requires apiEndpoint" };
        }
        // Validate URL format
        try {
          new URL(config.apiEndpoint);
        } catch {
          return { valid: false, error: "Invalid API endpoint URL" };
        }
        break;

      case "ghl_action":
        if (!config?.ghlAction) {
          return { valid: false, error: "GHL action requires ghlAction type" };
        }
        break;

      case "reminder":
        if (!config?.reminderTime) {
          return { valid: false, error: "Reminder requires reminderTime" };
        }
        break;

      case "report_generation":
        if (!config?.reportType) {
          return { valid: false, error: "Report generation requires reportType" };
        }
        break;
    }

    return { valid: true };
  }

  /**
   * Execute a task
   */
  async executeTask(taskId: number, triggeredBy: string = "automatic"): Promise<ExecutionResult> {
    const db = await getDb();
    if (!db) {
      return { success: false, error: "Database not initialized" };
    }

    const startTime = Date.now();
    let executionId: number | undefined;

    console.log(`[TaskExecution] Starting execution for task ${taskId}, triggered by: ${triggeredBy}`);

    try {
      // Get the task
      const [task] = await db
        .select()
        .from(agencyTasks)
        .where(eq(agencyTasks.id, taskId))
        .limit(1);

      if (!task) {
        console.error(`[TaskExecution] Task ${taskId} not found`);
        return { success: false, error: "Task not found" };
      }

      console.log(`[TaskExecution] Task ${taskId} (${task.taskType}): ${task.title}`);

      if (task.status === "completed") {
        console.warn(`[TaskExecution] Task ${taskId} is already completed`);
        return { success: false, error: "Task is already completed" };
      }

      if (task.status === "cancelled") {
        console.warn(`[TaskExecution] Task ${taskId} is cancelled`);
        return { success: false, error: "Task is cancelled" };
      }

      if (task.requiresHumanReview && !task.humanReviewedBy) {
        console.warn(`[TaskExecution] Task ${taskId} requires human review`);
        return { success: false, error: "Task requires human review" };
      }

      // Validate task configuration
      const validation = this.validateTaskConfig(task);
      if (!validation.valid) {
        console.error(`[TaskExecution] Task ${taskId} validation failed: ${validation.error}`);
        return { success: false, error: validation.error };
      }

      // Create execution record
      const [execution] = await db
        .insert(taskExecutions)
        .values({
          taskId,
          triggeredBy,
          status: "running",
          attemptNumber: (task.errorCount || 0) + 1,
        })
        .returning();

      executionId = execution.id;
      console.log(`[TaskExecution] Created execution record ${executionId} for task ${taskId}`);


      // Update task status
      await db
        .update(agencyTasks)
        .set({
          status: "in_progress",
          startedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(agencyTasks.id, taskId));

      // Execute based on task type
      let result: ExecutionResult;

      console.log(`[TaskExecution] Executing task ${taskId} of type: ${task.taskType}`);

      switch (task.taskType) {
        case "browser_automation":
          result = await this.executeBrowserAutomation(task, execution.id);
          break;
        case "api_call":
          result = await this.executeApiCall(task);
          break;
        case "notification":
          result = await this.executeNotification(task);
          break;
        case "reminder":
          result = await this.executeReminder(task);
          break;
        case "ghl_action":
          result = await this.executeGhlAction(task);
          break;
        case "data_extraction":
          result = await this.executeDataExtraction(task, execution.id);
          break;
        case "report_generation":
          result = await this.executeReportGeneration(task);
          break;
        default:
          result = await this.executeCustomTask(task);
      }

      const duration = Date.now() - startTime;

      console.log(
        `[TaskExecution] Task ${taskId} execution completed in ${duration}ms. Success: ${result.success}`
      );

      // Update execution record
      await db
        .update(taskExecutions)
        .set({
          status: result.success ? "success" : "failed",
          output: result.output,
          error: result.error,
          duration,
          screenshots: result.screenshots,
          completedAt: new Date(),
        })
        .where(eq(taskExecutions.id, executionId));

      // Update task status
      if (result.success) {
        await db
          .update(agencyTasks)
          .set({
            status: "completed",
            completedAt: new Date(),
            result: result.output,
            resultSummary: this.generateResultSummary(result),
            updatedAt: new Date(),
          })
          .where(eq(agencyTasks.id, taskId));

        // Send completion notification if enabled
        if (task.notifyOnComplete) {
          await this.sendNotification(task, "completed", result);
        }
      } else {
        const newErrorCount = (task.errorCount || 0) + 1;
        const maxRetries = task.maxRetries || 3;

        if (newErrorCount >= maxRetries) {
          await db
            .update(agencyTasks)
            .set({
              status: "failed",
              lastError: result.error,
              errorCount: newErrorCount,
              statusReason: `Failed after ${newErrorCount} attempts`,
              updatedAt: new Date(),
            })
            .where(eq(agencyTasks.id, taskId));

          // Send failure notification if enabled
          if (task.notifyOnFailure) {
            await this.sendNotification(task, "failed", result);
          }
        } else {
          await db
            .update(agencyTasks)
            .set({
              status: "pending",
              lastError: result.error,
              errorCount: newErrorCount,
              statusReason: `Attempt ${newErrorCount} failed, will retry`,
              updatedAt: new Date(),
            })
            .where(eq(agencyTasks.id, taskId));
        }
      }

      return { ...result, duration };
    } catch (error) {
      console.error("Task execution error:", error);

      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : "Unknown error";

      // Update execution record if created
      if (executionId) {
        const db2 = await getDb();
        if (db2) {
          await db2
            .update(taskExecutions)
            .set({
              status: "failed",
              error: errorMessage,
              duration,
              completedAt: new Date(),
            })
            .where(eq(taskExecutions.id, executionId));
        }
      }

      return { success: false, error: errorMessage, duration };
    }
  }

  /**
   * Execute browser automation task
   */
  private async executeBrowserAutomation(
    task: typeof agencyTasks.$inferSelect,
    executionId: number
  ): Promise<ExecutionResult> {
    const db = await getDb();
    if (!db) {
      return { success: false, error: "Database not initialized" };
    }

    try {
      const config = task.executionConfig as TaskExecutionConfig | null;
      if (!config?.browserActions && !config?.automationSteps) {
        return { success: false, error: "No browser actions configured" };
      }

      // Create Browserbase session
      const session = await browserbaseSDK.createSession();

      // Get debug URL for live view
      const debugInfo = await browserbaseSDK.getSessionDebug(session.id);

      // Update execution with session info
      await db
        .update(taskExecutions)
        .set({
          browserSessionId: session.id,
          debugUrl: debugInfo.debuggerFullscreenUrl,
        })
        .where(eq(taskExecutions.id, executionId));

      // Initialize Stagehand
      const modelName = process.env.STAGEHAND_MODEL || process.env.AI_MODEL || "google/gemini-2.0-flash";

      // Disable pino pretty transport before creating Stagehand
      process.env.PINO_DISABLE_PRETTY = 'true';
      process.env.LOG_LEVEL = 'silent';

      const stagehand = new Stagehand({
        env: "BROWSERBASE",
        verbose: 0,
        disablePino: true,
        model: modelName,
        apiKey: process.env.BROWSERBASE_API_KEY,
        projectId: process.env.BROWSERBASE_PROJECT_ID,
        browserbaseSessionID: session.id,
      });

      await stagehand.init();
      const page = stagehand.context.pages()[0];

      const results: any[] = [];
      const screenshots: string[] = [];

      // Execute automation steps
      const steps = config.automationSteps || config.browserActions || [];
      for (const step of steps) {
        try {
          const stepResult = await this.executeAutomationStep(stagehand, page, step);
          results.push(stepResult);

          // Take screenshot if requested
          if ((step as any).screenshot) {
            const screenshotPath = `/tmp/screenshot_${Date.now()}.png`;
            await page.screenshot({ path: screenshotPath });
            screenshots.push(screenshotPath);
          }
        } catch (stepError) {
          console.error("Step execution failed:", stepError);
          if (!(step as any).continueOnError) {
            throw stepError;
          }
          results.push({ error: stepError instanceof Error ? stepError.message : "Step failed" });
        }
      }

      await stagehand.close();

      return {
        success: true,
        output: { steps: results, sessionId: session.id },
        screenshots,
      };
    } catch (error) {
      console.error("Browser automation error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Browser automation failed",
      };
    }
  }

  /**
   * Execute a single automation step
   */
  private async executeAutomationStep(
    stagehand: Stagehand,
    page: any,
    step: AutomationStep | BrowserAction
  ): Promise<any> {
    const stepType = (step as AutomationStep).type || (step as BrowserAction).action;
    const config = (step as AutomationStep).config || (step as any);

    switch (stepType) {
      case "navigate":
        await page.goto((config as any).url);
        return { action: "navigate", url: (config as any).url };

      case "click":
        if ((config as any).selector) {
          await page.click((config as any).selector);
        } else if ((config as any).instruction) {
          await stagehand.act((config as any).instruction);
        }
        return { action: "click", selector: (config as any).selector };

      case "type":
        if ((config as any).selector) {
          await page.fill((config as any).selector, (config as any).value);
        }
        return { action: "type", selector: (config as any).selector };

      case "extract":
        const extracted = await stagehand.extract((config as any).instruction || "Extract the main content");
        return { action: "extract", data: extracted };

      case "wait":
        await new Promise((resolve) => setTimeout(resolve, (config as any).duration || 1000));
        return { action: "wait", duration: (config as any).duration };

      case "screenshot":
        const screenshot = await page.screenshot({ encoding: "base64" });
        return { action: "screenshot", data: screenshot };

      default:
        return { action: stepType, error: "Unknown action" };
    }
  }

  /**
   * Execute API call task
   */
  private async executeApiCall(task: typeof agencyTasks.$inferSelect): Promise<ExecutionResult> {
    try {
      const config = task.executionConfig as TaskExecutionConfig | null;
      if (!config?.apiEndpoint) {
        return { success: false, error: "No API endpoint configured" };
      }

      // Build headers
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      // Add authentication if configured
      const apiConfig = config as any;
      if (apiConfig.authType) {
        switch (apiConfig.authType) {
          case "bearer":
            if (apiConfig.bearerToken) {
              headers["Authorization"] = `Bearer ${apiConfig.bearerToken}`;
            }
            break;
          case "api_key":
            if (apiConfig.apiKeyHeader && apiConfig.apiKey) {
              headers[apiConfig.apiKeyHeader] = apiConfig.apiKey;
            }
            break;
          case "basic":
            if (apiConfig.username && apiConfig.password) {
              const credentials = Buffer.from(`${apiConfig.username}:${apiConfig.password}`).toString('base64');
              headers["Authorization"] = `Basic ${credentials}`;
            }
            break;
        }
      }

      // Add custom headers if provided
      if (apiConfig.customHeaders) {
        Object.assign(headers, apiConfig.customHeaders);
      }

      // Build request options
      const requestOptions: RequestInit = {
        method: config.apiMethod || "GET",
        headers,
      };

      // Add body for POST/PUT/PATCH
      if (["POST", "PUT", "PATCH"].includes(config.apiMethod || "GET") && config.apiPayload) {
        requestOptions.body = JSON.stringify(config.apiPayload);
      }

      // Add timeout if configured
      const timeout = apiConfig.timeout || 30000;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      requestOptions.signal = controller.signal;

      try {
        const response = await fetch(config.apiEndpoint, requestOptions);
        clearTimeout(timeoutId);

        let data: any;
        const contentType = response.headers.get("content-type");

        if (contentType?.includes("application/json")) {
          data = await response.json();
        } else {
          data = await response.text();
        }

        // Store response metadata
        const responseHeaders: Record<string, string> = {};
        response.headers.forEach((value, key) => {
          responseHeaders[key] = value;
        });

        const responseMetadata = {
          status: response.status,
          statusText: response.statusText,
          headers: responseHeaders,
        };

        if (!response.ok) {
          return {
            success: false,
            output: { data, metadata: responseMetadata },
            error: `API returned ${response.status}: ${response.statusText}`,
          };
        }

        return {
          success: true,
          output: {
            data,
            metadata: responseMetadata,
          },
        };
      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          return {
            success: false,
            error: `API request timeout after ${timeout}ms`,
          };
        }
        throw fetchError;
      }
    } catch (error) {
      console.error("API call error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "API call failed",
      };
    }
  }

  /**
   * Execute notification task
   */
  private async executeNotification(
    task: typeof agencyTasks.$inferSelect
  ): Promise<ExecutionResult> {
    const db = await getDb();
    if (!db) {
      return { success: false, error: "Database not initialized" };
    }

    try {
      const config = task.executionConfig as TaskExecutionConfig | null;

      // Validate configuration
      if (!config || !task.sourceWebhookId) {
        return {
          success: false,
          error: "No webhook configured for notification"
        };
      }

      // Get webhook configuration
      const [webhook] = await db
        .select()
        .from(userWebhooks)
        .where(eq(userWebhooks.id, task.sourceWebhookId))
        .limit(1);

      if (!webhook || !webhook.outboundEnabled) {
        return {
          success: false,
          error: "Webhook not configured for outbound messages"
        };
      }

      // Create notification message
      const notificationContent = task.description || task.title;
      const recipientIdentifier = (config as any).recipient || "owner";

      // Create outbound message
      await db.insert(outboundMessages).values({
        webhookId: webhook.id,
        userId: task.userId,
        taskId: task.id,
        conversationId: task.conversationId,
        messageType: "notification",
        content: notificationContent,
        recipientIdentifier,
        deliveryStatus: "pending",
      });

      return {
        success: true,
        output: {
          message: "Notification queued for delivery",
          taskId: task.id,
          webhookId: webhook.id,
          recipient: recipientIdentifier,
        },
      };
    } catch (error) {
      console.error("Notification task error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Notification failed",
      };
    }
  }

  /**
   * Execute reminder task
   */
  private async executeReminder(task: typeof agencyTasks.$inferSelect): Promise<ExecutionResult> {
    const db = await getDb();
    if (!db) {
      return { success: false, error: "Database not initialized" };
    }

    try {
      const config = task.executionConfig as TaskExecutionConfig | null;

      // Validate reminder configuration
      if (!config || !(config as any).reminderTime) {
        return {
          success: false,
          error: "Reminder time not specified"
        };
      }

      const reminderTime = new Date((config as any).reminderTime);
      const reminderMessage = (config as any).reminderMessage || task.description || task.title;

      // Create a scheduled outbound message for the reminder
      if (task.sourceWebhookId) {
        await db.insert(outboundMessages).values({
          webhookId: task.sourceWebhookId,
          userId: task.userId,
          taskId: task.id,
          conversationId: task.conversationId,
          messageType: "reminder",
          content: `Reminder: ${reminderMessage}`,
          recipientIdentifier: (config as any).recipient || "owner",
          deliveryStatus: "pending",
          scheduledFor: reminderTime,
        });
      }

      return {
        success: true,
        output: {
          message: "Reminder scheduled",
          taskId: task.id,
          scheduledFor: reminderTime.toISOString(),
          reminderMessage,
        },
      };
    } catch (error) {
      console.error("Reminder task error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Reminder creation failed",
      };
    }
  }

  /**
   * Execute GHL action task
   */
  private async executeGhlAction(task: typeof agencyTasks.$inferSelect): Promise<ExecutionResult> {
    try {
      const config = task.executionConfig as TaskExecutionConfig | null;

      // Validate GHL configuration
      if (!config || !(config as any).ghlAction) {
        return {
          success: false,
          error: "GHL action not specified"
        };
      }

      const ghlConfig = config as any;
      const action = ghlConfig.ghlAction; // e.g., "add_contact", "send_sms", "create_opportunity"

      // Get GHL API credentials from environment or user config
      const ghlApiKey = process.env.GHL_API_KEY;
      const ghlLocationId = ghlConfig.locationId || process.env.GHL_LOCATION_ID;

      if (!ghlApiKey) {
        return {
          success: false,
          error: "GHL API key not configured"
        };
      }

      // Execute based on action type
      let endpoint = "";
      let method = "POST";
      let payload: any = {};

      switch (action) {
        case "add_contact":
          endpoint = `https://rest.gohighlevel.com/v1/contacts/`;
          payload = {
            firstName: ghlConfig.firstName,
            lastName: ghlConfig.lastName,
            email: ghlConfig.email,
            phone: ghlConfig.phone,
            ...(ghlConfig.customFields || {}),
          };
          break;

        case "send_sms":
          endpoint = `https://rest.gohighlevel.com/v1/conversations/messages`;
          payload = {
            contactId: ghlConfig.contactId,
            message: ghlConfig.message,
            type: "SMS",
          };
          break;

        case "create_opportunity":
          endpoint = `https://rest.gohighlevel.com/v1/opportunities/`;
          payload = {
            pipelineId: ghlConfig.pipelineId,
            locationId: ghlLocationId,
            name: ghlConfig.opportunityName,
            contactId: ghlConfig.contactId,
            status: ghlConfig.status || "open",
            monetaryValue: ghlConfig.monetaryValue,
          };
          break;

        case "add_tag":
          endpoint = `https://rest.gohighlevel.com/v1/contacts/${ghlConfig.contactId}/tags`;
          payload = {
            tags: Array.isArray(ghlConfig.tags) ? ghlConfig.tags : [ghlConfig.tags],
          };
          break;

        case "update_contact":
          endpoint = `https://rest.gohighlevel.com/v1/contacts/${ghlConfig.contactId}`;
          method = "PUT";
          payload = ghlConfig.updateData || {};
          break;

        default:
          return {
            success: false,
            error: `Unknown GHL action: ${action}`,
          };
      }

      // Make API request
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Authorization": `Bearer ${ghlApiKey}`,
          "Content-Type": "application/json",
          "Version": "2021-07-28",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: `GHL API error (${response.status}): ${data.message || JSON.stringify(data)}`,
          output: data,
        };
      }

      return {
        success: true,
        output: {
          message: `GHL ${action} completed successfully`,
          taskId: task.id,
          action,
          result: data,
        },
      };
    } catch (error) {
      console.error("GHL action error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "GHL action failed",
      };
    }
  }

  /**
   * Execute data extraction task
   */
  private async executeDataExtraction(
    task: typeof agencyTasks.$inferSelect,
    executionId: number
  ): Promise<ExecutionResult> {
    // Use browser automation for extraction
    return this.executeBrowserAutomation(task, executionId);
  }

  /**
   * Execute report generation task
   */
  private async executeReportGeneration(
    task: typeof agencyTasks.$inferSelect
  ): Promise<ExecutionResult> {
    const db = await getDb();
    if (!db) {
      return { success: false, error: "Database not initialized" };
    }

    try {
      const config = task.executionConfig as TaskExecutionConfig | null;

      // Validate report configuration
      if (!config || !(config as any).reportType) {
        return {
          success: false,
          error: "Report type not specified"
        };
      }

      const reportConfig = config as any;
      const reportType = reportConfig.reportType; // e.g., "task_summary", "execution_stats", "webhook_activity"

      let reportData: any = {};
      let reportTitle = "";

      switch (reportType) {
        case "task_summary": {
          // Generate task summary report
          const startDate = reportConfig.startDate ? new Date(reportConfig.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          const endDate = reportConfig.endDate ? new Date(reportConfig.endDate) : new Date();

          const tasks = await db
            .select()
            .from(agencyTasks)
            .where(
              and(
                eq(agencyTasks.userId, task.userId),
                gte(agencyTasks.createdAt, startDate),
                lte(agencyTasks.createdAt, endDate)
              )
            );

          const statusCounts = tasks.reduce((acc: any, t) => {
            acc[t.status] = (acc[t.status] || 0) + 1;
            return acc;
          }, {});

          const typeCounts = tasks.reduce((acc: any, t) => {
            acc[t.taskType] = (acc[t.taskType] || 0) + 1;
            return acc;
          }, {});

          reportData = {
            period: { startDate: startDate.toISOString(), endDate: endDate.toISOString() },
            totalTasks: tasks.length,
            byStatus: statusCounts,
            byType: typeCounts,
            completionRate: tasks.length > 0 ? ((statusCounts.completed || 0) / tasks.length * 100).toFixed(2) : 0,
          };
          reportTitle = `Task Summary Report (${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()})`;
          break;
        }

        case "execution_stats": {
          // Generate execution statistics report
          const executions = await db
            .select()
            .from(taskExecutions)
            .innerJoin(agencyTasks, eq(taskExecutions.taskId, agencyTasks.id))
            .where(eq(agencyTasks.userId, task.userId))
            .limit(reportConfig.limit || 100);

          const successCount = executions.filter(e => e.task_executions.status === "success").length;
          const failedCount = executions.filter(e => e.task_executions.status === "failed").length;
          const avgDuration = executions.reduce((sum, e) => sum + (e.task_executions.duration || 0), 0) / executions.length;

          reportData = {
            totalExecutions: executions.length,
            successful: successCount,
            failed: failedCount,
            successRate: executions.length > 0 ? (successCount / executions.length * 100).toFixed(2) : 0,
            averageDuration: Math.round(avgDuration),
            recentExecutions: executions.slice(0, 10).map(e => ({
              taskId: e.task_executions.taskId,
              status: e.task_executions.status,
              duration: e.task_executions.duration,
              startedAt: e.task_executions.startedAt,
            })),
          };
          reportTitle = "Execution Statistics Report";
          break;
        }

        case "webhook_activity": {
          // Generate webhook activity report
          const messages = await db
            .select()
            .from(inboundMessages)
            .where(eq(inboundMessages.userId, task.userId))
            .limit(reportConfig.limit || 100);

          const webhookCounts = messages.reduce((acc: any, m) => {
            acc[m.webhookId] = (acc[m.webhookId] || 0) + 1;
            return acc;
          }, {});

          reportData = {
            totalMessages: messages.length,
            byWebhook: webhookCounts,
            recentMessages: messages.slice(0, 10).map(m => ({
              webhookId: m.webhookId,
              senderIdentifier: m.senderIdentifier,
              messageType: m.messageType,
              receivedAt: m.receivedAt,
            })),
          };
          reportTitle = "Webhook Activity Report";
          break;
        }

        default:
          return {
            success: false,
            error: `Unknown report type: ${reportType}`,
          };
      }

      // Store report as task result
      const reportOutput = {
        reportType,
        reportTitle,
        generatedAt: new Date().toISOString(),
        data: reportData,
      };

      // Optionally send report as notification
      if (reportConfig.sendNotification && task.sourceWebhookId) {
        const reportSummary = this.formatReportSummary(reportType, reportData);

        await db.insert(outboundMessages).values({
          webhookId: task.sourceWebhookId,
          userId: task.userId,
          taskId: task.id,
          conversationId: task.conversationId,
          messageType: "task_update",
          content: `${reportTitle}\n\n${reportSummary}`,
          recipientIdentifier: reportConfig.recipient || "owner",
          deliveryStatus: "pending",
        });
      }

      return {
        success: true,
        output: reportOutput,
      };
    } catch (error) {
      console.error("Report generation error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Report generation failed",
      };
    }
  }

  /**
   * Format report data into readable summary
   */
  private formatReportSummary(reportType: string, data: any): string {
    switch (reportType) {
      case "task_summary":
        return `Total Tasks: ${data.totalTasks}\nCompletion Rate: ${data.completionRate}%\nBy Status: ${JSON.stringify(data.byStatus, null, 2)}`;

      case "execution_stats":
        return `Total Executions: ${data.totalExecutions}\nSuccess Rate: ${data.successRate}%\nAvg Duration: ${data.averageDuration}ms`;

      case "webhook_activity":
        return `Total Messages: ${data.totalMessages}\nBy Webhook: ${JSON.stringify(data.byWebhook, null, 2)}`;

      default:
        return JSON.stringify(data, null, 2);
    }
  }

  /**
   * Execute custom task
   */
  private async executeCustomTask(task: typeof agencyTasks.$inferSelect): Promise<ExecutionResult> {
    // For custom tasks, just mark as completed
    return {
      success: true,
      output: { message: "Custom task completed", taskId: task.id },
    };
  }

  /**
   * Send notification about task status
   */
  private async sendNotification(
    task: typeof agencyTasks.$inferSelect,
    status: "completed" | "failed",
    result: ExecutionResult
  ): Promise<void> {
    const db = await getDb();
    if (!db || !task.sourceWebhookId) return;

    try {
      const [webhook] = await db
        .select()
        .from(userWebhooks)
        .where(eq(userWebhooks.id, task.sourceWebhookId))
        .limit(1);

      if (!webhook || !webhook.outboundEnabled) return;

      const message =
        status === "completed"
          ? `Task completed: ${task.title}\n\nResult: ${result.output?.message || "Success"}`
          : `Task failed: ${task.title}\n\nError: ${result.error}`;

      // Create outbound message
      await db.insert(outboundMessages).values({
        webhookId: webhook.id,
        userId: task.userId,
        taskId: task.id,
        conversationId: task.conversationId,
        messageType: "task_update",
        content: message,
        recipientIdentifier: "owner", // Will be resolved based on webhook config
        deliveryStatus: "pending",
      });
    } catch (error) {
      console.error("Failed to send notification:", error);
    }
  }

  /**
   * Generate result summary
   */
  private generateResultSummary(result: ExecutionResult): string {
    if (!result.success) {
      return `Failed: ${result.error}`;
    }

    if (result.output?.message) {
      return result.output.message;
    }

    if (result.output?.steps) {
      return `Completed ${result.output.steps.length} automation steps`;
    }

    return "Task completed successfully";
  }

  /**
   * Process pending tasks (called by scheduler)
   */
  async processPendingTasks(): Promise<{ processed: number; success: number; failed: number }> {
    const db = await getDb();
    if (!db) {
      return { processed: 0, success: 0, failed: 0 };
    }

    try {
      // Get tasks ready for execution
      const pendingTasks = await db
        .select()
        .from(agencyTasks)
        .where(
          and(
            eq(agencyTasks.assignedToBot, true),
            eq(agencyTasks.requiresHumanReview, false),
            or(
              eq(agencyTasks.status, "pending"),
              eq(agencyTasks.status, "queued")
            ),
            or(
              isNull(agencyTasks.scheduledFor),
              lte(agencyTasks.scheduledFor, new Date())
            )
          )
        )
        .limit(10); // Process in batches

      let success = 0;
      let failed = 0;

      for (const task of pendingTasks) {
        const result = await this.executeTask(task.id, "scheduled");
        if (result.success) {
          success++;
        } else {
          failed++;
        }
      }

      return { processed: pendingTasks.length, success, failed };
    } catch (error) {
      console.error("Failed to process pending tasks:", error);
      return { processed: 0, success: 0, failed: 0 };
    }
  }
}

// Export singleton instance
export const taskExecutionService = new TaskExecutionService();

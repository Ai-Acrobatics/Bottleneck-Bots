/**
 * Email Worker
 * Processes email-related background jobs including sync and AI draft generation
 */

import { Worker, Job } from "bullmq";
import { JobType, EmailSyncJobData, EmailDraftJobData } from "../_core/queue";
import { getRedisConnection } from "./utils";
import { getDb } from "../db";
import { emailConnections, syncedEmails, emailDrafts, emailSyncHistory } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { emailService } from "../services/email.service";

/**
 * Process EMAIL_SYNC jobs
 * Syncs emails from Gmail/Outlook API
 */
async function processEmailSync(job: Job<EmailSyncJobData>) {
  const { userId, accountId, emailProvider, syncSince } = job.data;

  console.log(`[Email Sync] Processing for user ${userId}, account ${accountId}`);
  console.log(`[Email Sync] Provider: ${emailProvider}, syncSince: ${syncSince || "all time"}`);

  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await job.updateProgress(5);

  // Get connection details
  const connection = await db
    .select()
    .from(emailConnections)
    .where(and(eq(emailConnections.id, parseInt(accountId)), eq(emailConnections.userId, parseInt(userId))))
    .limit(1);

  if (connection.length === 0) {
    throw new Error("Email connection not found");
  }

  const conn = connection[0];

  if (!conn.isActive) {
    throw new Error("Email connection is inactive");
  }

  // Create sync history record
  const syncHistory = await db
    .insert(emailSyncHistory)
    .values({
      userId: parseInt(userId),
      connectionId: conn.id,
      jobId: job.id,
      status: "running",
      startedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  const syncId = syncHistory[0].id;

  try {
    await job.updateProgress(10);

    // Check if token needs refresh
    let accessToken = conn.accessToken;
    if (new Date() >= conn.expiresAt) {
      console.log(`[Email Sync] Refreshing expired token for connection ${conn.id}`);
      const refreshed = await emailService.refreshToken(emailProvider, conn.refreshToken);

      await db
        .update(emailConnections)
        .set({
          accessToken: refreshed.accessToken,
          expiresAt: refreshed.expiresAt,
          updatedAt: new Date(),
        })
        .where(eq(emailConnections.id, conn.id));

      accessToken = refreshed.accessToken;
    }

    await job.updateProgress(20);

    // Fetch emails from provider
    console.log(`[Email Sync] Fetching emails from ${emailProvider}`);
    const result = await emailService.fetchEmails(emailProvider, accessToken, {
      maxResults: 50,
      cursor: conn.syncCursor || undefined,
      unreadOnly: false,
    });

    await job.updateProgress(40);

    console.log(`[Email Sync] Fetched ${result.emails.length} emails`);

    let emailsProcessed = 0;
    let draftsGenerated = 0;

    // Process each email
    for (let i = 0; i < result.emails.length; i++) {
      const email = result.emails[i];

      try {
        // Check if email already exists
        const existing = await db
          .select()
          .from(syncedEmails)
          .where(eq(syncedEmails.messageId, email.messageId))
          .limit(1);

        if (existing.length > 0) {
          console.log(`[Email Sync] Skipping duplicate email: ${email.messageId}`);
          continue;
        }

        // Analyze sentiment using AI
        const sentiment = await emailService.analyzeSentiment({
          subject: email.subject,
          body: email.body || email.snippet,
          from: email.from.email,
        });

        // Store email in database
        await db.insert(syncedEmails).values({
          userId: parseInt(userId),
          connectionId: conn.id,
          messageId: email.messageId,
          threadId: email.threadId,
          subject: email.subject,
          from: email.from as any,
          to: email.to as any,
          cc: email.cc as any,
          bcc: email.bcc as any,
          replyTo: email.replyTo as any,
          date: email.date,
          body: email.body,
          bodyType: email.bodyType,
          snippet: email.snippet,
          labels: email.labels as any,
          isRead: email.isRead,
          isStarred: email.isStarred,
          hasAttachments: email.hasAttachments,
          attachments: email.attachments as any,
          headers: email.headers as any,
          rawData: email.rawData as any,
          sentiment: sentiment.sentiment,
          sentimentScore: sentiment.score,
          importance: sentiment.importance,
          category: sentiment.category,
          requiresResponse: sentiment.requiresResponse,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        emailsProcessed++;

        // Auto-generate draft if email requires response and is high importance
        if (sentiment.requiresResponse && sentiment.importance === "high") {
          try {
            const draft = await emailService.generateDraft(
              {
                subject: email.subject,
                body: email.body || email.snippet,
                from: email.from.email,
              },
              {
                tone: "professional",
                model: "claude-3-sonnet",
              }
            );

            const savedEmail = await db
              .select()
              .from(syncedEmails)
              .where(eq(syncedEmails.messageId, email.messageId))
              .limit(1);

            if (savedEmail.length > 0) {
              await db.insert(emailDrafts).values({
                userId: parseInt(userId),
                emailId: savedEmail[0].id,
                connectionId: conn.id,
                subject: draft.subject,
                body: draft.body,
                bodyType: draft.bodyType,
                tone: "professional",
                status: "pending",
                model: "claude-3-sonnet",
                metadata: {
                  autoGenerated: true,
                  reason: "high_importance_requires_response",
                },
                generatedAt: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
              });

              draftsGenerated++;
            }
          } catch (draftError: any) {
            console.error(`[Email Sync] Failed to generate draft:`, draftError.message);
            // Continue processing other emails
          }
        }

        // Update progress
        const progress = 40 + Math.floor((i / result.emails.length) * 50);
        await job.updateProgress(progress);
      } catch (emailError: any) {
        console.error(`[Email Sync] Failed to process email ${email.messageId}:`, emailError.message);
        // Continue processing other emails
      }
    }

    await job.updateProgress(95);

    // Update connection sync status
    await db
      .update(emailConnections)
      .set({
        lastSyncedAt: new Date(),
        syncCursor: result.nextCursor || conn.syncCursor,
        updatedAt: new Date(),
      })
      .where(eq(emailConnections.id, conn.id));

    // Update sync history
    const completedAt = new Date();
    const duration = completedAt.getTime() - syncHistory[0].createdAt.getTime();

    await db
      .update(emailSyncHistory)
      .set({
        status: "completed",
        emailsFetched: result.emails.length,
        emailsProcessed,
        draftsGenerated,
        completedAt,
        duration,
        metadata: {
          hasMore: result.hasMore,
          nextCursor: result.nextCursor,
        },
        updatedAt: new Date(),
      })
      .where(eq(emailSyncHistory.id, syncId));

    await job.updateProgress(100);

    console.log(`[Email Sync] Completed for user ${userId}: ${emailsProcessed} emails processed, ${draftsGenerated} drafts generated`);

    return {
      success: true,
      emailsFetched: result.emails.length,
      emailsProcessed,
      draftsGenerated,
      provider: emailProvider,
      hasMore: result.hasMore,
    };
  } catch (error: any) {
    // Update sync history with error
    await db
      .update(emailSyncHistory)
      .set({
        status: "failed",
        error: error.message,
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(emailSyncHistory.id, syncId));

    throw error;
  }
}

/**
 * Process EMAIL_DRAFT jobs
 * Generates draft email responses using AI
 */
async function processEmailDraft(job: Job<EmailDraftJobData>) {
  const { userId, threadId, context, tone = "professional" } = job.data;

  console.log(`[Email Draft] Generating for user ${userId}, thread ${threadId}`);
  console.log(`[Email Draft] Tone: ${tone}`);

  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await job.updateProgress(10);

  // Get emails in thread
  const emails = await db
    .select()
    .from(syncedEmails)
    .where(and(eq(syncedEmails.threadId, threadId), eq(syncedEmails.userId, parseInt(userId))))
    .orderBy(desc(syncedEmails.date))
    .limit(5);

  if (emails.length === 0) {
    throw new Error("Thread not found");
  }

  const latestEmail = emails[0];

  await job.updateProgress(30);

  // Build context from thread
  let fullContext = context || "";
  if (emails.length > 1) {
    fullContext += "\n\nPrevious emails in thread:\n";
    emails.slice(1).forEach((email, i) => {
      fullContext += `\n${i + 1}. From: ${(email.from as any).email}\n`;
      fullContext += `   Subject: ${email.subject}\n`;
      fullContext += `   ${email.snippet}\n`;
    });
  }

  await job.updateProgress(50);

  // Generate draft
  const draft = await emailService.generateDraft(
    {
      subject: latestEmail.subject || "",
      body: latestEmail.body || latestEmail.snippet || "",
      from: (latestEmail.from as any).email,
    },
    {
      tone,
      context: fullContext,
    }
  );

  await job.updateProgress(80);

  // Save draft
  const savedDraft = await db
    .insert(emailDrafts)
    .values({
      userId: parseInt(userId),
      emailId: latestEmail.id,
      connectionId: latestEmail.connectionId,
      subject: draft.subject,
      body: draft.body,
      bodyType: draft.bodyType,
      tone,
      status: "pending",
      metadata: {
        jobId: job.id,
        threadId,
        hasContext: !!context,
      },
      generatedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  await job.updateProgress(100);

  console.log(`[Email Draft] Generated draft ${savedDraft[0].id} for thread ${threadId}`);

  return {
    success: true,
    draftId: savedDraft[0].id.toString(),
    tone,
  };
}

/**
 * Create and configure the email worker
 */
export function createEmailWorker() {
    const worker = new Worker(
        "email",
        async (job) => {
            console.log(`[Email Worker] Processing ${job.name} job (ID: ${job.id})`);

            try {
                switch (job.name) {
                    case JobType.EMAIL_SYNC:
                        return await processEmailSync(job as Job<EmailSyncJobData>);

                    case JobType.EMAIL_DRAFT:
                        return await processEmailDraft(job as Job<EmailDraftJobData>);

                    default:
                        throw new Error(`Unknown email job type: ${job.name}`);
                }
            } catch (error: any) {
                console.error(`[Email Worker] Job ${job.id} failed:`, error.message);
                throw error;
            }
        },
        {
            connection: getRedisConnection(),
            concurrency: 5, // Process up to 5 jobs concurrently
            limiter: {
                max: 10, // Max 10 jobs
                duration: 1000, // Per second
            },
        }
    );

    console.log("Email worker initialized");
    return worker;
}

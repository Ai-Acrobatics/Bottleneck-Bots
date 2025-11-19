import { z } from "zod";
import { router, publicProcedure } from "../../_core/trpc";
import { Stagehand } from "@browserbasehq/stagehand";
import { TRPCError } from "@trpc/server";
import { browserbaseSDK } from "../../_core/browserbaseSDK";
import { db } from "@/server/db";
import { browserSessions, extractedData } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export const aiRouter = router({
    /**
     * Execute browser automation with AI agent
     * Supports geo-location and session tracking
     */
    chat: publicProcedure
        .input(
            z.object({
                messages: z.array(
                    z.object({
                        role: z.enum(["system", "user", "assistant"]),
                        content: z.string(),
                    })
                ),
                // Optional geo-location configuration
                geolocation: z.object({
                    city: z.string().optional(),
                    state: z.string().optional(),
                    country: z.string().optional(),
                }).optional(),
                // Optional initial URL
                startUrl: z.string().url().optional(),
                // Model selection (default: gemini-2.0-flash)
                modelName: z.string().optional(),
            })
        )
        .mutation(async ({ input }) => {
            const lastMessage = input.messages[input.messages.length - 1];
            if (!lastMessage || lastMessage.role !== "user") {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Last message must be from user",
                });
            }

            const prompt = lastMessage.content;
            const startUrl = input.startUrl || "https://google.com";

            console.log("Initializing Stagehand with Browserbase...");

            let sessionId: string | undefined;
            let liveViewUrl: string | undefined;
            let debuggerUrl: string | undefined;

            try {
                // Create Browserbase session using the real SDK
                const session = await browserbaseSDK.createSession({
                    projectId: process.env.BROWSERBASE_PROJECT_ID,
                    browserSettings: {
                        viewport: { width: 1920, height: 1080 },
                    },
                    proxies: true,
                    recordSession: true,
                    keepAlive: true,
                    timeout: 3600,
                });

                sessionId = session.id;
                console.log(`Browserbase session created: ${sessionId}`);

                // Get live view URLs immediately after session creation
                try {
                    const debugInfo = await browserbaseSDK.getSessionDebug(sessionId);
                    liveViewUrl = debugInfo.debuggerFullscreenUrl;
                    debuggerUrl = debugInfo.debuggerUrl;
                    console.log(`Live view available at: ${liveViewUrl}`);
                } catch (debugError) {
                    console.error("Failed to get live view URL:", debugError);
                    // Don't throw - continue with automation even if live view fails
                }

                // Initialize Stagehand with the existing Browserbase session
                const stagehand = new Stagehand({
                    env: "BROWSERBASE",
                    verbose: 1,
                    disablePino: true,
                    model: input.modelName || "google/gemini-2.0-flash",
                    apiKey: process.env.BROWSERBASE_API_KEY,
                    projectId: process.env.BROWSERBASE_PROJECT_ID,
                    browserbaseSessionID: sessionId, // Connect to existing session
                });

                await stagehand.init();

                // Get the first page from context
                const page = stagehand.context.pages()[0];

                // Navigate to starting URL
                await page.goto(startUrl);

                // Execute AI action - Note: In V3, act is called on stagehand, not page
                await stagehand.act(prompt);

                await stagehand.close();

                // Persist session to database
                try {
                    // PLACEHOLDER: Replace with actual userId from auth context (e.g., ctx.session.user.id)
                    const placeholderUserId = 1;

                    await db.insert(browserSessions).values({
                        userId: placeholderUserId,
                        sessionId: sessionId,
                        status: "completed",
                        url: liveViewUrl || `https://www.browserbase.com/sessions/${sessionId}`,
                        debuggerUrl: debuggerUrl,
                        projectId: process.env.BROWSERBASE_PROJECT_ID,
                        metadata: {
                            sessionType: "chat",
                            prompt: prompt,
                            startUrl: startUrl,
                            modelName: input.modelName || "google/gemini-2.0-flash",
                            geolocation: input.geolocation || null,
                            environment: process.env.NODE_ENV || "development",
                            liveViewUrl: liveViewUrl,
                        },
                    });
                    console.log(`Session ${sessionId} persisted to database`);
                } catch (dbError) {
                    console.error("Failed to persist session to database:", dbError);
                    // Don't throw - session was successful, just log the DB error
                }

                return {
                    success: true,
                    message: `Successfully executed: ${prompt}`,
                    sessionId: sessionId,
                    sessionUrl: `https://www.browserbase.com/sessions/${sessionId}`,
                    liveViewUrl: liveViewUrl,
                    debuggerUrl: debuggerUrl,
                    prompt: prompt,
                };

            } catch (error) {
                console.error("Stagehand error:", error);

                // Update session status to failed if we have a sessionId
                if (sessionId) {
                    try {
                        // PLACEHOLDER: Replace with actual userId from auth context
                        const placeholderUserId = 1;

                        await db.insert(browserSessions).values({
                            userId: placeholderUserId,
                            sessionId: sessionId,
                            status: "failed",
                            metadata: {
                                sessionType: "chat",
                                error: error instanceof Error ? error.message : "Unknown error",
                            },
                        });
                    } catch (dbError) {
                        console.error("Failed to persist failed session:", dbError);
                    }
                }

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: `Error executing browser action: ${error instanceof Error ? error.message : "Unknown error"}`,
                });
            }
        }),

    /**
     * Retrieve session replay for a given session ID
     * Returns rrweb events that can be used with rrweb-player
     */
    getSessionReplay: publicProcedure
        .input(
            z.object({
                sessionId: z.string(),
            })
        )
        .query(async ({ input }) => {
            try {
                // Check database first for cached recordingUrl (much faster)
                const dbSession = await db.query.browserSessions.findFirst({
                    where: eq(browserSessions.sessionId, input.sessionId),
                    columns: {
                        recordingUrl: true,
                    },
                });

                // If we have a cached recording URL, return it immediately
                if (dbSession?.recordingUrl) {
                    console.log(`Using cached recording URL for session ${input.sessionId}`);
                    return {
                        sessionId: input.sessionId,
                        events: [], // Events not cached, but URL is available
                        recordingUrl: dbSession.recordingUrl,
                        status: "completed",
                        cached: true,
                    };
                }

                // Otherwise, fetch from Browserbase API using real SDK
                console.log(`Fetching recording from Browserbase API for session ${input.sessionId}`);
                const recording = await browserbaseSDK.getSessionRecording(input.sessionId);

                // Cache the recording URL in database for future requests
                if (recording.recordingUrl) {
                    try {
                        await db.update(browserSessions)
                            .set({ recordingUrl: recording.recordingUrl })
                            .where(eq(browserSessions.sessionId, input.sessionId));
                        console.log(`Cached recording URL for session ${input.sessionId}`);
                    } catch (dbError) {
                        console.error("Failed to cache recording URL:", dbError);
                        // Don't throw - we still have the recording data
                    }
                }

                return {
                    sessionId: input.sessionId,
                    events: [], // rrweb events - Browserbase returns recording URL instead
                    recordingUrl: recording.recordingUrl,
                    status: recording.status,
                    cached: false,
                };
            } catch (error) {
                console.error("Failed to retrieve session replay:", error);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: `Failed to retrieve session replay: ${error instanceof Error ? error.message : "Unknown error"}`,
                });
            }
        }),

    /**
     * Get session live view URLs for real-time debugging
     * Returns debuggerFullscreenUrl and all page URLs for multi-tab support
     */
    getSessionLiveView: publicProcedure
        .input(
            z.object({
                sessionId: z.string(),
            })
        )
        .query(async ({ input }) => {
            try {
                // Use real Browserbase SDK to get live view URLs
                const debugInfo = await browserbaseSDK.getSessionDebug(input.sessionId);

                return {
                    sessionId: input.sessionId,
                    liveViewUrl: debugInfo.debuggerFullscreenUrl,
                    debuggerFullscreenUrl: debugInfo.debuggerFullscreenUrl,
                    debuggerUrl: debugInfo.debuggerUrl,
                    wsUrl: debugInfo.wsUrl,
                };
            } catch (error) {
                console.error("Failed to retrieve session live view:", error);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: `Failed to retrieve session live view: ${error instanceof Error ? error.message : "Unknown error"}`,
                });
            }
        }),

    /**
     * Get session logs for debugging
     */
    getSessionLogs: publicProcedure
        .input(
            z.object({
                sessionId: z.string(),
            })
        )
        .query(async ({ input }) => {
            try {
                // Use real Browserbase SDK to get session logs
                const logsData = await browserbaseSDK.getSessionLogs(input.sessionId);

                return {
                    sessionId: input.sessionId,
                    logs: logsData.logs,
                };
            } catch (error) {
                console.error("Failed to retrieve session logs:", error);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: `Failed to retrieve session logs: ${error instanceof Error ? error.message : "Unknown error"}`,
                });
            }
        }),

    /**
     * List all active browser sessions
     */
    listSessions: publicProcedure.query(async () => {
        try {
            const browserbaseService = getBrowserbaseService();
            const sessions = await browserbaseService.listSessions();

            return {
                sessions: sessions.map(session => ({
                    id: session.id,
                    url: session.url,
                    status: session.status,
                    createdAt: session.createdAt,
                })),
            };
        } catch (error) {
            console.error("Failed to list sessions:", error);
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: `Failed to list sessions: ${error instanceof Error ? error.message : "Unknown error"}`,
            });
        }
    }),

    /**
     * Observe a page and get actionable steps
     * Returns an array of actions that can be executed
     */
    observePage: publicProcedure
        .input(
            z.object({
                url: z.string().url(),
                instruction: z.string(),
                geolocation: z.object({
                    city: z.string().optional(),
                    state: z.string().optional(),
                    country: z.string().optional(),
                }).optional(),
                modelName: z.string().optional(),
            })
        )
        .mutation(async ({ input }) => {
            let sessionId: string | undefined;

            try {
                const browserbaseService = getBrowserbaseService();
                const session = input.geolocation
                    ? await browserbaseService.createSessionWithGeoLocation(input.geolocation)
                    : await browserbaseService.createSession();

                sessionId = session.id;
                console.log(`Session created: ${session.url}`);

                const stagehand = new Stagehand({
                    env: "BROWSERBASE",
                    verbose: 1,
                    disablePino: true,
                    model: input.modelName || "google/gemini-2.0-flash",
                    apiKey: process.env.BROWSERBASE_API_KEY,
                    projectId: process.env.BROWSERBASE_PROJECT_ID,
                    browserbaseSessionCreateParams: {
                        projectId: process.env.BROWSERBASE_PROJECT_ID!,
                        proxies: true,
                        region: "us-west-2",
                        timeout: 3600,
                        keepAlive: true,
                        browserSettings: {
                            advancedStealth: false,
                            blockAds: true,
                            solveCaptchas: true,
                            recordSession: false, // No need for recording in observe-only
                            viewport: { width: 1920, height: 1080 },
                        },
                        userMetadata: {
                            userId: "automation-user-observe",
                            environment: process.env.NODE_ENV || "development",
                        },
                    },
                });

                await stagehand.init();
                const page = stagehand.context.pages()[0];

                await page.goto(input.url);

                // Get array of actions that can be executed - observe is called on stagehand in V3
                const actions = await stagehand.observe(input.instruction);

                await stagehand.close();

                return {
                    success: true,
                    actions: actions,
                    sessionId: sessionId,
                    sessionUrl: session.url,
                    instruction: input.instruction,
                };

            } catch (error) {
                console.error("Failed to observe page:", error);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: `Failed to observe page: ${error instanceof Error ? error.message : "Unknown error"}`,
                });
            }
        }),

    /**
     * Execute multiple observed actions sequentially
     * Useful for form filling and multi-step workflows
     */
    executeActions: publicProcedure
        .input(
            z.object({
                url: z.string().url(),
                instruction: z.string(),
                geolocation: z.object({
                    city: z.string().optional(),
                    state: z.string().optional(),
                    country: z.string().optional(),
                }).optional(),
                modelName: z.string().optional(),
            })
        )
        .mutation(async ({ input }) => {
            let sessionId: string | undefined;

            try {
                const browserbaseService = getBrowserbaseService();
                const session = input.geolocation
                    ? await browserbaseService.createSessionWithGeoLocation(input.geolocation)
                    : await browserbaseService.createSession();

                sessionId = session.id;
                console.log(`Session created: ${session.url}`);

                const stagehand = new Stagehand({
                    env: "BROWSERBASE",
                    verbose: 1,
                    disablePino: true,
                    model: input.modelName || "google/gemini-2.0-flash",
                    apiKey: process.env.BROWSERBASE_API_KEY,
                    projectId: process.env.BROWSERBASE_PROJECT_ID,
                    browserbaseSessionCreateParams: {
                        projectId: process.env.BROWSERBASE_PROJECT_ID!,
                        proxies: true,
                        region: "us-west-2",
                        timeout: 3600,
                        keepAlive: true,
                        browserSettings: {
                            advancedStealth: false,
                            blockAds: true,
                            solveCaptchas: true,
                            recordSession: true, // Keep recording for session replay
                            viewport: { width: 1920, height: 1080 },
                        },
                        userMetadata: {
                            userId: "automation-user-execute",
                            environment: process.env.NODE_ENV || "development",
                        },
                    },
                });

                await stagehand.init();
                const page = stagehand.context.pages()[0];

                await page.goto(input.url);

                // Get actions and execute them - both methods called on stagehand in V3
                const actions = await stagehand.observe(input.instruction);
                const executedActions: string[] = [];

                for (const action of actions) {
                    await stagehand.act(action);
                    executedActions.push(typeof action === 'string' ? action : JSON.stringify(action));
                }

                await stagehand.close();

                return {
                    success: true,
                    executedActions,
                    actionCount: executedActions.length,
                    sessionId: sessionId,
                    sessionUrl: session.url,
                };

            } catch (error) {
                console.error("Failed to execute actions:", error);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: `Failed to execute actions: ${error instanceof Error ? error.message : "Unknown error"}`,
                });
            }
        }),

    /**
     * Extract structured data from a page using AI
     * Supports custom Zod schemas for type-safe extraction
     */
    extractData: publicProcedure
        .input(
            z.object({
                url: z.string().url(),
                instruction: z.string(),
                // Schema passed as JSON string since we can't serialize Zod schemas
                schemaType: z.enum(["contactInfo", "productInfo", "custom"]),
                geolocation: z.object({
                    city: z.string().optional(),
                    state: z.string().optional(),
                    country: z.string().optional(),
                }).optional(),
                modelName: z.string().optional(),
            })
        )
        .mutation(async ({ input }) => {
            let sessionId: string | undefined;

            try {
                const browserbaseService = getBrowserbaseService();
                const session = input.geolocation
                    ? await browserbaseService.createSessionWithGeoLocation(input.geolocation)
                    : await browserbaseService.createSession();

                sessionId = session.id;
                console.log(`Session created: ${session.url}`);

                const stagehand = new Stagehand({
                    env: "BROWSERBASE",
                    verbose: 1,
                    disablePino: true,
                    model: input.modelName || "google/gemini-2.0-flash",
                    apiKey: process.env.BROWSERBASE_API_KEY,
                    projectId: process.env.BROWSERBASE_PROJECT_ID,
                    browserbaseSessionCreateParams: {
                        projectId: process.env.BROWSERBASE_PROJECT_ID!,
                        proxies: true,
                        region: "us-west-2",
                        timeout: 3600,
                        keepAlive: true,
                        browserSettings: {
                            advancedStealth: false,
                            blockAds: true,
                            solveCaptchas: true,
                            recordSession: false, // No need for recording in extract-only
                            viewport: { width: 1920, height: 1080 },
                        },
                        userMetadata: {
                            userId: "automation-user-extract",
                            environment: process.env.NODE_ENV || "development",
                        },
                    },
                });

                await stagehand.init();
                const page = stagehand.context.pages()[0];

                await page.goto(input.url);

                // Define schema based on type - extract is called on stagehand in V3
                let extractedData: any;

                if (input.schemaType === "contactInfo") {
                    extractedData = await stagehand.extract(
                        input.instruction,
                        z.object({
                            contactInfo: z.object({
                                email: z.string().optional(),
                                phone: z.string().optional(),
                                address: z.string().optional(),
                            })
                        })
                    );
                } else if (input.schemaType === "productInfo") {
                    extractedData = await stagehand.extract(
                        input.instruction,
                        z.object({
                            productInfo: z.object({
                                name: z.string().optional(),
                                price: z.string().optional(),
                                description: z.string().optional(),
                                availability: z.string().optional(),
                            })
                        })
                    );
                } else {
                    // Generic extraction without schema returns { extraction: string }
                    extractedData = await stagehand.extract(input.instruction);
                }

                await stagehand.close();

                // Persist extracted data to database
                try {
                    // PLACEHOLDER: Replace with actual userId from auth context (e.g., ctx.session.user.id)
                    const placeholderUserId = 1;

                    // Find the browser session in DB to get its database ID
                    let dbSessionId: number | null = null;
                    if (sessionId) {
                        const dbSession = await db.query.browserSessions.findFirst({
                            where: eq(browserSessions.sessionId, sessionId),
                            columns: { id: true },
                        });
                        dbSessionId = dbSession?.id || null;
                    }

                    await db.insert(extractedData).values({
                        userId: placeholderUserId,
                        sessionId: dbSessionId,
                        url: input.url,
                        dataType: input.schemaType,
                        data: extractedData,
                        metadata: {
                            instruction: input.instruction,
                            modelName: input.modelName || "google/gemini-2.0-flash",
                            geolocation: input.geolocation || null,
                        },
                    });
                    console.log(`Extracted data persisted to database for URL: ${input.url}`);
                } catch (dbError) {
                    console.error("Failed to persist extracted data:", dbError);
                    // Don't throw - extraction was successful, just log the DB error
                }

                return {
                    success: true,
                    data: extractedData,
                    sessionId: sessionId,
                    sessionUrl: session.url,
                };

            } catch (error) {
                console.error("Failed to extract data:", error);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: `Failed to extract data: ${error instanceof Error ? error.message : "Unknown error"}`,
                });
            }
        }),

    /**
     * Execute multi-tab workflow
     * Note: Multi-tab replays may be unreliable. Use Live View for monitoring.
     */
    multiTabWorkflow: publicProcedure
        .input(
            z.object({
                tabs: z.array(
                    z.object({
                        url: z.string().url(),
                        instruction: z.string().optional(),
                    })
                ).min(1).max(5), // Limit to 5 tabs for safety
                geolocation: z.object({
                    city: z.string().optional(),
                    state: z.string().optional(),
                    country: z.string().optional(),
                }).optional(),
                modelName: z.string().optional(),
            })
        )
        .mutation(async ({ input }) => {
            let sessionId: string | undefined;

            try {
                const browserbaseService = getBrowserbaseService();
                const session = input.geolocation
                    ? await browserbaseService.createSessionWithGeoLocation(input.geolocation)
                    : await browserbaseService.createSession();

                sessionId = session.id;
                console.log(`Session created: ${session.url}`);

                const stagehand = new Stagehand({
                    env: "BROWSERBASE",
                    verbose: 1,
                    disablePino: true,
                    model: input.modelName || "google/gemini-2.0-flash-exp",
                    apiKey: process.env.BROWSERBASE_API_KEY,
                    projectId: process.env.BROWSERBASE_PROJECT_ID,
                    browserbaseSessionCreateParams: {
                        projectId: process.env.BROWSERBASE_PROJECT_ID!,
                        proxies: true,
                        region: "us-west-2",
                        timeout: 3600,
                        keepAlive: true,
                        browserSettings: {
                            advancedStealth: false,
                            blockAds: true,
                            solveCaptchas: true,
                            recordSession: true, // Keep recording for multi-tab workflows
                            viewport: { width: 1920, height: 1080 },
                        },
                        userMetadata: {
                            userId: "automation-user-multitab",
                            environment: process.env.NODE_ENV || "development",
                        },
                    },
                });

                await stagehand.init();
                const page1 = stagehand.context.pages()[0];

                const tabResults: Array<{
                    tabIndex: number;
                    url: string;
                    success: boolean;
                    message?: string;
                }> = [];

                // Open first tab (already exists)
                await page1.goto(input.tabs[0].url);
                if (input.tabs[0].instruction) {
                    // Execute action on specific page using V3 API
                    await stagehand.act(input.tabs[0].instruction, { page: page1 });
                    tabResults.push({
                        tabIndex: 0,
                        url: input.tabs[0].url,
                        success: true,
                        message: `Executed: ${input.tabs[0].instruction}`,
                    });
                } else {
                    tabResults.push({
                        tabIndex: 0,
                        url: input.tabs[0].url,
                        success: true,
                    });
                }

                // Open additional tabs using V3 context API
                for (let i = 1; i < input.tabs.length; i++) {
                    const tab = input.tabs[i];
                    const newPage = await stagehand.context.newPage();
                    await newPage.goto(tab.url);

                    if (tab.instruction) {
                        // Execute on specific page
                        await stagehand.act(tab.instruction, { page: newPage });
                        tabResults.push({
                            tabIndex: i,
                            url: tab.url,
                            success: true,
                            message: `Executed: ${tab.instruction}`,
                        });
                    } else {
                        tabResults.push({
                            tabIndex: i,
                            url: tab.url,
                            success: true,
                        });
                    }
                }

                await stagehand.close();

                return {
                    success: true,
                    tabs: tabResults,
                    tabCount: input.tabs.length,
                    sessionId: sessionId,
                    sessionUrl: session.url,
                    warning: "Multi-tab replays may be unreliable. Use Browserbase Live View for monitoring.",
                };

            } catch (error) {
                console.error("Failed to execute multi-tab workflow:", error);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: `Failed to execute multi-tab workflow: ${error instanceof Error ? error.message : "Unknown error"}`,
                });
            }
        }),
});

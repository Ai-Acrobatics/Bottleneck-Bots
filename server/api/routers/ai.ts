import { z } from "zod";
import { router, publicProcedure } from "../../_core/trpc";
import { Stagehand } from "@browserbasehq/stagehand";
import { TRPCError } from "@trpc/server";

// Initialize Stagehand
// We initialize it lazily or per request to ensure fresh sessions/cleanup
// But for simplicity in this router, we might want to init it per request or have a singleton if it supports it.
// Stagehand is designed to be used per-task usually.

export const aiRouter = router({
    chat: publicProcedure
        .input(
            z.object({
                messages: z.array(
                    z.object({
                        role: z.enum(["system", "user", "assistant"]),
                        content: z.string(),
                    })
                ),
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

            console.log("Initializing Stagehand...");

            try {
                const stagehand = new Stagehand({
                    env: "BROWSERBASE",
                    apiKey: process.env.BROWSERBASE_API_KEY,
                    projectId: process.env.BROWSERBASE_PROJECT_ID,
                    // We can add verbose logging for debugging
                    verbose: 1,
                });

                await stagehand.init();

                // Get the page instance
                const page = stagehand.context.pages()[0];

                // If the user didn't specify a URL, we might need to start somewhere.
                // But Stagehand agent usually handles navigation.

                // Use the act method for now
                await page.goto("https://google.com");

                const result = await stagehand.act(prompt);

                await stagehand.close();

                return `Executed: ${prompt}\n\nResult: ${result.success ? "Success" : "Failed"}\n\nMessage: ${result.message}`;

            } catch (error) {
                console.error("Stagehand error:", error);
                return `Error executing browser action: ${error instanceof Error ? error.message : "Unknown error"}`;
            }
        }),
});

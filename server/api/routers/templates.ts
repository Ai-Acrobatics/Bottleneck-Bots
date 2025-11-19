import { z } from "zod";
import { router, publicProcedure } from "../../_core/trpc";
import { getDb } from "../../db";
import { automationTemplates } from "../../../drizzle/schema";
import { eq } from "drizzle-orm";

export const templatesRouter = router({
    getAll: publicProcedure.query(async () => {
        const db = await getDb();
        if (!db) throw new Error("Database not initialized");
        return await db.select().from(automationTemplates);
    }),

    execute: publicProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => {
            const db = await getDb();
            if (!db) throw new Error("Database not initialized");
            const [template] = await db
                .select()
                .from(automationTemplates)
                .where(eq(automationTemplates.id, input.id));

            if (!template) {
                throw new Error("Template not found");
            }

            // Here we would trigger the AI agent with the template steps.
            // For now, we return success.
            return { success: true, message: `Executed template: ${template.name}` };
        }),
});

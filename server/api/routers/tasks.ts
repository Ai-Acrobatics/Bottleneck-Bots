import { z } from "zod";
import { router, adminProcedure } from "../../_core/trpc";
import { getDb } from "../../db";
import { scheduledTasks } from "../../../drizzle/schema";
import { eq } from "drizzle-orm";

// Note: scheduledTasks is a system-wide table without userId column.
// Only admins should be able to manage scheduled tasks.
export const tasksRouter = router({
    getAll: adminProcedure.query(async () => {
        const db = await getDb();
        if (!db) throw new Error("Database not initialized");
        return await db.select().from(scheduledTasks);
    }),

    create: adminProcedure
        .input(
            z.object({
                name: z.string(),
                schedule: z.string(),
                config: z.string().optional(),
            })
        )
        .mutation(async ({ input }) => {
            const db = await getDb();
            if (!db) throw new Error("Database not initialized");
            const [newTask] = await db
                .insert(scheduledTasks)
                .values({
                    name: input.name,
                    schedule: input.schedule,
                    config: input.config,
                    status: "active",
                })
                .returning();
            return newTask;
        }),

    toggle: adminProcedure
        .input(z.object({ id: z.number(), status: z.enum(["active", "paused"]) }))
        .mutation(async ({ input }) => {
            const db = await getDb();
            if (!db) throw new Error("Database not initialized");
            const [updatedTask] = await db
                .update(scheduledTasks)
                .set({ status: input.status })
                .where(eq(scheduledTasks.id, input.id))
                .returning();
            return updatedTask;
        }),

    runNow: adminProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => {
            const db = await getDb();
            if (!db) throw new Error("Database not initialized");
            // Logic to execute the task would go here.
            // For now, we just update the lastRun timestamp.
            const [updatedTask] = await db
                .update(scheduledTasks)
                .set({ lastRun: new Date() })
                .where(eq(scheduledTasks.id, input.id))
                .returning();
            return updatedTask;
        }),
});

import { z } from "zod";
import { router, protectedProcedure } from "../../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "../../db";
import { clientProfiles } from "../../../drizzle/schema";
import { eq, and } from "drizzle-orm";

/**
 * Client Profiles Router
 * Manages client profile CRUD operations for mission context
 */

// ========================================
// VALIDATION SCHEMAS
// ========================================

const seoConfigSchema = z.object({
  siteTitle: z.string(),
  metaDescription: z.string(),
  keywords: z.array(z.string()),
  robotsTxt: z.string(),
});

const assetSchema = z.object({
  id: z.string(),
  originalName: z.string(),
  optimizedName: z.string(),
  url: z.string(),
  altText: z.string(),
  contextTag: z.enum(['HERO', 'TEAM', 'TESTIMONIAL', 'PRODUCT', 'LOGO', 'UNKNOWN']),
  status: z.enum(['uploading', 'optimizing', 'ready']),
});

const createClientProfileSchema = z.object({
  name: z.string().min(1, "Client name is required"),
  subaccountName: z.string().optional(),
  subaccountId: z.string().optional(),
  brandVoice: z.string().optional(),
  primaryGoal: z.string().optional(),
  website: z.string().optional(),
  seoConfig: seoConfigSchema.optional(),
  assets: z.array(assetSchema).optional(),
});

const updateClientProfileSchema = createClientProfileSchema.extend({
  id: z.number().int().positive(),
  isActive: z.boolean().optional(),
});

// ========================================
// CLIENT PROFILES ROUTER
// ========================================

export const clientProfilesRouter = router({
  /**
   * List all client profiles for the current user
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const profiles = await db
        .select()
        .from(clientProfiles)
        .where(
          and(
            eq(clientProfiles.userId, ctx.user.id),
            eq(clientProfiles.isActive, true)
          )
        )
        .orderBy(clientProfiles.createdAt);

      return {
        success: true,
        data: profiles,
      };
    } catch (error) {
      console.error("[ClientProfiles] List error:", error);

      if (error instanceof TRPCError) {
        throw error;
      }

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch client profiles",
        cause: error,
      });
    }
  }),

  /**
   * Get a single client profile by ID
   */
  get: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database not available",
          });
        }

        const [profile] = await db
          .select()
          .from(clientProfiles)
          .where(
            and(
              eq(clientProfiles.id, input.id),
              eq(clientProfiles.userId, ctx.user.id)
            )
          )
          .limit(1);

        if (!profile) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Client profile not found",
          });
        }

        return {
          success: true,
          data: profile,
        };
      } catch (error) {
        console.error("[ClientProfiles] Get error:", error);

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch client profile",
          cause: error,
        });
      }
    }),

  /**
   * Create a new client profile
   */
  create: protectedProcedure
    .input(createClientProfileSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database not available",
          });
        }

        const [newProfile] = await db
          .insert(clientProfiles)
          .values({
            userId: ctx.user.id,
            name: input.name,
            subaccountName: input.subaccountName || null,
            subaccountId: input.subaccountId || null,
            brandVoice: input.brandVoice || null,
            primaryGoal: input.primaryGoal || null,
            website: input.website || null,
            seoConfig: input.seoConfig ? JSON.stringify(input.seoConfig) : null,
            assets: input.assets ? JSON.stringify(input.assets) : null,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();

        console.log(`[ClientProfiles] Created profile for user ${ctx.user.id}:`, {
          profileId: newProfile.id,
          name: input.name,
        });

        return {
          success: true,
          message: "Client profile created successfully",
          data: newProfile,
        };
      } catch (error) {
        console.error("[ClientProfiles] Create error:", error);

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create client profile",
          cause: error,
        });
      }
    }),

  /**
   * Update an existing client profile
   */
  update: protectedProcedure
    .input(updateClientProfileSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database not available",
          });
        }

        // Verify ownership
        const [existing] = await db
          .select()
          .from(clientProfiles)
          .where(
            and(
              eq(clientProfiles.id, input.id),
              eq(clientProfiles.userId, ctx.user.id)
            )
          )
          .limit(1);

        if (!existing) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Client profile not found",
          });
        }

        const [updated] = await db
          .update(clientProfiles)
          .set({
            name: input.name,
            subaccountName: input.subaccountName || null,
            subaccountId: input.subaccountId || null,
            brandVoice: input.brandVoice || null,
            primaryGoal: input.primaryGoal || null,
            website: input.website || null,
            seoConfig: input.seoConfig ? JSON.stringify(input.seoConfig) : null,
            assets: input.assets ? JSON.stringify(input.assets) : null,
            isActive: input.isActive !== undefined ? input.isActive : existing.isActive,
            updatedAt: new Date(),
          })
          .where(eq(clientProfiles.id, input.id))
          .returning();

        console.log(`[ClientProfiles] Updated profile ${input.id} for user ${ctx.user.id}`);

        return {
          success: true,
          message: "Client profile updated successfully",
          data: updated,
        };
      } catch (error) {
        console.error("[ClientProfiles] Update error:", error);

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update client profile",
          cause: error,
        });
      }
    }),

  /**
   * Delete (soft delete) a client profile
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database not available",
          });
        }

        // Verify ownership
        const [existing] = await db
          .select()
          .from(clientProfiles)
          .where(
            and(
              eq(clientProfiles.id, input.id),
              eq(clientProfiles.userId, ctx.user.id)
            )
          )
          .limit(1);

        if (!existing) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Client profile not found",
          });
        }

        // Soft delete by setting isActive to false
        await db
          .update(clientProfiles)
          .set({
            isActive: false,
            updatedAt: new Date(),
          })
          .where(eq(clientProfiles.id, input.id));

        console.log(`[ClientProfiles] Deleted profile ${input.id} for user ${ctx.user.id}`);

        return {
          success: true,
          message: "Client profile deleted successfully",
        };
      } catch (error) {
        console.error("[ClientProfiles] Delete error:", error);

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete client profile",
          cause: error,
        });
      }
    }),
});

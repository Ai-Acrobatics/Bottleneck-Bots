import { z } from "zod";
import { router, protectedProcedure } from "../../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "../../db";
import { userProfiles, users, clientProfiles, integrations } from "../../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";
import { s3StorageService } from "../../services/s3-storage.service";

/**
 * Onboarding Router
 * Handles collection of comprehensive business information during user onboarding
 * for upselling opportunities and customer segmentation
 */

// ========================================
// ENCRYPTION HELPERS
// ========================================

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "PLACEHOLDER_ENCRYPTION_KEY_REPLACE_ME_32_BYTES_HEX";
const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;

/**
 * Encrypt sensitive data (GHL API key)
 */
function encrypt(text: string): string {
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(
      ALGORITHM,
      Buffer.from(ENCRYPTION_KEY, "hex"),
      iv
    );

    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    const authTag = cipher.getAuthTag();

    // Format: iv:authTag:encryptedData
    return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
  } catch (error) {
    console.error("Encryption failed:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to encrypt sensitive data",
    });
  }
}

// ========================================
// VALIDATION SCHEMAS
// ========================================

const onboardingDataSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  companyName: z.string().min(1, "Company name is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  industry: z.enum([
    "marketing-agency",
    "real-estate",
    "healthcare",
    "ecommerce",
    "saas",
    "other",
  ]),
  monthlyRevenue: z.enum([
    "0-10k",
    "10k-50k",
    "50k-100k",
    "100k-500k",
    "500k+",
  ]),
  employeeCount: z.enum([
    "just-me",
    "2-5",
    "6-20",
    "21-50",
    "50+",
  ]),
  // Website URL is optional - accepts valid URL, empty string, or undefined
  websiteUrl: z.string().url().optional().or(z.literal("")),
  goals: z.array(z.string()).min(1, "At least one goal is required"),
  otherGoal: z.string().optional(),
  // GHL API key is optional - users can add it later from settings
  ghlApiKey: z.string().optional().or(z.literal("")),
});

// ========================================
// ONBOARDING ROUTER
// ========================================

export const onboardingRouter = router({
  /**
   * Validate GoHighLevel API key
   * Tests the API key by making a real call to GHL's API
   */
  validateGHLApiKey: protectedProcedure
    .input(z.object({
      apiKey: z.string().min(1, "API key is required"),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Import the validation service
        const { apiKeyValidationService } = await import("../../services/apiKeyValidation.service");

        console.log(`[Onboarding] Validating GHL API key for user ${ctx.user.id}`);

        // Validate the API key with real GHL API call
        const result = await apiKeyValidationService.validateGohighlevel(input.apiKey);

        return {
          success: result.valid,
          message: result.message,
          details: result.details,
        };
      } catch (error) {
        console.error("[Onboarding] GHL API key validation error:", error);

        return {
          success: false,
          message: error instanceof Error
            ? error.message
            : "Failed to validate API key. Please try again.",
        };
      }
    }),

  /**
   * Submit onboarding data
   * Creates or updates user profile with collected business information
   */
  submit: protectedProcedure
    .input(onboardingDataSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database not available",
          });
        }

        // Encrypt the GHL API key only if provided
        const encryptedApiKey = input.ghlApiKey && input.ghlApiKey.trim()
          ? encrypt(input.ghlApiKey)
          : null;

        // Prepare goals array (include other goal if specified)
        const goals = [...input.goals];
        if (input.otherGoal && input.otherGoal.trim()) {
          goals.push(input.otherGoal);
        }

        // Check if profile already exists
        const [existingProfile] = await db
          .select()
          .from(userProfiles)
          .where(eq(userProfiles.userId, ctx.user.id))
          .limit(1);

        if (existingProfile) {
          // Update existing profile
          await db
            .update(userProfiles)
            .set({
              companyName: input.companyName,
              industry: input.industry,
              monthlyRevenue: input.monthlyRevenue,
              employeeCount: input.employeeCount,
              website: input.websiteUrl || null,
              phone: input.phoneNumber,
              goals: JSON.stringify(goals),
              ghlApiKey: encryptedApiKey,
              updatedAt: new Date(),
            })
            .where(eq(userProfiles.userId, ctx.user.id));
        } else {
          // Create new profile
          await db.insert(userProfiles).values({
            userId: ctx.user.id,
            companyName: input.companyName,
            industry: input.industry,
            monthlyRevenue: input.monthlyRevenue,
            employeeCount: input.employeeCount,
            website: input.websiteUrl || null,
            phone: input.phoneNumber,
            goals: JSON.stringify(goals),
            ghlApiKey: encryptedApiKey,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }

        // Update user's name and mark onboarding as completed
        await db
          .update(users)
          .set({
            name: input.fullName,
            onboardingCompleted: true,
            updatedAt: new Date(),
          })
          .where(eq(users.id, ctx.user.id));

        // TODO: Trigger post-onboarding actions:
        // - Send welcome email with personalized content based on industry/goals
        // - Create initial GHL sub-account discovery job
        // - Notify sales team of high-value lead (based on revenue/employee count)
        // - Set up recommended automation templates based on goals
        // - Track onboarding completion event in analytics

        console.log(`[Onboarding] User ${ctx.user.id} completed onboarding`, {
          companyName: input.companyName,
          industry: input.industry,
          monthlyRevenue: input.monthlyRevenue,
          employeeCount: input.employeeCount,
          goals: goals.length,
        });

        return {
          success: true,
          message: "Onboarding completed successfully",
          data: {
            companyName: input.companyName,
            industry: input.industry,
          },
        };
      } catch (error) {
        console.error("[Onboarding] Error:", error);

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to save onboarding data",
          cause: error,
        });
      }
    }),

  /**
   * Get user profile data
   * Returns existing onboarding data if available
   */
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const [profile] = await db
        .select({
          id: userProfiles.id,
          companyName: userProfiles.companyName,
          industry: userProfiles.industry,
          monthlyRevenue: userProfiles.monthlyRevenue,
          employeeCount: userProfiles.employeeCount,
          website: userProfiles.website,
          phone: userProfiles.phone,
          goals: userProfiles.goals,
          createdAt: userProfiles.createdAt,
          updatedAt: userProfiles.updatedAt,
        })
        .from(userProfiles)
        .where(eq(userProfiles.userId, ctx.user.id))
        .limit(1);

      if (!profile) {
        return {
          exists: false,
          data: null,
        };
      }

      return {
        exists: true,
        data: {
          ...profile,
          goals: typeof profile.goals === "string"
            ? JSON.parse(profile.goals)
            : profile.goals,
        },
      };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch profile",
        cause: error,
      });
    }
  }),

  /**
   * Check onboarding status
   * Returns whether user has completed onboarding
   */
  getStatus: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const [user] = await db
        .select({
          onboardingCompleted: users.onboardingCompleted,
        })
        .from(users)
        .where(eq(users.id, ctx.user.id))
        .limit(1);

      return {
        completed: user?.onboardingCompleted || false,
      };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to check onboarding status",
        cause: error,
      });
    }
  }),

  /**
   * Upload brand assets (logo and guidelines) to S3
   * Returns URLs for uploaded assets
   */
  uploadBrandAssets: protectedProcedure
    .input(z.object({
      logoBase64: z.string().optional(),
      logoMimeType: z.string().optional(),
      logoFileName: z.string().optional(),
      guidelinesBase64: z.array(z.object({
        data: z.string(),
        mimeType: z.string(),
        fileName: z.string(),
      })).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const uploadedAssets: Array<{
          id: string;
          originalName: string;
          optimizedName: string;
          url: string;
          altText: string;
          contextTag: 'LOGO' | 'HERO' | 'TEAM' | 'TESTIMONIAL' | 'PRODUCT' | 'UNKNOWN';
          status: 'ready';
        }> = [];

        // Upload logo if provided
        if (input.logoBase64 && input.logoMimeType && input.logoFileName) {
          const logoBuffer = Buffer.from(input.logoBase64, 'base64');
          const logoKey = `users/${ctx.user.id}/brand/logo/${Date.now()}-${input.logoFileName}`;

          const logoUrl = await s3StorageService.uploadFile(
            logoKey,
            logoBuffer,
            input.logoMimeType,
            { userId: String(ctx.user.id), type: 'logo' }
          );

          uploadedAssets.push({
            id: crypto.randomUUID(),
            originalName: input.logoFileName,
            optimizedName: input.logoFileName,
            url: logoUrl,
            altText: 'Company Logo',
            contextTag: 'LOGO',
            status: 'ready',
          });

          console.log(`[Onboarding] Uploaded logo for user ${ctx.user.id}: ${logoKey}`);
        }

        // Upload brand guidelines if provided
        if (input.guidelinesBase64 && input.guidelinesBase64.length > 0) {
          for (const guideline of input.guidelinesBase64) {
            const guidelineBuffer = Buffer.from(guideline.data, 'base64');
            const guidelineKey = `users/${ctx.user.id}/brand/guidelines/${Date.now()}-${guideline.fileName}`;

            const guidelineUrl = await s3StorageService.uploadFile(
              guidelineKey,
              guidelineBuffer,
              guideline.mimeType,
              { userId: String(ctx.user.id), type: 'guideline' }
            );

            uploadedAssets.push({
              id: crypto.randomUUID(),
              originalName: guideline.fileName,
              optimizedName: guideline.fileName,
              url: guidelineUrl,
              altText: `Brand Guideline: ${guideline.fileName}`,
              contextTag: 'UNKNOWN',
              status: 'ready',
            });

            console.log(`[Onboarding] Uploaded guideline for user ${ctx.user.id}: ${guidelineKey}`);
          }
        }

        return {
          success: true,
          message: `Uploaded ${uploadedAssets.length} brand asset(s)`,
          assets: uploadedAssets,
        };
      } catch (error) {
        console.error("[Onboarding] Brand asset upload error:", error);

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to upload brand assets",
          cause: error,
        });
      }
    }),

  /**
   * Save brand voice to user's default client profile
   * Creates a client profile if none exists
   */
  saveBrandVoice: protectedProcedure
    .input(z.object({
      brandVoice: z.string().min(1, "Brand voice is required"),
      companyName: z.string().optional(),
      assets: z.array(z.object({
        id: z.string(),
        originalName: z.string(),
        optimizedName: z.string(),
        url: z.string(),
        altText: z.string(),
        contextTag: z.enum(['HERO', 'TEAM', 'TESTIMONIAL', 'PRODUCT', 'LOGO', 'UNKNOWN']),
        status: z.enum(['uploading', 'optimizing', 'ready']),
      })).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database not available",
          });
        }

        // Check if user has a client profile
        const [existingProfile] = await db
          .select()
          .from(clientProfiles)
          .where(
            and(
              eq(clientProfiles.userId, ctx.user.id),
              eq(clientProfiles.isActive, true)
            )
          )
          .limit(1);

        if (existingProfile) {
          // Update existing profile with brand voice and assets
          const existingAssets = existingProfile.assets
            ? (typeof existingProfile.assets === 'string'
                ? JSON.parse(existingProfile.assets)
                : existingProfile.assets)
            : [];

          const mergedAssets = input.assets
            ? [...existingAssets, ...input.assets]
            : existingAssets;

          await db
            .update(clientProfiles)
            .set({
              brandVoice: input.brandVoice,
              assets: JSON.stringify(mergedAssets),
              updatedAt: new Date(),
            })
            .where(eq(clientProfiles.id, existingProfile.id));

          console.log(`[Onboarding] Updated brand voice for user ${ctx.user.id}, profile ${existingProfile.id}`);
        } else {
          // Create new client profile with brand voice
          const profileName = input.companyName || 'My Company';

          await db.insert(clientProfiles).values({
            userId: ctx.user.id,
            name: profileName,
            brandVoice: input.brandVoice,
            assets: input.assets ? JSON.stringify(input.assets) : null,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          });

          console.log(`[Onboarding] Created client profile with brand voice for user ${ctx.user.id}`);
        }

        return {
          success: true,
          message: "Brand voice saved successfully",
        };
      } catch (error) {
        console.error("[Onboarding] Save brand voice error:", error);

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to save brand voice",
          cause: error,
        });
      }
    }),

  /**
   * Initialize selected integrations
   * Creates integration placeholders for selected services
   */
  initializeIntegrations: protectedProcedure
    .input(z.object({
      integrations: z.array(z.string()),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database not available",
          });
        }

        const initializedIntegrations: string[] = [];

        for (const service of input.integrations) {
          // Check if integration already exists
          const [existing] = await db
            .select()
            .from(integrations)
            .where(
              and(
                eq(integrations.userId, ctx.user.id),
                eq(integrations.service, service)
              )
            )
            .limit(1);

          if (!existing) {
            // Create placeholder integration record
            await db.insert(integrations).values({
              userId: ctx.user.id,
              service,
              isActive: "false", // Not yet connected
              metadata: JSON.stringify({
                status: 'pending_setup',
                addedDuringOnboarding: true,
                addedAt: new Date().toISOString(),
              }),
              createdAt: new Date(),
              updatedAt: new Date(),
            });

            initializedIntegrations.push(service);
            console.log(`[Onboarding] Initialized integration ${service} for user ${ctx.user.id}`);
          }
        }

        return {
          success: true,
          message: `Initialized ${initializedIntegrations.length} integration(s)`,
          integrations: initializedIntegrations,
        };
      } catch (error) {
        console.error("[Onboarding] Initialize integrations error:", error);

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to initialize integrations",
          cause: error,
        });
      }
    }),
});

import { z } from "zod";
import { publicProcedure, router } from "../../_core/trpc";
import { adsService } from "../../services/ads.service";
import { getDb } from "../../db";
import {
  adAnalyses,
  adRecommendations,
  adCopyVariations,
  adAutomationHistory,
} from "../../../drizzle/schema";

/**
 * Ad Manager Router
 * Handles Meta Ads analysis and automation via browser agents
 */
export const adsRouter = router({
  // ========================================
  // ANALYSIS ENDPOINTS
  // ========================================

  /**
   * Analyze ad screenshot using GPT-4 Vision
   */
  analyzeAdScreenshot: publicProcedure
    .input(
      z.object({
        screenshotUrl: z.string().url(),
        adId: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const userId = ctx.user?.id;
        if (!userId) {
          throw new Error("User not authenticated");
        }

        // Analyze screenshot using GPT-4 Vision
        const analysis = await adsService.analyzeAdScreenshot(input.screenshotUrl);

        // Store analysis in database
        const db = await getDb();
        if (db) {
          await db.insert(adAnalyses).values({
            userId,
            adId: input.adId || null,
            screenshotUrl: input.screenshotUrl,
            impressions: analysis.metrics.impressions || null,
            clicks: analysis.metrics.clicks || null,
            ctr: analysis.metrics.ctr?.toString() || null,
            cpc: analysis.metrics.cpc?.toString() || null,
            spend: analysis.metrics.spend?.toString() || null,
            conversions: analysis.metrics.conversions || null,
            roas: analysis.metrics.roas?.toString() || null,
            insights: analysis.insights,
            suggestions: analysis.suggestions,
            sentiment: analysis.sentiment,
            confidence: analysis.confidence.toString(),
            rawAnalysis: analysis,
          });
        }

        return {
          success: true,
          analysis,
        };
      } catch (error) {
        console.error("[AdsRouter] Failed to analyze screenshot:", error);
        return {
          success: false,
          message: error instanceof Error ? error.message : "Failed to analyze screenshot",
        };
      }
    }),

  /**
   * Get AI recommendations for ad improvements
   */
  getAdRecommendations: publicProcedure
    .input(
      z.object({
        metrics: z.object({
          impressions: z.number().optional(),
          clicks: z.number().optional(),
          ctr: z.number().optional(),
          cpc: z.number().optional(),
          spend: z.number().optional(),
          conversions: z.number().optional(),
          roas: z.number().optional(),
        }),
        adContent: z
          .object({
            headline: z.string().optional(),
            primaryText: z.string().optional(),
            description: z.string().optional(),
            targetAudience: z.string().optional(),
          })
          .optional(),
        adId: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const userId = ctx.user?.id;
        if (!userId) {
          throw new Error("User not authenticated");
        }

        // Get recommendations from service
        const recommendations = await adsService.getAdRecommendations(input.metrics, input.adContent);

        // Store recommendations in database
        const db = await getDb();
        if (db) {
          for (const rec of recommendations) {
            await db.insert(adRecommendations).values({
              userId,
              adId: input.adId || null,
              type: rec.type,
              priority: rec.priority,
              title: rec.title,
              description: rec.description,
              expectedImpact: rec.expectedImpact,
              actionable: rec.actionable ? "true" : "false",
              status: "pending",
            });
          }
        }

        return {
          success: true,
          recommendations,
        };
      } catch (error) {
        console.error("[AdsRouter] Failed to get recommendations:", error);
        return {
          success: false,
          message: error instanceof Error ? error.message : "Failed to get recommendations",
        };
      }
    }),

  /**
   * Generate ad copy variations using LLM
   */
  generateAdCopy: publicProcedure
    .input(
      z.object({
        currentCopy: z.string(),
        targetAudience: z.string().optional(),
        tone: z.string().optional(),
        objective: z.string().optional(),
        variationCount: z.number().min(1).max(10).optional(),
        adId: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const userId = ctx.user?.id;
        if (!userId) {
          throw new Error("User not authenticated");
        }

        // Generate copy variations
        const variations = await adsService.generateAdCopy(input.currentCopy, {
          targetAudience: input.targetAudience,
          tone: input.tone,
          objective: input.objective,
          variationCount: input.variationCount,
        });

        // Store variations in database
        const db = await getDb();
        if (db) {
          for (let i = 0; i < variations.length; i++) {
            const variation = variations[i];
            await db.insert(adCopyVariations).values({
              userId,
              originalAdId: input.adId || null,
              headline: variation.headline,
              primaryText: variation.primaryText,
              description: variation.description || null,
              callToAction: variation.callToAction || null,
              reasoning: variation.reasoning,
              variationNumber: i + 1,
              targetAudience: input.targetAudience || null,
              tone: input.tone || null,
              objective: input.objective || null,
              status: "draft",
            });
          }
        }

        return {
          success: true,
          variations,
        };
      } catch (error) {
        console.error("[AdsRouter] Failed to generate ad copy:", error);
        return {
          success: false,
          message: error instanceof Error ? error.message : "Failed to generate ad copy",
        };
      }
    }),

  // ========================================
  // AD MANAGEMENT ENDPOINTS
  // ========================================

  /**
   * List connected Meta ad accounts
   */
  listAdAccounts: publicProcedure.query(async ({ ctx }) => {
    try {
      const userId = ctx.user?.id;
      if (!userId) {
        throw new Error("User not authenticated");
      }

      const accounts = await adsService.listAdAccounts(userId);

      return {
        success: true,
        accounts,
      };
    } catch (error) {
      console.error("[AdsRouter] Failed to list ad accounts:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to list ad accounts",
        accounts: [],
      };
    }
  }),

  /**
   * Get campaigns from Meta
   */
  getAdCampaigns: publicProcedure
    .input(
      z.object({
        adAccountId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const userId = ctx.user?.id;
        if (!userId) {
          throw new Error("User not authenticated");
        }

        const campaigns = await adsService.getAdCampaigns(input.adAccountId, userId);

        return {
          success: true,
          campaigns,
        };
      } catch (error) {
        console.error("[AdsRouter] Failed to get campaigns:", error);
        return {
          success: false,
          message: error instanceof Error ? error.message : "Failed to get campaigns",
          campaigns: [],
        };
      }
    }),

  /**
   * Get ad sets from Meta
   */
  getAdSets: publicProcedure
    .input(
      z.object({
        campaignId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const userId = ctx.user?.id;
        if (!userId) {
          throw new Error("User not authenticated");
        }

        const adSets = await adsService.getAdSets(input.campaignId, userId);

        return {
          success: true,
          adSets,
        };
      } catch (error) {
        console.error("[AdsRouter] Failed to get ad sets:", error);
        return {
          success: false,
          message: error instanceof Error ? error.message : "Failed to get ad sets",
          adSets: [],
        };
      }
    }),

  /**
   * Get individual ads from Meta
   */
  getAds: publicProcedure
    .input(
      z.object({
        adSetId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const userId = ctx.user?.id;
        if (!userId) {
          throw new Error("User not authenticated");
        }

        const ads = await adsService.getAds(input.adSetId, userId);

        return {
          success: true,
          ads,
        };
      } catch (error) {
        console.error("[AdsRouter] Failed to get ads:", error);
        return {
          success: false,
          message: error instanceof Error ? error.message : "Failed to get ads",
          ads: [],
        };
      }
    }),

  /**
   * Get ad performance metrics from Meta
   */
  getAdMetrics: publicProcedure
    .input(
      z.object({
        adId: z.string(),
        dateRange: z
          .object({
            since: z.string(),
            until: z.string(),
          })
          .optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const userId = ctx.user?.id;
        if (!userId) {
          throw new Error("User not authenticated");
        }

        const metrics = await adsService.getAdMetrics(input.adId, userId, input.dateRange);

        return {
          success: true,
          metrics,
        };
      } catch (error) {
        console.error("[AdsRouter] Failed to get ad metrics:", error);
        return {
          success: false,
          message: error instanceof Error ? error.message : "Failed to get ad metrics",
          metrics: {},
        };
      }
    }),

  // ========================================
  // AUTOMATION ENDPOINTS
  // ========================================

  /**
   * Connect Meta account via OAuth
   */
  connectMetaAccount: publicProcedure
    .input(
      z.object({
        accessToken: z.string(),
        refreshToken: z.string().optional(),
        expiresIn: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const userId = ctx.user?.id;
        if (!userId) {
          throw new Error("User not authenticated");
        }

        await adsService.connectMetaAccount(userId, input.accessToken, input.refreshToken, input.expiresIn);

        return {
          success: true,
          message: "Meta account connected successfully",
        };
      } catch (error) {
        console.error("[AdsRouter] Failed to connect Meta account:", error);
        return {
          success: false,
          message: error instanceof Error ? error.message : "Failed to connect Meta account",
        };
      }
    }),

  /**
   * Apply recommendation via browser automation
   */
  applyRecommendation: publicProcedure
    .input(
      z.object({
        adId: z.string(),
        changes: z.object({
          headline: z.string().optional(),
          primaryText: z.string().optional(),
          description: z.string().optional(),
        }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const userId = ctx.user?.id;
        if (!userId) {
          throw new Error("User not authenticated");
        }

        const result = await adsService.applyRecommendation(userId, input.adId, input.changes);

        // Store automation history
        const db = await getDb();
        if (db) {
          await db.insert(adAutomationHistory).values({
            userId,
            adId: input.adId,
            actionType: "apply_changes",
            changes: input.changes,
            status: result.success ? "completed" : "failed",
            sessionId: result.sessionId || null,
            result: result,
            completedAt: result.success ? new Date() : null,
          });
        }

        return result;
      } catch (error) {
        console.error("[AdsRouter] Failed to apply recommendation:", error);
        return {
          success: false,
          message: error instanceof Error ? error.message : "Failed to apply recommendation",
        };
      }
    }),
});

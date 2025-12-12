import { z } from "zod";
import { publicProcedure, router } from "../../_core/trpc";
import { seoService } from "../../services/seo.service";
import { pdfReportService } from "../../services/pdf-report.service";
import { CreditService } from "../../services/credit.service";

const creditService = new CreditService();

/**
 * SEO & Reports Router
 * Handles website analysis, keyword research, rankings, backlinks, heatmaps, and PDF reports
 */
export const seoRouter = router({
    /**
     * Full SEO audit of a website
     */
    analyzeWebsite: publicProcedure
        .input(
            z.object({
                url: z.string().url(),
                userId: z.number().optional(),
            })
        )
        .mutation(async ({ input }) => {
            try {
                // Check credits if userId provided
                if (input.userId) {
                    const hasCredits = await creditService.checkBalance(input.userId, "scraping", 1);
                    if (!hasCredits) {
                        return {
                            success: false,
                            message: "Insufficient credits",
                            data: null,
                        };
                    }
                }

                const analysis = await seoService.analyzeWebsite(input.url, input.userId);

                // Deduct credits
                if (input.userId) {
                    await creditService.deductCredits(
                        input.userId,
                        1,
                        "scraping",
                        `SEO analysis for ${input.url}`,
                        undefined,
                        "seo_analysis"
                    );
                }

                return {
                    success: true,
                    message: "Analysis completed successfully",
                    data: analysis,
                };
            } catch (error) {
                console.error("[SEO Router] analyzeWebsite error:", error);
                return {
                    success: false,
                    message: error instanceof Error ? error.message : "Analysis failed",
                    data: null,
                };
            }
        }),

    /**
     * Get keyword suggestions for a topic
     */
    getKeywordSuggestions: publicProcedure
        .input(
            z.object({
                topic: z.string().min(1),
                count: z.number().min(1).max(50).default(20),
            })
        )
        .mutation(async ({ input }) => {
            try {
                const keywords = await seoService.getKeywordSuggestions(input.topic, input.count);

                return {
                    success: true,
                    message: "Keyword suggestions generated",
                    data: keywords,
                };
            } catch (error) {
                console.error("[SEO Router] getKeywordSuggestions error:", error);
                return {
                    success: false,
                    message: error instanceof Error ? error.message : "Failed to generate suggestions",
                    data: [],
                };
            }
        }),

    /**
     * Check keyword rankings for a website
     */
    checkRankings: publicProcedure
        .input(
            z.object({
                url: z.string().url(),
                keywords: z.array(z.string()).min(1),
                searchEngine: z.enum(["google", "bing"]).default("google"),
                location: z.string().default("United States"),
            })
        )
        .mutation(async ({ input }) => {
            try {
                const rankings = await seoService.checkRankings(
                    input.url,
                    input.keywords,
                    input.searchEngine,
                    input.location
                );

                return {
                    success: true,
                    message: "Rankings checked successfully",
                    data: rankings,
                };
            } catch (error) {
                console.error("[SEO Router] checkRankings error:", error);
                return {
                    success: false,
                    message: error instanceof Error ? error.message : "Failed to check rankings",
                    data: [],
                };
            }
        }),

    /**
     * Get backlink analysis
     */
    getBacklinks: publicProcedure
        .input(
            z.object({
                url: z.string().url(),
            })
        )
        .mutation(async ({ input }) => {
            try {
                const backlinks = await seoService.getBacklinks(input.url);

                return {
                    success: true,
                    message: "Backlink analysis completed",
                    data: backlinks,
                };
            } catch (error) {
                console.error("[SEO Router] getBacklinks error:", error);
                return {
                    success: false,
                    message: error instanceof Error ? error.message : "Failed to analyze backlinks",
                    data: null,
                };
            }
        }),

    /**
     * Generate PDF SEO report
     */
    generateReport: publicProcedure
        .input(
            z.object({
                url: z.string().url(),
                userId: z.number().optional(),
                options: z
                    .object({
                        title: z.string().optional(),
                        includeCharts: z.boolean().default(true),
                        includeRecommendations: z.boolean().default(true),
                        brandLogo: z.string().optional(),
                        brandName: z.string().optional(),
                    })
                    .optional(),
            })
        )
        .mutation(async ({ input }) => {
            try {
                // Check credits if userId provided
                if (input.userId) {
                    const hasCredits = await creditService.checkBalance(input.userId, "scraping", 2);
                    if (!hasCredits) {
                        return {
                            success: false,
                            message: "Insufficient credits (2 credits required for report generation)",
                            reportUrl: null,
                        };
                    }
                }

                // First, analyze the website
                const analysis = await seoService.analyzeWebsite(input.url, input.userId);

                // Generate PDF report
                const pdfBuffer = await pdfReportService.generateSEOReport(analysis, input.options || {});

                // In a real implementation, upload to S3 or save to disk
                // For now, we'll return a base64 encoded version
                const reportUrl = `data:application/pdf;base64,${pdfBuffer.toString("base64")}`;

                // Deduct credits
                if (input.userId) {
                    await creditService.deductCredits(
                        input.userId,
                        2,
                        "scraping",
                        `SEO report generation for ${input.url}`,
                        undefined,
                        "seo_report"
                    );
                }

                return {
                    success: true,
                    message: "Report generated successfully",
                    reportUrl,
                    creditsUsed: 2,
                };
            } catch (error) {
                console.error("[SEO Router] generateReport error:", error);
                return {
                    success: false,
                    message: error instanceof Error ? error.message : "Failed to generate report",
                    reportUrl: null,
                };
            }
        }),

    /**
     * List generated reports
     */
    listReports: publicProcedure
        .input(
            z.object({
                userId: z.number().optional(),
                limit: z.number().min(1).max(100).default(20),
            })
        )
        .query(async ({ input }) => {
            try {
                const reports = await seoService.getReports(input.userId, input.limit);

                return {
                    success: true,
                    reports,
                    total: reports.length,
                };
            } catch (error) {
                console.error("[SEO Router] listReports error:", error);
                return {
                    success: false,
                    reports: [],
                    total: 0,
                };
            }
        }),

    /**
     * Get a specific report
     */
    getReport: publicProcedure
        .input(
            z.object({
                reportId: z.number(),
            })
        )
        .query(async ({ input }) => {
            try {
                const report = await seoService.getReport(input.reportId);

                if (!report) {
                    return {
                        success: false,
                        message: "Report not found",
                        data: null,
                    };
                }

                return {
                    success: true,
                    message: "Report retrieved successfully",
                    data: report,
                };
            } catch (error) {
                console.error("[SEO Router] getReport error:", error);
                return {
                    success: false,
                    message: error instanceof Error ? error.message : "Failed to retrieve report",
                    data: null,
                };
            }
        }),

    /**
     * Schedule recurring reports
     */
    scheduleReport: publicProcedure
        .input(
            z.object({
                url: z.string().url(),
                userId: z.number(),
                frequency: z.enum(["daily", "weekly", "monthly"]),
                recipients: z.array(z.string().email()).optional(),
            })
        )
        .mutation(async ({ input }) => {
            try {
                // This would integrate with the scheduled tasks system
                // For now, return a placeholder response
                return {
                    success: true,
                    message: `Report scheduled ${input.frequency} for ${input.url}`,
                    scheduleId: `schedule_${Date.now()}`,
                };
            } catch (error) {
                console.error("[SEO Router] scheduleReport error:", error);
                return {
                    success: false,
                    message: error instanceof Error ? error.message : "Failed to schedule report",
                    scheduleId: null,
                };
            }
        }),

    /**
     * Get heatmap data for a URL
     */
    getHeatmapData: publicProcedure
        .input(
            z.object({
                url: z.string().url(),
                dateRange: z
                    .object({
                        start: z.string(),
                        end: z.string(),
                    })
                    .optional(),
            })
        )
        .query(async ({ input }) => {
            try {
                const dateRange = input.dateRange
                    ? {
                          start: new Date(input.dateRange.start),
                          end: new Date(input.dateRange.end),
                      }
                    : undefined;

                const heatmapData = await seoService.getHeatmapData(input.url, dateRange);

                return {
                    success: true,
                    message: "Heatmap data retrieved",
                    data: heatmapData,
                };
            } catch (error) {
                console.error("[SEO Router] getHeatmapData error:", error);
                return {
                    success: false,
                    message: error instanceof Error ? error.message : "Failed to retrieve heatmap data",
                    data: null,
                };
            }
        }),

    /**
     * Setup tracking script for heatmaps
     */
    setupTracking: publicProcedure
        .input(
            z.object({
                url: z.string().url(),
            })
        )
        .mutation(async ({ input }) => {
            try {
                const tracking = await seoService.setupTracking(input.url);

                return {
                    success: true,
                    message: "Tracking script generated",
                    data: tracking,
                };
            } catch (error) {
                console.error("[SEO Router] setupTracking error:", error);
                return {
                    success: false,
                    message: error instanceof Error ? error.message : "Failed to setup tracking",
                    data: null,
                };
            }
        }),
});

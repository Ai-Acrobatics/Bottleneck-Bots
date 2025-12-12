/**
 * SEO Service
 * Handles website analysis, keyword research, rankings, backlinks, and report generation
 */

import { browserbaseSDK } from "../_core/browserbaseSDK";
import { invokeLLM } from "../_core/llm";
import { getDb } from "../db";
import { jobs } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import type { Page } from "puppeteer-core";
import puppeteer from "puppeteer-core";

// Types
export interface SEOAnalysisResult {
  url: string;
  title: string;
  metaDescription: string;
  metaKeywords: string;
  headings: {
    h1: string[];
    h2: string[];
    h3: string[];
  };
  images: {
    total: number;
    withAlt: number;
    withoutAlt: number;
    issues: string[];
  };
  links: {
    internal: number;
    external: number;
    broken: number[];
  };
  performance: {
    loadTime: number;
    pageSize: number;
    requests: number;
  };
  technicalSEO: {
    hasRobotsTxt: boolean;
    hasSitemap: boolean;
    isResponsive: boolean;
    hasSSL: boolean;
    canonicalUrl: string | null;
    structuredData: any[];
  };
  contentAnalysis: {
    wordCount: number;
    readabilityScore: number;
    keywordDensity: Record<string, number>;
  };
  aiInsights: string;
  score: number;
  recommendations: string[];
}

export interface KeywordSuggestion {
  keyword: string;
  searchVolume: number;
  difficulty: number;
  cpc: number;
  trend: "up" | "down" | "stable";
  relatedKeywords: string[];
}

export interface RankingResult {
  keyword: string;
  position: number | null;
  url: string;
  previousPosition: number | null;
  change: number;
  searchEngine: "google" | "bing";
  location: string;
}

export interface BacklinkData {
  url: string;
  domainAuthority: number;
  totalBacklinks: number;
  uniqueDomains: number;
  topBacklinks: Array<{
    sourceUrl: string;
    sourceDomain: string;
    anchorText: string;
    domainRating: number;
    isDoFollow: boolean;
    firstSeen: Date;
  }>;
  toxicBacklinks: number;
  newBacklinks: number;
  lostBacklinks: number;
}

export interface HeatmapData {
  url: string;
  sessionId: string;
  clicks: Array<{
    x: number;
    y: number;
    element: string;
    timestamp: Date;
  }>;
  scrollDepth: Array<{
    depth: number;
    percentage: number;
    timestamp: Date;
  }>;
  heatmapImageUrl: string;
  analytics: {
    averageScrollDepth: number;
    mostClickedElements: Array<{ element: string; clicks: number }>;
    bounceRate: number;
    averageTimeOnPage: number;
  };
}

export class SEOService {
  /**
   * Analyze a website for SEO
   */
  async analyzeWebsite(url: string, userId?: number): Promise<SEOAnalysisResult> {
    console.log(`[SEOService] Starting analysis for ${url}`);

    // Create a Browserbase session
    const session = await browserbaseSDK.createSession({
      recordSession: true,
    });

    try {
      // Connect to the session using Puppeteer
      const browser = await puppeteer.connect({
        browserWSEndpoint: session.wsUrl!,
      });

      const page = await browser.pages().then((pages) => pages[0]);

      const startTime = Date.now();
      await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
      const loadTime = Date.now() - startTime;

      // Extract SEO data
      const seoData = await this.extractSEOData(page, url);

      // Get performance metrics
      const performance = await this.getPerformanceMetrics(page, loadTime);

      // Check technical SEO
      const technicalSEO = await this.checkTechnicalSEO(url, page);

      // Analyze content
      const contentAnalysis = await this.analyzeContent(page);

      await browser.disconnect();

      // Use LLM to generate insights
      const aiInsights = await this.generateAIInsights({
        ...seoData,
        performance,
        technicalSEO,
        contentAnalysis,
      });

      // Calculate overall score
      const score = this.calculateSEOScore({
        ...seoData,
        performance,
        technicalSEO,
        contentAnalysis,
      });

      // Generate recommendations
      const recommendations = this.generateRecommendations({
        ...seoData,
        performance,
        technicalSEO,
        contentAnalysis,
        score,
      });

      const result: SEOAnalysisResult = {
        url,
        ...seoData,
        performance,
        technicalSEO,
        contentAnalysis,
        aiInsights,
        score,
        recommendations,
      };

      // Store in jobs table
      if (userId) {
        await this.storeAnalysisJob(userId, url, result);
      }

      return result;
    } finally {
      // Clean up the session
      await browserbaseSDK.terminateSession(session.id);
    }
  }

  /**
   * Extract SEO data from page
   */
  private async extractSEOData(page: Page, url: string) {
    return await page.evaluate(() => {
      // Title
      const title = document.title || "";

      // Meta tags
      const metaDescription =
        document.querySelector('meta[name="description"]')?.getAttribute("content") || "";
      const metaKeywords =
        document.querySelector('meta[name="keywords"]')?.getAttribute("content") || "";

      // Headings
      const h1Elements = Array.from(document.querySelectorAll("h1")).map((h) => h.textContent || "");
      const h2Elements = Array.from(document.querySelectorAll("h2")).map((h) => h.textContent || "");
      const h3Elements = Array.from(document.querySelectorAll("h3")).map((h) => h.textContent || "");

      // Images
      const images = Array.from(document.querySelectorAll("img"));
      const imagesWithAlt = images.filter((img) => img.alt && img.alt.trim() !== "");
      const imagesWithoutAlt = images.filter((img) => !img.alt || img.alt.trim() === "");

      const imageIssues: string[] = [];
      if (imagesWithoutAlt.length > 0) {
        imageIssues.push(`${imagesWithoutAlt.length} images missing alt text`);
      }

      // Links
      const links = Array.from(document.querySelectorAll("a[href]"));
      const currentDomain = window.location.hostname;
      const internalLinks = links.filter((a) => {
        const href = a.getAttribute("href");
        return href && (href.startsWith("/") || href.includes(currentDomain));
      });
      const externalLinks = links.filter((a) => {
        const href = a.getAttribute("href");
        return href && !href.startsWith("/") && !href.includes(currentDomain) && href.startsWith("http");
      });

      return {
        title,
        metaDescription,
        metaKeywords,
        headings: {
          h1: h1Elements,
          h2: h2Elements,
          h3: h3Elements,
        },
        images: {
          total: images.length,
          withAlt: imagesWithAlt.length,
          withoutAlt: imagesWithoutAlt.length,
          issues: imageIssues,
        },
        links: {
          internal: internalLinks.length,
          external: externalLinks.length,
          broken: [], // Will need to check these separately
        },
      };
    });
  }

  /**
   * Get performance metrics
   */
  private async getPerformanceMetrics(page: Page, loadTime: number) {
    const metrics = await page.evaluate(() => {
      const resources = performance.getEntriesByType("resource");
      const pageSize = resources.reduce((total, resource: any) => {
        return total + (resource.transferSize || 0);
      }, 0);

      return {
        requests: resources.length,
        pageSize: Math.round(pageSize / 1024), // Convert to KB
      };
    });

    return {
      loadTime,
      ...metrics,
    };
  }

  /**
   * Check technical SEO elements
   */
  private async checkTechnicalSEO(url: string, page: Page) {
    const pageData = await page.evaluate(() => {
      const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute("href");
      const structuredDataScripts = Array.from(
        document.querySelectorAll('script[type="application/ld+json"]')
      );
      const structuredData = structuredDataScripts.map((script) => {
        try {
          return JSON.parse(script.textContent || "");
        } catch {
          return null;
        }
      }).filter(Boolean);

      // Check responsive meta tag
      const viewport = document.querySelector('meta[name="viewport"]');
      const isResponsive = !!viewport;

      return {
        canonicalUrl: canonical,
        structuredData,
        isResponsive,
      };
    });

    const urlObj = new URL(url);
    const hasSSL = urlObj.protocol === "https:";

    // Check robots.txt and sitemap
    let hasRobotsTxt = false;
    let hasSitemap = false;

    try {
      const robotsUrl = `${urlObj.origin}/robots.txt`;
      const robotsResponse = await fetch(robotsUrl);
      hasRobotsTxt = robotsResponse.ok;
    } catch {
      // Ignore
    }

    try {
      const sitemapUrl = `${urlObj.origin}/sitemap.xml`;
      const sitemapResponse = await fetch(sitemapUrl);
      hasSitemap = sitemapResponse.ok;
    } catch {
      // Ignore
    }

    return {
      hasRobotsTxt,
      hasSitemap,
      hasSSL,
      ...pageData,
    };
  }

  /**
   * Analyze content
   */
  private async analyzeContent(page: Page) {
    return await page.evaluate(() => {
      const bodyText = document.body.innerText || "";
      const words = bodyText.trim().split(/\s+/);
      const wordCount = words.length;

      // Calculate keyword density (simple version)
      const wordFrequency: Record<string, number> = {};
      words.forEach((word) => {
        const cleanWord = word.toLowerCase().replace(/[^a-z0-9]/g, "");
        if (cleanWord.length > 3) {
          wordFrequency[cleanWord] = (wordFrequency[cleanWord] || 0) + 1;
        }
      });

      // Get top keywords
      const keywordDensity: Record<string, number> = {};
      Object.entries(wordFrequency)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .forEach(([word, count]) => {
          keywordDensity[word] = (count / wordCount) * 100;
        });

      // Simple readability score (Flesch Reading Ease approximation)
      const sentences = bodyText.split(/[.!?]+/).length;
      const syllables = words.reduce((count, word) => {
        return count + Math.max(1, word.replace(/[^aeiou]/gi, "").length);
      }, 0);

      const avgWordsPerSentence = wordCount / sentences;
      const avgSyllablesPerWord = syllables / wordCount;
      const readabilityScore = Math.max(
        0,
        Math.min(100, 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord)
      );

      return {
        wordCount,
        readabilityScore: Math.round(readabilityScore),
        keywordDensity,
      };
    });
  }

  /**
   * Generate AI insights using LLM
   */
  private async generateAIInsights(data: any): Promise<string> {
    const prompt = `Analyze this SEO data and provide concise, actionable insights:

Title: ${data.title}
Meta Description: ${data.metaDescription}
H1 Count: ${data.headings.h1.length}
Word Count: ${data.contentAnalysis.wordCount}
Load Time: ${data.performance.loadTime}ms
Images without Alt: ${data.images.withoutAlt}
Has SSL: ${data.technicalSEO.hasSSL}
Has Sitemap: ${data.technicalSEO.hasSitemap}

Provide 3-5 key insights about the SEO health of this page.`;

    try {
      const result = await invokeLLM({
        messages: [
          {
            role: "system",
            content:
              "You are an SEO expert. Provide concise, actionable insights based on SEO data.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        maxTokens: 500,
      });

      return result.choices[0].message.content as string;
    } catch (error) {
      console.error("[SEOService] Failed to generate AI insights:", error);
      return "Unable to generate AI insights at this time.";
    }
  }

  /**
   * Calculate overall SEO score (0-100)
   */
  private calculateSEOScore(data: any): number {
    let score = 100;

    // Title check (10 points)
    if (!data.title || data.title.length < 30 || data.title.length > 60) {
      score -= 10;
    }

    // Meta description check (10 points)
    if (!data.metaDescription || data.metaDescription.length < 120 || data.metaDescription.length > 160) {
      score -= 10;
    }

    // H1 check (10 points)
    if (data.headings.h1.length === 0) {
      score -= 10;
    } else if (data.headings.h1.length > 1) {
      score -= 5;
    }

    // Images alt text (10 points)
    if (data.images.total > 0) {
      const altPercentage = (data.images.withAlt / data.images.total) * 100;
      if (altPercentage < 50) {
        score -= 10;
      } else if (altPercentage < 80) {
        score -= 5;
      }
    }

    // Performance (15 points)
    if (data.performance.loadTime > 3000) {
      score -= 15;
    } else if (data.performance.loadTime > 2000) {
      score -= 10;
    } else if (data.performance.loadTime > 1000) {
      score -= 5;
    }

    // Technical SEO (15 points)
    if (!data.technicalSEO.hasSSL) score -= 5;
    if (!data.technicalSEO.hasSitemap) score -= 5;
    if (!data.technicalSEO.hasRobotsTxt) score -= 3;
    if (!data.technicalSEO.isResponsive) score -= 2;

    // Content (15 points)
    if (data.contentAnalysis.wordCount < 300) {
      score -= 15;
    } else if (data.contentAnalysis.wordCount < 600) {
      score -= 10;
    } else if (data.contentAnalysis.wordCount < 1000) {
      score -= 5;
    }

    // Readability (5 points)
    if (data.contentAnalysis.readabilityScore < 30) {
      score -= 5;
    } else if (data.contentAnalysis.readabilityScore < 50) {
      score -= 3;
    }

    // Links (10 points)
    if (data.links.internal < 5) score -= 5;
    if (data.links.external < 2) score -= 5;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Generate recommendations based on analysis
   */
  private generateRecommendations(data: any): string[] {
    const recommendations: string[] = [];

    if (!data.title || data.title.length < 30) {
      recommendations.push("Add a descriptive title tag (30-60 characters)");
    } else if (data.title.length > 60) {
      recommendations.push("Shorten your title tag to under 60 characters");
    }

    if (!data.metaDescription || data.metaDescription.length < 120) {
      recommendations.push("Add or expand your meta description (120-160 characters)");
    } else if (data.metaDescription.length > 160) {
      recommendations.push("Shorten your meta description to under 160 characters");
    }

    if (data.headings.h1.length === 0) {
      recommendations.push("Add a single H1 heading to your page");
    } else if (data.headings.h1.length > 1) {
      recommendations.push("Use only one H1 heading per page");
    }

    if (data.images.withoutAlt > 0) {
      recommendations.push(`Add alt text to ${data.images.withoutAlt} images`);
    }

    if (data.performance.loadTime > 3000) {
      recommendations.push("Improve page load time - target under 2 seconds");
    }

    if (!data.technicalSEO.hasSSL) {
      recommendations.push("Enable SSL/HTTPS for security and SEO");
    }

    if (!data.technicalSEO.hasSitemap) {
      recommendations.push("Create and submit an XML sitemap");
    }

    if (!data.technicalSEO.hasRobotsTxt) {
      recommendations.push("Add a robots.txt file");
    }

    if (data.contentAnalysis.wordCount < 600) {
      recommendations.push("Expand content to at least 600-1000 words");
    }

    if (data.links.internal < 5) {
      recommendations.push("Add more internal links to improve site navigation");
    }

    if (data.score >= 90) {
      recommendations.push("Great work! Focus on maintaining your SEO health");
    }

    return recommendations;
  }

  /**
   * Get keyword suggestions for a topic using AI
   */
  async getKeywordSuggestions(
    topic: string,
    count: number = 20
  ): Promise<KeywordSuggestion[]> {
    console.log(`[SEOService] Generating keyword suggestions for: ${topic}`);

    const prompt = `Generate ${count} keyword suggestions for the topic: "${topic}"

For each keyword, provide:
- The keyword phrase
- Estimated search volume (monthly)
- Difficulty score (0-100)
- Estimated CPC in USD
- Trend (up/down/stable)
- 3-5 related keywords

Return as JSON array.`;

    try {
      const result = await invokeLLM({
        messages: [
          {
            role: "system",
            content:
              "You are an SEO keyword research expert. Provide realistic keyword data based on industry knowledge.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        responseFormat: { type: "json_object" },
        maxTokens: 2000,
      });

      const content = result.choices[0].message.content as string;
      const data = JSON.parse(content);

      // Extract keywords array from response
      const keywords = data.keywords || [];

      return keywords.map((kw: any) => ({
        keyword: kw.keyword || kw.phrase || "",
        searchVolume: kw.searchVolume || kw.volume || 0,
        difficulty: kw.difficulty || 50,
        cpc: kw.cpc || 0,
        trend: kw.trend || "stable",
        relatedKeywords: kw.relatedKeywords || kw.related || [],
      }));
    } catch (error) {
      console.error("[SEOService] Failed to generate keyword suggestions:", error);
      // Return mock data as fallback
      return this.getMockKeywordSuggestions(topic, count);
    }
  }

  /**
   * Mock keyword suggestions (fallback)
   */
  private getMockKeywordSuggestions(topic: string, count: number): KeywordSuggestion[] {
    const suggestions: KeywordSuggestion[] = [];

    for (let i = 0; i < Math.min(count, 10); i++) {
      suggestions.push({
        keyword: `${topic} ${i > 0 ? i : ""}`.trim(),
        searchVolume: Math.floor(Math.random() * 10000) + 100,
        difficulty: Math.floor(Math.random() * 100),
        cpc: Math.random() * 5,
        trend: ["up", "down", "stable"][Math.floor(Math.random() * 3)] as any,
        relatedKeywords: [
          `${topic} tips`,
          `best ${topic}`,
          `${topic} guide`,
          `how to ${topic}`,
        ].slice(0, 3),
      });
    }

    return suggestions;
  }

  /**
   * Check keyword rankings for a website
   */
  async checkRankings(
    url: string,
    keywords: string[],
    searchEngine: "google" | "bing" = "google",
    location: string = "United States"
  ): Promise<RankingResult[]> {
    console.log(`[SEOService] Checking rankings for ${url} on ${searchEngine}`);

    // Note: Actual ranking checks would require search engine APIs or web scraping
    // This is a mock implementation
    const results: RankingResult[] = [];

    for (const keyword of keywords) {
      results.push({
        keyword,
        position: Math.random() > 0.5 ? Math.floor(Math.random() * 100) + 1 : null,
        url,
        previousPosition: Math.random() > 0.7 ? Math.floor(Math.random() * 100) + 1 : null,
        change: Math.floor(Math.random() * 20) - 10,
        searchEngine,
        location,
      });
    }

    return results;
  }

  /**
   * Get backlink analysis
   */
  async getBacklinks(url: string): Promise<BacklinkData> {
    console.log(`[SEOService] Analyzing backlinks for ${url}`);

    // Note: Real implementation would integrate with Ahrefs, SEMRush, or Moz API
    // This is a mock implementation
    const mockBacklinks: BacklinkData = {
      url,
      domainAuthority: Math.floor(Math.random() * 100),
      totalBacklinks: Math.floor(Math.random() * 10000),
      uniqueDomains: Math.floor(Math.random() * 1000),
      topBacklinks: [
        {
          sourceUrl: "https://example.com/article",
          sourceDomain: "example.com",
          anchorText: "click here",
          domainRating: 75,
          isDoFollow: true,
          firstSeen: new Date(Date.now() - 86400000 * 30),
        },
        {
          sourceUrl: "https://blog.example.org/post",
          sourceDomain: "blog.example.org",
          anchorText: "read more",
          domainRating: 60,
          isDoFollow: true,
          firstSeen: new Date(Date.now() - 86400000 * 15),
        },
      ],
      toxicBacklinks: Math.floor(Math.random() * 50),
      newBacklinks: Math.floor(Math.random() * 100),
      lostBacklinks: Math.floor(Math.random() * 50),
    };

    return mockBacklinks;
  }

  /**
   * Generate heatmap tracking script
   */
  async setupTracking(url: string): Promise<{ trackingScript: string; trackingId: string }> {
    // Generate a unique tracking ID
    const trackingId = `hm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Generate tracking script
    const trackingScript = `
<!-- SEO Heatmap Tracking -->
<script>
(function() {
  var trackingId = '${trackingId}';
  var apiEndpoint = '/api/seo/heatmap/track';

  var clicks = [];
  var scrollData = [];

  document.addEventListener('click', function(e) {
    clicks.push({
      x: e.pageX,
      y: e.pageY,
      element: e.target.tagName,
      timestamp: new Date().toISOString()
    });

    // Send click data
    if (clicks.length >= 10) {
      sendData();
    }
  });

  var lastScrollDepth = 0;
  window.addEventListener('scroll', function() {
    var scrollDepth = window.scrollY;
    var percentage = (scrollDepth / (document.documentElement.scrollHeight - window.innerHeight)) * 100;

    if (Math.abs(scrollDepth - lastScrollDepth) > 100) {
      scrollData.push({
        depth: scrollDepth,
        percentage: percentage,
        timestamp: new Date().toISOString()
      });
      lastScrollDepth = scrollDepth;
    }
  });

  function sendData() {
    if (clicks.length === 0 && scrollData.length === 0) return;

    fetch(apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        trackingId: trackingId,
        url: window.location.href,
        clicks: clicks,
        scrollData: scrollData
      })
    });

    clicks = [];
    scrollData = [];
  }

  // Send data before page unload
  window.addEventListener('beforeunload', sendData);

  // Send data every 30 seconds
  setInterval(sendData, 30000);
})();
</script>`;

    return {
      trackingScript,
      trackingId,
    };
  }

  /**
   * Get heatmap data for a URL
   */
  async getHeatmapData(url: string, dateRange?: { start: Date; end: Date }): Promise<HeatmapData> {
    console.log(`[SEOService] Fetching heatmap data for ${url}`);

    // Mock implementation - would integrate with actual tracking data
    const mockData: HeatmapData = {
      url,
      sessionId: `session_${Date.now()}`,
      clicks: [
        { x: 100, y: 200, element: "BUTTON", timestamp: new Date() },
        { x: 150, y: 300, element: "A", timestamp: new Date() },
        { x: 200, y: 150, element: "DIV", timestamp: new Date() },
      ],
      scrollDepth: [
        { depth: 0, percentage: 0, timestamp: new Date() },
        { depth: 500, percentage: 25, timestamp: new Date() },
        { depth: 1000, percentage: 50, timestamp: new Date() },
        { depth: 1500, percentage: 75, timestamp: new Date() },
      ],
      heatmapImageUrl: "/api/heatmap/image/placeholder.png",
      analytics: {
        averageScrollDepth: 65,
        mostClickedElements: [
          { element: "BUTTON#submit", clicks: 45 },
          { element: "A.nav-link", clicks: 32 },
          { element: "DIV.card", clicks: 18 },
        ],
        bounceRate: 42.5,
        averageTimeOnPage: 125, // seconds
      },
    };

    return mockData;
  }

  /**
   * Store analysis job in database
   */
  private async storeAnalysisJob(userId: number, url: string, result: SEOAnalysisResult) {
    const db = await getDb();
    if (!db) {
      console.warn("[SEOService] Database not available, skipping job storage");
      return;
    }

    try {
      await db.insert(jobs).values({
        type: "seo_audit",
        status: "completed",
        payload: JSON.stringify({ url, userId }),
        result: JSON.stringify(result),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log(`[SEOService] Stored analysis job for ${url}`);
    } catch (error) {
      console.error("[SEOService] Failed to store job:", error);
    }
  }

  /**
   * Get recent SEO reports
   */
  async getReports(userId?: number, limit: number = 20): Promise<any[]> {
    const db = await getDb();
    if (!db) {
      return [];
    }

    try {
      const reports = await db
        .select()
        .from(jobs)
        .where(eq(jobs.type, "seo_audit"))
        .orderBy(desc(jobs.createdAt))
        .limit(limit);

      return reports.map((report) => ({
        id: report.id,
        url: report.payload ? JSON.parse(report.payload).url : null,
        status: report.status,
        createdAt: report.createdAt,
        result: report.result ? JSON.parse(report.result) : null,
      }));
    } catch (error) {
      console.error("[SEOService] Failed to fetch reports:", error);
      return [];
    }
  }

  /**
   * Get a specific report
   */
  async getReport(reportId: number): Promise<any | null> {
    const db = await getDb();
    if (!db) {
      return null;
    }

    try {
      const reports = await db
        .select()
        .from(jobs)
        .where(eq(jobs.id, reportId))
        .limit(1);

      if (reports.length === 0) {
        return null;
      }

      const report = reports[0];
      return {
        id: report.id,
        url: report.payload ? JSON.parse(report.payload).url : null,
        status: report.status,
        createdAt: report.createdAt,
        result: report.result ? JSON.parse(report.result) : null,
      };
    } catch (error) {
      console.error("[SEOService] Failed to fetch report:", error);
      return null;
    }
  }
}

// Export singleton instance
export const seoService = new SEOService();

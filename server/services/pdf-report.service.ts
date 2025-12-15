/**
 * PDF Report Generation Service
 * Generates PDF reports for SEO audits using Puppeteer
 */

import puppeteer from "puppeteer-core";
import { browserbaseSDK } from "../_core/browserbaseSDK";
import type { SEOAnalysisResult } from "./seo.service";

export interface PDFReportOptions {
  title?: string;
  includeCharts?: boolean;
  includeRecommendations?: boolean;
  brandLogo?: string;
  brandName?: string;
}

export class PDFReportService {
  /**
   * Generate PDF report from SEO analysis
   */
  async generateSEOReport(
    analysis: SEOAnalysisResult,
    options: PDFReportOptions = {}
  ): Promise<Buffer> {
    console.log("[PDFReportService] Generating SEO report PDF");

    const html = this.generateHTMLReport(analysis, options);

    // Create a Browserbase session for PDF generation
    const session = await browserbaseSDK.createSession({
      recordSession: false,
    });

    try {
      const browser = await puppeteer.connect({
        browserWSEndpoint: session.wsUrl!,
      });

      const page = await browser.pages().then((pages) => pages[0]);

      // Set the HTML content
      await page.setContent(html, { waitUntil: "networkidle0" });

      // Generate PDF
      const pdf = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: {
          top: "20mm",
          right: "15mm",
          bottom: "20mm",
          left: "15mm",
        },
      });

      await browser.disconnect();

      console.log("[PDFReportService] PDF generated successfully");

      return Buffer.from(pdf);
    } finally {
      await browserbaseSDK.terminateSession(session.id);
    }
  }

  /**
   * Generate HTML for the report
   */
  private generateHTMLReport(analysis: SEOAnalysisResult, options: PDFReportOptions): string {
    const {
      title = "SEO Audit Report",
      includeCharts = true,
      includeRecommendations = true,
      brandLogo,
      brandName = "SEO Analysis",
    } = options;

    const scoreColor = this.getScoreColor(analysis.score);
    const scoreGrade = this.getScoreGrade(analysis.score);

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background: white;
    }

    .header {
      text-align: center;
      padding: 30px 0;
      border-bottom: 3px solid #4F46E5;
      margin-bottom: 30px;
    }

    .logo {
      max-width: 150px;
      margin-bottom: 20px;
    }

    h1 {
      color: #1F2937;
      font-size: 32px;
      margin-bottom: 10px;
    }

    h2 {
      color: #374151;
      font-size: 24px;
      margin: 30px 0 15px 0;
      padding-bottom: 10px;
      border-bottom: 2px solid #E5E7EB;
    }

    h3 {
      color: #4B5563;
      font-size: 18px;
      margin: 20px 0 10px 0;
    }

    .url {
      color: #6B7280;
      font-size: 16px;
      word-break: break-all;
    }

    .score-section {
      text-align: center;
      padding: 30px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 10px;
      margin: 30px 0;
    }

    .score-circle {
      width: 150px;
      height: 150px;
      border-radius: 50%;
      background: white;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin: 20px 0;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    }

    .score-number {
      font-size: 48px;
      font-weight: bold;
      color: ${scoreColor};
    }

    .score-grade {
      font-size: 24px;
      margin-top: 10px;
      font-weight: 600;
    }

    .metric-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin: 20px 0;
    }

    .metric-card {
      background: #F9FAFB;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #4F46E5;
    }

    .metric-label {
      font-size: 14px;
      color: #6B7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 5px;
    }

    .metric-value {
      font-size: 24px;
      font-weight: bold;
      color: #1F2937;
    }

    .metric-detail {
      font-size: 12px;
      color: #9CA3AF;
      margin-top: 5px;
    }

    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      margin-left: 10px;
    }

    .badge-success {
      background: #DEF7EC;
      color: #03543F;
    }

    .badge-warning {
      background: #FEF3C7;
      color: #92400E;
    }

    .badge-error {
      background: #FEE2E2;
      color: #991B1B;
    }

    .recommendations {
      background: #FFFBEB;
      border-left: 4px solid #F59E0B;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }

    .recommendations ul {
      margin-left: 20px;
      margin-top: 10px;
    }

    .recommendations li {
      margin: 8px 0;
      color: #78350F;
    }

    .insights {
      background: #EFF6FF;
      border-left: 4px solid #3B82F6;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }

    .insights p {
      color: #1E40AF;
      line-height: 1.8;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      background: white;
      border-radius: 8px;
      overflow: hidden;
    }

    .data-table th {
      background: #F3F4F6;
      padding: 12px;
      text-align: left;
      font-weight: 600;
      color: #374151;
      border-bottom: 2px solid #E5E7EB;
    }

    .data-table td {
      padding: 12px;
      border-bottom: 1px solid #E5E7EB;
    }

    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 2px solid #E5E7EB;
      text-align: center;
      color: #6B7280;
      font-size: 12px;
    }

    .page-break {
      page-break-after: always;
    }

    .progress-bar {
      height: 8px;
      background: #E5E7EB;
      border-radius: 4px;
      overflow: hidden;
      margin-top: 10px;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #4F46E5, #7C3AED);
      transition: width 0.3s ease;
    }
  </style>
</head>
<body>
  <div class="header">
    ${brandLogo ? `<img src="${brandLogo}" alt="${brandName}" class="logo">` : ""}
    <h1>${title}</h1>
    <p class="url">${analysis.url}</p>
    <p style="color: #6B7280; margin-top: 10px;">Generated on ${new Date().toLocaleDateString()}</p>
  </div>

  <div class="score-section">
    <div class="score-circle">
      <div class="score-number">${analysis.score}</div>
    </div>
    <div class="score-grade">Grade: ${scoreGrade}</div>
    <p style="margin-top: 10px; opacity: 0.9;">Overall SEO Health Score</p>
  </div>

  <h2>Executive Summary</h2>
  <div class="metric-grid">
    <div class="metric-card">
      <div class="metric-label">Page Title</div>
      <div class="metric-value" style="font-size: 16px;">${analysis.title || "Missing"}</div>
      <div class="metric-detail">${analysis.title ? `${analysis.title.length} characters` : "No title found"}</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">Load Time</div>
      <div class="metric-value">${(analysis.performance.loadTime / 1000).toFixed(2)}s</div>
      <div class="metric-detail">${this.getPerformanceStatus(analysis.performance.loadTime)}</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">Word Count</div>
      <div class="metric-value">${analysis.contentAnalysis.wordCount}</div>
      <div class="metric-detail">${this.getWordCountStatus(analysis.contentAnalysis.wordCount)}</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">Images</div>
      <div class="metric-value">${analysis.images.total}</div>
      <div class="metric-detail">${analysis.images.withAlt} with alt text, ${analysis.images.withoutAlt} missing</div>
    </div>
  </div>

  ${
    includeRecommendations && analysis.recommendations.length > 0
      ? `
  <h2>Recommendations</h2>
  <div class="recommendations">
    <strong>Priority Actions:</strong>
    <ul>
      ${analysis.recommendations.map((rec) => `<li>${rec}</li>`).join("")}
    </ul>
  </div>
  `
      : ""
  }

  <div class="insights">
    <h3 style="color: #1E40AF; margin-top: 0;">AI Insights</h3>
    <p>${analysis.aiInsights}</p>
  </div>

  <div class="page-break"></div>

  <h2>Technical SEO</h2>
  <table class="data-table">
    <tr>
      <th>Check</th>
      <th>Status</th>
    </tr>
    <tr>
      <td>SSL/HTTPS Enabled</td>
      <td>${this.getStatusBadge(analysis.technicalSEO.hasSSL)}</td>
    </tr>
    <tr>
      <td>XML Sitemap</td>
      <td>${this.getStatusBadge(analysis.technicalSEO.hasSitemap)}</td>
    </tr>
    <tr>
      <td>Robots.txt</td>
      <td>${this.getStatusBadge(analysis.technicalSEO.hasRobotsTxt)}</td>
    </tr>
    <tr>
      <td>Mobile Responsive</td>
      <td>${this.getStatusBadge(analysis.technicalSEO.isResponsive)}</td>
    </tr>
    <tr>
      <td>Canonical URL</td>
      <td>${this.getStatusBadge(!!analysis.technicalSEO.canonicalUrl)}</td>
    </tr>
    <tr>
      <td>Structured Data</td>
      <td>${this.getStatusBadge(analysis.technicalSEO.structuredData.length > 0)}</td>
    </tr>
  </table>

  <h2>Content Analysis</h2>
  <div class="metric-grid">
    <div class="metric-card">
      <div class="metric-label">H1 Headings</div>
      <div class="metric-value">${analysis.headings.h1.length}</div>
      <div class="metric-detail">${analysis.headings.h1.length === 1 ? "Perfect" : analysis.headings.h1.length === 0 ? "Missing" : "Too many"}</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">H2 Headings</div>
      <div class="metric-value">${analysis.headings.h2.length}</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">Internal Links</div>
      <div class="metric-value">${analysis.links.internal}</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">External Links</div>
      <div class="metric-value">${analysis.links.external}</div>
    </div>
  </div>

  <h3>Meta Description</h3>
  <p style="background: #F9FAFB; padding: 15px; border-radius: 8px; margin: 10px 0;">
    ${analysis.metaDescription || "<em>No meta description found</em>"}
  </p>
  ${
    analysis.metaDescription
      ? `<p style="color: #6B7280; font-size: 14px;">${analysis.metaDescription.length} characters ${
          analysis.metaDescription.length >= 120 && analysis.metaDescription.length <= 160
            ? '<span class="badge-success status-badge">Optimal</span>'
            : '<span class="badge-warning status-badge">Needs adjustment</span>'
        }</p>`
      : ""
  }

  <h3>Top Keywords</h3>
  <table class="data-table">
    <tr>
      <th>Keyword</th>
      <th>Density</th>
    </tr>
    ${Object.entries(analysis.contentAnalysis.keywordDensity)
      .slice(0, 10)
      .map(
        ([keyword, density]) => `
      <tr>
        <td>${keyword}</td>
        <td>${density.toFixed(2)}%</td>
      </tr>
    `
      )
      .join("")}
  </table>

  <div class="footer">
    <p>Generated by ${brandName}</p>
    <p>This report provides an overview of SEO health. For detailed analysis, consult with an SEO professional.</p>
  </div>
</body>
</html>
    `;
  }

  /**
   * Get color based on score
   */
  private getScoreColor(score: number): string {
    if (score >= 90) return "#10B981";
    if (score >= 70) return "#F59E0B";
    if (score >= 50) return "#EF4444";
    return "#DC2626";
  }

  /**
   * Get grade based on score
   */
  private getScoreGrade(score: number): string {
    if (score >= 90) return "A";
    if (score >= 80) return "B";
    if (score >= 70) return "C";
    if (score >= 60) return "D";
    return "F";
  }

  /**
   * Get status badge HTML
   */
  private getStatusBadge(status: boolean): string {
    if (status) {
      return '<span class="badge-success status-badge">✓ Pass</span>';
    }
    return '<span class="badge-error status-badge">✗ Fail</span>';
  }

  /**
   * Get performance status
   */
  private getPerformanceStatus(loadTime: number): string {
    if (loadTime < 1000) return "Excellent";
    if (loadTime < 2000) return "Good";
    if (loadTime < 3000) return "Fair";
    return "Needs improvement";
  }

  /**
   * Get word count status
   */
  private getWordCountStatus(wordCount: number): string {
    if (wordCount >= 1000) return "Excellent";
    if (wordCount >= 600) return "Good";
    if (wordCount >= 300) return "Fair";
    return "Too short";
  }
}

// Export singleton instance
export const pdfReportService = new PDFReportService();

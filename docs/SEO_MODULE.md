# SEO & Reports Module

A comprehensive SEO analysis and reporting system that provides website audits, keyword research, ranking tracking, backlink analysis, and heatmap analytics.

## Features

### 1. Website SEO Analysis
- **Full Page Audit**: Analyzes title tags, meta descriptions, headings, images, links, and more
- **Technical SEO**: Checks SSL, sitemaps, robots.txt, mobile responsiveness, structured data
- **Content Analysis**: Word count, readability scores, keyword density
- **Performance Metrics**: Load time, page size, request count
- **AI-Powered Insights**: LLM-generated recommendations and insights
- **SEO Score**: Overall score (0-100) with detailed breakdown

### 2. Keyword Research
- **AI-Generated Suggestions**: Get keyword ideas based on topics
- **Search Volume Estimates**: Monthly search volume data
- **Difficulty Scores**: Keyword competition analysis (0-100)
- **CPC Data**: Cost-per-click estimates
- **Trend Analysis**: Identify rising/falling keywords
- **Related Keywords**: Discover semantically related terms

### 3. Ranking Tracking
- **Multi-Engine Support**: Google and Bing tracking
- **Location-Specific**: Track rankings by geographic location
- **Historical Data**: Monitor position changes over time
- **Bulk Keyword Tracking**: Track multiple keywords simultaneously
- **Change Detection**: Identify ranking improvements/declines

### 4. Backlink Analysis
- **Backlink Discovery**: Find sites linking to your content
- **Domain Authority**: Evaluate linking domain quality
- **Anchor Text Analysis**: Review link anchor text distribution
- **DoFollow/NoFollow**: Distinguish between link types
- **Toxic Link Detection**: Identify potentially harmful backlinks
- **New/Lost Backlinks**: Track backlink acquisition and loss

### 5. Heatmap Analytics
- **Click Tracking**: Visualize where users click
- **Scroll Depth**: Measure how far users scroll
- **Element Interaction**: Track engagement with specific elements
- **Session Analytics**: Bounce rate, time on page, engagement metrics
- **Easy Integration**: Simple JavaScript tracking script

### 6. PDF Report Generation
- **Professional Reports**: Generate branded PDF reports
- **Customizable**: Include/exclude charts, recommendations
- **Visual Scoring**: Color-coded scores and grades
- **Executive Summaries**: High-level overview for stakeholders
- **Detailed Breakdowns**: Technical SEO, content, and performance sections

### 7. Scheduled Reports
- **Recurring Audits**: Daily, weekly, or monthly reports
- **Email Delivery**: Send reports to multiple recipients
- **Automated Tracking**: Monitor SEO health over time

## API Endpoints

### Website Analysis

#### Analyze Website
Perform a full SEO audit of a website.

```typescript
const result = await trpc.seo.analyzeWebsite.mutate({
  url: "https://example.com",
  userId: 1 // optional
});

// Response
{
  success: true,
  message: "Analysis completed successfully",
  data: {
    url: "https://example.com",
    title: "Example Domain",
    score: 85,
    metaDescription: "Example description",
    headings: { h1: [...], h2: [...], h3: [...] },
    images: { total: 10, withAlt: 8, withoutAlt: 2 },
    performance: { loadTime: 1250, pageSize: 450, requests: 25 },
    technicalSEO: { hasSSL: true, hasSitemap: true, ... },
    aiInsights: "AI-generated recommendations...",
    recommendations: [...]
  }
}
```

**Credits**: 1 scraping credit

---

### Keyword Research

#### Get Keyword Suggestions
Generate keyword ideas for a topic.

```typescript
const result = await trpc.seo.getKeywordSuggestions.mutate({
  topic: "digital marketing",
  count: 20
});

// Response
{
  success: true,
  data: [
    {
      keyword: "digital marketing strategies",
      searchVolume: 8100,
      difficulty: 65,
      cpc: 3.50,
      trend: "up",
      relatedKeywords: ["marketing tactics", "online marketing", ...]
    },
    ...
  ]
}
```

---

### Ranking Tracking

#### Check Rankings
Check keyword rankings for a website.

```typescript
const result = await trpc.seo.checkRankings.mutate({
  url: "https://example.com",
  keywords: ["seo tools", "website audit"],
  searchEngine: "google",
  location: "United States"
});

// Response
{
  success: true,
  data: [
    {
      keyword: "seo tools",
      position: 15,
      previousPosition: 18,
      change: +3,
      searchEngine: "google",
      location: "United States"
    },
    ...
  ]
}
```

---

### Backlink Analysis

#### Get Backlinks
Analyze backlinks for a website.

```typescript
const result = await trpc.seo.getBacklinks.mutate({
  url: "https://example.com"
});

// Response
{
  success: true,
  data: {
    url: "https://example.com",
    domainAuthority: 75,
    totalBacklinks: 1250,
    uniqueDomains: 320,
    topBacklinks: [
      {
        sourceUrl: "https://source.com/article",
        sourceDomain: "source.com",
        anchorText: "click here",
        domainRating: 85,
        isDoFollow: true,
        firstSeen: "2024-01-15T00:00:00Z"
      },
      ...
    ],
    toxicBacklinks: 5,
    newBacklinks: 15,
    lostBacklinks: 3
  }
}
```

---

### Report Generation

#### Generate PDF Report
Create a professional SEO audit report.

```typescript
const result = await trpc.seo.generateReport.mutate({
  url: "https://example.com",
  userId: 1,
  options: {
    title: "SEO Audit Report - Example.com",
    includeCharts: true,
    includeRecommendations: true,
    brandLogo: "https://example.com/logo.png",
    brandName: "Your Company"
  }
});

// Response
{
  success: true,
  message: "Report generated successfully",
  reportUrl: "data:application/pdf;base64,...",
  creditsUsed: 2
}
```

**Credits**: 2 scraping credits

---

#### List Reports
Get a list of generated reports.

```typescript
const result = await trpc.seo.listReports.query({
  userId: 1,
  limit: 20
});

// Response
{
  success: true,
  reports: [
    {
      id: 1,
      url: "https://example.com",
      status: "completed",
      createdAt: "2024-01-15T12:00:00Z",
      result: { ... }
    },
    ...
  ],
  total: 15
}
```

---

#### Get Report
Retrieve a specific report.

```typescript
const result = await trpc.seo.getReport.query({
  reportId: 1
});

// Response
{
  success: true,
  data: {
    id: 1,
    url: "https://example.com",
    status: "completed",
    createdAt: "2024-01-15T12:00:00Z",
    result: { ... }
  }
}
```

---

#### Schedule Report
Schedule recurring SEO reports.

```typescript
const result = await trpc.seo.scheduleReport.mutate({
  url: "https://example.com",
  userId: 1,
  frequency: "weekly",
  recipients: ["email@example.com", "team@example.com"]
});

// Response
{
  success: true,
  message: "Report scheduled weekly for https://example.com",
  scheduleId: "schedule_1234567890"
}
```

---

### Heatmap Analytics

#### Setup Tracking
Generate a tracking script for heatmap data collection.

```typescript
const result = await trpc.seo.setupTracking.mutate({
  url: "https://example.com"
});

// Response
{
  success: true,
  data: {
    trackingId: "hm_1234567890_abc123",
    trackingScript: "<script>...</script>"
  }
}
```

---

#### Get Heatmap Data
Retrieve heatmap analytics data.

```typescript
const result = await trpc.seo.getHeatmapData.query({
  url: "https://example.com",
  dateRange: {
    start: "2024-01-01",
    end: "2024-01-31"
  }
});

// Response
{
  success: true,
  data: {
    url: "https://example.com",
    sessionId: "session_1234567890",
    clicks: [
      { x: 100, y: 200, element: "BUTTON", timestamp: "..." },
      ...
    ],
    scrollDepth: [
      { depth: 0, percentage: 0, timestamp: "..." },
      ...
    ],
    heatmapImageUrl: "/api/heatmap/image/placeholder.png",
    analytics: {
      averageScrollDepth: 65,
      mostClickedElements: [
        { element: "BUTTON#submit", clicks: 45 },
        ...
      ],
      bounceRate: 42.5,
      averageTimeOnPage: 125
    }
  }
}
```

---

## Database Schema

### Tables

#### `seo_reports`
Stores SEO audit reports and analyses.

```typescript
{
  id: number;
  userId: number;
  url: string;
  title: string;
  score: number;
  status: "pending" | "processing" | "completed" | "failed";
  metaDescription: string;
  headings: { h1: [], h2: [], h3: [] };
  images: { total, withAlt, withoutAlt, issues };
  links: { internal, external, broken };
  performance: { loadTime, pageSize, requests };
  technicalSEO: { ... };
  contentAnalysis: { wordCount, readabilityScore, keywordDensity };
  aiInsights: string;
  recommendations: string[];
  pdfUrl: string;
  reportType: "technical" | "content" | "full";
  createdAt: Date;
  updatedAt: Date;
}
```

#### `keyword_research`
Stores keyword research data and suggestions.

#### `keyword_rankings`
Tracks keyword rankings over time.

#### `backlinks`
Stores backlink data for tracked URLs.

#### `heatmap_sessions`
Stores heatmap tracking sessions.

#### `heatmap_events`
Stores individual click and scroll events.

#### `scheduled_seo_reports`
Stores recurring report schedules.

#### `seo_competitors`
Track competitor websites for comparison.

---

## Services

### SEOService (`server/services/seo.service.ts`)

Core service handling SEO analysis operations:
- `analyzeWebsite()` - Full SEO audit using Browserbase
- `getKeywordSuggestions()` - AI-powered keyword research
- `checkRankings()` - Track keyword positions
- `getBacklinks()` - Backlink analysis
- `setupTracking()` - Generate heatmap tracking script
- `getHeatmapData()` - Retrieve heatmap analytics

### PDFReportService (`server/services/pdf-report.service.ts`)

Handles PDF report generation:
- `generateSEOReport()` - Create professional PDF reports
- Customizable branding and styling
- Chart and visualization support

---

## Environment Variables

### Optional API Keys

```bash
# SEMRush API (for enhanced keyword data)
SEMRUSH_API_KEY=your-semrush-api-key

# Ahrefs API (for backlink data)
AHREFS_API_KEY=your-ahrefs-api-key

# S3 for PDF storage (optional)
S3_BUCKET=your-s3-bucket-name
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
```

---

## Credit System

The SEO module uses the credit system for resource management:

- **Website Analysis**: 1 scraping credit
- **PDF Report Generation**: 2 scraping credits
- **Keyword Suggestions**: Free (AI-based)
- **Rankings Check**: Free (mock data)
- **Backlinks**: Free (mock data)
- **Heatmap Analytics**: Free

---

## Future Enhancements

### Integrations
- [ ] SEMRush API for real keyword data
- [ ] Ahrefs API for real backlink data
- [ ] Google Search Console integration
- [ ] Microsoft Clarity for heatmaps
- [ ] Hotjar integration

### Features
- [ ] Competitor tracking and comparison
- [ ] Historical trend analysis
- [ ] Automated SEO score alerts
- [ ] White-label report customization
- [ ] API key management for client portals
- [ ] Scheduled report email delivery
- [ ] Export data to CSV/Excel
- [ ] Custom SEO checklists

### Performance
- [ ] Caching layer for frequently analyzed sites
- [ ] Batch processing for multiple URLs
- [ ] Background job processing for reports
- [ ] CDN integration for PDF storage

---

## Usage Examples

### Complete SEO Audit Workflow

```typescript
// 1. Analyze website
const analysis = await trpc.seo.analyzeWebsite.mutate({
  url: "https://example.com",
  userId: 1
});

// 2. Get keyword suggestions
const keywords = await trpc.seo.getKeywordSuggestions.mutate({
  topic: analysis.data.title,
  count: 20
});

// 3. Check rankings
const rankings = await trpc.seo.checkRankings.mutate({
  url: "https://example.com",
  keywords: keywords.data.slice(0, 5).map(k => k.keyword)
});

// 4. Analyze backlinks
const backlinks = await trpc.seo.getBacklinks.mutate({
  url: "https://example.com"
});

// 5. Generate PDF report
const report = await trpc.seo.generateReport.mutate({
  url: "https://example.com",
  userId: 1,
  options: {
    title: "Monthly SEO Report",
    brandName: "Your Agency"
  }
});

// 6. Schedule monthly reports
const schedule = await trpc.seo.scheduleReport.mutate({
  url: "https://example.com",
  userId: 1,
  frequency: "monthly",
  recipients: ["client@example.com"]
});
```

---

## Technical Architecture

### Browser Automation
- Uses **Browserbase** for scalable, cloud-based browser sessions
- **Puppeteer** for page manipulation and data extraction
- Session recording for debugging

### AI Integration
- **LLM-powered insights** via internal AI service
- Structured data extraction
- Natural language recommendations

### Report Generation
- HTML templates for PDF generation
- CSS styling for professional appearance
- Base64-encoded PDF delivery (or S3 upload)

### Data Storage
- PostgreSQL for structured data
- JSONB columns for flexible metadata
- Drizzle ORM for type-safe queries

---

## Best Practices

### Performance
1. Cache frequently accessed data
2. Use background jobs for long-running analyses
3. Implement rate limiting for API endpoints
4. Batch process multiple URLs when possible

### Security
1. Validate all user inputs
2. Sanitize URLs before processing
3. Implement user authentication for reports
4. Encrypt sensitive API keys

### User Experience
1. Provide real-time progress updates
2. Show estimated completion times
3. Cache previous analyses for quick access
4. Implement graceful error handling

---

## Support

For issues or questions about the SEO module, please refer to:
- Project documentation
- API reference
- Service implementation files

---

## License

This module is part of the GHL Agency AI platform.

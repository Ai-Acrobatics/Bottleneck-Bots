# GHL Agent Command Center - Service Provider Research Findings

## Core Platform Services

### 1. GoHighLevel (GHL)
**Purpose**: Primary CRM and automation platform
- **Agency Starter**: $97/month (2 sub-accounts, limited features)
- **Agency Unlimited**: $297/month (unlimited sub-accounts, API access, full features)
- **Agency Pro (SaaS Mode)**: $497/month (white-label, SaaS resale capabilities)
- **AI Employee Add-on**: $97/month (unlimited usage with fair use policy)
- **API Access**: Included in Unlimited and Pro plans
- **Developer Account**: Free (for building integrations)
- **Custom Integration Development**: $1,500-$2,000 per integration (third-party developers)

**Recommendation**: Agency Unlimited ($297/month) for full API access

---

### 2. Notion
**Purpose**: Client context database, knowledge base, project management
- **Free Plan**: Unlimited pages, basic features
- **Plus Plan**: $10/user/month (advanced features)
- **Business Plan**: $20/user/month (includes Notion AI, advanced permissions)
- **Notion AI Add-on**: $10/user/month (or $8/month annual)
- **API Access**: Free (3 requests/second rate limit)
- **Integration Development**: Free to build

**Recommendation**: Business Plan ($20/user/month) for 2-3 users with AI capabilities

---

### 3. Slack
**Purpose**: Team notifications, alerts, support ticket routing
- **Free Plan**: 90-day message history, 10 integrations
- **Pro Plan**: $7.25/user/month (annual) or $8.75/month (monthly)
- **Business+ Plan**: $15/user/month (annual) or $18/month (monthly)
- **Webhooks**: Free (unlimited incoming webhooks)
- **API Access**: Free

**Recommendation**: Pro Plan ($7.25/user/month) for 3-5 team members

---

### 4. Neon Database
**Purpose**: Serverless PostgreSQL for application data
- **Free Tier**: 
  - 0.5 GB storage per project
  - 10 projects max
  - 100 compute hours/month
  - 5 GB data transfer
- **Launch Plan**: $19/month
  - 10 GB storage
  - Unlimited projects
  - 300 compute hours
- **Scale Plan**: $69/month
  - 50 GB storage
  - Unlimited compute hours
  - Auto-scaling
- **Business Plan**: $700/month (dedicated resources)
- **Compute Pricing**: $0.16/hour for 0.25 vCPU
- **Storage**: $0.17/GB-month

**Recommendation**: Launch Plan ($19/month) initially, Scale Plan ($69/month) for production

---

### 5. Twilio
**Purpose**: SMS, Voice, WhatsApp communication
- **SMS (US)**: $0.0079/message (outbound), $0.0079/message (inbound)
- **Voice (US)**: $0.0085/minute (inbound), $0.013/minute (outbound)
- **Phone Numbers**: $1.15/month (local), $2.00/month (toll-free)
- **WhatsApp**: 
  - Twilio fee: $0.005/message
  - Meta conversation fees: $0.005-$0.10 per conversation (varies by country)
  - Business-initiated: ~$0.04-$0.10 per conversation
  - User-initiated: Free for first 24 hours

**Estimated Usage**: 
- 1,000 SMS/month: ~$8
- 500 minutes voice/month: ~$7
- 500 WhatsApp messages/month: ~$5
- Phone number: $1.15/month
**Monthly Estimate**: $20-30/month

---

### 6. Google Gemini API
**Purpose**: AI agent planning, error analysis, context understanding
- **Gemini 2.5 Flash** (Recommended for high-volume):
  - Input: $0.30 per 1M tokens (≤200k context)
  - Output: $1.20 per 1M tokens
  - Free tier: 1,500 requests/day
- **Gemini 2.5 Pro** (Advanced reasoning):
  - Input: $1.25 per 1M tokens (≤200k context)
  - Output: $10.00 per 1M tokens
  - Free tier: 50 requests/day
- **Rate Limits**: 
  - Flash: 2,000 requests/minute
  - Pro: 1,000 requests/minute

**Estimated Usage** (10,000 requests/month, avg 1k tokens input, 500 tokens output):
- Flash: ~$18/month
- Pro: ~$62/month
**Recommendation**: Start with Flash model, use Pro for complex planning

---

### 7. Google Drive API
**Purpose**: Document storage, SOP access, brand asset management
- **API Access**: Free
- **Google Workspace Storage**:
  - Business Starter: $6/user/month (30 GB)
  - Business Standard: $12/user/month (2 TB pooled)
  - Business Plus: $18/user/month (5 TB pooled)
- **Rate Limits**: 20,000 requests/100 seconds per user

**Recommendation**: Business Standard ($12/user/month) for adequate storage

---

### 8. Vercel (Hosting)
**Purpose**: Application hosting and deployment
- **Hobby Plan**: Free
  - 100 GB bandwidth
  - Serverless function execution
  - Automatic HTTPS
- **Pro Plan**: $20/month
  - 1 TB bandwidth
  - Advanced analytics
  - Team collaboration
- **Enterprise**: Custom pricing

**Recommendation**: Pro Plan ($20/month) for production use

---

### 9. Additional Services

#### Stripe (Payment Processing)
- **Transaction Fee**: 2.9% + $0.30 per transaction
- **Monthly Fee**: None
- **Use Case**: If offering SaaS billing to end clients

#### Zapier (Alternative to Custom Integrations)
- **Free**: 100 tasks/month
- **Starter**: $19.99/month (750 tasks)
- **Professional**: $49/month (2,000 tasks)
- **Use Case**: Quick integrations without custom development

#### Playwright/Puppeteer (Browser Automation)
- **Cost**: Free (open-source)
- **Hosting**: Included in Vercel serverless functions
- **Use Case**: Web scraping, automated testing, screenshot capture

---

## Summary of Required Integrations

1. **GoHighLevel API** - Core platform integration
2. **Notion API** - Client context and knowledge base
3. **Slack Webhooks** - Team notifications
4. **Neon Database** - Application data storage
5. **Twilio API** - SMS/Voice/WhatsApp communications
6. **Google Gemini API** - AI agent intelligence
7. **Google Drive API** - Document and asset management
8. **Vercel** - Application hosting
9. **GitHub** - Code repository and version control

---

## Development Considerations

### Custom Integration Development Costs
- **In-house development**: 40-80 hours per integration @ $75-150/hour = $3,000-12,000 per integration
- **Third-party developers**: $1,500-2,000 per integration (as quoted for GHL integrations)
- **Total for 9 integrations**: $13,500-18,000 (third-party) or $27,000-108,000 (in-house)

### Ongoing Maintenance
- **Monthly maintenance**: 10-20 hours/month @ $75-150/hour = $750-3,000/month
- **Bug fixes and updates**: Included in maintenance
- **New feature development**: Separate project-based pricing

---

## Next Steps

1. Finalize service provider selection
2. Create detailed architecture diagram
3. Build comprehensive cost analysis spreadsheet
4. Document integration requirements and API specifications
5. Develop implementation timeline

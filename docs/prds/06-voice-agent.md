# PRD-06: Voice Agent Feature

## Product Requirements Document

| Field | Value |
|-------|-------|
| **Document Version** | 1.0 |
| **Status** | Draft |
| **Author** | Product Team |
| **Created** | 2026-01-11 |
| **Last Updated** | 2026-01-11 |
| **Feature ID** | VOICE-001 |

---

## 1. Overview

### 1.1 Executive Summary

The Voice Agent feature enables AI-powered outbound phone calling capabilities through Vapi.ai telephony integration. This feature allows users to create and manage automated call campaigns, execute calls to leads from enriched lead lists, track call outcomes, store recordings and transcriptions, and analyze campaign performance through comprehensive analytics.

### 1.2 Feature Scope

The Voice Agent encompasses:
- **Campaign Management**: Create, configure, start, pause, and complete call campaigns
- **Lead Integration**: Connect campaigns to lead lists for bulk calling operations
- **AI-Powered Calling**: Execute calls with customizable AI scripts via Vapi.ai
- **Call Processing**: Background job queue for reliable call execution and status polling
- **Recording & Transcription**: Automatic call recording with speech-to-text transcription
- **Analytics & Reporting**: Success rate tracking, duration metrics, and outcome analysis
- **Credit System Integration**: Usage-based billing through the credit system

### 1.3 Key Files & Architecture

| Component | File Path | Purpose |
|-----------|-----------|---------|
| Voice Router | `server/api/routers/voice.ts` | Main tRPC router for voice operations |
| AI Calling Router | `server/api/routers/aiCalling.ts` | Campaign and call management endpoints |
| Vapi Service | `server/services/vapi.service.ts` | Vapi.ai API integration with retry/circuit breaker |
| Voice Worker | `server/workers/voiceWorker.ts` | Background job processing for calls |
| Voice Transcription | `server/_core/voiceTranscription.ts` | Whisper-based transcription service |
| Queue System | `server/_core/queue.ts` | BullMQ job queue configuration |
| Database Schema | `drizzle/schema-lead-enrichment.ts` | Tables: ai_call_campaigns, ai_calls |

---

## 2. Problem Statement

### 2.1 Current Challenges

1. **Manual Outreach Limitations**: Businesses spend significant time manually calling leads, limiting scale and consistency
2. **Lack of Personalization at Scale**: Human callers cannot maintain consistent messaging across hundreds of calls
3. **Poor Lead Follow-up**: Without automation, leads often go uncalled or receive delayed follow-up
4. **Limited Tracking**: Manual calling lacks comprehensive analytics on success rates and outcomes
5. **No Recording/Transcription**: Valuable call insights are lost without systematic recording and analysis
6. **Resource Intensive**: Hiring and training human callers is expensive and time-consuming

### 2.2 Target Users

| User Type | Needs |
|-----------|-------|
| Sales Teams | Automated outreach to qualified leads with consistent messaging |
| Marketing Managers | Campaign analytics to measure outreach effectiveness |
| Small Business Owners | Cost-effective calling without hiring dedicated staff |
| Lead Generation Agencies | High-volume calling with detailed reporting for clients |

### 2.3 Business Impact

- Reduce cost per lead contacted by 60-80%
- Increase lead contact rate by 3-5x through automated follow-up
- Improve data quality with automatic transcription and outcome tracking
- Enable 24/7 calling operations across time zones

---

## 3. Goals & Success Metrics

### 3.1 Primary Goals

| Goal | Description | Priority |
|------|-------------|----------|
| G1 | Enable users to create and execute AI-powered call campaigns | P0 |
| G2 | Achieve 95%+ call delivery rate for valid phone numbers | P0 |
| G3 | Provide real-time call status and comprehensive analytics | P0 |
| G4 | Integrate seamlessly with lead management and credit system | P1 |
| G5 | Deliver accurate transcription for all recorded calls | P1 |

### 3.2 Success Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| **Call Completion Rate** | > 95% | Successful calls / Total queued calls |
| **Answer Rate** | > 40% | Answered calls / Total calls made |
| **Average Call Duration** | > 60 seconds | Sum of durations / Answered calls |
| **Transcription Accuracy** | > 95% | Manual spot-check sample |
| **System Uptime** | 99.9% | Monitoring service metrics |
| **API Response Time** | < 200ms | P95 latency for tRPC endpoints |
| **Queue Processing Time** | < 5 seconds | Time from queue to Vapi call initiation |
| **Credit Accuracy** | 100% | Audit of credit transactions vs calls |

### 3.3 Business KPIs

| KPI | Target | Timeline |
|-----|--------|----------|
| Monthly Active Campaigns | 1,000+ | 6 months |
| Total Calls Processed | 100,000+/month | 6 months |
| Credit Revenue from Voice | $50,000/month | 6 months |
| User Retention (Voice Feature) | > 70% | 3 months |

---

## 4. User Stories

### 4.1 Campaign Creation & Management

| ID | As a... | I want to... | So that... | Priority |
|----|---------|--------------|------------|----------|
| US-01 | Sales Manager | Create a new calling campaign with a custom script | I can define the messaging for my outreach | P0 |
| US-02 | User | Associate a lead list with my campaign | Calls are made to my enriched leads | P0 |
| US-03 | User | Configure voice settings (voice type, speed, language) | Calls match my brand voice | P1 |
| US-04 | User | Set call parameters (max duration, recording, voicemail detection) | I control call behavior | P1 |
| US-05 | User | Start, pause, and resume campaigns | I have control over campaign execution | P0 |
| US-06 | User | Delete campaigns I no longer need | My workspace stays organized | P2 |

### 4.2 Call Execution

| ID | As a... | I want to... | So that... | Priority |
|----|---------|--------------|------------|----------|
| US-07 | User | Queue calls to all leads in a campaign | Bulk calling is automated | P0 |
| US-08 | User | Make individual calls outside campaigns | I can test or make one-off calls | P1 |
| US-09 | User | See real-time call status | I know what's happening with my calls | P0 |
| US-10 | User | Have calls automatically retry on failure | Temporary issues don't cause lost leads | P1 |
| US-11 | User | Be notified when calls complete | I can review outcomes promptly | P2 |

### 4.3 Recording & Transcription

| ID | As a... | I want to... | So that... | Priority |
|----|---------|--------------|------------|----------|
| US-12 | User | Access call recordings | I can review actual conversations | P0 |
| US-13 | User | Read call transcripts | I can quickly scan call content | P0 |
| US-14 | User | Search within transcripts | I can find specific mentions | P2 |
| US-15 | Compliance Officer | Download recordings for compliance | Legal requirements are met | P1 |

### 4.4 Analytics & Reporting

| ID | As a... | I want to... | So that... | Priority |
|----|---------|--------------|------------|----------|
| US-16 | User | See campaign statistics (calls made, answered, success rate) | I understand campaign performance | P0 |
| US-17 | User | View call outcomes (interested, callback, not interested) | I can prioritize follow-ups | P0 |
| US-18 | Manager | Export call data for analysis | I can build custom reports | P2 |
| US-19 | User | Track credits used per campaign | I can manage my budget | P1 |
| US-20 | User | Compare campaign performance over time | I can optimize my approach | P2 |

### 4.5 Credit System

| ID | As a... | I want to... | So that... | Priority |
|----|---------|--------------|------------|----------|
| US-21 | User | See my calling credit balance | I know my remaining capacity | P0 |
| US-22 | User | Be warned before running out of credits | I can purchase more in time | P1 |
| US-23 | User | See credit deductions per call | I understand my usage | P1 |
| US-24 | Admin | Refund credits for failed calls | Users aren't charged unfairly | P1 |

---

## 5. Functional Requirements

### 5.1 Campaign Management

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | Create campaign with name, description, script, and optional lead list | P0 | Implemented |
| FR-02 | Configure campaign settings (voice, speed, language, model, temperature) | P1 | Implemented |
| FR-03 | Set max call duration (default 300 seconds / 5 minutes) | P1 | Implemented |
| FR-04 | Enable/disable call recording (default enabled) | P1 | Implemented |
| FR-05 | Enable/disable transcription (default enabled) | P1 | Implemented |
| FR-06 | Enable/disable voicemail detection (default enabled) | P1 | Implemented |
| FR-07 | Campaign status workflow: draft -> running -> paused -> completed | P0 | Implemented |
| FR-08 | Update campaign settings while in draft status | P1 | Implemented |
| FR-09 | Delete campaign with cascade delete of associated calls | P1 | Implemented |
| FR-10 | List campaigns with pagination and status filtering | P0 | Implemented |

### 5.2 Call Execution

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-11 | Start campaign to queue all leads for calling | P0 | Implemented |
| FR-12 | Queue specific leads within a campaign | P1 | Implemented |
| FR-13 | Make single ad-hoc call with script and settings | P1 | Implemented |
| FR-14 | Background job processing via BullMQ voice queue | P0 | Implemented |
| FR-15 | Concurrent call processing (max 3 concurrent, 5/second rate limit) | P0 | Implemented |
| FR-16 | Call status polling with 10-minute timeout | P0 | Implemented |
| FR-17 | Automatic retry on transient failures (2 attempts with exponential backoff) | P1 | Implemented |
| FR-18 | Phone number validation and E.164 formatting | P0 | Implemented |
| FR-19 | Skip leads without phone numbers | P1 | Implemented |

### 5.3 Vapi.ai Integration

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-20 | Create outbound calls via Vapi POST /call endpoint | P0 | Implemented |
| FR-21 | Poll call status via Vapi GET /call/{id} endpoint | P0 | Implemented |
| FR-22 | Retrieve transcripts from Vapi | P0 | Implemented |
| FR-23 | End calls via Vapi DELETE /call/{id} endpoint | P2 | Implemented |
| FR-24 | Map Vapi statuses to internal statuses | P0 | Implemented |
| FR-25 | Circuit breaker pattern for Vapi API protection | P1 | Implemented |
| FR-26 | Retry with exponential backoff for Vapi calls | P1 | Implemented |
| FR-27 | Configure AI model (default GPT-4) and temperature | P1 | Implemented |
| FR-28 | Configure 11Labs voice provider and voice selection | P1 | Implemented |

### 5.4 Recording & Transcription

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-29 | Store recording URL from Vapi | P0 | Implemented |
| FR-30 | Store transcript text from Vapi | P0 | Implemented |
| FR-31 | Whisper-based transcription for custom audio (16MB limit) | P1 | Implemented |
| FR-32 | Multi-language transcription support | P2 | Implemented |
| FR-33 | Segment-level timestamps in transcription | P2 | Implemented |

### 5.5 Analytics & Tracking

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-34 | Track total calls made per campaign | P0 | Implemented |
| FR-35 | Track calls answered, successful, and failed | P0 | Implemented |
| FR-36 | Track total call duration per campaign | P0 | Implemented |
| FR-37 | Track credits used per campaign | P0 | Implemented |
| FR-38 | Calculate success rate percentage | P0 | Implemented |
| FR-39 | Track call outcomes (interested, not_interested, callback, voicemail, no_answer, hung_up) | P0 | Implemented |
| FR-40 | List calls with pagination, status, and campaign filtering | P0 | Implemented |

### 5.6 Credit System Integration

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-41 | Check credit balance before making calls | P0 | Implemented |
| FR-42 | Deduct 1 credit per call attempt | P0 | Implemented |
| FR-43 | Record credit transactions with call reference | P0 | Implemented |
| FR-44 | Return error if insufficient credits | P0 | Implemented |
| FR-45 | Track credits used per call and per campaign | P0 | Implemented |

### 5.7 Data Model

#### ai_call_campaigns Table

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| userId | integer | Foreign key to users |
| listId | integer | Optional foreign key to lead_lists |
| name | varchar(500) | Campaign name |
| description | text | Campaign description |
| script | text | AI call script/prompt |
| status | varchar(50) | draft, running, paused, completed, cancelled |
| callsMade | integer | Total calls attempted |
| callsSuccessful | integer | Calls marked successful |
| callsFailed | integer | Calls that failed |
| callsAnswered | integer | Calls that were answered |
| totalDuration | integer | Total seconds of call time |
| costInCredits | integer | Total credits used |
| settings | jsonb | Voice, speed, language, model configuration |
| createdAt | timestamp | Creation timestamp |
| updatedAt | timestamp | Last update timestamp |
| startedAt | timestamp | When campaign started |
| completedAt | timestamp | When campaign completed |

#### ai_calls Table

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| campaignId | integer | Foreign key to ai_call_campaigns |
| userId | integer | Foreign key to users |
| leadId | integer | Optional foreign key to leads |
| phoneNumber | varchar(20) | Phone number called |
| status | varchar(50) | pending, calling, answered, no_answer, failed, completed |
| outcome | varchar(50) | interested, not_interested, callback, voicemail, no_answer, hung_up |
| vapiCallId | varchar(255) | Vapi.ai call ID |
| duration | integer | Call duration in seconds |
| recordingUrl | text | URL to call recording |
| transcript | text | Call transcript text |
| analysis | jsonb | AI analysis of call |
| notes | text | User notes |
| creditsUsed | integer | Credits charged (default 1) |
| error | text | Error message if failed |
| calledAt | timestamp | When call was initiated |
| answeredAt | timestamp | When call was answered |
| completedAt | timestamp | When call completed |

---

## 6. Non-Functional Requirements

### 6.1 Performance

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-01 | API endpoint response time | < 200ms P95 |
| NFR-02 | Queue job pickup latency | < 5 seconds |
| NFR-03 | Concurrent call capacity | 100 simultaneous calls |
| NFR-04 | Campaign start processing | < 10 seconds for 1000 leads |
| NFR-05 | Database query performance | < 50ms for standard queries |

### 6.2 Reliability

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-06 | System availability | 99.9% uptime |
| NFR-07 | Job queue durability | Zero job loss on restart |
| NFR-08 | Call delivery rate | > 95% for valid numbers |
| NFR-09 | Retry success rate | > 80% for transient failures |
| NFR-10 | Data persistence | Zero data loss |

### 6.3 Scalability

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-11 | Concurrent users | 1,000+ simultaneous |
| NFR-12 | Calls per hour | 10,000+ |
| NFR-13 | Campaigns per user | Unlimited |
| NFR-14 | Calls per campaign | 100,000+ |
| NFR-15 | Horizontal scaling | Worker process scaling |

### 6.4 Security

| ID | Requirement | Description |
|----|-------------|-------------|
| NFR-16 | Authentication | All endpoints require authenticated user |
| NFR-17 | Authorization | Users can only access their own campaigns/calls |
| NFR-18 | Data isolation | Complete tenant isolation via userId filtering |
| NFR-19 | API key security | Vapi API key stored in environment variables |
| NFR-20 | Recording access | Recordings accessible only to campaign owner |
| NFR-21 | TCPA compliance | Voicemail detection and consent tracking |

### 6.5 Observability

| ID | Requirement | Description |
|----|-------------|-------------|
| NFR-22 | Structured logging | Pino logger with request context |
| NFR-23 | Error tracking | Detailed error messages stored in database |
| NFR-24 | Queue monitoring | BullMQ queue statistics available |
| NFR-25 | Health checks | Vapi service availability monitoring |

---

## 7. Technical Architecture

### 7.1 High-Level Architecture

```
                                    +------------------+
                                    |    Vapi.ai API   |
                                    +--------^---------+
                                             |
                                             | HTTPS
                                             |
+------------------+    tRPC    +------------+------------+
|   Web Frontend   | <--------> |   tRPC API Server       |
+------------------+            +------------+------------+
                                             |
                                             | Queue Jobs
                                             |
                                +------------v------------+
                                |     Redis (BullMQ)      |
                                +------------+------------+
                                             |
                                             | Process Jobs
                                             |
                                +------------v------------+
                                |    Voice Worker         |
                                |  (voiceWorker.ts)       |
                                +------------+------------+
                                             |
                                             | Read/Write
                                             |
                                +------------v------------+
                                |    PostgreSQL DB        |
                                | (ai_calls, campaigns)   |
                                +-------------------------+
```

### 7.2 API Endpoints (tRPC)

#### Voice Router (`voice.ts`)

| Endpoint | Type | Description |
|----------|------|-------------|
| `voice.getStatus` | Query | Get voice system status and stats |
| `voice.getLeads` | Query | Get leads for calling with filters |
| `voice.createCampaign` | Mutation | Create new campaign |
| `voice.getCampaigns` | Query | List campaigns with pagination |
| `voice.getCampaign` | Query | Get single campaign details |
| `voice.startCampaign` | Mutation | Start campaign, queue all leads |
| `voice.pauseCampaign` | Mutation | Pause running campaign |
| `voice.getCampaignStats` | Query | Get campaign statistics |
| `voice.makeCall` | Mutation | Make single call |
| `voice.getCallStatus` | Query | Get call status |
| `voice.getCallTranscript` | Query | Get call transcript |
| `voice.listCalls` | Query | List calls with filters |

#### AI Calling Router (`aiCalling.ts`)

| Endpoint | Type | Description |
|----------|------|-------------|
| `aiCalling.createCampaign` | Mutation | Create campaign with validation |
| `aiCalling.getCampaigns` | Query | List campaigns |
| `aiCalling.getCampaign` | Query | Get campaign by ID |
| `aiCalling.updateCampaign` | Mutation | Update campaign settings |
| `aiCalling.startCampaign` | Mutation | Start campaign |
| `aiCalling.pauseCampaign` | Mutation | Pause campaign |
| `aiCalling.makeCall` | Mutation | Make call to specific lead |
| `aiCalling.getCalls` | Query | List calls for campaign |
| `aiCalling.getCall` | Query | Get call by ID |
| `aiCalling.updateCall` | Mutation | Update call outcome/notes |
| `aiCalling.syncCallStatus` | Mutation | Sync status from Vapi |
| `aiCalling.deleteCampaign` | Mutation | Delete campaign |

### 7.3 Job Queue Architecture

#### Queue Configuration

| Setting | Value |
|---------|-------|
| Queue Name | `voice` |
| Concurrency | 3 workers |
| Rate Limit | 5 jobs/second |
| Max Attempts | 2 |
| Backoff | Exponential (5s initial) |
| Job Retention | 24 hours (completed), 7 days (failed) |

#### Job Data Structure

```typescript
interface VoiceCallJobData {
  userId: string;
  callId: string;
  phoneNumber: string;
  assistantId?: string;
  metadata?: {
    campaignId: number;
    leadId?: number;
    script: string;
    settings: VapiCallSettings;
  };
}
```

#### Job Processing Flow

1. **Job Created**: Router calls `addVoiceCallJob()` with call data
2. **Job Queued**: BullMQ stores job in Redis
3. **Worker Pickup**: Voice worker receives job
4. **Call Initiation**: Worker calls `vapiService.createCall()`
5. **Status Polling**: Worker polls Vapi every 5 seconds
6. **Completion**: Worker updates database with final status
7. **Stats Update**: Campaign statistics updated

### 7.4 Vapi Service Architecture

```typescript
class VapiService {
  // Circuit breaker for service protection
  private circuitBreaker: CircuitBreaker;

  // Methods with retry logic
  createCall(phone, script, settings): Promise<VapiCreateCallResponse>
  getCallStatus(vapiCallId): Promise<VapiCallStatus>
  getTranscript(vapiCallId): Promise<string>
  endCall(vapiCallId): Promise<{success: boolean}>
  listCalls(limit, offset): Promise<VapiCallStatus[]>
  updateCall(vapiCallId, updates): Promise<{success: boolean}>
}
```

### 7.5 Error Handling

| Error Type | Handling | User Impact |
|------------|----------|-------------|
| Invalid phone number | Reject before queue | Immediate error message |
| Insufficient credits | Reject before queue | Immediate error message |
| Vapi API error | Retry with backoff | Job retried automatically |
| Vapi circuit open | Reject with warning | Service temporarily unavailable |
| Poll timeout | Mark call as failed | Call marked failed in database |
| Database error | Log and retry | Job retried automatically |

---

## 8. Dependencies

### 8.1 External Services

| Service | Purpose | Required |
|---------|---------|----------|
| Vapi.ai | AI telephony platform | Yes |
| Redis/Upstash | Job queue (BullMQ) | Yes |
| Whisper API | Audio transcription | No (Vapi provides transcripts) |
| 11Labs | Voice synthesis (via Vapi) | No (bundled with Vapi) |

### 8.2 Internal Dependencies

| Dependency | Purpose |
|------------|---------|
| Credit System | Usage billing and balance checks |
| Lead Management | Lead data for calling |
| Authentication | User identity and authorization |
| Database (Drizzle) | Data persistence |

### 8.3 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VAPI_API_KEY` | Yes | Vapi.ai API key |
| `VAPI_API_URL` | No | Vapi API base URL (default: https://api.vapi.ai) |
| `VAPI_PHONE_NUMBER` | No | Default outbound phone number |
| `REDIS_URL` | Yes | Redis connection string |
| `BUILT_IN_FORGE_API_URL` | No | Whisper API URL for custom transcription |
| `BUILT_IN_FORGE_API_KEY` | No | Whisper API key |

### 8.4 Package Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `bullmq` | ^5.x | Job queue |
| `ioredis` | ^5.x | Redis client |
| `zod` | ^3.x | Input validation |
| `drizzle-orm` | ^0.30.x | Database ORM |

---

## 9. Out of Scope

### 9.1 Excluded from Initial Release

| Item | Reason | Future Consideration |
|------|--------|---------------------|
| Inbound call handling | Complexity, different use case | v2.0 |
| SMS integration | Separate feature set | v1.5 |
| Multi-language scripts | AI model limitations | v1.5 |
| A/B testing for scripts | Complexity | v2.0 |
| Real-time call monitoring | WebSocket infrastructure | v1.5 |
| Custom voice cloning | Cost and complexity | v2.0 |
| Call scheduling (time-based) | Additional infrastructure | v1.5 |
| Webhook notifications | Additional infrastructure | v1.5 |
| Call sentiment analysis | AI model integration | v1.5 |
| CRM integrations | Separate feature | v2.0 |
| White-label phone numbers | Telephony provider complexity | v2.0 |

### 9.2 Assumptions

1. Users have obtained proper consent before calling leads
2. Phone numbers are valid and reachable
3. Vapi.ai maintains 99.9% availability
4. Redis is available for queue processing
5. Users understand credit costs before starting campaigns

---

## 10. Risks & Mitigations

### 10.1 Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Vapi API downtime | Medium | High | Circuit breaker, fallback messaging, queue retry |
| Redis outage | Low | High | Upstash managed Redis, graceful degradation |
| Call queue backup | Medium | Medium | Rate limiting, monitoring alerts, auto-scaling |
| Phone number blocking | Medium | Medium | Multiple phone number rotation, compliance |
| Transcription failures | Low | Low | Fallback to Vapi transcripts, retry logic |

### 10.2 Business Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Regulatory (TCPA) violations | Medium | Critical | Consent tracking, voicemail detection, DNC list |
| Credit fraud/abuse | Low | Medium | Rate limiting, anomaly detection |
| Customer complaints | Medium | Medium | Easy opt-out, compliance training |
| Vapi pricing changes | Low | High | Monitor costs, budget alerts, alternative providers |

### 10.3 Compliance Considerations

| Requirement | Implementation |
|-------------|----------------|
| TCPA compliance | Voicemail detection, consent tracking |
| GDPR | Recording deletion capability, data export |
| Call recording laws | Recording disclosure in scripts |
| Do Not Call registry | DNC list integration (future) |

---

## 11. Milestones & Timeline

### 11.1 Development Phases

| Phase | Milestone | Status | Target Date |
|-------|-----------|--------|-------------|
| 1 | Core Infrastructure | Complete | Done |
| 1.1 | Database schema (campaigns, calls) | Complete | Done |
| 1.2 | Vapi service integration | Complete | Done |
| 1.3 | Job queue setup | Complete | Done |
| 1.4 | Voice worker implementation | Complete | Done |
| 2 | API Layer | Complete | Done |
| 2.1 | Voice router endpoints | Complete | Done |
| 2.2 | AI calling router endpoints | Complete | Done |
| 2.3 | Credit system integration | Complete | Done |
| 2.4 | Input validation | Complete | Done |
| 3 | Frontend Integration | In Progress | TBD |
| 3.1 | Campaign management UI | Pending | TBD |
| 3.2 | Call monitoring dashboard | Pending | TBD |
| 3.3 | Analytics views | Pending | TBD |
| 3.4 | Recording player | Pending | TBD |
| 4 | Testing & QA | Pending | TBD |
| 4.1 | Unit tests | Pending | TBD |
| 4.2 | Integration tests | Pending | TBD |
| 4.3 | Load testing | Pending | TBD |
| 4.4 | UAT | Pending | TBD |
| 5 | Launch | Pending | TBD |
| 5.1 | Beta release | Pending | TBD |
| 5.2 | Documentation | Pending | TBD |
| 5.3 | GA release | Pending | TBD |

### 11.2 Post-Launch Roadmap

| Version | Features | Timeline |
|---------|----------|----------|
| v1.1 | Call scheduling, webhook notifications | +1 month |
| v1.5 | SMS integration, sentiment analysis | +3 months |
| v2.0 | Inbound calls, A/B testing, CRM integrations | +6 months |

---

## 12. Acceptance Criteria

### 12.1 Campaign Management

- [ ] User can create a campaign with name, description, and script
- [ ] User can configure voice settings (voice type, speed, language)
- [ ] User can associate a lead list with a campaign
- [ ] User can view list of all campaigns with pagination
- [ ] User can view single campaign details
- [ ] User can update campaign settings while in draft status
- [ ] User can delete a campaign
- [ ] Campaign status correctly transitions between states

### 12.2 Call Execution

- [ ] User can start a campaign, queuing all leads
- [ ] User can make a single ad-hoc call
- [ ] Calls are queued and processed in background
- [ ] Call status updates are reflected in database
- [ ] Failed calls are retried according to configuration
- [ ] Leads without phone numbers are skipped
- [ ] Phone numbers are validated and formatted

### 12.3 Recording & Transcription

- [ ] Call recordings are accessible via URL
- [ ] Transcripts are stored and retrievable
- [ ] Transcription is available for completed calls
- [ ] Recording URLs remain valid for at least 30 days

### 12.4 Analytics

- [ ] Campaign statistics accurately reflect call counts
- [ ] Success rate is calculated correctly
- [ ] Total duration is summed correctly
- [ ] Credit usage is tracked per campaign
- [ ] Calls can be filtered by status and outcome

### 12.5 Credit System

- [ ] Credit balance is checked before calls
- [ ] Calls are rejected if insufficient credits
- [ ] 1 credit is deducted per call attempt
- [ ] Credit transactions are recorded with references
- [ ] Campaign cost in credits is tracked

### 12.6 Security & Authorization

- [ ] All endpoints require authentication
- [ ] Users can only access their own campaigns
- [ ] Users can only access their own calls
- [ ] API keys are not exposed in responses
- [ ] Phone numbers are validated

### 12.7 Performance

- [ ] API responses complete in < 200ms (P95)
- [ ] Campaign start queues 1000 leads in < 10 seconds
- [ ] Voice worker processes jobs within 5 seconds of queue
- [ ] System handles 100 concurrent calls

### 12.8 Error Handling

- [ ] Invalid phone numbers return clear error messages
- [ ] Insufficient credits return clear error messages
- [ ] Vapi errors are logged and calls marked failed
- [ ] Queue failures trigger retries
- [ ] Circuit breaker prevents cascading failures

---

## Appendix A: Call Status Flow

```
+----------+     +----------+     +----------+     +-----------+
| pending  | --> | calling  | --> | answered | --> | completed |
+----------+     +----+-----+     +----------+     +-----------+
                      |
                      |           +----------+
                      +---------> | no_answer|
                      |           +----------+
                      |
                      |           +----------+
                      +---------> | failed   |
                                  +----------+
```

## Appendix B: Campaign Status Flow

```
+---------+     +----------+     +----------+     +------------+
| draft   | --> | running  | <-> | paused   | --> | completed  |
+---------+     +----+-----+     +----------+     +------------+
                     |
                     |           +------------+
                     +---------> | cancelled  |
                                 +------------+
```

## Appendix C: Sample API Requests

### Create Campaign

```typescript
const campaign = await trpc.voice.createCampaign.mutate({
  name: "Q1 Outreach Campaign",
  description: "Reaching out to new leads",
  script: "Hello, this is Alex from Acme Corp. I'm calling to follow up on your recent inquiry...",
  listId: 123,
  settings: {
    voice: "female",
    speed: 1.0,
    language: "en-US",
    model: "gpt-4",
    temperature: 0.7,
    maxDuration: 300,
    recordCall: true,
    transcribeCall: true,
    detectVoicemail: true,
  },
});
```

### Start Campaign

```typescript
const result = await trpc.voice.startCampaign.mutate({
  campaignId: campaign.id,
});
// Returns: { success: true, message: "Queued 150 calls", jobIds: [...] }
```

### Get Campaign Stats

```typescript
const stats = await trpc.voice.getCampaignStats.query({
  campaignId: campaign.id,
});
// Returns: { callsMade: 150, callsAnswered: 62, callsSuccessful: 45, ... }
```

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-11 | Product Team | Initial draft |

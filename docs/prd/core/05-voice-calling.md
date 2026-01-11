# PRD: AI Voice Calling System

## Overview
The AI Voice Calling System integrates Vapi.ai telephony capabilities into Bottleneck-Bots, enabling AI-powered voice agents to make and receive phone calls. It supports lead calling campaigns, appointment scheduling, follow-ups, and conversational AI interactions with full recording, transcription, and outcome tracking.

## Problem Statement
Phone-based lead outreach and customer communication remains critical for sales and service teams:
- Manual calling is time-consuming and inconsistent
- Hiring call center staff is expensive and difficult to scale
- Existing auto-dialers lack natural conversation ability
- Call outcomes are often not tracked or integrated with CRM
- Follow-up timing is often missed or delayed

AI voice agents can handle routine calls while sounding natural and adapting to conversation flow.

## Goals & Objectives

### Primary Goals
- Deploy AI voice agents for outbound lead calling campaigns
- Support natural, conversational AI interactions
- Record and transcribe all calls automatically
- Track call outcomes and integrate with lead management
- Enable scheduled and triggered calling workflows

### Success Metrics
- Call connection rate: >40%
- AI conversation completion rate: >70%
- Lead qualification accuracy: >85%
- Appointment booking rate: >15% of connected calls
- Cost per call: <$0.50

## User Stories

### Sales Manager
- As a sales manager, I want to run AI calling campaigns to warm leads so that my sales team can focus on qualified prospects
- As a sales manager, I want to see call outcomes and transcripts so that I can train my team on successful conversations

### Agency Owner
- As an agency owner, I want to offer AI calling services to clients so that I can provide more value and increase revenue
- As an agency owner, I want to customize the AI voice and script for each client so that calls sound on-brand

### Automation Developer
- As an automation developer, I want to trigger calls based on workflow events so that leads are contacted at optimal times
- As an automation developer, I want to access call outcomes programmatically so that I can build automated follow-up sequences

### End User
- As an end user, I want the AI to sound natural and handle objections so that leads don't realize they're talking to a bot
- As an end user, I want call recordings for compliance so that I have documentation of all conversations

## Functional Requirements

### Must Have (P0)

1. **Vapi.ai Integration**
   - Vapi API client setup
   - Assistant creation and management
   - Phone number provisioning
   - Call initiation and management
   - Webhook handling for call events
   - Voice model selection (ElevenLabs, PlayHT)

2. **AI Voice Agent Configuration**
   - Custom system prompts
   - Conversation scripts with branching
   - Voice selection and customization
   - Personality configuration
   - Language and accent settings
   - Response timing adjustment

3. **Lead Calling Campaigns**
   - Campaign creation with lead lists
   - Scheduled calling windows
   - Daily/hourly call limits
   - Timezone-aware scheduling
   - Priority queuing
   - Pause/resume controls
   - A/B testing for scripts

4. **Call Recording & Transcription**
   - Automatic call recording
   - Real-time transcription
   - Post-call transcript cleanup
   - Recording storage (S3)
   - Transcript search
   - Recording playback UI
   - Retention policies

5. **Call Outcome Tracking**
   - Outcome classification (answered, voicemail, busy, no answer)
   - Call disposition tags
   - Lead status updates
   - Appointment extraction
   - Follow-up scheduling
   - Notes and summary generation
   - CRM field mapping

### Should Have (P1)

1. **Inbound Call Handling**
   - Inbound number provisioning
   - IVR menu configuration
   - Call routing rules
   - Queue management
   - After-hours handling
   - Voicemail transcription

2. **Advanced Conversation Features**
   - Intent recognition
   - Entity extraction (dates, times, names)
   - Sentiment analysis
   - Objection handling scripts
   - Dynamic information lookup
   - Hold/transfer capabilities

3. **Analytics Dashboard**
   - Call volume metrics
   - Connection rates by time/day
   - Average call duration
   - Outcome distribution
   - Script effectiveness
   - Agent performance comparison
   - Cost tracking

### Nice to Have (P2)

1. **Voice Cloning**
   - Custom voice creation from samples
   - Brand voice consistency
   - Multiple voice personas
   - Voice style adaptation
   - Emotional tone control

2. **Live Call Monitoring**
   - Real-time call listening
   - Whisper coaching
   - Call takeover capability
   - Supervisor dashboard
   - Quality scoring

3. **Multi-Language Support**
   - Language detection
   - Real-time translation
   - Multi-language agents
   - Accent adaptation
   - Cultural sensitivity

## Non-Functional Requirements

### Performance
- Call initiation: <3 seconds
- Voice response latency: <500ms
- Transcription lag: <2 seconds
- Recording availability: <30 seconds post-call
- Concurrent calls: 100+ per account
- Campaign processing: 1000 calls/hour

### Security
- Call recording encryption (AES-256)
- PCI compliance for payment mentions
- TCPA compliance for call timing
- Do-not-call list integration
- Consent recording
- Data residency options

### Scalability
- Horizontal call worker scaling
- Queue-based campaign processing
- Geographic distribution for latency
- Rate limiting per phone number
- Provider failover

### Reliability
- 99.9% API availability
- Automatic retry on failures
- Call state recovery
- Recording backup
- Webhook delivery guarantee

## Technical Requirements

### Architecture
```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Campaign UI   │────▶│  Calling API     │────▶│  PostgreSQL     │
│   (React)       │◀────│  (Next.js)       │◀────│  (Campaigns)    │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌──────────────────┐
                        │   Vapi.ai        │
                        │   (Telephony)    │
                        └──────────────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
       ┌────────────┐   ┌────────────┐   ┌────────────┐
       │  Voice     │   │ Transcript │   │  Webhook   │
       │  Provider  │   │  Service   │   │  Handler   │
       └────────────┘   └────────────┘   └────────────┘
                               │
                               ▼
                        ┌────────────┐
                        │   S3       │
                        │ (Recordings)│
                        └────────────┘
```

### Dependencies
- **External Services**
  - Vapi.ai (telephony platform)
  - ElevenLabs / PlayHT (voice synthesis)
  - Deepgram / AssemblyAI (transcription)
  - Twilio (number provisioning, SMS)

- **Internal Services**
  - Lead management system
  - Workflow automation engine
  - Notification service
  - CRM integration layer

### API Specifications

#### Create Voice Agent
```typescript
POST /api/voice/agents
Request:
{
  name: string;
  systemPrompt: string;
  voice: {
    provider: 'elevenlabs' | 'playht' | 'azure';
    voiceId: string;
    settings?: {
      speed: number;
      pitch: number;
      stability: number;
    };
  };
  conversation: {
    greeting: string;
    script: ConversationNode[];
    objectionHandlers: ObjectionHandler[];
    fallbackResponse: string;
    maxDuration: number;
  };
  features: {
    recordCalls: boolean;
    transcribe: boolean;
    detectVoicemail: boolean;
    leaveVoicemail?: string;
  };
}
Response:
{
  agentId: string;
  vapiAssistantId: string;
  status: 'ready';
  createdAt: string;
}
```

#### Create Calling Campaign
```typescript
POST /api/voice/campaigns
Request:
{
  name: string;
  agentId: string;
  leadListId: string;
  schedule: {
    startDate: string;
    endDate?: string;
    callingWindows: {
      days: number[]; // 0-6
      startTime: string; // HH:mm
      endTime: string; // HH:mm
      timezone: string;
    }[];
    maxCallsPerDay?: number;
    maxCallsPerHour?: number;
  };
  retryPolicy: {
    maxAttempts: number;
    retryDelay: number; // minutes
    retryOnOutcomes: string[];
  };
  priority: 'low' | 'normal' | 'high';
}
Response:
{
  campaignId: string;
  status: 'scheduled';
  estimatedCalls: number;
  estimatedDuration: string;
}
```

#### Initiate Single Call
```typescript
POST /api/voice/calls
Request:
{
  agentId: string;
  phoneNumber: string;
  leadId?: string;
  context?: Record<string, any>;
  options?: {
    callerIdNumber?: string;
    maxDuration?: number;
    recordingMode?: 'full' | 'none' | 'consent';
  };
}
Response:
{
  callId: string;
  vapiCallId: string;
  status: 'initiating';
  estimatedWait: number;
}
```

#### Get Call Details
```typescript
GET /api/voice/calls/{callId}
Response:
{
  id: string;
  agentId: string;
  leadId?: string;
  phoneNumber: string;
  status: 'completed' | 'in_progress' | 'failed';
  outcome: {
    type: 'answered' | 'voicemail' | 'busy' | 'no_answer' | 'failed';
    disposition?: string;
    sentiment?: 'positive' | 'neutral' | 'negative';
    appointmentBooked?: {
      date: string;
      type: string;
    };
    summary: string;
  };
  timing: {
    initiatedAt: string;
    connectedAt?: string;
    endedAt?: string;
    duration: number;
    talkTime: number;
  };
  recording?: {
    url: string;
    duration: number;
    expiresAt: string;
  };
  transcript?: {
    text: string;
    segments: TranscriptSegment[];
  };
  cost: {
    total: number;
    voice: number;
    telephony: number;
    transcription: number;
  };
}
```

#### Webhook Event Handler
```typescript
POST /api/voice/webhooks/vapi
Headers:
  X-Vapi-Signature: sha256=...
Request:
{
  event: 'call.started' | 'call.ended' | 'speech.update' | 'call.analysis';
  call: VapiCall;
  transcript?: string;
  analysis?: CallAnalysis;
}
Response:
{
  received: true;
}
```

## Success Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Call Connection Rate | >40% | Connected / Dialed |
| Conversation Completion | >70% | Completed / Connected |
| Lead Qualification Accuracy | >85% | Verified qualifications / Total |
| Appointment Booking Rate | >15% | Appointments / Connected |
| Cost per Call | <$0.50 | Total cost / Calls |
| Average Call Duration | 2-4 min | Sum duration / Completed calls |
| Voicemail Detection | >95% | Correct detections / Total VM |
| Transcription Accuracy | >95% | Word error rate analysis |

## Dependencies

### Internal Dependencies
- Lead enrichment system (for lead data)
- Workflow automation (for triggers)
- Notification service (for alerts)
- Billing system (for cost tracking)

### External Dependencies
- Vapi.ai platform availability
- Voice provider uptime (ElevenLabs)
- Transcription service availability
- Phone carrier connectivity

### Blocking Dependencies
- Vapi.ai account and API access
- Voice provider accounts
- Phone number provisioning
- TCPA compliance review

## Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Vapi.ai rate limits | High | Medium | Queue management, rate limiting, capacity planning |
| Voice latency issues | High | Medium | Low-latency voice providers, edge deployment |
| Regulatory compliance (TCPA) | Critical | Medium | Calling window enforcement, DNC integration, consent tracking |
| High per-call costs | Medium | High | Cost monitoring, usage quotas, provider negotiation |
| Poor voice quality | High | Low | Multiple provider fallback, quality monitoring |
| Transcript accuracy issues | Medium | Medium | Manual review sampling, correction feedback |
| Lead data quality | Medium | High | Data validation, enrichment before calling |

## Timeline & Milestones

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| Phase 1: Vapi Integration | 3 weeks | API client, assistant creation, call initiation |
| Phase 2: Voice Agents | 2 weeks | Agent configuration, voice selection, scripts |
| Phase 3: Campaigns | 3 weeks | Campaign engine, scheduling, queue management |
| Phase 4: Recording | 2 weeks | Recording capture, transcription, storage |
| Phase 5: Outcome Tracking | 2 weeks | Classification, CRM updates, analytics |
| Phase 6: Testing | 2 weeks | Load testing, compliance review |

## Open Questions
1. Should we support SMS follow-up after calls?
2. What is the maximum campaign size we should support?
3. How do we handle timezone edge cases (leads in multiple timezones)?
4. Should we offer number rotation to improve connection rates?
5. How do we handle consent recording requirements by state?

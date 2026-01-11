# PRD-010: AI Voice Calling System

## Product Requirements Document

### Overview
| Field | Value |
|-------|-------|
| **PRD ID** | PRD-010 |
| **Feature Name** | AI Voice Calling System |
| **Category** | Lead Management |
| **Priority** | P1 - High |
| **Status** | Active |
| **Owner** | Sales Team |

---

## 1. Executive Summary

The AI Voice Calling System enables automated phone outreach using Vapi.ai integration. It supports campaign management, customizable voice configurations, AI-driven conversations with dynamic scripts, call recording, transcription, and comprehensive analytics.

## 2. Problem Statement

Sales teams spend significant time on repetitive phone calls that could be automated. Human callers have inconsistent messaging and limited availability. Teams need to scale outreach while maintaining personalized conversations and tracking outcomes.

## 3. Goals & Objectives

### Primary Goals
- Automate phone outreach at scale
- Maintain natural, personalized conversations
- Provide call outcome tracking
- Enable campaign performance analytics

### Success Metrics
| Metric | Target |
|--------|--------|
| Call Connection Rate | > 50% |
| Positive Outcome Rate | > 25% |
| Cost per Call | < $0.50 |
| Call Quality Score | > 4/5 |

## 4. User Stories

### US-001: Create Call Campaign
**As a** sales manager
**I want to** create a calling campaign
**So that** I can automate outreach to a lead list

**Acceptance Criteria:**
- [ ] Select lead list for campaign
- [ ] Configure voice and script
- [ ] Set calling schedule
- [ ] Launch campaign

### US-002: Configure AI Voice
**As a** user
**I want to** customize the AI voice persona
**So that** calls match my brand

**Acceptance Criteria:**
- [ ] Select voice gender
- [ ] Set voice characteristics
- [ ] Preview voice output
- [ ] Save voice configuration

### US-003: Review Call Outcomes
**As a** sales manager
**I want to** review call recordings and outcomes
**So that** I can improve campaigns

**Acceptance Criteria:**
- [ ] Listen to recordings
- [ ] Read transcriptions
- [ ] View outcome classification
- [ ] Export call data

## 5. Functional Requirements

### FR-001: Campaign Management
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-001.1 | Create call campaign | P0 |
| FR-001.2 | Assign lead list | P0 |
| FR-001.3 | Set schedule/timing | P1 |
| FR-001.4 | Start/Pause/Stop campaign | P0 |
| FR-001.5 | View campaign progress | P0 |

### FR-002: Voice Configuration
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-002.1 | Select voice gender | P0 |
| FR-002.2 | Configure voice tone | P1 |
| FR-002.3 | Set speaking speed | P2 |
| FR-002.4 | Voice preview | P1 |

### FR-003: Script Management
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-003.1 | Create call scripts | P0 |
| FR-003.2 | Dynamic variable insertion | P1 |
| FR-003.3 | Response handling rules | P1 |
| FR-003.4 | AI model selection | P1 |

### FR-004: Call Execution
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-004.1 | Initiate calls via Vapi | P0 |
| FR-004.2 | Track call status | P0 |
| FR-004.3 | Handle voicemail | P1 |
| FR-004.4 | Record calls | P0 |
| FR-004.5 | Transcribe calls | P0 |

### FR-005: Analytics
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-005.1 | Call outcome classification | P0 |
| FR-005.2 | Campaign performance metrics | P0 |
| FR-005.3 | Conversion tracking | P1 |
| FR-005.4 | Report generation | P2 |

## 6. Data Models

### Call Campaign
```typescript
interface CallCampaign {
  id: string;
  userId: string;
  name: string;
  leadListId: string;
  voiceConfig: VoiceConfig;
  script: CallScript;
  schedule?: CampaignSchedule;
  status: 'draft' | 'active' | 'paused' | 'completed';
  metrics: CampaignMetrics;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}
```

### Call Record
```typescript
interface CallRecord {
  id: string;
  campaignId: string;
  leadId: string;
  vapiCallId: string;
  status: 'pending' | 'calling' | 'answered' | 'no_answer' | 'failed' | 'completed';
  outcome?: 'interested' | 'not_interested' | 'callback' | 'voicemail' | 'wrong_number';
  duration?: number;
  recordingUrl?: string;
  transcription?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  startedAt?: Date;
  endedAt?: Date;
}
```

### Voice Config
```typescript
interface VoiceConfig {
  gender: 'male' | 'female' | 'neutral';
  voiceId?: string;
  speed: number;
  tone: string;
  language: string;
}
```

## 7. API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/voice-calls/campaigns` | Create campaign |
| GET | `/api/voice-calls/campaigns` | List campaigns |
| GET | `/api/voice-calls/campaigns/:id` | Get campaign |
| POST | `/api/voice-calls/campaigns/:id/start` | Start campaign |
| POST | `/api/voice-calls/campaigns/:id/pause` | Pause campaign |
| GET | `/api/voice-calls/campaigns/:id/calls` | Get campaign calls |
| GET | `/api/voice-calls/calls/:id` | Get call details |
| GET | `/api/voice-calls/calls/:id/recording` | Get recording |
| GET | `/api/voice-calls/analytics` | Get analytics |

## 8. Integration

### Vapi.ai
- Call initiation
- Real-time conversation
- Recording and transcription
- Outcome webhooks

### Webhook Events
- Call started
- Call answered
- Call ended
- Transcription ready

## 9. Call Flow

```
Campaign Start
      │
      ▼
┌─────────────┐
│ Select Lead │
└──────┬──────┘
       ▼
┌─────────────┐     ┌──────────────┐
│ Place Call  │────▶│ No Answer?   │──Yes──▶ Mark & Next
└──────┬──────┘     └──────────────┘
       │ Answered
       ▼
┌─────────────┐
│ AI Converse │
└──────┬──────┘
       ▼
┌─────────────┐
│ Record &    │
│ Transcribe  │
└──────┬──────┘
       ▼
┌─────────────┐
│ Classify    │
│ Outcome     │
└──────┬──────┘
       ▼
   Next Lead
```

## 10. Dependencies

| Dependency | Purpose |
|------------|---------|
| Vapi.ai | Voice AI platform |
| PRD-009 | Lead data |
| Storage | Recording storage |

## 11. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Regulatory compliance | High | Consent, DNC lists |
| Voice quality | Medium | Voice testing, monitoring |
| High call costs | Medium | Daily limits, optimization |

---

## Appendix

### A. Voice Options
| Voice ID | Description |
|----------|-------------|
| Rachel | Professional female |
| Michael | Professional male |
| Neutral | Gender-neutral AI |

### B. Changelog
| Date | Version | Changes |
|------|---------|---------|
| 2024-01-11 | 1.0 | Initial PRD creation |

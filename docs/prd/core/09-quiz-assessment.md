# PRD: Quiz & Assessment System

## Overview
The Quiz & Assessment System enables users to create, manage, and administer quizzes and assessments within Bottleneck-Bots. It supports multiple question types, automatic and manual grading, progress tracking, and configurable time and attempt limits. This system is designed for onboarding, training, lead qualification, and educational purposes within the platform.

## Problem Statement
Organizations need assessment capabilities for various use cases:
- Onboarding new team members requires knowledge validation
- Lead qualification often involves discovery questionnaires
- Training programs need progress tracking and certification
- Customer feedback collection requires structured surveys
- Manual grading and tracking is inefficient at scale
- Assessment data is disconnected from automation workflows

## Goals & Objectives

### Primary Goals
- Enable creation of quizzes with diverse question types
- Support both automatic grading and manual review workflows
- Track user progress and completion across assessments
- Enforce time limits and attempt restrictions
- Integrate assessment results with workflows and lead management

### Success Metrics
- Quiz creation time: <15 minutes for 20 questions
- Auto-grading accuracy: 100% for objective questions
- User completion rate: >75%
- Assessment load time: <2 seconds
- Result processing: <5 seconds post-submission

## User Stories

### Training Manager
- As a training manager, I want to create quizzes to test employee knowledge so that I can ensure training effectiveness
- As a training manager, I want to track completion rates and scores so that I can identify knowledge gaps

### Agency Owner
- As an agency owner, I want to create qualification quizzes for leads so that I can pre-screen prospects
- As an agency owner, I want quiz results to flow into my CRM so that sales has context before calls

### Course Creator
- As a course creator, I want to add assessments between modules so that learners demonstrate comprehension
- As a course creator, I want to set passing scores so that learners must achieve competency

### End User
- As a quiz taker, I want clear progress indication so that I know how much is remaining
- As a quiz taker, I want to save progress and resume later so that I can complete on my schedule

## Functional Requirements

### Must Have (P0)

1. **Quiz Creation**
   - Quiz title and description
   - Instructions and welcome message
   - Quiz categorization and tagging
   - Draft and published states
   - Quiz duplication
   - Import/export functionality
   - Question reordering (drag-and-drop)
   - Question grouping/sections

2. **Question Types**
   - **Multiple Choice (Single Answer)**
     - 2-10 answer options
     - Correct answer marking
     - Optional explanation for feedback
   - **Multiple Choice (Multiple Answers)**
     - Checkbox selection
     - Partial credit options
     - All-or-nothing scoring option
   - **True/False**
     - Binary selection
     - Instant validation option
   - **Short Answer**
     - Text input field
     - Character/word limits
     - Keyword-based auto-grading
     - Exact match or fuzzy matching
   - **Long Answer/Essay**
     - Rich text editor
     - Word count display
     - Manual grading required
     - Rubric support
   - **Rating Scale**
     - Numeric scale (1-5, 1-10)
     - Custom labels
     - Star rating option
   - **File Upload**
     - Accepted file types
     - Size limits
     - Manual review required

3. **Automatic Grading**
   - Instant scoring for objective questions
   - Point values per question
   - Partial credit configuration
   - Score calculation formulas
   - Passing threshold setting
   - Immediate feedback option
   - Answer reveal configuration

4. **Manual Grading**
   - Grading queue for essays
   - Rubric-based scoring
   - Inline comments on responses
   - Grader assignment
   - Batch grading tools
   - Grade override capability
   - Grading deadline tracking

5. **Progress Tracking**
   - Question-by-question progress
   - Auto-save responses
   - Resume capability
   - Completion percentage
   - Time spent tracking
   - Section completion status
   - Progress notifications

6. **Time & Attempt Limits**
   - Quiz-level time limit
   - Per-question time limit option
   - Countdown timer display
   - Auto-submit on timeout
   - Maximum attempts configuration
   - Attempt cooldown periods
   - Proctoring-ready timestamps

### Should Have (P1)

1. **Conditional Logic**
   - Skip logic based on answers
   - Branching question paths
   - Score-based routing
   - Display conditions
   - Dynamic question selection

2. **Results & Analytics**
   - Individual result reports
   - Score distribution charts
   - Question-level analytics
   - Time analysis per question
   - Difficulty analysis
   - Discrimination index
   - Export to CSV/PDF

3. **Certificates & Badges**
   - Completion certificates
   - Custom certificate templates
   - Badge awards
   - Certificate verification
   - Social sharing

4. **Question Bank**
   - Central question repository
   - Random question selection
   - Question categorization
   - Difficulty tagging
   - Usage statistics
   - Question versioning

### Nice to Have (P2)

1. **AI-Powered Features**
   - AI question generation from content
   - Answer evaluation assistance
   - Plagiarism detection
   - Personalized question selection
   - Difficulty calibration

2. **Advanced Proctoring**
   - Webcam monitoring
   - Screen recording
   - Tab-switch detection
   - Copy-paste prevention
   - Identity verification

3. **Gamification**
   - Leaderboards
   - Point streaks
   - Achievement unlocks
   - Team competitions
   - Reward redemption

## Non-Functional Requirements

### Performance
- Quiz load time: <2 seconds
- Question render: <200ms
- Auto-save latency: <500ms
- Result calculation: <5 seconds
- Analytics generation: <10 seconds
- Concurrent quiz takers: 1000+

### Security
- Response encryption
- Answer key protection
- Session validation
- Anti-cheating measures
- Access control by quiz
- Audit logging
- FERPA compliance (educational)

### Scalability
- 10,000+ quizzes per account
- 1,000,000+ responses storage
- Distributed submission processing
- CDN for media assets
- Horizontal scaling

### Reliability
- 99.9% uptime during assessments
- Response backup and recovery
- Graceful timeout handling
- Offline support (PWA)
- Data consistency guarantees

## Technical Requirements

### Architecture
```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Quiz Builder  │────▶│  Quiz API        │────▶│  PostgreSQL     │
│   (React)       │◀────│  (Next.js)       │◀────│  (Quizzes)      │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌──────────────────┐
                        │   Quiz Taker     │
                        │   (React)        │
                        └──────────────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
       ┌────────────┐   ┌────────────┐   ┌────────────┐
       │  Grading   │   │  Progress  │   │  Analytics │
       │  Engine    │   │  Service   │   │  Service   │
       └────────────┘   └────────────┘   └────────────┘
              │                │                │
              ▼                ▼                ▼
       ┌────────────┐   ┌────────────┐   ┌────────────┐
       │  Redis     │   │  S3        │   │  Workflow  │
       │  (Sessions)│   │  (Files)   │   │  Trigger   │
       └────────────┘   └────────────┘   └────────────┘
```

### Dependencies
- **Frontend**
  - React (quiz builder and taker)
  - Tiptap (rich text editor)
  - React DnD (question reordering)
  - Chart.js (analytics)

- **Backend**
  - BullMQ (grading queue)
  - Redis (session management)
  - S3 (file uploads)
  - PDF generation (certificates)

### API Specifications

#### Create Quiz
```typescript
POST /api/quizzes
Request:
{
  title: string;
  description?: string;
  instructions?: string;
  settings: {
    timeLimit?: number; // minutes
    maxAttempts?: number;
    passingScore?: number;
    shuffleQuestions?: boolean;
    shuffleAnswers?: boolean;
    showCorrectAnswers?: 'never' | 'after_submission' | 'after_deadline';
    allowBackNavigation?: boolean;
  };
  questions: Question[];
  tags?: string[];
  category?: string;
}
Response:
{
  quizId: string;
  status: 'draft';
  questionCount: number;
  totalPoints: number;
  estimatedTime: number;
  shareUrl?: string;
  createdAt: string;
}
```

#### Question Schema
```typescript
interface Question {
  id?: string;
  type: 'multiple_choice' | 'multi_select' | 'true_false' | 'short_answer' | 'long_answer' | 'rating' | 'file_upload';
  text: string;
  description?: string;
  points: number;
  required?: boolean;
  media?: {
    type: 'image' | 'video' | 'audio';
    url: string;
  };
  // For choice questions
  options?: {
    id: string;
    text: string;
    isCorrect?: boolean;
    points?: number; // for partial credit
  }[];
  // For short answer
  acceptedAnswers?: string[];
  matchMode?: 'exact' | 'contains' | 'fuzzy';
  // For long answer
  rubric?: RubricItem[];
  wordLimit?: { min?: number; max?: number };
  // For rating
  scale?: { min: number; max: number; labels?: string[] };
  // For file upload
  acceptedTypes?: string[];
  maxFileSize?: number;
}
```

#### Start Quiz Attempt
```typescript
POST /api/quizzes/{quizId}/attempts
Request:
{
  userId?: string; // for anonymous or identified
  metadata?: Record<string, any>;
}
Response:
{
  attemptId: string;
  quizId: string;
  startedAt: string;
  expiresAt?: string;
  timeRemaining?: number;
  currentQuestion: number;
  totalQuestions: number;
  questions: QuizQuestion[]; // with shuffled order if configured
}
```

#### Submit Response
```typescript
POST /api/quizzes/{quizId}/attempts/{attemptId}/responses
Request:
{
  questionId: string;
  response: {
    selectedOptions?: string[];
    textAnswer?: string;
    rating?: number;
    fileId?: string;
  };
  timeSpent?: number;
}
Response:
{
  saved: true;
  progress: {
    answered: number;
    total: number;
    percentage: number;
  };
  // If immediate feedback enabled:
  feedback?: {
    isCorrect?: boolean;
    points?: number;
    explanation?: string;
  };
}
```

#### Submit Quiz
```typescript
POST /api/quizzes/{quizId}/attempts/{attemptId}/submit
Request:
{
  confirmSubmit: boolean;
}
Response:
{
  attemptId: string;
  status: 'submitted' | 'grading' | 'completed';
  submittedAt: string;
  results?: {
    score: number;
    totalPoints: number;
    percentage: number;
    passed: boolean;
    timeSpent: number;
    correctAnswers: number;
    incorrectAnswers: number;
    unanswered: number;
    questionResults?: QuestionResult[];
  };
  certificate?: {
    url: string;
    code: string;
  };
  pendingManualGrading?: number;
}
```

#### Grade Essay Response
```typescript
POST /api/quizzes/{quizId}/responses/{responseId}/grade
Request:
{
  score: number;
  feedback?: string;
  rubricScores?: {
    criteriaId: string;
    score: number;
    comment?: string;
  }[];
}
Response:
{
  responseId: string;
  score: number;
  gradedBy: string;
  gradedAt: string;
  attemptStatus: 'completed' | 'partially_graded';
}
```

#### Get Quiz Analytics
```typescript
GET /api/quizzes/{quizId}/analytics
Query:
{
  dateRange?: { start: string; end: string };
}
Response:
{
  quizId: string;
  summary: {
    totalAttempts: number;
    uniqueUsers: number;
    completionRate: number;
    averageScore: number;
    passRate: number;
    averageTime: number;
  };
  scoreDistribution: {
    range: string;
    count: number;
  }[];
  questionAnalytics: {
    questionId: string;
    questionText: string;
    correctRate: number;
    averageTime: number;
    difficultyIndex: number;
    optionDistribution?: Record<string, number>;
  }[];
  timeAnalytics: {
    averageTimePerQuestion: number[];
    submissionTimes: { hour: number; count: number }[];
  };
}
```

## Success Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Quiz Creation Time | <15 min for 20Q | User session tracking |
| Auto-grading Accuracy | 100% | Validation testing |
| User Completion Rate | >75% | Completed / Started |
| Assessment Load Time | <2s | Performance monitoring |
| Result Processing | <5s | Post-submission timing |
| Manual Grading Time | <5 min/essay | Grader analytics |
| User Satisfaction | >4.5/5 | In-quiz feedback |

## Dependencies

### Internal Dependencies
- User authentication system
- Workflow automation (for result triggers)
- Lead management (for qualification quizzes)
- Notification service (for results)
- Storage service (for file uploads)

### External Dependencies
- None (self-contained)

### Blocking Dependencies
- File upload infrastructure
- PDF generation service

## Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Response loss during submission | Critical | Low | Auto-save, confirmation, recovery |
| Timer synchronization issues | High | Medium | Server-side timing, sync checks |
| Cheating/answer sharing | Medium | High | Question randomization, time limits, proctoring |
| Manual grading backlog | Medium | Medium | Grading queue management, SLA alerts |
| Large file upload failures | Low | Medium | Chunked uploads, resume capability |
| Complex quiz performance | Medium | Medium | Lazy loading, pagination, optimization |
| Accessibility compliance | Medium | Low | WCAG audit, screen reader testing |

## Timeline & Milestones

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| Phase 1: Quiz Builder | 3 weeks | UI, question types, settings |
| Phase 2: Quiz Taking | 3 weeks | Taker UI, progress, timer |
| Phase 3: Auto-Grading | 2 weeks | Scoring engine, feedback |
| Phase 4: Manual Grading | 2 weeks | Queue, rubrics, batch tools |
| Phase 5: Analytics | 2 weeks | Reports, charts, exports |
| Phase 6: Integration | 2 weeks | Workflows, CRM triggers |
| Phase 7: Testing | 2 weeks | E2E testing, accessibility |

## Open Questions
1. Should we support question pools for randomized quiz generation?
2. What is the maximum quiz length we should support?
3. Should we integrate with external proctoring services?
4. How do we handle time zones for deadline-based quizzes?
5. Should quiz results trigger automated follow-up sequences?

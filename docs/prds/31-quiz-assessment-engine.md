# PRD-031: Quiz/Assessment Engine

## Product Requirements Document

### Overview
| Field | Value |
|-------|-------|
| **PRD ID** | PRD-031 |
| **Feature Name** | Quiz/Assessment Engine |
| **Category** | Assessment & Training |
| **Priority** | P1 - High |
| **Status** | Active |
| **Owner** | Training & Assessment Team |
| **API Location** | `server/api/routers/quiz.ts` |

---

## 1. Executive Summary

The Quiz/Assessment Engine is a comprehensive assessment platform that enables organizations to create, manage, and deploy customizable quizzes and assessments. The system supports multiple question formats (multiple choice, true/false, short answer, essay), automated scoring with configurable pass thresholds, attempt tracking and limits, and detailed performance analytics. It integrates with the broader Bottleneck Bots platform to support employee training, knowledge verification, certification programs, and customer onboarding assessments.

### Key Capabilities
- **Quiz Creation & Management**: Full CRUD operations with versioning and publishing workflows
- **Multi-Format Questions**: Support for multiple choice, true/false, short answer, essay, and custom formats
- **Automated Scoring**: Intelligent auto-scoring for objective questions with configurable tolerance
- **Attempt Management**: Track user attempts with configurable limits and resumption support
- **Progress Monitoring**: Real-time tracking of user progress and performance analytics
- **Result Analytics**: Comprehensive reporting on individual and aggregate performance

---

## 2. Problem Statement

### Current Challenges

Organizations face significant challenges in assessing knowledge and skills systematically:

1. **Manual Assessment Burden**: Manual grading is time-consuming, inconsistent, and doesn't scale with growing teams
2. **Limited Question Formats**: Many platforms only support basic multiple choice, limiting assessment depth
3. **No Progress Tracking**: Training effectiveness is difficult to measure without centralized progress data
4. **Lack of Insights**: Users and managers lack visibility into learning progress and knowledge gaps
5. **Inflexible Delivery**: Rigid assessment scheduling doesn't accommodate diverse learner needs
6. **Fragmented Systems**: Assessments disconnected from other training and workflow systems

### Target Users

| User Type | Needs |
|-----------|-------|
| **Training Managers** | Create and manage assessments, track team progress, identify gaps |
| **Instructors** | Design effective questions, review results, provide feedback |
| **Learners/Employees** | Take assessments, track progress, understand improvement areas |
| **HR Teams** | Certification tracking, compliance verification, onboarding assessments |
| **System Administrators** | Configure platform settings, manage permissions, export data |

---

## 3. Goals & Objectives

### Primary Goals

1. **Enable Flexible Assessment Creation**: Support diverse question types and quiz configurations
2. **Automate Scoring & Grading**: Eliminate manual grading for objective questions
3. **Track Learner Progress**: Provide comprehensive attempt history and performance tracking
4. **Deliver Actionable Analytics**: Enable data-driven training decisions
5. **Ensure Assessment Integrity**: Implement time limits, attempt restrictions, and randomization

### Success Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Quiz Completion Rate | > 85% | Submitted attempts / Started attempts |
| Scoring Accuracy | 100% for objective | Automated test validation |
| Average Assessment Time | < 15 minutes | Time from start to submit |
| User Satisfaction | > 4.2/5 | Post-assessment survey |
| Grading Turnaround | < 24 hours for essays | Time from submit to graded |
| System Availability | > 99.5% | Uptime monitoring |
| API Response Time | < 200ms (p95) | Performance monitoring |

### OKRs

**Objective 1**: Deliver best-in-class assessment experience
- KR1: 90% of quizzes created use advanced features (time limits, randomization)
- KR2: Reduce average grading time by 75% through automation
- KR3: Achieve NPS score > 50 for assessment feature

**Objective 2**: Enable data-driven training decisions
- KR1: 100% of organizations using quiz analytics dashboard monthly
- KR2: Identify knowledge gaps with 85% accuracy vs manual analysis
- KR3: Improve pass rates by 20% through targeted remediation

---

## 4. User Stories

### Epic 1: Quiz Creation & Management

#### US-001: Create Quiz
**As a** training manager
**I want to** create a new quiz with title, description, and settings
**So that** I can assess employee knowledge on specific topics

**Acceptance Criteria:**
- [ ] Create quiz with required title (1-500 characters)
- [ ] Add optional description
- [ ] Set category for organization
- [ ] Configure difficulty level (easy, medium, hard)
- [ ] Set time limit (optional, in minutes)
- [ ] Define passing score threshold (0-100%)
- [ ] Configure maximum attempts allowed
- [ ] Save as draft or publish immediately
- [ ] Add tags for searchability

**Technical Notes:**
- Endpoint: `POST /api/trpc/quiz.createQuiz`
- Authentication: Required (protectedProcedure)
- Returns created quiz with ID

---

#### US-002: Add Questions to Quiz
**As a** quiz creator
**I want to** add various question types to my quiz
**So that** I can assess different aspects of knowledge

**Acceptance Criteria:**
- [ ] Add multiple choice questions with 2-6 options
- [ ] Add true/false questions
- [ ] Add short answer questions with expected response
- [ ] Add essay questions for open-ended responses
- [ ] Set point value per question (default: 1)
- [ ] Define correct answer(s) for auto-scoring
- [ ] Add optional explanation shown after answer
- [ ] Add optional hint for difficult questions
- [ ] Reorder questions via drag-and-drop
- [ ] Preview question as learner would see it

**Technical Notes:**
- Endpoint: `POST /api/trpc/quiz.addQuestion`
- Supports question types: `multiple_choice`, `true_false`, `short_answer`, `essay`

---

#### US-003: Edit Quiz
**As a** quiz owner
**I want to** modify quiz settings and content
**So that** I can improve or correct my assessment

**Acceptance Criteria:**
- [ ] Edit all quiz metadata (title, description, settings)
- [ ] Update individual questions
- [ ] Delete questions (with confirmation)
- [ ] Reorder questions
- [ ] Unpublish quiz to make edits
- [ ] Track edit history
- [ ] Prevent edits to quiz with active attempts (warning)

**Technical Notes:**
- Endpoint: `PUT /api/trpc/quiz.updateQuiz`
- Ownership verification required

---

#### US-004: Duplicate Quiz
**As a** training manager
**I want to** duplicate an existing quiz
**So that** I can create variations without starting from scratch

**Acceptance Criteria:**
- [ ] Clone quiz with all questions
- [ ] New quiz created in draft status
- [ ] Original quiz unchanged
- [ ] Option to include/exclude attempt history
- [ ] Maintain original author attribution

---

#### US-005: Delete Quiz
**As a** quiz owner
**I want to** delete a quiz I no longer need
**So that** I can keep my quiz library organized

**Acceptance Criteria:**
- [ ] Soft delete preserves data
- [ ] Associated questions marked deleted
- [ ] Historical attempts preserved for records
- [ ] Confirmation required
- [ ] Admin can hard delete if needed

**Technical Notes:**
- Endpoint: `DELETE /api/trpc/quiz.deleteQuiz`
- Cascading delete: attempts -> questions -> quiz

---

### Epic 2: Quiz Taking Experience

#### US-006: Browse Available Quizzes
**As a** learner
**I want to** see available quizzes I can take
**So that** I can choose appropriate assessments

**Acceptance Criteria:**
- [ ] List published, active quizzes
- [ ] Filter by category, difficulty, tags
- [ ] Show quiz metadata (title, description, time limit)
- [ ] Show my attempt history per quiz
- [ ] Indicate if attempts remaining
- [ ] Search by quiz title

**Technical Notes:**
- Endpoint: `GET /api/trpc/quiz.listQuizzes`
- Public procedure (no auth required for listing)

---

#### US-007: Start Quiz Attempt
**As a** learner
**I want to** begin a quiz attempt
**So that** I can demonstrate my knowledge

**Acceptance Criteria:**
- [ ] Verify quiz is published and active
- [ ] Check attempt limit not exceeded
- [ ] Create new attempt record
- [ ] Start timer if time limit configured
- [ ] Show first question
- [ ] Prevent starting if already have in-progress attempt
- [ ] Display attempt number (e.g., "Attempt 2 of 3")

**Technical Notes:**
- Endpoint: `POST /api/trpc/quiz.startAttempt`
- Creates attempt with status: `in_progress`

---

#### US-008: Answer Questions
**As a** learner
**I want to** submit answers to quiz questions
**So that** I can complete the assessment

**Acceptance Criteria:**
- [ ] Submit answer for current question
- [ ] Navigate between questions
- [ ] Update previous answers
- [ ] Auto-save answers periodically
- [ ] Flag questions for review
- [ ] See progress indicator
- [ ] Resume if browser closes (within time limit)

**Technical Notes:**
- Endpoint: `POST /api/trpc/quiz.submitAnswer`
- Answers stored as JSON array in attempt record

---

#### US-009: Submit Quiz
**As a** learner
**I want to** submit my completed quiz for grading
**So that** I can receive my score

**Acceptance Criteria:**
- [ ] Review all answers before submission
- [ ] Warning for unanswered questions
- [ ] Confirmation before final submit
- [ ] Calculate score automatically for objective questions
- [ ] Record time spent
- [ ] Determine pass/fail status
- [ ] Show immediate results (if configured)

**Technical Notes:**
- Endpoint: `POST /api/trpc/quiz.submitAttempt`
- Automatic scoring algorithm for multiple_choice, true_false, short_answer

---

#### US-010: View Results
**As a** learner
**I want to** see my quiz results after submission
**So that** I can understand my performance

**Acceptance Criteria:**
- [ ] Display overall score and percentage
- [ ] Show pass/fail status
- [ ] Display time spent
- [ ] Question-by-question breakdown (if enabled)
- [ ] Show correct answers (if enabled)
- [ ] Display explanations for questions
- [ ] Highlight areas for improvement
- [ ] Compare to passing score

---

### Epic 3: Progress Monitoring & Analytics

#### US-011: View My Attempt History
**As a** learner
**I want to** see my quiz attempt history
**So that** I can track my learning progress

**Acceptance Criteria:**
- [ ] List all my attempts across quizzes
- [ ] Filter by quiz, status, date range
- [ ] Show score, pass/fail, date for each
- [ ] View detailed results for any attempt
- [ ] Track improvement over multiple attempts

**Technical Notes:**
- Endpoint: `GET /api/trpc/quiz.getUserAttempts`

---

#### US-012: Quiz Analytics Dashboard
**As a** training manager
**I want to** view analytics for my quizzes
**So that** I can assess training effectiveness

**Acceptance Criteria:**
- [ ] Overall pass rate per quiz
- [ ] Score distribution histogram
- [ ] Average time to complete
- [ ] Question-level analysis (difficulty, discrimination)
- [ ] Identify problematic questions
- [ ] Track improvement over time
- [ ] Compare performance across groups
- [ ] Export analytics data

---

#### US-013: Individual Learner Reports
**As a** training manager
**I want to** view individual learner performance
**So that** I can provide targeted support

**Acceptance Criteria:**
- [ ] All attempts by a specific user
- [ ] Performance trend over time
- [ ] Strength and weakness areas
- [ ] Comparison to peer average
- [ ] Time spent patterns
- [ ] Recommended remediation

---

### Epic 4: Manual Grading & Feedback

#### US-014: Grade Essay Questions
**As an** instructor
**I want to** grade essay responses manually
**So that** open-ended questions can be properly assessed

**Acceptance Criteria:**
- [ ] Queue of essays pending review
- [ ] View question and student response
- [ ] Assign points (0 to max points)
- [ ] Add written feedback
- [ ] Use grading rubric (optional)
- [ ] Support partial credit
- [ ] Update overall score after grading
- [ ] Notify student when graded

---

#### US-015: Provide Attempt Feedback
**As an** instructor
**I want to** add overall feedback to an attempt
**So that** learners receive guidance for improvement

**Acceptance Criteria:**
- [ ] Add text feedback to any graded attempt
- [ ] Feedback visible to learner in results
- [ ] Timestamp and author recorded
- [ ] Support formatted text (markdown)

---

## 5. Functional Requirements

### FR-001: Quiz Management

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-001.1 | Create quiz with title, description, settings | P0 | Implemented |
| FR-001.2 | Update quiz metadata | P0 | Implemented |
| FR-001.3 | Delete quiz with cascade | P0 | Implemented |
| FR-001.4 | Publish/unpublish quiz | P0 | Implemented |
| FR-001.5 | Duplicate quiz | P2 | Planned |
| FR-001.6 | Quiz versioning | P2 | Planned |
| FR-001.7 | Quiz templates | P3 | Future |
| FR-001.8 | Bulk import questions | P2 | Planned |
| FR-001.9 | Quiz scheduling (start/end dates) | P2 | Planned |
| FR-001.10 | Quiz access controls | P1 | Planned |

### FR-002: Question Types

| ID | Question Type | Priority | Status |
|----|--------------|----------|--------|
| FR-002.1 | Multiple choice (single answer) | P0 | Implemented |
| FR-002.2 | Multiple choice (multiple answers) | P0 | Implemented |
| FR-002.3 | True/False | P0 | Implemented |
| FR-002.4 | Short answer (text) | P0 | Implemented |
| FR-002.5 | Essay (long form) | P1 | Implemented |
| FR-002.6 | Matching | P2 | Planned |
| FR-002.7 | Fill in the blank | P2 | Planned |
| FR-002.8 | Ordering/Sequence | P2 | Planned |
| FR-002.9 | Image-based questions | P2 | Planned |
| FR-002.10 | Code execution questions | P3 | Future |

### FR-003: Quiz Configuration

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-003.1 | Time limit (minutes) | P1 | Implemented |
| FR-003.2 | Passing score threshold | P0 | Implemented |
| FR-003.3 | Maximum attempts allowed | P1 | Implemented |
| FR-003.4 | Question randomization | P2 | Planned |
| FR-003.5 | Answer option shuffling | P2 | Planned |
| FR-003.6 | Difficulty levels | P1 | Implemented |
| FR-003.7 | Category assignment | P1 | Implemented |
| FR-003.8 | Tags for organization | P1 | Implemented |
| FR-003.9 | Show results immediately | P1 | Planned |
| FR-003.10 | Show correct answers | P1 | Planned |

### FR-004: Assessment & Scoring

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-004.1 | Start new attempt | P0 | Implemented |
| FR-004.2 | Submit individual answers | P0 | Implemented |
| FR-004.3 | Auto-save progress | P1 | Planned |
| FR-004.4 | Resume in-progress attempt | P1 | Planned |
| FR-004.5 | Submit attempt for grading | P0 | Implemented |
| FR-004.6 | Auto-score multiple choice | P0 | Implemented |
| FR-004.7 | Auto-score true/false | P0 | Implemented |
| FR-004.8 | Auto-score short answer | P1 | Implemented |
| FR-004.9 | Manual grading for essays | P1 | Planned |
| FR-004.10 | Partial credit support | P2 | Planned |
| FR-004.11 | Time tracking | P0 | Implemented |
| FR-004.12 | Pass/fail determination | P0 | Implemented |

### FR-005: Analytics & Reporting

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-005.1 | Individual attempt history | P0 | Implemented |
| FR-005.2 | Quiz-level statistics | P1 | Planned |
| FR-005.3 | Question analysis | P1 | Planned |
| FR-005.4 | User progress tracking | P1 | Planned |
| FR-005.5 | Exportable reports (CSV/PDF) | P2 | Planned |
| FR-005.6 | Dashboard visualizations | P2 | Planned |
| FR-005.7 | Trend analysis | P2 | Planned |
| FR-005.8 | Benchmark comparisons | P3 | Future |

---

## 6. Non-Functional Requirements

### Performance

| Requirement | Target | Measurement |
|-------------|--------|-------------|
| Quiz list load time | < 500ms | API response time |
| Question render time | < 200ms | Client-side metrics |
| Answer submission | < 300ms | API response time |
| Score calculation | < 1 second | Server-side processing |
| Concurrent users | 1000+ per quiz | Load testing |
| Database query time | < 100ms | Query profiling |

### Scalability

- Support 10,000+ quizzes per organization
- Support 100,000+ questions across platform
- Support 1,000,000+ attempts in system
- Horizontal scaling via database partitioning
- CDN for static assets (images, media)

### Reliability

| Requirement | Target |
|-------------|--------|
| System uptime | 99.5% |
| Data durability | 99.99% |
| Backup frequency | Every 6 hours |
| Recovery time | < 4 hours |
| Zero data loss on submission | Required |

### Security

- All API endpoints authenticated (except public quiz listing)
- User can only access own attempts
- Quiz owners can only manage own quizzes
- Answers encrypted at rest
- Rate limiting on submission endpoints
- CSRF protection on all mutations
- Audit logging for administrative actions

### Accessibility

- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode
- Configurable font sizes
- Time extensions for accessibility needs

---

## 7. Technical Architecture

### System Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Quiz/Assessment Engine                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                     Frontend Layer                            │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐   │   │
│  │  │ Quiz Builder│  │ Quiz Taker  │  │  Analytics Dashboard│   │   │
│  │  │   (Admin)   │  │  (Learner)  │  │     (Manager)       │   │   │
│  │  └─────────────┘  └─────────────┘  └─────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                              │                                       │
│                              ▼                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                      API Layer (tRPC)                         │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐   │   │
│  │  │createQuiz   │  │startAttempt │  │  getUserAttempts    │   │   │
│  │  │updateQuiz   │  │submitAnswer │  │  getQuizAnalytics   │   │   │
│  │  │addQuestion  │  │submitAttempt│  │  gradeAttempt       │   │   │
│  │  │listQuizzes  │  │getQuiz      │  │                     │   │   │
│  │  └─────────────┘  └─────────────┘  └─────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                              │                                       │
│                              ▼                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                   Business Logic Layer                        │   │
│  │  ┌─────────────────┐  ┌──────────────┐  ┌────────────────┐   │   │
│  │  │ Scoring Engine  │  │ Timer Service│  │ Analytics Calc │   │   │
│  │  │ - Auto-score    │  │ - Enforce    │  │ - Stats        │   │   │
│  │  │ - Partial credit│  │ - Track time │  │ - Reports      │   │   │
│  │  │ - Manual queue  │  │ - Timeout    │  │ - Trends       │   │   │
│  │  └─────────────────┘  └──────────────┘  └────────────────┘   │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                              │                                       │
│                              ▼                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    Data Layer (Drizzle ORM)                   │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐   │   │
│  │  │   quizzes   │  │quiz_questions│ │   quiz_attempts     │   │   │
│  │  │   table     │  │   table     │  │      table          │   │   │
│  │  └─────────────┘  └─────────────┘  └─────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                              │                                       │
│                              ▼                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                  PostgreSQL (Supabase)                        │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Scoring Engine Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Submit    │────▶│  Get Quiz   │────▶│Get Questions│
│   Attempt   │     │   Config    │     │  & Answers  │
└─────────────┘     └─────────────┘     └─────────────┘
                                              │
                    ┌─────────────────────────┘
                    ▼
        ┌───────────────────────┐
        │   For Each Question   │
        └───────────┬───────────┘
                    │
        ┌───────────┴───────────┐
        │   Question Type?      │
        └───────────┬───────────┘
                    │
    ┌───────┬───────┼───────┬───────┐
    ▼       ▼       ▼       ▼       ▼
┌───────┐┌───────┐┌───────┐┌───────┐┌───────┐
│Multi  ││True/  ││Short  ││Essay  ││Match  │
│Choice ││False  ││Answer ││       ││       │
│       ││       ││       ││       ││       │
│Exact  ││Bool   ││Fuzzy  ││Manual ││Array  │
│Match  ││Match  ││Match  ││Queue  ││Match  │
└───┬───┘└───┬───┘└───┬───┘└───┬───┘└───┬───┘
    └───────┴───────┴───────┴───────┘
                    │
                    ▼
        ┌───────────────────────┐
        │   Calculate Score     │
        │   Score / Total × 100 │
        └───────────┬───────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │   Pass/Fail Check     │
        │   Score >= Threshold  │
        └───────────┬───────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │   Update Attempt      │
        │   Return Results      │
        └───────────────────────┘
```

---

## 8. Data Models

### Quiz Entity

```typescript
interface Quiz {
  id: number;                      // Primary key
  userId: number;                  // Creator/owner reference
  title: string;                   // Quiz title (1-500 chars)
  description?: string;            // Optional description
  category: string;                // Category for organization (default: "general")
  difficulty: 'easy' | 'medium' | 'hard';  // Difficulty level
  timeLimit?: number;              // Time limit in minutes (null = unlimited)
  passingScore: number;            // Percentage to pass (0-100, default: 70)
  isPublished: boolean;            // Whether quiz is visible to takers
  isActive: boolean;               // Whether quiz accepts attempts
  tags?: string[];                 // JSON array of tags
  metadata?: Record<string, any>;  // Additional settings JSON
  attemptsAllowed?: number;        // Max attempts per user (null = unlimited)
  publishedAt?: Date;              // When quiz was first published
  createdAt: Date;                 // Record creation timestamp
  updatedAt: Date;                 // Last modification timestamp
}
```

### Question Entity

```typescript
interface QuizQuestion {
  id: number;                      // Primary key
  quizId: number;                  // Foreign key to quizzes
  questionText: string;            // The question content
  questionType: QuestionType;      // Type of question
  options?: string[];              // Answer options (for multiple choice)
  correctAnswer: any;              // Correct answer (type varies)
  points: number;                  // Points for this question (default: 1)
  order: number;                   // Display order in quiz
  explanation?: string;            // Explanation shown after answer
  hint?: string;                   // Optional hint
  metadata?: Record<string, any>;  // Additional settings JSON
  createdAt: Date;                 // Record creation timestamp
  updatedAt: Date;                 // Last modification timestamp
}

type QuestionType =
  | 'multiple_choice'   // Single or multiple correct answers
  | 'true_false'        // Boolean true/false
  | 'short_answer'      // Short text response
  | 'essay';            // Long form text (manual grading)
```

### Quiz Attempt Entity

```typescript
interface QuizAttempt {
  id: number;                      // Primary key
  quizId: number;                  // Foreign key to quizzes
  userId: number;                  // Foreign key to users
  status: AttemptStatus;           // Current status
  answers: Answer[];               // JSON array of answers
  score?: number;                  // Total points earned
  percentage?: number;             // Score as percentage (0-100)
  passed?: boolean;                // Whether attempt passed
  timeSpent?: number;              // Time spent in minutes
  attemptNumber: number;           // Which attempt (1, 2, 3...)
  feedback?: string;               // Instructor feedback
  gradedBy?: number;               // User who graded (if manual)
  startedAt: Date;                 // When attempt began
  submittedAt?: Date;              // When attempt was submitted
  gradedAt?: Date;                 // When grading completed
  createdAt: Date;                 // Record creation timestamp
  updatedAt: Date;                 // Last modification timestamp
}

type AttemptStatus =
  | 'in_progress'   // User is currently taking quiz
  | 'submitted'     // Submitted, awaiting grading
  | 'graded';       // Fully graded with score

interface Answer {
  questionId: number;
  answer: any;        // User's answer (type varies by question)
  answeredAt: string; // ISO timestamp when answered
}
```

### Question Answer Formats

```typescript
// Multiple Choice (single answer)
interface MultipleChoiceSingleAnswer {
  correctAnswer: number;  // Index of correct option (0-based)
}

// Multiple Choice (multiple answers)
interface MultipleChoiceMultiAnswer {
  correctAnswer: number[];  // Indices of all correct options
}

// True/False
interface TrueFalseAnswer {
  correctAnswer: boolean;
}

// Short Answer
interface ShortAnswerCorrect {
  correctAnswer: string;  // Expected text (case-insensitive comparison)
}

// Essay (no correct answer - manual grading)
interface EssayAnswer {
  correctAnswer: null;  // Manual grading required
}
```

---

## 9. API Endpoints

### tRPC Router Procedures

| Procedure | Type | Auth | Description |
|-----------|------|------|-------------|
| `quiz.createQuiz` | Mutation | Protected | Create new quiz |
| `quiz.listQuizzes` | Query | Public | List quizzes with filters |
| `quiz.getQuiz` | Query | Public | Get quiz with questions |
| `quiz.updateQuiz` | Mutation | Protected | Update quiz metadata |
| `quiz.deleteQuiz` | Mutation | Protected | Delete quiz and children |
| `quiz.addQuestion` | Mutation | Protected | Add question to quiz |
| `quiz.updateQuestion` | Mutation | Protected | Update question |
| `quiz.deleteQuestion` | Mutation | Protected | Delete question |
| `quiz.startAttempt` | Mutation | Protected | Start new attempt |
| `quiz.submitAnswer` | Mutation | Protected | Submit answer |
| `quiz.submitAttempt` | Mutation | Protected | Submit for grading |
| `quiz.getUserAttempts` | Query | Protected | Get user's attempts |

### Request/Response Examples

#### Create Quiz

**Request:**
```typescript
{
  title: "JavaScript Fundamentals Assessment",
  description: "Test your knowledge of JavaScript basics",
  category: "programming",
  difficulty: "medium",
  timeLimit: 30,
  passingScore: 70,
  isPublished: false,
  tags: ["javascript", "frontend", "programming"],
  attemptsAllowed: 3
}
```

**Response:**
```typescript
{
  success: true,
  quiz: {
    id: 123,
    userId: 456,
    title: "JavaScript Fundamentals Assessment",
    // ... all fields
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z"
  }
}
```

#### Submit Attempt

**Request:**
```typescript
{
  attemptId: 789
}
```

**Response:**
```typescript
{
  success: true,
  attempt: {
    id: 789,
    status: "graded",
    score: 8,
    percentage: 80,
    passed: true,
    timeSpent: 12
  },
  results: {
    score: 8,
    totalPoints: 10,
    percentage: 80,
    passed: true,
    timeSpent: 12,
    passingScore: 70
  }
}
```

---

## 10. User Interface Specifications

### Quiz Builder Interface

```
┌─────────────────────────────────────────────────────────────────┐
│  Quiz Builder                                      [Save Draft] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Title: [JavaScript Fundamentals Assessment          ]          │
│                                                                 │
│  Description:                                                   │
│  [Test your knowledge of JavaScript basics...       ]           │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Settings                                                 │   │
│  │  Category: [Programming     ▼]  Difficulty: [Medium ▼]  │   │
│  │  Time Limit: [30] minutes       Passing Score: [70]%    │   │
│  │  Max Attempts: [3] (blank = unlimited)                  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Questions                                        [+ Add] │   │
│  │ ─────────────────────────────────────────────────────── │   │
│  │ ≡ 1. What is JavaScript?               [Multiple Choice]│   │
│  │     Points: 1  │ Edit │ Delete │                        │   │
│  │ ─────────────────────────────────────────────────────── │   │
│  │ ≡ 2. JavaScript is case-sensitive.     [True/False    ] │   │
│  │     Points: 1  │ Edit │ Delete │                        │   │
│  │ ─────────────────────────────────────────────────────── │   │
│  │ ≡ 3. What keyword declares a variable? [Short Answer  ] │   │
│  │     Points: 1  │ Edit │ Delete │                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [Preview Quiz]              [Publish Quiz]                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Quiz Taking Interface

```
┌─────────────────────────────────────────────────────────────────┐
│  JavaScript Fundamentals Assessment        Time Remaining: 24:30│
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Progress: ████████░░░░░░░░  Question 3 of 10                  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │  Question 3 of 10                          (1 point)   │   │
│  │                                                         │   │
│  │  What is the correct syntax to declare a variable      │   │
│  │  in modern JavaScript?                                 │   │
│  │                                                         │   │
│  │  ○ A) variable x = 5;                                  │   │
│  │  ● B) let x = 5;                                       │   │
│  │  ○ C) var: x = 5;                                      │   │
│  │  ○ D) declare x = 5;                                   │   │
│  │                                                         │   │
│  │  [💡 Hint]                                              │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [← Previous]    [Flag for Review 🚩]    [Next →]              │
│                                                                 │
│  Question Navigation:                                           │
│  [1✓][2✓][3●][4][5][6][7][8][9][10]                            │
│                                                                 │
│                            [Submit Quiz]                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Results View

```
┌─────────────────────────────────────────────────────────────────┐
│  Quiz Results                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              ✓ PASSED                                   │   │
│  │                                                         │   │
│  │         Score: 8/10 (80%)                              │   │
│  │         Passing: 70%                                   │   │
│  │         Time: 12 minutes                               │   │
│  │         Attempt: 1 of 3                                │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Question Review:                                               │
│  ─────────────────────────────────────────────────────────────  │
│  Q1. ✓ What is JavaScript?                        +1           │
│  Q2. ✓ JavaScript is case-sensitive.              +1           │
│  Q3. ✓ What keyword declares a variable?          +1           │
│  Q4. ✗ Which is NOT a JavaScript data type?       +0           │
│      Your answer: Array                                        │
│      Correct: Symbol                                           │
│  Q5. ✓ What does === check?                       +1           │
│  ...                                                           │
│                                                                 │
│  [View Detailed Answers]        [Retake Quiz]    [Back to List]│
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 11. Dependencies

### Internal Dependencies

| Component | Purpose | Integration Point |
|-----------|---------|-------------------|
| User Authentication | Identity verification | `ctx.user.id` in protected procedures |
| Database (Drizzle) | Data persistence | Schema tables, ORM queries |
| Notification System | Quiz assignments, results | Event triggers |
| Analytics Module | Performance tracking | Metrics aggregation |
| Email Service | Result notifications | Template rendering |

### External Dependencies

| Service | Purpose | Version |
|---------|---------|---------|
| PostgreSQL (Supabase) | Primary database | 15.x |
| tRPC | API framework | 11.x |
| Zod | Schema validation | 3.x |
| Drizzle ORM | Database queries | Latest |
| React | Frontend UI | 19.x |

### Integration Points

```typescript
// Integration with Notification System
interface QuizNotificationEvents {
  'quiz.assigned': { quizId: number; userId: number; dueDate?: Date };
  'quiz.completed': { attemptId: number; score: number; passed: boolean };
  'quiz.graded': { attemptId: number; feedback?: string };
  'quiz.reminder': { quizId: number; userId: number; hoursRemaining: number };
}

// Integration with Analytics
interface QuizAnalyticsData {
  quizId: number;
  totalAttempts: number;
  passRate: number;
  averageScore: number;
  averageTime: number;
  questionStats: QuestionAnalytics[];
}
```

---

## 12. Risks & Mitigations

### Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Browser crash loses answers | Medium | High | Auto-save every 30s, localStorage backup |
| Time sync issues | Low | Medium | Server-side time tracking, grace period |
| Concurrent submission bugs | Low | High | Optimistic locking, idempotency keys |
| Scoring algorithm errors | Low | Critical | Comprehensive test suite, manual verification |
| Database performance degradation | Medium | Medium | Indexing, query optimization, caching |
| Essay grading backlog | Medium | Medium | SLA alerts, queue management |

### Business Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Cheating/answer sharing | High | Medium | Question randomization, time limits, proctoring integration |
| Low adoption | Medium | High | User training, intuitive UI, templates |
| Grading subjectivity | Medium | Medium | Rubrics, calibration, multiple graders |
| Accessibility complaints | Low | High | WCAG compliance testing, user feedback |
| Data privacy concerns | Low | Critical | Encryption, access controls, retention policies |

### Operational Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| System downtime during assessment | Low | Critical | High availability setup, scheduled maintenance windows |
| Data loss | Very Low | Critical | Regular backups, point-in-time recovery |
| Support ticket volume | Medium | Medium | Self-service help, FAQs, chatbot |

### Contingency Plans

1. **Assessment System Failure During Active Quiz**
   - Automatically extend time limits by failure duration
   - Preserve all submitted answers
   - Notify affected users with options to resume or reschedule

2. **Scoring Algorithm Bug Discovered**
   - Immediate rollback to previous version
   - Re-score affected attempts
   - Notify users of corrections

3. **Data Breach**
   - Immediate access revocation
   - Incident response team activation
   - User notification per regulatory requirements

---

## Appendix

### A. Scoring Algorithm Details

#### Multiple Choice Scoring

```typescript
function scoreMultipleChoice(
  userAnswer: number | number[],
  correctAnswer: number | number[]
): { isCorrect: boolean; points: number } {
  // Single answer
  if (!Array.isArray(correctAnswer)) {
    return {
      isCorrect: userAnswer === correctAnswer,
      points: userAnswer === correctAnswer ? 1 : 0
    };
  }

  // Multiple correct answers
  const userAnswers = Array.isArray(userAnswer) ? userAnswer.sort() : [userAnswer];
  const correctAnswers = correctAnswer.sort();

  const isCorrect = JSON.stringify(userAnswers) === JSON.stringify(correctAnswers);
  return { isCorrect, points: isCorrect ? 1 : 0 };
}
```

#### Short Answer Scoring

```typescript
function scoreShortAnswer(
  userAnswer: string,
  correctAnswer: string,
  fuzzyMatch: boolean = false
): { isCorrect: boolean; points: number } {
  const normalizedUser = userAnswer.trim().toLowerCase();
  const normalizedCorrect = correctAnswer.trim().toLowerCase();

  if (fuzzyMatch) {
    // Levenshtein distance for typo tolerance
    const distance = levenshteinDistance(normalizedUser, normalizedCorrect);
    const threshold = Math.floor(normalizedCorrect.length * 0.2);
    const isCorrect = distance <= threshold;
    return { isCorrect, points: isCorrect ? 1 : 0 };
  }

  return {
    isCorrect: normalizedUser === normalizedCorrect,
    points: normalizedUser === normalizedCorrect ? 1 : 0
  };
}
```

### B. Question Templates

#### Multiple Choice Template
```json
{
  "questionType": "multiple_choice",
  "questionText": "What is the capital of France?",
  "options": ["London", "Paris", "Berlin", "Madrid"],
  "correctAnswer": 1,
  "points": 1,
  "explanation": "Paris is the capital and largest city of France.",
  "hint": "This city is known as the 'City of Light'."
}
```

#### True/False Template
```json
{
  "questionType": "true_false",
  "questionText": "The Earth is flat.",
  "correctAnswer": false,
  "points": 1,
  "explanation": "The Earth is an oblate spheroid."
}
```

#### Short Answer Template
```json
{
  "questionType": "short_answer",
  "questionText": "What programming language was created by Brendan Eich in 1995?",
  "correctAnswer": "JavaScript",
  "points": 2,
  "explanation": "JavaScript was created in just 10 days.",
  "metadata": {
    "acceptableAnswers": ["JavaScript", "JS", "javascript"],
    "caseSensitive": false
  }
}
```

### C. API Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | User not authenticated |
| `FORBIDDEN` | 403 | User lacks permission |
| `NOT_FOUND` | 404 | Quiz/question/attempt not found |
| `BAD_REQUEST` | 400 | Invalid input data |
| `ATTEMPT_LIMIT_EXCEEDED` | 400 | Max attempts reached |
| `QUIZ_NOT_AVAILABLE` | 400 | Quiz not published or inactive |
| `ATTEMPT_ALREADY_SUBMITTED` | 400 | Cannot modify submitted attempt |
| `TIME_LIMIT_EXCEEDED` | 400 | Quiz time expired |
| `INTERNAL_SERVER_ERROR` | 500 | Server-side error |

### D. Feature Roadmap

| Phase | Features | Timeline |
|-------|----------|----------|
| **Phase 1** (Current) | Core CRUD, basic question types, auto-scoring | Complete |
| **Phase 2** | Question randomization, analytics, manual grading | Q2 2024 |
| **Phase 3** | Advanced question types, proctoring, certificates | Q3 2024 |
| **Phase 4** | AI-powered question generation, adaptive testing | Q4 2024 |

### E. Related PRDs

- PRD-016: Quiz System (Original)
- PRD-008: Agent Learning & Training
- PRD-038: Notification System
- PRD-021: Analytics & Reporting

### F. Changelog

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2024-01-11 | 1.0 | Initial PRD creation | Training Team |
| 2025-01-11 | 2.0 | Comprehensive expansion with 12 sections | Assessment Team |

---

*Document Version: 2.0*
*Last Updated: January 2025*
*Status: Active Development*

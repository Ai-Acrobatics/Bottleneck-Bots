# PRD-016: Quiz System

## Product Requirements Document

### Overview
| Field | Value |
|-------|-------|
| **PRD ID** | PRD-016 |
| **Feature Name** | Quiz System |
| **Category** | Assessment & Training |
| **Priority** | P2 - Medium |
| **Status** | Active |
| **Owner** | Training Team |

---

## 1. Executive Summary

The Quiz System provides a comprehensive assessment platform supporting multiple question types, automatic scoring, attempt tracking, and performance analytics. It enables organizations to create training quizzes with time limits, passing thresholds, and detailed user performance insights.

## 2. Problem Statement

Organizations need to assess employee knowledge and skills systematically. Manual grading is time-consuming and inconsistent. Training effectiveness is hard to measure. Users lack visibility into their learning progress and areas for improvement.

## 3. Goals & Objectives

### Primary Goals
- Enable flexible quiz creation
- Automate scoring and grading
- Track learner progress
- Provide actionable analytics

### Success Metrics
| Metric | Target |
|--------|--------|
| Quiz Completion Rate | > 85% |
| Scoring Accuracy | 100% |
| Average Assessment Time | < 15 minutes |
| User Satisfaction | > 4/5 |

## 4. User Stories

### US-001: Create Quiz
**As a** trainer
**I want to** create a quiz with various question types
**So that** I can assess different types of knowledge

**Acceptance Criteria:**
- [ ] Add quiz metadata
- [ ] Create multiple question types
- [ ] Set time limits
- [ ] Set passing score

### US-002: Take Quiz
**As a** learner
**I want to** take assigned quizzes
**So that** I can demonstrate my knowledge

**Acceptance Criteria:**
- [ ] View available quizzes
- [ ] Start quiz attempt
- [ ] Answer questions
- [ ] Submit and see results

### US-003: View Performance
**As a** training manager
**I want to** view quiz performance analytics
**So that** I can identify training gaps

**Acceptance Criteria:**
- [ ] See overall pass rates
- [ ] View individual scores
- [ ] Identify problem questions
- [ ] Track improvement over time

## 5. Functional Requirements

### FR-001: Quiz Management
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-001.1 | Create quiz | P0 |
| FR-001.2 | Edit quiz | P0 |
| FR-001.3 | Delete quiz | P0 |
| FR-001.4 | Duplicate quiz | P2 |
| FR-001.5 | Quiz versioning | P2 |

### FR-002: Question Types
| ID | Type | Priority |
|----|------|----------|
| FR-002.1 | Multiple choice | P0 |
| FR-002.2 | True/False | P0 |
| FR-002.3 | Short answer | P1 |
| FR-002.4 | Essay | P2 |
| FR-002.5 | Matching | P2 |

### FR-003: Quiz Configuration
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-003.1 | Time limit | P1 |
| FR-003.2 | Passing score threshold | P0 |
| FR-003.3 | Attempt limits | P1 |
| FR-003.4 | Question randomization | P2 |
| FR-003.5 | Difficulty levels | P1 |

### FR-004: Assessment
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-004.1 | Start attempt | P0 |
| FR-004.2 | Record answers | P0 |
| FR-004.3 | Auto-score objective questions | P0 |
| FR-004.4 | Manual grading for essays | P2 |
| FR-004.5 | Show results | P0 |

### FR-005: Analytics
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-005.1 | Individual performance | P0 |
| FR-005.2 | Quiz statistics | P1 |
| FR-005.3 | Question analysis | P1 |
| FR-005.4 | Progress tracking | P1 |

## 6. Data Models

### Quiz
```typescript
interface Quiz {
  id: string;
  createdBy: string;
  title: string;
  description?: string;
  questions: Question[];
  settings: QuizSettings;
  status: 'draft' | 'published' | 'archived';
  version: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### Question
```typescript
interface Question {
  id: string;
  quizId: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
  text: string;
  options?: Option[];
  correctAnswer?: string | string[];
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  explanation?: string;
  hint?: string;
  order: number;
}
```

### Quiz Attempt
```typescript
interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  answers: Answer[];
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  startedAt: Date;
  submittedAt?: Date;
  timeSpent: number;
  status: 'in_progress' | 'submitted' | 'graded';
}
```

### Quiz Settings
```typescript
interface QuizSettings {
  timeLimit?: number; // minutes
  passingScore: number; // percentage
  maxAttempts?: number;
  shuffleQuestions: boolean;
  showResults: boolean;
  showCorrectAnswers: boolean;
}
```

## 7. API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/quizzes` | List quizzes |
| POST | `/api/quizzes` | Create quiz |
| GET | `/api/quizzes/:id` | Get quiz details |
| PUT | `/api/quizzes/:id` | Update quiz |
| DELETE | `/api/quizzes/:id` | Delete quiz |
| POST | `/api/quizzes/:id/questions` | Add question |
| POST | `/api/quizzes/:id/start` | Start attempt |
| POST | `/api/quizzes/:id/submit` | Submit attempt |
| GET | `/api/quizzes/:id/attempts` | Get attempt history |
| GET | `/api/quizzes/:id/analytics` | Get analytics |

## 8. Scoring Logic

### Automatic Scoring
- Multiple choice: Exact match
- True/False: Exact match
- Short answer: Fuzzy matching (configurable)

### Manual Scoring
- Essay: Rubric-based grading
- Partial credit support

### Score Calculation
```
Score = (Points Earned / Total Points) × 100
Passed = Score >= PassingScore
```

## 9. User Interface

### Quiz Builder
- Drag-and-drop question ordering
- Question type selector
- Preview mode
- Settings panel

### Quiz Taker
- Progress indicator
- Timer display
- Question navigation
- Flag for review

### Results View
- Score summary
- Question breakdown
- Correct answers (if enabled)
- Improvement suggestions

## 10. Dependencies

| Dependency | Purpose |
|------------|---------|
| User System | Learner management |
| Analytics | Performance tracking |
| Notifications | Quiz assignments |

## 11. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Cheating | Medium | Time limits, randomization |
| Browser crash | High | Auto-save progress |
| Essay grading subjectivity | Medium | Rubrics, multiple graders |

---

## Appendix

### A. Question Examples

**Multiple Choice:**
```
What is 2 + 2?
A) 3
B) 4 ✓
C) 5
D) 6
```

**True/False:**
```
The sky is blue. True ✓
```

### B. Changelog
| Date | Version | Changes |
|------|---------|---------|
| 2024-01-11 | 1.0 | Initial PRD creation |

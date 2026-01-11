# UX Stories: Training & Onboarding System

**Document ID:** UXS-016
**Feature:** Training & Onboarding
**Version:** 1.0
**Last Updated:** January 11, 2026
**Author:** QA Team
**Status:** Ready for Testing

---

## Table of Contents

1. [UXS-016-01: New User Welcome and Initial Setup](#uxs-016-01-new-user-welcome-and-initial-setup)
2. [UXS-016-02: Interactive Feature Tour Completion](#uxs-016-02-interactive-feature-tour-completion)
3. [UXS-016-03: Knowledge Assessment Quiz Taking](#uxs-016-03-knowledge-assessment-quiz-taking)
4. [UXS-016-04: Training Module Progression](#uxs-016-04-training-module-progression)
5. [UXS-016-05: Component Showcase Exploration](#uxs-016-05-component-showcase-exploration)
6. [UXS-016-06: Settings Configuration During Onboarding](#uxs-016-06-settings-configuration-during-onboarding)
7. [UXS-016-07: Progress Tracking and Achievements](#uxs-016-07-progress-tracking-and-achievements)
8. [UXS-016-08: Help Documentation Access](#uxs-016-08-help-documentation-access)
9. [UXS-016-09: Onboarding Resumption After Interruption](#uxs-016-09-onboarding-resumption-after-interruption)
10. [UXS-016-10: Skip and Customize Onboarding Flow](#uxs-016-10-skip-and-customize-onboarding-flow)

---

## UXS-016-01: New User Welcome and Initial Setup

### Story ID
UXS-016-01

### Title
First-Time User Completes Welcome Flow and Account Setup

### Persona
**Emma Richardson** - New Agency Employee at Digital Solutions Agency
- 26 years old, recently hired as a marketing coordinator
- First time using Bottleneck-Bots platform
- Technical proficiency: Low-Intermediate
- Primary goal: Get up to speed quickly to contribute to team projects
- Pain point: Overwhelmed by new enterprise software with many features

### Scenario
Emma has just received her invitation email to join Bottleneck-Bots. Her agency administrator has set up her account, and she needs to complete the initial setup process. She wants to understand the platform basics and configure her profile before starting real work.

### User Goal
Complete the initial welcome flow successfully, set up her profile with relevant information, understand the platform's value proposition, and feel confident about taking the next steps in learning the system.

### Preconditions
- User has received invitation email with valid link
- User account has been provisioned by agency administrator
- User has not previously logged into the platform
- Agency has onboarding enabled (not disabled by admin)
- User's browser supports modern web features (ES6+, localStorage)

### Step-by-Step User Journey

| Step | User Action | System Response | Expected UI State |
|------|-------------|-----------------|-------------------|
| 1 | Emma clicks invitation link in email | System validates token, redirects to welcome page | Welcome page loads with agency branding |
| 2 | Emma sees welcome screen | Personalized greeting: "Welcome to Bottleneck-Bots, Emma!" | Animated welcome illustration, agency logo visible |
| 3 | Emma reads value proposition | Three key benefits displayed with icons | "Automate repetitive tasks", "Save 15+ hours/week", "Focus on strategy" |
| 4 | Emma clicks "Get Started" button | System transitions to profile setup | Profile setup form appears with smooth animation |
| 5 | Emma uploads profile photo | Drag-drop zone accepts image, preview shows | Circular avatar preview with crop option |
| 6 | Emma enters job title: "Marketing Coordinator" | Auto-suggest from common titles | Input accepts text, character count shows 21/50 |
| 7 | Emma selects department: "Marketing" | Dropdown shows agency-defined departments | Department badge appears on profile preview |
| 8 | Emma sets timezone: "America/Los_Angeles" | Timezone picker with search, auto-detect option | Local time preview: "Your local time: 9:15 AM PST" |
| 9 | Emma toggles notification preferences | Email, in-app, and desktop toggles | Three toggles with descriptions, defaults applied |
| 10 | Emma clicks "Continue" | Form validates, profile saved | Success checkmark animation, progress indicator updates |
| 11 | Emma sees role selection | Cards for different user types | Options: "I'm new to automation", "I have some experience", "I'm an expert" |
| 12 | Emma selects "I'm new to automation" | System customizes onboarding path | Confirmation: "Great! We'll tailor your experience." |
| 13 | Emma clicks "Begin Training" | Onboarding flow starts | Transition to first training module |

### Expected Outcomes
1. User profile created with photo, title, department, and timezone
2. Notification preferences saved to database
3. Experience level stored for personalized onboarding
4. `onboardingStartedAt` timestamp recorded
5. `onboardingStatus` set to "in_progress"
6. Analytics event fired: `onboarding_started`
7. Welcome flow completes in under 3 minutes
8. User feels welcomed and not overwhelmed

### Acceptance Criteria

```gherkin
Feature: New User Welcome and Initial Setup

  Scenario: First-time user completes welcome flow
    Given Emma has received an invitation email
    And Emma has not previously logged in
    When Emma clicks the invitation link
    Then the welcome page should load within 2 seconds
    And Emma's name should be displayed in the greeting
    And the agency logo should be visible

  Scenario: Profile photo upload works correctly
    Given Emma is on the profile setup step
    When Emma drags an image file onto the upload zone
    Then a preview should appear within 1 second
    And a crop tool should be available
    And the image should be resized to 200x200 maximum

  Scenario: Experience level selection customizes onboarding
    Given Emma is on the role selection step
    When Emma selects "I'm new to automation"
    Then the system should store experienceLevel="beginner"
    And the onboarding path should include all basic modules
    And advanced modules should be marked as optional

  Scenario: Required fields are validated
    Given Emma has not entered a job title
    When Emma clicks "Continue"
    Then an error message should appear: "Job title is required"
    And the job title field should be highlighted
    And Emma should not proceed to the next step

  Scenario: Progress is saved if user leaves
    Given Emma has completed profile photo and job title
    When Emma closes the browser
    And Emma returns later
    Then Emma should resume from the department selection step
    And previously entered data should be preserved
```

### Edge Cases

| ID | Edge Case | Expected Behavior |
|----|-----------|-------------------|
| EC-01 | Invitation link expired (>7 days) | Show "Link expired" message with "Request new invitation" option |
| EC-02 | Invitation already used | Redirect to login page with message "You've already set up your account" |
| EC-03 | Profile photo exceeds 5MB | Show error "File too large. Maximum size is 5MB." before upload |
| EC-04 | Unsupported image format (PDF, PSD) | Show error "Please upload a JPG, PNG, or GIF image" |
| EC-05 | Network disconnection during setup | Cache form data locally, retry on reconnection |
| EC-06 | Browser doesn't support localStorage | Fall back to session storage, warn that progress won't persist |
| EC-07 | User's timezone cannot be auto-detected | Default to agency's primary timezone with option to change |
| EC-08 | Agency has disabled onboarding | Skip to main dashboard with optional "Take a tour" prompt |

### Test Data Requirements

```json
{
  "invitation_tokens": {
    "valid_token": "inv_abc123xyz789_valid",
    "expired_token": "inv_old456def_expired",
    "used_token": "inv_used789ghi_completed"
  },
  "profile_data": {
    "valid_photo": "test-assets/profile-photo-valid.jpg",
    "oversized_photo": "test-assets/profile-photo-10mb.jpg",
    "invalid_format": "test-assets/document.pdf"
  },
  "user_setup": {
    "job_title": "Marketing Coordinator",
    "department": "Marketing",
    "timezone": "America/Los_Angeles",
    "experience_level": "beginner"
  },
  "agency_config": {
    "has_onboarding": true,
    "custom_branding": true,
    "departments": ["Marketing", "Sales", "Operations", "Executive"]
  }
}
```

### Priority
**P0** - Critical path for new user activation and retention

---

## UXS-016-02: Interactive Feature Tour Completion

### Story ID
UXS-016-02

### Title
User Completes Guided Tour of Platform Features

### Persona
**Marcus Chen** - Marketing Manager at Velocity Digital
- 32 years old, manages team of 4 marketers
- Just completed initial setup
- Technical proficiency: Intermediate
- Primary goal: Understand all key features before training his team
- Pain point: Usually skips tutorials but wants to be thorough this time

### Scenario
Marcus has completed his profile setup and selected "I have some experience" as his expertise level. The system now guides him through an interactive tour highlighting the key platform features. He wants to understand the dashboard, agent capabilities, and automation tools.

### User Goal
Complete the interactive feature tour, understand the location and purpose of key platform sections, and bookmark features relevant to his role for later exploration.

### Preconditions
- User has completed initial profile setup
- Onboarding status is "in_progress"
- Feature tour module is the current active module
- All main platform features are accessible
- Tooltip library (e.g., Shepherd.js or React-Joyride) is loaded

### Step-by-Step User Journey

| Step | User Action | System Response | Expected UI State |
|------|-------------|-----------------|-------------------|
| 1 | Marcus enters feature tour | Tour overlay activates with dimmed background | Step 1/12 indicator visible, "Welcome to the Tour" |
| 2 | Marcus sees dashboard highlight | Spotlight on dashboard area with tooltip | "This is your command center. View tasks, metrics, and recent activity." |
| 3 | Marcus clicks "Next" | Tour advances to agent panel | Smooth transition animation, step 2/12 |
| 4 | Marcus reads agent panel tooltip | Detailed explanation of AI agents | "Meet your AI agents. They can automate browser tasks, manage contacts, and more." |
| 5 | Marcus clicks on highlighted "Try It" button | Mini-demo activates within tooltip | Live preview of agent typing in a text field |
| 6 | Marcus clicks "Next" | Tour advances to task queue | Step 3/12, task queue section highlighted |
| 7 | Marcus clicks "Skip ahead" link | Skip modal appears | "Skip to section: Automations, Integrations, Settings, or End Tour" |
| 8 | Marcus selects "Integrations" | Tour jumps to integrations step (8/12) | Integrations panel highlighted with tooltip |
| 9 | Marcus clicks "Back" | Tour returns to previous step (7/12) | Smooth backward transition |
| 10 | Marcus continues through remaining steps | Each feature explained with examples | Progress bar fills: 75%, 83%, 92% |
| 11 | Marcus reaches final step | "Tour Complete!" celebration | Confetti animation, completion stats shown |
| 12 | Marcus clicks "Explore on Your Own" | Tour closes, dashboard active | Subtle hints remain on unexplored areas |

### Expected Outcomes
1. All 12 tour steps completed or intentionally skipped
2. `featureTourCompleted` flag set to true in user profile
3. `featureTourCompletedAt` timestamp recorded
4. User interaction with "Try It" demos logged for analytics
5. Skipped sections marked for follow-up reminders
6. Tour completion time recorded (expected: 5-8 minutes)
7. Achievement unlocked: "Platform Explorer"
8. Next onboarding module (Quiz or Training) becomes active

### Acceptance Criteria

```gherkin
Feature: Interactive Feature Tour Completion

  Scenario: Tour highlights features in sequence
    Given Marcus is on tour step 3 of 12
    When Marcus clicks "Next"
    Then the highlight should move to the next feature
    And the tooltip content should update
    And the step indicator should show "4 of 12"
    And the previous area should no longer be highlighted

  Scenario: Tour includes interactive demos
    Given Marcus is on the agent panel step
    And the tooltip includes a "Try It" button
    When Marcus clicks "Try It"
    Then a mini-demo should activate
    And Marcus should see the agent perform an action
    And the demo should complete within 5 seconds
    And a "Continue" button should appear

  Scenario: Skip ahead functionality works
    Given Marcus is on step 5 of 12
    When Marcus clicks "Skip ahead"
    And Marcus selects "Integrations"
    Then the tour should jump to the integrations step
    And the skipped steps should be marked as skipped
    And Marcus should be able to go back if desired

  Scenario: Tour progress persists on browser close
    Given Marcus has completed 6 of 12 tour steps
    When Marcus closes the browser
    And Marcus returns 1 hour later
    Then the tour should resume at step 7
    And completed steps should show checkmarks
    And Marcus should see "Welcome back! Continue your tour?"

  Scenario: Tour completion triggers achievement
    Given Marcus has completed step 11 of 12
    When Marcus completes the final step
    Then a completion animation should play
    And Marcus should receive the "Platform Explorer" achievement
    And the achievement notification should appear
    And the feature tour should be marked as complete in the database
```

### Edge Cases

| ID | Edge Case | Expected Behavior |
|----|-----------|-------------------|
| EC-01 | User resizes window during tour | Tooltip repositions, spotlight recalculates |
| EC-02 | Highlighted element not visible (scrolled) | Auto-scroll to element with smooth animation |
| EC-03 | User clicks outside highlighted area | Gentle bounce animation on tooltip, no progression |
| EC-04 | User rapidly clicks Next multiple times | Debounce clicks, prevent double-step advancement |
| EC-05 | Tour step references removed feature | Skip step automatically, log warning for admin |
| EC-06 | Mobile viewport (responsive) | Adapt tour layout, larger touch targets |
| EC-07 | Screen reader active | ARIA labels for all tour elements, keyboard navigation |
| EC-08 | User has completed tour before | Offer "Retake Tour" option from help menu |

### Test Data Requirements

```json
{
  "tour_configuration": {
    "total_steps": 12,
    "steps": [
      {"id": "dashboard", "title": "Your Dashboard", "has_demo": false},
      {"id": "agent_panel", "title": "AI Agents", "has_demo": true},
      {"id": "task_queue", "title": "Task Queue", "has_demo": false},
      {"id": "automations", "title": "Automations", "has_demo": true},
      {"id": "contacts", "title": "Contact Management", "has_demo": false},
      {"id": "campaigns", "title": "Campaigns", "has_demo": true},
      {"id": "analytics", "title": "Analytics", "has_demo": false},
      {"id": "integrations", "title": "Integrations", "has_demo": false},
      {"id": "settings", "title": "Settings", "has_demo": false},
      {"id": "help", "title": "Help Center", "has_demo": false},
      {"id": "billing", "title": "Billing", "has_demo": false},
      {"id": "team", "title": "Team Management", "has_demo": false}
    ]
  },
  "user_tour_progress": {
    "completed_steps": ["dashboard", "agent_panel", "task_queue"],
    "skipped_steps": [],
    "current_step": "automations",
    "started_at": "2026-01-11T09:00:00Z"
  },
  "demo_scenarios": {
    "agent_demo": {"action": "type", "target": "input#demo-field", "value": "Hello!"},
    "automation_demo": {"action": "click", "target": "button.trigger-automation"},
    "campaign_demo": {"action": "preview", "target": "#campaign-preview"}
  }
}
```

### Priority
**P1** - Important for user understanding and feature discovery

---

## UXS-016-03: Knowledge Assessment Quiz Taking

### Story ID
UXS-016-03

### Title
User Completes Knowledge Assessment Quiz to Validate Understanding

### Persona
**Sophia Martinez** - Operations Specialist at GrowthFirst Agency
- 28 years old, responsible for training new team members
- Completed feature tour, now taking assessment
- Technical proficiency: High
- Primary goal: Demonstrate competency and unlock advanced features
- Pain point: Doesn't want to waste time on basic content if she already knows it

### Scenario
Sophia has completed the feature tour and is now presented with a knowledge assessment quiz. The quiz tests her understanding of platform concepts and determines if she can skip basic training modules. She wants to score high to unlock advanced content immediately.

### User Goal
Complete the knowledge assessment quiz, achieve a passing score (80%+), understand areas of weakness from feedback, and unlock appropriate training modules based on demonstrated knowledge.

### Preconditions
- User has completed the feature tour
- Quiz module is active in onboarding flow
- Question bank contains at least 20 questions
- Quiz is configured for 10 questions, 15-minute time limit
- Scoring thresholds: <60% (basic), 60-79% (intermediate), 80%+ (advanced)

### Step-by-Step User Journey

| Step | User Action | System Response | Expected UI State |
|------|-------------|-----------------|-------------------|
| 1 | Sophia enters quiz module | Quiz introduction displayed | "Knowledge Assessment - 10 Questions, 15 minutes" |
| 2 | Sophia reads instructions | Rules and scoring explained | Pass threshold: 80%, retry available after 24 hours |
| 3 | Sophia clicks "Start Quiz" | Timer starts, first question loads | Question 1/10, countdown timer: 15:00 |
| 4 | Sophia reads Q1 (multiple choice) | 4 answer options displayed | "What is the primary purpose of the Agent Dashboard?" |
| 5 | Sophia selects answer B | Answer highlighted, "Next" enabled | Option B visually selected |
| 6 | Sophia clicks "Next" | Q2 loads, progress bar updates | Question 2/10, timer: 14:32 |
| 7 | Sophia answers Q2 (true/false) | Binary options presented | "True or False: Automations require manual approval by default" |
| 8 | Sophia continues through Q3-Q9 | Each question type varies | Mix of multiple choice, true/false, matching |
| 9 | Sophia reaches Q10 (matching) | Drag-drop interface | Match feature names to descriptions |
| 10 | Sophia clicks "Submit Quiz" | Confirmation modal | "Submit your answers? You cannot change them after submission." |
| 11 | Sophia confirms submission | Quiz graded instantly | Loading spinner: "Calculating your score..." |
| 12 | Sophia sees results | Score displayed with breakdown | "You scored 90%! 9 of 10 correct" |
| 13 | Sophia reviews incorrect answer | Detailed feedback per question | Q7: "The correct answer was C. Here's why..." |
| 14 | Sophia clicks "Continue" | Advanced modules unlocked | "Congratulations! Advanced training is now available." |

### Expected Outcomes
1. Quiz completed with all 10 answers recorded
2. Score calculated as 90% (9/10 correct)
3. `quizScore` stored in user profile
4. `quizCompletedAt` timestamp recorded
5. `trainingLevel` set to "advanced" based on score
6. Basic training modules marked as optional (can skip)
7. Achievement unlocked: "Quick Learner" (90%+ first attempt)
8. Quiz analytics recorded for question difficulty analysis
9. Incorrect question flagged for focused review

### Acceptance Criteria

```gherkin
Feature: Knowledge Assessment Quiz Taking

  Scenario: Quiz timer functions correctly
    Given Sophia has started the quiz
    And 5 minutes have elapsed
    When Sophia looks at the timer
    Then the timer should show approximately "10:00" remaining
    And the timer should update every second
    And the timer should turn yellow at 2 minutes remaining
    And the timer should turn red at 30 seconds remaining

  Scenario: Quiz auto-submits on timeout
    Given Sophia has started the quiz
    And Sophia has answered 7 of 10 questions
    When the timer reaches 0:00
    Then the quiz should auto-submit
    And Sophia should see "Time's up! Your quiz has been submitted."
    And only the 7 answered questions should be scored

  Scenario: Quiz calculates score correctly
    Given Sophia has answered all 10 questions
    And 9 answers are correct
    When Sophia submits the quiz
    Then the score should be calculated as 90%
    And Sophia should see "9 of 10 correct"
    And the trainingLevel should be set to "advanced"

  Scenario: Quiz provides question-level feedback
    Given Sophia has submitted the quiz
    And Q7 was answered incorrectly
    When Sophia clicks "Review Answers"
    Then Q7 should show her selected answer marked incorrect
    And the correct answer should be highlighted in green
    And an explanation should be provided

  Scenario: Quiz blocks retake within 24 hours
    Given Sophia has completed the quiz with 70% score
    When Sophia attempts to retake immediately
    Then a message should appear: "Retake available in 23 hours 45 minutes"
    And the "Start Quiz" button should be disabled
```

### Edge Cases

| ID | Edge Case | Expected Behavior |
|----|-----------|-------------------|
| EC-01 | User refreshes page during quiz | Restore quiz state, timer continues from saved time |
| EC-02 | Network disconnection during question | Queue answer locally, sync on reconnection |
| EC-03 | User clicks browser back button | Warning modal: "Leave quiz? Progress will be lost." |
| EC-04 | Timer discrepancy (client vs server) | Server time is authoritative, sync on submission |
| EC-05 | All questions answered correctly (100%) | Special achievement: "Perfect Score" unlocked |
| EC-06 | User scores below 60% | Require basic training modules, encouragement message |
| EC-07 | Question bank has fewer than 10 questions | Display available questions, adjust scoring |
| EC-08 | Accessibility: keyboard-only navigation | Tab through options, Enter to select, maintain focus |

### Test Data Requirements

```json
{
  "quiz_configuration": {
    "question_count": 10,
    "time_limit_minutes": 15,
    "passing_score": 80,
    "retry_cooldown_hours": 24,
    "randomize_questions": true,
    "randomize_options": true
  },
  "question_types": {
    "multiple_choice": {
      "question": "What is the primary purpose of the Agent Dashboard?",
      "options": ["A. Billing management", "B. Task monitoring", "C. User settings", "D. Report generation"],
      "correct": "B",
      "explanation": "The Agent Dashboard is your central hub for monitoring and managing AI agent tasks."
    },
    "true_false": {
      "question": "Automations require manual approval by default.",
      "correct": false,
      "explanation": "Automations run automatically unless configured to require approval."
    },
    "matching": {
      "question": "Match each feature to its description.",
      "pairs": [
        {"left": "Task Queue", "right": "Pending automation jobs"},
        {"left": "Analytics", "right": "Performance metrics"},
        {"left": "Integrations", "right": "Third-party connections"}
      ]
    }
  },
  "score_thresholds": {
    "basic": {"min": 0, "max": 59},
    "intermediate": {"min": 60, "max": 79},
    "advanced": {"min": 80, "max": 100}
  },
  "test_scenarios": {
    "perfect_score": {"answers": [1,1,1,1,1,1,1,1,1,1], "expected_score": 100},
    "passing_score": {"answers": [1,1,1,1,1,1,1,1,0,0], "expected_score": 80},
    "failing_score": {"answers": [1,1,1,1,1,0,0,0,0,0], "expected_score": 50}
  }
}
```

### Priority
**P1** - Important for personalized learning path and user competency validation

---

## UXS-016-04: Training Module Progression

### Story ID
UXS-016-04

### Title
User Progresses Through Multi-Lesson Training Modules

### Persona
**James Wilson** - Junior Marketing Associate at Boost Marketing
- 24 years old, first professional marketing role
- Scored 65% on quiz, placed in intermediate track
- Technical proficiency: Low
- Primary goal: Build confidence through structured learning
- Pain point: Learns best through hands-on practice, not just reading

### Scenario
James is working through the "Browser Automation Fundamentals" training module. The module contains 5 lessons with video content, interactive exercises, and knowledge checks. He wants to complete the module to unlock the next level and earn his first certification.

### User Goal
Complete all lessons in the training module, pass the module assessment, earn the "Browser Automation Certified" badge, and feel confident about using automation features in real work.

### Preconditions
- User is assigned to intermediate training track
- Module "Browser Automation Fundamentals" is available
- Module contains 5 lessons with mixed content types
- User has not started this module previously
- Video player supports adaptive streaming

### Step-by-Step User Journey

| Step | User Action | System Response | Expected UI State |
|------|-------------|-----------------|-------------------|
| 1 | James opens training module | Module overview loads | "Browser Automation Fundamentals" - 5 lessons, ~45 min |
| 2 | James views lesson list | Lessons displayed with durations | Lesson 1: Intro (8 min), Lesson 2: Basics (10 min), etc. |
| 3 | James clicks "Start Lesson 1" | Video player loads | Intro video begins playing automatically |
| 4 | James watches video | Progress bar fills as video plays | 0:00 / 8:00, progress saves every 30 seconds |
| 5 | James pauses video at 4:00 | Playback pauses, position saved | "Paused" indicator, resume button visible |
| 6 | James clicks "Next" within video | Chapter skip to next section | Video jumps to chapter 2 |
| 7 | James completes video | End screen with quiz prompt | "Nice work! Take a quick knowledge check." |
| 8 | James answers 3 knowledge check questions | Inline quiz within lesson | Questions about video content |
| 9 | James gets 3/3 correct | Lesson marked complete | Checkmark on Lesson 1, "Lesson 2 Unlocked" |
| 10 | James starts Lesson 2 | Interactive exercise loads | Step-by-step automation builder exercise |
| 11 | James follows exercise instructions | Real-time validation of each step | "Step 1: Click 'New Automation' button" with highlighting |
| 12 | James makes a mistake in exercise | Gentle correction with hint | "Not quite. Try clicking the blue button instead." |
| 13 | James completes exercise correctly | Success feedback, next step | "Great! Now let's set a trigger." |
| 14 | James finishes all 5 lessons | Module completion screen | Progress: 5/5 lessons, "Take Module Assessment" |
| 15 | James passes module assessment | Certificate generated | "Congratulations! You've earned Browser Automation Certified." |

### Expected Outcomes
1. All 5 lessons completed with progress tracked
2. Video watch time recorded accurately
3. Knowledge check scores stored per lesson
4. Interactive exercise completion validated
5. Module assessment passed (80%+ required)
6. `browserAutomationCertified` badge added to profile
7. Certificate PDF generated with user name and date
8. Next module "Advanced Automation Strategies" unlocked
9. Total training time recorded: ~50 minutes

### Acceptance Criteria

```gherkin
Feature: Training Module Progression

  Scenario: Lesson video progress is saved
    Given James is watching Lesson 1 video
    And James has watched 4 minutes of 8-minute video
    When James navigates away from the lesson
    And James returns 2 hours later
    Then the video should resume at the 4-minute mark
    And the lesson progress should show 50% complete

  Scenario: Knowledge check must be passed to proceed
    Given James has watched Lesson 1 video
    And the knowledge check requires 2/3 correct to pass
    When James answers 1/3 correctly
    Then a message should appear: "Let's try again. Review the video if needed."
    And James should be able to retake the check immediately
    And Lesson 2 should remain locked

  Scenario: Interactive exercises provide real-time feedback
    Given James is in an interactive exercise
    And the current step asks to click "New Automation"
    When James clicks the wrong button
    Then an error animation should play
    And a hint should appear: "Try the 'New Automation' button in the top right"
    And the exercise should not advance

  Scenario: Module certification is awarded on completion
    Given James has completed all 5 lessons
    And James has passed the module assessment with 85%
    When the assessment results are displayed
    Then a certificate should be generated
    And the certificate should include James's name
    And the "Browser Automation Certified" badge should appear on James's profile
    And a notification should be sent to James's email

  Scenario: Locked lessons show prerequisites
    Given James has completed Lessons 1 and 2
    When James tries to access Lesson 5 directly
    Then a lock icon should be displayed
    And a message should appear: "Complete Lessons 3 and 4 first"
```

### Edge Cases

| ID | Edge Case | Expected Behavior |
|----|-----------|-------------------|
| EC-01 | Video buffering on slow connection | Show loading indicator, reduce quality automatically |
| EC-02 | User skips ahead in video | Allow scrubbing, but lesson not "complete" until full watch |
| EC-03 | Exercise validation fails (server error) | Retry automatically, show "Connection issue" if persistent |
| EC-04 | User completes lesson out of order (somehow) | Mark lesson complete, but maintain unlock dependencies |
| EC-05 | Assessment score exactly 80% (boundary) | Pass, award certificate with minimum passing note |
| EC-06 | User fails assessment 3 times | Suggest reviewing lessons, no hard lockout |
| EC-07 | Certificate PDF generation fails | Retry, email certificate when available |
| EC-08 | Lesson content updated after user starts | Finish with old content, prompt to review new content later |

### Test Data Requirements

```json
{
  "module_configuration": {
    "module_id": "browser-automation-fundamentals",
    "title": "Browser Automation Fundamentals",
    "lesson_count": 5,
    "estimated_duration_minutes": 45,
    "passing_score": 80,
    "certificate_template": "templates/browser-automation-cert.pdf"
  },
  "lessons": [
    {
      "id": "lesson-1-intro",
      "title": "Introduction to Browser Automation",
      "type": "video",
      "duration_minutes": 8,
      "knowledge_check_questions": 3,
      "required_correct": 2
    },
    {
      "id": "lesson-2-basics",
      "title": "Building Your First Automation",
      "type": "interactive_exercise",
      "duration_minutes": 10,
      "steps": 8
    },
    {
      "id": "lesson-3-selectors",
      "title": "Understanding Selectors",
      "type": "video",
      "duration_minutes": 12,
      "knowledge_check_questions": 5,
      "required_correct": 4
    },
    {
      "id": "lesson-4-workflows",
      "title": "Multi-Step Workflows",
      "type": "interactive_exercise",
      "duration_minutes": 10,
      "steps": 12
    },
    {
      "id": "lesson-5-troubleshooting",
      "title": "Troubleshooting Common Issues",
      "type": "video",
      "duration_minutes": 10,
      "knowledge_check_questions": 4,
      "required_correct": 3
    }
  ],
  "user_progress": {
    "lessons_completed": ["lesson-1-intro", "lesson-2-basics"],
    "current_lesson": "lesson-3-selectors",
    "video_position_seconds": 245,
    "exercise_step": null,
    "total_time_spent_minutes": 22
  }
}
```

### Priority
**P0** - Critical for user skill development and platform adoption

---

## UXS-016-05: Component Showcase Exploration

### Story ID
UXS-016-05

### Title
User Explores Interactive Component Showcase for Platform Features

### Persona
**Olivia Taylor** - Senior Account Manager at Prime Digital
- 35 years old, evaluating Bottleneck-Bots for her team
- Completed basic onboarding, exploring advanced features
- Technical proficiency: Intermediate-High
- Primary goal: Understand the full capability of each UI component
- Pain point: Needs to see components in action before recommending to team

### Scenario
Olivia is exploring the Component Showcase section of the training center. This area demonstrates all major UI components with live, interactive examples. She wants to see how buttons, forms, data tables, and automation panels work before using them in real workflows.

### User Goal
Explore all major component categories, interact with live examples, understand component customization options, and copy component configurations for use in her own workflows.

### Preconditions
- User has access to training center
- Component Showcase section is enabled
- At least 6 component categories are available
- Each category has 3+ interactive examples
- Code snippets and configuration examples are available

### Step-by-Step User Journey

| Step | User Action | System Response | Expected UI State |
|------|-------------|-----------------|-------------------|
| 1 | Olivia navigates to Component Showcase | Showcase landing page loads | 6 component categories displayed as cards |
| 2 | Olivia clicks "Form Components" | Form examples load | Tab panel with 5 form variations |
| 3 | Olivia interacts with text input demo | Input responds to typing | Live preview shows validation, character count |
| 4 | Olivia toggles validation options | Demo updates in real-time | "Required" toggle enables error on empty submit |
| 5 | Olivia clicks "View Configuration" | Code panel slides open | JSON configuration for current form state |
| 6 | Olivia copies configuration | Copy success notification | "Copied to clipboard!" toast message |
| 7 | Olivia navigates to "Data Tables" | Table examples load | Interactive table with sample data |
| 8 | Olivia sorts table by column | Data re-orders | Sort indicator visible, animation on reorder |
| 9 | Olivia filters table | Matching rows displayed | Filter input, real-time results |
| 10 | Olivia expands "Pagination" section | Pagination controls appear | Page 1 of 5, rows per page selector |
| 11 | Olivia clicks "Automation Panels" | Agent interface examples load | Live agent demo panel |
| 12 | Olivia triggers demo automation | Simulated automation runs | Progress indicators, log output visible |
| 13 | Olivia bookmarks component | Bookmark saved to profile | Star icon filled, "Saved to favorites" |
| 14 | Olivia views favorites | Bookmarked components listed | Quick access to saved components |

### Expected Outcomes
1. All 6 component categories explored
2. Interactive examples function without errors
3. Configuration copying works correctly
4. Bookmarking persists in user profile
5. Demo automations simulate realistic behavior
6. No actual API calls made during demos (sandboxed)
7. Component exploration analytics logged
8. User time in showcase: ~15 minutes

### Acceptance Criteria

```gherkin
Feature: Component Showcase Exploration

  Scenario: Interactive form components respond to input
    Given Olivia is viewing the Form Components showcase
    And the text input demo is displayed
    When Olivia types "test@example.com" into the email field
    Then the field should show the input
    And validation should run (if enabled)
    And a green checkmark should appear for valid email

  Scenario: Configuration can be copied to clipboard
    Given Olivia is viewing a customized component demo
    When Olivia clicks "View Configuration"
    And Olivia clicks the copy button
    Then the clipboard should contain the JSON configuration
    And a success toast should appear: "Copied to clipboard!"

  Scenario: Data table interactions are fully functional
    Given Olivia is viewing the Data Tables showcase
    When Olivia clicks the "Email" column header
    Then the table should sort by email alphabetically
    And the sort indicator should show ascending order
    When Olivia clicks the header again
    Then the sort should reverse to descending

  Scenario: Demo automations run in sandboxed mode
    Given Olivia is viewing the Automation Panels showcase
    When Olivia clicks "Run Demo Automation"
    Then a simulated automation should start
    And progress indicators should update
    And log entries should appear
    And NO actual browser session should be created
    And NO API credits should be consumed

  Scenario: Bookmarked components persist
    Given Olivia has bookmarked 3 components
    When Olivia navigates away and returns later
    Then the bookmarks should still be saved
    And the "Favorites" section should show 3 items
```

### Edge Cases

| ID | Edge Case | Expected Behavior |
|----|-----------|-------------------|
| EC-01 | Component demo errors (JS exception) | Show error boundary, don't crash entire showcase |
| EC-02 | Very long text input in demo | Handle gracefully, show truncation if needed |
| EC-03 | Rapid toggling of options | Debounce updates, maintain state consistency |
| EC-04 | Copy to clipboard not supported (older browser) | Show fallback: "Select and copy manually" with text selected |
| EC-05 | User bookmarks more than 50 components | Allow unlimited bookmarks, paginate favorites view |
| EC-06 | Demo automation takes too long | Timeout after 30 seconds, show "Demo timed out" |
| EC-07 | Component category has no examples | Show "Coming soon" placeholder |
| EC-08 | Mobile viewport | Responsive layout, touch-friendly interactions |

### Test Data Requirements

```json
{
  "component_categories": [
    {
      "id": "form-components",
      "title": "Form Components",
      "icon": "form",
      "example_count": 5,
      "examples": ["Text Input", "Select Dropdown", "Date Picker", "File Upload", "Multi-Step Form"]
    },
    {
      "id": "data-tables",
      "title": "Data Tables",
      "icon": "table",
      "example_count": 4,
      "examples": ["Basic Table", "Sortable Table", "Filterable Table", "Paginated Table"]
    },
    {
      "id": "automation-panels",
      "title": "Automation Panels",
      "icon": "robot",
      "example_count": 3,
      "examples": ["Agent Dashboard", "Task Queue", "Progress Monitor"]
    },
    {
      "id": "charts-metrics",
      "title": "Charts & Metrics",
      "icon": "chart",
      "example_count": 6,
      "examples": ["Line Chart", "Bar Chart", "Pie Chart", "Metrics Cards", "Trend Indicators", "Heatmap"]
    },
    {
      "id": "navigation",
      "title": "Navigation",
      "icon": "menu",
      "example_count": 4,
      "examples": ["Sidebar", "Breadcrumbs", "Tabs", "Pagination"]
    },
    {
      "id": "feedback-alerts",
      "title": "Feedback & Alerts",
      "icon": "bell",
      "example_count": 5,
      "examples": ["Toast Notifications", "Modal Dialogs", "Progress Bars", "Status Badges", "Empty States"]
    }
  ],
  "sample_data": {
    "table_data": [
      {"id": 1, "name": "John Doe", "email": "john@example.com", "status": "active"},
      {"id": 2, "name": "Jane Smith", "email": "jane@example.com", "status": "pending"},
      {"id": 3, "name": "Bob Wilson", "email": "bob@example.com", "status": "inactive"}
    ],
    "chart_data": {
      "labels": ["Jan", "Feb", "Mar", "Apr", "May"],
      "values": [120, 150, 180, 145, 200]
    }
  },
  "user_bookmarks": {
    "component_ids": ["form-text-input", "data-table-filterable", "chart-line"]
  }
}
```

### Priority
**P2** - Valuable for advanced users and evaluation, not critical path

---

## UXS-016-06: Settings Configuration During Onboarding

### Story ID
UXS-016-06

### Title
User Configures Essential Settings as Part of Onboarding

### Persona
**Daniel Foster** - Agency Founder at Velocity Growth
- 42 years old, setting up Bottleneck-Bots for his 15-person agency
- Completing onboarding, now at settings configuration step
- Technical proficiency: High
- Primary goal: Configure optimal settings for his agency's workflow
- Pain point: Doesn't want to miss critical settings that will cause issues later

### Scenario
Daniel has reached the settings configuration step of onboarding. The system guides him through essential settings including notification preferences, integration connections, security options, and default workflow configurations. He wants to set up the platform correctly the first time.

### User Goal
Complete all essential settings configuration, connect at least one integration (GHL), set up team notification preferences, and configure security settings appropriate for his agency.

### Preconditions
- User has completed training modules
- Settings configuration step is active in onboarding
- User has agency admin permissions
- GHL OAuth integration is available
- Email verification is complete

### Step-by-Step User Journey

| Step | User Action | System Response | Expected UI State |
|------|-------------|-----------------|-------------------|
| 1 | Daniel enters settings configuration | Settings wizard loads | "Let's configure your workspace" - 5 sections |
| 2 | Daniel views section list | Sections displayed with status | Notifications, Integrations, Security, Defaults, Team |
| 3 | Daniel clicks "Notifications" | Notification settings panel | Email, push, and in-app toggle groups |
| 4 | Daniel configures notifications | Toggles update in real-time | Task complete: email + in-app, Errors: all channels |
| 5 | Daniel clicks "Save & Continue" | Settings saved, next section | Checkmark on Notifications, Integrations highlighted |
| 6 | Daniel clicks "Connect GHL" | OAuth flow initiates | "Redirecting to GoHighLevel..." |
| 7 | Daniel authorizes in GHL | Return redirect with token | "GoHighLevel connected successfully!" |
| 8 | Daniel selects GHL sub-accounts | Sub-account picker modal | 3 sub-accounts available, multi-select enabled |
| 9 | Daniel selects 2 sub-accounts | Accounts linked | "2 sub-accounts connected" |
| 10 | Daniel continues to Security | Security settings load | MFA, session timeout, IP restrictions |
| 11 | Daniel enables MFA | QR code for authenticator app | "Scan with your authenticator app" |
| 12 | Daniel enters TOTP code | MFA verified and enabled | "Two-factor authentication enabled" |
| 13 | Daniel sets session timeout | Slider for timeout duration | "Auto logout after 4 hours of inactivity" |
| 14 | Daniel continues to Defaults | Default workflow settings | Approval requirements, auto-execution, cost limits |
| 15 | Daniel enables approval for high-cost | Threshold input appears | "Require approval for tasks estimated >$5" |
| 16 | Daniel completes all sections | Completion summary | All 5 sections with green checkmarks |
| 17 | Daniel clicks "Finish Setup" | Onboarding complete | "You're all set! Welcome to Bottleneck-Bots." |

### Expected Outcomes
1. All notification preferences saved to user profile
2. GHL OAuth tokens stored securely
3. 2 sub-accounts linked and synced
4. MFA enabled with backup codes generated
5. Session timeout configured (4 hours)
6. Approval threshold set ($5)
7. `onboardingStatus` set to "completed"
8. `onboardingCompletedAt` timestamp recorded
9. Team members can now be invited
10. Dashboard fully accessible

### Acceptance Criteria

```gherkin
Feature: Settings Configuration During Onboarding

  Scenario: Notification preferences save correctly
    Given Daniel is on the Notifications settings section
    When Daniel enables email notifications for task completions
    And Daniel disables push notifications
    And Daniel clicks "Save & Continue"
    Then the notification preferences should be saved to the database
    And the Notifications section should show a checkmark
    And the next section should become active

  Scenario: GHL OAuth integration connects successfully
    Given Daniel is on the Integrations settings section
    When Daniel clicks "Connect GoHighLevel"
    Then an OAuth popup should open
    When Daniel authorizes in GHL
    Then the popup should close
    And "GoHighLevel connected" should be displayed
    And the sub-account picker should appear

  Scenario: MFA setup requires valid TOTP code
    Given Daniel is setting up MFA
    And a QR code is displayed
    When Daniel enters an incorrect TOTP code
    Then an error should appear: "Invalid code. Please try again."
    When Daniel enters the correct TOTP code
    Then MFA should be enabled
    And backup codes should be generated and displayed
    And Daniel should be prompted to save backup codes

  Scenario: Settings can be skipped and completed later
    Given Daniel is on the Security settings section
    When Daniel clicks "Skip for now"
    Then the section should be marked as "Skipped"
    And Daniel should proceed to the next section
    And a reminder should be scheduled to complete security settings

  Scenario: Onboarding completes when all essential sections are done
    Given Daniel has completed Notifications, Integrations, and Security
    And Daniel has skipped Defaults and Team
    When Daniel clicks "Finish Setup"
    Then onboarding should be marked as complete
    And skipped sections should create setup reminders
    And Daniel should be redirected to the main dashboard
```

### Edge Cases

| ID | Edge Case | Expected Behavior |
|----|-----------|-------------------|
| EC-01 | OAuth popup blocked by browser | Show instructions to allow popups |
| EC-02 | GHL authorization fails | Display error, allow retry with troubleshooting tips |
| EC-03 | MFA app not installed | Provide links to download authenticator apps |
| EC-04 | Invalid session timeout value | Validate: minimum 15 minutes, maximum 24 hours |
| EC-05 | User has no GHL account | Allow skip with note: "You can connect later" |
| EC-06 | Approval threshold set to $0 | Warn: "This will require approval for all tasks" |
| EC-07 | Network error while saving | Retry automatically, show "Saving..." indicator |
| EC-08 | User closes browser during MFA setup | Resume MFA setup on return, don't lock account |

### Test Data Requirements

```json
{
  "settings_sections": [
    {
      "id": "notifications",
      "title": "Notifications",
      "required": true,
      "fields": ["email_enabled", "push_enabled", "in_app_enabled", "digest_frequency"]
    },
    {
      "id": "integrations",
      "title": "Integrations",
      "required": false,
      "integrations": ["ghl", "stripe", "slack", "zapier"]
    },
    {
      "id": "security",
      "title": "Security",
      "required": true,
      "fields": ["mfa_enabled", "session_timeout_minutes", "ip_whitelist"]
    },
    {
      "id": "defaults",
      "title": "Workflow Defaults",
      "required": false,
      "fields": ["approval_threshold", "auto_execute", "cost_limit_daily"]
    },
    {
      "id": "team",
      "title": "Team Setup",
      "required": false,
      "fields": ["default_role", "invitation_limit", "domain_restriction"]
    }
  ],
  "ghl_oauth": {
    "client_id": "test-client-id",
    "redirect_uri": "https://app.bottleneck-bots.com/oauth/callback/ghl",
    "scopes": ["contacts.read", "contacts.write", "campaigns.read"]
  },
  "mfa_config": {
    "issuer": "Bottleneck-Bots",
    "algorithm": "SHA1",
    "digits": 6,
    "period": 30,
    "backup_code_count": 10
  }
}
```

### Priority
**P0** - Critical for account security and integration setup

---

## UXS-016-07: Progress Tracking and Achievements

### Story ID
UXS-016-07

### Title
User Tracks Onboarding Progress and Earns Achievements

### Persona
**Rachel Kim** - Marketing Specialist at Digital Spark
- 27 years old, motivated by gamification and visible progress
- Halfway through onboarding process
- Technical proficiency: Intermediate
- Primary goal: Complete onboarding fully and earn all achievements
- Pain point: Loses motivation in long training processes without feedback

### Scenario
Rachel is tracking her onboarding progress through the progress dashboard. She can see completed steps, remaining tasks, and achievements earned. She's motivated by the progress bar and wants to unlock all badges before starting real work.

### User Goal
View comprehensive progress dashboard, understand what's completed and remaining, earn achievements through milestones, and share progress with colleagues or manager.

### Preconditions
- User is partway through onboarding
- Progress tracking is enabled
- Achievement system is configured with badges
- User has completed: welcome, tour, quiz (partial)
- Social sharing is enabled for achievements

### Step-by-Step User Journey

| Step | User Action | System Response | Expected UI State |
|------|-------------|-----------------|-------------------|
| 1 | Rachel opens progress dashboard | Progress page loads | Overall progress: 45% complete |
| 2 | Rachel views progress ring | Animated progress visualization | Ring fills to 45%, "Good progress!" message |
| 3 | Rachel scrolls to milestone list | Milestones with status icons | Welcome: complete, Tour: complete, Quiz: in progress |
| 4 | Rachel clicks on Quiz milestone | Detailed quiz progress | 7/10 questions answered, 70% current score |
| 5 | Rachel views "Achievements" tab | Badge grid displays | 2 unlocked (Welcome, Explorer), 6 locked |
| 6 | Rachel hovers over locked badge | Requirements tooltip | "Complete all training modules to unlock" |
| 7 | Rachel clicks unlocked "Explorer" badge | Badge detail modal | Earned: "Completed Feature Tour", Date: Jan 11, 2026 |
| 8 | Rachel clicks "Share" on badge | Share modal opens | Options: LinkedIn, Twitter, Copy Link |
| 9 | Rachel shares to LinkedIn | LinkedIn post composer opens | Pre-filled: "I just earned the Platform Explorer badge on Bottleneck-Bots!" |
| 10 | Rachel returns, views streak | Daily streak counter | "3-day streak! Keep it going." |
| 11 | Rachel views "Next Steps" | Recommended actions | "Complete Quiz (10 min)", "Start Training Module 1" |
| 12 | Rachel clicks recommended action | Navigates to that task | Smooth transition to quiz continuation |

### Expected Outcomes
1. Progress percentage accurately reflects completion
2. All milestones show correct status (complete/in progress/locked)
3. Achievements display with earned date
4. Locked achievements show unlock requirements
5. Social sharing generates valid links
6. Daily streak tracks consecutive login days
7. Recommendations are personalized and actionable
8. Progress dashboard loads in under 2 seconds

### Acceptance Criteria

```gherkin
Feature: Progress Tracking and Achievements

  Scenario: Progress percentage is calculated accurately
    Given Rachel has completed 4 of 9 onboarding milestones
    When Rachel views the progress dashboard
    Then the progress should show approximately 44%
    And the progress ring should animate to that percentage
    And completed milestones should have checkmarks

  Scenario: Achievements unlock at correct milestones
    Given Rachel has just completed the Feature Tour
    When the tour completion is saved
    Then the "Platform Explorer" achievement should unlock
    And a notification should appear: "Achievement Unlocked!"
    And the achievement should appear in Rachel's profile

  Scenario: Locked achievements show unlock criteria
    Given Rachel has not completed all training modules
    When Rachel hovers over the "Training Master" badge
    Then a tooltip should appear
    And the tooltip should say: "Complete all training modules"
    And the badge should remain grayed out

  Scenario: Social sharing works correctly
    Given Rachel has unlocked the "Explorer" badge
    When Rachel clicks "Share to LinkedIn"
    Then LinkedIn should open in a new tab
    And the post should be pre-populated with achievement text
    And an image of the badge should be included

  Scenario: Daily streak tracks correctly
    Given Rachel logged in yesterday and today
    And Rachel has not logged in for 2 days before yesterday
    When Rachel views the streak counter
    Then the streak should show "2-day streak"
    And a motivational message should appear

  Scenario: Recommendations are personalized
    Given Rachel has completed 45% of onboarding
    And Rachel's next uncompleted milestone is the Quiz
    When Rachel views "Next Steps"
    Then "Complete the Knowledge Assessment" should be first
    And an estimated time should be shown
```

### Edge Cases

| ID | Edge Case | Expected Behavior |
|----|-----------|-------------------|
| EC-01 | User completes task but server save fails | Show pending status, retry save, update on success |
| EC-02 | Achievement earned but notification closed too fast | Achievement still saved, viewable in profile |
| EC-03 | User loses streak by 1 day | Show "Streak lost" message, encourage restart |
| EC-04 | 100% completion reached | Celebration animation, "Onboarding Complete" badge |
| EC-05 | Social share blocked by popup blocker | Show fallback: "Copy link to share manually" |
| EC-06 | User has 0% progress (just started) | Show encouraging message: "Let's get started!" |
| EC-07 | Milestone requirements change after partial completion | Grandfather existing progress, recalculate total |
| EC-08 | Two achievements unlock simultaneously | Queue notifications, show one at a time |

### Test Data Requirements

```json
{
  "onboarding_milestones": [
    {"id": "welcome", "title": "Welcome Flow", "weight": 10, "required": true},
    {"id": "tour", "title": "Feature Tour", "weight": 15, "required": true},
    {"id": "quiz", "title": "Knowledge Assessment", "weight": 15, "required": true},
    {"id": "training-1", "title": "Module 1: Basics", "weight": 15, "required": true},
    {"id": "training-2", "title": "Module 2: Intermediate", "weight": 15, "required": false},
    {"id": "settings", "title": "Settings Configuration", "weight": 10, "required": true},
    {"id": "integration", "title": "First Integration", "weight": 10, "required": false},
    {"id": "first-task", "title": "First Automation", "weight": 5, "required": false},
    {"id": "invite-team", "title": "Invite Team Member", "weight": 5, "required": false}
  ],
  "achievements": [
    {"id": "welcome-aboard", "title": "Welcome Aboard", "trigger": "welcome_complete", "icon": "wave"},
    {"id": "explorer", "title": "Platform Explorer", "trigger": "tour_complete", "icon": "compass"},
    {"id": "quick-learner", "title": "Quick Learner", "trigger": "quiz_score_90", "icon": "brain"},
    {"id": "certified", "title": "Automation Certified", "trigger": "training_complete", "icon": "certificate"},
    {"id": "connected", "title": "Connected", "trigger": "first_integration", "icon": "link"},
    {"id": "automator", "title": "First Automator", "trigger": "first_task_complete", "icon": "robot"},
    {"id": "team-builder", "title": "Team Builder", "trigger": "team_invite", "icon": "users"},
    {"id": "onboarding-complete", "title": "Onboarding Master", "trigger": "onboarding_100", "icon": "trophy"}
  ],
  "user_progress": {
    "completed_milestones": ["welcome", "tour"],
    "in_progress_milestones": ["quiz"],
    "achievements_earned": ["welcome-aboard", "explorer"],
    "streak_days": 3,
    "last_active_date": "2026-01-11",
    "total_time_spent_minutes": 45
  }
}
```

### Priority
**P1** - Important for user engagement and completion rates

---

## UXS-016-08: Help Documentation Access

### Story ID
UXS-016-08

### Title
User Accesses Contextual Help and Documentation During Onboarding

### Persona
**Michael Santos** - Marketing Operations Lead at Summit Agency
- 38 years old, detail-oriented and thorough
- Currently in training module, has specific question
- Technical proficiency: Intermediate
- Primary goal: Find answers quickly without leaving current task
- Pain point: Help documentation is often generic and hard to navigate

### Scenario
Michael is completing a training module about browser automation when he encounters a concept he doesn't fully understand. He wants to access relevant help documentation without losing his place in the training. He also wants to search for specific topics and bookmark helpful articles.

### User Goal
Access contextual help related to current training content, search documentation effectively, bookmark useful articles, and return to training without losing progress.

### Preconditions
- User is in an active training module
- Help center content is indexed and searchable
- Contextual help is mapped to training sections
- User has not previously accessed help during this session

### Step-by-Step User Journey

| Step | User Action | System Response | Expected UI State |
|------|-------------|-----------------|-------------------|
| 1 | Michael clicks help icon (?) | Help panel slides in from right | Panel overlays training, training still visible |
| 2 | Michael sees contextual suggestions | Related articles for current section | "Based on your current lesson: Browser Selectors Explained" |
| 3 | Michael clicks suggested article | Article loads in panel | Full article content, estimated read time: 3 min |
| 4 | Michael reads article, scrolls | Progress indicator updates | Reading progress bar at bottom |
| 5 | Michael clicks "Related Topics" | Topic chips displayed | "XPath Basics", "CSS Selectors", "Dynamic Elements" |
| 6 | Michael types in search bar | Instant search results | "automation" shows 15 results, highlighting matches |
| 7 | Michael filters by category | Results filtered | Category: "Training" shows 5 results |
| 8 | Michael clicks search result | New article loads | Smooth transition, back button available |
| 9 | Michael bookmarks article | Bookmark icon fills | Toast: "Article saved to your bookmarks" |
| 10 | Michael clicks video embed | Video plays inline | Video player in help panel, training paused |
| 11 | Michael clicks "Ask AI" button | AI chat interface opens | "Hi Michael! How can I help with Browser Automation?" |
| 12 | Michael types question | AI responds with answer | Context-aware response, links to relevant docs |
| 13 | Michael closes help panel | Panel slides out | Training module restored to previous position |
| 14 | Michael continues training | Lesson video resumes | Progress maintained, no content lost |

### Expected Outcomes
1. Help panel opens without disrupting training progress
2. Contextual suggestions are relevant to current lesson
3. Search returns accurate, ranked results
4. Bookmarked articles persist in user profile
5. AI assistant provides helpful, contextual responses
6. Video playback works within help panel
7. Training state perfectly preserved after help access
8. Help access analytics logged for content improvement

### Acceptance Criteria

```gherkin
Feature: Help Documentation Access

  Scenario: Contextual help shows relevant content
    Given Michael is on Lesson 3 about browser selectors
    When Michael opens the help panel
    Then at least 2 contextual articles should be suggested
    And the articles should be related to selectors or browser automation
    And the first suggestion should be "Browser Selectors Explained"

  Scenario: Search returns accurate results
    Given Michael is in the help panel
    When Michael types "xpath" in the search bar
    Then results should appear within 500ms
    And results should include articles about XPath
    And the search term should be highlighted in results

  Scenario: Bookmarks persist across sessions
    Given Michael has bookmarked 3 articles
    When Michael closes the help panel
    And Michael reopens the help panel later
    Then the bookmark section should show 3 saved articles
    And clicking a bookmark should open that article

  Scenario: AI assistant provides contextual help
    Given Michael is on a lesson about error handling
    When Michael opens the AI assistant
    And Michael asks "What should I do if an element isn't found?"
    Then the AI should provide a relevant answer
    And the answer should reference error handling techniques
    And links to related documentation should be included

  Scenario: Training progress is preserved
    Given Michael is at 4:32 of a 10-minute training video
    When Michael opens the help panel for 5 minutes
    And Michael closes the help panel
    Then the video should be at the 4:32 mark
    And Michael should be able to resume playing immediately
```

### Edge Cases

| ID | Edge Case | Expected Behavior |
|----|-----------|-------------------|
| EC-01 | Help content not available for section | Show "No specific help for this section" with general search |
| EC-02 | Search returns no results | Show "No results. Try different keywords." with suggestions |
| EC-03 | Article contains outdated information | Show "Last updated" date, flag for review internally |
| EC-04 | Video in article fails to load | Show placeholder with "Video unavailable" and transcript |
| EC-05 | AI assistant is temporarily unavailable | Graceful fallback: "AI is temporarily unavailable. Search our docs instead." |
| EC-06 | User bookmarks 100+ articles | Paginate bookmarks, allow search within bookmarks |
| EC-07 | Help panel opened on mobile | Full-screen modal instead of side panel |
| EC-08 | User clicks internal link in article | Navigate within panel, add to back stack |

### Test Data Requirements

```json
{
  "help_articles": [
    {
      "id": "selectors-explained",
      "title": "Browser Selectors Explained",
      "category": "Training",
      "content": "Full article content...",
      "read_time_minutes": 3,
      "contextual_triggers": ["lesson-3-selectors", "lesson-4-workflows"],
      "related_topics": ["xpath-basics", "css-selectors", "dynamic-elements"]
    },
    {
      "id": "xpath-basics",
      "title": "XPath Basics for Automation",
      "category": "Reference",
      "content": "Full article content...",
      "read_time_minutes": 5,
      "has_video": true,
      "video_url": "https://videos.example.com/xpath-basics.mp4"
    },
    {
      "id": "troubleshooting-errors",
      "title": "Troubleshooting Common Automation Errors",
      "category": "Troubleshooting",
      "content": "Full article content...",
      "read_time_minutes": 4,
      "contextual_triggers": ["lesson-5-troubleshooting"]
    }
  ],
  "search_index": {
    "total_articles": 150,
    "categories": ["Training", "Reference", "Troubleshooting", "FAQ", "API"],
    "last_updated": "2026-01-10T00:00:00Z"
  },
  "ai_assistant_config": {
    "model": "gpt-4",
    "max_tokens": 500,
    "context_window": "current_lesson",
    "fallback_search": true
  },
  "user_bookmarks": {
    "article_ids": ["selectors-explained", "xpath-basics"]
  }
}
```

### Priority
**P1** - Important for self-service support and reducing support tickets

---

## UXS-016-09: Onboarding Resumption After Interruption

### Story ID
UXS-016-09

### Title
User Resumes Onboarding After Session Interruption or Time Away

### Persona
**Jessica Lee** - Marketing Director at Peak Performance Agency
- 45 years old, extremely busy with client meetings
- Started onboarding 3 days ago, had to stop mid-training
- Technical proficiency: Intermediate
- Primary goal: Pick up exactly where she left off without repeating content
- Pain point: Often gets interrupted and forgets where she was

### Scenario
Jessica started onboarding last week but was interrupted by urgent client work. She's now returning to complete her training. The system should recognize her progress, offer a smooth re-entry point, and provide a quick summary of what she's already completed.

### User Goal
Resume onboarding from the exact point of interruption, receive a brief recap of completed content, and continue without repeating already-finished sections.

### Preconditions
- User has partially completed onboarding
- Last session was 3 days ago
- Progress is stored in database
- User has completed: welcome, tour, 2 of 5 training lessons
- Session data includes exact video position

### Step-by-Step User Journey

| Step | User Action | System Response | Expected UI State |
|------|-------------|-----------------|-------------------|
| 1 | Jessica logs into platform | System detects incomplete onboarding | Dashboard with resumption prompt |
| 2 | Jessica sees "Continue Onboarding" banner | Prominent banner with progress summary | "Welcome back! You're 40% complete. Continue where you left off?" |
| 3 | Jessica clicks "Continue" | Resume modal with options | "Resume Lesson 3" or "View Progress Overview" |
| 4 | Jessica selects "View Progress Overview" | Progress summary displays | Completed: Welcome, Tour, Lessons 1-2. In progress: Lesson 3 |
| 5 | Jessica reviews completed sections | Brief recaps available | "Lesson 2 Recap: You learned about basic selectors..." |
| 6 | Jessica clicks "Read Recap" for Lesson 2 | 30-second recap card expands | Key points from Lesson 2, no need to retake |
| 7 | Jessica clicks "Resume Lesson 3" | Lesson 3 loads at saved position | Video at 2:15 / 10:00, "Welcome back" overlay |
| 8 | Jessica sees welcome back overlay | Contextual reminder | "Last time: You were learning about advanced selectors" |
| 9 | Jessica dismisses overlay | Video ready to play | Play button visible, position maintained |
| 10 | Jessica continues lesson | Progress saves continuously | Auto-save every 30 seconds |
| 11 | Jessica finishes Lesson 3 | Completion confirmed | "Lesson 3 complete! 3 of 5 lessons done." |
| 12 | Jessica pauses for another meeting | "Save & Exit" option used | Progress saved, reminder scheduled |
| 13 | Jessica receives email reminder | Friendly reminder 24 hours later | "You're almost done! 2 lessons remaining." |

### Expected Outcomes
1. User recognized immediately on login
2. Resume banner displays with accurate progress
3. Recap summaries available without re-taking content
4. Exact video position restored (within 5 seconds)
5. Contextual reminder helps user recall context
6. Progress saves reliably during session
7. Friendly reminder emails sent for incomplete onboarding
8. No content repeated unnecessarily

### Acceptance Criteria

```gherkin
Feature: Onboarding Resumption After Interruption

  Scenario: Resume banner appears for incomplete onboarding
    Given Jessica has 40% onboarding progress
    And Jessica has not logged in for 3 days
    When Jessica logs in
    Then a "Continue Onboarding" banner should appear
    And the banner should show her progress percentage
    And a "Continue" button should be prominent

  Scenario: Video position is restored accurately
    Given Jessica left Lesson 3 at 2:15 of 10:00
    When Jessica clicks "Resume Lesson 3"
    Then the video should load at the 2:15 position
    And a "Welcome back" overlay should appear briefly
    And the overlay should summarize where she left off

  Scenario: Recap summaries are available
    Given Jessica completed Lessons 1 and 2 previously
    When Jessica views the Progress Overview
    Then recap cards should be available for Lessons 1 and 2
    And clicking "Read Recap" should show key points
    And the recap should take less than 30 seconds to read

  Scenario: Reminder emails are sent for incomplete onboarding
    Given Jessica has not logged in for 24 hours
    And Jessica has incomplete onboarding
    When the reminder scheduler runs
    Then an email should be sent to Jessica
    And the email should include her progress (40%)
    And the email should have a direct link to resume

  Scenario: User can skip to current incomplete section
    Given Jessica has completed Lessons 1-2
    When Jessica returns to the training module
    Then Lessons 1-2 should show checkmarks
    And Lesson 3 should be highlighted as "Continue here"
    And Lessons 4-5 should be accessible but unmarked
```

### Edge Cases

| ID | Edge Case | Expected Behavior |
|----|-----------|-------------------|
| EC-01 | Lesson content updated since last visit | Show "Content updated" badge, allow review of changes |
| EC-02 | Video position data corrupted | Start from beginning with "We couldn't find your exact position" |
| EC-03 | User was mid-quiz when interrupted | Restore quiz progress if within 1 hour, else restart quiz |
| EC-04 | Onboarding module removed/restructured | Map old progress to new structure, show transition message |
| EC-05 | User ignores resume banner | Banner minimizes after 3 views, appears in sidebar instead |
| EC-06 | Multiple devices - different progress | Sync to highest progress, show conflict notification if significant |
| EC-07 | User explicitly wants to restart | Provide "Start Over" option with confirmation |
| EC-08 | 30+ days since last activity | Show extended recap, offer abbreviated refresher |

### Test Data Requirements

```json
{
  "returning_user_progress": {
    "user_id": "user_jessica_456",
    "onboarding_status": "in_progress",
    "started_at": "2026-01-08T10:00:00Z",
    "last_active_at": "2026-01-08T14:32:00Z",
    "days_since_activity": 3,
    "progress_percentage": 40,
    "completed_milestones": ["welcome", "tour", "lesson-1", "lesson-2"],
    "current_milestone": "lesson-3",
    "lesson_progress": {
      "lesson-3": {
        "video_position_seconds": 135,
        "total_duration_seconds": 600,
        "last_viewed_at": "2026-01-08T14:32:00Z"
      }
    }
  },
  "recap_content": {
    "lesson-1": {
      "title": "Introduction to Browser Automation",
      "key_points": [
        "Browser automation uses AI to control web browsers",
        "You can automate repetitive tasks like data entry",
        "The agent panel shows real-time execution status"
      ],
      "duration_seconds": 30
    },
    "lesson-2": {
      "title": "Building Your First Automation",
      "key_points": [
        "Create automations from the dashboard",
        "Define triggers and actions",
        "Test in safe mode before production"
      ],
      "duration_seconds": 30
    }
  },
  "reminder_schedule": {
    "first_reminder_hours": 24,
    "second_reminder_hours": 72,
    "max_reminders": 3,
    "email_template": "onboarding-resume"
  }
}
```

### Priority
**P0** - Critical for onboarding completion and user retention

---

## UXS-016-10: Skip and Customize Onboarding Flow

### Story ID
UXS-016-10

### Title
Experienced User Skips or Customizes Onboarding Sections

### Persona
**David Park** - Automation Consultant at Tech Solutions Inc.
- 40 years old, has used similar platforms extensively
- Joining Bottleneck-Bots from a competitor platform
- Technical proficiency: Expert
- Primary goal: Skip basic content and focus on platform-specific differences
- Pain point: Wastes time on beginner content he already knows

### Scenario
David is an experienced automation professional who doesn't need the basic onboarding content. He wants to skip sections he already knows, take the advanced assessment to prove competency, and only complete the platform-specific customization steps.

### User Goal
Customize the onboarding experience by skipping irrelevant sections, demonstrating expertise through assessment, and focusing only on platform-specific content that's truly new.

### Preconditions
- User has selected "I'm an expert" during initial setup
- Skip options are enabled for expert users
- Advanced assessment is available
- Platform-specific sections cannot be skipped

### Step-by-Step User Journey

| Step | User Action | System Response | Expected UI State |
|------|-------------|-----------------|-------------------|
| 1 | David starts onboarding as "expert" | Customization options presented | "Customize Your Onboarding" screen |
| 2 | David views section list | All sections with skip toggles | Tour: optional, Quiz: take advanced, Training: select modules |
| 3 | David toggles "Skip Feature Tour" | Tour marked as skipped | "You can access the tour anytime from Help" |
| 4 | David selects "Take Advanced Assessment" | Advanced quiz option highlighted | "Prove your expertise - 15 questions, 10 minutes" |
| 5 | David reviews training modules | Module list with difficulty levels | "Select only the modules you need" |
| 6 | David unchecks basic modules | 2 basic modules deselected | Only "Advanced Workflows" and "API Integration" selected |
| 7 | David clicks "Apply Customization" | Custom path created | "Your customized path: 4 steps (30 min estimated)" |
| 8 | David starts advanced assessment | 15-question quiz loads | Harder questions, same time limit |
| 9 | David completes with 95% score | Expert status confirmed | "Outstanding! Basic training waived." |
| 10 | David proceeds to selected training | Only advanced modules shown | Module 1 "Advanced Workflows" ready |
| 11 | David reaches platform-specific section | Section marked required | "Platform Setup - Required" with no skip option |
| 12 | David completes platform setup | Final confirmation | "Onboarding complete! You're an expert." |
| 13 | David later accesses skipped content | Available in Training Center | "Explore content you skipped during onboarding" |

### Expected Outcomes
1. Expert user can skip 60%+ of standard onboarding
2. Advanced assessment accurately tests expertise
3. Skipped content remains accessible for later
4. Platform-specific sections are non-skippable
5. Onboarding time reduced from 60 min to 25 min
6. Expert achievements awarded appropriately
7. Customization preferences stored for analytics
8. User satisfaction higher due to respect for expertise

### Acceptance Criteria

```gherkin
Feature: Skip and Customize Onboarding Flow

  Scenario: Expert users can skip basic content
    Given David has selected "I'm an expert" expertise level
    When David views the onboarding customization screen
    Then skip toggles should appear for eligible sections
    And "Feature Tour" and "Basic Training" should be skippable
    And "Platform Setup" should be marked as required

  Scenario: Advanced assessment unlocks skip privileges
    Given David is taking the advanced assessment
    And the assessment has 15 questions
    When David scores 90% or higher
    Then basic training should be waived
    And David should receive the "Expert" badge
    And only advanced training modules should be required

  Scenario: Skipped content remains accessible
    Given David has skipped the Feature Tour during onboarding
    When David visits the Training Center after onboarding
    Then the Feature Tour should be available under "Explore More"
    And a note should say "You skipped this during onboarding"
    And David should be able to take the tour at any time

  Scenario: Platform-specific sections cannot be skipped
    Given David is on the onboarding customization screen
    When David tries to skip "Platform Setup"
    Then the skip toggle should be disabled
    And a tooltip should say "This section is required for all users"
    And David must complete this section to finish onboarding

  Scenario: Custom path shows reduced time estimate
    Given David has skipped 3 sections and selected 2 training modules
    When David views the customized path summary
    Then the estimated time should be 30 minutes or less
    And the path should show only 4-5 steps
    And David should be able to start the customized path
```

### Edge Cases

| ID | Edge Case | Expected Behavior |
|----|-----------|-------------------|
| EC-01 | User fails advanced assessment (<70%) | Recommend completing standard path instead |
| EC-02 | User changes expertise level mid-onboarding | Confirm change, recalculate path, merge progress |
| EC-03 | All optional content skipped | Still require platform-specific sections (15 min minimum) |
| EC-04 | User regrets skipping content | Allow "Add back" from customization any time |
| EC-05 | Expert assessment question bank exhausted | Recycle questions with different order/options |
| EC-06 | Organization requires full onboarding | Admin override disables skip options for org |
| EC-07 | User skips then team role requires training | Notify user of new requirement, add to path |
| EC-08 | Previous platform experience outdated (>2 years) | Suggest refresher content, don't auto-waive |

### Test Data Requirements

```json
{
  "onboarding_sections": [
    {
      "id": "welcome",
      "title": "Welcome Flow",
      "skippable": false,
      "expert_skippable": false,
      "duration_minutes": 5
    },
    {
      "id": "tour",
      "title": "Feature Tour",
      "skippable": true,
      "expert_skippable": true,
      "duration_minutes": 10
    },
    {
      "id": "quiz",
      "title": "Knowledge Assessment",
      "skippable": false,
      "expert_skippable": false,
      "has_advanced_version": true,
      "duration_minutes": 15
    },
    {
      "id": "training-basic",
      "title": "Basic Training Modules",
      "skippable": true,
      "expert_skippable": true,
      "waived_on_expert_score": 90,
      "duration_minutes": 30
    },
    {
      "id": "training-advanced",
      "title": "Advanced Training Modules",
      "skippable": true,
      "expert_skippable": false,
      "duration_minutes": 20
    },
    {
      "id": "platform-setup",
      "title": "Platform Configuration",
      "skippable": false,
      "expert_skippable": false,
      "duration_minutes": 10
    }
  ],
  "advanced_assessment": {
    "question_count": 15,
    "time_limit_minutes": 10,
    "passing_score": 90,
    "difficulty": "expert",
    "topics": ["automation-architecture", "api-integration", "error-handling", "optimization"]
  },
  "expert_customization": {
    "user_id": "user_david_789",
    "expertise_level": "expert",
    "skipped_sections": ["tour", "training-basic"],
    "selected_modules": ["advanced-workflows", "api-integration"],
    "estimated_duration_minutes": 30
  }
}
```

### Priority
**P2** - Important for expert user satisfaction and efficient onboarding

---

## Summary Matrix

| Story ID | Title | Persona | Priority | Key Validation Points |
|----------|-------|---------|----------|----------------------|
| UXS-016-01 | New User Welcome and Initial Setup | Emma (New Employee) | P0 | Profile creation, experience selection, smooth first impression |
| UXS-016-02 | Interactive Feature Tour Completion | Marcus (Manager) | P1 | Tour navigation, interactive demos, progress persistence |
| UXS-016-03 | Knowledge Assessment Quiz Taking | Sophia (Ops Specialist) | P1 | Timer accuracy, scoring, training level assignment |
| UXS-016-04 | Training Module Progression | James (Junior Associate) | P0 | Video progress, exercises, certification |
| UXS-016-05 | Component Showcase Exploration | Olivia (Senior Manager) | P2 | Interactive demos, configuration copying, bookmarks |
| UXS-016-06 | Settings Configuration During Onboarding | Daniel (Founder) | P0 | OAuth integration, MFA setup, essential settings |
| UXS-016-07 | Progress Tracking and Achievements | Rachel (Specialist) | P1 | Progress accuracy, achievement unlocks, social sharing |
| UXS-016-08 | Help Documentation Access | Michael (Ops Lead) | P1 | Contextual help, search, AI assistant, training state preservation |
| UXS-016-09 | Onboarding Resumption After Interruption | Jessica (Director) | P0 | Session restoration, recap summaries, reminder emails |
| UXS-016-10 | Skip and Customize Onboarding Flow | David (Consultant) | P2 | Expert path, advanced assessment, skip options |

---

## Test Environment Requirements

### Required Accounts
- Test user accounts at various onboarding stages
- Admin account with onboarding configuration access
- GHL sandbox account for OAuth testing
- Email testing service (e.g., Mailhog) for notification testing

### Test Data Setup
1. Pre-configure invitation tokens (valid, expired, used)
2. Create question banks for quizzes (basic and advanced)
3. Prepare video content for training modules
4. Set up help documentation content
5. Configure achievement triggers and badges
6. Create sample training modules with mixed content types

### Monitoring Requirements
- Onboarding completion rate tracking
- Average time per section analytics
- Drop-off point identification
- Achievement unlock rates
- Help article effectiveness metrics
- Quiz score distribution

### Browser Testing
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)
- Mobile Safari (iOS 15+)
- Chrome Mobile (Android 12+)

---

**Document History**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-11 | QA Team | Initial UX Stories creation |

---

**Related Documents**
- PRD-016: Training & Onboarding System
- ONBOARDING_FLOW.md: Technical Implementation Guide
- USER_FLOWS.md: User Flow Diagrams
- TRAINING_CONTENT.md: Training Module Specifications

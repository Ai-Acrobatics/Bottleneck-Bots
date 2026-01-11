# PRD: Agent Memory & Learning

## Overview
A persistent memory and learning system for Bottleneck-Bots agents that maintains context across sessions, creates execution checkpoints, recognizes successful task patterns, and collects user feedback for continuous improvement. This system enables agents to become more effective over time through experience.

## Problem Statement
Stateless agents lack learning capabilities:
- Each session starts fresh, losing valuable context
- Repeated failures aren't prevented by past experience
- Successful patterns aren't automatically replicated
- User corrections don't persist across interactions
- Without memory, agents cannot adapt or improve

## Goals & Objectives
- **Primary Goals**
  - Persist agent memory and context across sessions
  - Create checkpoints for recovery and rollback
  - Recognize and replicate successful task patterns
  - Collect and utilize user feedback for improvement

- **Success Metrics**
  - 30% reduction in repeated errors
  - 25% improvement in task completion rate
  - 40% faster completion of previously-seen tasks
  - 90% checkpoint recovery success rate

## User Stories
- As a **user**, I want my agent to remember previous conversations so that I don't repeat myself
- As a **workflow owner**, I want checkpoints so that I can recover from failures
- As a **power user**, I want agents to learn from successes so that they improve over time
- As a **admin**, I want to see what agents have learned so that I can validate their behavior
- As a **user**, I want to correct agent mistakes so that they don't happen again
- As a **developer**, I want to export agent knowledge so that I can share it across agents

## Functional Requirements

### Must Have (P0)
- **Memory Persistence**
  - Short-term memory (current session context)
  - Long-term memory (persistent knowledge)
  - Memory types: episodic (events), semantic (facts), procedural (how-to)
  - Memory search and retrieval
  - Memory expiration and cleanup policies

- **Execution Checkpoints**
  - Automatic checkpoint creation at key steps
  - Manual checkpoint triggers
  - State serialization and storage
  - Checkpoint-based recovery
  - Checkpoint comparison and diff

- **Pattern Recognition**
  - Successful task pattern identification
  - Pattern frequency and success tracking
  - Pattern generalization across similar tasks
  - Anti-pattern detection (failure recognition)
  - Pattern recommendation during execution

- **Feedback Collection**
  - Real-time correction during execution
  - Post-task rating and feedback
  - Specific step feedback
  - Preference learning
  - Feedback impact tracking

### Should Have (P1)
- Memory sharing between agents
- Contextual memory recall (similarity-based)
- Pattern confidence scoring
- Feedback-driven pattern refinement
- Memory visualization dashboard
- Export/import memory capabilities

### Nice to Have (P2)
- Natural language memory queries
- Automatic memory organization
- Cross-organization pattern sharing
- Predictive pattern suggestions
- Memory compression for efficiency
- Explainable memory decisions

## Non-Functional Requirements

### Performance
- Memory retrieval < 50ms
- Checkpoint creation < 200ms
- Pattern matching < 100ms
- Support 10,000+ memory entries per agent

### Reliability
- 99.9% memory persistence guarantee
- Checkpoint recovery success > 99%
- No memory corruption or loss

### Privacy
- User-controlled memory deletion
- Memory access audit logging
- Encrypted memory storage

## Technical Requirements

### Architecture
```
┌────────────────────────────────────────────────────────────────┐
│                  Agent Memory & Learning Service                │
├────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   Memory     │  │  Checkpoint  │  │   Pattern            │  │
│  │   Manager    │  │   Manager    │  │   Recognizer         │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
├────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   Learning   │  │   Feedback   │  │   Memory             │  │
│  │   Engine     │  │   Processor  │  │   Search             │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
├────────────────────────────────────────────────────────────────┤
│   PostgreSQL + pgvector   │   Redis   │   Object Storage     │
└────────────────────────────────────────────────────────────────┘
```

### Dependencies
- **PostgreSQL + pgvector**: Memory storage and semantic search
- **Redis**: Short-term memory and caching
- **Object Storage**: Checkpoint state files
- **Background Workers**: Pattern analysis
- **ML Service**: Pattern recognition models

### APIs
- `POST /memory` - Store memory entry
- `GET /memory` - Retrieve memories
- `POST /memory/search` - Semantic memory search
- `DELETE /memory/{id}` - Delete memory entry
- `DELETE /memory/agent/{id}` - Clear agent memory
- `POST /checkpoints` - Create checkpoint
- `GET /checkpoints` - List checkpoints
- `POST /checkpoints/{id}/restore` - Restore from checkpoint
- `GET /checkpoints/{id}/diff` - Compare checkpoints
- `GET /patterns` - Get recognized patterns
- `POST /patterns/{id}/apply` - Apply pattern
- `POST /feedback` - Submit feedback
- `GET /feedback/impact` - Get feedback impact metrics
- `GET /learning/status` - Get learning progress

### Database Schema
```sql
-- Agent Memory
CREATE TABLE agent_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL, -- workflow or bot id
  organization_id UUID REFERENCES organizations(id),
  memory_type VARCHAR(20) NOT NULL, -- episodic, semantic, procedural
  category VARCHAR(50), -- conversation, task, preference, fact
  content TEXT NOT NULL,
  embedding vector(1536), -- for semantic search
  importance_score DECIMAL(3,2) DEFAULT 0.5, -- 0-1 score
  access_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMP,
  context JSONB DEFAULT '{}', -- task_id, user_id, session_id
  metadata JSONB DEFAULT '{}',
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create vector index for semantic search
CREATE INDEX ON agent_memories USING hnsw (embedding vector_cosine_ops);

-- Memory Associations (linking related memories)
CREATE TABLE memory_associations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_memory_id UUID REFERENCES agent_memories(id) ON DELETE CASCADE,
  target_memory_id UUID REFERENCES agent_memories(id) ON DELETE CASCADE,
  association_type VARCHAR(30) NOT NULL, -- causal, temporal, semantic, reinforcement
  strength DECIMAL(3,2) DEFAULT 0.5, -- 0-1
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(source_memory_id, target_memory_id, association_type)
);

-- Execution Checkpoints
CREATE TABLE execution_checkpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id UUID NOT NULL,
  workflow_id UUID NOT NULL,
  organization_id UUID REFERENCES organizations(id),
  checkpoint_name VARCHAR(100),
  step_index INTEGER NOT NULL,
  step_id VARCHAR(100),
  checkpoint_type VARCHAR(20) DEFAULT 'auto', -- auto, manual, error
  state JSONB NOT NULL, -- serialized execution state
  variables JSONB DEFAULT '{}', -- workflow variables at checkpoint
  browser_state_path TEXT, -- S3 path for browser state if applicable
  parent_checkpoint_id UUID REFERENCES execution_checkpoints(id),
  is_recoverable BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Checkpoint Recovery Log
CREATE TABLE checkpoint_recoveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checkpoint_id UUID REFERENCES execution_checkpoints(id),
  new_execution_id UUID NOT NULL,
  recovery_status VARCHAR(20) NOT NULL, -- success, partial, failed
  recovery_details JSONB,
  recovered_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Task Patterns
CREATE TABLE task_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  pattern_name VARCHAR(100) NOT NULL,
  description TEXT,
  pattern_type VARCHAR(30) NOT NULL, -- success, failure, optimization
  trigger_conditions JSONB NOT NULL, -- when to apply this pattern
  action_sequence JSONB NOT NULL, -- what actions constitute this pattern
  generalization_level VARCHAR(20) DEFAULT 'specific', -- specific, moderate, general
  occurrence_count INTEGER DEFAULT 1,
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  success_rate DECIMAL(5,2),
  avg_improvement_pct DECIMAL(5,2), -- time or quality improvement
  confidence_score DECIMAL(3,2) DEFAULT 0.5,
  source_executions UUID[], -- executions that contributed to pattern
  is_validated BOOLEAN DEFAULT FALSE,
  validated_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Pattern Applications
CREATE TABLE pattern_applications (
  id UUID DEFAULT gen_random_uuid(),
  pattern_id UUID NOT NULL,
  execution_id UUID NOT NULL,
  application_type VARCHAR(20) NOT NULL, -- suggested, auto_applied, user_applied
  was_accepted BOOLEAN,
  outcome VARCHAR(20), -- success, failure, partial
  improvement_metrics JSONB, -- time_saved, steps_skipped, etc.
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id, created_at)
);
SELECT create_hypertable('pattern_applications', 'created_at');

-- User Feedback for Learning
CREATE TABLE learning_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL,
  organization_id UUID REFERENCES organizations(id),
  user_id UUID REFERENCES users(id),
  execution_id UUID,
  step_id VARCHAR(100),
  feedback_type VARCHAR(30) NOT NULL, -- correction, rating, preference, reinforcement
  original_action JSONB, -- what the agent did
  corrected_action JSONB, -- what it should have done (if correction)
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_processed BOOLEAN DEFAULT FALSE,
  learning_outcome JSONB, -- what was learned from this feedback
  created_at TIMESTAMP DEFAULT NOW()
);

-- Learning Progress
CREATE TABLE learning_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL,
  organization_id UUID REFERENCES organizations(id),
  metric_name VARCHAR(50) NOT NULL, -- task_completion, error_rate, speed, etc.
  metric_value DECIMAL(10,4) NOT NULL,
  baseline_value DECIMAL(10,4), -- starting point for comparison
  improvement_pct DECIMAL(5,2),
  measurement_period VARCHAR(20), -- daily, weekly, monthly
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  sample_size INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(agent_id, metric_name, period_start)
);

-- Memory Cleanup Policies
CREATE TABLE memory_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  policy_name VARCHAR(100) NOT NULL,
  memory_types VARCHAR(20)[] DEFAULT ARRAY['episodic', 'semantic', 'procedural'],
  retention_days INTEGER,
  min_importance_score DECIMAL(3,2),
  min_access_count INTEGER,
  max_memories_per_agent INTEGER,
  cleanup_strategy VARCHAR(30) DEFAULT 'importance', -- lru, importance, hybrid
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Memory Types
```yaml
memory_types:
  episodic:
    description: "Specific events and experiences"
    examples:
      - "User asked to reschedule meeting on 2024-01-15"
      - "Form submission failed due to captcha at step 5"
    retention: "30 days default"

  semantic:
    description: "Facts and general knowledge"
    examples:
      - "User prefers morning meetings"
      - "Client X uses CRM system Y"
    retention: "permanent until updated"

  procedural:
    description: "How to do things"
    examples:
      - "To login to site X: click login, enter email, enter password"
      - "Optimal form fill order for checkout: name, email, address, payment"
    retention: "permanent, versioned"
```

### Learning Pipeline
```yaml
learning_pipeline:
  stages:
    1_collect:
      - Gather execution data
      - Capture user feedback
      - Record outcomes

    2_analyze:
      - Identify patterns in successful executions
      - Detect anti-patterns in failures
      - Calculate pattern confidence

    3_generalize:
      - Abstract patterns from specific instances
      - Create reusable templates
      - Validate against test cases

    4_apply:
      - Match current task to known patterns
      - Suggest or auto-apply patterns
      - Record application outcomes

    5_refine:
      - Update pattern confidence based on outcomes
      - Merge similar patterns
      - Retire ineffective patterns
```

## Success Metrics
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Repeated Error Reduction | > 30% | Error log analysis |
| Task Completion Rate | +25% improvement | Execution analytics |
| Task Speed (known tasks) | +40% improvement | Performance metrics |
| Checkpoint Recovery Success | > 90% | Recovery logs |
| Memory Retrieval Accuracy | > 85% | Relevance testing |
| Pattern Application Success | > 75% | Application outcomes |

## Dependencies
- Vector database for semantic memory
- ML pipeline for pattern recognition
- Background job processing
- Object storage for checkpoints
- Real-time feedback collection UI

## Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Memory bloat | Medium - Performance degradation | Cleanup policies, importance scoring, archival |
| Incorrect learning | High - Repeated mistakes | Validation step, confidence thresholds, user oversight |
| Checkpoint storage costs | Medium - Operational expense | Compression, selective checkpointing, retention limits |
| Privacy concerns | High - User trust | Clear policies, user control, data encryption |
| Pattern overfitting | Medium - Brittle automation | Generalization levels, diverse training data |
| Feedback sparsity | Medium - Slow learning | Implicit feedback, active prompting, incentives |

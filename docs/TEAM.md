# Team Collaboration Guide
## AI-Based Internship Recommendation Engine
---
## Table of Contents

1. [Monorepo Structure](#1-monorepo-structure)
2. [Role-Wise Task Distribution](#2-role-wise-task-distribution)
3. [API Contracts](#3-api-contracts)
4. [Database Schema](#4-database-schema)
5. [Branching Strategy](#5-branching-strategy)
6. [Hour-by-Hour Collaboration Plan](#6-hour-by-hour-collaboration-plan)
7. [Merge Conflict Prevention Rules](#7-merge-conflict-prevention-rules)
8. [GitHub Setup Checklist](#8-github-setup-checklist)

---

## 1. Monorepo Structure

Everyone works in **one repo**. Each dev owns one top-level directory and almost never touches another's.

```
/internship-engine                        ← single GitHub repo
│
├── apps/
│   ├── web/                              ← DEV A (Next.js frontend)
│   └── api/                              ← DEV B (FastAPI backend)
│
├── services/
│   ├── worker/                           ← DEV C (Celery tasks)
│   └── ml/                              ← DEV D (ML / embedding service)
│
├── packages/
│   └── contracts/                        ← SHARED (all devs read, Dev B owns)
│       ├── openapi.yaml                  ← API contract (source of truth)
│       ├── db_schema.sql                 ← DB schema (source of truth)
│       ├── queue_events.py               ← Celery task payload shapes
│       └── types/
│           ├── shared.ts                 ← TypeScript types (web)
│           └── shared.py                 ← Pydantic models (api/worker/ml)
│
├── infra/
│   ├── docker-compose.yml                ← All services wired together
│   ├── .env.example                      ← Template (no real secrets)
│   └── seed/
│       ├── skills.json                   ← Canonical skill taxonomy seed
│       └── internships.json              ← Sample internship seed data
│
├── docs/
│   ├── PRD.md
│   ├── FEATURES.md
│   ├── TASKS.md
│   └── TEAM.md                           ← this file
│
├── .github/
│   └── workflows/
│       ├── ci-web.yml
│       ├── ci-api.yml
│       ├── ci-worker.yml
│       └── ci-ml.yml
│
├── .gitignore
└── README.md
```

**Golden Rule:** You own your directory. You never push directly to another dev's directory.

---

## 2. Role-Wise Task Distribution

### Overview

| Dev | Role | Surface | Stack |
|-----|------|---------|-------|
| **Dev A** | Frontend Engineer | `apps/web` | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| **Dev B** | Backend Engineer | `apps/api` + `packages/contracts` | FastAPI, SQLAlchemy, Alembic, Pydantic v2 |
| **Dev C** | Platform / Worker Engineer | `services/worker` | Celery, Redis, PyMuPDF, Python |
| **Dev D** | ML Engineer | `services/ml` | sentence-transformers, Qdrant, LightGBM, FastAPI (thin) |

---

### Dev A — Frontend Engineer

**Owns:** `apps/web/`

**Responsibilities:**

- Scaffold Next.js App Router project with Tailwind CSS.
- Implement all UI pages and components.
- Consume API via typed fetch hooks generated from `packages/contracts/types/shared.ts`.
- Mock API responses with MSW (Mock Service Worker) so frontend development never blocks on backend.
- Handle auth state (JWT access token in memory, refresh via httpOnly cookie).
- Implement interaction logging (view / save / apply / dismiss / shortlist / reject) on every recommendation card.

**Pages & Components to Build:**

```
/app
  /(auth)
    /login                    → LoginForm component
    /signup                   → SignupForm (role selector: student / recruiter)
  /(student)
    /dashboard                → CareerReadinessScore + RecommendationFeed
    /recommendations          → RecommendationCard (match breakdown, narrative, actions)
    /profile                  → ProfileForm + ResumeUploader + SkillTags
    /applications             → ApplicationTracker (status timeline)
    /roadmap                  → SkillGapRoadmap + ResourceLinks
  /(recruiter)
    /dashboard                → PostingsList + CandidateAlertBanner
    /postings/new             → InternshipForm
    /postings/[id]/candidates → CandidateShortlistView (quality score cards)
    /postings/[id]/pipeline   → ApplicationPipelineView
  /(admin)
    /skills                   → PendingSkillAliasQueue
    /health                   → RecsysHealthDashboard
```

**Key Components:**

```
RecommendationCard
  ├── MatchScoreBar (Skill % | Domain % | Education %)
  ├── MatchNarrative (LLM text)
  ├── SkillChips (matched + missing)
  └── ActionRow (Save | Apply | Dismiss)

CandidateCard
  ├── CandidateQualityScore (composite %)
  ├── MatchBreakdown (Skill | Domain | Education | Experience)
  ├── WhyMatchedNarrative
  └── ActionRow (Shortlist | Reject)

CareerReadinessScore
  ├── CircularProgress (score %)
  ├── StrengthsList
  └── MissingSkillsList → links to SkillGapRoadmap
```

**Dev A must NOT:**
- Write SQL migrations or DB models.
- Call Qdrant or Redis directly.
- Define new API routes (open a PR on `contracts/openapi.yaml` and discuss with Dev B first).

---

### Dev B — Backend Engineer

**Owns:** `apps/api/` and `packages/contracts/`

**Responsibilities:**

- Define and maintain the **source-of-truth contracts** (`openapi.yaml`, `db_schema.sql`, `shared.py`).
- Implement all FastAPI routes, auth, CRUD, and recsys orchestration.
- Write all SQLAlchemy models and Alembic migrations.
- Integrate with the ML service (`services/ml`) via HTTP.
- Emit `interaction_events` to Redis queue for the worker.
- Enforce RBAC, rate limiting (`slowapi`), and input validation (Pydantic v2).

**API Modules to Build:**

```
apps/api/
  ├── main.py                       → FastAPI app factory, middleware, routers
  ├── auth/
  │   ├── router.py                 → POST /auth/signup, /auth/login, /auth/refresh
  │   └── service.py                → JWT issue/verify, Argon2 hash
  ├── students/
  │   ├── router.py                 → GET/PUT /students/me, POST /students/resume
  │   └── service.py
  ├── internships/
  │   ├── router.py                 → GET /internships, POST/PUT/DELETE /internships/{id}
  │   └── service.py
  ├── recommendations/
  │   ├── router.py                 → GET /recommendations, GET /matches
  │   └── service.py                → orchestrate ML call + cache read/write
  ├── interactions/
  │   ├── router.py                 → POST /interactions (log events)
  │   └── service.py                → enqueue to Redis
  ├── applications/
  │   ├── router.py                 → POST /apply, GET /applications
  │   └── service.py
  ├── db/
  │   ├── models.py                 → SQLAlchemy ORM models
  │   ├── session.py                → async session factory
  │   └── migrations/               → Alembic migration files
  └── core/
      ├── config.py                 → settings from env vars
      ├── security.py               → JWT, rate limiting
      └── redis.py                  → Redis client
```

**Dev B must NOT:**
- Write PyMuPDF parsing logic (that belongs to Dev C's worker).
- Write embedding or Qdrant logic (that belongs to Dev D's ML service).
- Merge any PR that breaks `packages/contracts/` without team sign-off.

---

### Dev C — Platform / Worker Engineer

**Owns:** `services/worker/`

**Responsibilities:**

- Set up Celery with Redis as broker and result backend.
- Implement all async task pipelines: resume parsing, skill normalization, embedding trigger, internship ingestion, feedback aggregation, notifications.
- Consume task payloads defined in `packages/contracts/queue_events.py` — never change the schema without notifying Dev B.
- Write the nightly Celery Beat jobs.
- Write the seed script (`infra/seed/`) for skills and sample internships.

**Tasks to Implement:**

```
services/worker/
  ├── celery_app.py                 → Celery factory, Beat schedule
  ├── tasks/
  │   ├── resume/
  │   │   ├── extract_text.py       → PyMuPDF: raw text + layout blocks
  │   │   ├── extract_skills.py     → NER/LLM skill extraction
  │   │   ├── extract_education.py  → degree, institution, year
  │   │   ├── extract_experience.py → roles, durations, domains
  │   │   └── merge_and_embed.py    → normalize → call ML /embed → upsert PG + Qdrant
  │   ├── skills/
  │   │   └── normalize.py          → alias match → fuzzy → embedding NN → pending queue
  │   ├── ingestion/
  │   │   ├── fetch.py              → external source adapter
  │   │   ├── dedupe.py             → hash + fuzzy duplicate detection
  │   │   ├── verify.py             → company check + quality checks
  │   │   └── embed_and_upsert.py   → normalize → embed → upsert
  │   ├── feedback/
  │   │   └── aggregate.py          → nightly: weighted events → retrain signal → POST ml /train
  │   ├── recommendations/
  │   │   └── precompute.py         → nightly: pre-warm cache for active users
  │   └── notify/
  │       └── send.py               → email + in-app notification dispatch
  └── utils/
      └── pymupdf_helpers.py
```

**Celery Beat Schedule:**

```python
CELERYBEAT_SCHEDULE = {
    "nightly-feedback-aggregation":    {"task": "tasks.feedback.aggregate",        "schedule": crontab(hour=2, minute=0)},
    "nightly-precompute-recs":         {"task": "tasks.recommendations.precompute", "schedule": crontab(hour=3, minute=0)},
    "nightly-ingestion-refresh":       {"task": "tasks.ingestion.fetch",           "schedule": crontab(hour=1, minute=0)},
    "nightly-expiry-cleanup":          {"task": "tasks.ingestion.expire_stale",    "schedule": crontab(hour=1, minute=30)},
}
```

**Dev C must NOT:**
- Define API routes (no FastAPI in the worker service).
- Change `packages/contracts/queue_events.py` without Dev B + Dev D sign-off.
- Write frontend code.

---

### Dev D — ML Engineer

**Owns:** `services/ml/`

**Responsibilities:**

- Expose a thin HTTP service (FastAPI) with clean endpoints consumed by the API and worker.
- Load and serve `sentence-transformers` embedding model.
- Run ANN search over Qdrant (`students` and `internships` collections).
- Implement Phase 1 scoring (`vector + skill_overlap + location_match`).
- Implement LLM rerank: generate structured `match_breakdown` + `narrative`.
- Implement Career Readiness Score computation.
- Implement Skill-Gap analysis endpoint.
- Train and hot-load Phase 2 learned ranker when activation gate is met.
- Manage Qdrant collections (create, index, upsert, search).

**ML Service Endpoints:**

```
services/ml/
  ├── main.py                         → FastAPI app
  ├── routers/
  │   ├── embed.py                    → POST /embed
  │   ├── rerank.py                   → POST /rerank
  │   ├── search.py                   → POST /search/internships, POST /search/students
  │   ├── score.py                    → POST /career-readiness, POST /skill-gap
  │   └── train.py                    → POST /train (triggered by worker feedback job)
  ├── core/
  │   ├── embedder.py                 → sentence-transformers model load + encode
  │   ├── qdrant_client.py            → Qdrant connection + collection setup
  │   ├── phase1_scorer.py            → vector + skill_overlap + location_match
  │   ├── phase2_ranker.py            → LightGBM load/predict/hot-reload
  │   ├── llm_reranker.py             → LLM call + narrative generation from match_breakdown
  │   └── career_readiness.py         → score formula + missing skill computation
  └── schemas.py                      → Pydantic request/response models
```

**ML Service Contract (consumed by Dev B and Dev C):**

```
POST /embed
  body:  { text: str, type: "student" | "internship" }
  returns: { vector: float[], model_version: str }

POST /search/internships
  body:  { student_id: str, filters: {location?, domain?, status?}, top_k: int }
  returns: { candidates: [{internship_id, vector_score, skill_overlap, location_match}] }

POST /search/students
  body:  { internship_id: str, filters: {}, top_k: int }
  returns: { candidates: [{student_id, vector_score, skill_overlap, location_match}] }

POST /rerank
  body:  { query_id: str, candidates: [...], phase: 1 | 2 }
  returns: { ranked: [{id, composite_score, match_breakdown, narrative}] }

POST /career-readiness
  body:  { student_id: str, target_role: str }
  returns: { score: float, missing_skill_ids: str[], breakdown: {...} }

POST /skill-gap
  body:  { student_id: str, target_role: str }
  returns: { missing_skills: [{skill_id, name, impact_pct, resources: [...]}], roadmap_order: str[] }

POST /train
  body:  { interaction_summary: [{features, label}] }
  returns: { precision_at_10: float, activated: bool, weights_version: str }
```

**Dev D must NOT:**
- Write database migrations or ORM models.
- Write frontend components.
- Expose Qdrant directly to the API — all vector operations go through `services/ml`.

---

## 3. API Contracts

The contract file `packages/contracts/openapi.yaml` is the **single source of truth** for all API communication. No route is implemented without being defined here first.

### Contract-First Workflow

```
Hour 0–1: Dev B drafts openapi.yaml + shared.py + shared.ts
             ↓
         All 4 devs review and sign off (PR with required 3 approvals)
             ↓
Dev A: generates TS types from openapi.yaml → builds UI against mock responses
Dev B: implements routes — must match contract exactly
Dev C: reads queue_events.py → builds task payloads
Dev D: implements ML endpoints — must match ML service contract exactly
             ↓
Hour N: docker-compose up → real integration replaces mocks
```

### Core API Routes (openapi.yaml coverage)

```yaml
# Auth
POST   /auth/signup                    → { access_token, refresh_token, user }
POST   /auth/login                     → { access_token, refresh_token, user }
POST   /auth/refresh                   → { access_token }

# Student
GET    /students/me                    → StudentProfile
PUT    /students/me                    → StudentProfile
POST   /students/resume                → { task_id }        # async, returns job ID
GET    /students/me/readiness          → CareerReadinessScore
GET    /students/me/roadmap            → SkillGapRoadmap

# Internships
GET    /internships                    → PaginatedList<Internship>  # cursor pagination
POST   /internships                    → Internship                 # recruiter only
PUT    /internships/{id}               → Internship                 # recruiter only
DELETE /internships/{id}               → 204                        # recruiter only
POST   /internships/import             → { task_id }                # CSV bulk import

# Recommendations (student side)
GET    /recommendations                → PaginatedList<Recommendation>

# Candidate Matching (recruiter side)
GET    /matches?internship_id={id}     → PaginatedList<CandidateRecommendation>

# Interactions
POST   /interactions                   → 201
  body: { internship_id, event_type: "view"|"save"|"apply"|"dismiss"|"shortlist"|"reject" }

# Applications
POST   /applications                   → Application
GET    /applications                   → PaginatedList<Application>   # student view
GET    /internships/{id}/applications  → PaginatedList<Application>   # recruiter view
PUT    /applications/{id}/status       → Application                  # recruiter only

# Admin
GET    /admin/skills/pending           → PaginatedList<PendingSkillAlias>
PUT    /admin/skills/{id}/approve      → Skill
GET    /admin/health                   → RecsysHealthMetrics
```

### Shared Type Definitions (`packages/contracts/shared.py`)

```python
# packages/contracts/shared.py
from pydantic import BaseModel, UUID4
from typing import List, Optional, Literal
from datetime import datetime

class MatchBreakdown(BaseModel):
    skill_match: float          # 0.0 – 1.0
    domain_match: float
    education_match: float
    experience_match: float
    composite_score: float
    matched_skills: List[str]   # canonical names
    missing_skills: List[str]
    narrative: str

class Recommendation(BaseModel):
    id: UUID4
    internship_id: UUID4
    internship_title: str
    company_name: str
    match_breakdown: MatchBreakdown
    ai_reranked: bool
    weights_version: str
    created_at: datetime

class CandidateRecommendation(BaseModel):
    id: UUID4
    student_id: UUID4
    student_name: str
    match_breakdown: MatchBreakdown
    created_at: datetime

class CareerReadinessScore(BaseModel):
    target_role: str
    score: float                # 0.0 – 1.0
    strong_skills: List[str]
    missing_skills: List[str]
    computed_at: datetime

class InteractionEventPayload(BaseModel):
    user_id: UUID4
    internship_id: UUID4
    event_type: Literal["view", "save", "apply", "dismiss", "shortlist", "reject"]
    timestamp: datetime
    weight: int                 # assigned server-side
```

### Celery Queue Event Shapes (`packages/contracts/queue_events.py`)

```python
# packages/contracts/queue_events.py
# Dev C consumes these. Dev B emits these. Do not change without sign-off from both.

RESUME_PARSE_TASK    = "worker.tasks.resume.extract_text"
SKILL_NORMALIZE_TASK = "worker.tasks.skills.normalize"
EMBED_STUDENT_TASK   = "worker.tasks.resume.merge_and_embed"
INGEST_TASK          = "worker.tasks.ingestion.fetch"
FEEDBACK_AGG_TASK    = "worker.tasks.feedback.aggregate"
NOTIFY_TASK          = "worker.tasks.notify.send"

class ResumeParsedPayload(BaseModel):
    student_id: UUID4
    resume_s3_key: str

class SkillNormalizePayload(BaseModel):
    entity_id: UUID4
    entity_type: Literal["student", "internship"]
    raw_skills: List[str]

class NotifyPayload(BaseModel):
    user_id: UUID4
    notification_type: Literal["status_change", "new_match", "expiry_alert"]
    payload: dict
```

---

## 4. Database Schema

**Owner:** Dev B writes and runs all Alembic migrations.
**All devs read** `packages/contracts/db_schema.sql` — it is the single source of truth for the relational schema.

```sql
-- ============================================================
-- packages/contracts/db_schema.sql
-- Source of truth. Dev B runs migrations via Alembic.
-- All devs reference this file. Do not run raw SQL in prod.
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";       -- fuzzy skill alias search


-- ── USERS & AUTH ─────────────────────────────────────────────
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email           TEXT NOT NULL UNIQUE,
    password_hash   TEXT NOT NULL,
    role            TEXT NOT NULL CHECK (role IN ('student', 'recruiter', 'admin')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX idx_users_email ON users(email);


-- ── SKILL TAXONOMY ───────────────────────────────────────────
CREATE TABLE skills (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    canonical_name  TEXT NOT NULL UNIQUE,
    category        TEXT,                               -- e.g. "backend", "ml", "devops"
    status          TEXT NOT NULL DEFAULT 'active'      -- 'active' | 'pending' | 'deprecated'
    -- NOTE: embeddings live in Qdrant, not here
);

CREATE TABLE skill_aliases (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    skill_id        UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    alias           TEXT NOT NULL UNIQUE
);
CREATE INDEX idx_skill_aliases_alias_trgm ON skill_aliases USING GIN (alias gin_trgm_ops);

CREATE TABLE skill_resources (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    skill_id        UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    resource_type   TEXT NOT NULL CHECK (resource_type IN ('course', 'doc', 'project', 'video')),
    title           TEXT NOT NULL,
    url             TEXT NOT NULL,
    estimated_hours NUMERIC(5,1)
);


-- ── COMPANIES ────────────────────────────────────────────────
CREATE TABLE companies (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            TEXT NOT NULL,
    domain          TEXT,
    verified        BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ── STUDENT PROFILES ─────────────────────────────────────────
CREATE TABLE student_profiles (
    user_id                 UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    full_name               TEXT,
    headline                TEXT,
    location                TEXT,
    target_role             TEXT,
    declared_skill_ids      UUID[] NOT NULL DEFAULT '{}',
    normalized_skill_ids    UUID[] NOT NULL DEFAULT '{}',   -- post-normalization
    education               JSONB,   -- [{degree, institution, year}]
    experience              JSONB,   -- [{role, company, domain, months}]
    resume_s3_key           TEXT,
    embedding_model_version TEXT,
    profile_version         INT NOT NULL DEFAULT 0,         -- bump on any change
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_student_skills_gin ON student_profiles USING GIN (normalized_skill_ids);


-- ── CAREER READINESS ─────────────────────────────────────────
CREATE TABLE career_readiness_scores (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id      UUID NOT NULL REFERENCES student_profiles(user_id) ON DELETE CASCADE,
    target_role     TEXT NOT NULL,
    score           NUMERIC(4,3) NOT NULL,                  -- 0.000 – 1.000
    missing_skill_ids UUID[] NOT NULL DEFAULT '{}',
    breakdown       JSONB NOT NULL,                         -- {skill_pct, exp_pct, edu_pct}
    computed_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(student_id, target_role)
);
CREATE INDEX idx_readiness_student ON career_readiness_scores(student_id);

CREATE TABLE career_roadmaps (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id          UUID NOT NULL REFERENCES student_profiles(user_id) ON DELETE CASCADE,
    target_role         TEXT NOT NULL,
    ordered_skill_ids   UUID[] NOT NULL DEFAULT '{}',
    generated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(student_id, target_role)
);


-- ── INTERNSHIPS ──────────────────────────────────────────────
CREATE TABLE internships (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id              UUID NOT NULL REFERENCES companies(id),
    recruiter_id            UUID NOT NULL REFERENCES users(id),
    title                   TEXT NOT NULL,
    description             TEXT NOT NULL,
    normalized_skill_ids    UUID[] NOT NULL DEFAULT '{}',
    location                TEXT,
    remote_ok               BOOLEAN NOT NULL DEFAULT FALSE,
    domain                  TEXT,
    duration_weeks          INT,
    deadline                DATE,
    status                  TEXT NOT NULL DEFAULT 'active'
                                CHECK (status IN ('draft','active','expired','archived')),
    source                  TEXT NOT NULL DEFAULT 'manual',  -- 'manual'|'csv'|'external'
    source_url              TEXT,
    source_hash             TEXT UNIQUE,                     -- dedupe key
    embedding_model_version TEXT,
    last_verified_at        TIMESTAMPTZ,
    expires_at              TIMESTAMPTZ,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_internships_status_created ON internships(status, created_at DESC);
CREATE INDEX idx_internships_skills_gin     ON internships USING GIN (normalized_skill_ids);
CREATE INDEX idx_internships_expires        ON internships(expires_at);
CREATE INDEX idx_internships_source_hash    ON internships(source_hash);


-- ── APPLICATIONS & BOOKMARKS ─────────────────────────────────
CREATE TABLE applications (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id      UUID NOT NULL REFERENCES student_profiles(user_id),
    internship_id   UUID NOT NULL REFERENCES internships(id),
    status          TEXT NOT NULL DEFAULT 'applied'
                        CHECK (status IN ('applied','under_review','shortlisted','rejected')),
    applied_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(student_id, internship_id)
);
CREATE INDEX idx_applications_student    ON applications(student_id);
CREATE INDEX idx_applications_internship ON applications(internship_id);

CREATE TABLE bookmarks (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id      UUID NOT NULL REFERENCES student_profiles(user_id),
    internship_id   UUID NOT NULL REFERENCES internships(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(student_id, internship_id)
);


-- ── RECOMMENDATIONS ──────────────────────────────────────────
CREATE TABLE recommendations (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id      UUID NOT NULL REFERENCES student_profiles(user_id),
    internship_id   UUID NOT NULL REFERENCES internships(id),
    composite_score NUMERIC(4,3) NOT NULL,
    match_breakdown JSONB NOT NULL,      -- MatchBreakdown schema
    ai_reranked     BOOLEAN NOT NULL DEFAULT FALSE,
    weights_version TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(student_id, internship_id)
);
CREATE INDEX idx_recs_student_score ON recommendations(student_id, composite_score DESC);

CREATE TABLE candidate_recommendations (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recruiter_id    UUID NOT NULL REFERENCES users(id),
    internship_id   UUID NOT NULL REFERENCES internships(id),
    student_id      UUID NOT NULL REFERENCES student_profiles(user_id),
    composite_score NUMERIC(4,3) NOT NULL,
    match_breakdown JSONB NOT NULL,      -- MatchBreakdown schema (candidate perspective)
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(internship_id, student_id)
);
CREATE INDEX idx_candrecs_internship_score ON candidate_recommendations(internship_id, composite_score DESC);


-- ── INTERACTION EVENTS (append-only) ─────────────────────────
CREATE TABLE interaction_events (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id),
    internship_id   UUID NOT NULL REFERENCES internships(id),
    event_type      TEXT NOT NULL
                        CHECK (event_type IN ('view','save','apply','dismiss','shortlist','reject')),
    weight          INT  NOT NULL,      -- assigned at ingestion: apply=5, save=3, view=1, etc.
    timestamp       TIMESTAMPTZ NOT NULL DEFAULT NOW()
    -- no UPDATE, no DELETE — append only
);
CREATE INDEX idx_events_user_internship ON interaction_events(user_id, internship_id, event_type, timestamp);
CREATE INDEX idx_events_timestamp       ON interaction_events(timestamp);
-- Partition by month as volume grows:
-- PARTITION BY RANGE (timestamp)


-- ── RANKING WEIGHTS (versioned) ───────────────────────────────
CREATE TABLE ranking_weights (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    version         TEXT NOT NULL UNIQUE,        -- e.g. "phase1-v1", "phase2-v1"
    phase           INT  NOT NULL CHECK (phase IN (1, 2)),
    weights         JSONB NOT NULL,              -- {alpha, beta, gamma, delta, ...}
    precision_at_10 NUMERIC(4,3),
    activated_at    TIMESTAMPTZ,
    is_active       BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Qdrant Collections (Dev D owns — not in Postgres)

```
Collection: "students"
  Vector size:  768 (bge-base) or 1024 (e5-large)
  Distance:     Cosine
  Payload fields (indexed):
    - student_id:               keyword
    - normalized_skill_ids:     keyword[]
    - location:                 keyword
    - target_role:              keyword
    - embedding_model_version:  keyword
    - profile_version:          integer

Collection: "internships"
  Vector size:  768 / 1024 (same model)
  Distance:     Cosine
  Payload fields (indexed):
    - internship_id:            keyword
    - normalized_skill_ids:     keyword[]
    - location:                 keyword
    - domain:                   keyword
    - status:                   keyword   ← always filter status = "active"
    - embedding_model_version:  keyword
```

---

## 5. Branching Strategy

### Branch Model: **GitHub Flow** (simplified, fast, hackathon-safe)

```
main  ←─────────────────────────────────────── protected, always deployable
  │
  ├── dev/a/auth-pages                ← Dev A working branch
  ├── dev/a/recommendation-ui
  ├── dev/b/auth-api                  ← Dev B working branch
  ├── dev/b/recommendations-route
  ├── dev/c/resume-parse-worker       ← Dev C working branch
  ├── dev/c/feedback-aggregation
  ├── dev/d/embed-service             ← Dev D working branch
  └── dev/d/rerank-endpoint
```

### Branch Naming Convention

```
dev/{initial}/{short-feature-slug}

Examples:
  dev/a/student-dashboard
  dev/b/internship-crud
  dev/c/ingestion-pipeline
  dev/d/qdrant-collections
  fix/b/refresh-token-reuse
  chore/infra/docker-compose-qdrant
```

### Commit Message Convention (enforced by CI lint)

```
type(scope): short description

Types:  feat | fix | chore | docs | test | refactor
Scope:  web | api | worker | ml | contracts | infra

Examples:
  feat(api): add POST /recommendations route
  fix(worker): handle PyMuPDF extraction timeout
  chore(infra): add qdrant service to docker-compose
  feat(contracts): add CandidateRecommendation pydantic model
  docs: update TEAM.md branching section
```

### Pull Request Rules

```
┌─────────────────────────────────────────────────────────┐
│                   PR Checklist                          │
│                                                         │
│  □ Branch is dev/{initial}/{slug}                       │
│  □ PR title follows commit convention                   │
│  □ Description explains what + why (not how)           │
│  □ Linked to a task in TASKS.md                         │
│  □ CI passes (lint + tests)                             │
│  □ No changes outside your owned directory*             │
│  □ contracts/ changes: needs 3/4 approvals              │
│  □ Other changes: needs 1 approval from a peer         │
│  □ No merge conflicts with main                         │
└─────────────────────────────────────────────────────────┘

* Exception: infra/docker-compose.yml changes need
  approval from the dev whose service is being modified.
```

### Merge Strategy

- **Squash and merge** into `main` — keeps history clean; one commit per feature.
- Delete branch after merge.
- `main` deploys automatically to staging via GitHub Actions.
- DO NOT MERGE INDIVIDUALLY PLEASE MERGE AFTER NOTIFYING

### Conflict-Free Zone Rules

| File / Directory | Owner | Who Can PR Changes |
|---|---|---|
| `apps/web/**` | Dev A | Dev A only |
| `apps/api/**` | Dev B | Dev B only |
| `services/worker/**` | Dev C | Dev C only |
| `services/ml/**` | Dev D | Dev D only |
| `packages/contracts/**` | Dev B | Any dev, needs 3/4 approvals |
| `infra/docker-compose.yml` | Shared | Any dev, needs approval from affected dev |
| `docs/**` | Shared | Any dev, 1 approval |
| `.github/workflows/**` | Shared | Any dev, 1 approval |

---
## OPTIONAL TIME

## 6. Hour-by-Hour Collaboration Plan

### Hour 0–1 — Foundation Sprint (ALL HANDS)

Everyone together. This unlocks parallel work for the rest of the hackathon.

```
All 4 devs:
  □ Create GitHub repo, add all members, protect main branch
  □ Set up monorepo folder structure
  □ Draft + agree packages/contracts/openapi.yaml (all routes)
  □ Draft + agree packages/contracts/db_schema.sql
  □ Draft + agree packages/contracts/queue_events.py
  □ Draft + agree services/ml contract (POST /embed, /rerank, /search/*, /career-readiness)
  □ Draft + agree Qdrant collection specs
  □ Merge contracts PR with all 4 approvals → everyone branches off this commit
```

**Output of Hour 1:** Every dev knows exactly what to build and what they'll receive from others.

---

### Hours 2–6 — Parallel Build (each dev in own directory)

**Dev A — Web**
```
Hour 2: Scaffold Next.js + Tailwind + MSW mocks for all API routes
Hour 3: Auth pages (login, signup with role selector)
Hour 4: Student dashboard (Career Readiness Score + Recommendation Feed — mocked data)
Hour 5: RecommendationCard with MatchBreakdown visual + action buttons
Hour 6: Recruiter dashboard (CandidateCard with QualityScore + shortlist/reject actions)
```

**Dev B — API**
```
Hour 2: FastAPI scaffold + SQLAlchemy models from db_schema.sql + Alembic init migration
Hour 3: Auth routes (signup, login, refresh) + JWT + Argon2 + RBAC middleware
Hour 4: Student profile routes + internship CRUD routes + rate limiting
Hour 5: Recommendations route (stub ML call, return cached/mock) + interactions route
Hour 6: Applications routes + recruiter match route (stub ML call)
```

**Dev C — Worker**
```
Hour 2: Celery app setup + Redis connection + Beat schedule scaffold
Hour 3: Resume parse tasks — extract_text (PyMuPDF) + fan-out to skill/edu/exp
Hour 4: Skill normalization task (alias → fuzzy → embedding NN)
Hour 5: Internship ingestion task (fetch → dedupe → verify → normalize)
Hour 6: Feedback aggregation task (nightly weighted signal rollup)
```

**Dev D — ML**
```
Hour 2: FastAPI ML service scaffold + Qdrant collection creation + health check
Hour 3: POST /embed (sentence-transformers load + encode)
Hour 4: POST /search/internships + /search/students (Qdrant ANN + Phase 1 score)
Hour 5: POST /rerank (Phase 1 blend + LLM narrative from match_breakdown)
Hour 6: POST /career-readiness + POST /skill-gap
```

---

### Hours 7–8 — Integration Sprint

```
All devs:
  □ docker-compose up — all containers running
  □ Dev B wires real ML calls into recommendations/matches routes (replace stubs)
  □ Dev A swaps MSW mocks for real API calls (change base URL)
  □ Dev C wires embed calls to Dev D's /embed endpoint
  □ Dev D confirms Qdrant has seed data (infra/seed/ loaded by Dev C)
  □ End-to-end smoke test: signup → upload resume → get recommendations → apply
  □ Recruiter smoke test: post internship → view candidate list → shortlist
```

---

### Hour 9 — Polish & Demo Prep

```
Dev A: UI polish, loading states, error states, mobile responsiveness
Dev B: seed realistic data via infra/seed/, tune rate limits
Dev C: run resume parse end-to-end on a real PDF, confirm Qdrant upsert
Dev D: confirm Career Readiness Score rendering correctly in Dev A's UI
All:   rehearse demo flow, fix critical bugs only
```

---

## 7. Merge Conflict Prevention Rules

These rules exist so four people in one repo never block each other.

**Rule 1 — Contract freeze after Hour 1**
`packages/contracts/` is frozen after the initial PR merges. Any change requires a team discussion, a new PR, and 3/4 approvals. No sneaky changes.

**Rule 2 — Never touch another dev's directory**
If you need something from another service, open a GitHub Issue or DM. Do not make the change yourself.

**Rule 3 — Rebase before PR, not merge**
Before opening a PR: `git fetch origin && git rebase origin/main`. This keeps history linear and avoids merge commits.

**Rule 4 — docker-compose.yml is append-only**
Each dev adds their own service block. Do not modify another dev's service block without their approval.

**Rule 5 — Shared utilities go in contracts, not inline**
If two devs need the same helper (e.g. skill weight map, event type enum), it goes in `packages/contracts/` — not duplicated in two services.

**Rule 6 — Short-lived branches**
No branch lives more than 4 hours without a PR. Small, frequent PRs over large batched ones. If a feature is too big, split it into sequential PRs.

---

## 8. GitHub Setup Checklist

```
Repository Settings:
  □ Repo name: internship-engine
  □ Visibility: Private/public (add all 4 members as Collaborators)
  □ Default branch: main

Branch Protection (main):
  □ Require pull request before merging
  □ Require at least 1 approval (3 for contracts/ changes — enforced by CODEOWNERS)
  □ Require status checks to pass (CI workflows)
  □ Do not allow bypassing above settings
  □ Restrict who can push: no direct pushes to main

CODEOWNERS file (.github/CODEOWNERS):
  apps/web/             @dev-a
  apps/api/             @dev-b
  services/worker/      @dev-c
  services/ml/          @dev-d
  packages/contracts/   @dev-a @dev-b @dev-c @dev-d   ← all 4 required

GitHub Actions (CI per service):
  □ .github/workflows/ci-web.yml     → lint + type-check + build (Node)
  □ .github/workflows/ci-api.yml     → ruff lint + pytest (Python)
  □ .github/workflows/ci-worker.yml  → ruff lint + pytest (Python)
  □ .github/workflows/ci-ml.yml      → ruff lint + pytest (Python)
  Each workflow triggers only on changes to its own directory (paths filter).

Secrets (GitHub → Settings → Secrets):
  □ OPENAI_API_KEY (or OLLAMA_HOST for local)
  □ DATABASE_URL
  □ REDIS_URL
  □ QDRANT_URL
  □ JWT_SECRET
  □ S3_BUCKET / R2_BUCKET + credentials
  Never commit .env files — only .env.example with placeholder values.

Labels (for Issues and PRs):
  web | api | worker | ml | contracts | infra | bug | blocked | review-needed
```

---

*This document is the team's operating agreement. When in doubt, refer here before asking in chat.*

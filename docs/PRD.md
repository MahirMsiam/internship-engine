# Product Requirements Document
## AI-Based Internship Recommendation Engine

**Version:** 13.0   
**Stakeholders:** Product, Engineering (Dev A–D), ML, Design

---

## Table of Contents

1. [Problem & Goal](#1-problem--goal)
2. [Competitive Advantage](#2-competitive-advantage)
3. [Personas](#3-personas)
4. [User Journey Diagrams](#4-user-journey-diagrams)
5. [User Stories](#5-user-stories)
6. [Success Metrics](#6-success-metrics)
7. [Functional Requirements](#7-functional-requirements)
8. [AI & Recommendation System Requirements](#8-ai--recommendation-system-requirements)
9. [Non-Functional Requirements](#9-non-functional-requirements)
10. [Scope](#10-scope)
11. [Out of Scope](#11-out-of-scope)
12. [System Architecture Overview](#12-system-architecture-overview)
13. [Data Model Summary](#13-data-model-summary)
14. [Dependencies & Risks](#14-dependencies--risks)

---

## 1. Problem & Goal

### Problem Statement

Students seeking internships are overwhelmed by irrelevant listings, while recruiters waste significant time sifting through unqualified applicants. Existing platforms rely on keyword search and manual filtering — they surface popularity, not fit. Neither side benefits from a system that learns and improves over time.

**For students:** hours wasted on mismatched applications; no feedback on why they were rejected; no roadmap for closing skill gaps.

**For recruiters:** reviewing 200+ resumes to find 5 good candidates; no ranked signal for who is actually qualified; losing top candidates to slower review processes.

### Goal

Build a **two-sided AI-powered internship recommendation engine** that:

- Matches students to the most relevant internships based on skills, education, experience, and behavioral signals.
- Matches recruiters to the strongest candidate profiles for their open roles via reverse vector search.
- Provides a **Career Readiness Score** and skill-gap roadmap for every student.
- Provides recruiters with an **AI-generated shortlist** with candidate quality scores — eliminating manual resume screening.
- Continuously improves ranking quality through a **phased learning strategy** that works from Day 1 and deepens as interaction data accumulates.
- Delivers **structured, explainable matches** — every recommendation is grounded in quantified signals, not black-box output.

### Core Value Proposition

> *For students: know your fit, close your gaps, find the right role fast.*
> *For recruiters: your top 10 candidates, ranked and explained, before your first coffee.*

---

## 2. Competitive Advantage

### Why This Is Different

| Capability | LinkedIn / Indeed | Generic Job Boards | This Platform |
|---|---|---|---|
| Ranking method | Keyword match + recency | Manual filters | Semantic vector similarity + learned ranking |
| Recruiter matching | Manual search | None | Reverse vector search → AI-ranked candidate list |
| Explainability | None | None | Structured scores (Skill / Domain / Education %) + LLM narrative |
| Learning from behavior | None | None | Phased: rule-based → semantic → learned-to-rank |
| Career intelligence | Basic job alerts | None | Career Readiness Score + skill-gap roadmap |
| Resume understanding | Keyword parse | None | Staged PyMuPDF extraction + NER + taxonomy normalization |
| Two-sided feedback | None | None | Student + recruiter signals feed a shared ranking improvement loop |

### Sustainable Moat

The platform's defensibility compounds over time:

- **More interactions → better learned ranker → better recommendations → more interactions.**
- **Skill taxonomy** becomes a proprietary normalized dictionary that makes matching more precise than any keyword system.
- **Career Readiness Scores** create student stickiness — students return to track improvement.
- **Recruiter shortlist quality** improves with each shortlist/reject signal, making the recruiter tool indispensable.

---

## 3. Personas

### Persona 1 — The Student

**Name:** Arif, 3rd-year CS undergraduate  
**Goals:** Find a relevant software engineering or data internship; understand why it's a fit; know what skills to build next.  
**Frustrations:** Generic listings; no signal on readiness; wastes time applying to poor fits; rejected with no feedback.  
**Behaviors:** Uploads resume → sees Career Readiness Score → browses AI recommendations → saves interesting roles → applies → dismisses irrelevant ones → checks skill-gap roadmap.

**Key outcome:** Arif applies to 5 highly relevant roles instead of blasting 50 generic applications.

---

### Persona 2 — The Recruiter

**Name:** Nadia, Talent Acquisition at a mid-size tech company  
**Goals:** Post internship openings; receive a pre-ranked, pre-explained candidate shortlist; move top candidates to interview within 48 hours.  
**Frustrations:** 200+ applicants, only 5 are qualified; no ranked signal; manually reading resumes burns hours; losing great candidates to companies with faster pipelines.  
**Behaviors:** Posts internship → immediately sees AI-generated top-candidate list with Candidate Quality Scores → shortlists / rejects with one click → tracks pipeline per posting.

**Key outcome:** Nadia cuts candidate review time from 6 hours to 30 minutes per posting. Her shortlist quality improves with every signal she sends.

**Recruiter-specific value delivered by the platform:**

| Outcome | How |
|---|---|
| **Time saved reviewing candidates** | AI pre-ranks top 10 candidates with structured match explanations; recruiter skips unranked resume reading |
| **Candidate Quality Score** | Each candidate receives a composite score: Skill Match % + Domain Match % + Education Match % + Experience Relevance % |
| **AI-powered shortlist generation** | One-click "Generate Shortlist" creates a ranked slate of top-N candidates per posting |
| **Top candidate recommendations** | Reverse vector search over the `students` Qdrant collection surfaces candidates the recruiter didn't know to look for |
| **Explainable rankings** | Every candidate card shows structured breakdown, not just a score — recruiter understands *why* a candidate ranks high |
| **Improving over time** | Shortlist/reject signals feed back into candidate ranking; each posting's results get smarter |

---

### Persona 3 — The Admin

**Name:** Platform Admin  
**Goals:** Maintain data quality; moderate listings; monitor recommendation health; manage skill taxonomy.  
**Behaviors:** Reviews pending skill aliases; moderates flagged listings; monitors feedback-loop health dashboards; tracks ingestion pipeline freshness; manages user accounts.

---

## 4. User Journey Diagrams

### Student Journey

```
[Sign Up]
    │
    ▼
[Upload Resume (PDF/DOCX)]
    │
    ▼
[Async Parse Pipeline]
PyMuPDF → Skill/Education/Experience Extraction → Taxonomy Normalization → Embedding
    │
    ▼
[Career Readiness Score Generated]
"Software Engineer Readiness: 82%"
    │
    ├──────────────────────────────────────┐
    ▼                                      ▼
[Browse AI Recommendations]         [View Skill-Gap Roadmap]
"Top matches for you, ranked"        Missing: Docker, AWS, CI/CD
Explanation: Skill 72% | Domain 20%  → Recommended resources
    │
    ▼
[Interact with Recommendation]
    ├── View → logs +1 signal
    ├── Save → logs +3 signal
    ├── Apply → logs +5 signal
    └── Dismiss → logs -1 signal
    │
    ▼
[Application Tracker]
Track status: Applied → Under Review → Shortlisted / Rejected
    │
    ▼
[Recommendations Improve]
Next session: ranked list updated based on past behavior
```

---

### Recruiter Journey

```
[Sign Up / Company Profile]
    │
    ▼
[Post Internship]
Title + Description + Required Skills + Domain + Location + Deadline
    │                              OR
    └──────────────────────► [Bulk CSV Import]
    │
    ▼
[Internship Processed Async]
Skill Normalize → Embed → Upsert to Qdrant internships collection
    │
    ▼
[AI Candidate Shortlist Generated]
Reverse search: internship vector → students collection → top-K ranked
    │
    ▼
[Recruiter Reviews Candidate Cards]
Each card shows:
  • Candidate Quality Score: 87%
  • Skill Match: 65% | Domain: 20% | Education: 15%
  • "Why matched" narrative (LLM-generated from structured scores)
    │
    ▼
[Recruiter Actions]
    ├── Shortlist → logs +5 signal → improves future rankings
    └── Reject → logs -1 signal → improves future rankings
    │
    ▼
[Application Pipeline View]
Track all applicants per posting by status
    │
    ▼
[Rankings Improve Over Time]
Each shortlist/reject signal sharpens next candidate slate
```

---

## 5. User Stories

### Student Stories

| ID | Story | Priority |
|----|-------|----------|
| S1 | As a student, I can sign up and create a profile with my skills, education, and experience so the system can match me to relevant internships. | P0 |
| S2 | As a student, I can upload my resume (PDF/DOCX) and have it automatically parsed so I don't have to fill in every field manually. | P0 |
| S3 | As a student, I receive a personalized ranked list of internship recommendations with a structured match explanation (Skill %, Domain %, Education %). | P0 |
| S4 | As a student, I can view, save, apply to, or dismiss an internship — and my actions improve future recommendations. | P0 |
| S5 | As a student, I can see my **Career Readiness Score** (e.g. "Software Engineer Readiness: 82%") immediately after profile creation. | P0 |
| S6 | As a student, I can view a **Skill-Gap Roadmap** showing exactly which skills I'm missing for my target roles, with recommended resources. | P1 |
| S7 | As a student, I can search and filter internships by domain, location, and skill. | P1 |
| S8 | As a student, I can see my application status and bookmarked listings in one place. | P1 |
| S9 | As a student, my Career Readiness Score updates when I add new skills or complete milestones on my roadmap. | P2 |

### Recruiter Stories

| ID | Story | Priority |
|----|-------|----------|
| R1 | As a recruiter, I can sign up, create a company profile, and post internship openings with required skills, domain, and location. | P0 |
| R2 | As a recruiter, I receive an **AI-generated, pre-ranked candidate shortlist** for each posting immediately after it is processed. | P0 |
| R3 | As a recruiter, each candidate card shows a **Candidate Quality Score** with a structured breakdown (Skill Match %, Domain Match %, Education Match %) and a one-paragraph "why matched" explanation. | P0 |
| R4 | As a recruiter, I can shortlist or reject candidates with one click, and my actions improve future candidate rankings for this and similar postings. | P0 |
| R5 | As a recruiter, I can import multiple internship listings via CSV bulk upload. | P1 |
| R6 | As a recruiter, I can view the full application pipeline per posting, with applicants sorted by AI match score. | P1 |
| R7 | As a recruiter, I can see a time-saved estimate per posting (e.g. "AI pre-screened 143 applicants in 2 min"). | P2 |

### Admin Stories

| ID | Story | Priority |
|----|-------|----------|
| A1 | As an admin, I can review and approve pending skill aliases added by the normalization pipeline. | P1 |
| A2 | As an admin, I can view platform health metrics: recommendation precision, feedback loop lift, embedding pipeline status, ingestion freshness. | P1 |
| A3 | As an admin, I can moderate flagged internship listings and suspend user accounts. | P1 |
| A4 | As an admin, I can view and trigger expired internship cleanup and data freshness checks on the ingestion pipeline. | P1 |

---

## 6. Success Metrics

### Student-Side KPIs

| Metric | Definition | Target (Launch) |
|--------|-----------|-----------------|
| **Career Readiness Score Coverage** | % of students who have a score generated within 5 min of profile creation | ≥ 95% |
| **Precision@10 (Student)** | Fraction of top-10 recommended internships the student engages with (save/apply) | ≥ 0.40 |
| **Application Conversion Rate** | % of viewed recommendations that result in an application | ≥ 8% |
| **Skill-Gap Roadmap Engagement** | % of students who click at least one resource from their roadmap | ≥ 30% |
| **Resume Parse Success Rate** | % of uploads with structured skills/education/experience extracted | ≥ 85% |
| **Skill Normalization Coverage** | % of raw skill strings mapped to canonical taxonomy | ≥ 90% |

### Recruiter-Side KPIs

| Metric | Definition | Target (Launch) |
|--------|-----------|-----------------|
| **Precision@10 (Recruiter)** | Fraction of top-10 matched candidates the recruiter shortlists | ≥ 0.35 |
| **Time-to-First-Shortlist** | Time from posting creation to recruiter making first shortlist action | < 10 minutes |
| **Candidate Review Time Saved** | Estimated hours saved vs. manual review (surfaced in recruiter dashboard) | ≥ 70% reduction |
| **Shortlist Acceptance Rate** | % of AI-suggested candidates recruiter shortlists (not rejects) | ≥ 40% |
| **Recruiter Return Rate** | % of recruiters who post a second internship within 30 days | ≥ 50% |

### Platform KPIs

| Metric | Definition | Target |
|--------|-----------|--------|
| **Time-to-Recommendation** | GET /recommendations latency (cache hit) | < 1 second |
| **Phase 1 Ranking Baseline** | Precision@10 with rule-based ranker (no learned weights) | Establish baseline Day 1 |
| **Phase 2 Lift** | Precision@10 improvement when learned ranker activates (≥500 interactions) | ≥ +10% relative |
| **AI Rerank Success Rate** | % of requests served with LLM reranking vs. fallback | ≥ 80% |
| **Recommendation Cache Hit Rate** | % of recommendation requests served from Redis cache | ≥ 70% |

### Anti-Metrics

- Total clicks without downstream engagement (save/apply/shortlist).
- Application volume without quality signal.
- Recruiter shortlist size (larger is not better — precision is).

---

## 7. Functional Requirements

### 7.1 Authentication & Authorization

- Email/password registration and login with JWT (15-min access tokens + rotating refresh tokens).
- Three roles: `student`, `recruiter`, `admin` — enforced RBAC on all API routes.
- Argon2id password hashing; httpOnly, Secure, SameSite=Strict refresh cookies with reuse detection.
- CAPTCHA after N failed login attempts.

---

### 7.2 Student Profile & Resume Ingestion

- Students complete a profile: name, headline, location, declared skills, education, experience, target role.
- Resume upload (PDF/DOCX, max size enforced) stored in object storage (S3/R2).
- **Staged async parsing pipeline (Celery):**
  1. **PyMuPDF text extraction** — layout-aware; handles columns and tables better than naive readers.
  2. **Skill extraction** — NER/LLM identifies skill mentions from text.
  3. **Education extraction** — degree, institution, graduation year.
  4. **Experience extraction** — roles, durations, domains.
  5. **Skill normalization** — maps raw strings to canonical taxonomy IDs.
  6. **Embedding** — generates student vector; upserts to Qdrant `students` collection + PostgreSQL.
- **Fallback:** if extraction confidence is low, prompt student to confirm detected skills before embedding.
- On completion: **Career Readiness Score** is computed and surfaced immediately.

---

### 7.3 Career Readiness Score

The Career Readiness Score is a first-class product feature — not a side effect of matching.

**Computation:**

```
Career Readiness Score (per target role) =
  (Skill Coverage %)  × 0.50
+ (Experience Relevance %) × 0.30
+ (Education Match %) × 0.20
```

**Display:**

```
Software Engineer Readiness
████████░░  82%

Strong: Python, React, SQL
Missing: Docker · AWS · System Design
```

**Rules:**
- Computed per declared `target_role` using the canonical skill requirements for that role from the taxonomy.
- Stored in `career_readiness_scores(student_id, target_role, score, missing_skill_ids[], computed_at)`.
- Recomputed whenever the student's normalized skill set changes.
- Score is capped: a student with no resume gets a cold-start score based on declared skills only, with a "Upload resume for a better score" prompt.

---

### 7.4 Skill-Gap Analysis & Career Roadmap

Full definition of the skill-gap feature:

```
Target Role (declared or inferred)
        ↓
Current Match % (from Career Readiness Score)
        ↓
Missing Skills (canonical IDs not in student profile)
        ↓
Recommended Resources (curated per skill: course, doc, project idea)
        ↓
Career Roadmap (ordered learning path by priority weight)
```

**Example output:**

```
Backend Engineer Readiness: 72%

Missing Skills (by impact on score):
  1. Docker          — add +8%  → [Docker Getting Started] [Play with Docker]
  2. AWS             — add +7%  → [AWS Free Tier] [Cloud Practitioner]
  3. CI/CD           — add +5%  → [GitHub Actions Docs] [Sample Pipeline]

Suggested Learning Order: Docker → CI/CD → AWS
Estimated to reach 90%: ~6 weeks (2 hrs/day)
```

**Data model additions:**

- `skill_resources(skill_id, resource_type, title, url, estimated_hours)` — curated learning resources per canonical skill.
- `career_roadmaps(student_id, target_role, ordered_skill_ids[], generated_at)` — personalized ordered roadmap.

---

### 7.5 Recruiter Workflow & Candidate Quality Score

#### Posting Creation

Recruiters create postings with: title, description, required skills, domain, location, duration, deadline, and a `seniority_expectation` (Freshman / Sophomore / Junior / Senior).

On save: skills normalized → posting embedded → upserted to Qdrant `internships` collection → AI candidate shortlist pre-generated async.

#### Candidate Quality Score

Every candidate matched to a recruiter's posting receives a **Candidate Quality Score**:

```
Candidate Quality Score =
  Skill Match %    × 0.50   (normalized_skill_ids overlap)
+ Domain Match %   × 0.25   (embedding cosine similarity on domain)
+ Education Match % × 0.15  (degree level vs. expectation)
+ Experience Match % × 0.10 (relevant role duration)
```

Stored as structured JSON in `candidate_recommendations.match_breakdown`:

```json
{
  "skill_match": 0.65,
  "domain_match": 0.20,
  "education_match": 0.10,
  "experience_match": 0.05,
  "composite_score": 0.87,
  "narrative": "Strong Python and Django skills align with 4 of 5 required skills. Backend domain is a direct match. Junior-year standing fits expectation."
}
```

The `narrative` field is LLM-generated from the structured scores — not free-form inference.

#### AI-Generated Shortlist

- One-click "Generate Shortlist" (or auto-triggered on posting creation) runs reverse vector search + rerank.
- Returns top-10 candidates sorted by Candidate Quality Score.
- Recruiter sees: candidate name, readiness score, quality score breakdown, "why matched" narrative, and a Shortlist / Reject action.
- Each action emits an `interaction_event` that improves future rankings.

---

### 7.6 Internship Ingestion Pipeline

Sources: recruiter manual posts + bulk CSV import + external adapter interface (rate-limited, ToS-respecting scrapers or APIs).

**Full ingestion flow with quality controls:**

```
Fetch / Receive
      ↓
Duplicate Detection
  • Hash(title + company + location) → skip if exists
  • Fuzzy title match within same company (Levenshtein ≤ 0.15) → flag for review
      ↓
Company Verification
  • Company must exist in verified companies table OR be submitted for admin review
  • Unverified companies: postings held in staging, not shown to students
      ↓
Data Quality Checks
  • Required fields present: title, description, at least 1 skill, location
  • Description minimum length (> 100 chars) — reject stub listings
      ↓
Skill Normalization
  • Map all skill strings to canonical taxonomy IDs
  • Unknown skills → pending review queue, not blocking
      ↓
Embed + Upsert
  • Generate internship vector → upsert Qdrant internships collection
  • Upsert PostgreSQL internships row
      ↓
Expiry Management (scheduled, nightly)
  • Mark as expired if deadline passed or last_seen > 30 days (external sources)
  • Expired internships removed from Qdrant payload filter (status ≠ active)
  • Students with saved/bookmarked expired postings notified
      ↓
Data Freshness Checks (Celery Beat, daily)
  • External source re-fetch: re-verify listings still live
  • Stale listings (not re-seen in 7 days from external source) → flagged for expiry
```

**Quality metrics tracked (admin dashboard):**
- Duplicate rejection rate per source.
- Average time from ingest to live (processing latency).
- % listings with full skill normalization vs. partial.
- Expired listing cleanup count per day.

---

### 7.7 Structured Explainability

All match explanations are **generated from structured scores, not free-form LLM inference.**

**Storage schema (both `recommendations` and `candidate_recommendations`):**

```json
{
  "match_breakdown": {
    "skill_match":      0.65,
    "domain_match":     0.20,
    "education_match":  0.10,
    "experience_match": 0.05
  },
  "composite_score": 0.87,
  "matched_skills": ["python", "django", "postgresql"],
  "missing_skills": ["docker", "redis"],
  "narrative": "Strong backend alignment: 3 of 5 required skills are exact matches. Domain overlap with prior experience. Missing containerization skills (Docker) — consider adding to profile."
}
```

**Generation rule:** LLM receives the structured `match_breakdown` + `matched_skills` + `missing_skills` as input and produces only the `narrative` field. It never invents internships or infers unstated attributes. This bounds hallucination risk to the narrative string only.

**UI display (student recommendation card):**

```
[Internship Title]                     Match Score: 87%
───────────────────────────────────────────────────────
Skill Match   ██████░░░░  65%
Domain Match  ████░░░░░░  20%
Education     ██░░░░░░░░  15% (approximate)
Matched: Python · Django · PostgreSQL
Missing: Docker · Redis

"Strong backend alignment: your Django experience matches 3 of 5 required skills..."
```

---

### 7.8 Applications & Bookmarks

- Students can save (bookmark) or apply to an internship.
- Each action emits an `interaction_event`.
- Application status lifecycle: `applied → under_review → shortlisted → rejected`.
- Recruiter sees ranked application list per posting, sortable by Candidate Quality Score.

---

### 7.9 Notifications (Async)

- Celery-driven: email + in-app.
- Triggers: application status change, new top matches (weekly digest), shortlist event, saved internship nearing deadline, saved internship expired.

---

## 8. AI & Recommendation System Requirements

### 8.1 Phased Ranking Strategy

The ranking system is designed to deliver value from Day 1 without any behavioral data, and deepen automatically as data accumulates. **The architecture does not depend on learning to function.**

---

**Phase 1 — Semantic Baseline (Day 1, no interaction data required)**

```
final_score = α · vector_similarity
            + β · skill_overlap
            + γ · location_match
```

Where:
- `vector_similarity` = cosine distance between student embedding and internship embedding (Qdrant ANN).
- `skill_overlap` = Jaccard similarity between `student.normalized_skill_ids` and `internship.normalized_skill_ids`.
- `location_match` = binary/distance signal (same city = 1.0, same country = 0.5, remote-ok = 0.8).
- Default weights: `α=0.6, β=0.3, γ=0.1` (tunable at launch without model training).

LLM reranking of top-50 candidates runs on top of Phase 1 scores from the start.

---

**Phase 2 — Learned-to-Rank (activates at ≥ 500 interaction events)**

```
final_score = α · vector_similarity
            + β · skill_overlap
            + γ · location_match
            + δ · learned_rank_score
```

Where `learned_rank_score` comes from a LightGBM or logistic regression model trained on `interaction_events` with features: `(vector_score, skill_overlap, location_match, historical_apply_rate_for_role)`.

**Activation gate:** Phase 2 weights are only hot-loaded when:
1. ≥ 500 labeled interaction events exist in the training set.
2. Cross-validated Precision@10 of Phase 2 exceeds Phase 1 baseline by ≥ 5%.
3. Otherwise, Phase 1 weights remain active.

**Rollback:** If Phase 2 Precision@10 regresses on a nightly eval, Phase 1 weights are automatically restored. All weight vectors are versioned.

---

**Phase 3 — Two-Sided Learning (future)**

Recruiter shortlist/reject signals feed candidate-ranking weights symmetrically. A/B holdout on Phase 2 to measure lift.

---

### 8.2 Student-Side Recommendation Pipeline

**Route:** `GET /recommendations`

1. Retrieve student embedding from Qdrant `students` collection (recompute if `embedding_model_version` stale).
2. ANN search over `internships` collection, top-K=100, with payload pre-filters (status=active, location, domain).
3. Compute Phase 1 structured score for each candidate: `(vector_similarity, skill_overlap, location_match)`.
4. If Phase 2 active: blend in `learned_rank_score`.
5. LLM reranks top-50 and generates `narrative` from `match_breakdown` (cached in Redis per `profile_version + candidate_set_hash`).
6. Compute and attach `match_breakdown` JSON to each result.
7. Return top-N with `ai_reranked` flag, `weights_version`, and full `match_breakdown`.

---

### 8.3 Recruiter-Side Candidate Matching (Reverse Search)

**Route:** `GET /matches?internship_id={id}`

Same pipeline, reversed: internship embedding → ANN search over `students` collection → Phase 1/2 score → LLM rerank → Candidate Quality Score.

Results stored in `candidate_recommendations` with full `match_breakdown` JSON. Triggered automatically on internship creation and refreshed nightly.

---

### 8.4 Feedback Signal Collection

Every user action on a recommendation emits an `interaction_event`:

| Event | Weight | Side |
|-------|--------|------|
| Student: apply | +5 | Student |
| Student: save | +3 | Student |
| Student: view / click | +1 | Student |
| Student: dismiss / reject | −1 | Student |
| Recruiter: shortlist | +5 | Recruiter |
| Recruiter: reject | −1 | Recruiter |

Nightly Celery Beat job: aggregate weighted events → compute per-skill/role conversion rates → train Phase 2 ranker if activation gate passes → version and hot-load.

---

### 8.5 AI Fallback & Edge Cases

| Scenario | Behavior |
|----------|----------|
| No resume uploaded (cold start) | Phase 1 only: declared skills + location + role popularity rule |
| LLM downtime / timeout | Serve Phase 1 score only; `ai_reranked: false` in response |
| < 500 interaction events | Phase 1 active; Phase 2 not yet activated |
| Phase 2 regresses on eval | Auto-revert to Phase 1 weights; alert fired |
| Similarity below confidence floor | Suppress result; show "Broaden your profile" prompt |
| Embedding model upgrade | Re-embed via batch Celery job; `embedding_model_version` versioned in Qdrant payload |
| Feedback gaming / bots | Per-user signal cap; debounce rapid clicks; rate-limited traffic excluded |
| LLM cost control | Rerank top-K ≤ 50 only; Redis cache per `(profile_version, candidate_set_hash)`; batch calls |

---

## 9. Non-Functional Requirements

### 9.1 Performance

| Endpoint | Target Latency |
|----------|---------------|
| `GET /recommendations` (cache hit) | < 1s |
| `GET /recommendations` (cache miss) | < 4s |
| `GET /matches` (recruiter, cache hit) | < 1s |
| `GET /internships` (listing) | < 300ms |
| Career Readiness Score (first load) | < 3s |
| Resume parse pipeline (async, full) | < 60s end-to-end |

- All heavy work offloaded to Celery; API stays sub-200ms for orchestration.
- Redis caches recommendation results (TTL 1h, invalidated on profile change), internship listings (TTL 10 min), and LLM rerank results (TTL 1h per profile+candidate set).
- Pre-warm both `recommendations` and `candidate_recommendations` nightly via Celery Beat — reads are instant.

### 9.2 Scalability

- Stateless API — horizontal scaling behind load balancer.
- PgBouncer connection pooling (transaction mode) for PostgreSQL.
- Qdrant HNSW with payload pre-filtering.
- Phase 1 (hackathon): single-node Postgres + Qdrant containers.
- Phase 2 (100K+): PgBouncer + read replicas; partition `interaction_events`/`recommendations` by time.
- Phase 3 (millions): Qdrant cluster (sharding/replication); streaming feedback pipeline.

### 9.3 Security

- JWT: 15-min access tokens + rotating httpOnly refresh tokens with reuse detection.
- All secrets via env vars (Doppler/Vault); LLM provider keys server-side only.
- Pydantic v2 validates every request at the API boundary (type, length, enum, regex).
- File uploads: MIME sniffing, extension allowlist (`.pdf`/`.docx`), size cap, virus scan hook.
- SQLAlchemy parameterized queries (no raw SQL string concatenation).
- Strict CSP headers; React auto-escaping in frontend.
- Rate limiting: auth (5 req/min/IP), recommendations (20 req/min/user), public listings (100 req/min/IP).
- Protected attributes (gender, age) excluded from embeddings; score distributions logged for bias audit.

### 9.4 Reliability

- Managed PostgreSQL with streaming replication + automated failover.
- Qdrant replication factor ≥2; reconstructible from Postgres via re-embed batch job.
- Automated daily base backups + continuous WAL archiving (PITR).
- Qdrant collection snapshots to object storage daily.
- Circuit breaker on LLM calls → auto-degrade to Phase 1 scoring.
- Blue-green deployment; rollback via previous image SHA (< 30s).
- Alembic migrations use expand/contract pattern — rollback never breaks schema.

### 9.5 Observability

- **Errors:** Sentry (frontend + backend + workers).
- **Metrics:** Prometheus + Grafana (latency p50/p95/p99, queue depth, AI rerank success rate, Phase 1 vs. Phase 2 activation status, ingestion freshness).
- **Logs:** Structured JSON via `structlog` → Loki, correlated by trace ID.
- **Tracing:** OpenTelemetry across web → API → ML service.

**Alerts:**

| Alert | Trigger |
|-------|---------|
| API down | Health-check fail > 1 min |
| High error rate | 5xx > 2% over 5 min |
| Queue backlog | Celery pending > 1000 or oldest task > 5 min |
| LLM degraded | LLM error rate > 20% → auto-switch Phase 1 |
| Phase 2 regression | Precision@10 drops below Phase 1 baseline → auto-revert |
| Ingestion staleness | External source not refreshed in > 24h |
| Latency SLO breach | p95 > 800ms |

### 9.6 Capacity

- Design target: **10,000 concurrent users** at launch.
- Architecture demonstrably scalable to 1M+ users (see §9.2 phases).

---

## 10. Scope

### MVP — P0 (Must Ship)

- User auth (JWT, roles: student / recruiter / admin).
- Student profile creation + staged resume parsing (PyMuPDF → skills / education / experience).
- **Career Readiness Score** — computed on profile completion; displayed on dashboard.
- Internship CRUD for recruiters.
- Skill taxonomy normalization layer (`skills` + `skill_aliases`).
- Embedding pipeline + Qdrant upsert (both `students` and `internships` collections).
- Student-side recommendation API (Phase 1: vector + skill overlap + location; LLM rerank on top-50).
- **Recruiter-side reverse search** → `candidate_recommendations` with Candidate Quality Score + structured `match_breakdown`.
- **Structured explainability** — `match_breakdown` JSON stored and rendered as visual score card + LLM narrative.
- Recommendations + matches UI with interaction logging (view / save / apply / dismiss / shortlist / reject).
- Feedback signal collection (`interaction_events` ingestion + weighted scoring).
- Internship ingestion pipeline with duplicate detection, company verification, quality checks, expiry management.

### P1 — Ship Soon After

- **Skill-Gap Roadmap** — missing skills + recommended resources + ordered learning path.
- Applications & bookmarks with full status tracking.
- Recruiter time-saved dashboard widget.
- Async notifications (status changes, new matches, expiry alerts).
- Bulk CSV internship import.

### P2 / Stretch

- **Phase 2 Learned Ranker** — auto-activates at ≥ 500 interactions.
- Admin dashboard: recommendation health, ingestion metrics, feedback loop status, taxonomy moderation.
- Career Roadmap with estimated time-to-readiness.
- Recruiter time-saved analytics.

---

## 11. Out of Scope

- Messaging / chat between students and recruiters.
- Interview scheduling or calendar integrations.
- Payment / premium tiers (platform is free for MVP).
- Mobile native apps (responsive web only at launch).
- OAuth / social login (email/password only for MVP).
- Multi-language support (English only at MVP).
- Third-party job board integrations beyond the basic external adapter interface.
- Resume builder or document generation tools.

---

## 12. System Architecture Overview

The system is a **decoupled, service-oriented monorepo** with four independently deployable surfaces:

| Surface | Technology | Responsibility |
|---------|-----------|----------------|
| `apps/web` | Next.js (App Router) | Student + recruiter UI, SSR/ISR |
| `apps/api` | FastAPI | Auth, CRUD, recsys orchestration |
| `services/worker` | Celery + Redis | Parse, embed, ingest, notify, feedback aggregation, nightly retrain |
| `services/ml` | Python HTTP service | Embeddings, ANN search, Phase 1/2 scoring, LLM rerank, Career Readiness Score |
| PostgreSQL | System of record | Structured data, relations, ACID |
| Qdrant | Vector store | `students` + `internships` collections, HNSW ANN |
| Redis | Cache + broker | Task queue, recommendation cache, rate limiting |

All four dev surfaces build in parallel against a **contract-first** specification in `packages/contracts` (OpenAPI schema + shared Pydantic/TypeScript types).

---

## 13. Data Model Summary

### Core Entities

| Entity | Key Fields |
|--------|-----------|
| `users` | id, email, role, password_hash |
| `student_profiles` | user_id, normalized_skill_ids[], education, experience, target_role, resume_url, embedding_model_version |
| `career_readiness_scores` | student_id, target_role, score, missing_skill_ids[], computed_at |
| `career_roadmaps` | student_id, target_role, ordered_skill_ids[], generated_at |
| `skill_resources` | skill_id, resource_type, title, url, estimated_hours |
| `internships` | id, company_id, title, description, normalized_skill_ids[], location, status, source, embedding_model_version, expires_at, last_verified_at |
| `companies` | id, name, verified, domain |
| `applications` | id, student_id, internship_id, status, applied_at |
| `recommendations` | id, student_id, internship_id, composite_score, match_breakdown(JSON), ai_reranked, weights_version |
| `candidate_recommendations` | id, recruiter_id, student_id, internship_id, composite_score, match_breakdown(JSON) |
| `interaction_events` | id, user_id, internship_id, event_type, weight, timestamp |
| `skills` | id, canonical_name, category, embedding |
| `skill_aliases` | id, skill_id, alias |
| `ranking_weights` | id, version, phase, weights(JSON), precision_at_10, activated_at, is_active |

### Key Indexes

| Need | Index Type |
|------|-----------|
| Email login | B-tree unique on `users.email` |
| Vector ANN (both collections) | HNSW (cosine) in Qdrant |
| Skill/location pre-filter | Qdrant payload index on `normalized_skill_ids`, `location`, `status` |
| SQL skill filtering | GIN on `normalized_skill_ids[]` (Postgres) |
| Career readiness lookup | Composite `(student_id, target_role)` on `career_readiness_scores` |
| Listing pagination | Composite `(status, created_at DESC)` on `internships` |
| Expiry management | B-tree on `internships.expires_at`, `internships.last_verified_at` |
| Feedback aggregation | Composite `(user_id, internship_id, event_type, timestamp)` on `interaction_events` |

---

## 14. Dependencies & Risks

### External Dependencies

| Dependency | Purpose | Risk Mitigation |
|-----------|---------|-----------------|
| LLM Provider (OpenAI / Ollama) | Narrative generation from structured scores | Circuit breaker → Phase 1 score-only mode; narrative omitted, not invented |
| `sentence-transformers` (bge/e5) | Embedding generation | Versioned; re-embed on upgrade via batch job |
| PyMuPDF | Resume text + layout extraction | Staged pipeline; partial extraction degrades gracefully |
| Object Storage (S3/R2) | Resume file storage | Versioned + cross-region replicated |
| Qdrant | ANN vector search | Replication factor ≥2; reconstructible from Postgres |

### Key Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Cold start — no interaction data for learned ranker | **High** | Low (by design) | Phase 1 runs without any interaction data; Phase 2 gate prevents premature activation |
| Cold start — no student resumes | High | Medium | Career Readiness Score on declared skills; "Upload resume for better score" prompt |
| Cold start — no internship data | High | High | Ingestion pipeline seeds catalog on Day 1; CSV import for recruiters |
| LLM latency / downtime | Medium | Medium | Circuit breaker → Phase 1 scoring; `ai_reranked: false` flag; narrative field omitted |
| Embedding drift on model upgrade | Low | High | `embedding_model_version` in Qdrant payload; re-embed via scheduled batch job |
| Phase 2 ranker overfits sparse signals | Medium | Medium | Confidence-weighted blending; activation gate; auto-revert on regression |
| Bias in recommendations | Low | High | Protected attributes excluded from embeddings; score distributions audited |
| Resume parsing failure on unusual formats | Medium | Medium | Staged pipeline; partial parse + user-confirmation fallback |
| Ingestion data quality (stale/duplicate listings) | Medium | Medium | Duplicate detection, expiry cleanup, freshness checks baked into pipeline |
| Recruiter engagement without candidate volume | High | High | Reverse search works with even 10 student profiles; improve messaging around early-access value |

---

*End of Document — Version 2.0*

> **Next:** See `docs/FEATURES.md` for the complete feature list and `docs/TASKS.md` for the implementation checklist.

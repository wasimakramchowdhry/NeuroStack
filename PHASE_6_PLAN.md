# 📈 Phase 6: Progress Tracking & Analytics (Detailed Plan)

> **Timeline**: Week 11–12
> **Goal**: Implement a comprehensive, gamified progress system in the application. Track user topics completion, calculate skill-level maturity, and present actionable analytics in a beautiful Neo-tactoid UI dashboard. This phase introduces our `TopicProgress` and `Badge` tracking architecture, leveraging Celery for background analytics calculation.

---

## 🏗 Sub-Phase 6.1: Database Models & Schemas (Backend)

We need robust models in PostgreSQL to monitor and measure a user's skills and activity over time.
*Using SQLAlchemy 2.0 ORM under `backend/app/modules/progress/models.py`.*

### Progress & User Analytics Models

| Table Name | Description | Key Fields |
|----------|-------------|------------|
| `topic_progress` | Granular viewing tracking per topic | `id`, `user_id`, `topic_id`, `sections_completed_json`, `time_spent_mins`, `completed_at` |
| `badges` | System-wide reference for achievements | `id`, `name`, `description`, `criteria_json`, `icon_key`, `category` (Enum) |
| `user_badges` | Achievements unlocked by a user | `user_id`, `badge_id`, `earned_at` |
| `user_stats` | Highly aggregated summary of a user's standing | `user_id` (PK, FK), `total_topics_done`, `avg_quiz_score`, `current_streak`, `level` |

### Progress Schemas (Pydantic `app/modules/progress/schemas.py`)
- **`TopicProgressUpdate`**: Receives an array of recently completed section IDs and `time_spent`.
- **`UserStatsResponse`**: Aggregated radar, linear progress, streak count, and skill level for the frontend.
- **`BadgeResponse`**: `id`, `name`, `description`, `icon_key`, `earned` (Boolean flag).

---

## 🔌 Sub-Phase 6.2: Analytics APIs & Background Services

We implement async-first endpoints under `/api/v1/progress` and push heavy analysis tracking tasks to our Celery workers.

### API Endpoints
1. `POST /api/v1/progress/track`
   - **Request**: `{ "topic_id": "...", "sections": ["concept", "visual"], "time_spent_secs": 120 }`
   - **Logic**: Upserts `topic_progress` efficiently. Checks if the criteria for topic completion is met.

2. `GET /api/v1/progress/dashboard`
   - **Response**: Comprehensive state of the student.
     - Global stats (`total_topics`, `overall_accuracy`).
     - Heatmap data summarizing activity over the past 30 days.
     - Next closest badge criteria.

3. `GET /api/v1/progress/radar`
   - **Response**: Computes and returns the 5 dimensions of skill (e.g. `concept`, `code`, `architecture`, `optimization`, `debugging`). Used directly in Recharts UI.

### Celery Analytics Setup (`analytics_tasks.py`)
Because calculating exact accuracy metrics off of heavy JSON fields causes DB lag, we implement Celery tasks to summarize analytics:

- **`calculate_weekly_growth(user_id)`**: Triggers on a schedule to calculate weekly streak updates and snapshot historical performance.
- **`evaluate_badge_triggers(user_id)`**: Ran after every topic/quiz completion. Checks predefined `badges.criteria_json` against the user's progress arrays to auto-award new badges.

---

## 🎨 Sub-Phase 6.3: UI Components & Dashboard (Frontend)

We continue using our established **Neo-tactoid (Neumorphic)** design system for the analytics frontend, delivering rich visual feedback with Recharts and GSAP.

### Component Architecture (`frontend/src/features/progress/`)
1. **`SkillMeterArc.jsx`**: An animated SVG arc chart displaying maturity scale ("Novice" → "Architect").
2. **`RadarChartWidget.jsx`**: A `recharts` radar chart modeling the five core AI abilities. Neumorphic container wrapping it.
3. **`HeatmapWidget.jsx`**: A GitHub-style contribution heatmap mapping `topic_progress` activity density over the year.
4. **`BadgeShowcase.jsx`**: Auto-calculates locks vs unlocked badges. When a badge is newly unlocked, triggers a GSAP pop-out shine animation.
5. **`StreakCounter.jsx`**: Renders dynamic animated fire based on current consecutive streak logs.

### UI Integration Details
- **Dashboard Layout**: Update `/dashboard` to host all sub-components. 
- **Topic Cards**: Revise `TopicCard` from Phase 2 to display dynamic progress fill based on `topic_progress`.
- **Gamification Enhancements**: Implement toast alerts ("🏆 Next Badge Unlocked: Transformer Engineer") globally using the existing context provider when the `UserBadge` websocket/API detects new updates.

---

## ⚡ Sub-Phase 6.4: Gamification & Badge Engine 

To make learning effectively addictive, we formalize the badge system and leaderboard integration:

### Badge Configuration Standard (`scripts/seed_badges.py`)
Example Badge Objects to seed in the DB during deployment:
- **"First Forward Pass"**: (`criteria: { topics_completed: 1 }`)
- **"Tensor Tamer"**: (`criteria: { quiz_avg_score: >80, topics: ["linear_algebra", "tensors"] }`)
- **"Master of Attention"**: (`criteria: { topics: ["transformer_attention"], animations_viewed: 1 }`)

---

## 🔄 Integration & Verification Plan

### Backend Testing (Pytest)
1. Write a fixture mocking multiple topic progress arrays.
2. Test `evaluate_badge_triggers` celery task perfectly issues a new `UserBadge` when mocked state reflects completion.
3. Test `GET /api/v1/progress/dashboard` performance stays < 200ms by optimizing aggregate queries.

### Frontend Testing (Vitest + Cypress)
1. Render test for `RadarChartWidget.jsx` ensuring Recharts initializes correctly.
2. UI verification simulating an unlocked badge and ensuring GSAP fires visually.
3. Test that viewing sections dynamically calls `POST /api/v1/progress/track` in the background without stuttering UI.

---

## 🛠️ Step-by-Step Implementation Guide

### Step 1: Backend Database & Endpoints
1. Create `progress` module inside `backend/app/modules/`.
2. Generate Alembic migrations for `topic_progress`, `badges`, `user_badges`, and `user_stats`.
3. Create generic endpoints for tracking progress array chunks per user ID (using cache to debounce multiple repeated hits).
4. Implement `GET /dashboard` endpoints computing the radar schema layout.

### Step 2: Celery Background Job Configuration
1. Set up Redis broker for `analytics_tasks.py`.
2. Write logic to aggregate raw quiz points array logs into clean `user_stats` schema layouts incrementally.
3. Implement badge issuance criteria verification functions.

### Step 3: Frontend Views & Chart Components
1. Add `recharts` to frontend dependencies.
2. Draft `RadarChartWidget.jsx` and `SkillMeterArc.jsx` with light/dark variables.
3. Pull `useProgressStore` over API `useApi` wrappers to maintain global caching for the logged in user's state.

### Step 4: UI Animation Polish (Neo-tactoid Enhancements)
1. Build `BadgeShowcase.jsx` ensuring locking mechanisms are beautifully blurred using `backdrop-blur`.
2. Ensure streak flames conditionally load lightweight Lottie/GSAP sequences based on high streak volume.
3. Embed minor progress meters under individual topic exploration views.

---

## 🏆 Phase 6 Deliverables Checklist

- [ ] Data Models: `TopicProgress`, `Badge`, `UserBadge`, `UserStats` created via Alembic.
- [ ] API Endpoints: Progress tracking, user dashboard summaries deployed securely.
- [ ] Celery Tasks: Background `weekly_growth` and `badge_trigger` checks operational.
- [ ] Frontend Core UI: Progress dashboard route styled strictly adhering to Neo-tactoid palette.
- [ ] Chart Integration: Recharts implemented delivering beautiful 5-axis Radar performance data.
- [ ] Gamification: Dynamic SVG/GSAP rendered badges and Heatmap integrated.
- [ ] Feedback Loop: In-browser progress sync automatically updates Global Zustand context securely.

# 🧠 NeuroStack — AI Systems Mastery Learning Platform

## Complete Phase-Wise Project Plan

> **Goal**: Build a production-grade, multilingual AI learning platform with adaptive roadmaps, visual animations, self-evaluation, and an embedded AI mentor.

---

## 🚨 Where Others Make Mistakes (And How We Avoid Them)

### 1. Monolithic Architecture Trap
**Mistake**: Cramming auth, topics, quizzes, translations into one giant app.
**Fix**: Domain-driven modular design — each feature is a self-contained module with its own routes, services, schemas, and models.

### 2. Translation as an Afterthought
**Mistake**: Hardcoding English everywhere, then bolting on i18n later.
**Fix**: Day-1 multilingual architecture. Every content model has a `TranslatedContent` table. UI uses i18n keys from the start.

### 3. No Caching Strategy
**Mistake**: Calling Bhashini API on every page load, causing latency and rate limits.
**Fix**: Three-tier caching: Redis (hot) → PostgreSQL (warm) → Bhashini API (cold). Cache-first architecture from Phase 1.

### 4. Flat Quiz System
**Mistake**: Only MCQs with no adaptive difficulty.
**Fix**: Typed question engine (MCQ, code, short-answer, architecture, scenario) with difficulty scoring and adaptive selection.

### 5. No Separation of Content from Logic
**Mistake**: Mixing topic content with application code.
**Fix**: Content stored as structured JSON/Markdown in DB, rendered dynamically. Admin can update without code deploy.

### 6. Animations Without Purpose
**Mistake**: Adding flashy animations that slow the app and confuse users.
**Fix**: Each animation maps to a learning objective (e.g., "understand attention mechanism"). Lazy-loaded, performant GSAP scenes.

### 7. No Offline / Performance Budget
**Mistake**: Ignoring bundle size, no service workers, no skeleton screens.
**Fix**: Code-splitting per route, service worker for offline topics, skeleton loaders, performance budget enforced in CI.

### 8. God-Component Frontend
**Mistake**: 2000-line page components with embedded state, API calls, and rendering.
**Fix**: Strict separation: Pages → Layouts → Features → UI Components → Hooks → Services.

### 9. No Observability
**Mistake**: No logging, no error tracking, debugging in production by guessing.
**Fix**: Structured logging (backend), error boundaries (frontend), health checks, request tracing.

### 10. Ignoring Database Migrations
**Mistake**: Manually altering DB schema in production.
**Fix**: Alembic migrations from day one, version-controlled, auto-generated.

---

## 🏗 Scalable & Modular Project Structure

```
NeuroStack/
├── README.md
├── PROJECT_PLAN.md
│
├── frontend/                          # React + Vite + TailwindCSS
│   ├── public/
│   │   ├── favicon.ico
│   │   └── manifest.json
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── router.jsx                # Centralized routing
│   │   │
│   │   ├── assets/                   # Static assets (images, fonts)
│   │   │
│   │   ├── config/                   # App config, env vars, constants
│   │   │   ├── env.js
│   │   │   └── constants.js
│   │   │
│   │   ├── styles/                   # Global styles & theme
│   │   │   ├── globals.css
│   │   │   ├── theme.js              # Dark/light theme tokens
│   │   │   └── animations.css
│   │   │
│   │   ├── i18n/                     # Internationalization
│   │   │   ├── index.js
│   │   │   ├── locales/
│   │   │   │   ├── en.json
│   │   │   │   ├── hi.json
│   │   │   │   └── ...22 languages
│   │   │   └── LanguageProvider.jsx
│   │   │
│   │   ├── components/               # Shared UI components
│   │   │   ├── ui/                   # Buttons, Inputs, Cards, Modals
│   │   │   ├── layout/              # Navbar, Sidebar, Footer, Shell
│   │   │   ├── feedback/            # Loaders, Toasts, Skeletons
│   │   │   └── charts/              # Radar, Heatmap, Progress charts
│   │   │
│   │   ├── features/                 # Feature modules (CORE)
│   │   │   ├── auth/
│   │   │   │   ├── components/
│   │   │   │   ├── hooks/
│   │   │   │   ├── services/
│   │   │   │   ├── store/
│   │   │   │   └── pages/
│   │   │   │
│   │   │   ├── topics/
│   │   │   │   ├── components/       # TopicCard, TopicViewer, CodeBlock
│   │   │   │   ├── hooks/
│   │   │   │   ├── services/
│   │   │   │   ├── store/
│   │   │   │   └── pages/
│   │   │   │
│   │   │   ├── quiz/
│   │   │   │   ├── components/       # QuestionRenderer, QuizTimer
│   │   │   │   ├── hooks/
│   │   │   │   ├── services/
│   │   │   │   ├── store/
│   │   │   │   └── pages/
│   │   │   │
│   │   │   ├── progress/
│   │   │   │   ├── components/       # SkillMeter, RadarChart, Heatmap
│   │   │   │   ├── hooks/
│   │   │   │   ├── services/
│   │   │   │   └── pages/
│   │   │   │
│   │   │   ├── roadmap/
│   │   │   │   ├── components/       # RoadmapTimeline, PhaseCard
│   │   │   │   ├── hooks/
│   │   │   │   ├── services/
│   │   │   │   └── pages/
│   │   │   │
│   │   │   ├── mentor/
│   │   │   │   ├── components/       # ChatWindow, MentorSuggestion
│   │   │   │   ├── hooks/
│   │   │   │   ├── services/
│   │   │   │   └── pages/
│   │   │   │
│   │   │   ├── animations/          # GSAP visual learning scenes
│   │   │   │   ├── TransformerAttention.jsx
│   │   │   │   ├── MatrixMultiplication.jsx
│   │   │   │   ├── RoutingFlow.jsx
│   │   │   │   ├── QuantizationCompression.jsx
│   │   │   │   └── hooks/
│   │   │   │
│   │   │   ├── benchmark/
│   │   │   │   ├── components/
│   │   │   │   ├── services/
│   │   │   │   └── pages/
│   │   │   │
│   │   │   ├── journal/
│   │   │   │   ├── components/
│   │   │   │   ├── services/
│   │   │   │   └── pages/
│   │   │   │
│   │   │   ├── admin/
│   │   │   │   ├── components/
│   │   │   │   ├── services/
│   │   │   │   └── pages/
│   │   │   │
│   │   │   └── playground/          # Architecture design playground
│   │   │       ├── components/
│   │   │       └── pages/
│   │   │
│   │   ├── hooks/                    # Shared hooks
│   │   │   ├── useAuth.js
│   │   │   ├── useTheme.js
│   │   │   ├── useLanguage.js
│   │   │   └── useApi.js
│   │   │
│   │   ├── services/                 # API client layer
│   │   │   ├── api.js                # Axios/fetch instance
│   │   │   └── interceptors.js
│   │   │
│   │   ├── store/                    # Global state (Zustand)
│   │   │   ├── authStore.js
│   │   │   ├── themeStore.js
│   │   │   └── languageStore.js
│   │   │
│   │   └── utils/                    # Helpers, formatters
│   │       ├── validators.js
│   │       └── formatters.js
│   │
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── package.json
│   └── .env
│
├── backend/                           # FastAPI (Python)
│   ├── app/
│   │   ├── main.py                   # FastAPI app factory
│   │   ├── config.py                 # Settings via pydantic-settings
│   │   ├── database.py               # SQLAlchemy async engine + session
│   │   │
│   │   ├── core/                     # Cross-cutting concerns
│   │   │   ├── security.py           # JWT, hashing, OAuth
│   │   │   ├── dependencies.py       # Dependency injection
│   │   │   ├── exceptions.py         # Custom exception handlers
│   │   │   ├── middleware.py         # CORS, logging, rate-limit
│   │   │   └── cache.py             # Redis cache abstraction
│   │   │
│   │   ├── modules/                  # Feature modules (CORE)
│   │   │   ├── auth/
│   │   │   │   ├── router.py
│   │   │   │   ├── service.py
│   │   │   │   ├── schemas.py
│   │   │   │   ├── models.py
│   │   │   │   └── dependencies.py
│   │   │   │
│   │   │   ├── users/
│   │   │   │   ├── router.py
│   │   │   │   ├── service.py
│   │   │   │   ├── schemas.py
│   │   │   │   └── models.py
│   │   │   │
│   │   │   ├── topics/
│   │   │   │   ├── router.py
│   │   │   │   ├── service.py
│   │   │   │   ├── schemas.py
│   │   │   │   ├── models.py
│   │   │   │   └── content_loader.py  # Structured content engine
│   │   │   │
│   │   │   ├── translations/
│   │   │   │   ├── router.py
│   │   │   │   ├── service.py        # 3-tier cache logic
│   │   │   │   ├── schemas.py
│   │   │   │   ├── models.py
│   │   │   │   └── bhashini.py       # Bhashini API client
│   │   │   │
│   │   │   ├── quiz/
│   │   │   │   ├── router.py
│   │   │   │   ├── service.py
│   │   │   │   ├── schemas.py
│   │   │   │   ├── models.py
│   │   │   │   ├── evaluator.py      # AI answer evaluator
│   │   │   │   └── generator.py      # AI quiz generator
│   │   │   │
│   │   │   ├── progress/
│   │   │   │   ├── router.py
│   │   │   │   ├── service.py
│   │   │   │   ├── schemas.py
│   │   │   │   ├── models.py
│   │   │   │   └── analytics.py      # Stats computation
│   │   │   │
│   │   │   ├── roadmap/
│   │   │   │   ├── router.py
│   │   │   │   ├── service.py
│   │   │   │   ├── schemas.py
│   │   │   │   ├── models.py
│   │   │   │   └── engine.py         # Adaptive roadmap algorithm
│   │   │   │
│   │   │   ├── mentor/
│   │   │   │   ├── router.py
│   │   │   │   ├── service.py
│   │   │   │   └── schemas.py
│   │   │   │
│   │   │   ├── benchmark/
│   │   │   │   ├── router.py
│   │   │   │   ├── service.py
│   │   │   │   ├── schemas.py
│   │   │   │   └── models.py
│   │   │   │
│   │   │   ├── journal/
│   │   │   │   ├── router.py
│   │   │   │   ├── service.py
│   │   │   │   ├── schemas.py
│   │   │   │   └── models.py
│   │   │   │
│   │   │   └── admin/
│   │   │       ├── router.py
│   │   │       ├── service.py
│   │   │       └── schemas.py
│   │   │
│   │   └── tasks/                    # Background jobs (Celery)
│   │       ├── celery_app.py
│   │       ├── translation_tasks.py
│   │       └── analytics_tasks.py
│   │
│   ├── alembic/                      # DB migrations
│   │   ├── env.py
│   │   └── versions/
│   │
│   ├── tests/
│   │   ├── conftest.py
│   │   ├── test_auth/
│   │   ├── test_topics/
│   │   ├── test_quiz/
│   │   └── test_translations/
│   │
│   ├── alembic.ini
│   ├── requirements.txt
│   ├── pyproject.toml
│   └── .env
│
├── docker/
│   ├── Dockerfile.frontend
│   ├── Dockerfile.backend
│   └── docker-compose.yml
│
├── docs/
│   ├── API.md
│   ├── ARCHITECTURE.md
│   └── DEPLOYMENT.md
│
├── scripts/
│   ├── seed_topics.py
│   ├── seed_translations.py
│   └── run_dev.sh
│
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
│
├── .gitignore
├── .env.example
└── LICENSE
```

---

## 📅 Phase-Wise Implementation Plan

---

### 🔹 PHASE 1 — Foundation & Auth (Week 1–2)

**Goal**: Project scaffolding, DB setup, authentication, theme system, i18n skeleton.

#### Backend Steps
1. Initialize FastAPI project with `pyproject.toml`
2. Configure `pydantic-settings` for environment variables
3. Set up SQLAlchemy async engine + session factory
4. Set up Alembic migrations
5. Create `User` model (id, email, password_hash, role, preferred_language, created_at)
6. Create auth module: register, login, JWT issue/refresh, password hashing (bcrypt)
7. Create user profile endpoints (GET/PATCH profile)
8. Add CORS middleware, request logging middleware
9. Add health check endpoint (`/api/health`)
10. Write tests for auth flow (register → login → token refresh → profile)

#### Frontend Steps
1. Initialize Vite + React + TailwindCSS project
2. Set up project folder structure (features/, components/, hooks/, etc.)
3. Configure dark/light theme system with CSS variables + Zustand store
4. Build layout shell: Navbar, Sidebar, main content area
5. Build auth pages: Login, Register (with language selection dropdown)
6. Set up Axios API service with JWT interceptor (auto-refresh)
7. Create `useAuth` hook and auth store
8. Set up `react-router-dom` with protected routes
9. Set up i18n skeleton with `react-i18next` (English + Hindi as starter)
10. Add skeleton loaders and toast notification system

#### Deliverables
- ✅ User can register, login, see profile
- ✅ Dark/light mode toggle works
- ✅ Language selector present (functional in Phase 3)
- ✅ Protected routes enforce auth
- ✅ Clean, responsive shell UI

---

### 🔹 PHASE 2 — Topic Engine & Content System (Week 3–4)

**Goal**: Modular topic system with structured content, admin CRUD, and topic viewer.

#### Backend Steps
1. Create `Topic` model (id, title, slug, module, difficulty, order, is_published)
2. Create `TopicContent` model (topic_id, section_type, content_json, order)
   - Section types: `concept`, `visual`, `code`, `math`, `architecture`, `implementation`, `project`, `benchmark`, `quiz_ref`, `self_assessment`, `reflection`
3. Create topic CRUD endpoints (admin-only for create/update/delete)
4. Create public topic list endpoint with filtering (by module, difficulty)
5. Create topic detail endpoint returning all sections ordered
6. Seed script for 2–3 starter topics (Linear Algebra, Transformers)
7. Add pagination to topic list
8. Write tests for topic CRUD and content retrieval

#### Frontend Steps
1. Build `TopicCard` component (thumbnail, title, difficulty badge, progress %)
2. Build topic list page with filters (module, difficulty)
3. Build `TopicViewer` — renders sections dynamically:
   - Markdown renderer for concept/math
   - Syntax-highlighted code blocks (with copy button)
   - Placeholder slots for animations (Phase 5)
   - Architecture diagram placeholder (Mermaid / image)
4. Build admin panel: topic creation form with section editor
5. Add breadcrumb navigation

#### Deliverables
- ✅ Topics stored as structured sections in DB
- ✅ Admin can create/edit topics
- ✅ Users browse and read topics
- ✅ Content is fully dynamic, not hardcoded

---

### 🔹 PHASE 3 — Multilingual Translation System (Week 5–6)

**Goal**: Bhashini integration, 3-tier caching, full UI + content translation.

#### Backend Steps
1. Create `TopicTranslation` model (topic_id, section_id, language_code, translated_json, last_updated)
2. Create `UITranslation` model (key, language_code, value) for UI strings
3. Build Bhashini API client (`bhashini.py`) with:
   - API key management
   - Language pair configuration
   - Error handling + retry logic
   - Rate limiting
4. Build translation service with 3-tier caching:
   ```
   Request → Redis check → DB check → Bhashini API → Store in DB → Cache in Redis → Return
   ```
5. Create Celery task: `translate_topic_async(topic_id, target_language)`
6. Create endpoint: `GET /api/topics/{id}/translated?lang=hi`
7. Create endpoint: `GET /api/ui-translations?lang=hi`
8. Admin trigger: "Translate to all languages" button
9. Write tests with mocked Bhashini responses

#### Frontend Steps
1. Expand i18n system to load translations from API
2. Language switcher in navbar (persisted to user profile)
3. Topic viewer renders translated content when available
4. Fallback: show English with "Translation loading…" indicator
5. Cache translations in browser localStorage for offline hints

#### Deliverables
- ✅ Any topic can be translated to 22 languages
- ✅ Translations are cached (Redis → DB → API)
- ✅ UI text is fully translatable
- ✅ Language preference persisted per user

---

### 🔹 PHASE 4 — Quiz & Self-Testing Engine (Week 7–8)

**Goal**: Multi-type quiz system, AI evaluation, difficulty adaptation.

#### Backend Steps
1. Create models:
   - `Quiz` (id, topic_id, title, difficulty)
   - `Question` (id, quiz_id, type, content_json, correct_answer, difficulty, explanation)
   - `QuizAttempt` (id, user_id, quiz_id, score, started_at, completed_at)
   - `QuestionResponse` (attempt_id, question_id, user_answer, is_correct, ai_feedback)
2. Question types enum: `mcq`, `code_completion`, `short_answer`, `architecture`, `scenario_analysis`
3. Quiz CRUD endpoints (admin)
4. Quiz attempt endpoints:
   - `POST /api/quiz/{id}/start` → creates attempt, returns questions
   - `POST /api/quiz/{id}/submit` → evaluates, returns results
5. AI evaluator service:
   - MCQ: exact match
   - Code: syntax check + output comparison
   - Short answer: semantic similarity (embeddings or LLM)
   - Scenario: LLM-graded rubric
6. Question generator service (LLM-based, generates from topic content)
7. Difficulty adaptation: next quiz selects questions based on past performance
8. Write tests for submission, scoring, and edge cases

#### Frontend Steps
1. Build `QuestionRenderer` — renders by question type:
   - MCQ: radio buttons with option cards
   - Code: Monaco/CodeMirror editor
   - Short answer: text area
   - Architecture: drag-and-drop (Phase 8+)
   - Scenario: structured response form
2. Build quiz page with timer, progress bar, navigation
3. Build results page: score, per-question feedback, weak areas
4. Add quiz access from topic viewer ("Test Your Knowledge" CTA)

#### Deliverables
- ✅ Multi-type quiz system functional
- ✅ AI evaluates non-trivial answers
- ✅ Results show detailed feedback
- ✅ Difficulty adapts based on history

---

### 🔹 PHASE 5 — Visual Learning & Animations (Week 9–10)

**Goal**: GSAP-powered educational animations mapped to topics.

#### Steps
1. Install GSAP + ScrollTrigger
2. Create reusable animation wrapper component (`AnimationScene`)
3. Build animations (one per sprint cycle):
   - **Transformer Attention**: Query-Key-Value flow, softmax highlighting, multi-head split
   - **Matrix Multiplication**: Row-column dot product visualization
   - **Routing Flow**: Token → expert assignment animation (MoE)
   - **Quantization**: Float32 → Int8 compression with precision loss meter
   - **Sparse Activation**: Neuron activation heatmap
   - **CPU vs GPU**: Parallel vs sequential compute race
4. Each animation:
   - Has play/pause/step controls
   - Shows annotation text explaining each step
   - Is lazy-loaded (code-split)
5. Integrate into `TopicViewer` — `visual` section type renders the matching animation
6. Dark/light mode compatible

#### Deliverables
- ✅ 4–6 polished educational animations
- ✅ Animations are interactive (play/pause/step)
- ✅ Lazy-loaded, performant
- ✅ Integrated into topic flow

---

### 🔹 PHASE 6 — Progress Tracking & Analytics (Week 11–12)

**Goal**: Comprehensive progress system, dashboards, gamification.

#### Backend Steps
1. Create models:
   - `TopicProgress` (user_id, topic_id, sections_completed, time_spent, completed_at)
   - `Badge` (id, name, description, criteria_json, icon)
   - `UserBadge` (user_id, badge_id, earned_at)
   - `UserStats` (user_id, total_topics, avg_score, streak, level)
2. Progress tracking endpoints:
   - `POST /api/progress/track` (section viewed, time spent)
   - `GET /api/progress/dashboard` (aggregated stats)
   - `GET /api/progress/heatmap` (topic mastery grid)
3. Badge evaluation engine: check criteria after each quiz/topic completion
4. Analytics computation (Celery tasks):
   - Weekly growth calculation
   - Skill radar computation (concept, code, architecture, optimization, debugging)
   - Streak tracking
5. Write tests for progress aggregation and badge awarding

#### Frontend Steps
1. Build dashboard page:
   - Skill level meter (animated arc)
   - AI Systems maturity scale (tiered badge display)
   - Performance radar chart (Recharts/Chart.js)
   - Weekly growth line graph
   - Topic mastery heatmap
2. Badge showcase component with unlock animations
3. Streak counter with fire animation
4. Progress bar on each topic card

#### Deliverables
- ✅ Full progress dashboard with 5+ chart types
- ✅ Badge system with 10+ achievements
- ✅ Weekly analytics computed in background
- ✅ Gamification motivates continued learning

---

### 🔹 PHASE 7 — Adaptive Roadmap Engine (Week 13–14)

**Goal**: AI-generated personalized learning roadmap based on performance.

#### Backend Steps
1. Create `Roadmap` model (user_id, generated_at, plan_json)
2. Roadmap engine algorithm:
   - Input: quiz scores, time per topic, accuracy, confusion frequency
   - Output: weekly plan with focus topics, reinforcement tasks, stretch goals
   - Weights: recent performance > older performance
3. Endpoint: `GET /api/roadmap/generate` → produces personalized plan
4. Endpoint: `GET /api/roadmap/current` → latest roadmap
5. Endpoint: `POST /api/roadmap/feedback` → user rates roadmap helpfulness
6. Celery task: regenerate roadmaps weekly

#### Frontend Steps
1. Build animated roadmap timeline (GSAP + SVG path):
   - Phase nodes with progress fill
   - Current position indicator
   - Completed phases glow effect
2. Weekly plan cards: topic, estimated time, difficulty
3. "Regenerate" button with loading animation
4. Roadmap history viewer

#### Deliverables
- ✅ Personalized weekly roadmap generated from performance data
- ✅ Beautiful animated timeline visualization
- ✅ Roadmap adapts as user progresses

---

### 🔹 PHASE 8 — AI Mentor Assistant (Week 15–16)

**Goal**: Embedded AI mentor that explains concepts, generates exercises, simulates interviews.

#### Backend Steps
1. Create `MentorConversation` model (user_id, topic_id, messages_json, created_at)
2. Mentor service:
   - Context-aware: knows user's current topic, progress, weak areas
   - Modes: explain, exercise, interview, feedback
   - Uses LLM API (OpenAI/Anthropic) with structured prompts
3. Streaming endpoint: `POST /api/mentor/chat` (SSE or WebSocket)
4. Rate limiting: prevent abuse (X messages/hour)
5. Conversation history: user can review past mentor sessions

#### Frontend Steps
1. Build chat interface (slide-out panel from right)
2. Markdown rendering in chat bubbles
3. Code syntax highlighting in mentor responses
4. Mode selector: "Explain this", "Give me a challenge", "Interview me"
5. Typing indicator animation
6. Context badge: shows what topic/quiz the mentor is aware of

#### Deliverables
- ✅ AI mentor accessible from any page
- ✅ Context-aware responses based on user's learning state
- ✅ Supports explanation, exercise generation, mock interviews
- ✅ Conversation history saved

---

### 🔹 PHASE 9 — Benchmarking Lab & Code Runner (Week 17–18)

**Goal**: Performance benchmarking tools and embedded Python sandbox.

#### Backend Steps
1. Create `BenchmarkResult` model (user_id, topic_id, metrics_json, created_at)
2. Benchmark upload endpoint: accepts model metrics JSON
3. Benchmark visualization endpoint: returns comparison data
4. Code execution sandbox:
   - Option A: Pyodide (client-side Python) — simpler, safer
   - Option B: Sandboxed Docker container — more powerful, complex
   - Recommendation: Start with Pyodide, upgrade later
5. Pre-built code exercises per topic (stored in `TopicContent` as `code` section type)

#### Frontend Steps
1. Benchmark lab page:
   - Upload metrics form
   - Speed improvement bar chart
   - Memory reduction gauge
   - Trade-off comparison table
2. Code runner component:
   - Monaco Editor with Python syntax
   - "Run" button → Pyodide execution
   - Output panel
   - Pre-loaded exercises from topic content

#### Deliverables
- ✅ Users can upload and visualize benchmark results
- ✅ Embedded Python runner for hands-on learning
- ✅ Pre-built exercises for each topic

---

### 🔹 PHASE 10 — Advanced Features & Polish (Week 19–22)

**Goal**: Architecture playground, interview mode, journal, ranking, offline, deployment.

#### Steps
1. **Architecture Design Playground**
   - Drag-and-drop canvas (React DnD / reactflow)
   - Pre-built component library (Dense layer, Attention, MoE, Router, etc.)
   - Simulate: show estimated params, FLOPs, memory
   - Compare architectures side-by-side

2. **AI Interview Mode**
   - Structured interview flow: intro → questions → follow-ups → evaluation
   - Types: ML engineer, systems design, optimization challenge
   - Scoring rubric with AI evaluation

3. **Learning Journal**
   - Rich text editor (TipTap/Lexical)
   - Per-topic notes
   - Auto-translate journal entries via Bhashini
   - Export as PDF

4. **Performance Ranking**
   - Leaderboard (opt-in)
   - Rank dimensions: concept, architecture, optimization, debugging
   - Weekly ranking updates

5. **Offline Mode**
   - Service worker registration
   - Pre-cache viewed topics
   - IndexedDB for offline quiz attempts
   - Sync when back online

6. **Deployment & DevOps**
   - Docker Compose for local dev
   - CI/CD with GitHub Actions
   - Production: NGINX reverse proxy, Gunicorn, PostgreSQL, Redis
   - Environment-based config
   - Database backup strategy

#### Deliverables
- ✅ Architecture playground for visual system design
- ✅ AI interview simulator
- ✅ Personal learning journal with translation
- ✅ Opt-in leaderboard
- ✅ Offline capability for core features
- ✅ Production-ready deployment pipeline

---

## 📊 Phase Summary Table

| Phase | Name | Weeks | Key Outcome |
|-------|------|-------|-------------|
| 1 | Foundation & Auth | 1–2 | Auth, theme, i18n skeleton, shell UI |
| 2 | Topic Engine | 3–4 | Modular content system, admin panel |
| 3 | Translation System | 5–6 | Bhashini integration, 3-tier cache |
| 4 | Quiz Engine | 7–8 | Multi-type quizzes, AI evaluation |
| 5 | Visual Learning | 9–10 | GSAP animations for AI concepts |
| 6 | Progress & Analytics | 11–12 | Dashboard, badges, gamification |
| 7 | Adaptive Roadmap | 13–14 | Personalized learning paths |
| 8 | AI Mentor | 15–16 | Embedded context-aware mentor |
| 9 | Benchmark Lab | 17–18 | Code runner, perf benchmarking |
| 10 | Advanced & Deploy | 19–22 | Playground, interview, offline, prod |

---

## 🎯 Architecture Principles

1. **Module Independence**: Each feature module can be developed, tested, and deployed independently
2. **Cache-First**: Every data path checks cache before DB before external API
3. **Content-Code Separation**: Topic content is data, not code — admin-editable without deploys
4. **Progressive Enhancement**: Core learning works without animations. Animations enhance, not gate.
5. **API-First**: Backend is a pure REST API. Frontend is a separate SPA. No server-side rendering coupling.
6. **Type Safety**: Pydantic schemas on backend, TypeScript (optional) on frontend
7. **Test Coverage**: Each module has its own test suite; CI blocks merge without passing tests
8. **Observability**: Structured logs, error boundaries, health checks from Phase 1

---

## 🔑 Key Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| State management | Zustand | Lightweight, no boilerplate vs Redux |
| Animation | GSAP | Most performant, timeline control, ScrollTrigger |
| Charts | Recharts | React-native, composable, responsive |
| Code editor | Monaco Editor | VS Code engine, syntax + intellisense |
| Python sandbox | Pyodide (Phase 9) | Client-side, no server infra needed |
| DB ORM | SQLAlchemy 2.0 async | Native async, mature, Alembic migrations |
| Task queue | Celery + Redis | Battle-tested, shared Redis instance |
| Translation cache | Redis → PostgreSQL → Bhashini | 3-tier: speed → durability → source |
| CSS framework | TailwindCSS | Utility-first, fast prototyping, tree-shaking |

---

> **Next Step**: Begin Phase 1 implementation. Set up the project scaffolding, initialize both frontend and backend, and deliver a working auth flow with dark/light mode.

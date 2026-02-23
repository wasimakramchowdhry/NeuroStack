# 🌍 NeuroStack — Phase 3 Plan: Multilingual Translation System

> **Goal**: Implement the Bhashini API to provide high-quality localized learning content in 22 Indian languages. All requested translations should be persistently cached in the database (via a translation cache table/Redis) to minimize external API costs and latency.

---

## 🏗 Sub-Phase 3.1: Translation Caching System

To avoid hitting the Bhashini API for every user request, we need a robust caching mechanism in the database.

### Table: `topic_translations`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | Primary Key, Default: uuid4 | Unique translation identifier |
| `topic_id` | UUID | Foreign Key (`topics.id`), Cascade Delete | The base topic being translated |
| `language_code`| String(10) | Not Null | ISO language code (e.g., `hi`, `ta`, `mr`) |
| `title` | String | Not Null | Translated topic title |
| `is_stale` | Boolean | Default: False | Flag indicating the base topic changed |
| `created_at` | DateTime | Default: NOW() | Initial translation timestamp |
| `updated_at` | DateTime | Default: NOW(), OnUpdate: NOW() | Last update timestamp |

### Table: `topic_content_translations`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | Primary Key, Default: uuid4 | Unique translation block identifier |
| `content_id` | UUID | Foreign Key (`topic_contents.id`), Cascade Delete | The specific section being translated |
| `language_code`| String(10) | Not Null | ISO language code |
| `translated_json`| JSONB | Not Null | The translated text block (preserving markdown/math where applicable) |

### Table: `ui_translations`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `key` | String | Primary Key | UI string key (e.g., `button.login`) |
| `language_code`| String(10) | Primary Key | ISO language code |
| `value` | String | Not Null | Translated UI string |

### Architecture: 3-Tier Caching System
1. **Redis (Hot Cache)**: In-memory cache for immediate retrieval of frequently accessed translations (`GET /api/topics/{id}/translated?lang=hi`).
2. **PostgreSQL (Warm Cache)**: Persistent storage (`topic_translations` tables) to survive Redis evictions.
3. **Bhashini API (Cold Source)**: Only queried when both Redis and Postgres miss.

### Backend Logic Constraints
- **Markdown Safety**: The external Translation API must *only* translate the textual content. Code blocks, Math formulas (LaTeX), and component IDs must be strictly preserved and regex-filtered out prior to dispatch to the API.
- **Cache Invalidation**: When an Admin updates a `Topic` or `TopicContent` block (from the Phase 2 Admin Editor), the corresponding `is_stale` flags for all languages must be set to `True`.

---

## ⚙️ Sub-Phase 3.2: Bhashini API Integration (FastAPI)

1. **Service Layer & Bhashini Client (`bhashini.py`)**
   - Implement an external API client that authenticates with the Bhashini gateway.
   - **Client Requirements**: Must include API key management, Language pair configuration, robust Error handling + Retry logic, and outgoing Rate limiting.
   - Batching: Support translating arrays of text blocks simultaneously to reduce HTTP overhead.

2. **Celery Worker Tasks (`translation_tasks.py`)**
   - Implement `translate_topic_async(topic_id, target_language)` as a background Celery task so the user/admin doesn't experience hanging HTTP requests during bulk translations.

3. **Translation Endpoints**
   - `POST /api/v1/translations/topic/{topic_id}?lang={code}` (Admin): Dispatches the Celery task to force-refresh a translation.
   - `GET /api/v1/ui-translations?lang={code}`: Endpoint for the React frontend to fetch static UI dictionary strings.
   - `GET /api/v1/topics/{slug}?lang={code}` (Updated Learner Route):
     - Check Redis → Check DB.
     - **Cache Miss**: Dispatch async Celery translation task to Bhashini API, return standard English content immediately with a `"translation_pending": true` flag to the frontend.

---

## 🎨 Sub-Phase 3.3: Frontend UI/UX for Multilingualism

1. **Global Language Selector & Store (`i18n`)**
   - Expand the i18n system (`react-i18next`) to load `ui_translations` from the new `/api/v1/ui-translations` endpoint.
   - Update the existing Navbar language selector to dispatch to the Zustand `languageStore`.
   - **Persistence**: Immediately trigger a `PATCH /api/v1/users/me` request to persist the user's `preferred_language` to their database profile.
   - **Offline Mode**: Cache the fetched translations in the browser's `localStorage` for fast offline loading and resilient session states.

2. **Topic Viewer Adjustments (`TopicViewer.tsx`)**
   - Integrate a loading spinner specifically designed for the "Translation in progress..." state (for cache misses).
   - Ensure the `react-markdown` and `rehype-katex` renderers gracefully handle right-to-left (RTL) scripts if applicable.

3. **Admin Dashboard Translation Manager (`/admin/translations`)**
   - **New Admin View**: A table listing all existing topics juxtaposed with checkboxes/status columns for all 22 supported languages.
   - **Features**:
     - *Bulk Translate*: Admin can select a Topic and click "Generate Marathi Translation".
     - *Stale Indicator*: Visually warn Admins if a translated topic is out of sync with the english base text (using the `is_stale` flag).

---

## 🔄 Integration & Verification Plan

1. **Translation Accuracy & Markdown Safety Verification**:
   - Create a test topic with heavy LaTeX `\sum_{i=0}^n` and Python `def init()` blocks.
   - Request translation to Hindi (`hi`).
   - *Pass Condition*: The resulting Hindi text is accurate, the Math renders flawlessly, and the Python syntax is untouched.

2. **End-to-End Cache Testing**:
   - **Action**: User requests `/topics/attention-mechanism?lang=ta` (Tamil).
   - **Verify 1**: Network log shows ~2000ms response (Cache Miss hitting Bhashini API).
   - **Action**: Refresh page.
   - **Verify 2**: Network log shows < 150ms response (Cache Hit from Postgres).

3. **Admin Invalidations**:
   - Edit the English source of a translated topic to simulate a typo fix.
   - Verify the Admin Translation Manager flags the Tamil translation as "Stale".
   - Regenerate the translation and verify the Learner view receives the new text.

4. **Automated Testing Suite**:
   - Write comprehensive Pytest suites for the Translation Module.
   - **Requirement**: Use Python's `unittest.mock` to intercept Bhashini HTTP requests and return simulated translations so that the CI pipeline remains fast and stable without draining the external API budget.

---

## 🏆 Phase 3 Deliverables Checklist (To Execute)
- [ ] Database Schema updates (Alembic migration for 3 Translation tables).
- [ ] Bhashini API Client wrapper (`bhashini.py`) in FastAPI backend.
- [ ] Celery + Redis integration for background worker tasks (`translate_topic_async`).
- [ ] Refactored `GET /topics` routes to conditionally inject cached translations (Redis → DB).
- [ ] Language Selector hooked up to `react-i18next` and Zustand `languageStore` on the Frontend allowing UI string translation.
- [ ] Admin Translation Manager UI explicitly built (Create Translation, View Cache Status, Bulk Update).

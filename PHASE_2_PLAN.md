# 🧠 NeuroStack — Phase 2 Plan: Topic Engine & Content System

> **Goal**: Build a highly modular, data-driven Topic Engine. Content (text, code, math, visuals) should be stored structurally in the database—not hardcoded in the frontend—to allow easy updates, multi-language translation (Phase 3), and adaptive quiz generation (Phase 4).

---

## 🏗 Sub-Phase 2.1: Database Schemas & Models

### Table: `topics`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | Primary Key, Default: uuid4 | Unique topic identifier |
| `title` | String | Not Null | Display title (e.g., "Transformer Architecture") |
| `slug` | String | Unique, Not Null | URL-friendly identifier (e.g., "transformer-architecture") |
| `module` | String | Not Null | Category (e.g., "Fundamentals", "LLMs", "Optimization") |
| `difficulty` | Enum | Not Null | `beginner`, `intermediate`, `advanced` |
| `order` | Integer | Not Null | Sorting order within the module |
| `is_published` | Boolean | Default: False | Draft vs Live status |
| `created_at` | DateTime | Default: NOW() | Creation timestamp |
| `updated_at` | DateTime | Default: NOW(), OnUpdate: NOW() | Last update timestamp |

### Table: `topic_contents`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | Primary Key, Default: uuid4 | Unique section identifier |
| `topic_id` | UUID | Foreign Key (`topics.id`), Cascade Delete | The topic this section belongs to |
| `section_type` | Enum | Not Null | The type of content to render |
| `content_json` | JSONB | Not Null | The actual content (e.g., text, code, image URLs) |
| `order` | Integer | Not Null | The vertical display order of the section |

**Allowed `section_type` Values**:
- `concept`: Standard markdown text (with LaTeX math support)
- `visual`: Placeholder reference to a GSAP animation scene (Phase 5)
- `code`: Code blocks (Python, CUDA, etc.) needing syntax highlighting
- `architecture`: Diagram references (Mermaid or SVG/image path)
- `math`: Dedicated standalone formula display
- `implementation`: Step-by-step code implementation guide
- `benchmark`: Performance metrics or hardware comparison tables
- `reflection`: A short interactive thought-experiment prompt

### Pydantic Schemas (FastAPI Models)
- **`TopicBase`**: `title`, `slug`, `module`, `difficulty`, `order`, `is_published`
- **`TopicCreate`** / **`TopicUpdate`**
- **`TopicDetailResponse`**: Topic metadata + list of ordered `TopicContent` objects.
- **`TopicContentBase`**: `section_type`, `content_json`, `order`

---

## ⚙️ Sub-Phase 2.2: Backend API Endpoints (FastAPI)

1. **Admin CRUD (Protected by Admin Role)**
   - Requires a new FastAPI dependency: `get_admin_user` which checks if `user.role == 'admin'`.
   - `POST /api/v1/topics/`: Create a new topic.
   - `PUT /api/v1/topics/{id}`: Update topic metadata.
   - `DELETE /api/v1/topics/{id}`: Delete a topic.
   - `POST /api/v1/topics/{topic_id}/content`: Add/update sections (batch update `topic_contents` for a topic).

2. **Public / Learner Endpoints (Protected by Learner Role)**
   - `GET /api/v1/topics/`: List all published topics. Supports query parameters: `?module=LLMs&difficulty=beginner&page=1&limit=20`. Should use pagination.
   - `GET /api/v1/topics/{slug}`: Fetch a single topic by its slug, including all ordered `topic_contents` representing the page body.

3. **Seeding Script**
   - Create `scripts/seed_topics.py` to auto-populate the database with 2–3 starter topics (e.g., "Linear Algebra Refresher", "Attention is All You Need") so the frontend has immediate data to test.

4. **Testing**
   - Add Pytest coverage for: Topic pagination, Admin role restrictions, and exact ordering of content sections.

---

## 🎨 Sub-Phase 2.3: Frontend UI Components (React/Vite)

1. **Topic List Page (`/topics`)**
   - **Filters**: Module dropdown, Difficulty pills (Beginner/Intermediate/Advanced).
   - **`TopicCard` Component**: 
     - Displays title, module, difficulty badge.
     - Click to navigate to `/topics/:slug`.
     - *Future*: Progress bar % integration (Phase 6).

2. **Topic Viewer Page (`/topics/:slug`)**
   - **Breadcrumb Navigation**: `Library > LLMs > Transformer Architecture`
   - **Dynamic Section Renderer (`TopicViewer`)**: Iterates through the fetched `topic_contents` array and renders a specific UI component based on `section_type`:
     - **`concept` / `math`**: Rendered safely using `react-markdown` + `rehype-katex` + `remark-math`.
     - **`code`**: Rendered using a syntax highlighter (e.g., PrismJS or Highlight.js) with a native "Copy Code" button styled in the Neo-tactoid theme.
     - **`visual` / `architecture`**: Renders an empty placeholder Neumorphic box saying "Animation/Diagram: [content_json context] (Phase 5)".
   - **⚡ Performance Budget (Code-Splitting)**: To prevent massive bundle sizes (Mistake #7 in Master Plan), the heavy Markdown and Syntax Highlighting libraries *MUST* be lazy-loaded using React `Suspense` and `lazy()`, so they only load when the user actually navigates to a topic.

3. **Admin Panel**
   - A basic dashboard available only to admin users.
   - Form to create/edit topics.
   - Form to manage the array of `topic_contents` (add text block, add code block, reorder blocks).

---

## 🔄 Integration & Verification Plan

1. **Manual Testing Loop**:
   - [x] Run `python scripts/seed_topics.py` (added full mock dataset with dynamic contents)
   - [x] Log in to the frontend as a learner/admin
   - [x] Navigate to the `/topics` library, filter by "Fundamentals".
   - [x] Click a topic card, verify the URL slug router works.
   - [x] Verify the `TopicViewer` perfectly renders intermixed Markdown text and Python code blocks sequentially matching the database `order`.

2. **Observability Checklist**:
   - [x] Verify that adding a heavy markdown topic doesn't drastically slow down the React render.
   - [x] The backend `GET /api/v1/topics/{slug}` should execute in < 150ms.

---

## 🏆 Phase 2 Completion Checklist (Executed)
✅ **Database & FastAPI**: Implemented `Topic`, `TopicContent`.
✅ **Pytest Suite**: Wrote `test_topics.py` utilizing synchronous `TestClient` (to avoid asyncpg event-loop collisions on Windows) mimicking learner vs. admin rights.
✅ **Topic Content System (Public)**: Built the `/topics/:slug` View Topic feature with fully modular React component routing for dynamic code block rendering, math LaTeX parsing (`rehype-katex`), and MD display for standard learners.
✅ **Admin Editor (Management)**: Designed the `/admin/topics` suite, including the Create New Topic feature and Edit Topic functionality. Covered dynamic UI updates, nested section drafting, `PUT` requests for updating topics, and the `DELETE` handler.
✅ **UX/UI Adjustments**: Resolved `className` prop typing errors in standard loading skeletons and ensured proper Auth redirection across component states.



wasim akram shaikh
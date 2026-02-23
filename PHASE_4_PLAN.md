# 🎓 NeuroStack — Phase 4 Plan: Quiz & Self-Testing Engine

> **Goal**: Build a highly dynamic, multi-format quizzing ecosystem that seamlessly integrates with the Topic Engine. This phase introduces adaptive difficulty, a comprehensive tracking system for attempts, and an extensible AI Evaluator service to grade non-trivial answers (like code blocks and free-form text).

---

## 🏗 Sub-Phase 4.1: Database Schemas & Models

To support complex question logic and progress tracking, we will introduce four core tables.

### Table: `quizzes`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | Primary Key, Default: uuid4 | Unique quiz identifier |
| `topic_id` | UUID | Foreign Key (`topics.id`), Cascade Delete | The parent topic this quiz tests |
| `title` | String | Not Null | Display title (e.g., "Transformer Quiz 1") |
| `difficulty` | Enum | Not Null | Base difficulty: `beginner`, `intermediate`, `advanced` |
| `is_published` | Boolean | Default: False | Draft vs Live status |
| `created_at` | DateTime | Default: NOW() | Creation timestamp |
| `updated_at` | DateTime | Default: NOW(), OnUpdate: NOW() | Last update timestamp |

### Table: `questions`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | Primary Key, Default: uuid4 | Unique question identifier |
| `quiz_id` | UUID | Foreign Key (`quizzes.id`), Cascade Delete | Parent quiz identifier |
| `type` | Enum | Not Null | `mcq`, `code_completion`, `short_answer`, `architecture`, `scenario_analysis` |
| `content_json`| JSONB | Not Null | The prompt, options array (if MCQ), or starter code |
| `correct_answer`| String/JSONB | Not Null | The exact match string, regex, or logic dict needed to pass |
| `difficulty` | Integer | Default: 1 | Fine-grained difficulty score for adaptive routing |
| `explanation` | String | Nullable | Detailed breakdown shown after the quiz is submitted |
| `order` | Integer | Not Null | Display sequence |

### Table: `quiz_attempts`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | Primary Key, Default: uuid4 | Unique attempt session |
| `user_id` | UUID | Foreign Key (`users.id`), Cascade Delete | Learner taking the quiz |
| `quiz_id` | UUID | Foreign Key (`quizzes.id`), Cascade Delete | The quiz attempted |
| `score` | Float | Nullable | Percentage or raw score (calculated on submit) |
| `started_at` | DateTime | Default: NOW() | Timestamp when `/start` was hit |
| `completed_at` | DateTime | Nullable | Timestamp when `/submit` was hit |

### Table: `question_responses`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | Primary Key, Default: uuid4 | Unique response record |
| `attempt_id` | UUID | Foreign Key (`quiz_attempts.id`), Cascade Delete | The parent session |
| `question_id` | UUID | Foreign Key (`questions.id`), Cascade Delete | The specific question |
| `user_answer` | String/JSONB | Not Null | The payload the user submitted |
| `is_correct` | Boolean | Not Null | Evaluated success |
| `ai_feedback` | String | Nullable | Specific LLM/Evaluator feedback for this answer |

---

## ⚙️ Sub-Phase 4.2: Backend API Architecture (FastAPI)

### 1. AI Evaluator Service (`evaluator.py`)
A modular grading logic pipeline that routes verification based on `question.type`:
- **MCQ**: Simple `str == str` or `array == array` comparison.
- **Code Completion**: Basic syntax linting + fuzzy output matching.
- **Short Answer / Scenario**: **Local AI Evaluation via Ollama**.
  - Given the system hardware (i9-12900H, 32GB RAM, 8GB VRAM GPU), we will run a local open-weights LLM (like `llama3:8b` or `mistral:7b` quantified to 4-bit/8-bit to fit easily in VRAM while utilizing the heavy RAM for context).
  - The FastAPI backend will make an async HTTP call to the local Ollama daemon (`http://localhost:11434/api/generate` or its OpenAI-compatible `/v1/chat/completions` endpoint).
  - **Prompt Engineering**: The LLM will be strongly prompted to return a precise JSON schema containing `{"is_correct": boolean, "feedback": "string explaining why"}` based on semantic similarity to the hidden `correct_answer`.

### 2. AI Quiz Generator Service (`generator.py`)
To vastly accelerate content creation, the Admin UI can request Ollama to scan an existing `Topic` and auto-generate questions.
- **Input**: The concatenated JSON/Markdown texts from a topic's `topic_contents`.
- **Prompt**: "You are an expert AI professor. Generate 3 MCQs and 1 Short Answer question based solely on the provided text. Return a strict JSON array matching our database schema."
- **Output**: An array of `Question` objects that the Admin can review, edit, and then save to the database.

### 3. Admin CRUD Endpoints
Protected by `get_current_admin_user`.
- `POST /api/v1/quiz/` - Create a new empty quiz container.
- `PUT /api/v1/quiz/{quiz_id}` - Update metadata (title, difficulty, publish status).
- `DELETE /api/v1/quiz/{quiz_id}` - Remove a quiz.
- `POST /api/v1/quiz/{quiz_id}/questions` - Batch update or append to the `questions` array.
- **`POST /api/v1/quiz/generate/{topic_id}` - NEW: Triggers the LLM Generator service.** returns draft questions.

### 4. Learner Quiz Engine Endpoints
Protected by `get_current_user`.
- `GET /api/v1/quiz/topic/{topic_id}` - Fetch all published quizzes associated with a Topic.
- `POST /api/v1/quiz/{quiz_id}/start` - Instantiates a `QuizAttempt` row and returns the array of Questions **WITHOUT** the `correct_answer` or `explanation` fields.
- `POST /api/v1/quiz/attempt/{attempt_id}/submit` - Receives an array of `{question_id, user_answer}` pairs.
  - Iterates through the answers, calls the `evaluator.py` service.
  - Generates `question_responses` rows.
  - Calculates the final `score` and sets `completed_at`.
  - Returns the computed results, including correct answers, explanations, and AI feedback.

---

## 🎨 Sub-Phase 4.3: Frontend UI Components (React/Vite)

### 1. User Interface: Quiz Session (`/quiz/session/:attempt_id`)
- **Quiz Shell**: Persistent top header showing `Quiz Title`, `Timer` (count-up or countdown), and a `Progress Bar`.
- **`QuestionRenderer` Component**: A factory component that dynamically renders specific UI blocks based on the question type:
  - `mcq`: Custom Radio groups or Checkbox grids styled with Neumorphic inset shadows.
  - `short_answer`: A responsive `textarea` block.
  - `code_completion`: Embeds `Monaco Editor` or `CodeMirror` configured for Python/JS syntax.
- **Navigation**: "Next", "Previous", and "Submit" buttons that track current local state.

### 2. User Interface: Quiz Results (`/quiz/results/:attempt_id`)
- **Score Header**: Large animated circular progress bar showing the final score percentage.
- **Feedback Accordions**: A vertical list of the questions taken.
  - Green/Red border to indicate Pass/Fail.
  - Expanding the accordion shows the *User's Answer* vs the *Correct Answer*.
  - A highlighted block rendering the `ai_feedback` and the official `explanation` text natively via Markdown.
- **Navigation**: "Back to Topic" or "Retake Quiz" CTAs.

### 3. Admin UI: Quiz Builder (`/admin/quiz`)
To avoid Mistake #5 (No separation of content), Admins need full UI control over the quizzes:
- **Quiz Dashboard**: List of all quizzes mapped to Topics.
- **AI Auto-Generate Magic Button**: A primary CTA when creating a new quiz. Clicking this calls `/api/v1/quiz/generate/{topic_id}`, displaying a shimmering loading state while Ollama streams back suggested, well-formatted questions.
- **Question Editor**: A complex form allowing Admins to accept AI suggestions, manually add/remove questions, set `question_type` from a dropdown, and define the `content_json` payload and `correct_answer` visually.

### 4. Topic Integration (`TopicViewerPage.tsx`)
- Embed a **"Test Your Knowledge"** floating CTA button at the bottom of the Topic Viewer that routes the learner seamlessly into the `/start` API flow for the corresponding Topic.

---

## 🔄 Integration & Verification Plan

1. **Database & Schema Verification**:
   - Verify Alembic generates and applies the migrations perfectly for the 4 new tables.
   - Run Pydantic validation tests to ensure `user_answer` JSON schemas adapt safely to the various question types.

2. **Automated Submission Pipeline (Pytest)**:
   - Create a test `Topic` with an internal `Quiz`.
   - Hit the `/start` endpoint to capture a mock `attempt_id`.
   - Hit `/submit` with intentional right and wrong answers to verify:
     - The AI Evaluator isolates the incorrect short answer and returns feedback.
     - The final score calculation accurately reflects a e.g., 66.6% ratio.

3. **Frontend E2E Test**:
   - Access the Admin Dashboard -> Quiz Builder. Create an MCQ and a Short Answer question.
   - Navigate to the learner Topic Viewer -> click "Test Your Knowledge".
   - Proceed through the UI states (Timer running -> Editor filling -> Submit loading spinner).
   - Arrive at the Results page and visually confirm the red/green Neumorphic highlighting.

---

## 🏆 Phase 4 Deliverables Checklist
- [ ] Environment: Install and start Ollama locally. Pull the inference model (e.g., `ollama run mistral:7b`).
- [ ] Backend: SQLAlchemy models + Alembic migrations for `Quiz`, `Question`, `QuizAttempt`, `QuestionResponse`.
- [ ] Backend: Admin CRUD routes for dynamic Quiz/Question management.
- [ ] Backend: `evaluator.py` Service routing logic interfacing locally with the Ollama REST API.
- [ ] Backend: `generator.py` Service routing logic to auto-suggest questions to Admins via Ollama.
- [ ] Backend: Learner `/start` and `/submit` APIs with proper data masking (never leaking answers early).
- [ ] Frontend: `QuestionRenderer` component supporting markdown, radios, and code editors.
- [ ] Frontend: `QuizSessionPage` handling local state, navigation, and timers.
- [ ] Frontend: `QuizResultPage` accurately painting pass/fail cards with AI context.
- [ ] Frontend: Admin Quiz Editor UI featuring the "AI Auto-Generate" magic button.
- [ ] Frontend: Seamless linkage from existing `TopicViewer` context into the Quiz flow.

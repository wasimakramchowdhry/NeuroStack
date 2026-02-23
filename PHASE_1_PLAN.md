# 🚀 Phase 1: Foundation & Auth (Detailed Plan)

> **Timeline**: Week 1–2
> **Goal**: Establish the project scaffolding, database schemas, authentication flow, and a strict **Neo-tactoid (Neumorphic)** frontend design system based on the provided reference.

---

## 🎨 1. Frontend UI/UX Design System (Neo-tactoid UI)

Based on the provided inspiration, we are moving away from flat design and generic blues, embracing a "Calm, original mood" with tactile, physical-feeling components.

### 🎨 Color Palette
| Intent | Color Code | Description |
|--------|------------|-------------|
| **Background (Light)** | `#EDF1F4` | Very light, cool grayish-white. Essential for neumorphism shadows to work. |
| **Accent Primary** | `#FF7A30` | Soft, warm energetic orange (used for primary 'Default' action buttons). |
| **Accent Secondary** | `#4A4D57` | Dark slate gray (used for 'Hover' or 'Elevation' states). |
| **Accent Success** | `#22C55E` | Bright green (used for active toggles). |
| **Focus Ring** | `#A5B4FC` | Soft periwinkle/indigo (avoiding generic blue) for input focus rings. |
| **Text Primary** | `#1E293B` | Very dark slate for high contrast readability. |
| **Text Secondary** | `#64748B` | Muted slate for labels and placeholders. |

### 🧊 Component Stylings (TailwindCSS approach)

To achieve the "Neo-tactoid" (Neumorphism) look, we rely heavily on paired box-shadows (one light for the highlight, one dark for the shadow).

1. **Elevation (Cards & Buttons)**:
   - *Base Card*: `bg-[#EDF1F4] rounded-2xl shadow-[6px_6px_12px_#cbced1,-6px_-6px_12px_#ffffff]`
   - *Glowing Edge Card*: Same as above, but with a subtle inner border or `box-shadow: inset 1px 1px 2px white`.
   - *Primary Button (Orange)*: `bg-[#FF7A30] text-white rounded-full shadow-[4px_4px_8px_#cbced1,-4px_-4px_8px_#ffffff]`

2. **Pressed / Inset States (Inputs & Active States)**:
   - *Inputs*: `bg-[#EDF1F4] rounded-xl shadow-[inset_4px_4px_8px_#cbced1,inset_-4px_-4px_8px_#ffffff] focus:ring-2 focus:ring-[#A5B4FC]`
   - Focus rings are *always* strictly visible for accessibility.
   - Disabled inputs reduce contrast and remove shadows completely.

3. **Toggles & Sliders**:
   - *Toggle Track (Off)*: Inset shadow track `shadow-[inset_2px_2px_5px_#cbced1,inset_-3px_-3px_7px_#ffffff]`.
   - *Toggle Knob*: Protruding circle `shadow-[2px_2px_5px_#cbced1,-2px_-2px_5px_#ffffff]`.
   - Sliders feature subtle tick marks for precision.

4. **Modals (Micro-dialogs)**:
   - Card floats above a backdrop module that *softly dims* the background natively (e.g., `backdrop-blur-sm bg-slate-900/20`).

---

## 🗄️ 2. Database Schema (PostgreSQL)

For Phase 1, we only need the user authentication and preferences foundation.
*Using SQLAlchemy 2.0 ORM.*

### Table: `users`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | Primary Key, Default: uuid4 | Unique user identifier |
| `email` | String(255) | Unique, Not Null, Indexed | User's login email |
| `full_name` | String(255) | Not Null | User's display name |
| `password_hash` | String(255) | Not Null | Bcrypt hashed password |
| `role` | Enum | Default: `'learner'` | Roles: `'admin'`, `'learner'` |
| `preferred_language`| String(10) | Default: `'en'` | ISO code (e.g., `'en'`, `'hi'`, `'ta'`) |
| `created_at` | DateTime | Default: `now()` | Account creation timestamp |
| `updated_at` | DateTime | Default: `now()`, on_update | Last update timestamp |

*(Note: We will use stateless JWTs for session management, so there is no `sessions` table required at this stage. We rely on short-lived access tokens and longer-lived, rotation-based refresh tokens stored in HTTP-Only cookies.)*

### Pydantic Schemas (Request/Response Models)
To ensure type safety and automatic OpenAPI documentation, we define these core schemas:
- **`UserCreate`**: `email` (EmailStr), `full_name` (str, min 2), `password` (str, min 8), `preferred_language` (str, default 'en').
- **`UserResponse`**: `id` (UUID), `email` (str), `full_name` (str), `role` (str), `preferred_language` (str), `created_at` (datetime). Password hash is *strictly excluded*.
- **`Token`**: `access_token` (str), `token_type` (str).
- **`UserUpdate`**: Optional fields `full_name` and `preferred_language`.

---

## 🔌 3. Backend Endpoints (FastAPI)

All endpoints will be prefixed with `/api/v1`.

### Auth Module (`/api/v1/auth`)

1. `POST /register`
   - **Request body**: `email`, `full_name`, `password`, `preferred_language`
   - **Response**: `201 Created` with `user` object.
   - **Logic**: Validates email format, hashes password via passlib/bcrypt, saves to DB.

2. `POST /login`
   - **Request**: `OAuth2PasswordRequestForm` (`username` maps to `email`, `password`)
   - **Response**: `200 OK`
   - **Body**: `{ "access_token": "jwt...", "token_type": "bearer" }`
   - **Headers**: Sets `Set-Cookie: refresh_token=...; HttpOnly; Secure; SameSite=Strict`

3. `POST /refresh`
   - **Request**: Reads `refresh_token` from HttpOnly Cookie.
   - **Response**: `200 OK` with new `access_token`.

4. `POST /logout`
   - **Request**: Requires auth.
   - **Response**: `200 OK`.
   - **Logic**: Clears the `refresh_token` HTTP-Only cookie.

### Users Module (`/api/v1/users`)

1. `GET /me`
   - **Requires Auth**: Yes (Bearer Token)
   - **Response**: `200 OK` with User Profile (`id`, `email`, `full_name`, `role`, `preferred_language`).

2. `PATCH /me`
   - **Requires Auth**: Yes
   - **Request body**: Partial updates allowed (`full_name`, `preferred_language`).
   - **Response**: `200 OK` with updated User Profile.

### Diagnostics & Observability

1. `GET /health`
   - **Response**: `200 OK` `{"status": "healthy", "db": "connected"}`

2. **Logging Middleware**
   - Intercepts all requests to log `[method] [path] [status_code] [process_time_ms]`
   - Essential for Phase 1 as per the "No Observability" mistake fix in our Master Plan.

3. **Rate Limiting**
   - Apply basic IP-based rate-limiting to `/register` and `/login` (e.g., 5 attempts / minute) using `slowapi`.

---

## 🛠️ 4. Step-by-Step Implementation Guide

### Step 1: Backend Setup
1. Create `backend/` folder.
2. Setup virtual environment: `python -m venv venv`.
3. Install dependencies: `fastapi`, `uvicorn`, `sqlalchemy`, `asyncpg`, `alembic`, `pydantic`, `pydantic-settings`, `passlib[bcrypt]`, `python-jose[cryptography]`.
4. Create `app/database.py` with SQLAlchemy async engine connected to PostgreSQL.
5. Setup Alembic: `alembic init -t async alembic`. Configure `env.py` to auto-generate migrations.
6. Create the `User` SQLAlchemy model.
7. Generate and run the first migration: `alembic revision --autogenerate -m "Init users" && alembic upgrade head`.

### Step 2: Authentication Logic
1. Create `app/core/security.py` for JWT signing and password hashing.
2. Create `app/modules/auth/router.py` containing `/login`, `/register`, `/refresh`.
3. Create generic dependency `get_current_user` in `app/core/dependencies.py` to parse JWT and fetch user from DB.
4. Mount routers in `app/main.py`.

### Step 3: Frontend Scaffolding
1. Create `frontend/` folder with Vite: `npm create vite@latest . -- --template react`.
2. Install dependencies: `npm i react-router-dom axios zustand clsx tailwind-merge lucide-react react-hook-form @hookform/resolvers zod`.
3. Install TailwindCSS: `npm install -D tailwindcss postcss autoprefixer` and `npx tailwindcss init -p`.
4. Configure Tailwind theme in `tailwind.config.js` with the custom colors (`neo-bg`, `neo-accent-orange`, `neo-accent-primary`) and custom box-shadows needed for the neumorphic design.

### Step 4: The Neo-Tactoid UI Component Library
Create reusable components in `frontend/src/components/ui`:
1. `NeoCard.jsx`: Wrapper for panels with the protruding shadow.
2. `NeoInput.jsx`: Text input with inset shadow and focus ring.
3. `NeoButton.jsx`: Buttons supporting `default` (orange), `secondary` (dark slate), and `loading` states.
4. `NeoToggle.jsx`: The custom pill-shaped toggle switch.
5. Create layout shell (`frontend/src/components/layout/Shell.jsx`) with sidebar containing navigation icons (Home, Components, Profile).

### Step 5: Frontend Auth Pages & Logic
1. Create `frontend/src/store/authStore.js` (Zustand) to manage `user` and `accessToken`.
2. Create `axios` interceptor in `frontend/src/services/api.js` to automatically attach the Bearer token, and catch `401` errors to hit the `/refresh` endpoint automatically.
3. Build `LoginPage.jsx` and `RegisterPage.jsx` using the Neo-tactoid UI components.
4. Build a protected route wrapper `<ProtectedRoute>` that redirects to login if unauthenticated.
5. Connect frontend forms to the FastAPI backend.

### Step 6: Observability & CI/CD (Crucial from Master Plan)
1. Configure Python logging with structured formats (Loguru or standard `logging`).
2. Add rate-limiting middleware (`slowapi`) to the FastAPI app, protecting auth routes.
3. Write GitHub Actions workflow (`.github/workflows/ci.yml`) to run DB migrations in a specialized test container, execute Pytest, and run ESLint on the frontend on every push to `main` or Pull Request.
4. Set up an `.env.example` file documenting required keys (`DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGINS`).

### Step 7: Final Polish & Verification
1. Ensure the background color matches perfectly to allow shadows to blend seamlessly.
2. Test responsive layout (collapse sidebar to bottom nav on mobile).
3. Verify JWT expiry triggers the silent refresh via HttpOnly cookie.
4. Write basic Pytest tests for backend Auth endpoints.

---

> **Ready for Execution:** With this Phase 1 plan finalized, we are cleared to begin setting up the repository structures and writing code.

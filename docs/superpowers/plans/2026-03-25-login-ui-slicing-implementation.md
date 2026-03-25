# Login UI Slicing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a production-ready `/login` UI (admin-managed users, no self-register, no social login) that matches `login.svg` intent, includes accessible client-side validation stubs, passes lint/build, and updates Jira `SDPR-13` with implementation evidence plus backend handoff documentation.

**Architecture:** First set up deterministic Playwright tooling and tests, then build login-only auth UI primitives and compose `/login` with page-owned state/validation. Keep interactions UI-stub only (no API/auth backend). Produce backend handoff docs for lead programmers and include verification evidence in Jira.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, TailwindCSS v4, ESLint, Playwright

**Kaidah komunikasi wajib:** Semua komentar Jira dan deskripsi PR GitHub ditulis dalam Bahasa Indonesia.

**Referensi sprint aktif (SDPR):**
- Story `SDPR-2`: Sebagai Tim, aku ingin awalan dokumentasi yang jelas
  - Subtask: `SDPR-6`, `SDPR-7`, `SDPR-15`, `SDPR-19`
- Story `SDPR-3`: Sebagai pengguna diriku ingin bisa kedashboard berdasarkan role (Warga, Admin, Sekuriti)
  - Subtask: `SDPR-11`, `SDPR-13`, `SDPR-12`, `SDPR-14`
- Story `SDPR-4`: Sebagai Admin, aku ingin mengelola data Rumah (Blok/No) dan menautkan Resident (User) ke rumah tersebut
  - Subtask: `SDPR-8`, `SDPR-9`, `SDPR-10`, `SDPR-16`

---

### Task 1: Prepare E2E Test Harness (Playwright First)

**Files:**
- Create: `playwright.config.ts`
- Create: `tests/auth-ui.spec.ts`
- Modify: `package.json`

- [ ] **Step 1: Install Playwright tooling**

Run: `npm i -D @playwright/test`
Run: `npx playwright install`

- [ ] **Step 2: Add Playwright scripts**

Add to `package.json`:
- `test:e2e`: `playwright test`
- `test:e2e:ui`: `playwright test --ui`

- [ ] **Step 3: Create `playwright.config.ts` for Next.js app tests**

Include:
- baseURL (`http://127.0.0.1:3000`)
- webServer command (`npm run dev`)
- retries/use config suitable for local CI.

- [ ] **Step 4: Create initial failing tests in `tests/auth-ui.spec.ts`**

Add failing tests for:
- `/login` heading exists
- required selector contract exists:
  - input berlabel `Email`
  - input berlabel `Password`
  - checkbox `Remember me`
  - tombol `Login`
- initial load has no validation errors visible
- submit without touching fields shows required errors.

- [ ] **Step 5: Run tests to verify expected failures**

Run: `npx playwright test tests/auth-ui.spec.ts`
Expected: FAIL because `/login` implementation does not exist yet.

- [ ] **Step 6: Commit**

```bash
git add playwright.config.ts tests/auth-ui.spec.ts package.json package-lock.json
git commit -m "test: setup playwright harness for login ui slicing"
```

### Task 2: Scaffold Login Route and Auth UI Primitives

**Files:**
- Create: `src/app/login/page.tsx`
- Create: `src/components/auth/AuthShell.tsx`
- Create: `src/components/auth/AuthCard.tsx`
- Create: `src/components/auth/AuthInput.tsx`
- Create: `src/components/auth/PasswordField.tsx`
- Create: `src/components/auth/AuthActions.tsx`
- Modify: `src/app/globals.css`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Create minimal `/login` route**

```tsx
export default function LoginPage() {
  return <main><h1>Login</h1></main>
}
```

- [ ] **Step 2: Re-run basic heading test**

Run: `npx playwright test tests/auth-ui.spec.ts -g "heading"`
Expected: PASS

- [ ] **Step 3: Implement split layout and card structure from `login.svg`**

Use `AuthShell` + `AuthCard` with required hierarchy:
- title -> input groups -> primary CTA -> supporting actions.

- [ ] **Step 4: Implement reusable input primitives**

Create `AuthInput`, `PasswordField`, `AuthActions` with typed props and semantic controls.

- [ ] **Step 5: Update home route (`src/app/page.tsx`) to align with login-first flow**

Prefer CTA/link to `/login` to keep app entry coherent.

- [ ] **Step 6: Commit**

```bash
git add src/app/login/page.tsx src/components/auth src/app/globals.css src/app/page.tsx
git commit -m "feat: scaffold login route with reusable auth ui primitives"
```

### Task 3: Implement Login Validation, State Machine, and Status Stubs

**Files:**
- Modify: `src/app/login/page.tsx`
- Modify: `src/components/auth/AuthInput.tsx`
- Modify: `src/components/auth/PasswordField.tsx`
- Modify: `src/components/auth/AuthActions.tsx`
- Modify: `tests/auth-ui.spec.ts`

- [ ] **Step 1: Extend tests with spec-required interaction scenarios (failing first)**

Add tests for:
- blur empty email shows `Email is required.` only
- blur empty password shows `Password is required.` only
- invalid email submit shows `Please enter a valid email address.`
- short password submit shows `Password must be at least 8 characters.`
- forgot-password click shows `Not implemented yet` in page-level `aria-live="polite"` region
- valid submit shows `Auth API not connected yet` in same status region.
- non-regression no-social-login:
  - pastikan tombol/provider `Google`, `Facebook`, `Apple`, `GitHub` tidak ada di halaman.

- [ ] **Step 2: Run targeted tests to confirm failures**

Run: `npx playwright test tests/auth-ui.spec.ts -g "blur empty|required|invalid email|password too short|forgot-password|valid submit"`
Expected: FAIL

- [ ] **Step 3: Implement page-owned form state machine**

Rules:
- `touched[field]` set on blur
- `submitted` set on submit attempt
- field errors shown when `(touched[field] || submitted) && invalid`
- submit button remains enabled; validation in submit handler blocks invalid submit.

- [ ] **Step 4: Implement validation contract and canonical messages**

- email required + `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- password required + min 8 chars
- canonical texts must exactly match spec.

- [ ] **Step 5: Implement accessibility bindings**

Ensure:
- labels for each input
- `aria-invalid` on invalid inputs
- `aria-describedby` to error text
- page-level status area with `aria-live="polite"`.

- [ ] **Step 6: Re-run full test file**

Run: `npx playwright test tests/auth-ui.spec.ts`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/app/login/page.tsx src/components/auth tests/auth-ui.spec.ts
git commit -m "feat: add login validation state machine and accessible status stubs"
```

### Task 4: Responsive Baseline, Screenshots, and Manual A11y Verification

**Files:**
- Modify: `tests/auth-ui.spec.ts`
- Create: `tests/artifacts/login-ui/.gitkeep`

- [ ] **Step 1: Add viewport-specific checks and screenshot capture steps**

Required dimensions:
- mobile `375x812`
- tablet `768x1024`
- desktop `1280x720`

Capture screenshots to:
- `tests/artifacts/login-ui/login-375x812.png`
- `tests/artifacts/login-ui/login-768x1024.png`
- `tests/artifacts/login-ui/login-1280x720.png`

- [ ] **Step 2: Add assertions for layout intent by viewport**

Assert:
- mobile form section appears before decorative section
- tablet/desktop split layout is active
- tablet/desktop form container max width <= 480px
- primary `Login` CTA is present and visually emphasized via dedicated class.

- [ ] **Step 3: Run viewport/screenshot test subset**

Run: `npx playwright test tests/auth-ui.spec.ts -g "viewport|screenshot|layout"`
Expected: PASS

- [ ] **Step 4: Execute manual accessibility checklist**

Manual checks on `/login`:
- keyboard-only tab order follows visual flow
- visible focus ring on inputs, remember-me checkbox, forgot-password control, login button
- no runtime errors in browser during interaction.

- [ ] **Step 5: Record manual verification summary in implementation notes (for Jira)**

Prepare concise pass/fail summary tied to checklist items.

- [ ] **Step 6: Commit**

```bash
git add tests/auth-ui.spec.ts tests/artifacts/login-ui/.gitkeep
git commit -m "test: add responsive baseline checks and screenshot artifacts"
```

### Task 5: Backend Handoff Documentation for Lead Programmers

**Files:**
- Create: `docs/backend/2026-03-25-login-auth-handoff.md`
- Modify: `README.md`

- [ ] **Step 1: Write backend handoff doc**

Include:
- current UI-only behavior and constraints
- draft API contract `POST /auth/login`:
  - request payload (`email`, `password`)
  - success response shape
  - error response shape and mapping to UI messages
- integration checklist for turning stubs into real auth.

- [ ] **Step 2: Add README pointer to backend handoff doc**

Keep concise and discoverable.

- [ ] **Step 3: Commit**

```bash
git add docs/backend/2026-03-25-login-auth-handoff.md README.md
git commit -m "docs: add backend handoff for login auth integration"
```

### Task 6: Final Verification and Jira Comments (SDPR-13)

**Files:**
- No source file changes required unless fixes are discovered.

- [ ] **Step 1: Run final verification commands**

Run: `npm run lint`  
Expected: PASS

Run: `npm run build`  
Expected: PASS

Run: `npx playwright test tests/auth-ui.spec.ts`  
Expected: PASS

- [ ] **Step 2: Prepare Jira implementation comment payload**

Must include:
- instruction recap (login-only, no register, no social login)
- implemented files/routes/components
- command output summary (`lint`, `build`, `playwright`)
- visual verification summary with viewport/screenshot evidence
- domain decision note (admin CRUD-managed users)
- explicit statement: **Definition of Done met**.

- [ ] **Step 3: Post Jira implementation comment to `SDPR-13`**

Use Jira API comment endpoint with structured bullets.

- [ ] **Step 4: Post Jira backend-doc comment to `SDPR-13`**

Must include:
- doc path: `docs/backend/2026-03-25-login-auth-handoff.md`
- target audience: backend/lead programmers
- short next-step handoff note.

- [ ] **Step 5: Final working-tree check**

Run: `git status`  
Expected: clean or only intentional uncommitted changes.

### Task 7: Template Komunikasi Bahasa Indonesia (Jira & PR)

**Files:**
- Create: `docs/backend/templates/2026-03-25-template-komunikasi-jira-pr.md`

- [ ] **Step 1: Tulis template komentar Jira Bahasa Indonesia**

Minimal 2 template:
- template komentar implementasi SDPR-13
- template komentar handoff backend (lead programmer)

- [ ] **Step 2: Tulis template PR GitHub Bahasa Indonesia**

Isi template:
- Judul PR
- Ringkasan perubahan
- Bukti verifikasi (`lint`, `build`, `playwright`)
- Catatan keputusan domain (login-only, admin CRUD users)

- [ ] **Step 3: Commit**

```bash
git add docs/backend/templates/2026-03-25-template-komunikasi-jira-pr.md
git commit -m "docs: tambah template komunikasi jira dan pr berbahasa indonesia"
```

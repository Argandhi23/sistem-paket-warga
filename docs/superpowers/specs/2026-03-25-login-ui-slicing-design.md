# Login UI Slicing Design (Admin-Managed Users)

## Context
- Jira assignee: `Randy Dinky Saputra`
- Current in-progress task: `SDPR-13` (Subtask) - "Slicing UI dengan TailwindCSS"
- Project domain: Sistem Distribusi Paket Rumahan (Perumahan) with admin-managed user CRUD.
- Product decision: public self-register is not required; account creation is handled by admin CRUD.

## Scope
- Build only `/login` page.
- Match key structure and visual intent from `login.svg` using semantic HTML and TailwindCSS.
- Ensure responsive behavior for desktop and mobile.
- Include UI-level login validation and interactions (no backend auth integration yet).
- No social login buttons/providers in UI or code.
- Add Jira comment on in-progress subtask after implementation and verification.

## Design Reference Contract
- Reference asset (root-level):
  - `login.svg`
- Mandatory visual anchors:
  - two-panel composition on desktop/tablet
  - form card hierarchy: title -> input groups -> primary CTA -> supporting actions
  - supporting illustration/decorative panel placement consistent with reference
  - CTA visual priority (primary button stronger than secondary actions)
- Flexible elements (allowed deviations):
  - exact icon vectors and illustration internals
  - exact font family if unavailable in project defaults
  - minor spacing and shadow differences caused by responsive semantic implementation

## Recommended Approach

### Option A (Recommended): Focused Login-Only Components
- Create reusable auth primitives but implement only login flow now.
- Pros: aligned with domain model, less unused code, maintainable.
- Cons: if registration is later needed, new page work is still required.

### Option B: Keep Shared Dual-Mode Auth Foundation
- Build login now but keep `mode` hooks for future register.
- Pros: future extensibility.
- Cons: unnecessary complexity for current requirement.

Recommendation: **Option A**, because it fits current business flow (admin CRUD users + user login only).

## Agreed Design

## 1) Architecture
- Route:
  - `src/app/login/page.tsx`
- Shared components in `src/components/auth/*`:
  - `AuthShell` (shared split layout wrapper)
  - `AuthCard` (form container)
  - `AuthInput` (label + input + helper/error)
  - `PasswordField` (password input with show/hide toggle)
  - `AuthActions` (remember me + forgot-password control)
- Component ownership boundary:
  - shared components: layout and primitive auth UI pieces
  - page-level file: field order, labels, validation schema, submit handler wiring
- Client rendering:
  - `login` page is a client component because it manages local form state and interaction.
- Styling via Tailwind utilities and minimal shared tokens in `src/app/globals.css`.
- SVG is design reference; implementation remains semantic React markup.

## 2) Behavior and UX
- Login form includes:
  - email + password
  - remember me
  - forgot password (link-styled button stub)
  - primary login CTA
- Responsive:
  - mobile (`<768px`): stacked layout, form section first, decorative section placed below
  - tablet/desktop (`>=768px`): split panel layout with fixed form container max width to preserve composition
- Accessibility:
  - labels, focus visibility, keyboard navigation, semantic buttons/links, readable helper/error text

## 2.1) Interaction Stubs
- Forgot password:
  - rendered as link-styled `button type="button"`; click updates page-level `aria-live="polite"` status with: "Not implemented yet".
- Submit placeholder behavior:
  - on valid submit, show temporary success/info text area: "Auth API not connected yet".

## 2.2) Form State Machine
- Local page state flags:
  - `touched[field]`: set on first blur
  - `submitted`: set on submit attempt
- Error visibility rule:
  - show field error when `(touched[field] || submitted) && fieldInvalid`
- Submit policy:
  - submit button stays enabled for accessibility and discoverability
  - on submit, run validation; if invalid, prevent submission and expose all relevant errors
  - if valid, show success/info placeholder (API not connected yet)
- Required behavior scenarios:
  - initial load: no field errors visible
  - blur empty required input: that field error appears
  - submit without touching fields: all required errors appear
  - short password blocks submit and shows error

## 3) Data Flow and Error Handling
- Local controlled form state on login page.
- Submit handler as UI stub for future API wiring.
- Validation rules:
  - email: required and must match `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
  - password: required, minimum 8 characters
- Validation trigger policy:
  - field errors shown after first blur and on submit
  - submit button remains enabled; validation blocks submit in handler when invalid
- Error semantics:
  - invalid fields use `aria-invalid="true"`
  - errors connected with `aria-describedby`
  - include non-blocking submit status/error placeholder area
- Canonical validation messages:
  - email required: "Email is required."
  - email invalid: "Please enter a valid email address."
  - password required: "Password is required."
  - password too short: "Password must be at least 8 characters."

## 3.1) Acceptance Criteria
- Route and rendering:
  - `/login` renders without runtime errors.
- Required UI presence:
  - all fields, labels, CTAs, and helper actions defined in this spec are visible.
- Validation behavior:
  - invalid email blocks submit and shows field error
  - short password (`<8`) blocks submit and shows field error
- Accessibility baseline:
  - every input has an associated visible label
  - keyboard tab order follows visual form flow
  - interactive elements have visible focus styling
- Responsive behavior:
  - at `<768px`, auth form section is displayed before decorative section
  - at `>=768px`, two-column split is active and auth form container max width is `480px`
  - primary CTA uses filled brand style while secondary actions are text or outline style

## 4) Verification Plan
- Run:
  - `npm run lint`
  - `npm run build`
- Manual browser checks:
  - `/login`
  - desktop and mobile viewport behavior
  - keyboard-only tab navigation through all form controls
  - screenshot verification at 375px, 768px, and 1280px widths
  - scenario checklist:
    - login valid/invalid email
    - login password too short

## 4.1) Automated UI Verification (Required)
- Add Playwright tests in `tests/auth-ui.spec.ts` for:
  - route `/login` renders required heading and labeled inputs
  - validation scenarios from section 2.2
  - forgot-password stub click shows `Not implemented yet`
  - valid submit shows `Auth API not connected yet`
- Required selector expectations (role/name first):
  - `/login`:
    - heading contains `Login`
    - input labels: `Email`, `Password`
    - checkbox label: `Remember me`
    - button text: `Login`
- Stable selectors:
  - use semantic role/name first (`getByRole`)
  - add `data-testid` only for non-semantic fallback targets
- Execute automated check:
  - `npx playwright test tests/auth-ui.spec.ts`

## 4.2) Viewport and Screenshot Baseline
- Use exact viewport sizes:
  - mobile: `375x812`
  - tablet: `768x1024`
  - desktop: `1280x720`
- Visual pass criteria:
  - `375x812`: form section appears before decorative section
  - `768x1024` and `1280x720`: split two-panel layout is active
  - primary `Login` button is visually dominant vs secondary controls

## 5) Jira Update Plan
- Add comment to `SDPR-13` with:
  - user instruction recap
  - domain clarification: registration removed because users are admin-managed via CRUD
  - files/routes/components implemented
  - command outputs (lint/build)
  - visual verification summary
  - definition of done confirmation (route complete, responsive, validation, verification passed)

## Out of Scope
- Public self-register page (`/register`)
- Backend authentication endpoints
- Database/user persistence changes
- Session/token management
- Role-based redirect implementation

## Component API Contract
- `AuthShell`
  - props: `title`, `subtitle?`, `children`, `asideVariant` (`login`)
  - responsibility: page-level split layout and decorative/aside rendering
- `AuthCard`
  - props: `title`, `description?`, `children`, `footer?`
  - responsibility: visual container and spacing, no form state
- `AuthInput`
  - props: `id`, `label`, `type`, `value`, `onChange`, `onBlur`, `placeholder?`, `error?`, `required?`
  - responsibility: labeled input and inline helper/error rendering only
- `PasswordField`
  - props: `id`, `label`, `value`, `onChange`, `onBlur`, `error?`, `required?`
  - responsibility: password input + show/hide toggle + error display
- `AuthActions`
  - props: `rememberMe?`, `onRememberMeChange?: (checked: boolean) => void`, `onForgotPasswordClick?: () => void`
  - responsibility: remember/forgot controls
- State ownership:
  - all form values, touched/submitted flags, and validation logic remain in `src/app/login/page.tsx`
  - forgot-password and submit status messages are rendered in page-level status area (`aria-live="polite"`)
  - shared components remain presentational/interaction primitives.

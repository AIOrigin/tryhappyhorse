# Auto SEO / HappyHorse MVP Execution Plan

## TL;DR
> **Summary**: Build an SEO-first English HappyHorse site with Astro + TypeScript, keeping the 6 Must Launch pages while adding an in-site video generation app on `/try-happyhorse/`, a 2-free-generation rule, explicit non-official disclaimers, browser-verified flows, and reusable content/schema conventions for future trend topics.
> **Deliverables**:
> - Astro static-first site scaffold with typed content model, shared page system, and app-ready `/try-happyhorse/` entry
> - 6 Must Launch HappyHorse pages
> - 3 Should Launch supporting pages
> - Frontend-direct generation flow, GA4 event tracking, privacy/compliance baseline, sitemap/robots/canonicals
> - Reusable review cadence, scoring, and page-template artifacts for future topics
> **Effort**: Large
> **Parallel**: YES - 4 waves
> **Critical Path**: 1 → 2 → 3 → 4/5 → 6-11 → 15/17 → F1-F4

## Context
### Original Request
Turn the current directory `README.md` into a spec, then turn that spec into an execution plan.

### Interview Summary
- Scope locked to `HappyHorse 首站 MVP + 可复用 Auto SEO 框架`
- Document language locked to Chinese, while implemented site content targets global English search
- Spec type locked to product requirements
- User then selected `拆成执行计划`

### Architecture Decision
- Use **Astro + TypeScript + static-first output** as the v1 stack
- Use **npm** as the package manager default
- Use **MDX content collections** for page content and metadata
- Use **GA4** as the sole analytics provider in v1
- Use a **browser-side integration to the existing generation API** on `/try-happyhorse/`, based on the user statement that the API can be called directly from the frontend
- Keep **lead capture optional**, only as a secondary fallback if later needed
- Use **Vercel static deployment** as the default hosting target

### Clarified Product Direction
- Product is no longer only a static SEO + lead-capture site
- Product is now an SEO-first content site plus an in-site video generation app
- `/try-happyhorse/` is the canonical app/access entry for MVP
- Each user can generate up to 2 free videos
- Current implementation assumption: the existing API is called directly from the frontend
- Documented risk, but not a blocker to planning: direct frontend API usage may expose client-visible integration constraints such as CORS, public-safe credentials, quota abuse, or weak rate limiting. The plan must surface these risks without overturning the user-provided constraint.

### Metis Review (gaps addressed)
- Treated `.sisyphus/drafts/auto-seo-happyhorse-product-spec.md` as the only authority for MVP routes
- Converted provider ambiguity into explicit defaults instead of executor-time guesswork
- Added legal/privacy baseline for analytics, optional email capture, and frontend-direct API usage
- Added pre-content research gate: each page requires `source_urls` and `fact_status`
- Added reusable ops artifacts as metadata/checklist, not automation platform work

## Work Objectives
### Core Objective
Implement the HappyHorse MVP as an SEO-first, non-official trend site in Astro, with reusable typed content pages plus a minimal in-site video generation app on `/try-happyhorse/` that calls the existing API directly from the frontend.

### Deliverables
1. Astro project scaffold with static-first build, npm scripts, and deployment-ready configuration
2. Typed content collection for trend pages and site config
3. Shared layouts/components for SEO metadata, FAQ, disclaimer, related links, CTA, breadcrumbs, fact-status, and the app-entry shell
4. 6 Must Launch pages: `/`, `/what-is-happyhorse/`, `/happyhorse-vs-seedance/`, `/try-happyhorse/`, `/happyhorse-alternatives/`, `/happyhorse-prompts/`
5. 3 Should Launch pages: `/happyhorse-github/`, `/happyhorse-open-source/`, `/best-ai-video-models/`
6. Frontend-direct generation integration on `/try-happyhorse/`, generation telemetry, optional fallback lead capture, privacy policy, sitemap, robots.txt, canonical tags, and JSON-LD
7. Reusable framework artifacts for scoring, review cadence, and page creation

### Definition of Done (verifiable conditions with commands)
1. `npm install && npm run build` succeeds without errors
2. `npm run preview` serves all Must Launch routes successfully
3. `npm run test:e2e` passes browser-based checks for route rendering, generation start/success/failure/limit behavior, disclaimer, FAQ, internal-link, sitemap, robots, canonical, and JSON-LD
4. Every content page has typed frontmatter including `fact_status`, `source_urls`, `cta_type`, `last_updated_at`, `related_pages`, and generation-entry metadata where applicable
5. At least one page renders `unknown` or `mixed` fact-status language per spec

### Must Have
1. Single shared page shell and typed page schema
2. Exactly 6 Must Launch content routes and 3 Should Launch routes
3. Non-official disclaimer visibility on home and all content pages
4. `/try-happyhorse/` as the canonical app/access entry with 2 free generations per user
5. GA4 event tracking for `cta_click`, `generation_start`, `generation_success`, `generation_failure`, and `generation_limit_reached`, plus `lead_submit` only if a fallback form is kept
6. Privacy policy / consent copy for analytics and direct-from-frontend API usage, plus email capture only if present
7. Sitemap, robots.txt, canonical tags, breadcrumbs, and structured data
8. Review cadence and trend scoring artifacts for future reuse

### Must NOT Have (guardrails, AI slop patterns, scope boundaries)
1. No CMS, admin UI, database, auth, custom backend platform, trend crawler, or auto-publishing pipeline
2. No symmetric duplicate comparison route like `/seedance-vs-happyhorse/`
3. No standalone `/happyhorse-api/` or `/happyhorse-hugging-face/` in v1
4. No multi-language, multi-domain, personalization, or A/B testing work
5. No unsupported “official” claims or unverified availability statements
6. No fluff content without source-backed facts or explicit unknown-state wording

## Verification Strategy
> ZERO HUMAN INTERVENTION - all verification is agent-executed.
- Test decision: tests-after with browser-agent or equivalent browser-based E2E, plus build checks
- QA policy: Every task includes happy-path and failure/edge-case scenarios
- Evidence: `.sisyphus/evidence/task-{N}-{slug}.{ext}`

## Execution Strategy
### Parallel Execution Waves
> Target: 5-8 tasks per wave. Foundation tasks are extracted first so page work can fan out safely.

Wave 1: foundation and stack lock (Tasks 1-5)
Wave 2: Must Launch page implementation (Tasks 6-11)
Wave 3: Should Launch supporting pages (Tasks 12-14)
Wave 4: cross-page polish and reusable ops artifacts (Tasks 15-17)

### Dependency Matrix (full, all tasks)
- Task 1 blocks Tasks 2-17
- Task 2 blocks Tasks 6-17
- Task 3 blocks Tasks 6-17
- Task 4 blocks Tasks 6-17 and final telemetry QA
- Task 5 blocks Tasks 15-17 and final SEO QA
- Tasks 6-11 can run in parallel after Tasks 1-5
- Tasks 12-14 can run in parallel after Tasks 1-5 and should follow patterns established in Tasks 6-11
- Task 15 depends on Tasks 6-14
- Task 16 depends on Tasks 2-14
- Task 17 depends on Tasks 6-16
- Final verification depends on Tasks 1-17

### Agent Dispatch Summary (wave → task count → categories)
- Wave 1 → 5 tasks → `unspecified-high`, `visual-engineering`, `writing`
- Wave 2 → 6 tasks → `visual-engineering`, `writing`
- Wave 3 → 3 tasks → `writing`
- Wave 4 → 3 tasks → `writing`, `unspecified-high`, `deep`

## TODOs
> Implementation + Test = ONE task. Never separate.
> EVERY task MUST have: Agent Profile + Parallelization + QA Scenarios.

- [x] 1. Bootstrap Astro static-first project and app-ready baseline scripts

  **What to do**: Initialize an Astro + TypeScript project with `npm`, static-first output, build/preview scripts, a browser-based `test:e2e` hook, and deploy-ready defaults for Vercel. Create the initial folder structure for `src/pages`, `src/content`, `src/components`, `src/layouts`, `public`, and `tests/e2e` so later tasks do not invent paths ad hoc. Task 1 must leave the repo ready for a client-side app entry on `/try-happyhorse/` without switching frameworks or assuming a custom backend.
  **Must NOT do**: Do not add Tailwind, React islands, CMS packages, auth, databases, or server runtime features in v1.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` - Reason: repo is empty; executor must establish the full technical baseline safely.
  - Skills: `[]` - No extra skill is required beyond standard scaffold/setup work.
  - Omitted: `[agent-browser]` - No browser automation is needed until runnable routes exist.

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: [2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17] | Blocked By: []

  **References** (executor has NO interview context - be exhaustive):
  - Spec authority: `.sisyphus/drafts/auto-seo-happyhorse-product-spec.md:1-20` - stack must honor the spec defaults and Chinese planning context.
  - Scope guardrails: `.sisyphus/drafts/auto-seo-happyhorse-product-spec.md:51-59` - no CMS, no overbuild, no official positioning.
  - Architecture decision: `.sisyphus/plans/auto-seo-happyhorse-execution.md:24-40` - Astro + TypeScript + static-first output + npm + GA4 + frontend-direct API call + Vercel.

  **Acceptance Criteria** (agent-executable only):
  - [ ] `npm install && npm run build` succeeds in a fresh checkout.
  - [ ] `npm run preview` starts a local server and `curl -I http://127.0.0.1:4321/` returns a successful response.
  - [ ] `package.json` exposes at minimum: `dev`, `build`, `preview`, `test:e2e`.
  - [ ] Task 1 does not hard-lock a Playwright-only browser QA path.

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```
  Scenario: Fresh scaffold builds locally
    Tool: Bash
    Steps: Run `npm install`; run `npm run build`; run `npm run preview -- --host 127.0.0.1` in background; request `http://127.0.0.1:4321/`
    Expected: install succeeds, build succeeds, preview starts, root returns HTTP 200/3xx success
    Evidence: .sisyphus/evidence/task-1-bootstrap.txt

  Scenario: Overbuild guardrail check
    Tool: Bash
    Steps: Inspect `package.json` and project tree for banned additions like CMS/auth/database packages and server-only runtime folders
    Expected: no banned v1 platform dependencies or folders are present
    Evidence: .sisyphus/evidence/task-1-bootstrap-guardrail.txt
  ```

  **Commit**: YES | Message: `chore(site): initialize astro static-first scaffold` | Files: `package.json`, `astro.config.*`, `src/**`, `public/**`, `tests/**`

- [x] 2. Define typed content collections and per-page research packets

  **What to do**: Create a single typed content schema for all trend pages using MDX frontmatter fields required by the spec. Add one content file for each Must and Should route, and require every file to include `source_urls`, `fact_status`, `cta_type`, `related_pages`, `last_updated_at`, route metadata, and `generation_entry_mode` where the page routes users into the in-site app before any page copy is considered complete.
  **Must NOT do**: Do not leave placeholder content entries without source links; do not create extra routes beyond the locked 6 Must and 3 Should pages.

  **Recommended Agent Profile**:
  - Category: `writing` - Reason: this is content-structure and schema-definition work more than UI implementation.
  - Skills: `[]` - Native repo/document work is sufficient.
  - Omitted: `[agent-browser]` - No web interaction is required for static content modeling.

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: [6,7,8,9,10,11,12,13,14,16,17] | Blocked By: [1]

  **References** (executor has NO interview context - be exhaustive):
  - MVP route authority: `.sisyphus/drafts/auto-seo-happyhorse-product-spec.md:136-173` - only 6 Must + 3 Should routes are valid.
  - Content/data model: `.sisyphus/drafts/auto-seo-happyhorse-product-spec.md:332-366` - required fields and page questions.
  - Fact-status rules: `.sisyphus/drafts/auto-seo-happyhorse-product-spec.md:450-462` - unknown/mixed wording is mandatory.

  **Acceptance Criteria** (agent-executable only):
  - [ ] Exactly 9 content entries exist for the locked routes and no forbidden extras exist.
  - [ ] Every content entry validates against the typed schema during `npm run build`.
  - [ ] Every entry contains non-empty `source_urls`, valid `fact_status`, `cta_type`, `last_updated_at`, and at least 2 `related_pages`, plus `generation_entry_mode` where applicable.

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```
  Scenario: Content schema rejects incomplete entries
    Tool: Bash
    Steps: Run `npm run build` after creating the schema and page entries
    Expected: build passes only when all required frontmatter fields are present and correctly typed
    Evidence: .sisyphus/evidence/task-2-content-schema.txt

  Scenario: Route inventory stays in scope
    Tool: Bash
    Steps: Enumerate content entries and compare them with the 6 Must + 3 Should route list from the spec
    Expected: inventory matches the locked route set exactly; no `/seedance-vs-happyhorse/`, `/happyhorse-api/`, or `/happyhorse-hugging-face/`
    Evidence: .sisyphus/evidence/task-2-route-inventory.txt
  ```

  **Commit**: YES | Message: `feat(content): add typed trend page schema and route inventory` | Files: `src/content/**`, schema files, page data files

- [x] 3. Build the shared page shell and reusable SEO/content components

  **What to do**: Implement one reusable layout/shell that renders the common page model for homepage and content pages. Include shared components/helpers for SEO head tags, canonical URLs, breadcrumbs, FAQ blocks, disclaimer blocks, related links, CTA sections, fact-status callouts, and JSON-LD generation so page tasks only provide route-specific content.
  **Must NOT do**: Do not create a separate bespoke component stack per page type; do not hardcode metadata or disclaimer logic into individual page files.

  **Recommended Agent Profile**:
  - Category: `visual-engineering` - Reason: this task defines the reusable UI/page architecture and content rendering structure.
  - Skills: `[]` - Standard implementation is enough.
  - Omitted: `[agent-browser]` - UI automation is reserved for QA after renderable pages exist.

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: [6,7,8,9,10,11,12,13,14,15,17] | Blocked By: [1,2]

  **References** (executor has NO interview context - be exhaustive):
  - Fixed page model: `.sisyphus/drafts/auto-seo-happyhorse-product-spec.md:194-243` - required components for every Must page.
  - CTA taxonomy: `.sisyphus/drafts/auto-seo-happyhorse-product-spec.md:219-229` - only 5 CTA types are valid.
  - Content fields: `.sisyphus/drafts/auto-seo-happyhorse-product-spec.md:338-356` - all rendering should map from typed fields.
  - Compliance/disclaimer rules: `.sisyphus/drafts/auto-seo-happyhorse-product-spec.md:420-448`

  **Acceptance Criteria** (agent-executable only):
  - [ ] A single shared page shell renders title, H1, answer, key facts, CTA, FAQ, disclaimer, and related links from content data.
  - [ ] JSON-LD, canonical tag, Open Graph tags, and breadcrumbs are generated from shared helpers rather than duplicated per page.
  - [ ] Pages with `fact_status = unknown|mixed` render the correct non-verified language treatment.

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```
  Scenario: Shared shell renders required blocks
    Tool: Browser agent
    Steps: Start preview server; open a representative page; assert presence of H1, above-the-fold answer, CTA block, FAQ block, disclaimer block, and related links block
    Expected: all required shared sections render from the common shell without per-page hacks
    Evidence: .sisyphus/evidence/task-3-shared-shell.png

  Scenario: Fact-status fallback renders correctly
    Tool: Browser agent
    Steps: Open a page configured with `fact_status=unknown` or `mixed`; inspect the fact-status callout text
    Expected: the page displays explicit uncertainty wording instead of unsupported factual claims
    Evidence: .sisyphus/evidence/task-3-fact-status.txt
  ```

  **Commit**: YES | Message: `feat(ui): add shared seo page shell and common content components` | Files: `src/layouts/**`, `src/components/**`, SEO/schema helpers

- [x] 4. Implement the frontend generation flow and GA4 event taxonomy

  **What to do**: Build the minimal in-site generation flow for `/try-happyhorse/` by calling the existing API directly from the frontend. Support the core UI states required by the spec: ready, submitting, success, failure, and free-limit-reached after 2 successful free generations per user. Wire a minimal GA4 helper that emits `cta_click`, `generation_start`, `generation_success`, `generation_failure`, and `generation_limit_reached`, plus `lead_submit` only if a fallback form is explicitly kept.
  **Must NOT do**: Do not add GTM, bespoke API routes, server proxy assumptions, multi-provider event abstractions, or a full account/auth system in v1.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` - Reason: this combines app behavior, frontend API integration, free-limit rules, and analytics correctness.
  - Skills: `[]` - No special skill beyond careful implementation/QA is needed.
  - Omitted: `[agent-browser]` - Browser automation is only for validation, not primary implementation.

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: [6,7,8,9,10,11,12,13,14,17] | Blocked By: [1,2,3]

  **References** (executor has NO interview context - be exhaustive):
  - Primary conversion rules: `.sisyphus/drafts/auto-seo-happyhorse-product-spec.md:211-232`
  - Business metrics: `.sisyphus/drafts/auto-seo-happyhorse-product-spec.md:492-501`
  - Compliance baseline: `.sisyphus/drafts/auto-seo-happyhorse-product-spec.md:442-462`
  - Architecture defaults: `.sisyphus/plans/auto-seo-happyhorse-execution.md:24-33`

  **Acceptance Criteria** (agent-executable only):
  - [ ] Each primary CTA emits `cta_click` with page path and CTA type.
  - [ ] Successful generation emits `generation_success` and renders a user-visible success state.
  - [ ] Failed generation emits `generation_failure` and renders a visible error state without breaking the page.
  - [ ] After 2 successful free generations, the UI blocks another free attempt and emits `generation_limit_reached`.

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```
  Scenario: Generation happy path
    Tool: Browser agent
    Steps: Open `/try-happyhorse/`; fill the minimum required inputs; submit a generation request; observe network request and UI response
    Expected: request succeeds, success confirmation or generated result appears, and `generation_start` plus `generation_success` telemetry are emitted
    Evidence: .sisyphus/evidence/task-4-generation-success.png

  Scenario: Generation failure and free-limit path
    Tool: Browser agent
    Steps: First force the generation request to fail and verify the error state. Then simulate or perform two successful free generations and attempt a third.
    Expected: failure state stays visible without a false success event; the third attempt is blocked by the 2-free-generation rule and emits `generation_limit_reached`
    Evidence: .sisyphus/evidence/task-4-generation-failure-limit.txt
  ```

  **Commit**: YES | Message: `feat(app): add frontend generation flow and telemetry` | Files: app component, analytics helper, related success/error/limit UI

- [x] 5. Add SEO utility routes and legal/compliance baseline

  **What to do**: Implement `sitemap.xml`, `robots.txt`, canonical URL generation, breadcrumb rendering, and the minimum legal/privacy route required for GA4 + direct-from-frontend API usage, plus email capture only if kept. Ensure the homepage and content pages can reference this compliance baseline without inventing new copy patterns later.
  **Must NOT do**: Do not make Search Console submission or external credentialed steps a blocker for build completion; do not add a complex cookie banner platform in v1.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` - Reason: this task mixes SEO infrastructure, route-level correctness, and compliance requirements.
  - Skills: `[]` - Standard repo work is sufficient.
  - Omitted: `[agent-browser]` - Static asset and metadata work can be validated without exploratory browser work.

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: [15,17] | Blocked By: [1,2,3,4]

  **References** (executor has NO interview context - be exhaustive):
  - Disclaimer and forbidden language: `.sisyphus/drafts/auto-seo-happyhorse-product-spec.md:432-462`
  - Metrics and product acceptance: `.sisyphus/drafts/auto-seo-happyhorse-product-spec.md:466-517`
  - Must-have SEO utilities: `.sisyphus/plans/auto-seo-happyhorse-execution.md:55-67`

  **Acceptance Criteria** (agent-executable only):
  - [ ] `sitemap.xml` lists all Must Launch routes.
  - [ ] `robots.txt` is served and allows crawl of public routes.
  - [ ] A privacy/compliance page exists and is linked from the footer or form area.
  - [ ] All pages can derive canonical URLs from a shared helper.

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```
  Scenario: SEO utility routes are present
    Tool: Bash
    Steps: Start preview server; request `/sitemap.xml` and `/robots.txt`
    Expected: both routes return HTTP 200 and sitemap includes all Must Launch pages
    Evidence: .sisyphus/evidence/task-5-seo-utilities.txt

  Scenario: Privacy baseline is reachable
    Tool: Browser agent
    Steps: Open homepage; click footer or form-area privacy link
    Expected: privacy/compliance page loads and explains analytics plus direct-from-frontend API usage at a minimum, and email capture only if present
    Evidence: .sisyphus/evidence/task-5-privacy.png
  ```

  **Commit**: YES | Message: `feat(seo): add utility routes and compliance baseline` | Files: `public/robots.txt`, sitemap config, privacy route/page, shared footer links

- [x] 6. Implement the homepage hub route `/`

  **What to do**: Build the homepage as the canonical site entry point with the approved hero positioning, one-sentence explanation, primary CTA that routes into `/try-happyhorse/`, and visible routing to explainer, comparison, access/app, alternatives, and prompts content. Include the non-official disclaimer in the first view or immediately below it.
  **Must NOT do**: Do not present the homepage as the official HappyHorse site; do not omit links to Must Launch pages.

  **Recommended Agent Profile**:
  - Category: `visual-engineering` - Reason: homepage is a high-visibility UI/content assembly task.
  - Skills: `[]` - Shared shell is already established.
  - Omitted: `[agent-browser]` - Validation belongs in QA steps only.

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: [15,17] | Blocked By: [1,2,3,4,5]

  **References** (executor has NO interview context - be exhaustive):
  - Homepage positioning/copy direction: `README.md:110-142`, `README.md:415-449`
  - Homepage structure recommendation: `README.md:430-449`
  - Homepage obligations: `.sisyphus/drafts/auto-seo-happyhorse-product-spec.md:184-208`

  **Acceptance Criteria** (agent-executable only):
  - [ ] `/` renders 1 H1, one-sentence explanation, primary CTA, disclaimer, and links to all 5 other Must Launch routes.
  - [ ] Homepage CTA emits `cta_click` telemetry and routes users toward the app entry.
  - [ ] Homepage includes canonical tag and structured data from shared helpers.

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```
  Scenario: Homepage routes users to all core journeys
    Tool: Browser agent
    Steps: Open `/`; verify hero, CTA, disclaimer, and links to `/what-is-happyhorse/`, `/happyhorse-vs-seedance/`, `/try-happyhorse/`, `/happyhorse-alternatives/`, `/happyhorse-prompts/`
    Expected: all required sections and links are visible and usable
    Evidence: .sisyphus/evidence/task-6-homepage.png

  Scenario: Homepage does not imply official status
    Tool: Browser agent
    Steps: Inspect hero copy, CTA labels, and disclaimer placement
    Expected: page contains explicit non-official wording and no forbidden `official` claims
    Evidence: .sisyphus/evidence/task-6-homepage-compliance.txt
  ```

  **Commit**: YES | Message: `feat(home): implement happyhorse homepage hub` | Files: homepage route, homepage content entry, related components/styles

- [x] 7. Implement the explainer route `/what-is-happyhorse/`

  **What to do**: Build the primary explainer page that answers what HappyHorse is, why it matters, what is publicly known, and what remains uncertain. Use `try_now` as the primary CTA and make the page the canonical explainer entry for brand-definition queries while routing qualified users into `/try-happyhorse/`.
  **Must NOT do**: Do not over-claim access, official status, or technical facts that lack public verification.

  **Recommended Agent Profile**:
  - Category: `writing` - Reason: the task is content-heavy but still uses the shared shell.
  - Skills: `[]` - No specialized skill is needed.
  - Omitted: `[agent-browser]` - Validation only.

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: [15,17] | Blocked By: [1,2,3,4,5]

  **References** (executor has NO interview context - be exhaustive):
  - Explainer intent cluster: `README.md:172-181`
  - First-wave explainer requirement: `README.md:382-404`
  - Page model and fact rules: `.sisyphus/drafts/auto-seo-happyhorse-product-spec.md:194-243`, `.sisyphus/drafts/auto-seo-happyhorse-product-spec.md:450-462`

  **Acceptance Criteria** (agent-executable only):
  - [ ] `/what-is-happyhorse/` renders a direct above-the-fold answer, key facts, FAQ, disclaimer, and `try_now` CTA.
  - [ ] Page metadata targets explainer intent only and does not overlap with comparison or access intent.
  - [ ] Any unverified claims are rendered via approved unknown/mixed wording.

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```
  Scenario: Explainer page answers the query immediately
    Tool: Browser agent
    Steps: Open `/what-is-happyhorse/`; inspect H1, first paragraph, CTA, FAQ, disclaimer
    Expected: first screen answers what HappyHorse is and includes the required content blocks
    Evidence: .sisyphus/evidence/task-7-what-is.png

  Scenario: Explainer page handles uncertainty correctly
    Tool: Browser agent
    Steps: Locate sections covering uncertain public facts and inspect their wording
    Expected: page uses approved uncertainty phrasing rather than definitive unsupported claims
    Evidence: .sisyphus/evidence/task-7-what-is-uncertainty.txt
  ```

  **Commit**: YES | Message: `feat(content): implement what-is-happyhorse explainer page` | Files: explainer route/content entry and related tests

- [x] 8. Implement the comparison route `/happyhorse-vs-seedance/`

  **What to do**: Build the single canonical comparison page for HappyHorse vs Seedance. The page must compare the models in a way that is source-backed, avoid speculative claims, and route users toward `compare_now` while linking to alternatives and explainer content.
  **Must NOT do**: Do not create or retain a mirrored `/seedance-vs-happyhorse/` page; do not present unverified benchmark claims as fact.

  **Recommended Agent Profile**:
  - Category: `writing` - Reason: comparison structure and evidence handling dominate this task.
  - Skills: `[]` - Standard implementation is enough.
  - Omitted: `[agent-browser]` - Browser use is only for QA.

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: [15,17] | Blocked By: [1,2,3,4,5]

  **References** (executor has NO interview context - be exhaustive):
  - Comparison intent cluster: `README.md:183-191`
  - Best first title pattern: `README.md:396-404`
  - Canonical comparison decision: `.sisyphus/drafts/auto-seo-happyhorse-product-spec.md:167-172`

  **Acceptance Criteria** (agent-executable only):
  - [ ] `/happyhorse-vs-seedance/` exists as the only comparison route for this pair.
  - [ ] Page includes direct answer, comparison structure, main `compare_now` CTA, FAQ, disclaimer, and links to alternatives.
  - [ ] No mirrored route or duplicate comparison content is generated elsewhere.

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```
  Scenario: Canonical comparison page is complete
    Tool: Browser agent
    Steps: Open `/happyhorse-vs-seedance/`; inspect H1, comparison sections, CTA, FAQ, disclaimer, related links
    Expected: all required comparison-page blocks render and the page links onward to alternatives/explainer content
    Evidence: .sisyphus/evidence/task-8-comparison.png

  Scenario: Duplicate comparison route is absent
    Tool: Bash
    Steps: Request `/seedance-vs-happyhorse/` and inspect route inventory/content files
    Expected: no mirrored comparison page is implemented or exposed as a valid content route
    Evidence: .sisyphus/evidence/task-8-comparison-dup.txt
  ```

  **Commit**: YES | Message: `feat(content): implement canonical happyhorse comparison page` | Files: comparison route/content entry and related tests

- [x] 9. Implement the app/access route `/try-happyhorse/`

  **What to do**: Build the single app/access page that answers whether users can try HappyHorse today, what public access is actually known, and how the in-site generation flow works. This page owns access/API/entry/app intent for MVP, uses `try_now` as the primary CTA, calls the existing API directly from the frontend, and clearly explains the 2-free-generation rule.
  **Must NOT do**: Do not split access intent into separate API/Hugging Face/official-signup routes during MVP, do not add a custom backend just to proxy the API, and do not state that public HappyHorse access exists unless it is verified.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` - Reason: this task combines accuracy, expectation-setting, and the core product interaction.
  - Skills: `[]` - Standard implementation is sufficient.
  - Omitted: `[agent-browser]` - Validation only.

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: [15,17] | Blocked By: [1,2,3,4,5]

  **References** (executor has NO interview context - be exhaustive):
  - Action/access intent cluster: `README.md:200-207`
  - MVP route decision for app/access page: `.sisyphus/drafts/auto-seo-happyhorse-product-spec.md:142-149`, `.sisyphus/drafts/auto-seo-happyhorse-product-spec.md:171-174`
  - Unknown-state language: `.sisyphus/drafts/auto-seo-happyhorse-product-spec.md:450-462`

  **Acceptance Criteria** (agent-executable only):
  - [ ] `/try-happyhorse/` exists as the canonical app/access entry and clearly answers what verified public access exists versus what this site provides directly.
  - [ ] Page includes a working `try_now` flow, disclaimer, FAQ, and links to alternatives.
  - [ ] The page covers API/entry uncertainty without creating unsupported certainty, while still documenting the user-provided frontend-direct API constraint.
  - [ ] The page visibly enforces or explains the 2-free-generation limit and covers generation success and failure states.

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```
  Scenario: App/access page routes demand into the product safely
    Tool: Browser agent
    Steps: Open `/try-happyhorse/`; inspect copy for verified-access statement, free-limit messaging, CTA, disclaimer, and related links; complete one successful generation
    Expected: page explicitly distinguishes verified public information from what the site itself provides, offers a safe next step, and completes one successful in-site generation
    Evidence: .sisyphus/evidence/task-9-try-page-success.png

  Scenario: API claims are not overstated
    Tool: Browser agent
    Steps: Search within the page for API/open access statements and then force a failure or limit-reached condition in the generator UI
    Expected: page contains no unsupported claims that HappyHorse has an official public API or signup flow, and the UI shows a clear failure or limit state without breaking
    Evidence: .sisyphus/evidence/task-9-try-page-claims-limit.txt
  ```

  **Commit**: YES | Message: `feat(app): implement try-happyhorse app entry` | Files: access/app route, related app UI, content entry, and related tests

- [x] 10. Implement the alternatives route `/happyhorse-alternatives/`

  **What to do**: Build the alternatives page as the main commercial redirection layer for users who want similar tools, comparable workflows, or substitute video models. This page should prioritize `see_alternatives` while staying non-official and source-backed.
  **Must NOT do**: Do not turn the page into a generic directory with no opinionated primary CTA; do not mix in direct comparison-page structure.

  **Recommended Agent Profile**:
  - Category: `writing` - Reason: content structure and CTA logic are the center of this task.
  - Skills: `[]` - No extra skill is necessary.
  - Omitted: `[agent-browser]` - Use only during QA.

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: [15,17] | Blocked By: [1,2,3,4,5]

  **References** (executor has NO interview context - be exhaustive):
  - Alternatives intent cluster: `README.md:183-191`, `README.md:405-411`
  - Route authority: `.sisyphus/drafts/auto-seo-happyhorse-product-spec.md:145-146`
  - CTA and internal-link rules: `.sisyphus/drafts/auto-seo-happyhorse-product-spec.md:219-236`

  **Acceptance Criteria** (agent-executable only):
  - [ ] `/happyhorse-alternatives/` includes a single primary `see_alternatives` CTA and links back to comparison/access pages.
  - [ ] Page includes FAQ, disclaimer, and at least 2 related links.
  - [ ] The content remains clearly independent and does not imply official endorsement.

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```
  Scenario: Alternatives page captures redirection intent
    Tool: Browser agent
    Steps: Open `/happyhorse-alternatives/`; inspect primary CTA, related links, FAQ, disclaimer
    Expected: page is centered on alternatives intent and offers a clear next step rather than generic browsing
    Evidence: .sisyphus/evidence/task-10-alternatives.png

  Scenario: Alternatives page interlinks correctly
    Tool: Browser agent
    Steps: Verify links from `/happyhorse-alternatives/` to `/happyhorse-vs-seedance/` and `/try-happyhorse/`
    Expected: page links to both comparison and access journeys as required by the spec
    Evidence: .sisyphus/evidence/task-10-alternatives-links.txt
  ```

  **Commit**: YES | Message: `feat(content): implement happyhorse alternatives page` | Files: alternatives route/content entry and related tests

- [x] 11. Implement the prompts route `/happyhorse-prompts/`

  **What to do**: Build the prompt/template page for creator-intent traffic. The page should frame prompt examples as “HappyHorse-style” inspiration, not as official model presets, and use `get_prompts` as the primary CTA while also linking cleanly into `/try-happyhorse/`.
  **Must NOT do**: Do not claim the prompts are official or guaranteed to reproduce private model behavior; do not omit disclaimer language.

  **Recommended Agent Profile**:
  - Category: `writing` - Reason: this is a content-led page with strong intent/CTA coupling.
  - Skills: `[]` - Standard implementation is enough.
  - Omitted: `[agent-browser]` - Validation only.

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: [15,17] | Blocked By: [1,2,3,4,5]

  **References** (executor has NO interview context - be exhaustive):
  - Prompt/action intent: `README.md:200-207`, `README.md:405-411`
  - Route authority: `.sisyphus/drafts/auto-seo-happyhorse-product-spec.md:146-147`
  - Branding guardrails: `.sisyphus/drafts/auto-seo-happyhorse-product-spec.md:432-462`

  **Acceptance Criteria** (agent-executable only):
  - [ ] `/happyhorse-prompts/` includes prompt examples, `get_prompts` CTA, disclaimer, FAQ, and related links.
  - [ ] Copy consistently uses “HappyHorse-style” framing or equivalent non-official wording.
  - [ ] CTA events are captured with the correct `cta_type`.

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```
  Scenario: Prompt page satisfies creator-intent structure
    Tool: Browser agent
    Steps: Open `/happyhorse-prompts/`; inspect H1, prompt content blocks, CTA, FAQ, disclaimer
    Expected: page clearly serves prompt/template intent and routes users toward the configured CTA
    Evidence: .sisyphus/evidence/task-11-prompts.png

  Scenario: Prompt page avoids official framing
    Tool: Browser agent
    Steps: Search within page copy for restricted `official` language and inspect prompt framing
    Expected: no official-positioning claims appear; prompt copy stays within non-official “style” framing
    Evidence: .sisyphus/evidence/task-11-prompts-compliance.txt
  ```

  **Commit**: YES | Message: `feat(content): implement happyhorse prompts page` | Files: prompts route/content entry and related tests

- [x] 12. Implement the supporting repo-status route `/happyhorse-github/`

  **What to do**: Build the GitHub/repo-status page as a Should Launch page that summarizes what public repository information exists, what does not, and what users should do next if no verified repo is available. Keep the primary CTA aligned with the spec and route users toward `/try-happyhorse/` rather than assuming waitlist-only capture.
  **Must NOT do**: Do not label any repository as official unless publicly verified; do not duplicate `/happyhorse-open-source/` content line-for-line.

  **Recommended Agent Profile**:
  - Category: `writing` - Reason: the task is evidence-led and content-heavy.
  - Skills: `[]` - No special skill required.
  - Omitted: `[agent-browser]` - QA only.

  **Parallelization**: Can Parallel: YES | Wave 3 | Blocks: [15,17] | Blocked By: [1,2,3,4,5]

  **References** (executor has NO interview context - be exhaustive):
  - Open source / repo intent cluster: `README.md:193-199`
  - Should-route authority: `.sisyphus/drafts/auto-seo-happyhorse-product-spec.md:151-154`
  - Unknown-state wording: `.sisyphus/drafts/auto-seo-happyhorse-product-spec.md:450-462`

  **Acceptance Criteria** (agent-executable only):
  - [ ] `/happyhorse-github/` exists only if it can provide route-specific information gain over the explainer page.
  - [ ] Page includes the spec-aligned primary CTA, disclaimer, FAQ, and explicit unknown/verified status handling.
  - [ ] Page does not claim to link to an official GitHub repository without proof.

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```
  Scenario: GitHub status page is distinct and compliant
    Tool: Browser agent
    Steps: Open `/happyhorse-github/`; inspect CTA, disclaimer, FAQ, and repo-status sections
    Expected: page is distinct from other pages and uses explicit verified/unknown status language
    Evidence: .sisyphus/evidence/task-12-github.png

  Scenario: Official repo claims are avoided
    Tool: Browser agent
    Steps: Search the page for `official GitHub` or equivalent language
    Expected: no unsupported official-repository claims appear
    Evidence: .sisyphus/evidence/task-12-github-compliance.txt
  ```

  **Commit**: YES | Message: `feat(content): implement happyhorse github status page` | Files: github route/content entry and related tests

- [x] 13. Implement the supporting open-source route `/happyhorse-open-source/`

  **What to do**: Build the open-source status page only as a distinct “is it open source?” query answer. The page must clarify licensing or availability uncertainty, link to alternatives when no verified open-source option exists, and keep the route narrower than the GitHub status page.
  **Must NOT do**: Do not clone the GitHub page with only keyword swaps; do not imply source release, weights access, or public licensing if unverified.

  **Recommended Agent Profile**:
  - Category: `writing` - Reason: this is a narrow intent page requiring careful differentiation and evidence handling.
  - Skills: `[]` - Standard implementation is enough.
  - Omitted: `[agent-browser]` - QA only.

  **Parallelization**: Can Parallel: YES | Wave 3 | Blocks: [15,17] | Blocked By: [1,2,3,4,5]

  **References** (executor has NO interview context - be exhaustive):
  - Open-source route authority: `.sisyphus/drafts/auto-seo-happyhorse-product-spec.md:153-154`
  - Page-boundary rule against overlap: `.sisyphus/drafts/auto-seo-happyhorse-product-spec.md:167-172`
  - Unknown-state wording: `.sisyphus/drafts/auto-seo-happyhorse-product-spec.md:450-462`

  **Acceptance Criteria** (agent-executable only):
  - [ ] `/happyhorse-open-source/` focuses only on open-source status and links to alternatives when access is unavailable.
  - [ ] Page includes FAQ, disclaimer, and at least 2 related links.
  - [ ] Page content is materially different from `/happyhorse-github/`.

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```
  Scenario: Open-source page is distinct and useful
    Tool: Browser agent
    Steps: Open `/happyhorse-open-source/`; inspect H1, status explanation, CTA, disclaimer, related links
    Expected: page clearly answers the open-source question and routes users to alternatives where appropriate
    Evidence: .sisyphus/evidence/task-13-open-source.png

  Scenario: Open-source route does not duplicate GitHub route
    Tool: Bash
    Steps: Compare the route content blocks or frontmatter fields for `/happyhorse-open-source/` and `/happyhorse-github/`
    Expected: the two pages have different primary intent and materially different body sections
    Evidence: .sisyphus/evidence/task-13-open-source-diff.txt
  ```

  **Commit**: YES | Message: `feat(content): implement happyhorse open-source page` | Files: open-source route/content entry and related tests

- [x] 14. Implement the category comparison route `/best-ai-video-models/`

  **What to do**: Build the category-level comparison page as the only Should Launch hub that broadens beyond HappyHorse while still serving the current campaign. Use it to compare relevant alternatives at a category level and route traffic toward more specific pages.
  **Must NOT do**: Do not turn this into a generic listicle with no connection to HappyHorse intent or CTA flow.

  **Recommended Agent Profile**:
  - Category: `writing` - Reason: this page is content-led and strategically bridges the current topic to broader alternatives.
  - Skills: `[]` - No special skill needed.
  - Omitted: `[agent-browser]` - Browser work is validation only.

  **Parallelization**: Can Parallel: YES | Wave 3 | Blocks: [15,17] | Blocked By: [1,2,3,4,5]

  **References** (executor has NO interview context - be exhaustive):
  - Should-route authority: `.sisyphus/drafts/auto-seo-happyhorse-product-spec.md:155-155`
  - Expansion rationale: `README.md:149-170`, `README.md:495-503`
  - Alternatives/comparison CTA logic: `.sisyphus/drafts/auto-seo-happyhorse-product-spec.md:219-236`

  **Acceptance Criteria** (agent-executable only):
  - [ ] `/best-ai-video-models/` exists as a category page with `see_alternatives` CTA and links to at least one HappyHorse-specific page.
  - [ ] Page includes FAQ, disclaimer, and related links.
  - [ ] Page reinforces the current campaign instead of replacing it as the homepage/hub.

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```
  Scenario: Category page supports the campaign
    Tool: Browser agent
    Steps: Open `/best-ai-video-models/`; inspect CTA, disclaimer, FAQ, and links back to HappyHorse-specific content
    Expected: page expands alternatives discovery while still routing users into the core HappyHorse journey
    Evidence: .sisyphus/evidence/task-14-category-page.png

  Scenario: Category page is not orphaned
    Tool: Browser agent
    Steps: Navigate to the category page from homepage or related pages and back again
    Expected: route is reachable through site navigation/internal links and links back into the main funnel
    Evidence: .sisyphus/evidence/task-14-category-links.txt
  ```

  **Commit**: YES | Message: `feat(content): implement best ai video models category page` | Files: category route/content entry and related tests

- [x] 15. Enforce cross-page internal linking, canonicals, breadcrumbs, and sitemap integrity

  **What to do**: After all routes exist, complete the cross-page SEO layer: homepage links to every Must route, comparison and alternatives pages interlink, `/try-happyhorse/` remains the canonical app/access entry, each page exposes canonical + breadcrumb metadata, and sitemap/robots outputs stay synchronized with route inventory.
  **Must NOT do**: Do not leave related links manual and inconsistent across pages; do not ship pages that are reachable only by direct URL.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` - Reason: this is a site-wide consistency and routing integrity task.
  - Skills: `[]` - No extra skill required.
  - Omitted: `[agent-browser]` - Use only in QA scenarios.

  **Parallelization**: Can Parallel: NO | Wave 4 | Blocks: [17,F1,F2,F3,F4] | Blocked By: [5,6,7,8,9,10,11,12,13,14]

  **References** (executor has NO interview context - be exhaustive):
  - Internal-link rules: `.sisyphus/drafts/auto-seo-happyhorse-product-spec.md:231-236`
  - Homepage routing obligations: `.sisyphus/drafts/auto-seo-happyhorse-product-spec.md:186-192`
  - Product acceptance rules: `.sisyphus/drafts/auto-seo-happyhorse-product-spec.md:509-517`

  **Acceptance Criteria** (agent-executable only):
  - [ ] Homepage links to all 5 other Must Launch routes.
  - [ ] Every content page exposes at least 2 related links.
  - [ ] `sitemap.xml`, canonical tags, and breadcrumbs all resolve to the same route inventory.

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```
  Scenario: Internal-link graph is complete
    Tool: Browser agent
    Steps: Start from `/`; click into every Must Launch route; inspect related links on each page
    Expected: homepage reaches all Must routes and every page exposes at least 2 internal links
    Evidence: .sisyphus/evidence/task-15-link-graph.txt

  Scenario: SEO metadata stays aligned with routes
    Tool: Bash
    Steps: Request every Must Launch route plus `/sitemap.xml`; inspect canonical tags and sitemap entries
    Expected: canonical URLs, breadcrumb trail targets, and sitemap routes are consistent
    Evidence: .sisyphus/evidence/task-15-seo-integrity.txt
  ```

  **Commit**: YES | Message: `fix(seo): align internal linking and route metadata` | Files: content entries, SEO helpers, sitemap/metadata outputs

- [x] 16. Create reusable framework artifacts for scoring, page creation, and review cadence

  **What to do**: Add repository artifacts that let future trend topics reuse the system without new architecture work. At minimum, create a trend scoring template, a page-content template/frontmatter guide, and a review-cadence checklist or metadata artifact for Day 3 / 7 / 14 / 30 reviews.
  **Must NOT do**: Do not build a scheduler, admin dashboard, or automation workflow engine.

  **Recommended Agent Profile**:
  - Category: `writing` - Reason: these are durable process artifacts rather than runtime features.
  - Skills: `[]` - Standard documentation/artifact work is enough.
  - Omitted: `[agent-browser]` - Not needed for non-UI repo artifacts.

  **Parallelization**: Can Parallel: YES | Wave 4 | Blocks: [17,F1,F4] | Blocked By: [2,6,7,8,9,10,11,12,13,14]

  **References** (executor has NO interview context - be exhaustive):
  - Trend scoring model: `README.md:281-307`
  - Publish/review cadence: `README.md:337-377`
  - Framework requirements: `.sisyphus/drafts/auto-seo-happyhorse-product-spec.md:244-329`

  **Acceptance Criteria** (agent-executable only):
  - [ ] A reusable trend scoring artifact exists with the exact 30/25/20/15/10 weighting.
  - [ ] A reusable page template artifact exists that matches the typed content schema.
  - [ ] A Day 3 / 7 / 14 / 30 review artifact exists and names the required review checks.

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```
  Scenario: Framework artifacts match the spec
    Tool: Bash
    Steps: Read the scoring, page-template, and review artifacts; compare them against the spec’s required fields and cadence
    Expected: all required weights, metadata fields, and review checkpoints are present
    Evidence: .sisyphus/evidence/task-16-framework-artifacts.txt

  Scenario: Future topic reuse is practical
    Tool: Bash
    Steps: Simulate a new trend entry using only the created template artifact and content schema
    Expected: the template provides enough structure to add a new topic without altering the app architecture
    Evidence: .sisyphus/evidence/task-16-framework-reuse.txt
  ```

  **Commit**: YES | Message: `docs(framework): add scoring templates and review cadence artifacts` | Files: framework templates/checklists, content template docs

- [x] 17. Run a final fact-status and compliance polish across all pages before verification

  **What to do**: Audit every route to ensure source-backed claims, uncertainty wording, disclaimer placement, CTA consistency, generation-limit messaging, and event coverage are correct before the final review wave. Fix any unsupported wording, missing source metadata, missing `last_updated_at`, missing CTA/context fields, or missing generation state handling.
  **Must NOT do**: Do not leave “close enough” copy or metadata gaps for reviewers to catch later; do not require manual user inspection.

  **Recommended Agent Profile**:
  - Category: `deep` - Reason: this is a cross-cutting fidelity audit against the spec, not just local implementation work.
  - Skills: `[]` - Native repo inspection is enough.
  - Omitted: `[agent-browser]` - UI automation belongs to the QA scenarios only.

  **Parallelization**: Can Parallel: NO | Wave 4 | Blocks: [F1,F2,F3,F4] | Blocked By: [4,5,6,7,8,9,10,11,12,13,14,15,16]

  **References** (executor has NO interview context - be exhaustive):
  - Fact-status and required metadata: `.sisyphus/drafts/auto-seo-happyhorse-product-spec.md:238-242`, `.sisyphus/drafts/auto-seo-happyhorse-product-spec.md:338-356`
  - Compliance/disclaimer rules: `.sisyphus/drafts/auto-seo-happyhorse-product-spec.md:420-462`
  - Product acceptance requirements: `.sisyphus/drafts/auto-seo-happyhorse-product-spec.md:509-517`

  **Acceptance Criteria** (agent-executable only):
  - [ ] Every implemented page has non-empty `source_urls`, valid `fact_status`, `last_updated_at`, and disclaimer text.
  - [ ] At least one route visibly demonstrates `unknown` or `mixed` wording.
  - [ ] All primary CTAs have matching analytics event hooks and page/context data.
  - [ ] `/try-happyhorse/` visibly covers generation success, failure, and 2-free-generation limit behavior.

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```
  Scenario: Final compliance audit passes
    Tool: Bash
    Steps: Inspect all content entries and rendered routes for disclaimer text, `fact_status`, `source_urls`, `last_updated_at`, and CTA metadata
    Expected: no content route is missing required metadata or compliance language
    Evidence: .sisyphus/evidence/task-17-final-audit.txt

  Scenario: Unknown-state rendering is visible on-site
    Tool: Browser agent
    Steps: Open the chosen route with `unknown` or `mixed` data; inspect the rendered wording and CTA/disclaimer placement
    Expected: uncertainty is visible to users and still routes into a compliant CTA flow
    Evidence: .sisyphus/evidence/task-17-unknown-state.png
  ```

  **Commit**: YES | Message: `fix(content): finalize fact-status and compliance audit` | Files: content entries, CTA wiring, metadata fields, compliance copy

## Final Verification Wave (MANDATORY — after ALL implementation tasks)
> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.
> **Do NOT auto-proceed after verification. Wait for user's explicit approval before marking work complete.**
> **Never mark F1-F4 as checked before getting user's okay.** Rejection or user feedback -> fix -> re-run -> present again -> wait for okay.
- [x] F1. Plan Compliance Audit — oracle
- [x] F2. Code Quality Review — unspecified-high
- [x] F3. Real Manual QA — unspecified-high (+ browser agent if UI)
- [x] F4. Scope Fidelity Check — deep

## Commit Strategy
- Commit once after Wave 1 foundation is stable
- Commit once after Wave 2 Must Launch routes pass QA
- Commit once after Wave 3/4 supporting and ops work pass QA
- Final verification happens before any completion message

## Success Criteria
1. MVP ships exactly the scoped routes and no forbidden extras
2. Every route satisfies the spec’s content model, disclaimer rules, CTA requirements, and, where applicable, generation-state requirements
3. Build + preview + browser-based checks pass without human intervention
4. Future trend reuse is enabled by schema, templates, and review artifacts rather than by custom platform code

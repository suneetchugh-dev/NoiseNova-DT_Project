# AGENTS.md



Operational constitution, architecture standards, and safety governance for AI coding agents (Antigravity, Claude Code, Cursor, Copilot, OpenCode) working in the **CAVDAX** repository.



---



## 1. Absolute Inviolable Guardrails (Read First)

0. **Universal Strict Ban on the Word "Telemetry"**:
   - **Absolute ban**: Never use the word "telemetry" or "Telemetry" anywhere — in code, UI copy, button labels, tabs, component props, console logs, test scripts, design tokens, or documentation.
   - Replace universally with "Metrics", "Diagnostics", "Signals", "Activity", or "Observability".
   - Any usage of "telemetry" is a strict violation and must be caught and removed before completing any task.

0b. **Universal Ban on Pseudo-Terminal `//` in UI Text & Generic AI Patterns (AI Slop Purge)**:
   - **Strict Ban on `//` in UI Copy**: Never use `//` as a visual separator, status delimiter, or decorative flair in headings, subheaders, badges, plaques, cards, buttons, or tooltips (e.g. `CAVDAX // CORE DEV ENCLAVE`, `Action Verified // Provenance Intact`). Use clean standard typography: em-dash `—`, bullet `•`, pipe `|`, or whitespace. (Standard code comments `// ...` and URL protocols `https://` remain valid).
   - **Strict Ban on AI Copywriting Tropes**: Ban all empty marketing filler and AI-generated hype phrases:
     - *"Elevate your workflow / experience"*
     - *"Unlock the power of / Unleash the potential"*
     - *"Seamlessly integrate / Seamless collaboration"*
     - *"In today's fast-paced digital landscape / world"*
     - *"Revolutionize / Game-changer / Next-gen paradigm"*
     - *"A testament to / Rich tapestry / Delve into"*
     - *"Say goodbye to / Look no further"*
     - Write crisp, declarative, engineering-grade technical copy describing concrete mechanics (e.g. *"Deterministic Causal Traversal"*, *"Sub-Millisecond Invalidation"*).
   - **Strict Ban on AI Visual Clichés (Design Slop)**:
     - **No Purple/Cyan Cyberpunk Gradients**: Ban generic neon violet-to-cyan glows (`from-purple-600 to-cyan-500`). Stick strictly to the monochrome palette (obsidian, slate, zinc, stark white) with purposeful semantic accents (emerald green for verified, rose red for blocked).
     - **No Cardocalypse**: Never nest cards inside cards inside cards. Use clean typography hierarchy, subtle hairline borders (`border-white/10`), and whitespace.
     - **No Decorative 3D Wireframe Polyhedra / Sparkles**: Every visual artifact must map directly to real causal graph nodes, edges, or state vectors.
     - **Zero Emojis**: Strictly 0 emojis in UI chrome, headings, badges, tooltips, or commit messages.



0d. **Concise UI Copy, Zero Wall-of-Text & Dev Integrity Standard**:
   - **Banned Verbose Mechanical Paragraphs**: Never write bloated multi-sentence mechanical paragraphs in security gates, modal confirmations, or terminal prompts (e.g. strictly banning blocks like *"Restricted developer terminal. Hardware IP whitelist matched and authorized GitHub handle detected. Enter your Master Developer Passkey to unlock the causal intercept console."*).
   - **Rule**: Keep security and modal prompts to a single concise, punchy sentence: e.g. *"Authorized session detected. Enter master passkey to unlock the causal console."* or *"This clears active dev tokens, locks the enclave immediately, and returns to the home page."*
   - **Zero Public Leakage of Dev Endpoints & Enclave Cloaking (Strict Inviolable Rule)**:
     - In production security engineering, internal developer consoles and administrative routes must NEVER be advertised, linked, or hinted at on public pages, navigation footers, or client error messages.
     - **Zero Leakage in Tracked Repo Files (.env.example, README.md, docs/)**: Never document, list, comment, or hint at developer enclave routes, developer IP whitelists, developer handles, or master passkeys in .env.example or ANY tracked public repository files.
     - .env.example must contain ONLY public application configuration variables (database, MCP tokens, standard OAuth, billing keys). Internal developer configurations belong strictly in private, uncommitted .env files distributed out-of-band via secure channels.
     - **Universal Ban on Real or Real-Looking IP Addresses**: Never write real public IPs or ISP addresses in tracked code or comments. Only RFC 5737 documentation test nets (192.0.2.1, 198.51.100.1) or localhost (127.0.0.1) may ever appear in examples.
     - Access to the private developer enclave must remain strictly restricted to direct URL navigation, hardware IP whitelisting, and authorized GitHub handles/passkeys with silent 404 responses for unauthorized visitors without leaving breadcrumbs for public crawlers.
   - **Zero Fake Metrics or Vanity Clutter**: Never display simulated hardcoded numbers (e.g. fake client counts, fake node tallies, simulated latencies). Keep all dev console diagnostics grounded strictly in genuine operational status (e.g. Gateway: ENFORCING, Database: CONNECTED, Session: VERIFIED, Device IP: WHITELISTED).

0e. **Integration Lifecycle, Connected Workspace Monochromy & Zero Clutter Guard**:
   - **Mandatory Disconnect / Unlink Action (Reversible Lifecycle Guard)**:
     - Every connected integration, third-party repository, OAuth session, or API key MUST have an explicit, easily accessible Disconnect / Unlink / Remove action.
     - Never lock users into connected states without an intuitive, reversible teardown path.
     - Unlinking must cleanly purge local state, adjust quota meters, and smoothly transition the interface back to the default fallback or demo state.
   - **Monochromatic Connected Workspaces (No Fragmented Theme Shifts)**:
     - Connected tenant environments, repository headers, and status cards must strictly adhere to the project's calibrated monochromatic design system (`slate`/`zinc`/`neutral`/`white`/`black`).
     - Never introduce arbitrary purple, amber, cyan, or custom accent colors to distinguish tenant spaces.
   - **Zero Promotional Demo Clutter in Real User Workspaces**:
     - Once a user has connected their own repository or tenant project, never display promotional or redundant demo-mode action cards (such as "Run 4-Act Showcase" or "Evaluate Mock Sandbox").
     - Empty states in authentic user workspaces must focus 100% on onboarding the user's own repository (scaffolding an architectural baseline or displaying CLI ingestion instructions).
   - **GitHub Organization OAuth Ingestion Rule**:
     - When querying user repositories via the GitHub API (`/user/repos`), always include `affiliation=owner,collaborator,organization_member` so organization-owned repositories are not silently filtered out.


0f. **Production Developer Console Dignity & Ban on Toy/Detour Paradigms**:
   - **Console Dignity Standard**: The platform must always maintain the calm, rigorous authority of an enterprise infrastructure console. Decisions, copies, or architectural controls must never make the console feel like a temporary student toy, marketing detour, or toy sandbox.
   - **Zero Demo Detour Buttons in Production Workspaces**: Never place buttons like "Return to Showcase" or "Back to Demo" inside connected tenant workspaces. Workspace switching belongs strictly in top-level navigation.
   - **Onboarding vs Incident Framing**: Zero-state configurations (e.g. 0 ADRs detected) are normal onboarding lifecycle states, NOT incidents or system warnings. Never use amber warning icons (`AlertCircle`) for empty states; use monochromatic neutral glyphs (`FolderGit2`).
   - **Single Monochromatic Onboarding CTA**: Ban multi-card promotional clutter in tenant empty states. Provide a single monochromatic setup action and terminal instructions.

0g. **Mandatory UI Design System MD Enforcement & Zero Displacement Toast Architecture**:
   - **Mandatory Consultation of `docs/UI_DESIGN_SYSTEM.md`**:
     Whenever creating, editing, removing, adding, or modifying ANY UI component, panel, modal, badge, button, or layout (specifically including the Developer Enclave, Profile Page, HUD consoles, and tier testing panels), agents MUST first read and dedicatedly adhere to `docs/UI_DESIGN_SYSTEM.md`. No exceptions.
   - **Strict Ban on In-Panel Displacing Banners and Toasts (Zero CLS Guarantee)**:
     - Never render confirmation banners, error notices, or dynamic toasts inline inside cards, above lists, or within grid containers where their appearance or disappearance causes vertical layout displacement, jumping, or layout shifts (CLS > 0) of sibling panels, input fields, or buttons.
     - All operation feedback (e.g. tier toggles, IP whitelisting, roster changes, scenario injection) MUST use non-displacing viewport-fixed overlays (`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none`) or dedicated pre-allocated zero-shift status indicators.
   - **Monochromatic Purity Standard**:
     - All developer panels, controls, and notices must strictly use the project's obsidian, slate, zinc, porcelain, and monochrome scale (`border-slate-300 dark:border-white/10 bg-slate-100/50 dark:bg-white/[0.02]`).
     - Ban all uncalibrated color fills (purple, cyan, yellow, pink) unless signifying strict, verified semantic operational states (e.g. green for cryptographic verification pass, red for blocked security denial).

0h. **Settings Panel Ergonomics, Subtext Cleanliness & Anti-Debug Scaffolding Standard**:
   - **Strict Ban on Leaking Code Implementation Details in End-User Copy**:
     - Never display internal hexadecimal color codes (e.g. `(#060709)`, `(#F8FAFC)`), CSS class names, regex patterns, or raw token identifiers in user-facing settings, modal subtexts, or UI cards.
     - Always use clean, human-readable semantic naming (e.g. `Deep Obsidian Dark`, `Porcelain Light Minimalist`).
   - **Strict Ban on "Test" / Audition Scaffolding Buttons Crammed Next to Toggles**:
     - Never insert clunky rectangular "Test" or "Audition" button pills into settings rows next to toggle switches.
     - Toggling or interacting with the control itself must provide immediate sensory/auditory feedback.
     - Maintain a strict, unbroken two-column rhythm: `[Icon + Label + Optional Subtext] -------------- [Control/Toggle]`.
   - **Strict Ban on Fake / Unowned Domains in Production Code and Error Prompts**:
     - Never reference unowned placeholder domains (e.g. `team@cavdax.org`, `support@xyz.fake`). Use the real verified production domain (e.g. `contact@sahnirmaan.live`) or a dedicated team mailbox.
   - **Pricing Cleanliness, Currency Localization & Anti-Combobox Standard**:
     - Enterprise tiers must remain clean and authoritative: `Custom / SLA` with a "Contact" CTA. Never introduce messy multi-comboboxes or feature calculation sliders inside public pricing cards.
     - Never show simultaneous dual currencies (`$4 / ₹320`) in primary pricing card headings. Detect geo-location (INR for India, USD globally) and provide a subtle, non-displacing currency switcher in the section header.
     - Free tiers must be perpetual community tiers with clear resource ceilings; time-limited trials belong as explicit trial windows on paid tiers (e.g. "Includes 7-Day Free Pro Trial").

0i. **Hackathon Evaluation Mode & Real-Time Tier Unlocking Architecture**:
   - **Developer Enclave Master Control**: The secure Developer Enclave must provide an executive `Hackathon Evaluation Mode [ OFF / ON ]` toggle that sets global server state and broadcasts updates via Server-Sent Events (`/api/events`).
   - **Evaluation Pass Capabilities**: When ON, all visitors receive an Evaluation Pass granting full Enterprise Mesh capabilities (unlimited repositories, causal graph inspection, unthrottled quotas). Tier locks are lifted, displaying `EVALUATION PASS` badges and allowing frictionless switching.
   - **Commercial Display Integrity**: Tier cards remain visible with real pricing to prove commercial viability to judges.
   - **Elevated Rate Ceiling**: Expands per-IP rate limits to 1,200 req/min (20 req/sec) to guarantee zero throttling during evaluation, while avoiding `skip: true` to keep the server shielded against bots.
   - **Instant Reversion**: Toggling OFF instantly restores standard production enforcement across all clients without redeployment.

0j. **Inviolable Guard: Zero Split-Brain Session Desynchronization & Auth State Coherence**:
   - **Server Session is the Single Source of Truth**: The backend session state (`req.session.user` / `/api/auth/me`) is the absolute authority on user authentication. LocalStorage (`cavdax_user_session`) is strictly an ephemeral UI cache, NEVER an override or replacement for backend authentication status.
   - **Immediate Invalidation on 401 / Unauthenticated**: Whenever ANY API endpoint returns `401 Unauthorized` or `{ authenticated: false }`:
     - Never preserve or fall back to stale `localStorage` user objects.
     - Immediately purge `localStorage.removeItem('cavdax_user_session')`.
     - Dispatch `window.dispatchEvent(new CustomEvent('cavdax:user-changed', { detail: null }))` so that the navbar, profile, modal connectors, and workspace immediately synchronize without creating "phantom" logged-in states.
   - **Mandatory `{ credentials: 'include' }` on All Internal API Calls**: Every frontend `fetch()` targeting an internal route (`/api/...`) that reads or mutates user data, listed repositories, API keys, quotas, or graph mutations MUST explicitly declare `{ credentials: 'include' }`. Omitting credentials leads to silent session drops and false 401 errors.
   - **Never Render Misleading "Empty Data" on Authentication Failures**: When an authenticated fetch (such as listing GitHub repositories or reading API keys) fails due to session expiration (401 / unauthenticated), NEVER silently swallow the error and render misleading empty copy like *"No repositories found."* Always render an informative session-expiration state informing the user that the backend process was updated, along with a direct 1-click re-authentication button (`[ Reconnect GitHub ]`).
   - **Stable Deployment Session Secrets**: In production or containerized environments, Express session middleware (`express-session`) must NEVER generate ephemeral in-memory random secrets (`randomBytes(32)`) on boot without a stable persistent fallback. Random secret regeneration invalidates all signed cookies across process restarts, causing widespread session desynchronization after every production deployment.

0k. **Inviolable Guard: Zero Hardcoded Benchmark Strings or Fake Latency Fallbacks (Section 37 Truth-in-Data Standard)**:
   - **Absolute Ban on Fake Latency Constants & Fallback Coercion**:
     - Never use synthetic numerical constants or logical OR fallbacks for elapsed times, latencies, or response durations (e.g. `parseFloat(elapsed.toFixed(2)) || 0.42`, `res.latency || 0.5`, `const latency = "1.2ms"`).
     - When an operation completes in sub-millisecond or sub-microsecond time (e.g. in-memory or cached lookups taking nanoseconds), measure and report true high-resolution execution delta using `process.hrtime.bigint()` (or `performance.now()`) converted cleanly without artificial floors:
       ```javascript
       const startNs = process.hrtime.bigint();
       // ... execution ...
       const elapsedMs = Number(process.hrtime.bigint() - startNs) / 1e6;
       ```
     - If a measurement is `0.00ms` or sub-millisecond, report the true measured metric (or exact microsecond/nanosecond values like `0.01ms` or `667ns`). NEVER substitute an arbitrary constant like `0.42ms` to "look realistic" in logs or UI badges.
   - **Absolute Ban on Hardcoded Benchmark Outcomes & Results**:
     - Never hardcode synthetic failure or success rates in benchmark runners, evaluation scripts, or test harnesses (e.g. hardcoding `ragSuccess: false`, `accuracy: 0.10`, `"10/10 silent hallucinations"`, `~450ms RAG latency`).
     - All benchmark comparisons, stress tests, and evaluation harnesses must execute genuine programmatic evaluations, actual vector similarity checks, real token consumption calculations, and live graph traversal queries.
     - If a scenario or test case fails or succeeds, it must be the true runtime outcome of the executed algorithm. External judges, auditors, and technical reviewers inspect source code; hardcoding results destroys project credibility and violates Section 37 truth-in-data hackathon integrity.
   - **Fail-Closed Gate Traversal vs Fictitious Fallback Approvals**:
     - Never simulate or bypass database graph queries with hardcoded client-side mocks or unchecked pass-throughs when validating actions against architecture decisions.
     - Invalidation checks must verify real graph nodes in FalkorDB (or the real in-memory DAG); if an unknown or malformed decision ID is supplied, the gate must fail closed (`REJECT / 404 / 403`), never fail open with a mocked approval.
   - **Automated Static Analysis & Grep Audit Verification**:
     - Enforce pre-commit and CI scans for suspicious fake-metric patterns:
       ```bash
       grep -rnE '\|\|\s*0\.[0-9]+|"10/10|ragSuccess:\s*false' .
       ```
     - Any commit introducing hardcoded benchmark strings or fake latency constants will be rejected at pre-commit.

0c. **Production Deployment & Docker Parity Guard (Zero 502 Bad Gateway Standard)**:

   - **Mandatory Dockerfile Dependency Parity**:
     - Whenever packages are added to pps/server/package.json or pps/client/package.json (e.g. xpress-session, xpress-rate-limit), the corresponding Dockerfile MUST install all production dependencies (
pm install --omit=dev). Never hardcode a partial subset of packages that causes runtime ERR_MODULE_NOT_FOUND crashes in production containers.

   - **Full-Stack Mesh & Reverse Proxy Liveness**:
     - The production deployment workflow (.github/workflows/deploy.yml) must always launch the entire production mesh including the reverse proxy (caddy), which binds to ports 80 and 443 and terminates SSL for Cloudflare.
     - Deployment workflows must pre-emptively remove stopped or conflicted containers (docker rm -f cavdax-client cavdax-server cavdax-falkordb cavdax-caddy 2>/dev/null || true) before invoking docker compose up -d --build --remove-orphans to guarantee zero daemon collisions.

   - **OAuth & Environment Variable Forwarding**:
     - infra/docker-compose.prod.yml must explicitly forward OAuth and authentication keys (GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, GITHUB_CALLBACK_URL, SESSION_SECRET) into container services so OAuth flows redirect accurately instead of failing silently.

   - **API Liveness Verification**:
     - After any production update, verify that /api/* endpoints respond with standard application JSON/redirects and never proxy 502/503 bad gateway envelopes.




1. **NEVER Commit Credentials, Secrets, or Sensitive Identifiers**:

   - **Zero Credentials in Git**: Never stage or commit API keys, auth tokens, passwords, private keys, connection strings, or cloud secrets.

   - **Never Commit `.env` / `.env.*` Files**: Only `.env.example` with harmless placeholders (`your_key_here`) may be tracked.

   - **Never Hardcode Secrets in Source**: Access keys exclusively via runtime environment variables (`import.meta.env.VITE_*`, `process.env.*`).

   - **Enforcement**: Run a staged secret scan before any commit. If a hook or pattern matches credentials, unstage, redact, and verify before proceeding.



2. **Zero False Claims & Accurate Concept Framing**:

   - Clearly frame hackathon projects as **concepts, prototypes, and research architectures**.

   - Never claim unauthorized official affiliations, state endorsements, or partnerships with real institutions, corporations, or government bodies unless legally contracted.

   - Replace real institutional names with generic examples (e.g. `Example Municipal Grid`, `Sample CSR Sponsor`) on public surfaces.

   - Never claim to hold or move live third-party financial escrow funds unless operating in a sandbox test mode.

2b. **Mandatory Continuous Updating of Prompts & Dev-Assets (Knowledge Persistence Rule)**:

   - Whenever a new component, fluid micro-interaction, architectural pattern, security fix, or high-value solution is designed and implemented, the AI agent must immediately update or append the corresponding master guide in C:\(Lectures)\+[Dev-Assets]\#(AI-AGENTS)\#Prompts in a generalized format with clear ASCII architecture diagrams, mathematical curves, and verified React/CSS implementations.



3. **Mandatory Pull Before Every Working Session**:

   - **Always pull before starting**: Before inspecting files, editing code, starting dev servers, or planning tasks, run `git pull` (or `git pull --rebase`) on your active branch.

   - Stale working copies cause design regressions and merge collisions. Sync local git state first, read `docs/DEV_SESSION_STATE.md`, and only then begin work.



4. **UTF-8 Encoding & Mojibake Prevention**:

   - All repository files are **UTF-8 without BOM**.

   - Never read, edit, or save files using Windows-1252, Latin-1, or system default encodings.

   - Maintain non-ASCII characters intact (Devanagari, Ol Chiki, em dashes `—`, box drawing characters).

   - Verify touched files for mojibake or C1 control characters (`U+0080–U+009F`) before completing tasks:

     ```bash

     grep -P "[\x80-\x9f]" <file> && echo "MOJIBAKE DETECTED"

     ```



---



5. **Mandatory Asset & Artifact Categorization Rule**:

   - **Never dump files into flat parent directories**: Any generated brand assets, typography explorations, logo variants, banners, or component screenshots must be categorized immediately into dedicated domain-specific subfolders.

   - **Standard Categorization Layout**:

     * Wordmark typography & logotypes -> docs/brand_explorations/wordmarks/

     * Monograms, DAG shields, & execution gates -> docs/brand_explorations/logos/

     * Technical publication banners & headers -> docs/brand_explorations/banners/

     * 3D conceptual art & protocol diagrams -> docs/brand_explorations/concepts/

     * Live browser captures & component previews -> docs/brand_explorations/previews/

      - **Continuous Typography Dossier Maintenance Rule**: Whenever ANY new wordmark or typography exploration is created, you MUST immediately update `docs/brand_explorations/wordmarks/TYPOGRAPHY_SPECIFICATION.md` in the same turn with its comprehensive technical anatomy, design inspiration, glyph geometry (terminals, apexes, apertures, stroke weight), causal graph baseline specs, and relative asset links. Never leave an asset undocumented.

   - **Semantic Naming & Indexing**: Every file must bear a clean, semantic name (e.g. wordmark-tech-01-squircle-aerospace.jpg) without random timestamp hashes, and every archive directory must maintain a catalog README.md documenting all assets.





---



## 2. The Mandatory UI/UX Pre-Flight Interceptor Loop



Whenever your current task touches, modifies, refactors, creates, adds, or **REMOVES/DELETES** ANY user interface component, style, page, section, or layout, **YOU MUST FIRST READ & RECONCILE with `docs/UI_DESIGN_SYSTEM.md` BEFORE WRITING, EDITING, OR DELETING ANY CODE**:



```

[UI/UX Task Triggered: Add / Modify / Touch / Delete]

                          │

                          ▼

┌────────────────────────────────────────────────────────┐

│  STEP 1: Read & Reconcile with UI_DESIGN_SYSTEM.md     │

│  • Check tokens, typography, radii, spacing, physics   │

│  • Verify no bans are violated before adding/deleting  │

└─────────────────────────┬──────────────────────────────┘

                          ▼

┌────────────────────────────────────────────────────────┐

│  STEP 2: The Inviolable Ban Audit                      │

│  • Are there any emojis? (🟢, 🔴, ⚠️, 🤖, ✨) ➔ BAN    │

│  • Are there Gemini / AI sparkles? ➔ BAN               │

│  • Are there colored status orbs / pulsing dots? ➔ BAN │

│  • Are there bracketed tags? ([LIVE], [VERIFIED])➔ BAN │

│  • Are there generic shield SVGs? (Shield) ➔ BAN       │

│  • Are there cliché icons? (Rocket, Bot, Trophy) ➔ BAN │

│  • Are there hackathon track tags / pills? ➔ BAN       │

│  • Are there status tags/pills beside headings? ➔ BAN  │

│  • Are there card clutter, filler, or fluff? ➔ BAN     │

└─────────────────────────┬──────────────────────────────┘

                          │

                          ▼

┌────────────────────────────────────────────────────────┐

│  STEP 3: Interaction, Motion, Cursors & Audio          │

│  • Segmented tabs using static CSS swaps?              │

│    ➔ Replace with Framer Motion <motion.div layoutId>  │

│  • Are custom SVG cursors wired from public/cursors/?  │

│    ➔ Copy from sister projects or prompt user          │

│  • Are subtle click sounds wired from public/sounds/?  │

│    ➔ Copy click.mp3 or synthesize via Web Audio API    │

│  • Is Lenis smooth inertial scroll mounted?            │

│    ➔ Verify root instance, RAF guard, data-lenis-prevent│

│  • Are spring physics snappy? (stiffness 420, damp 34) │

└─────────────────────────┬──────────────────────────────┘

                          │

                          ▼

┌────────────────────────────────────────────────────────┐

│  STEP 4: Layout Stability, Mobile & Responsive Audit   │

│  • Is this a public page (Landing / Team)?             │

│    ➔ Ensure NO guided tours are mounted                │

│  • Is there any "lone pair" / dangling element?        │

│  • Does desktop fit without overflow-y (HP Victus)?   │

│  • Mobile view (< 768px):                              │

│    - Snap pagination: 2-3 logical sections per slide   │

│    - Portfolio dock pattern: bottom dock consolidation │

│    - Mobile bottom nav: max 5 tabs + FAB               │

│    - Safe area inset protection: pb-[env(safe-area...)]│

└─────────────────────────┬──────────────────────────────┘

                          │

                          ▼

             [Proceed to Implement UI]

```



### Pre-Flight Verification Checklist:

1. **Did I read `docs/UI_DESIGN_SYSTEM.md` (or `UI_DESIGN_SYSTEM.md`)?** Every single UI action — whether adding a new element, modifying existing styles, refactoring layout structure, or removing/deleting a component — must be reconciled against the design system rules, spacing tokens, color palettes, motion physics, and top-priority bans before touching code.

2. **Are there any emojis or sparkles?** Replace them immediately with clean Lucide line icons.

3. **Are there bracketed status tags or status tags beside headings?**

   - Remove brackets (e.g., convert `[VERIFIED]` to `VERIFIED` with unbracketed monospace styling).

   - **Strictly ban status badges / pills beside main headings**: Never place floating tags (e.g., `GraphBLAS Live`, `FalkorDB Live`, `Simulation`, `[LIVE]`) alongside or inline with `h1` or `h2` headings. Headings must remain clean, dignified, and uncluttered. System metrics belongs strictly in dedicated toolbar metrics, status bars, or subheaders.

3b. **Strict Ban on the Word "Telemetry"**:

   - Never use the word "telemetry" or "Telemetry" on ANY user-facing surface, UI chrome, documentation, or code labels. Replace universally with "Metrics", "Signals", "Activity", "Diagnostics", or "Analytics".

3c. **Extreme Minimalism & Clutter Minimization**:

   - Every page (Profile, Support, Overview, Console, MCP, Audit) must be extremely clean, uncluttered, and minimalistic.

   - Ruthlessly remove unnecessary text, redundant badges, repetitive helper paragraphs, and bulky decorative blocks. Keep necessary text concise, punchy, and restrained. If 5 words suffice, never use 20.

3d. **Strict Ban on Tags inside Card Titles / Card Headers (`VALID`, `SIMULATION`, `[LIVE]`)**:

    - Never place badge tags or status chips (e.g., `VALID`, `SIMULATION`, `ACTIVE`, `PENDING`) inside card headers or next to card title text. Titles must strictly display pristine typography. Status or metadata belongs in dedicated tabular rows or discrete data cells below, never as badge chips next to titles.

3e. **Strict Ban on External Prototype / Student References**:

    - Never include mentions of external hackathon identifiers or legacy project names like SAHNIRMAAN in the client application. The platform presents itself cleanly as CAVDAX.

3f. **Persistent Interaction Fills for Action Buttons**:

    - Interactive fill buttons (such as Connect GitHub and Sponsor) with fluid wave/water animations must latch/persist once hovered or activated, maintaining their full state instead of vanishing when mouse leaves.

4. **Are there generic shield SVGs or cliché icons?**

   - Strictly ban generic shields (`Shield`, `ShieldCheck`, `ShieldAlert`, `ShieldQuestion`).

   - Use precision domain alternatives:

     - Alerts Navigation & Header: `<Bell />`

     - Critical Danger Alerts: `<Radio />` (active real-time emergency broadcast)

     - Live Sensor Metrics Alerts: `<Activity />`

     - Imminent Hazard Popups: `<AlertTriangle />`

     - All Clear / Nominal State: `<CheckCircle2 />`

     - Auth & Credentials: `<Lock />` or `<KeyRound />`

     - Safe Routes: `<Route />`, `<Navigation2 />`, or `<Compass />`

   - Ban cliché icons: `Rocket`, `Bot`, `Lightbulb`, `Trophy`. Use `ArrowUpRight`, `Terminal`, `Cpu`, `TrendingUp`, `BarChart3`.

5. **Are segmented tabs using static CSS background swaps?** Replace with `<motion.div layoutId="uniqueDomainPill" />` using critically damped springs (`stiffness: 420, damping: 34`).

6. **Are custom SVG cursors included?**

   - Verify `public/cursors/` contains `default_cursor.svg`, `hand-pointer.svg`, `cover_hand_grab.svg`, `resize-*.svg`.

   - If missing, copy or synthesize them.

7. **Are subtle click sounds wired via `soundFx.js`?**

   - Verify `public/sounds/` contains `click.mp3` or Web Audio API procedural chime synthesis.

   - Verify low-latency Audio Pool, volume control (`0.30 - 0.35`), and `localStorage` mute toggle (`cavdax_sounds_muted`).

8. **Is Lenis smooth scroll installed and configured?**

   - Verify RAF loop only steps when `scrollHeight > innerHeight + 10` (power-saving guard).

   - Ensure modals, maps, and inner scrollbars have `data-lenis-prevent`.

9. **Are cards using bouncy zoom (`hover:scale-105`) or border-width swaps?** Replace with subtle `-translate-y-0.5` lift, specular highlight brightening, and constant 1px border thickness.

10. **Is body text multi-line centered?** Left-align body copy (`text-left`); center only short single-line subheaders.

11. **Is typography using the architectural standard?** `Inter` or `Geist Sans` with `tracking-tight` for titles, and `JetBrains Mono` or `Geist Mono` with `tabular-nums` for badges/metadata.

12. **Is this a public page (Landing `/` or Team `/team`)?** Ensure NO guided tours or tour buttons are mounted.

13. **Is there any "lone pair" element?** Ensure every control sits in a balanced, symmetrical container.

14. **Is there unnecessary desktop `overflow-y`?** Ensure panels expand with adequate headroom and zero unwanted scrollbars on standard laptop screens.

15. **Is mobile snap pagination applied for dense sections?** Use `snap-y snap-mandatory` with 2–3 logical sections per slide.

16. **Are mobile category tabs/controls consolidated?** Apply the portfolio bottom-dock pattern with the `<head>` anti-FOUC script.

17. **Is the mobile bottom navigation bar adhering to standards?** Max 5 destinations with symmetrical 2+1+2 layout, prominent centered raised FAB, safe area inset padding, unmounted on auth/landing/team pages.

18. **Are sibling action buttons symmetrical?** Sibling action buttons must share identical heights, border radii, and font metrics.

19. **Brand Wordmark & Particle Canvas Typographic Parity Rule**: The brand acronym (`CAVDAX`) rendered across hero watermarks, canvas stippling engines, or footer particle pointillism canvases (`FooterParticles.jsx`) must STRICTLY match the bespoke typography style, font family, weight, and geometric anatomy of the official **CAVDAX Wordmark** (`CavdaxWordmark.jsx`).

    - **Never use generic system/fallback fonts** (e.g. `Inter` bold or standard sans) that corrupt brand geometry with rounded terminal curves.

    - **Canvas Vector Fidelity**: For canvas rasterization of the brand acronym, directly rasterize the exact vector geometry contours (`CAVDAX_WORDMARK_LETTERS_PATH` via `Path2D`) featuring Swiss 90-degree orthogonal terminal cuts on 'C' and 'D', razor-sharp mitered apexes on 'A', 'V', 'X', and calibrated monoline stroke weight.

    - **Typography Fallback**: If standard text rendering is invoked, strictly enforce the Swiss Architectural Grotesk specification (`Space Grotesk` 900 Ultra-Black weight, uppercase, wide tracking) matching the Wordmark DNA.

20. **Mandatory Card & Component De-Clutter Audit**: Before creating or editing ANY UI component, ruthlessly audit all copy and chrome. Remove all clutter, unnecessary text, redundant labels, explanatory filler, duplicate status tags, and decorative metadata that do not serve an indispensable purpose (neither for critical technical explanation nor for genuine visual clarity). If text or metadata does not actively help the user make an immediate decision or understand state, it must be removed. Visuals and clean typography must do the heavy lifting; text must be surgical, concise, and minimal.

21. **Bidirectional Docking Horizontal Card Scroller Standard**: When implementing locked horizontal card sequences or 3D rolling cylindrical windows, strictly enforce:

    - **Normalized Center-Distance Docking**: Calculate viewport docking using normalized vertical center-distance (`Math.abs(sectionCenter - viewportCenter) < 0.35 * H`) rather than fragile top/bottom inequalities.

    - **Synchronous Mutable Reference Mirroring**: Mirror all active state in a Synchronous Ref Triad (`isLockedRef`, `activeStepRef`, `isExitingRef`) to eliminate React re-render closure lag across high-frequency trackpad streams.

    - **Directional Entry Parity**: Top-to-bottom entry seeds Step 0 (`autoDirection = 1`); bottom-to-top entry seeds Step N-1 (`autoDirection = -1`).

    - **Gesture Debounce Cooldown (380ms)**: Enforce `isTransitioningRef.current = true` for 380ms after each card advance, mapping one physical trackpad flick to one card transition.

    - **Natural Directional Lock-Outs**: Downward exit glides to following section; upward exit glides to preceding section's bottom edge (`el.offsetTop - 0.75 * H`), never to `0px`.

    - **Lenis Force-Execution Parameter**: Always pass `{ force: true }` to `window.__lenis.scrollTo()` and call `window.__lenis.start()` so programmatic exit commands execute reliably without stalling.

    - **Multi-Plane 3D Parallax Separation**: Outer stage establishes `perspective: 1200px` without `transformStyle: 'preserve-3d'` to ensure standard 2D DOM hit-testing and clickable negative-Z flanking cards (`zPos = -100px`, `scale: 0.82`, `rotateY: ∓24deg`, `opacity: 0.40`). Center active card floats forward at `zPos = +20px`. Inside each card, graphic content is separated along the Z-axis with `transform: translateZ(28px)`.

    - **Direction-Aware 10s Auto-Scroll & Countdown Fill**: The stage auto-cycles cards every 10.0 seconds along the active browsing direction ($01 	o 04$ downward, $04 	o 01$ upward). Active HUD pill renders an inner `0%` to `100%` width countdown fill layer (`bg-white/25` / `dark:bg-slate-950/25`) behind the `z-10` text.

    - **WCAG 2.2.2 Hover Pause**: Cursor entry into the stage container immediately freezes the auto-advance countdown and holds the inner pill progress bar steady.

    - **Directional Card Clicking**: Clicks on the right 35% of the center card advance to next; clicks on the left 35% step backward. Flanking cards capture clicks directly with `e.stopPropagation()`.

    - **Monochromatic Vertex Outlines**: Superseded/invalidated nodes must feature a crisp, solid circular monochromatic outline (`stroke-slate-950 dark:stroke-white/80`, `strokeWidth="1.8"`). Strictly ban gray dotted circles, dashed rings, or reticle tick clutter.

22. **Continuous Causal Provenance Radar Standard**:

    - Restrict all radar targets to `radiusRatio <= 0.66` to prevent label/pin clipping on 16:9 laptop screens when scaled to 1.25x in theater mode.

    - Strictly ban rectangular card borders around polar grids (pure unbounded HUD only).

    - Synchronize target discovery to the physical sweep beam angle: $\theta_{\text{beam}}(t) = (t / 14000) \times 360^\circ$.

    - Use calibrated exponential phosphor trailing decay $\alpha = (1 - p)^{1.8}$ over a $53^\circ$ trailing window.

    - Keep runways tight ($\le 150\text{vh}$) to eliminate dead-space voids.

23. **Causal Knowledge Graph Web Canvas Standard**:

    - Strictly enforce the **Invisible Cursor Probe Rule**: never draw a visible dot on the mouse pointer; project hairline vector edges from nearby nodes into the transparent cursor coordinates.

    - Maintain a minimum 24px exclusion buffer around wordmarks and primary buttons with tangential deflection glide.

    - Enforce dual-hemisphere node balancing (35 upper / 60 lower) with soft restorative springs to prevent gravitational settling.

    - Schedule biomimetic swarm migrations across key waypoints using alternating short flits (2.2s–4.5s) and long roosts (6.0s–10.5s).

24. **The Critical Critique & Anti-Pattern Defense Protocol**:
    - **Mandatory Premise Scrutiny**: Whenever the user, another agent, or a feature proposal suggests a UI pattern, design adjustment, copy change, or architecture decision, the agent MUST NOT blindly agree or immediately implement. First evaluate whether the underlying premise is valid, whether it solves a real user problem, or whether it creates an anti-pattern.
    - **Dual Perspective Auditing (Designer vs. User)**:
      - *Designer Perspective*: Does it preserve visual hierarchy, negative space, typography balance, and aesthetic restraint? Does it fight clutter or add noise?
      - *User Perspective*: Does a first-time visitor immediately understand the affordance without clicking, hovering, or guessing? Is the primary call-to-action upfront or buried inside an unrelated dropdown/demo tab?
    - **Root Out Classic & AI Anti-Patterns**: Explicitly hunt for and prevent anti-patterns documented in `UI_DESIGN_SYSTEM.md#36` (e.g. Mystery Meat Navigation, Hidden Critical Paths, Cargo Cult UI, Bento Card recursive slop, low-contrast grays, orphan icons).
    - **Constructive Synthesis**: Present a concise, critical critique, state the established industry standard (e.g., Linear, Vercel, Stripe), explain the trade-offs, and offer ranked, actionable alternatives before touching code.

25. **Mandatory Cloudflare 7-Phase Security Audit Gate Before Merging to `main`**:
    - **Inviolable Pre-Merge Security Requirement**: No branch (`frontend`, `backend`, `docs`) may ever be merged into `main` until the agent has executed a formal security audit against all 7 phases of the Cloudflare Security & Pen-Test Playbook (`##Global-Cloudflare-Security-Audit-And-Hardening-Playbook.md`):
      1. *Phase 1 (Boundary & Trust Mapping)*: Zero client-side validation trusted as a security boundary; all HTTP, WebSocket, and MCP inputs validated server-side.
      2. *Phase 2 (Auth & Session Gate Inspection)*: All protected routes verify cryptographic signatures or authenticated web session cookies (`req.session?.user`); zero privilege escalation vectors.
      3. *Phase 3 (Injection & Path Traversal Hunting)*: Strictly confine all file paths using `path.resolve(REPO_ROOT)` and `startsWith`; all database queries parameterized `{ params }` with zero string concatenation.
      4. *Phase 4 (Business Logic & Financial Integrity)*: Constant-time HMAC verification (`timingSafeStringEqual`); server-side order and tier authority; zero client-supplied tier overrides.
      5. *Phase 5 (Security Headers, CORS & Dependency Hygiene)*: Strict CSP, HSTS, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, strict CORS origin allowlists, zero critical/high CVEs.
      6. *Phase 6 (Cloudflare Edge & Zero-Trust Architecture)*: Reverse proxy SSL termination, reverse proxy trust (`trust proxy: 1`), rate limiting, zero public exposure of raw backend IPs or dev endpoints.
      7. *Phase 7 (Advanced Memory & Session Lifecycle Hardening)*: Automatic key map re-hydration (`SEC-KEY-03`) across worker restarts; emergency key revocation epoch checks; input length/type sanitization.
    - **Strict Gatekeeper Enforcement**: Only when ALL 7 phases pass 100% green with zero critical, high, or medium findings may an agent seek developer approval to merge into `main`. If ANY vulnerability or defect is detected, the agent MUST resolve all findings on the feature branch, re-audit, and verify a clean passing report before merging.

26. **Mandatory Documentation & README Synchronization Gate Before Merge & Push**:
    - **Inviolable Documentation Sync Requirement**: Whenever any feature, bugfix, architectural enhancement, MCP tool addition, or security modification is made, the agent MUST evaluate whether project documentation (`docs/`), technical specifications (`docs/MCP_SPECIFICATION.md`, etc.), or `README.md` need to be updated.
    - **Update in the Same Pass**: If any documentation, MD spec, or `README.md` requires synchronization, the agent MUST draft, refine, and commit the documentation updates on the appropriate branch (`docs`) in the same development pass *before* requesting approval, opening pull requests, or merging into `main`.
    - **Never Ship Code Ahead of Documentation**: Code and documentation must move in strict lockstep. It is a fatal governance defect to push code changes while leaving `README.md` or technical specifications describing stale, outdated, or incomplete capabilities.

27. **Mandatory Zero-Knowledge Enclave Cloaking Gate (Pre-Commit Scan)**:
    - **Inviolable Enclave Cloaking Requirement**: Before any commit or PR is merged into `main`, the agent MUST verify that no tracked files (specifically `.env.example`, `README.md`, `docs/`, public templates, or client assets) leak or mention:
      1. Internal developer routes or internal operational consoles.
      2. Developer enclave authentication variables or passkey secrets.
      3. Real public IP addresses, cloud VM IPs, or ISP subnet identifiers.
    - **Strict Gatekeeper Enforcement**: Any hit in tracked repository files is a critical security vulnerability and must be completely purged before staging and merging.



---



## 3. Git Branch Hygiene & Commit Governance



- **Never work directly on `main`**: `main` is the integration and production-truth branch.

- **Dedicated Branch Structure (Domain Separation)**:

  - `frontend`: Exclusively for client UI/UX code (`apps/client/`, `assets/`, styles, components).

  - `backend`: Exclusively for API, database, and MCP services (`core/`, `apps/server/`, `infra/`).

  - `docs`: Exclusively for documentation files (`docs/`, `AGENTS.md`, `README.md`).

- **Inviolable Commit Policy: Developer Permission is MANDATORY**:

  - Never commit or push code without explicit developer permission.

  - Do NOT run `git commit` or `git push` automatically during a session.

  - Only when the developer explicitly commands (e.g., *"commit and push"*, *"we are done with this session"*), execute the formal **End-of-Session Domain-Partitioned Git Governance Protocol**.

- **End-of-Session Domain-Partitioned Protocol**:

  1. **Pre-flight Audit**: Check `git diff` for secrets/credentials, and run local verification build (`npm run build`).

  2. **Atomic Domain Segregation**: For each active domain with changes (`docs`, `backend`, `frontend`), checkout that branch (create from `main` if it doesn't exist), stage **ONLY** that domain's files (`git add docs/`, `git add apps/client/`), commit cleanly, and push (`git push origin <domain>`).

  3. **Sequential Pull Requests & Descriptive Merges to `main`**:

     - Raise a formal GitHub PR from each feature branch to `main`: `gh pr create --base main --head <domain> --title "..." --body "..."`.

     - **Descriptive Merge Commit Requirement**: Every PR merge commit to `main` must NEVER be generic (banned: `merge: integrate <domain> into main`). It must explicitly specify:

       - **WHAT** was merged (components, services, documentation updated).

       - **WHY** it was merged (architectural intent, design system adherence).

       - **WHAT PROBLEM IT SOLVED** (concrete bug, layout shift, visual defect, or omission resolved).

     - Merge via `gh pr merge <number> --merge --delete-branch=false --subject "..." --body "..."` sequentially, running a local build verification check (`npm run build`) between each merge.

     - Return to the active feature branch (`git checkout frontend`).

- **Conventional Commit Standard**:

  - Use conventional prefixes: `feat:`, `fix:`, `docs:`, `refactor:`, `perf:`, `test:`, `chore:`.

  - Add `[skip ci]` to documentation/backend commits that do not trigger frontend builds to preserve daily Vercel deployment quotas.

- **Atomic Feature Squashing & History Cleanliness (Mandatory)**:

  - **Ban on Micro-Commit Churn**: Avoid polluting Git commit history with rapid, back-and-forth micro-commits (e.g., *"shift 4px down"*, *"shift a bit up"*, *"fix padding"*, *"revert size"*).

  - **Session-Level Squashing of Related Changes**: When multiple commits made during recent active pair-programming iterate on or refine the same underlying feature, always squash them into a single, cohesive, atomic commit before concluding the session or opening a PR to `main`.

  - **Atomic Milestone Integrity**: A feature commit in history must represent a complete, functional milestone where `npm run build` passes cleanly, not intermediate trial-and-error steps.

  - **Safe Remote Updates**: When updating a feature branch after squashing already-pushed iterative commits, strictly use `git push --force-with-lease origin <branch>` (never bare `--force`) to ensure remote integrity.

- **The 6 Industry-Standard PR Lifecycle Stages (Mandatory Before Merging)**:

  1. *Stage 1: Pre-Flight Automated CI Gates*: Static analysis, linting, compilation, and automated tests must pass 100% green before human or peer review.

  2. *Stage 2: Multi-Axis Code Review Matrix*: Audit against Correctness/Edge Cases, Security/Data Safety, Architecture/Modularity, and Observability.

  3. *Stage 3: Formal GitHub Review Actions*: Reviewers submit structured Comment, Request Changes, or Approve via GitHub UI or gh pr review.

  4. *Stage 4: Merge Strategy Selection*: Default to **Squash and Merge (--squash)** for clean atomic history on main; use --merge for large release epics.

  5. *Stage 5: CI/CD Post-Merge Verification*: Automated build verification confirms main remains deployable and healthy.

  6. *Stage 6: Post-Merge Hygiene & Branch Pruning*: Delete merged remote branches (--delete-branch) and sync local git working state.

- **The 4 AI-Agent PR Delegation Tasks (Human-in-the-Loop Protocol)**:

  1. *Task 1: Automated Deep Audit*: Agent inspects diffs, verifies secrets, traces inputs, checks query bounds (LIMIT 500), and audits error handling.

  2. *Task 2: Branch Patching*: Agent checks out PR branches, applies surgical fixes, tests locally, and pushes clean commits.

  3. *Task 3: Formal Review & CLI Merge*: Agent formats structured review feedback and executes approved merges via gh pr merge.

  4. *Task 4: Workspace State Sync*: Agent pulls updated main, synchronizes working branches, and keeps DEV_SESSION_STATE.md accurate.

- **The Generalized Pre-Merge Invariant Checklist (Stack-Agnostic)**:

  - No code merges into main without verifying:

    1. *Zero Secret Leaks*: Diff contains zero credentials, real keys, or .env files.

    2. *Clean Build & Compilation*: 

pm run build (or equivalent) passes with zero fatal errors.

    3. *Regression Tests Pass*: All unit, integration, and benchmark tests continue to pass green.

    4. *Dependency Lockfile Integrity*: package-lock.json matches package.json changes.

    5. *Contract & Schema Compatibility*: Backward compatibility preserved on API endpoints and database models.

    6. *Accurate Concept Framing*: Zero unauthorized government/institutional claims or fake escrow assertions.

    7. *Cloudflare 7-Phase Security Audit Pass*: Full diff passes all 7 phases of the Cloudflare Security Audit Playbook with zero unresolved critical, high, or medium findings.

    8. *Persistent Memory Sync*: docs/DEV_SESSION_STATE.md synchronized.

    9. *Documentation & README Synchronization*: `README.md`, technical specifications, and architectural docs evaluated and updated to accurately describe in-flight features, tools, and fixes before creating PRs or merging into `main`.



## 4. Multi-Language Parity Rules (When Applicable)



1. **No Pseudo-Translations**: Never write literal transliterations, phonetic approximations, or word-for-word dictionary swaps.

2. **Key Parity**: Any new key added to translation dictionaries must exist synchronously across all configured language files.

3. **Monochrome Validation Indicators**: Form asterisks (`*`) and required tokens must follow monochromatic styling (`text-slate-400 dark:text-slate-500`).

4. **Brand Names Intact**: Keep official brand names (`CAVDAX`, `FalkorDB`, `GraphBLAS`, `MCP`) untranslated in Latin characters.



---



## 5. Session State & Working Memory (`docs/DEV_SESSION_STATE.md`)



- **Single Source of Truth**: At the conclusion of each task or milestone batch, update `docs/DEV_SESSION_STATE.md`.

- **Detail Captured**:

  - Completed items and verified test runs.

  - Active in-progress files.

  - Uncommitted local states.

  - Pending follow-up backlog items.

- Always read `docs/DEV_SESSION_STATE.md` at the start of a conversation to resume without context loss.



---



## 6. Reference Architecture Codebases & Curated UI Resource Matrix



### 6.1 Production Sister Projects

> [!NOTE]

> *(Notice for External Developers: The local machine paths below are historical references for developer Suneet Chugh whose workstation contains these codebases. External developers will not have these local paths and should substitute their own project roots or prompt the user).*



- **DOAB**: `c:\Users\krish\OneDrive\Desktop\(All_&_Everything)\(All-Hackathons)\WeMakeDevs\DOAB-Codebase`

- **SAHNIRMAAN**: `C:\Users\krish\OneDrive\Desktop\(All_&_Everything)\(All-Hackathons)\Z++ Done\(SAHNIRMAAN)`

- **SWATVA**: `c:\Users\krish\OneDrive\Desktop\(All_&_Everything)\(All-Hackathons)\Z++ Done\(SWATVA)`



### 6.2 Curated External UI/UX Engineering Registries

> [!IMPORTANT]

> **Developer Self-Verification Directive**: Prefer extracting core CSS/Tailwind tokens and Framer Motion spring physics directly into repository primitives over pulling heavy external dependencies (the Ponytail principle).



- **ElevenLabs UI**: [ElevenLabs UI](https://ui.elevenlabs.io/) (Conversational AI & audio waveform patterns)

- **Prompt-Kit**: [Prompt-Kit](https://www.prompt-kit.com/) (LLM prompt inputs, context pills & reasoning traces)

- **RetroUI**: [RetroUI Primitives](https://retro-ui.basecase.site/components) (Tactile brutalist interface primitives)

- **21st.dev**: [React Components](https://21st.dev/) (Curated open-source React/Tailwind component directory)



---



## 7. The Ruthless Mentor & LLM Council Framework



When asked for architectural review, design choices, or feature feasibility:

- **Direct, Honest & Specific**: Prioritize truth over polite agreement.

- **Stress-Test Every Plan**: Evaluate assumptions, operational risks, failure modes, latency tradeoffs, and edge cases.

- **Socratic Inquiry**: Ask hard questions before rushing into code solutions.

- **Minimalist Interventions**: Provide the smallest set of high-leverage changes that makes the idea actually work.



---



## 8. The Ponytail Principle (Zero Overengineering)



- Never add bloated libraries or external state containers when native Web APIs, lightweight React hooks, or simple CSS suffice.

- Inline SVGs with hardware-accelerated CSS keyframes beat heavy JavaScript canvas or runtime animation frameworks for brand logos.

- Sparse matrix causal graph queries beat complex distributed vector databases for deterministic reasoning invalidation.



---



## 9. Project Naming Architecture (Functional Descriptive Acronyms)



- **CAVDAX**: **C**ontextual **A**ction & **V**erified **D**ecision **A**utonomous e**X**ecution.

  - Eliminating Silent Cache Rot in AI Coding Agents via FalkorDB GraphBLAS & Model Context Protocol.



---



## 10. The Canonical `docs/` Architectural Repository & The 6 Context Files



Every AI coding agent must treat the **6 Canonical Context Files** as the persistent, immutable source of truth:



| Canonical File | Purpose & Architectural Boundary | Question Answered | Standard Location |

| :--- | :--- | :--- | :--- |

| **`PRD.md`** | Problem scope, user personas & boundary conditions | *WHAT are we building?* | `docs/PRD.md` |

| **`ARCHITECTURE.md`** | System topology, multi-layer data flow & contracts | *HOW is the system structured?* | `docs/ARCHITECTURE.md` |

| **`AGENTS.md`** | AI behavioral constitution, guardrails & branching laws | *WHAT should AI do / NOT do?* | Repository Root (`AGENTS.md`) |

| **`PHASES.md`** | Phased milestone roadmap with test verification checkpoints | *IN WHAT ORDER should we build?* | `docs/PHASES.md` |

| **`UI_DESIGN_SYSTEM.md`** | Design tokens, color system, motion physics & audio | *HOW should the product look and feel?* | `docs/UI_DESIGN_SYSTEM.md` |

| **`DEV_SESSION_STATE.md`** | Living record of architectural decisions & commit batches | *WHAT has already been decided/built?* | `docs/DEV_SESSION_STATE.md` |



- **Strict Source of Truth**: Before proposing changes, introducing new abstractions, or writing components, the agent must reconcile against `PRD.md`, `ARCHITECTURE.md`, `PHASES.md`, and `UI_DESIGN_SYSTEM.md`. Never invent rogue patterns or unaligned styling.

- **All Documentation Lives in `docs/`**: Only operational governance documents (`AGENTS.md`, `README.md`) live at root; all other specifications live inside `docs/`.



---



## 11. Data Sovereignty & State Storage Contract (LocalStorage vs. Account-Synced)



- **Device-Scoped State (`localStorage` ONLY)**:

  - Hardware & performance engine choices (`cavdax_map_engine`, reduced motion overrides, particle canvas toggles).

  - Device audio ergonomics (`cavdax_sounds_muted`, `cavdax_click_sound` — never follow cross-device account sync).

  - Local display settings (`preferredTheme`, `preferredLanguage`).

  - First-time onboarding/tour completion flags (`cavdax_tour_seen`).

  - Ephemeral offline incident logs and activity caches.

- **Account-Scoped State (Database / Cloud Synced)**:

  - User identity, credentials, cryptographic tokens, and verified email.

  - Operational role (`role`: 'engineer' | 'auditor' | 'agent'), model provider configurations.

  - Incident logs, endorsements, audit trail logs, and historical transactions.

- **The Inviolable Logout Retention Rule**:

  - On logout: Clear session tokens, auth credentials, and account profiles.

  - **NEVER wipe device-scoped keys** (`theme`, `preferredTheme`, `cavdax_sounds_muted`, or reduced-motion toggles).



---



## 12. Continuous Security Posture & Vulnerability Hunting (`vibe-guard` & `Agentic-Bug-Hunter`)



1. **Zero-Trust Input & Parameter Validation**:

   - Never trust client-supplied input, query parameters, or localStorage values without schema validation or sanitization.

   - Enforce type guards and bounds checks on numeric inputs.

2. **Authorization & IDOR / BOLA Prevention**:

   - Verify that data retrieval and update operations always check authorized role privileges over the requested resource ID.

   - Enforce authorization at API boundaries, not just client-side toggles.

3. **Secret Leakage & Token Exfiltration Defense (Vibe-Guard)**:

   - Scrutinize network requests, console logs, and client bundles to guarantee API keys, auth headers, private keys, or internal endpoints are never exposed.

   - Staged secret scanning before every Git commit is mandatory.

4. **Injection Vector Hardening**:

   - Neutralize XSS vectors: never use `dangerouslySetInnerHTML` with unsanitized user or external feed strings.

   - Neutralize Cypher/SQL/NoSQL injection: use parameterized queries and ORM binding exclusively.



---



## 13. Pre-Publish Markup Integrity Guard & Zero-Leak Protocol (Mandatory)



- **The Absolute Rule**: Generated HTML documents (such as interactive knowledge graphs, architectural visualizations, or standalone doc bundles) must **NEVER leak raw JavaScript code, function declarations, or unparsed script contents into visible HTML text nodes**.

- **Banned Generation Practices**:

  - **Never parse or slice existing HTML/markup to extract data**: String searches (`orig.find(...)` or string token splits) on previously generated HTML files are brittle and easily cause recursive script tags or premature closing tag injection (`</script>`).

  - **Direct Structured Data Ingestion Only**: Always read data directly from structured JSON (`graph.json`, `graph_nodes.json`, `graph_edges.json`), typed database dumps, or native AST exports.

  - **Clean Native Serialization**: Serialize data arrays strictly with native serializers (`json.dumps(..., ensure_ascii=False)`) directly into template variables.

- **Mandatory Pre-Publish Verification**:

  - Before ANY generated HTML is committed, pushed to `gh-pages`, or deployed to hosting surfaces, the automated verification script (`scripts/verify-graph-integrity.py`) **MUST** be executed and pass with zero errors.

  - **The 5-Point Pre-Flight Audit Checklist**:

    1. **Tag Balancing**: Number of opening `<script` tags must exactly equal closing `</script>` tags (expected exactly 2 for standalone graph pages). Number of `<style>` tags must match `</style>`.

    2. **Zero Text Leaks**: No JavaScript keywords (`let audioCtx`, `function playClick`, `function setTheme`, `const nodesDS`, `soundMuted =`) may appear outside `<script>` or `<style>` blocks.

    3. **Clean Trailing Boundary**: Nothing may follow the final `</script>` tag except `</body></html>` and whitespace.

    4. **Data Completeness**: `RAW_NODES`, `RAW_EDGES`, and `LEGEND` must be non-empty, valid JSON arrays.

    5. **Design System & Metrics Compliance**: Must verify presence of official platform CTA (`cavdax.sahnirmaan.live`), `#d9a353` warm amber tokens, and dark theme defaults.

- **Automated Pipeline Enforcement**:

  - Both local deployment scripts (`publish-graph-pages.ps1`, `publish-graph-pages.sh`) and CI/CD pipelines (`.github/workflows/deploy-graph-pages.yml`) execute `verify-graph-integrity.py` before git staging or deployment. If any check fails, publication is immediately halted with a fatal error.


## 💳 Commercial & Payment UI Rules — Zero Marketing/Gateway Clutter

- **Strict Ban on Gateway Badge Clutter**: Never include generic payment gateway badges, trust seals, or payment method enumerations (e.g., `Secure · Razorpay · UPI · Cards · Net Banking`, `Powered by Stripe`, or similar badge lists).
- **Production Developer Aesthetics**: All payment interfaces (Sponsor and Tier Cards) must strictly maintain high-end, uncluttered, monochromatic developer console aesthetics.
- **Dynamic Key Resolution**: Never hardcode or statically inline fallback Test Mode keys in production builds. Always resolve payment keys dynamically from backend orders or verified production environment configurations.


## 14. CI/CD Deployment Concurrency & Container Daemon Race Protection Protocol

- **Mandatory Workflow Concurrency Lock**:
  - Every GitHub Actions / GitLab CI production deployment workflow executing over SSH or managing container infrastructure MUST explicitly define a top-level concurrency block:
    ```yaml
    concurrency:
      group: production-deploy
      cancel-in-progress: false
    ```
  - **Zero Parallel SSH Deployments**: NEVER allow two or more concurrent workflow triggers (e.g. back-to-back PR merges) to SSH into the same VM and run container management commands simultaneously. Concurrent runs create race collisions where multiple processes attempt to remove or bind the same container name simultaneously.
- **Elimination of "Removal of container is already in progress" Daemon Collisions**:
  - When using Docker Compose with explicit `container_name:` declarations on cloud instances (e.g. AWS EC2 t3.micro), `containerd` takes 1–3 seconds to unmount overlayfs storage layers and network endpoints.
  - Automated deployment scripts must NEVER execute a naked `docker compose up -d` that fails immediately on transient unmount locks. Wrap rolling container recreations in a resilient backoff retry loop (e.g. 3–4 retries with 3-second sleep backoff):
    ```bash
    deploy_service() {
      local svc="$1"
      local count=0
      until docker compose -f infra/docker-compose.prod.yml up -d --no-deps "$svc" 2>/dev/null || [ $count -ge 4 ]; do
        echo "==> Docker daemon unmounting previous '$svc' layer, retrying in 3s ($((count + 1))/4)..."
        sleep 3
        count=$((count + 1))
      done
      if [ $count -ge 4 ]; then
        docker compose -f infra/docker-compose.prod.yml up -d --no-deps "$svc"
      fi
    }
    ```
- **Absolute Ban on Pre-Build Service Termination (Cloudflare Error 521 Prevention)**:
  - Never execute `docker rm -f`, `docker kill`, or `docker down` before building container images. Reverse proxies (Caddy, Nginx) must stay alive and listening on ports 80/443 while builds compile in the background.
  - Only perform in-place, sequential container swaps once image builds have succeeded 100%.

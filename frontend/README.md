# Precedent — On-Call Incident Response Agent

> An on-call incident response web application that recalls previous outages, surfaces verified fixes, and warns against repeat anti-patterns using institutional memory.

---

## Design System & Tokens

Precedent strictly adheres to an editorial, light-only design language with calm aesthetics, high whitespace, and distinct color semantics where color is **never** used alone.

### Color Tokens

| Token | Hex Value | Role / Usage |
| :--- | :--- | :--- |
| `bg` | `#F8FAFC` | Page background |
| `surface` | `#FFFFFF` | Cards, panels, elevated surfaces |
| `surface-muted` | `#F1F5F9` | Inset areas, table headers, code blocks |
| `border` | `#E2E8F0` | Standard component and card borders |
| `border-strong` | `#CBD5E1` | Dividers, active accents, focus outlines |
| `text` | `#0F172A` | Primary typography |
| `text-muted` | `#64748B` | Secondary metadata and labels |
| `text-faint` | `#94A3B8` | Disabled states and subtle hints |
| `primary` | `#4F46E5` | Main actions, links, primary CTA |
| `primary-soft` | `#EEF2FF` | Selection tint and light indigo badges |
| `memory` | `#7C3AED` | **Reserved exclusively** for memory-derived citations, panels, and badges |
| `memory-soft` | `#F5F3FF` | Memory panel backgrounds and citation highlights |
| `success` | `#16A34A` | Resolved statuses, verified fixes |
| `warning` | `#D97706` | SEV2 alerts, pre-mortem risk warnings |
| `danger` | `#DC2626` | SEV1 alerts, anti-patterns, avoid lists |
| `info` | `#0284C7` | SEV3 alerts, deploy correlations |

### Typography & Structure

- **UI Font**: Inter (`var(--font-inter)`)
- **Code, IDs & Metrics**: JetBrains Mono (`var(--font-mono)`)
- **Radii**: 12px for cards (`rounded-card`), 8px for inputs and buttons (`rounded-btn`), full-round for status badges (`rounded-full`).
- **Card Shadow**: `0 1px 2px rgba(15, 23, 42, 0.06)`
- **Focus Rings**: 2px primary ring with 2px offset on every interactive element.
- **Accessibility**: Light theme WCAG AA contrast, `aria-live="polite"` regions on triage steppers and toasts, descriptive `aria-label`s on icon buttons.

---

## Component Architecture

```
frontend/
├── app/
│   ├── layout.tsx              # Root shell with Navigation and ToastProvider
│   ├── page.tsx                # Step 2: Incident List, stat cards & client filtering
│   ├── _ui/page.tsx            # Step 1: Design tokens & primitives showcase
│   ├── incidents/[id]/page.tsx # Steps 3-5: Hero incident view, timeline & triage
│   ├── deploys/page.tsx        # Step 6: Deploy risk pre-mortems & diff simulator
│   ├── insights/page.tsx       # Step 6: Weekly reliability brief & reflect search
│   ├── replay/page.tsx         # Step 6: Empirical learning curve chart (Recharts)
│   ├── not-found.tsx           # Polished 404 page
│   └── error.tsx               # Client error boundary
├── components/
│   ├── ui/
│   │   ├── Button.tsx          # Primary, secondary, ghost, danger (sm, md)
│   │   ├── Badge.tsx           # Neutral, success, warning, danger, info, memory
│   │   ├── Card.tsx            # Standard card with optional headers and footers
│   │   ├── Navigation.tsx      # Top 56px app bar with responsive drawer
│   │   ├── Skeleton.tsx        # Pulsing placeholders for asynchronous state
│   │   ├── EmptyState.tsx      # Standard empty illustration and copy
│   │   ├── Tooltip.tsx         # Accessible hover/focus tooltips
│   │   ├── Spinner.tsx         # Spinning circular indicators
│   │   └── Toast.tsx           # Bottom-right auto-dismissing notification system
│   └── incident/
│       ├── MemoryToggle.tsx    # Accessible ON/OFF memory toggle switch
│       ├── TriageStepper.tsx   # 4-stage live triage progress stepper
│       ├── HypothesisCard.tsx  # Ranked hypotheses with citations & feedback buttons
│       ├── AvoidList.tsx       # "Do not repeat" anti-pattern avoidance cards
│       ├── MemoryPanel.tsx     # Full memory audit with dispute popover
│       ├── Timeline.tsx        # Color-coded event connector timeline
│       ├── RedactedLogs.tsx    # Collapsible redacted log stream
│       ├── ResolveDrawer.tsx   # Incident resolution slide-over drawer
│       └── CompareModal.tsx    # Side-by-side Memory ON vs OFF comparison modal
└── lib/
    ├── types.ts                # Strict TypeScript domain model
    ├── mock.ts                 # Hero incident (INC-031), precedents, replays
    └── api.ts                  # Typed client with mock mode and SSE support
```

---

## Demo Mode (`NEXT_PUBLIC_USE_MOCK`)

The application supports standalone demo mode out of the box with zero external backend dependencies.

- Set `NEXT_PUBLIC_USE_MOCK=true` in `.env.local` (or leave unset, as it defaults to mock mode when `NEXT_PUBLIC_API_URL` is omitted).
- Mock latency is calibrated to 400ms–800ms to allow realistic loading skeletons and triage steppers to render smoothly.
- The hero incident **INC-031** (`checkout p99 latency > 2s`) demonstrates:
  1. **Memory ON**: Grounded diagnosis of HikariCP pool starvation citing `INC-001` and `INC-014`, verified steps, and anti-pattern warnings.
  2. **Memory OFF**: Uncited, generic guidance proposing pod restarts.
  3. **Compare Modal**: Side-by-side verification of triage precision.
  4. **Feedback & Avoid Updates**: Marking a step as failed instantly injects it into the Avoid List and incident timeline.
  5. **Resolution Flow**: Pre-filled drawer submitting incident data to institutional memory.

---

## Development & Build Verification

```bash
# Install dependencies
npm install

# Run local development server
npm run dev

# Run ESLint validation
npm run lint

# Build production bundle
npm run build
```

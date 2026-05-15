# design.md Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate `@google/design.md` lint tooling so DESIGN.md can be validated for broken token references and WCAG contrast ratios on demand.

**Architecture:** Three surgical edits — add a script to package.json, convert DESIGN.md frontmatter colors from oklch to hex (linter requirement), and add one instruction to AGENTS.md. No new files, no dependencies installed, no CI changes.

**Tech Stack:** `@google/design.md` CLI (via npx, no install needed), YAML frontmatter in DESIGN.md.

---

### Task 1: Add lint:design script to package.json

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Add the script**

In `package.json`, add `lint:design` to the `scripts` block after `lint`:

```json
"lint": "eslint",
"lint:design": "npx @google/design.md lint DESIGN.md",
```

- [ ] **Step 2: Run linter against the current (unconverted) DESIGN.md to confirm it fails**

```bash
npm run lint:design
```

Expected: exits with code 1, errors about invalid color values (oklch is not accepted — spec requires hex). This confirms the tool is working and gives us a clear before/after signal.

---

### Task 2: Convert DESIGN.md frontmatter colors to hex

**Files:**
- Modify: `DESIGN.md` (frontmatter colors section only — lines 9–28)

- [ ] **Step 1: Replace the entire colors block in the YAML frontmatter**

Find this exact block (lines 9–28):

```yaml
colors:
  # Light mode
  primary: "oklch(0.608 0.206 38.7)"      # Orange-600 — brand voltage, CTAs, active states
  on-primary: "oklch(0.985 0 0)"           # Near-white text over orange
  ink: "oklch(0.145 0 0)"                  # Darkest text — near black
  body: "oklch(0.371 0 0)"                 # Regular text — zinc-700
  muted: "oklch(0.556 0 0)"                # Secondary text, disabled — zinc-500
  canvas: "oklch(1 0 0)"                   # Page floor — white
  surface-card: "oklch(1 0 0)"             # Card surface — same as canvas in light mode
  hairline: "oklch(0.922 0 0)"             # Borders, dividers — zinc-200

  # Dark mode overrides
  primary-dark: "oklch(0.703 0.195 40.5)"  # Orange-500 — brighter for dark backgrounds
  on-primary-dark: "oklch(0.145 0 0)"      # Near-black text over orange (AAA contrast)
  ink-dark: "oklch(0.985 0 0)"             # Near-white text
  body-dark: "oklch(0.871 0 0)"            # Body text — zinc-200
  muted-dark: "oklch(0.708 0 0)"           # Muted text — zinc-400
  canvas-dark: "oklch(0.145 0 0)"          # Page floor — zinc-950
  surface-card-dark: "oklch(0.205 0 0)"    # Card surface — zinc-900, lifted above canvas
  hairline-dark: "oklch(1 0 0 / 10%)"      # 10% white — subtler than light-mode hairline
```

Replace with:

```yaml
colors:
  # Light mode
  primary: "#ea580c"         # Orange-600 — brand voltage, CTAs, active states
  on-primary: "#fafafa"      # Near-white text over orange
  ink: "#111111"             # Darkest text — near black
  body: "#3f3f46"            # Regular text — zinc-700
  muted: "#71717a"           # Secondary text, disabled — zinc-500
  canvas: "#ffffff"          # Page floor — white
  surface-card: "#ffffff"    # Card surface — same as canvas in light mode
  hairline: "#e4e4e7"        # Borders, dividers — zinc-200

  # Dark mode overrides
  primary-dark: "#f97316"      # Orange-500 — brighter for dark backgrounds
  on-primary-dark: "#111111"   # Near-black text over orange (AAA contrast)
  ink-dark: "#fafafa"          # Near-white text
  body-dark: "#d4d4d8"         # Body text — zinc-300
  muted-dark: "#a1a1aa"        # Muted text — zinc-400
  canvas-dark: "#09090b"       # Page floor — zinc-950
  surface-card-dark: "#27272a" # Card surface — zinc-800, lifted above canvas
  hairline-dark: "#ffffff1a"   # 10% white — subtler than light-mode hairline
```

> Note: `globals.css` and Tailwind keep their oklch values — the linter only reads DESIGN.md.

---

### Task 3: Run linter and verify

**Files:** none

- [ ] **Step 1: Run the linter**

```bash
npm run lint:design
```

Expected output shape (exit code 0):
```json
{
  "findings": [
    {
      "severity": "warning",
      "path": "components.button-primary",
      "message": "textColor (#fafafa) on backgroundColor (#ea580c) has contrast ratio X.XX:1 — passes WCAG AA."
    }
  ],
  "summary": { "errors": 0, "warnings": N, "info": N }
}
```

- [ ] **Step 2: Check findings**

- `errors: 0` — required. Any error means a broken token reference or invalid value; fix it before moving on.
- `warnings` — review each. WCAG contrast warnings for dark-mode token pairs (e.g., `primary-dark` / `on-primary-dark`) are expected and acceptable — the linter doesn't understand the dark/light pairing convention and may check them cross-mode. Acknowledge and move on.
- `hairline-dark` may produce a warning about `#ffffff1a` (alpha hex) — the tool is alpha and may not handle transparency. Safe to ignore for a border-only token.

---

### Task 4: Update AGENTS.md

**Files:**
- Modify: `AGENTS.md`

- [ ] **Step 1: Add lint instruction to the Design System section**

Find this block in `AGENTS.md` (lines 20–22):

```markdown
**Do not hardcode hex values or px sizes** — reference the token names from DESIGN.md.  
**Do not introduce new colors** — the system uses zinc + one orange only.  
**Do not add box shadows** — elevation strategy is borders-only.
```

Replace with:

```markdown
**Do not hardcode hex values or px sizes** — reference the token names from DESIGN.md.  
**Do not introduce new colors** — the system uses zinc + one orange only.  
**Do not add box shadows** — elevation strategy is borders-only.  
**After editing `DESIGN.md`**, run `npm run lint:design` to validate token references and WCAG contrast.
```

- [ ] **Step 2: Verify AGENTS.md reads correctly**

Open `AGENTS.md` and confirm the Design System section now has four bolded rules with no formatting issues.

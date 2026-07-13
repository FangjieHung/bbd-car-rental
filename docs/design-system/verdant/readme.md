# Verdant Design System

A design system for **Verdant**, a warm, friendly HR/payroll web + mobile portal. The name and specific product wording ("Verdant") are placeholders — no real brand name was supplied. This system was built from a **single reference screenshot** (an HR/payroll dashboard UI, "Lordbank.com" browser chrome visible in the source image) with no codebase or Figma file attached. Everything here — the token values, extended color ramps, the mobile app, and 8 of the 12 components — is extrapolated from that one image. Treat structure and interaction patterns as high-confidence; treat exact hex values, spacing, and anything not visible in the source screenshot as a considered *guess* that should be corrected against real brand material.

**Source:** `uploads/4447d3ba5bb26c7f16e3144d03f0e692.jpg` (one dashboard screenshot, no other files/links provided).

## Products
- **Web dashboard** — `ui_kits/web-dashboard/` — the primary surface shown in the reference image (portal nav, payroll/salary widgets, team & hiring stats).
- **Mobile app** — `ui_kits/mobile-app/` — an iOS recreation of the same portal, extrapolated (not shown in source material).

## Components
Standard primitive set (no component library was supplied, so this is an authored-from-scratch inventory sized to what the reference screen needed):

- **Core** (`components/core/`): `Button`, `IconButton`, `Avatar`, `Card`, `StatCard`, `StatusPill`, `Chip`
- **Data** (`components/data/`): `ListRow`, `ProgressRing`, `ProgressBar`
- **Navigation** (`components/navigation/`): `NavPills`
- **Forms** (`components/forms/`): `Input`

### Intentional additions
None of these are inventions beyond the brief — every component maps to something visible in the reference screenshot (profile card actions → `IconButton`; payout rows → `ListRow`; donut chart → `ProgressRing`; hiring bar → `ProgressBar`; nav row → `NavPills`). `Input` and `Chip` generalize small visible elements (the search field, the "2 Hours / 10 Hours" range labels) into reusable primitives.

## Index
- `styles.css` — root stylesheet, imports all tokens (link this one file from consumers).
- `tokens/colors.css`, `tokens/typography.css`, `tokens/spacing.css` — design tokens (see Visual Foundations below).
- `components/` — 12 React primitives, grouped by concern, each with `.jsx` + `.d.ts` + `.prompt.md` + one `@dsCard` HTML per directory.
- `guidelines/` — 12 foundation specimen cards (colors, type, spacing, radius, shadow, wordmark) shown in the Design System tab.
- `ui_kits/web-dashboard/` — 4-screen web recreation (Login, Dashboard, Team, Calendar).
- `ui_kits/mobile-app/` — 3-screen iOS recreation (Home, Payouts, Profile).
- `assets/icons/` — 33 Lucide icon SVGs (see Iconography).
- `SKILL.md` — portable skill file for reuse in Claude Code.

---

## Content fundamentals

The one piece of real copy in the source is the greeting **"Good morning Jhon"** plus small labels ("Portal", "Dashboard", "Total employee", "Track your team", "Talent recruitment", "Payout monthly", "Salaries and insentive"). From this:

- **Voice:** warm and personal, second-person-adjacent but greets the user by first name rather than saying "you" — "Good morning Jhon", not "Good morning, valued user." Friendly workplace tone, not corporate-stiff.
- **Casing:** sentence case everywhere. Headings ("Good morning Jhon", "Track your team", "Talent recruitment") are sentence case, not Title Case. Nav labels and short UI labels ("Dashboard", "Calendar", "Team") are single words, capitalized as a label, not a sentence.
- **Punctuation:** minimal. No exclamation points, no em-dashes in the source. Breadcrumbs use "›" (Portal › Dashboard).
- **Numbers:** presented big and bold as the hero of a card ("46,5", "120", "80%") with a short lowercase caption underneath ("avg hours / weeks", "Total members") — the number does the talking, the label is quiet.
- **Emoji:** none observed. Do not add any.
- **Typos as character:** the source itself has a small typo ("insentive" for "incentive") — a sign this is a fast-moving product, not a heavily copy-edited one. Don't over-polish; keep copy plain and slightly informal rather than corporate.
- **Vibe:** efficient, human, slightly casual workplace tool — the kind of dashboard a manager checks over coffee, not a compliance system.

## Visual foundations

- **Color:** three-hue system. **Sage green** is the primary/action color (nav pill active state, primary buttons, progress fills, "+" deltas). **Deep teal/navy** is the secondary/depth color, reserved for a small number of high-contrast "hero" cards (onsite-team stat, take-home-pay summary) — it never appears as body text or a full-page background. **Warm cream/off-white** is the neutral base — the app background is a warm off-white (`#f7f5f0`), not pure white or gray; cards sit on it in pure white for a subtle two-layer effect. Semantic status colors (success/warning/error) were extended from this base since only a handful of status pills appeared in the source ("Waiting" amber, "Done" green, "Failed" red).
- **Type:** one geometric/rounded display face for headings and big numbers (extrabold weight, tight -0.02em tracking), a plain grotesk for body/UI text and labels, and a monospace face reserved for currency/tabular figures. No serif anywhere.
- **Spacing:** generous, airy — cards have large internal padding (~24px) and large gaps between widgets (~20–24px). Nothing feels cramped; this is a "breathing room" dashboard, not a dense data-grid one.
- **Backgrounds:** flat color only. No gradients, no textures, no patterns, no photographic full-bleed backgrounds observed — the one photographic element (the profile headshot) sits inside a rounded card, not full-bleed. *(The profile-card top uses a soft two-tone gradient wash in this recreation as a photo-placeholder backdrop — flag this as an addition, not sourced.)*
- **Animation:** not observable from a static screenshot. Recreations use short (120–200ms), standard-eased transitions on hover/press only — no bounces, no auto-playing motion, consistent with the calm, static tone of the source.
- **Hover states:** buttons darken slightly (brightness ~0.96) rather than changing hue or growing a shadow.
- **Press states:** buttons scale down slightly (~0.97) — a soft, tactile press, no color inversion.
- **Borders:** hairline (1px), very low contrast (`--border-subtle`), used sparingly on light cards; dark cards use no border at all (color-block against the cream background is enough separation).
- **Shadows:** extremely soft/near-invisible — a wide, low-opacity blur rather than a hard drop shadow. This is a flat-design system; shadow signals "surface," not "floating."
- **Corner radii:** generously rounded throughout — buttons and nav pills are full pill shape; cards use large radii (16–28px); avatars and icon buttons are perfect circles. Nothing in this system uses a sharp 0–4px corner.
- **Cards:** white or cream fill, hairline border, near-invisible shadow, large radius, generous padding. Dark "hero" cards drop the border and use deep teal fill with white text instead.
- **Transparency/blur:** none observed in the source; not used in this recreation.
- **Imagery color vibe:** the one photo in the source (profile headshot) reads neutral-cool, naturally lit, no heavy grain or duotone treatment. No stock imagery is included in this system (see Iconography/Assets below) — bring in real photography before shipping.
- **Layout:** fixed left/primary column + fixed-width right sidebar (payroll/notifications), consistent with a workspace-app shell rather than a marketing site.

## Iconography

The source screenshot shows small line icons (search, bell/mail in the top bar, phone/mail on the profile card, clock/hourglass, globe, video-call). No icon font or SVG sprite was provided. Nearest open-source match: **[Lucide](https://lucide.dev)** (24px grid, 2px stroke, rounded joins — visually the closest match to the source's line-icon weight). 33 Lucide SVGs were copied into `assets/icons/` (not linked from CDN, so the set works offline); UI kits inline them via `fetch()` + `dangerouslySetInnerHTML` so `stroke="currentColor"` follows the surrounding text color. No emoji or unicode-glyph icons are used anywhere in this system.

## Fonts — flagged substitution

**No font files were supplied.** The source screenshot's display type looks like a rounded/geometric grotesk; body and numeric text look like a plain grotesk. Nearest Google Fonts matches were substituted and are loaded via `tokens/typography.css`:
- Display/headings → **Plus Jakarta Sans** (weights 400–800)
- Body/UI text → **Inter** (weights 400–700)
- Tabular/currency figures → **IBM Plex Mono** (weights 500–600)

**Please supply the real brand font files (or name the intended typeface) and I'll swap these in.**

## Logo

No logo mark was present in or supplied with the source screenshot (the small teal squares icon in the top-left is too low-fidelity to responsibly reconstruct as a real mark, and per instructions this system never invents a brand mark). `guidelines/wordmark.html` renders "Verdant" in plain display type wherever a mark would go — swap in a real logo file under `assets/` when one is available.

## Caveats

- Built entirely from one screenshot — no codebase, no Figma, no additional screens or brand guide. Confidence is highest on layout/structure, lower on exact colors/spacing/type (all extrapolated), lowest on anything not visible in the source at all (mobile app, semantic status colors beyond the 3 pills shown, motion, empty/error states).
- Fonts are Google Fonts substitutions, not the real brand typeface — flagged above.
- No logo mark — flagged above.
- "Verdant" is a placeholder name chosen for this system; swap it project-wide if a real brand name is provided.

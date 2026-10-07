Go outside of this project and read la-memoria/docs/ai first!

# La Memoria Frontend Modification Instructions

This client project is being migrated from nestar-next to la-memoria-next

## Rules

- Preserve current project architecture
- Keep GraphQL/Apollo integration
- Do not rewrite the whole app
- Improve UI incrementally

## Backend Context

Before making any changes, read:

- docs/ai/BACKEND_MIGRATION.md
- docs/ai/DECIONS.md
- docs/ai/FRONTEND_MIGRATION.md
  and etc inside of la-memoria/docs/ai

## Workflow

1. Analyze before editing.
2. Backend is running on port http://localhost:3007/graphql now.
3. Make small incremental changes.
4. Run typecheck after each phase.
5. Do not remove working logic unless replaced safely.
6. Update la-memoria/docs/ai/COMPLETED_TASKS.md after major changes.

## Package Manager

- Use Yarn for all frontend commands.
- Do not use npm or pnpm.
- Install dependencies with:

```bash
yarn install
```

## SCSS conventions

**Structure and imports**

- `pages/_app.tsx` imports three entry files, in this order:
  - `scss/app.scss`: variables, reset, global element rules, and the `#pc-wrap .container` (fixed 1300px).
  - `scss/pc/main.scss`: desktop. Imports `scss/pc/general.scss` and one file per page.
  - `scss/mobile/main.scss`: phone. Every phone rule lives in this one file.
- Desktop page styles go in `scss/pc/<page>/<name>.scss` (e.g. `pc/homepage/homepage.scss`, `pc/package/detail.scss`). Add the `@import` to `scss/pc/main.scss`.
- Styles shared by both trees go in `scss/pc/general.scss`: shared cards, header, footer and homepage looks. Each block sits under one unique parent class, such as `.navbar`, `.home-hero`, `.home-page` or `.footer-container`.
- MUI theme settings live in `scss/MaterialTheme/` (TypeScript, not SCSS).

**Desktop and phone**

- There are no breakpoint media queries. `useDeviceDetect` picks the layout from the user agent. The layouts then render either `<Stack id="pc-wrap">` or `<Stack id="mobile-wrap">`.
  - Desktop rules nest under `#pc-wrap`.
  - Phone rules nest under `#mobile-wrap`.
- The only `@media` rule allowed is `prefers-reduced-motion`, at the end of `pc/general.scss`.
- Split shared and per-tree styles like this:
  - looks (colour, type, hover) go once in `pc/general.scss`
  - layout (grid, widths, spacing) goes in the pc page file and in `mobile/main.scss`

**Variables and mixins** (`scss/variables.scss`, imported at the top of each entry file)

- Fonts (Stitch "Editorial Archive"): loaded with `next/font` in `libs/fonts.ts` and exposed as CSS variables in `pages/_app.tsx`. Never hard-code a font family.
  - `$font`: DM Sans, for body text, UI, labels and buttons.
  - `$font-heading`: Chivo, for display text, headlines and titles (weights 400 and 500 only).
  - Both stacks end with self-hosted Pretendard (`public/fonts/pretendard/`), so Korean text never falls back to a system font. The browser downloads it only when a page shows Hangul.
  - The logo wordmark alone uses EB Garamond italic, through `--font-logo`.
- Text styles (Stitch type scale): `text-display-hero` (72/80) and its `-mobile` version (44/52), `text-headline-lg` (48/56) and its `-mobile` version (32/40), `text-headline-md` (32/40), `text-headline-sm` (24/32), `text-title-editorial` (20/28), `text-body-lg` / `-md` / `-sm`, `text-label-uppercase` (11px, 500, 0.18em) and `text-label-meta` (11px). Use these mixins for new text instead of raw sizes.
- Palette: `$ivory`, `$ivory-deep`, `$sand`, `$blush`, `$line`, `$mocha`, `$mocha-deep`, `$espresso`, `$champagne`, `$muted`.
- Effects: `$soft-shadow`, `$ease-out`, and the `glass()` mixin.
- Mixins: `eyebrow`, `text-link`, `focus-ring`.
- Layout:
  - `page-container` makes content exactly `$container-width` (1300px), the same as `#pc-wrap .container`, centred. The side gap never drops below `$container-gutter` (48px) on narrower screens.
  - `page-container-mobile` gives 24px side padding.
  - `$section-space` (112px) and `$section-space-mobile` (72px) set the vertical spacing between sections.
  - The homepage, header and footer use these. Older pages still use the fixed 1300px `.container`.

**Buttons** (tokens `$btn-*` and mixins in `variables.scss`; classes in `pc/general.scss`)

- `.button-primary` (mixin `button-primary`): solid espresso with an ivory uppercase label. A CSS arrow slides right on hover, and the background shifts to mocha.
- `.button-secondary` (mixin `button-secondary`): espresso outline that fills on hover.
- `.button-link` (mixin `text-link`): uppercase text link whose underline draws in from the left on hover.
- All three have focus-visible, pressed (`:active`) and disabled (`:disabled`, `[aria-disabled='true']`) states.
- Put a class on any `<button>` or `<Link>`. For a component-specific button, `@include` the mixin instead of writing new button styles.
- The arrow comes from CSS, so don't put an arrow icon inside a primary button.
- Never hard-code a colour, font or spacing value that a variable already covers. If a value is missing, add a variable.

**Naming and formatting**

- Class names are plain kebab-case (`trend-card`, `card-title`, `search-btn`). No BEM `__`/`--`, and no prefixes.
- Nest rules to mirror the JSX tree.
- Indentation: tabs in `scss/pc/**`, 2 spaces in `scss/mobile/main.scss`.
- Components attach styles with global `className` strings. There are no CSS modules. Older pages also use MUI `sx`; new work uses SCSS classes.

**Adding styles for a new component**

1. Give its root element a unique kebab-case class, and its children short kebab-case classes.
2. Put the colour, type and hover rules under that root class in `scss/pc/general.scss`. If it is page-only and desktop-only, put them in its pc page file instead.
3. Put the desktop layout under `#pc-wrap` in the page's pc file, and the phone layout under `#mobile-wrap` in `scss/mobile/main.scss`.
4. Use the variables and mixins. Respect `prefers-reduced-motion`. Keep text at 11px or larger.
5. Run `yarn tsc --noEmit`, `yarn lint` and `yarn build`.

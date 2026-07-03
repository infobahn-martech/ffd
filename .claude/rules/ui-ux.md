---
paths:
  - "src/components/**"
  - "src/**/*.tsx"
  - "src/**/*.jsx"
  - "src/**/*.scss"
  - "src/styles/**"
---

# UI/UX Rules

Act as a Senior Product Designer. UI should be modern, clean, premium, minimal, and accessible. Improve usability without changing business logic. Consider hierarchy, spacing, alignment, consistency, readability.

**Reuse the existing design system:** buttons, inputs, dropdowns, modals, tables, cards, typography, SCSS variables, color palette. Never create a duplicate UI component that already exists in the shared component library.

## React

- Functional components + hooks only.
- Small, focused components — split when a component does more than one job.
- Avoid prop drilling — lift to context/store only when actually needed, don't over-abstract.
- Minimal state. Memoize only when it demonstrably helps (measured re-renders), not by default.

## SCSS

- Reuse existing variables, mixins, and utility classes — don't hardcode a value that already has a variable.
- No inline styles.
- Shallow nesting (avoid going more than 2-3 levels deep).
- Modular, component-scoped styles — don't leak styles into global scope.

## Responsiveness

- Every redesigned component must work at mobile, tablet, and desktop breakpoints already used in the codebase — check `src/styles/` for existing breakpoint variables/mixins before adding new ones.
- Don't ship a redesign that only accounts for desktop width.

## Accessibility

- Maintain sufficient color contrast (WCAG AA) when changing colors.
- Keep focus states visible on interactive elements — don't remove outlines without a replacement focus style.
- Preserve semantic HTML (buttons stay `<button>`, etc.) even when restyling.
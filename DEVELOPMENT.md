# Development Guide

This document focuses on day-to-day development practices and architecture direction for the AIUB Course Recommendation System.

## Architecture Overview

- Pure static front-end (no build step yet)
- Data layer: JSON files under `course_managers/`
- Presentation: Semantic HTML + modular CSS
- Interaction: Vanilla JS per page

## Goals

- Keep barrier to entry low (no complex tooling initially)
- Modularize JS gradually
- Maintain accessible, responsive UI

## Folder Layout (Intended Future)

```
root/
  css/
  js/
    modules/
      dataLoader.js
      filter.js
      planner.js
  course_managers/
  tests/          (future)
  scripts/        (validation tools)
```

## Environment Setup

See `INSTALLATION.md` for basic steps. No dependency install required currently.

## Adding JavaScript Functionality

1. Create a new file in `js/`
2. Keep global pollution minimal: wrap code in an IIFE or module pattern
3. Use `defer` when adding new `<script>` tags to HTML pages
4. Always fail gracefully if DOM selectors return null

## Planned Refactors

| Area              | Current               | Future Plan                                |
| ----------------- | --------------------- | ------------------------------------------ |
| Data fetching     | Inline fetch per page | Central `dataLoader` module                |
| Filtering         | Manual loops          | Dedicated filter utilities                 |
| State mgmt        | Ad-hoc variables      | Lightweight planner module w/ localStorage |
| Routine conflicts | Manual checks         | Reusable time-slot comparing function      |

## Coding Conventions

- Use `const`/`let` (never `var`)
- Functions: small, single-purpose
- Prefer early returns over deep nesting
- Comment intent, not the obvious

## DOM Guidelines

- Cache frequently accessed elements
- Avoid unnecessary reflows (batch DOM updates or use fragments)
- Use `textContent` instead of `innerHTML` when inserting plain text

## Accessibility (A11y)

- Provide `aria-label` where text context unclear
- Ensure focus states visible
- Use appropriate heading order (`h1` > `h2` ...)

## Performance Considerations

- Defer JS loading
- Consider lazy loading large JSON if added later
- Avoid large synchronous loops on page load

## Debugging Tips

- Use `console.assert()` for sanity checks (removable later)
- Use browser DevTools Performance tab for routine rendering changes

## Adding Tests (Future)

1. Introduce `package.json`
2. Add Jest for unit tests
3. Extract pure logic from DOM-heavy code
4. Add Playwright for basic E2E flows

## Local Storage Plan (Concept)

```js
const KEY = "aiubCoursePlan";
export function savePlan(plan) {
  localStorage.setItem(KEY, JSON.stringify(plan));
}
export function loadPlan() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}
```

## Release Workflow (Future)

1. Update `CHANGELOG.md`
2. Tag: `git tag vX.Y.Z`
3. Push tag: `git push origin vX.Y.Z`
4. Create GitHub release (attach summary)

## Linting (Optional Future)

Add ESLint with a minimal config once complexity grows.

## Contribution Flow Recap

See `CONTRIBUTING.md`.

---

Suggestions to improve workflow? Open an issue or PR.

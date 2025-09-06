# Testing Guide

This project is currently a static front-end without an automated test harness. This document defines how testing SHOULD evolve.

## Current Manual Test Checklist

| Area           | Steps                              | Expected                            |
| -------------- | ---------------------------------- | ----------------------------------- |
| Load index     | Open `index.html` via local server | No console errors                   |
| Offer courses  | Navigate to `offer_courses.html`   | Courses list populates              |
| Routine page   | Open `routine.html`                | Layout renders without overlap      |
| Responsive     | Resize to 375px width              | Navigation adapts, content readable |
| JSON integrity | Modify a course entry malformed    | Console shows readable error        |

## Planned Automated Testing Strategy

| Layer                   | Tool (Proposed)              | Purpose                            |
| ----------------------- | ---------------------------- | ---------------------------------- |
| Data validation         | Node script + JSON schema    | Ensure course files conform        |
| Unit (logic extraction) | Jest (if Node tooling added) | Test parsing / filtering functions |
| E2E smoke               | Playwright or Cypress        | Validate key user flows            |
| Accessibility           | axe-core (script)            | Catch basic a11y issues            |

## JSON Schema (Concept Sketch)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "array",
  "items": {
    "type": "object",
    "required": ["code", "title", "credits", "prerequisites", "category"],
    "properties": {
      "code": { "type": "string" },
      "title": { "type": "string" },
      "credits": { "type": "number", "minimum": 0 },
      "prerequisites": { "type": "array", "items": { "type": "string" } },
      "category": { "type": "string" }
    },
    "additionalProperties": true
  }
}
```

## Suggested Future /scripts Folder

Add a `scripts/validate-data.js` script to iterate `course_managers/*.json` and validate.

## Writing Future Tests

1. Refactor inline JS logic into discrete functions.
2. Export them via an ES module for Node test runner compatibility.
3. Mock DOM where necessary (JSDOM if needed).

## Performance Checks

Manual for now: open DevTools > Performance if UI becomes dynamic.

## Accessibility

Manual quick pass:

- Tab through interactive elements
- Ensure visible focus
- Check color contrast

## Adding Automated Tests Later

1. Initialize Node environment (`package.json`)
2. Install dev deps (`jest`, `playwright`, etc.)
3. Add GitHub Actions workflow (CI) to run on PRs

---

Contributions adding the first automated tests are welcome.

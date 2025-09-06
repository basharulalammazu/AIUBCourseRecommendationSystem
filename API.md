# API (Internal Data & Module Contracts)

This project currently has no external network API. All logic runs in-browser. This document defines internal data structures and planned modular APIs to keep future expansion consistent.

## Data Structures

### Course Object

```json
{
  "code": "CSE1101",
  "title": "Introduction to Programming",
  "credits": 3,
  "prerequisites": ["NONE"],
  "category": "Core"
}
```

| Field         | Type     | Notes                                      |
| ------------- | -------- | ------------------------------------------ |
| code          | string   | Unique per course                          |
| title         | string   | Human readable                             |
| credits       | number   | Integer (can support half if needed later) |
| prerequisites | string[] | Use `["NONE"]` if none                     |
| category      | string   | e.g., Core, Elective                       |

### Planned Augmented Fields

- `level` (e.g., 1xx, 2xx)
- `department`
- `semester_hint`
- `tags` (array)

## Internal Module Contracts (Planned)

| Module     | Responsibility           | Proposed Functions                                          |
| ---------- | ------------------------ | ----------------------------------------------------------- |
| dataLoader | Fetch & parse JSON files | `loadDepartment(dept)`, `loadAll()`                         |
| filter     | Filter & search courses  | `byKeyword(list, term)`, `byCredits(list, min, max)`        |
| prereq     | Validate prerequisites   | `unmet(course, completed)`, `isEligible(course, completed)` |
| planner    | Manage tentative plan    | `add(course)`, `remove(code)`, `totalCredits()`             |
| routine    | Time slot conflict logic | `hasConflict(slotA, slotB)`                                 |

## Example (Future JS Module Sketch)

```js
// dataLoader.js
export async function loadDepartment(dept) {
  const res = await fetch(`course_managers/courses_${dept}.json`);
  if (!res.ok) throw new Error(`Failed to load ${dept}`);
  return res.json();
}
```

## Error Handling Conventions (Planned)

- Throw `Error` with user-readable message for fetch failures
- Return empty arrays for non-critical optional data
- Defensive checks before DOM rendering

## Extension Points

- Add a `plugins/` folder where optional enhancements can register hooks
- Potential event bus: `window.courseApp.dispatch(eventName, payload)`

## Versioning Strategy

Once external (real) API endpoints exist, semantic version compatibility rules will be documented here.

---

This file will expand as modularization proceeds.

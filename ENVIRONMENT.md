# Environment Reference

Currently the project is fully static. This document anticipates environment distinctions as functionality grows.

## Present State

| Environment | URL                          | Notes                         |
| ----------- | ---------------------------- | ----------------------------- |
| Local       | `http://localhost:<port>`    | Development via simple server |
| Production  | (GitHub Pages / static host) | Same assets as repo           |

## Configuration Strategy (Future)

Introduce a lightweight config object if variability needed:

```js
window.appConfig = {
  featureFlags: {
    enablePlanner: true,
    enableDarkMode: false,
  },
  data: {
    departments: ["cse", "eee", "bba", "english", "ipe"],
  },
};
```

## Potential Future Environments

| Env     | Purpose            | Differences                |
| ------- | ------------------ | -------------------------- |
| staging | Pre-release QA     | Experimental flags enabled |
| preview | PR-specific builds | Auto-built via CI          |

## Environment Variables (If Backend Added Later)

| Variable        | Purpose                  |
| --------------- | ------------------------ |
| `API_BASE_URL`  | REST/Graph endpoint root |
| `FEATURE_FLAGS` | Serialized flag config   |

## Caching Considerations

- Encourage immutable asset filenames if build pipeline added
- For now, advise hard refresh after updates

## Data Integrity

- JSON files should remain UTF-8
- Validate structure before publishing changes

## Timezone / Locale

- Current implementation NOT locale-sensitive
- If schedules include times, store in 24h local time format

## Security Baseline

- Avoid dynamic script injection
- Sanitize any user-generated input before inserting into DOM

## Monitoring (Future)

- Optionally add lightweight logging wrapper for usage metrics (opt-in)

---

As complexity increases, this file should be updated to reflect real environment logic.

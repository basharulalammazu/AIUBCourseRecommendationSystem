<div align="center">

# AIUB Course Recommendation System

An interactive, front-end driven tool to help AIUB students explore offered courses, view routines, and plan their semester effectively across different departments (CSE, EEE, BBA, English, IPE, etc.).

</div>

> Status: Early stage (v0.1.0 scaffold). Feedback & contributions welcome.

## Quick Links

[Installation](#installation) · [Features](#overview) · [Docs Index](#documentation-index) · [Contributing](#contributing) · [Roadmap](#roadmap) · [FAQ](#faq) · [Security](#security) · [Support](#support) · [Testing](#testing) · [Changelog](#changelog)

## Table of Contents

- [Overview](#overview)
- [Features (Planned & Current)](#features-planned--current)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Data Files](#data-files)
- [Documentation Index](#documentation-index)
- [Contributing](#contributing)
- [Coding Style](#coding-style)
- [Development](#development)
- [Testing](#testing)
- [Security](#security)
- [Support](#support)
- [Roadmap](#roadmap)
- [FAQ](#faq)
- [Changelog](#changelog)
- [License](#license)
- [Acknowledgements](#acknowledgements)

## Overview

This project is a lightweight, static web application (pure HTML/CSS/JavaScript) that loads curated course data from JSON files and provides an interface for students to:

- Browse available courses by department
- Explore offered course lists
- View routines/schedules
- Assist in semester planning

All logic runs fully client-side—no backend or database required (easy to host on GitHub Pages or any static server).

## Features (Planned & Current)

- Department-specific course catalogs (`courses_*.json`)
- Offer courses page (`offer_courses.html`)
- Routine visualization (`routine.html`)
- Responsive layout (`css/mediaqueries.css`)
- Modular JavaScript (`js/` folder)
- Simple theming via central stylesheet

### Possible Future Enhancements

- Basic filtering (credit range, prerequisite match, level)
- Local storage of a drafted semester plan
- Export/print selected routine
- GPA projection helper

## Project Structure

```
index.html                # Landing / main hub
offer_courses.html         # Page for viewing offered courses
routine.html               # Page for routine visualization
course_managers/           # JSON data for each department
	courses_cse.json
	courses_eee.json
	...
css/                       # Stylesheets
js/                        # Page-specific & shared scripts
```

## Installation

Basic steps kept brief here—see `INSTALLATION.md` for full detail.

1. Clone: `git clone https://github.com/basharulalammazu/AIUBCourseRecommendationSystem.git`
2. (Recommended) Start a local server (e.g. `python -m http.server 8000`)
3. Open `index.html` in a modern browser

Troubleshooting & platform notes: see `INSTALLATION.md`.

## Data Files

Course data lives under `course_managers/` as JSON. A typical record might look like:

```json
{
  "code": "CSE1101",
  "title": "Introduction to Programming",
  "credits": 3,
  "prerequisites": ["NONE"],
  "category": "Core"
}
```

If you add new JSON files:

- Keep naming consistent: `courses_<department>.json`
- Validate JSON (no trailing commas)
- Avoid extremely large files—split if necessary

## Documentation Index

| Topic                      | File                     |
| -------------------------- | ------------------------ |
| Installation details       | `INSTALLATION.md`        |
| How to contribute          | `CONTRIBUTING.md`        |
| Development workflow       | `DEVELOPMENT.md`         |
| Testing strategy           | `TESTING.md`             |
| Roadmap & future plans     | `ROADMAP.md`             |
| API / internal contracts   | `API.md`                 |
| Environment guidance       | `ENVIRONMENT.md`         |
| Security policy            | `SECURITY.md`            |
| Security advisories        | `SECURITY-ADVISORIES.md` |
| Governance model           | `GOVERNANCE.md`          |
| Support info               | `SUPPORT.md`             |
| Credits / authors          | `CREDITS.md`             |
| License supplemental terms | `LICENSE-TERMS.md`       |
| Changelog                  | `CHANGELOG.md`           |

## Contributing

Contributions are welcome! To propose improvements:

1. Fork the repo
2. Create a feature branch (`feat/add-filtering`)
3. Commit changes with clear messages
4. Open a Pull Request describing the changes & rationale

Please read the `CODE_OF_CONDUCT.md` before contributing.

### Coding Style

- Keep JavaScript ES6+ but framework-free
- Use semantic HTML where possible
- Keep CSS modular; prefer utility classes for spacing/layout

## Development

See `DEVELOPMENT.md` for architecture direction, refactor plan, and module sketches.

## Testing

Manual checklist + future automation strategy: `TESTING.md`.

## Security

Report vulnerabilities privately—see `SECURITY.md`. Published issues appear in `SECURITY-ADVISORIES.md` after a fix.

## Support

Need help? Channels & expectations in `SUPPORT.md`.

## Roadmap

High-level phases & milestones tracked in `ROADMAP.md`. (Inline list removed for single source of truth.)

## FAQ

## Code of Conduct

We follow the Contributor Covenant. Please review `CODE_OF_CONDUCT.md` to help maintain a welcoming environment.

## FAQ

**Q: Does this recommend courses algorithmically?**  
Currently it's a structured presentation layer. Recommendation heuristics can be added later (e.g., prerequisite satisfaction, workload balance, credit optimization).

**Q: Can I deploy this on GitHub Pages?**  
Yes. Push to a `gh-pages` branch or enable Pages on `main` and ensure relative asset paths remain correct.

**Q: Are there backend requirements?**  
No—purely static.

## Changelog

See `CHANGELOG.md` for version history. Current phase: pre-release scaffold (targeting iterative tagged versions soon).

## License

MIT (`LICENSE`). Clarifications / usage notes in `LICENSE-TERMS.md`.

## Acknowledgements

- Inspired by student planning needs at AIUB.
- Contributor Covenant for community standards.

---

Feel free to open issues for ideas, bugs, or questions.

Happy planning!

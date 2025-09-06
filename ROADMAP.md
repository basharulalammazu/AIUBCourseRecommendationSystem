# Project Roadmap

This roadmap is aspirational and may evolve based on contributor interest and student needs.

## Legend

- (P) Planned
- (WIP) In Progress
- (✅) Completed

## Phase 1: Foundation (Current)

- ✅ Basic pages: index, offer courses, routine
- ✅ Core styling + responsive adjustments
- ✅ JSON course data ingestion
- P Data validation guidelines
- P Documentation suite (mostly done)

## Phase 2: Usability Enhancements

- P Search bar (code/title keyword)
- P Department filter toggle UI improvements
- P Basic credit counter for selected courses
- P Prerequisite highlight (warn unmet)

## Phase 3: Planning Tools

- P Local storage of tentative plan
- P Conflict detection (time overlaps)
- P Export printable schedule (PDF / print stylesheet)
- P Dark mode toggle

## Phase 4: Recommendation Logic

- P Suggest next courses based on prerequisites fulfilled
- P Balance workload (credit distribution)
- P Flag potential overload (> defined credit threshold)

## Phase 5: Quality & Automation

- P JSON validation script
- P Unit test harness
- P E2E smoke tests (Playwright/Cypress)
- P Accessibility audit improvements

## Phase 6: Optimization & Polish

- P Lazy load large department data (if grows)
- P UI transitions / micro-interactions
- P Accessibility enhancements (ARIA landmarks, focus management)

## Stretch Ideas

- Potential backend (user auth, saved plans cloud sync)
- Graph visualization of prerequisite chains
- GPA projection tool
- Mobile PWA install support (manifest + service worker)
- Internationalization (i18n)

## Release Milestones (Tentative)

| Version | Theme                         | Target     |
| ------- | ----------------------------- | ---------- |
| 0.1.0   | Initial scaffold              | ✅ 2025-09 |
| 0.2.0   | Search + filtering            | TBD        |
| 0.3.0   | Planning utilities            | TBD        |
| 0.4.0   | Recommendation engine (basic) | TBD        |
| 0.5.0   | Testing & automation baseline | TBD        |

## How to Influence the Roadmap

Open an issue titled `[Proposal] <feature>` with:

- Problem statement
- User value
- Rough implementation idea
- Alternatives considered

---

Roadmap items may shift based on feedback and contributor availability.

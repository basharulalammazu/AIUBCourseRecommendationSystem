# Contributing Guide

Thanks for your interest in improving the AIUB Course Recommendation System! This guide explains how to propose changes, report issues, and follow project standards.

## Table of Contents

- [Ways to Contribute](#ways-to-contribute)
- [Before You Start](#before-you-start)
- [Development Workflow](#development-workflow)
- [Branch Strategy](#branch-strategy)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Adding / Updating Course Data](#adding--updating-course-data)
- [Issue Reporting](#issue-reporting)
- [Feature Requests](#feature-requests)
- [Security Issues](#security-issues)
- [Community Expectations](#community-expectations)

## Ways to Contribute

- Report bugs
- Suggest new features / improvements
- Improve documentation
- Optimize UI/UX or accessibility
- Refactor or modularize JavaScript
- Help with data quality in JSON course files

## Before You Start

1. Read the `README.md` for context.
2. Review `ROADMAP.md` to avoid duplicating in-progress work.
3. Check open issues / pull requests.
4. Read the `CODE_OF_CONDUCT.md`.

## Development Workflow

1. Fork the repository
2. Clone your fork
3. Create a feature branch: `git checkout -b feat/search-filter`
4. Make changes (keep them focused)
5. Validate: open `index.html` locally and test main flows
6. Commit using conventional style (see below)
7. Push branch and open a Pull Request (PR)

## Branch Strategy

| Branch Type | Prefix Example | Purpose                     |
| ----------- | -------------- | --------------------------- |
| Features    | `feat/`        | New functionality           |
| Fixes       | `fix/`         | Bug or regression fixes     |
| Refactors   | `refactor/`    | Internal structural changes |
| Docs        | `docs/`        | Documentation only          |
| Chores      | `chore/`       | Build/meta updates          |
| Experiments | `exp/`         | Prototypes (may not merge)  |

Main branch: `main` (stable). Avoid committing directly unless a trivial doc fix.

## Commit Messages

Use a simplified Conventional Commits style:

```
<type>(optional scope): short imperative description

[optional body]
[optional footer]
```

Types: `feat`, `fix`, `docs`, `refactor`, `style`, `perf`, `chore`.
Examples:

- `feat(routine): add slot conflict highlighting`
- `fix(courses): correct credit of CSE2201`

## Pull Request Process

1. Provide a clear title (same tone as commit conventions)
2. Describe what & why (include screenshots for UI changes)
3. Reference related issue numbers (e.g., `Closes #14`)
4. Ensure no console errors in browser
5. Keep PRs small; large unrelated changes may be requested to split

### PR Checklist

- [ ] Feature aligns with roadmap or has justification
- [ ] No broken links / missing assets
- [ ] JSON validated (if modified)
- [ ] Tested across desktop + mobile viewport

## Coding Standards

### HTML

- Semantic tags (`main`, `nav`, `section`, etc.)
- Accessible labels for interactive elements

### CSS

- Prefer class-based styling
- Keep responsive rules in `mediaqueries.css`
- Avoid inline styles

### JavaScript

- ES6+ only, no external frameworks
- Avoid polluting global scope—wrap logic in IIFEs or modules where possible
- Use descriptive variable names; avoid magic numbers
- Keep functions under ~40 lines when practical

## Adding / Updating Course Data

1. Open the appropriate JSON file under `course_managers/`
2. Maintain keys: `code`, `title`, `credits`, `prerequisites`, `category`
3. Keep `prerequisites` as an array (e.g., `["CSE1101"]` or `["NONE"]`)
4. Validate JSON (no trailing commas, proper quotes)
5. If adding a new department, follow naming: `courses_<dept>.json`

## Issue Reporting

Provide:

- Summary
- Steps to reproduce
- Expected vs actual results
- Browser & device (if UI-related)
- Screenshot (if relevant)

## Feature Requests

Explain:

- Problem / motivation
- Proposed solution
- Alternatives considered
- Potential data model changes (if any)

## Security Issues

Do NOT open a public issue. Follow `SECURITY.md`.

## Community Expectations

Be respectful, inclusive, and constructive. See the `CODE_OF_CONDUCT.md`.

## Questions?

Open a discussion or issue. Thanks for contributing!

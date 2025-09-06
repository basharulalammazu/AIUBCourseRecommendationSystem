# Installation & Setup Guide

This project is a static (no-backend) web application. You only need a modern browser to view it. A lightweight local server is recommended for consistent relative path behavior.

## 1. Prerequisites

- A modern browser (Chrome, Firefox, Edge, Safari)
- (Optional) Git for cloning
- (Optional) Python 3 or Node.js to run a quick local server

## 2. Clone the Repository

```bash
git clone https://github.com/basharulalammazu/AIUBCourseRecommendationSystem.git
cd AIUBCourseRecommendationSystem
```

(Or download the ZIP from GitHub and extract.)

## 3. Run Locally

### Option A: Open Directly

Double-click `index.html` (some browsers may block certain fetches from local JSON depending on CORS policies).

### Option B: Python Simple Server (Recommended)

```bash
python -m http.server 8000
```

Then visit: http://localhost:8000/

### Option C: Node (Serve)

```bash
npx serve .
```

### Option D: VS Code Live Server Extension

1. Install "Live Server" extension.
2. Right-click `index.html` -> "Open with Live Server".

## 4. File Overview

| Path                     | Purpose                                              |
| ------------------------ | ---------------------------------------------------- |
| `index.html`             | Entry point / landing page                           |
| `offer_courses.html`     | List of available/offer courses                      |
| `routine.html`           | Visual routine/schedule view                         |
| `course_managers/*.json` | Course data per department                           |
| `css/`                   | Stylesheets (responsive rules in `mediaqueries.css`) |
| `js/`                    | JavaScript logic per page                            |

## 5. Troubleshooting

| Issue                | Cause                        | Fix                              |
| -------------------- | ---------------------------- | -------------------------------- |
| JSON not loading     | Using file:// without server | Use a local server (Python/Node) |
| Stale changes        | Browser cache                | Hard refresh (Ctrl+F5)           |
| Encoding issues      | Non-UTF8 JSON                | Ensure UTF-8 without BOM         |
| Broken layout mobile | Missing viewport testing     | Use dev tools to simulate widths |

## 6. Updating / Syncing

```bash
git pull origin main
```

If you forked:

```bash
git remote add upstream https://github.com/basharulalammazu/AIUBCourseRecommendationSystem.git
git fetch upstream
git merge upstream/main
```

## 7. Deployment (Static Hosting)

| Provider          | Notes                                |
| ----------------- | ------------------------------------ |
| GitHub Pages      | Enable Pages on repo (root)          |
| Netlify           | Drag & drop root folder or link repo |
| Vercel            | Automatic with default config        |
| Any static server | Serve root directory                 |

## 8. Next Steps

See `ROADMAP.md` for upcoming features. To contribute, read `CONTRIBUTING.md`.

## 9. Uninstallation

Just delete the cloned folder—no global dependencies installed.

---

Questions? Open an issue or discussion.

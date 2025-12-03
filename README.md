<div align="center">

# AIUB Course Recommendation System

An interactive Progressive Web App (PWA) to help AIUB students explore offered courses, generate optimized routines, and plan their semester effectively across different departments (CSE, EEE, BBA, English, IPE, etc.).

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/basharulalammazu/AIUBCourseRecommendationSystem)
[![PWA](https://img.shields.io/badge/PWA-enabled-success.svg)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
[![Offline](https://img.shields.io/badge/offline-ready-green.svg)](https://github.com/basharulalammazu/AIUBCourseRecommendationSystem)

</div>

> Status: Production-ready (v2.0.0) with PWA support, offline functionality, and intelligent routine generation. Feedback & contributions welcome.

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

This project is a modern Progressive Web App (PWA) built with pure HTML/CSS/JavaScript that loads curated course data from JSON files and provides a comprehensive interface for students to:

- 🎓 Browse available courses by department
- 📚 Explore offered course lists with prerequisite checking
- 🗓️ Generate optimized routines from Excel/CSV/PDF files
- 📱 Install as a native app on mobile & desktop
- 🌐 Work completely offline after first load
- 🌙 Toggle between light and dark themes
- ⚡ Auto-update with version control

All logic runs fully client-side with intelligent caching—no backend or database required (easy to host on GitHub Pages or any static server).

## Features (Current)

### Core Functionality
- ✅ **Department-specific course catalogs** - JSON data for CSE, EEE, BBA, English, IPE
- ✅ **Offered courses page** - Browse and filter available courses
- ✅ **Intelligent routine generator** - Upload Excel/CSV/PDF and generate conflict-free schedules
- ✅ **Prerequisite validation** - Automatic checking of course dependencies
- ✅ **Credit tracking** - Visual indicators for course eligibility

### PWA Features
- ✅ **Installable** - Add to home screen on mobile and desktop
- ✅ **Offline-first** - Full functionality without internet connection
- ✅ **Service Worker** - Smart caching with version control (v2.0.0)
- ✅ **Auto-update notifications** - Alerts when new version is available
- ✅ **Responsive design** - Optimized for all screen sizes

### UI/UX
- ✅ **Dark/Light theme** - Toggle with persistence via localStorage
- ✅ **Custom modal system** - Promise-based alerts and confirmations
- ✅ **Course filtering** - All / Offered / Completed buttons
- ✅ **Color-coded status** - Green (available) / Yellow (prerequisites not met) / Red (completed)
- ✅ **Loading animations** - Stage-specific feedback during data processing
- ✅ **Mobile-optimized** - Touch-friendly buttons and responsive layouts

### Routine Generator
- ✅ **Multi-format support** - Excel (.xlsx), CSV, and PDF uploads
- ✅ **Conflict detection** - Automatic detection of time slot overlaps
- ✅ **Seat prioritization** - Lower seat count sections prioritized
- ✅ **Freshman filtering** - Excludes freshman-only sections
- ✅ **Multiple routine options** - Generates top 3 optimal schedules
- ✅ **Visual timetable** - Clean grid layout with course details

### Possible Future Enhancements

- 🔜 Advanced multi-criteria filtering (credit range, prerequisite graph, level)
- 🔜 Export / print routine (PDF generation)
- 🔜 GPA projection calculator
- 🔜 Course recommendation algorithm based on preferences
- 🔜 Multi-semester planning view

## Project Structure

````
index.html                 # Landing / main hub
offer_courses.html         # Page for viewing offered courses
routine.html               # Page for routine visualization & generation
install-guide.html         # Mobile installation guide
create-icons.html          # PWA icon generator
changelog.html             # Version changelog viewer
manifest.webmanifest       # PWA manifest configuration
service-worker.js          # Service worker for offline support

course_managers/           # JSON data for each department
	courses_CSE.json
	courses_EEE.json
	courses_BBA.json
	courses_ENGLISH.json
	courses_IPE.json

css/                       # Stylesheets
	style.css              # Global styles & components
	index.css              # Landing page styles
	offer_courses.css      # Offered courses page styles
	routine.css            # Routine page styles
	mediaqueries.css       # Responsive breakpoints

js/                        # JavaScript modules
	script.js              # Main page logic
	offer_script.js        # Offered courses logic
	routine.js             # Routine generator & parser
	theme.js               # Theme toggle functionality
	pwa.js                 # PWA registration & updates
	modal.js               # Global modal system

icons/                     # PWA icons (192x192, 512x512)
````

## Installation

### For Users

**Option 1: Install as PWA (Recommended)**
1. Visit [https://basharulalammazu.github.io](https://basharulalammazu.github.io)
2. Click "Install App" button or use browser's install prompt
3. Use offline after first load

**Option 2: Download Windows Release**
1. Download from [Releases](https://github.com/basharulalammazu/AIUB-Offered-Courses/releases)
2. Extract ZIP file
3. Run the application

### For Developers

Basic steps kept brief here—see `INSTALLATION.md` for full detail.

1. **Clone**: 
   ```bash
   git clone https://github.com/basharulalammazu/AIUBCourseRecommendationSystem.git
   cd AIUBCourseRecommendationSystem
   ```

2. **Start Local Server** (required for PWA features):
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Node.js
   npx serve
   
   # PHP
   php -S localhost:8000
   ```

3. **Open in Browser**:
   Navigate to `http://localhost:8000`

4. **Install as PWA** (optional):
   Click the install button in the browser address bar

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

### Routine Generator Input

The routine generator accepts Excel, CSV, or PDF files with the following columns:

- **Course Code** - e.g., CSE1101
- **Section** - e.g., 1, 2, A, B
- **Faculty** - Instructor name
- **Time** - e.g., "ST 08:00-09:30" or "MW 10:00-11:30"
- **Room** - Room number or location
- **Count** (optional) - Available seats

If you add new JSON files:

- Keep naming consistent: `courses_<DEPARTMENT>.json`
- Validate JSON (no trailing commas)
- Avoid extremely large files—split if necessary
- Update service worker cache if adding new assets

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

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -m 'Add YourFeature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a Pull Request describing the changes & rationale

Please read the `CODE_OF_CONDUCT.md` before contributing.

### Areas for Contribution

- 🐛 Bug fixes and improvements
- 📱 Mobile experience enhancements
- 🎨 UI/UX refinements
- 📊 New data parsing features
- 🧪 Test coverage expansion
- 📝 Documentation improvements

### Coding Style

- **JavaScript**: ES6+ syntax, framework-free, modular design
- **HTML**: Semantic tags, accessibility attributes (ARIA)
- **CSS**: Mobile-first approach, CSS custom properties, no preprocessors
- **Progressive Enhancement**: Core functionality without JavaScript where possible
- **Performance**: Optimize images, minimize reflows, lazy load when appropriate

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

## Code of Conduct

We follow the Contributor Covenant. Please review `CODE_OF_CONDUCT.md` to help maintain a welcoming environment.

## FAQ

**Q: Does this recommend courses algorithmically?**  
Currently it validates prerequisites and generates optimal routines based on conflict detection and seat availability. Advanced recommendation heuristics (workload balance, credit optimization, professor ratings) can be added in future versions.

**Q: What do the filter buttons do?**  
- **All Courses** = Every course in the department dataset
- **Offered (Available)** = Courses you can take now (prereqs & credit conditions satisfied, not completed)
- **Completed** = Courses you've marked as completed

**Q: What do the colors mean?**  
- 🟢 **Green** = Available to take (prerequisites met, not completed)
- 🟡 **Yellow** = Prerequisites or credit requirements not met
- 🔴 **Red** = Already completed

**Q: How does the routine generator work?**  
Upload an Excel/CSV/PDF file with course offerings. The system parses it, detects time conflicts, prioritizes sections with lower seat counts, and generates up to 3 optimal non-conflicting schedules.

**Q: Can I use this offline?**  
Yes! After your first visit, the app caches all resources and works completely offline. Updates are automatically downloaded when you're back online.

**Q: Can I deploy this on GitHub Pages?**  
Yes. Push to a `gh-pages` branch or enable Pages on `main`. The app is designed for static hosting with relative paths.

**Q: Are there backend requirements?**  
No—purely static. All processing happens client-side in the browser.

**Q: How do I update the app?**  
The app auto-checks for updates every minute. When a new version is available, you'll see a notification with an option to reload and apply the update.

**Q: What file formats does the routine generator support?**  
Excel (.xlsx), CSV (.csv), and PDF files. The parser automatically detects the format and extracts course data.

## Changelog

See `CHANGELOG.md` for detailed version history.

**Current Version: 2.0.0** (December 2025)
- ✨ PWA support with offline functionality
- ✨ Global modal system with animations
- ✨ Intelligent routine generator with conflict detection
- ✨ Seat count prioritization
- ✨ Freshman section filtering
- ✨ Dynamic loading animations
- ✨ Auto-update notifications
- ✨ Enhanced mobile responsiveness
- 🎨 Dark mode improvements
- 🐛 Multiple bug fixes and performance improvements

## License

MIT (`LICENSE`). Clarifications / usage notes in `LICENSE-TERMS.md`.

## Acknowledgements

- 🎓 Inspired by student planning needs at AIUB
- 👥 Contributor Covenant for community standards
- 📚 Libraries used: xlsx.js, pdf.js, Select2
- 💡 Special thanks to all contributors and testers

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **PWA**: Service Workers, Web App Manifest, Cache API
- **Libraries**: 
  - [SheetJS (xlsx)](https://github.com/SheetJS/sheetjs) - Excel parsing
  - [PDF.js](https://github.com/mozilla/pdf.js) - PDF parsing
  - [Select2](https://select2.org/) - Enhanced dropdowns
- **Icons**: Custom PWA icons
- **Hosting**: GitHub Pages compatible

---

<div align="center">

**[⭐ Star this repo](https://github.com/basharulalammazu/AIUBCourseRecommendationSystem)** if you find it helpful!

Feel free to open issues for ideas, bugs, or questions.

**Happy planning! 🎓**

Made with ❤️ by AIUB students for AIUB students

</div>

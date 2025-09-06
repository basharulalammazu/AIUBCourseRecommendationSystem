# Frequently Asked Questions (FAQ)

## General

**Q: What is this project?**  
A static web tool to browse AIUB course offerings, view routines, and help plan semesters.

**Q: Does it generate personalized recommendations?**  
Not yet. Planned enhancements may introduce prerequisite awareness and workload balancing suggestions.

**Q: Do I need a backend or database?**  
No. Everything runs client-side using JSON files.

## Usage

**Q: Courses aren't showing—why?**  
If you opened `index.html` directly (file://) some browsers block `fetch` for local JSON. Run a local HTTP server.

**Q: How do I add a new department?**  
Create a new file: `course_managers/courses_<dept>.json` following existing structure, then update any selector/UI code to reference it.

**Q: Can I export my selected routine?**  
Export/print features are on the roadmap. For now, use your browser's Print to PDF.

## Data & Structure

**Q: What fields does a course JSON entry require?**  
Minimum: `code`, `title`, `credits`, `prerequisites` (array), `category`.

**Q: How are prerequisites represented?**  
As an array of course codes. Use `["NONE"]` if none.

**Q: Can I add custom fields?**  
Yes, but ensure front-end code handles missing fields gracefully.

## Development

**Q: How do I start developing?**  
See `INSTALLATION.md` and `CONTRIBUTING.md`.

**Q: Any preferred commit style?**  
Yes—Conventional style (see `CONTRIBUTING.md`).

**Q: Tooling requirements?**  
Only a browser. Optional: a local server (Python/Node) and a code editor.

## Troubleshooting

| Problem                    | Possible Cause                | Solution                                 |
| -------------------------- | ----------------------------- | ---------------------------------------- |
| JSON fetch fails           | No local server               | Start a server (`python -m http.server`) |
| Layout broken on mobile    | Missing responsive testing    | Use DevTools device mode                 |
| Course list empty          | File renamed or path mismatch | Check console for 404s                   |
| Special characters garbled | Encoding mismatch             | Ensure UTF-8                             |

## Security & Privacy

**Q: Are user inputs stored?**  
Currently no persistent storage—no server, no analytics.

**Q: How to report a security issue?**  
See `SECURITY.md`.

## Roadmap & Contributions

**Q: How can I influence the roadmap?**  
Open an issue tagged with `enhancement` and explain the value.

**Q: Where can I see planned features?**  
`ROADMAP.md` and open issues.

## Licensing

**Q: Can I reuse parts of this project?**  
Yes, it's MIT licensed. Include the license notice.

**Q: Can I build a backend for it?**  
Absolutely—feel free to extend and share improvements.

## Misc

**Q: Does it support dark mode?**  
Not yet—open to contributions.

**Q: Does it work offline?**  
Yes after initial load (aside from any future remote data additions). A PWA enhancement could formalize offline caching.

---

Missing something? Open a PR or issue to expand this FAQ.

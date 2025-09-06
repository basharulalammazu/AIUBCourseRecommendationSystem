# Security Policy

## Supported Versions

This project is early-stage. Formal versioning will follow Semantic Versioning once releases begin. Until then, the `main` branch is the active development line.

## Reporting a Vulnerability

If you discover a security vulnerability:

1. Do NOT open a public issue immediately.
2. Email the maintainer (replace with actual email if published) or open a private disclosure (e.g., GitHub Security Advisory if enabled).
3. Provide:
   - Description of the issue
   - Steps to reproduce
   - Potential impact
   - Suggested remediation (if any)
4. You will receive confirmation within 7 days (target).

## Disclosure Policy

- Valid vulnerabilities will be addressed with priority based on severity.
- Acknowledgment will be added (unless anonymity requested) in `CHANGELOG.md` or a dedicated `SECURITY-ADVISORIES.md` if warranted.
- Public disclosure will occur only after a fix is available.

## Scope

As this is a static client-side app with no backend:

- Primary concerns: XSS via injected JSON, unsafe DOM manipulation, supply chain integrity.
- Out-of-scope (currently): Authentication, server-side injection, database leaks.

## Hardening Practices (Planned)

- Input sanitization for dynamic DOM insertions
- CSP meta recommendations for deployment
- Optional Subresource Integrity (SRI) if external assets are ever introduced

## Safe Contribution Tips

- Avoid `innerHTML` unless sanitized
- Prefer `textContent` for inserting user-facing strings
- Validate JSON structure before consuming

## Third-Party Dependencies

Currently none (no external runtime libraries). If dependencies are added later, dependency review guidelines will be documented.

## Contact

Until a formal email is published, open a minimally descriptive issue requesting private contact if needed.

---

Thank you for helping keep the project safe and reliable.

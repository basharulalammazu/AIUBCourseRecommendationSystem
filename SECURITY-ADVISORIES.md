# Security Advisories

This file aggregates public security advisories after fixes are available. For how to report a vulnerability, see `SECURITY.md`.

## Format

Each advisory follows this structure:

```
## [Identifier] Title
Date Published: YYYY-MM-DD
Severity: <Low|Medium|High|Critical>
Vector: (e.g., DOM XSS, Data Integrity, DoS)
Affected Versions: <range or commit hashes>
Patched In: <version or commit>
Reported By: <name or "Anonymous">

### Description
Concise technical summary of the issue.

### Impact
What could an attacker achieve? (data exposure, UI manipulation, etc.)

### Technical Details (Optional)
Root cause analysis; vulnerable code patterns.

### Proof of Concept (Optional)
Minimal steps or snippet demonstrating the issue.

### Mitigation
Interim workarounds (if any) prior to patch.

### Resolution
Summary of changes applied to remediate.

### Upgrade Guidance
Exact steps users should take.

### Credit
Original reporter recognition.

### References
- Links to related commits/issues/CVSS calculators
```

## Severity Guidelines

| Severity | Indicative Criteria                                         |
| -------- | ----------------------------------------------------------- |
| Low      | Edge case, minor info leak, negligible impact               |
| Medium   | User experience disruption, limited manipulation            |
| High     | Potential data tampering, significant spoofing              |
| Critical | Full compromise path, remote code execution (unlikely here) |

## Current Advisories

_None published yet._

## Advisory Lifecycle

1. Report received (private)
2. Triage & reproduce
3. Patch developed & tested
4. Release / merge fix
5. Publish advisory here + `CHANGELOG.md` note
6. (Optional) Tag release

## Example (Hypothetical)

```
## ADV-2025-0001 Unsafe InnerHTML Injection
Date Published: 2025-11-02
Severity: Medium
Vector: DOM XSS via unsanitized course title
Affected Versions: <= 0.2.0
Patched In: 0.2.1
Reported By: Anonymous

### Description
Course titles were inserted into the DOM using innerHTML without sanitization, allowing crafted JSON to inject markup.

### Impact
Malicious modified JSON could trigger script execution in the user's browser when viewing the course list.

### Mitigation
Do not load untrusted JSON sources. Avoid modifying local JSON with unverified content.

### Resolution
Replaced innerHTML usage with textContent; added sanitation helper.

### Upgrade Guidance
Pull latest main or update to v0.2.1 tag.

### Credit
Thanks to the anonymous reporter for responsible disclosure.
```

---

Questions? See `SECURITY.md` or open a minimal issue requesting private contact.

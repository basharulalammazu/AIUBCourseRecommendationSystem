# Project Governance

This document outlines how decisions are made and how responsibilities are structured for the AIUB Course Recommendation System.

## Roles

| Role        | Description                          | Current Holder    |
| ----------- | ------------------------------------ | ----------------- |
| Maintainer  | Overall direction, reviews, releases | @basharulalammazu |
| Contributor | Anyone submitting PRs/issues         | Community         |

## Decision Making

- Small scope changes: Approved by maintainer via PR review.
- Larger architectural or feature shifts: Open an issue labeled `proposal` for discussion.
- Stalemates: Maintainer has final call (record rationale in the issue for transparency).

## Contribution Flow

1. Discussion (issue / proposal)
2. Implementation (fork + branch)
3. Pull Request (linked to issue)
4. Review & feedback
5. Merge (squash or rebase at maintainer discretion)

## Release Model

- Semantic-style tags will begin once feature maturity stabilizes.
- Changelog entries required for user-facing changes.

## Transparency Practices

- All decisions documented in issues / PR threads.
- No private decision making affecting contributors without summary posted publicly.

## Conflict Resolution

- Attempt resolution respectfully in the relevant thread.
- Escalate to maintainer if unresolved.
- Maintain alignment with `CODE_OF_CONDUCT.md` at all times.

## Adding New Maintainers (Future)

Criteria may include:

- Consistent high-quality contributions
- Positive, constructive review participation
- Demonstrated long-term interest

Process (future): Nomination -> Public feedback window -> Confirmation.

## Deprecation Policy (Planned)

- Mark features as deprecated in `CHANGELOG.md`
- Provide migration guidance when applicable

## Security Handling

See `SECURITY.md`. Security disclosures are prioritized outside normal feature flow.

## Documentation Ownership

Documentation changes follow same PR process; major structural doc changes may request additional review time.

---

This governance model may evolve as the project grows. Suggestions welcome via issue.

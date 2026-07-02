## Problem Statement

Users need a safe way to temporarily disable specific jira-helper features in their current browser without deleting their saved settings. Before this change, feature behavior and feature settings were tightly coupled: users could not quickly stop runtime behavior while keeping future access and preserved configuration.

For this scope, the problem applies to two features:

- Comment Templates
- Gantt Chart

The user expectation is simple: toggle OFF should immediately stop runtime behavior, but the settings tab should remain available with a minimal re-enable control.

## Solution

Introduce per-feature local toggles stored in each feature's own storage model (not in centralized local settings). Each toggle defaults to enabled and is rendered at the top of the corresponding settings tab.

When the toggle is OFF:

- runtime behavior for that feature is not applied,
- the feature settings tab remains available,
- only a minimal toggle header and disabled hint are shown,
- existing feature data is retained.

When toggled back ON, full runtime behavior and full settings UI return immediately using previously saved data.

## User Stories

1. As a Jira user, I want to disable Comment Templates locally, so that templates stop affecting my current browser session.
2. As a Jira user, I want to disable Gantt locally, so that Gantt runtime UI stops rendering for me.
3. As a Jira user, I want each toggle in its own feature tab, so that control stays close to feature-specific settings.
4. As a Jira user, I want feature tabs to remain visible when OFF, so that I can re-enable the feature without hunting for global settings.
5. As a Jira user, I want OFF state to show a short explanation, so that I understand the feature is intentionally disabled.
6. As a Jira user, I want default state to be ON for both features, so that existing behavior is unchanged until I opt out.
7. As a Jira user, I want Comment Templates data to remain saved when OFF, so that I do not lose templates.
8. As a Jira user, I want Gantt settings to remain saved when OFF, so that I do not need to reconfigure scopes and mappings.
9. As a Jira user, I want runtime behavior to switch immediately after toggle change, so that I do not need page reloads.
10. As a Jira user, I want board/issue tab availability to remain unchanged, so that navigation is consistent.
11. As a Jira user, I want labels and hints localized, so that language behavior matches the rest of the extension.
12. As a maintainer, I want feature toggle flags stored in feature-owned models, so that ownership boundaries stay clear.
13. As a maintainer, I want legacy stored payloads to keep working, so that users with old data do not break on update.
14. As a maintainer, I want model-level persistence centralized, so that writes cannot accidentally drop fields.
15. As a maintainer, I want runtime mount/unmount behavior verified by tests, so that toggling regressions are caught quickly.
16. As a maintainer, I want Storybook ON/OFF states for both features, so that visual QA is reproducible.
17. As a maintainer, I want toggle behavior to avoid hidden coupling with unrelated modules, so that future refactoring is safer.
18. As a maintainer, I want deterministic state synchronization between settings UI and runtime integration points, so that behavior is predictable.

## Implementation Decisions

- Per-feature ownership: toggle flags live in each feature model payload (`enabled` for Comment Templates, `featureEnabled` for Gantt), not in shared local settings.
- Backward compatibility: missing toggle fields in persisted payload are treated as enabled by default.
- Minimal settings-tab contract: each tab has a stable top header with title + `Feature enabled` switch; OFF mode renders only disabled hint content.
- Runtime separation:
  - Comment Templates runtime integration is gated by persisted enabled state and synchronized with feature state changes.
  - Gantt runtime integration is gated directly by model state changes (without global window-event bridge).
- Persistence strategy: model commands mutate in-memory state and synchronize storage through a single persistence path to avoid payload drift and accidental field loss.
- No destructive toggle behavior: disabling a feature never clears feature-owned user data.
- Domain boundaries preserved:
  - settings UI remains responsible for user controls and localized text,
  - model remains source of truth for persistent state,
  - page modification/runtime layer remains responsible for mount/unmount behavior.
- UX continuity: existing route-level tab availability remains unchanged for both features.

## Testing Decisions

- Good tests validate externally observable behavior:
  - persisted toggle values,
  - runtime mount/unmount effects,
  - backward compatibility defaults,
  - OFF/ON settings rendering states.
- Avoid testing implementation details such as private helper internals; assert resulting model state, saved payload shape, and rendered/runtime outcomes.
- Modules prioritized for coverage:
  - Comment Templates storage model toggle persistence and failure rollback behavior.
  - Gantt settings model toggle persistence and load compatibility behavior.
  - Runtime page-modification behavior for Gantt/Comment Templates when toggle changes.
  - Settings containers/tabs OFF vs ON rendering.
- Prior art patterns reused:
  - existing model unit tests validating localStorage payload evolution and legacy parsing,
  - existing page-modification tests validating runtime insertion/removal behavior,
  - Storybook state-based regression checks for feature settings surfaces.

## Out of Scope

- Global "master switch" for all features.
- Moving feature toggles to centralized local-settings module.
- Cross-browser or server-synced toggle state.
- Data cleanup/purge when feature is turned OFF.
- New routes or changes to current tab visibility rules beyond agreed scope.

## Further Notes

- The implementation is intentionally conservative: user-facing behavior changes only at feature toggle points, while preserving existing defaults and saved data.
- This PRD reflects a retrospective formalization of an already implemented and validated feature set, and serves as the canonical product artifact for future maintenance.

---
sidebar_position: 4
---

# Board Properties & Local Storage

Jira Helper stores settings in two places depending on the feature. Knowing the difference is important: what you configure may affect only you or your entire team.

## Board Properties (team-shared)

**Board Properties** are Jira's built-in key-value storage attached to each board. When a feature stores its configuration in board properties, the **setting values** are shared with everyone on the board — your whole team sees the same WIP limits and other configuration when they view the board. Each user still sees their own settings UI; the underlying data is what's shared.

<!-- SCREENSHOT: Jira board settings dialog showing the "Column group WIP limits" section with a callout "Settings stored in board properties — visible to all board members" -->

> **Permission required:** You must be a **board administrator** to save settings stored in board properties. Viewers can see the settings but cannot change them. If you're not a board admin, ask your Jira administrator to grant you access.

### Features using Board Properties

- **[Column Group WIP Limits](/docs/features/wip-limits/column-limits)**
- **[Swimlane WIP Limits](/docs/features/wip-limits/swimlane-limits)**
- **[Personal WIP Limits](/docs/features/wip-limits/personal-limits)**
- **[Field Value WIP Limits](/docs/features/wip-limits/field-limits)**
- **[Cell WIP Limits](/docs/features/wip-limits/cell-limits)**
- **[Card Colors](/docs/features/board-visualization/card-colors)**
- **[Sub-tasks Progress](/docs/features/sub-tasks-progress)**
- **[Days in Column](/docs/features/card-information/days-in-column)**
- **[Days to Deadline](/docs/features/card-information/days-to-deadline)**
- **[Issue Links Display](/docs/features/card-information/issue-links-display)**
- **[Issue Condition Checks](/docs/features/card-information/issue-condition-checks)**
- **[SLA Line](/docs/features/control-chart/sla-line)**

## Local Storage (personal)

**Local Storage** is your browser's per-extension storage. Settings here apply only to **your browser** — nobody else on your team sees them, and they don't sync across devices.

<!-- SCREENSHOT: The Gantt Chart settings modal with a callout "Settings stored locally — your personal configuration only" -->

> **No special permissions required.** Anyone can configure local-storage features regardless of their Jira role.

### Features using Local Storage

- **[Gantt Chart](/docs/features/gantt-chart)** — date mappings, bar colors, exclusion rules
- **[Comment Templates](/docs/features/issue-templates/comment-templates)**
- **[Data Blurring](/docs/features/data-blurring)** — blur toggle state
- **[Local Settings](/docs/features/local-settings)** — language preference

### Features with No Settings

The following features have no configurable settings and work out of the box with no setup:

- **Swimlane Histogram** — automatically displays a bar chart on the board
- **Flag on Issue Panel** — always active on issue panels
- **Scale Ruler** — always active on the Control Chart

## Accessing Settings

1. Open any Jira board
2. Click the **Jira Helper** button in the board toolbar
3. Each feature that supports configuration has its own tab in the settings panel: **Columns**, **Swimlanes**, etc.

Additional access paths for specific features:
- **Gantt Chart** — has its own separate settings gear icon ⚙ in the Gantt chart header bar. Click this gear to open Gantt-specific settings (date mappings, bar colors, exclusion rules).
- **Comment Templates** — configured via the **Comment Templates** tab in the Jira Helper settings panel, then inserted from a dropdown in Jira's comment editor.

<!-- SCREENSHOT: Jira Helper settings dialog with tabs: Columns, Swimlanes, Gantt Chart — labels pointing to board-property tabs vs local-storage tabs -->

## Troubleshooting

### Shared settings not applying for other team members

1. Verify your team members have the extension **installed and enabled**
2. Ask them to **refresh** the Jira board (F5) after you save changes
3. Confirm you saved the settings successfully (reopen the settings panel — your configuration should still be there)
4. Check that the feature doesn't require additional per-user configuration (some features have both board-property and personal toggles)

### Changes revert after saving

Ensure you have **board administrator** permissions. Board property writes fail silently if you lack edit access. Check your Jira board's administration panel to confirm your role.

### Save fails with no error message

Board properties have a size limit imposed by Jira (typically 32 KB per property). If your configuration is large (many WIP limit groups, complex card color rules, or large condition check lists), saving may fail silently because the serialized settings exceed this limit.

To resolve:
- Reduce the number of groups, rules, or conditions
- Shorten names and JQL queries
- Split complex configurations across features where possible

### Settings lost after clearing browser data

Settings stored in **board properties** survive browser data clears because they live on the Jira server. Settings stored in **local storage** are lost if you clear your browser data — you'll need to reconfigure those features. See the [FAQ](/docs/advanced/faq#settings-lost-after-clearing-browser-data) for more details.

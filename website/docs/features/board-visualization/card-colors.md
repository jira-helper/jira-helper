---
sidebar_position: 1
---

# Card Colors

## Overview

Jira's built-in card colors apply a thin colored strip to the left edge of issue cards based on JQL rules. The Card Colors feature extends this to fill the entire card background with a matching soft tint, making priority and type distinctions far more visible at a glance on a busy board.

**Why:** On boards with many columns or swimlanes, a thin color strip is easy to miss. Full-card tinting makes JQL-based color rules immediately readable across the whole board.

**Where:** Board Settings → Card Colors → **Fill whole card** checkbox. Applicable on Scrum and Kanban board detail views.

**How it works:**
- Uses the same JQL rules you already configured in Jira's Card Colors board settings
- Applies a light, readable background tint to the whole card body
- The left color strip remains as an additional visual cue
- Flagged cards (those with blockers or impediments) keep their standard styling so urgency markers stay visible
- Cards with WIP limit warnings or other special highlighting are left alone so those signals are not obscured

**Prerequisites:**
- **Board admin** permissions are required to toggle the feature
- JQL-based card color rules must already be defined in Jira's native Card Colors settings
- The feature only applies on the **board detail view** (`?view=detail`) — it is not active on Backlog, Planning, or Simplified views

<!-- SCREENSHOT: Board Settings → Card Colors page showing the "Fill whole card" checkbox and info tooltip -->
<!-- SCREENSHOT: Board view BEFORE — thin colored strips on left edge of cards -->
<!-- SCREENSHOT: Board view AFTER — full card background tinting with the same JQL color rules -->

**Scope:** Settings are stored per board in board properties. Only board admins can turn the feature on or off. The toggle applies to all users viewing the board.

## Known Limitations

| Limitation | Details |
|---|---|
| **Supported views** | Only board detail view (`?view=detail`). Backlog, Planning, and Simplified views are not supported. |
| **Jira version** | Requires Jira Software Cloud. Server/Data Center may have different DOM structure and is not officially supported. |
| **Dark mode** | The feature uses Jira's light theme color contrast. On dark mode, card tints may appear darker or less visible. |
| **Large boards** | Boards with 100+ visible cards may experience slight rendering delays during initial color application. |
| **Custom board plugins** | Third-party board customizations that modify card DOM structure may interfere with color application. |

## User Jobs

### Enable/disable the feature in board settings

**Goal:** Turn full-card coloring on or off for the current board.

1. Open your board in Jira.
2. Click the **Board settings** gear icon in the top-right toolbar.
3. In the left sidebar, select **Card Colors** (the native Jira screen where you define JQL-based color rules).
4. Above the color rules table, locate the **Fill whole card** checkbox.
5. Check the box to enable full-card tinting, or uncheck to restore Jira's default thin-strip behavior.
6. Changes save automatically — no additional confirmation step.

The toggle applies to all users viewing the board. Hover the info icon next to the checkbox to see a before/after visual comparison.

### Board view: full card background colored based on priority/type

**Goal:** Read card priority or type information at a glance without inspecting individual cards.

1. Ensure the feature is enabled (see job above).
2. Navigate to your board's detail view (the standard Scrum or Kanban layout).
3. Observe that every card now shows a gentle background tint matching its JQL-assigned color.
4. The color fills the entire card area while keeping text, avatars, labels, and other card elements fully readable.
5. Cards flagged as blocked or with active WIP limit warnings retain their original styling — the tint does not override these important signals.
6. Cards without a matching JQL rule remain white/no background, same as before.

## Troubleshooting

### "Fill whole card" checkbox is missing

1. Ensure you have **board admin** permissions.
2. Verify you are on the **Card Colors** tab of Board Settings (the native Jira screen, not a jira-helper settings panel).
3. The checkbox appears only on the board detail settings page — it is not available in project-level settings.
4. Try refreshing the Board Settings page if jira-helper was recently installed or updated.

### Colors are not applying to cards

1. Confirm the checkbox is **checked** in Board Settings → Card Colors.
2. Verify you are viewing the board in **detail view** (the URL should contain `?view=detail`). Full-card coloring does not apply on Backlog or Planning views.
3. Check that Jira's **native card color rules** (JQL-based) are actually matching your cards. Switch back to thin-strip mode to verify the left color strip appears — if not, your JQL rules may need adjustment.
4. Refresh the board page.

### Colors are stale after editing JQL rules

1. After editing Jira's native card color rules, the board must be **reloaded** for changes to take effect.
2. The "Fill whole card" setting itself does not need to be re-saved — but the board page should be refreshed to pick up new JQL rules.

### Color conflicts with WIP limit highlighting

1. WIP limit warnings (red backgrounds from exceeded limits) take priority over card coloring.
2. If a card has both a JQL color and a WIP limit warning, the WIP limit red tint overrides the card color. This is by design — overload signals should not be hidden.

## Related Features

- [Column Group WIP Limits](/docs/features/wip-limits/column-limits) — CONWIP limits with colored group headers
- [Swimlane WIP Limits](/docs/features/wip-limits/swimlane-limits) — per-swimlane caps with color coding
- [Days in Column](/docs/features/card-information/days-in-column) — aging badges on colored cards
- [Days to Deadline](/docs/features/card-information/days-to-deadline) — deadline badges on colored cards

## See Also

- [Atlassian: Configure card colors](https://support.atlassian.com/jira-software-cloud/docs/configure-card-colors/) — official Jira card color documentation (JQL-based color rules)

---
sidebar_position: 3
---

# Issue Links Display

## Overview

Issue Links Display shows related issues as colored badges directly on board cards. Each badge displays the linked issue's summary, and clicking it opens the linked issue in a new tab. You define which link types to show, which source tasks to check, and which linked tasks to filter — giving you full control over what relationships are visible on the board.

**Why:** Understanding dependencies and relationships between issues normally requires opening each card. Inline link badges make context visible at a glance — parent tasks, blockers, related projects, and more — without leaving the board.

**Where:** Board Settings → Jira Helper → Additional Card Elements → Display issue links on cards. Configurations control which links appear, filtered by link type, source filters, and linked-task filters.

**How it works:**
- You define **link configurations**: each has a name, link type with direction, optional source filters, optional linked-task filters, color settings, and multiline toggle
- Configurations can filter which source tasks to analyze (all tasks, or by JQL / field values)
- Configurations can filter which linked tasks to display (all linked, or by JQL / field values)
- On the board: badges appear under the card title, stacked vertically in selected columns
- In the Backlog: badges appear horizontally in a row when `Show links in backlog` is enabled
- Each badge shows the linked issue's summary; click it to open the issue in a new tab
- Colors can be fixed or auto-generated unique per linked issue

<!-- SCREENSHOT: Board settings panel — Additional Card Elements tab with multiple link configurations visible, one expanded showing link type dropdown, source filter fields, and color picker -->

---

## Prerequisites

- **Board edit permissions** are required to create or modify link configurations (settings are stored in [board properties](/docs/settings#board-properties-team-shared))
- The Jira instance must have issue link types defined (built-in types like "blocks", "relates to" are always available)

---

## Quick-Start: Common Link Type Presets

| Link Type (Inward) | Link Type (Outward) | Use Case |
|---|---|---|
| `is blocked by` | `blocks` | Show what's blocking each card |
| `is cloned by` | `clones` | Track clone relationships |
| `relates to` | `relates to` | Show loosely related work |
| `is parent of` | `is child of` | Show parent/child hierarchy |
| `is caused by` | `causes` | Track cause-effect chains |
| `is duplicated by` | `duplicates` | Show duplicate issues |

> **Tip:** Use **Unique Colors** for configurations tracking multiple targets (e.g., blockers) so each blocker gets a distinct badge color. Use **Fixed Colors** for parent/child relationships where uniformity helps.

---

## User Jobs

### Add a link config: name, link type, direction

**Goal:** Create a new link configuration to display a specific type of relationship.

1. Open board settings → **Jira Helper** → **Additional Card Elements** tab.
2. Ensure **Enable additional card elements** is checked.
3. Click **Add Link Configuration**.
4. In the new configuration card, enter a **Link Name** (max 20 characters, shown only in settings).
5. Select a **Link Type** from the dropdown. The list is auto-loaded from your Jira instance. Examples: `is Parent of`, `relates to`, `blocks`, `is blocked by`.
6. The direction (inward/outward) is determined by the selected link type.

### Configure source filters (JQL or field on source tasks)

**Goal:** Limit which tasks on the board are checked for links.

1. In a link configuration, uncheck **Track all tasks**.
2. Two filter modes are available:
   - **JQL mode:** enter a JQL query (e.g., `status = "In Progress"`)
   - **Field mode:** select a field ID and a value (e.g., Issue Type = Project)
3. Only tasks matching the filter will have their links analyzed and displayed.

### Configure linked task filters (JQL or field)

**Goal:** Limit which linked issues are shown as badges.

1. In a link configuration, uncheck **Track all linked tasks**.
2. Configure the filter using JQL or field mode:
   - **JQL mode:** enter a JQL query (e.g., `status != "Done"`)
   - **Field mode:** select a field and value (e.g., Issue Type = Project)
3. Only linked issues matching the filter are displayed as badges.

### Configure display (color, multiline summary)

**Goal:** Control the visual appearance of link badges.

1. In a link configuration, find the **Unique Colors** checkbox:
   - **Enabled:** each linked issue gets an auto-generated unique color based on its key and summary
   - **Disabled:** all badges use one fixed color, selectable via the color picker
2. Find the **Multiline Summary** checkbox:
   - **Enabled:** long summaries wrap to multiple lines
   - **Disabled:** long summaries are truncated with ellipsis; full text appears on hover

### Enable in Backlog view

**Goal:** Show link badges on Backlog cards too.

1. In the **Additional Card Elements** settings, find the **Show links in backlog** checkbox.
2. Check the box.
3. Backlog cards now display link badges in a horizontal row at the end of the card.
4. Column settings do not apply to the Backlog — links are shown for all Backlog issues.

### Make epic links clickable

**Goal:** Open the parent epic directly from the native Jira Epic Link badge on the card.

1. In the **Additional Card Elements** settings, find the **Make Epic Link clickable** checkbox.
2. Check the box.
3. Native Jira Epic Link badges on cards become clickable. Clicking opens the epic issue in a new tab.

### Board view: colored badges under card title

**Goal:** Read linked issues directly on board cards.

1. Look at cards in the selected columns. Below each card's summary/title, colored badges are displayed vertically (one per linked issue).
2. Each badge shows the linked issue's summary text.
3. Badge color depends on configuration: fixed color or unique auto-generated color per issue.
4. **Hover** a badge to see the full summary if truncated.
5. **Click** a badge to open the linked issue in a new browser tab.
6. Multiple configurations stack — each configuration's badges are displayed together under the card title.

<!-- SCREENSHOT: Board card showing multiple link badges — two blocker badges (red), one relates-to badge (blue), all with truncated summaries. Epic link badge is clickable (cursor pointer visible) -->

<!-- SCREENSHOT: Backlog view showing cards with horizontal row of colored link badges at the card bottom -->

---

## Example Configuration

**Goal:** Show blockers and related work on an engineering board.

| Setting | Value |
|---|---|
| **Link Name** | Blockers |
| **Link Type** | `is blocked by` |
| **Track all tasks** | unchecked |
| **Source JQL** | `status != "Done"` |
| **Track all linked tasks** | unchecked |
| **Linked task JQL** | `status != "Done" AND status != "Cancelled"` |
| **Unique Colors** | enabled |
| **Multiline Summary** | enabled |

With this config, cards in active columns display colorful badges for each unresolved blocker. Completed cards and cancelled blockers are hidden to reduce noise.

---

## Performance Considerations

- Each active configuration triggers an API request to Jira for every matching card. On boards with **50+ cards and 3+ link configurations**, badge rendering may lag by 1–3 seconds during board load or column transitions.
- Limit the number of active configurations to the ones you actually use. Disable unused configurations rather than deleting them.
- Use source and linked-task filters to reduce the number of issues fetched per configuration.

---

## Troubleshooting

### Badges not appearing on cards

- Verify **Enable additional card elements** is checked
- Confirm the **Column Settings** include the column the card is in
- Check that the link type exists in your Jira instance (the dropdown auto-loads from Jira — if empty, Jira may have no custom link types)
- If using source filters, verify the JQL compiles: test it directly in Jira's **Issues → Search for issues** page

### Epic links not clickable

- Ensure **Make Epic Link clickable** is checked
- Epic Link badges only appear when the card's issue type is included in an Epic Link scheme (standard in Jira Scrum boards)
- The feature only works on Jira Software boards, not Jira Service Management

### Links appear stale / cached

- Link data is fetched when the board loads and when Swimlane/Card updates are triggered by Jira. If you edited links in another tab, **refresh the board page** (F5) to force a reload.
- If badges still show outdated data, check your browser console for API errors — the Jira instance may be rate-limiting requests

### JQL syntax errors in filters

- Test all JQL queries directly in Jira's issue navigator before pasting them into the configuration
- Common pitfalls: unquoted status names with spaces (`status = In Progress` → `status = "In Progress"`), wrong field names (`assignee` → `assignee` is correct; `assignedTo` is not)

---

## See Also

- [Days in Column](/docs/features/card-information/days-in-column) — another card badge feature
- [Days to Deadline](/docs/features/card-information/days-to-deadline) — time-remaining badge
- [Issue Condition Checks](/docs/features/card-information/issue-condition-checks) — icon badges for JQL conditions
- [Sub-tasks Progress](/docs/features/sub-tasks-progress) — progress bars for child work
- [Settings: Board Properties](/docs/settings#board-properties-team-shared)
- [Jira Help: Configuring Issue Linking](https://support.atlassian.com/jira-software-cloud/docs/configure-issue-linking/)

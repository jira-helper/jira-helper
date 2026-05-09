---
sidebar_position: 3
---

# Issue Links Display

## Overview

Issue Links Display shows related issues as colored badges directly on board cards. Each badge displays the linked issue's summary, and clicking it opens the linked issue in a new tab.

**Why:** Understanding dependencies and relationships between issues normally requires opening each card. Inline link badges make context visible at a glance — parent tasks, blockers, related projects, and more — without leaving the board.

**Where:** Board Settings → Jira Helper → Additional Card Elements → Display issue links on cards. Configurations control which links appear, filtered by link type, source filters, and linked-task filters.

**How it works:**
- You define **link configurations**: each has a name, link type with direction, optional source filters, optional linked-task filters, color settings, and multiline toggle
- Configurations can filter which source tasks to analyze (all tasks, or by JQL / field values)
- Configurations can filter which linked tasks to display (all linked, or by JQL / field values)
- On the board: badges appear under the card title, stacked vertically in selected columns
- In the backlog: badges appear horizontally in a row when `Show links in backlog` is enabled
- Each badge shows the linked issue's summary; click it to open the issue in a new tab
- Colors can be fixed or auto-generated unique per linked issue

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
   - **JQL mode:** enter a JQL query (e.g., `status != Done`)
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

### Enable in backlog view

**Goal:** Show link badges on backlog cards too.

1. In the **Additional Card Elements** settings, find the **Show links in backlog** checkbox.
2. Check the box.
3. Backlog cards now display link badges in a horizontal row at the end of the card.
4. Column settings do not apply to backlog — links are shown for all backlog issues.

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

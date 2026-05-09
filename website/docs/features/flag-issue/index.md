---
sidebar_position: 1
---

# Flag on Issue Panel

## Overview

Zero-configuration feature that highlights flagged issues in the issue hierarchy. Any related item — linked issue, sub-task, epic child — that has a Jira flag gets a yellow background and a flag icon, making it easy to spot blocked or attention-needed work.

**A Jira flag** is a built-in issue property (the **Flagged** field) that marks an issue as impeded or needing attention. It appears as a red flag icon in Jira's interface and is commonly used for blockers, stalled work, or high-priority alerts.

**Why:** When viewing a parent issue with many children, finding which ones are flagged requires scanning each row for a small flag icon. This feature makes flagged items visually unmissable with a yellow background and prominent icon, saving you from scanning each row individually.

**Where:** All routes automatically — no configuration needed. Works on classic issue view, new issue view, board side panels, and search results.

**How it works:**
- On every issue page, the extension scans all visible related items (subtasks, epic children, linked issues) for the `Flagged = "Yes"` property
- Flagged items receive a yellow background (`#ffe9a8` in classic view, `#fffae6` in new issue view) and a 🚩 icon
- The currently open issue, if flagged, also gets a flag icon in the header area
- Runs automatically — no settings, no configuration, no board permissions needed

<!-- SCREENSHOT: Classic issue view showing expanded subtasks — one subtask row highlighted with yellow background and a flag icon next to its key, while unflagged rows remain unstyled -->

---

## Supported Views

| View | Flag Highlight | Flag Icon | Notes |
|---|---|---|---|
| Classic issue page | Yellow background on row | 🚩 next to key | Full hierarchy scanned (subtasks, epic children, linked issues) |
| New issue view | Light yellow (`#fffae6`) on row | 🚩 next to key | Subtasks and linked issues |
| Board side panel | Yellow background | 🚩 next to summary | Issue panel opened from board |
| Search results | Yellow background | 🚩 next to key | Each flagged row in the issue navigator |
| Backlog | Not supported | — | Backlog cards have limited DOM access |

---

## Usage

### Automatic: no setup required

**Goal:** See flagged items highlighted automatically.

1. Open any issue (classic or new issue view, board side panel, search results).
2. Flagged related items are automatically highlighted with a yellow background.
3. A flag icon (🚩) appears next to the issue key or summary.
4. The feature works immediately — no board configuration, no toggle, no permissions needed.

### Issue hierarchy: flags highlighted throughout

**Goal:** Visually identify flagged work at every level of the issue tree.

1. On a classic issue page, expanded sub-tasks, epic children, and linked issues are scanned.
2. Items with an active Jira flag get:
   - **Yellow background** (`#ffe9a8` classic, `#fffae6` new issue view)
   - A **flag icon** placed next to the issue key/link
3. If the **currently open issue** is itself flagged, a flag icon also appears in the header area (near priority/type) in the classic view.

---

## FAQ

### What if I unflag an issue — does the highlight update?

Yes, but not in real time. The highlight reflects the issue's state at page load. If you modify a flag in another tab and return, **refresh the page** (F5) to see the updated state. The board side panel reloads when you reopen the issue panel.

### Does this work on all Jira pages?

It works on classic issue view, new issue view, board side panels, and search results. It does **not** work on backlog, dashboard gadgets, or the Jira Service Management portal.

### Is this feature configurable?

No — it's intentionally zero-configuration. There are no settings to adjust, no columns to select, no permissions to manage. If you find the yellow background distracting, the [Data Blurring](/docs/features/data-blurring) feature blurs all text content and images on the page — not just flags but issue summaries, keys, avatars, and descriptions. Use it during presentations to hide sensitive data entirely, not to selectively suppress flag highlighting.

### Does it slow down page loading?

No. The feature uses DOM observation and lightweight property checks. It adds no measurable latency for typical Jira pages (up to several hundred visible related items). For pages with thousands of related items, Jira's own rendering dominates page load time.

---

## Troubleshooting

### Flagged items not highlighted on a classic issue page

- The issue page must be **fully loaded** before highlighting activates. If the page is still loading subtasks (AJAX), wait for all rows to render.
- If the issue uses a **custom theme or plugin** that overrides table row backgrounds, the yellow highlight may be overridden. Check your browser's DevTools to confirm the style is applied but overridden.
- Very old Jira Server versions (pre-7.0) may store flags differently — ensure your Jira instance is up to date.

### Flag icon appears but no yellow background

- The yellow background is applied via a CSS class. If your Jira instance has a global stylesheet that sets `!important` on row backgrounds, the highlight may be suppressed. This is most common on heavily customized Jira Server instances.

### Feature doesn't work on new issue view

- The new issue view (Jira's React-based UI) uses a lighter yellow (`#fffae6`). If it's not visible, the Jira version may have changed DOM structure — check that the extension is updated to the latest version.

---

## See Also

- [Issue Condition Checks](/docs/features/card-information/issue-condition-checks) — icon badges for JQL conditions
- [Sub-tasks Progress](/docs/features/sub-tasks-progress) — progress bars with blocked detection
- [Data Blurring](/docs/features/data-blurring) — privacy mode for presentations
- [FAQ](/docs/advanced/faq)

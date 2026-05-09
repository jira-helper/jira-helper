# Flag on Issue Panel

## Overview

Zero-configuration feature that highlights flagged issues in the issue hierarchy. Any related item — linked issue, sub-task, epic child — that has a Jira flag gets a yellow background and a flag icon, making it easy to spot blocked or attention-needed work.

---

## User Jobs

### Zero-config (automatic)

**Goal:** No setup required — feature works out of the box.

1. Open any issue (classic or new issue view, board side panel, search results).
2. Flagged related items are automatically highlighted with a yellow background.
3. A flag icon (🚩) appears next to the issue key or summary.

### Issue view: flag icons, yellow background on flagged related items

**Goal:** Visually identify flagged work in the hierarchy.

1. On a classic issue page, expanded sub-tasks, epic children, and linked issues are scanned.
2. Items with an active Jira flag get:
   - **Yellow background** (`#ffe9a8` classic, `#fffae6` new issue view).
   - A **flag icon** placed next to the issue key/link.
3. If the **currently open issue** is itself flagged, a flag icon also appears in the header area (near priority/type) in the classic view.
4. The feature runs automatically on all routes: board issue panel, full issue page, issue search.

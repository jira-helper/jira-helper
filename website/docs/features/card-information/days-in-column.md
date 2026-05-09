---
sidebar_position: 1
---

# Days in Column

## Overview

The Days in Column badge displays how many days an issue has been in its current board column. A color-coded badge (blue, yellow, or red) makes it easy to spot aging issues and "stuck" work at a glance.

**Why:** Without this feature, you must hover each card or navigate into an issue to know how long it has been in a column. The badge surfaces aging data directly on the card, with configurable warning thresholds to highlight issues that need attention.

**Where:** Board Settings → Jira Helper → Additional Card Elements → Days in Column section. The badge appears on cards in selected columns only.

**How it works:**
- Calculates time from the last column transition (based on Jira's changelog)
- Color thresholds can be global (same for all columns) or per-column (different rules for different workflow stages)
- Format: `<1 day` / `1 day` / `X days` for 0, 1, and 2+ days respectively
- Color scheme: **blue** (below warning), **yellow** (warning reached), **red** (danger reached)
- Jira's built-in days counter on cards is automatically hidden when this feature is enabled
- Not displayed in backlog view (backlog has no columns)

---

## User Jobs

### Enable and select columns to show badges on

**Goal:** Turn on the Days in Column badge and choose which columns display it.

1. Open your board and click **Jira Helper** in the board toolbar.
2. Select the **Additional Card Elements** tab.
3. Check **Enable additional card elements**.
4. In the **Column Settings** section, select the columns where you want badges to appear.
5. Scroll to the **Days in Column Badge** subsection.
6. Check **Show days in column badge**.
7. Badges now appear on all cards in the selected columns.

### Set global warning/danger thresholds (yellow/red days)

**Goal:** Apply the same aging thresholds to all selected columns.

1. In the Days in Column settings, ensure **Use separate rules for each column** is unchecked.
2. **Warning threshold:** Enter the number of days after which the badge turns yellow. Leave empty to disable yellow highlighting.
3. **Danger threshold:** Enter the number of days after which the badge turns red. Leave empty to disable red highlighting.
4. If the danger threshold is less than or equal to the warning threshold, a warning icon appears — but the settings can still be saved.
5. Badges in all tracked columns now follow these global thresholds.

### Configure per-column thresholds

**Goal:** Set different aging rules for different workflow stages (e.g., testing yellows at 2 days, development at 5 days).

1. In the Days in Column settings, check **Use separate rules for each column**.
2. A row appears for each selected column.
3. For each column row, set:
   - **Warning threshold:** days for yellow badge
   - **Danger threshold:** days for red badge
4. If a column was deleted from the board, its row shows a warning and a **Remove** button appears to clean up stale settings.
5. Badges now use per-column thresholds. Columns without explicit thresholds always display blue.

### Board view: colored badge on card

**Goal:** Read aging status at a glance on board cards.

1. Look at cards in the selected columns. A badge is displayed near the end of each card.
2. Read the badge text:
   - `<1 day` — issue just arrived in this column
   - `1 day` — one full day in column
   - `3 days` — three full days in column
3. Interpret the badge color:
   - **Blue:** either no thresholds set, or the day count is below the warning threshold
   - **Yellow:** day count has reached or exceeded the warning threshold
   - **Red:** day count has reached or exceeded the danger threshold
4. Click into any card with a yellow or red badge to investigate and take action (move it forward, unblock it, or reassign).

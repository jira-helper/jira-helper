---
sidebar_position: 1
---

# Card Colors

## Overview

Jira's built-in card colors apply a thin colored strip to the left edge of issue cards based on JQL rules. The Card Colors feature extends this to fill the entire card background with a matching soft tint, making priority and type distinctions far more visible at a glance on a busy board.

**Why:** On boards with many columns or swimlanes, a thin color strip is easy to miss. Full-card tinting makes JQL-based color rules immediately readable across the whole board.

**Where:** Board settings → Card Colors → **Fill whole card** checkbox. Applicable on Scrum and Kanban board detail views.

**How it works:**
- Uses the same JQL rules you already configured in Jira's Card Colors board settings
- Applies a light, readable background tint to the whole card body
- The left color strip remains as an additional visual cue
- Flagged cards (those with blockers or impediments) keep their standard styling so urgency markers stay visible
- Cards with WIP limit warnings or other special highlighting are left alone so those signals are not obscured

**Scope:** Settings are stored per board in board properties. Only board admins can turn the feature on or off.

---

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

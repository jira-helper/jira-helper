---
---

import {DaysInColumnMockup} from '@site/src/components/DaysInColumnMockup';

# Days in Column

| | |
|---|---|
| Where configured | «Board Settings» → «Additional Card Elements» → «Days in Column Badge» |
| Where visible | Board (detail view) |
| Settings apply to | For the whole team |

## Purpose

Show how many days an issue has spent in its current column, with colour thresholds so stalled work is easy to spot.

<DaysInColumnMockup />

Toggle **«Show days badge»** to switch between a compact dot indicator and a readable day-count badge. Green = fresh (≤3 d), orange = stale (≤7 d), red = old (>7 d).

## How to configure

### Where to find settings

1. Open your board, then **«Jira Helper»** → board settings.
2. Open the **«Additional Card Elements»** tab.

### How to configure

- **Enable the feature**: turn on **«Enable additional card elements»**.
- **Choose columns**: in **«Column Selection»**, pick columns where the badge should appear.
- **Show days in column badge**: enable **«Show days in column badge»** in the **«Days in Column Badge»** section.
- **Choose threshold mode**:
  - **Global thresholds** — same warning/danger values for every column.
  - **Per-column rules** — different thresholds per column (for example testing = 3 days, development = 10 days).
- **Set warning threshold (yellow)**: badge turns yellow after this many days in column. Leave empty to disable yellow for that rule.
- **Set danger threshold (red)**: badge turns red after this many days in column. Leave empty to disable red for that rule.

Jira's built-in day counter (`.ghx-days`) is hidden automatically when this feature is enabled.

## How to use

- The badge appears at the end of the card in selected columns.
- **Text format:** `<1 day in column`, `1 day in column`, `X days in column`.
- **Colours:** blue (normal), yellow (warning), red (danger) according to your thresholds.
- With per-column thresholds, each column can use its own values.
- The badge does not appear in the backlog.

## Usage scenarios

1. **Spot stalled issues** — a red badge highlights issues that sit too long in one column.
2. **Stage-specific SLAs** — different thresholds per column (for example Code Review = 1 day, testing = 3 days).
3. **Flow health** — yellow badges flag issues approaching risky dwell time.

## Troubleshooting

- **Badge missing:** Ensure the feature is on, columns are selected, and the days-in-column badge itself is enabled.
- **Colours not changing:** Check thresholds (warning should be less than danger when both are set) and that dwell time actually crosses them.
- **Jira counter still visible:** Refresh the page — hiding runs when the feature initialises.
- **Stale column rows in settings:** If per-column mode lists columns that no longer exist on the board, use **«Remove»** to clean them up.

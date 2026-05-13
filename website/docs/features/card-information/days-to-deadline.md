---
---

# Days to Deadline

| | |
|---|---|
| Where configured | «Board Settings» → «Additional Card Elements» → «Days to Deadline Badge» |
| Where visible | Board (detail view) |
| Settings apply to | For the whole team |

## Purpose

Show how many days remain until the issue deadline with colour cues for approaching and missed dates. The badge uses the ⏰ emoji so it is easy to tell apart from other card badges.

## How to configure

### Where to find settings

1. Open your board, then **«Jira Helper»** → board settings.
2. Open the **«Additional Card Elements»** tab.

### How to configure

- **Enable the feature**: turn on **«Enable additional card elements»**.
- **Choose columns**: in **«Column Selection»**, pick columns where the badge should appear.
- **Show days to deadline badge**: enable **«Show days to deadline badge»** in the **«Days to Deadline Badge»** section.
- **Select the deadline field**: choose the field that holds the deadline (`date`, `datetime`, or `string`).
- **Choose display mode**:
  - **«Always»** — badge shows whenever a deadline exists.
  - **«Less than X days or overdue»** — badge shows if ≤ X days remain or the issue is overdue.
  - **«Overdue only»** — badge shows only for overdue issues.
- **Set warning threshold**: optional **«Warning threshold»** (yellow) — badge turns yellow when at most this many days remain.

## How to use

- The badge appears at the end of the card (after the «days in column» badge if that feature is on).
- **Text format:**
  - Overdue: `⏰ X days overdue`
  - Due today: `⏰ Due today!` (red text on yellow background)
  - Due tomorrow: `⏰ Due tomorrow` (yellow background)
  - Days left: `⏰ X days left`
- **Colours:**
  - Red — overdue (always).
  - Yellow — due today (0 days), tomorrow (1 day), or remaining days ≤ warning threshold.
  - Blue — all other cases.
- In **«Overdue only»** mode the yellow warning threshold does not apply.
- The badge does not appear in the backlog.

## Usage scenarios

1. **Track all deadlines** — «Always» shows a badge for every issue that has the deadline field set.
2. **Focus on soon due** — «Less than 5 days or overdue» shows only items within five days or late.
3. **Overdue-only triage** — «Overdue only» for a strict overdue list.

## Troubleshooting

- **Badge missing:** Check that a deadline field is selected and the issue has a value in that field.
- **Field not in list:** Fields are loaded from the project — the field must exist and be `date`, `datetime`, or `string`.
- **No yellow for some days:** «Today» and «Tomorrow» are always yellow regardless of the warning threshold; for other dates ensure the threshold is set and remaining days ≤ threshold.

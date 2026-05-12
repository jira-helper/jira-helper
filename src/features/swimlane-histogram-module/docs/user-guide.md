# Swimlane Histogram

| | |
|---|---|
| Where configured | No configuration required |
| Where visible | Board (detail view) |
| Settings apply to | Not required |

## Purpose

Show how issues are distributed across board columns inside each swimlane as a compact bar chart next to the swimlane name.

## How to configure

### Where to find settings

No configuration required. The histogram appears automatically on supported board views (Scrum/Kanban) when swimlanes are enabled.

### How to configure

There are no settings to configure for this feature.

## How to use

- Next to each swimlane name you see a horizontal row of narrow bars — one bar per board column.
- Bar height reflects that column’s share of all issues in the swimlane: the taller the bar, the more issues in that column.
- Hovering (or focusing) a bar shows a tooltip with the column name and issue count.
- Bars use neutral greys: light placeholders for empty columns, darker bars for columns that contain issues.
- The chart updates automatically when the board changes.

## Usage scenarios

1. **Quick distribution check** — see at a glance which columns hold most of the work in each swimlane.
2. **Spot uneven flow** — a swimlane where almost everything sits in one column hints at a bottleneck.
3. **Compare swimlanes** — compare histogram shapes across swimlanes to judge load balance across teams or streams.

## Troubleshooting

- **Chart not visible:** Use the detailed board view (Scrum/Kanban), not a simplified or alternate layout, and ensure swimlanes are enabled.
- **Empty columns hard to see:** Empty columns use very light grey placeholders — they may blend into the background with some Jira themes.

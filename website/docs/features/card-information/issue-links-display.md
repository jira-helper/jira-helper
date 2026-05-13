---
---

# Issue Links Display

| | |
|---|---|
| Where configured | «Board Settings» → «Additional Card Elements» → «Issue Links» |
| Where visible | Board (detail view + backlog) |
| Settings apply to | For the whole team |

## Purpose

Show related issues on board cards as coloured badges under the issue summary so you can see context and dependencies at a glance.

## How to configure

### Where to find settings

1. Open your board, then **«Jira Helper»** → board settings.
2. Open the **«Additional Card Elements»** tab.

### How to configure

- **Enable the feature**: turn on the main **«Enable additional card elements»** toggle.
- **Choose columns**: in **«Column Selection»**, pick the columns where link badges should appear.
- **Show links in backlog**: enable to show links on backlog cards too.
- **Add a link configuration**: click **«Add Link Configuration»** and set up a rule:
  - **«Link Name»** — configuration name (up to 20 characters, visible only in settings).
  - **«Link Type»** — link type (for example «is Parent of», «blocks», «relates to»).
  - **«Unique Colors»** — on: each linked issue gets its own colour; off: one fixed colour for all.
  - **«Multiline Summary»** — on: long summaries wrap to multiple lines.
  - **«Track all tasks»** — which source issues to analyse (all or via JQL/filter).
  - **«Track all linked tasks»** — which linked issues to show (all or via JQL/filter).
- **Add multiple configurations** if you need different link types or rules.

## How to use

**On the board:**

- Badges appear vertically under the card summary in the selected columns.
- Clicking a badge opens the linked issue in a new tab.
- Badge colour follows your settings: fixed or auto-generated.

**In the backlog:**

- When **«Show links in backlog»** is on, badges appear in a horizontal row at the end of the card.
- Column selection does not apply in the backlog — links show for every card.

## Usage scenarios

1. **Show parent work** — configure an «is Parent of» link and see the project or epic a task belongs to.
2. **Filter by issue type** — show only linked issues of type Project with JQL: `issueType = Project`.
3. **Filter by status** — show only open linked work: `status != Done`.
4. **Combined filter** — e.g. `(issueType = Project AND status != Done) OR (issueType = Objective AND labels = "Business")`.

## Troubleshooting

- **Badges missing:** Ensure the main toggle is on, board columns are selected, and at least one link configuration exists.
- **Linked issues not found:** Verify the link type and that the issue really has links of that type.
- **Colours wrong:** With unique colours, colours are generated automatically; for a fixed colour pick it in the colour picker.

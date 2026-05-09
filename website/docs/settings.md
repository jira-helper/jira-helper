# Settings

jira-helper uses two storage systems for settings, depending on the feature.

## Board Properties (persistent per board)

Most features store settings in **Jira Board Properties** — this means your configuration persists for everyone who has access to the board (if you have edit permissions).

Settings stored in board properties:
- Column WIP Limits
- Swimlane WIP Limits
- Personal WIP Limits
- Field Value WIP Limits
- Cell WIP Limits
- Card Colors
- Sub-tasks Progress
- Additional Card Elements (Days in Column, Days to Deadline, Issue Links, Condition Checks)
- SLA Line

## Local Storage (personal)

Some settings are stored in your browser's `localStorage` and apply only to your browser:

- Gantt Chart settings
- Data Blurring toggle
- Language preference
- Comment Templates
- Bug/Description Template

## Accessing Settings

1. Open a board in Jira
2. Click the **Jira Helper** button in the board toolbar
3. Each feature that has settings shows its own tab

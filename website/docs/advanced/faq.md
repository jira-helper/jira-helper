---
sidebar_position: 2
---

# FAQ

## General

### What is Jira Helper and is it free?

Jira Helper is a free, open-source browser extension (ISC license) that adds professional Kanban features to Jira: WIP limits, card coloring, Gantt charts, analytics, and more. It works with both Jira Cloud and Jira Server/Data Center. No paid tiers, no subscriptions, no premium features — free to use, modify, and share.

### Which browsers are supported?

Chrome 88+, Firefox 58+, and Edge 88+ (Chromium-based). The extension uses standard WebExtensions APIs for broad compatibility.

### Does it send my data anywhere?

**No.** All data stays in your browser. The extension communicates only with your Jira instance through its existing REST API. No data is sent to third parties, no analytics, no telemetry, no external servers. See [Installation](/docs/getting-started/installation) for the privacy note.

### Does it work with Jira Cloud and Jira Server?

Yes. Jira Helper works with Jira Cloud, Jira Server, and Jira Data Center.

### Does it work on Jira Service Management (JSM) boards?

No. Jira Helper targets Scrum and Kanban software boards. JSM boards use a different UI structure and are not supported.

## Installation & Uninstallation

### How do I install Jira Helper?

See the [Installation guide](/docs/getting-started/installation). It takes under a minute: visit the Chrome Web Store or Firefox Add-ons page, click install, and open any Jira board.

### How do I uninstall?

- **Chrome/Edge:** Go to `chrome://extensions`, find Jira Helper, click **Remove**
- **Firefox:** Go to `about:addons`, find Jira Helper, click **Remove**

Settings stored in **board properties** are not deleted when you uninstall — they live on Jira's server. Settings in **local storage** are removed with the extension.

### Can I install it on managed/enterprise Chrome?

Yes, but you may need your IT admin to force-install or allowlist the extension. The extension ID is `egombomekcmpieccamghfgjgnlllgbgdl`. See [Installation troubleshooting](/docs/getting-started/installation#troubleshooting).

## Permissions

### Do I need special Jira permissions to use features?

It depends on the feature:

- **View-only features** (Swimlane Histogram, Flag on Issue Panel, Scale Ruler, Data Blurring) — no special permissions; any user with board access can use them
- **Configurable team-shared features** (Column WIP Limits, Card Colors, Days in Column, Sub-tasks Progress, etc.) — require **board administrator** permissions to save settings. Viewers can see the settings but not change them
- **Personal features** (Gantt Chart, Comment Templates, Language) — no special permissions; stored in your browser

### Why can't I save WIP limit settings?

You likely lack **board administrator** permissions. Ask your Jira admin to grant you board admin access. See [Board Properties & Local Storage](/docs/settings) for details.

## Features

### Can I use WIP limits and the Gantt chart together?

Yes. All features are independent and can be combined freely.

### Do I need to configure every feature?

No. Each feature is optional. Some work out of the box without configuration (Swimlane Histogram, Flag on Issue Panel, Scale Ruler), others require setup in board settings.

### WIP limits not showing on the board

1. Confirm you clicked **Save** in the settings panel after configuration
2. **Refresh** the board page (F5)
3. Verify you have **board administrator** permissions
4. Check that the feature is **enabled** (some have an on/off toggle)
5. Ensure you're on the **board view**, not the backlog

### Column group badge count doesn't match what I see

1. Check the group's **swimlane filter** — it may exclude some swimlanes you can see
2. Check the group's **issue type filter** — it may count only specific issue types
3. The badge counts issues in all columns of the group, not just the first column
4. Remember that filters exclude sub-tasks by default in some scenarios

### Gantt chart showing wrong dates or missing tasks

1. Verify your **date mappings** (click the Gantt Chart's own gear icon ⚙ in the Gantt header bar to open its settings): the first matching source wins per task
2. Check **issue inclusion settings**: subtasks, epics, linked issues may all be toggled
3. Review **exclusion filters** — a single matching filter removes the task from the chart
4. Ensure status-based date sources match your actual workflow status names exactly

### Card colors not applying / whole card not colored

1. Jira's native **Card Colors** JQL rules must be configured first (board settings → Card Colors)
2. Check that the **Fill whole card** checkbox is enabled in Jira Helper's Card Colors settings
3. Flagged/blocked cards keep their original styling — this is intentional
4. Cards without a matching JQL rule remain white

### Feature not working after Jira UI update

Jira occasionally updates their UI, which may temporarily break extension features. The team monitors Jira changes and releases fixes. Report issues via GitHub (see [Reporting Bugs](#how-do-i-report-a-bug) below).

## Reset & Clear Data

### How do I reset all Jira Helper settings?

There is no one-click reset button. Settings must be cleared manually depending on where they're stored:

- **Board Property settings:** Open the Jira Helper panel on each board and remove the configuration manually (delete groups, clear limits, etc.), then save
- **Local Storage settings:** Clear your browser's extension data for Jira Helper, or uninstall and reinstall the extension

### Settings lost after clearing browser data

Settings stored in **board properties** survive browser data clears because they live on the Jira server. Settings stored in **local storage** are lost if you clear your browser data — you'll need to reconfigure those features. See [Board Properties & Local Storage](/docs/settings) for which features use which storage.

## Known Limitations

- **Mobile Jira** is not supported. Jira Helper targets desktop browsers only.
- **Service Management (JSM) boards** are not supported (see [Does it work on JSM boards?](#does-it-work-on-jira-service-management-jsm-boards)).
- **Personal WIP Limits** count only the currently visible board — they don't aggregate across multiple boards.
- **Gantt Chart** performance may degrade with more than ~200 related issues on a single page.
- **Data Blurring** is visual only; it does not prevent copying or scraping the underlying text.

## How do I report a bug?

Report bugs and feature requests on [GitHub Issues](https://github.com/anomalyco/jira-helper/issues).

Please include:
- Browser and version (Chrome/Firefox/Edge)
- Jira type (Cloud or Server/Data Center)
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if possible

## See Also

- [Installation](/docs/getting-started/installation)
- [Quick Start](/docs/getting-started/quick-start)
- [Features Overview](/docs/intro)
- [Board Properties & Local Storage](/docs/settings)
- [JQL Reference](/docs/advanced/jql-reference)
- [Column Group WIP Limits](/docs/features/wip-limits/column-limits)

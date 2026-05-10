---
sidebar_position: 1
---

# Installation

Jira Helper is a browser extension that adds WIP limits, card coloring, Gantt charts, and other professional Kanban features to Jira. It works with Jira Cloud and Jira Server/Data Center.

**Privacy:** No data is ever sent to third parties. The extension communicates only with your Jira instance through its existing API. No analytics, no telemetry, no external servers.

## Requirements

- **Chrome 88+**, **Firefox 58+**, or **Edge 88+** (Chromium-based)
- A Jira instance with board access (Cloud or Server/Data Center)
- No additional software or accounts required

<!-- SCREENSHOT: Chrome Web Store listing page with "Add to Chrome" button highlighted -->

## Chrome / Chromium / Edge

1. Open the [Chrome Web Store page](https://chrome.google.com/webstore/detail/jira-helper/egmbomekcmpieccamghfgjgnlllgbgdl)
2. Click **Add to Chrome**
3. Click **Add Extension** in the confirmation dialog
4. (Optional) Pin the extension: click the extensions icon (puzzle piece) in the toolbar, then the pin icon next to **Jira Helper**
5. Navigate to your Jira board — the extension activates automatically

## Firefox

1. Open the [Firefox Add-ons page](https://addons.mozilla.org/firefox/addon/jira-helper/)
2. Click **Add to Firefox**
3. Click **Add** in the confirmation dialog
4. Navigate to your Jira board — the extension activates automatically

## Edge

Microsoft Edge supports Chrome extensions directly from the Chrome Web Store. Click **Allow extensions from other stores** in the Edge banner when prompted, then follow the Chrome instructions above.

## Verify Installation

1. Open any Jira board (Scrum or Kanban)
2. Look for the **Jira Helper** button — a square button labeled "Jira Helper" in the board toolbar, usually to the right of Jira's native gear icon
3. If you don't see it, expand your extension toolbar and ensure the extension is pinned

<!-- SCREENSHOT: Jira board with Jira Helper button visible in the toolbar, circled -->

## Troubleshooting

### Extension not appearing after installation

- **Refresh** the Jira page (F5)
- Ensure the extension is **enabled** in `chrome://extensions` / `about:addons`
- Make sure you're on a supported page: **board view** (not backlog, not issue search)
- Check browser compatibility: minimum Chrome 88, Firefox 58, Edge 88

### Enterprise-managed Chrome blocks the extension

If your organization blocks extension installation:
1. Ask your IT admin to **force-install** the extension via Group Policy
2. The extension ID is `egombomekcmpieccamghfgjgnlllgbgdl`
3. Alternatively, request the extension be added to your organization's allowlist

### Extension installed but features don't work

Some features require **board administrator** permissions to save configuration. These include Column Group WIP Limits, Swimlane WIP Limits, Personal WIP Limits, Field Value WIP Limits, Cell WIP Limits, Card Colors, Sub-tasks Progress, Days in Column, Days to Deadline, Issue Links Display, Issue Condition Checks, and SLA Line — all features that store settings in Jira board properties.

View-only features (Swimlane Histogram, Flag on Issue Panel, Scale Ruler, Data Blurring) and personal features (Gantt Chart, Comment Templates, Local Settings) work without board admin permissions.

See [Board Properties & Local Storage](/docs/settings#board-properties-team-shared) for the full breakdown.

## Next Steps

- **[Quick Start](/docs/getting-started/quick-start)** — configure your first WIP limit in under 2 minutes
- **[Features Overview](/docs/intro)** — see everything Jira Helper can do
- **[FAQ](/docs/advanced/faq)** — common questions and troubleshooting
- **[Board Properties & Local Storage](/docs/settings)** — understand where settings are stored


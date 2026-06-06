---
sidebar_position: 2
---

# Quick Start

Get your first WIP limit running in under 2 minutes.

> **TL;DR** — Install the extension → open any Jira board → click the **Jira Helper** button in the board toolbar (a square button labeled "Jira Helper", to the right of Jira's gear icon) → **Columns** tab → scroll to **Column group WIP limits** → drag columns from the panel into a group slot, set a limit, save. Done.

## Prerequisites

- [Jira Helper installed](/docs/getting-started/installation) and enabled in your browser
- **Board administrator** permissions on at least one Jira board
- A Scrum or Kanban board

## 1. Open a Board

Navigate to any Scrum or Kanban board in Jira. The extension activates automatically — you'll see the **Jira Helper** button in the board toolbar, a square button labeled "Jira Helper" usually positioned to the right of Jira's native gear icon.

<!-- SCREENSHOT: The Jira Helper button in the board toolbar (top-right area, near the native Jira gear icon), with a red circle around it -->

## 2. Open the Jira Helper Panel

Click the **Jira Helper** button in the board toolbar to open the extension's settings panel. Each feature has its own tab: **Columns**, **Swimlanes**, **Gantt Chart**, and more.

<!-- SCREENSHOT: The Jira Helper settings dialog open to the Columns tab, showing the "Column group WIP limits" section -->

## 3. Configure Your First Feature

### Example: Column Group WIP Limits

1. In the settings panel, switch to the **Columns** tab
2. Scroll to the **Column group WIP limits** section
3. Drag columns from the right-side panel into a group slot (e.g., drop "In Progress" and "Review" together into one group)
4. Set the **Max issues** number (e.g., `5`)
5. Click **Save**

The board updates immediately. You'll see a **current / limit** badge on the group's first column header.

## 4. Verify It Works

- Look for a **counter badge** on the first column of each group (e.g. `3 / 5`)
- When the group exceeds its limit, the column area turns **red**

<!-- SCREENSHOT: A board view showing a column group with "3 / 5" badge and red background on an overloaded group -->

## Next Steps

- **[Column Group WIP Limits](/docs/features/wip-limits/column-limits)** — full documentation with swimlane scoping, issue type filtering, and color configuration
- **[Features Overview](/docs/intro)** — explore all features Jira Helper offers
- **[Settings guide](/docs/settings)** — understand where settings are stored (team-shared vs personal)
- **[Installation](/docs/getting-started/installation)** — installation and browser support
- **[FAQ](/docs/advanced/faq)** — common questions and troubleshooting

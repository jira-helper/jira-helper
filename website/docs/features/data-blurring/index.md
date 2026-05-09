---
sidebar_position: 1
---

# Data Blurring

## Overview

Privacy and presentation mode. Obfuscates text and blurs images across all Jira pages — boards, issue views, search, backlog, settings — so you can share your screen or record a demo without exposing issue titles, keys, names, or descriptions. Layout stays intact; content is not legible.

**Why:** Screen sharing during meetings, public demos, or recording tutorial videos often requires hiding sensitive Jira data. Data Blurring toggles on instantly from a context menu — no need to open a separate tool, apply filters, or edit screenshots.

**Where:** Right-click context menu on any Jira page → **Blur secret data**. The label "Blur secret data" refers to visual obfuscation (CSS blur), not encryption — data is hidden from view but not cryptographically secured. The toggle is per-browser-profile and persists across tabs and sessions.

**How it works:**
- When enabled, text content on Jira pages is rendered as an unreadable blur (CSS blur + text-indent)
- Images (avatars, screenshots, attachments) are blurred via CSS filter
- Page layout, card positions, swimlanes, columns, and grid structure remain intact
- The toggle is a simple checkbox in the browser extension's context menu — no Jira settings panel needed

<!-- SCREENSHOT: Before/after comparison — left side shows a normal Jira board with readable issue keys, summaries, and avatars; right side shows the same board with Data Blurring enabled: text blurred to illegibility, avatars blurred, but column structure and card positions identical -->

---

## What Gets Blurred vs. Stays Visible

| Element | Blurred | Notes |
|---|---|---|
| Issue keys (e.g., PROJ-1234) | Yes | Rendered as blurred text |
| Issue summaries / titles | Yes | Full title blurred |
| Descriptions | Yes | All text content blurred |
| User names / assignees | Yes | Avatars also blurred |
| Custom field values | Yes | Any text rendered in fields |
| Attachment previews | Yes | Images blurred via CSS filter |
| Avatars / user icons | Yes | CSS blur filter applied |
| Column headers (e.g., "To Do") | No | Workflow status names remain readable |
| Swimlane names | No | Board structure labels preserved |
| Card positions / layout | No | Grid layout unchanged |
| Buttons, icons, UI chrome | No | Jira UI controls stay visible |
| Quick Filters text | No | Filter labels remain readable |

**Note:** SVG text elements and canvas-rendered content cannot be blurred by CSS and remain visible. The blur effect only applies to standard HTML text and image elements.

---

## First-Time Experience

1. Install the extension and navigate to any Jira board or issue page.
2. **Right-click** anywhere on the Jira page.
3. In the context menu, find the extension entry **Blur secret data** (under the Jira Helper submenu on Chromium browsers; at the top level on Firefox).
4. **Click** the entry to toggle it on (a checkmark appears next to it).
5. All text instantly blurs — layout stays the same.
6. Click again to toggle off and restore readability.

---

## Usage

### Toggle on/off via right-click context menu → "Blur secret data"

**Goal:** Quickly enable or disable visual obfuscation without opening Jira settings.

1. On any Jira page where the extension is active, **right-click** the page (not on a link or image — right-click empty space or the page background).
2. Find the extension entry **Blur secret data** in the context menu.
   - **Chrome/Edge:** Look for it under the **Jira Helper** submenu in the context menu
   - **Firefox:** Look for it at the top level of the context menu
3. Click it like a checkbox: **checked** = blur on, **unchecked** = blur off.
4. The toggle **persists across tabs and browser restarts** — once on, it stays on until you turn it off. It is stored in `localStorage` (see [Settings: Local Storage](/docs/settings#local-storage-personal)).
5. No separate Jira board settings needed; the switch lives entirely in the browser extension's context menu.

### Present with blur enabled: text obfuscated, images blurred, layout preserved

**Goal:** Understand what the blurred view looks like to your audience.

1. With blur enabled, all textual content on Jira pages is rendered as an unreadable blur — titles, keys, summaries, descriptions, user names, custom field values become illegible.
2. Images (avatars, screenshots, attachment previews) are blurred.
3. Page **layout and card positions** remain intact — columns, swimlanes, and grid structure are still navigable.
4. Turn blur off from the same **right-click → Blur secret data** checkbox when you finish presenting.

---

## Troubleshooting

### Right-click menu doesn't show "Blur secret data"

- The extension must be **enabled** for the Jira domain. Check `chrome://extensions` or `about:addons` — ensure Jira Helper is toggled on and has site access.
- On Chrome, the entry may be nested under the **Jira Helper** submenu — look for the extension name/icon in the context menu, then expand it.
- On Firefox, the context menu entry appears at the top level, but only if the extension is active on the current tab.
- If the entry is still missing, **reload the Jira page** (F5) and right-click again.

### Blur doesn't apply when toggled on

- Page elements loaded dynamically (AJAX) after blur was enabled may not be blurred. **Toggle blur off and on again** to re-apply the effect to newly loaded content.
- Some Jira customizations or marketplace plugins inject content via iframes — content inside cross-origin iframes cannot be blurred by the extension.
- SVG text and canvas-rendered content cannot be blurred by CSS and will remain visible even when blur is enabled.

### Unintentionally left blur on

- The blur state is indicated only by the context menu checkmark — there is no persistent on-page indicator. If you return to Jira and text looks blurred, right-click and uncheck **Blur secret data**.
- As a habit: after a presentation, uncheck the toggle immediately. The state persists across browser restarts.

---

## See Also

- [Local Settings](/docs/features/local-settings) — configure extension UI language
- [Flag on Issue Panel](/docs/features/flag-issue) — auto-highlight flagged work
- [Settings: Local Storage](/docs/settings#local-storage-personal)
- [FAQ](/docs/advanced/faq)

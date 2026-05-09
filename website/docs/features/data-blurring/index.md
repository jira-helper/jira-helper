# Data Blurring

## Overview

Privacy and presentation mode. Smudges text and blurs images across all Jira pages — boards, issue views, search, backlog, settings — so you can share your screen or record a demo without exposing issue titles, keys, names, or descriptions. Layout stays intact; content is not legible.

---

## User Jobs

### Toggle on/off via right-click context menu → "Blur secret data"

**Goal:** Quickly enable or disable blur without opening Jira settings.

1. On any Jira page where the extension is active, **right-click** the page (or use the browser tab's context menu).
2. Find the extension entry **Blur secret data** in the context menu.
3. Click it like a checkbox: **checked** = blur on, **unchecked** = blur off.
4. The toggle persists across tabs and page loads — once on, it stays on until you turn it off.
5. No separate Jira board settings needed; the switch lives entirely in the browser extension's context menu.

### All pages: text smudged, images blurred, layout preserved

**Goal:** Understand what the blurred view looks like to your audience.

1. With blur enabled, all textual content on Jira pages is rendered as a strong **smudge** — titles, keys, summaries, descriptions, user names, custom field values are unreadable.
2. Relevant images (avatars, screenshots, attachment previews) are blurred.
3. Page **layout and card positions** remain intact — columns, swimlanes, and grid structure are still navigable.
4. Turn blur off from the same **right-click → Blur secret data** checkbox when you finish presenting.

---
sidebar_position: 1
---

# Local Settings

## Overview

Set the extension's UI language independently of Jira's system language. Adds a **Local Settings** tab to the Jira Helper board settings panel with **Auto** (browser default), **English**, or **Russian**.

**Why:** Jira's interface language is set per user in Jira's profile settings, but the Jira Helper extension detects your browser language separately. If your browser is set to Russian but Jira is in English — or vice versa — the Local Settings tab lets you align the extension's language to your preference without changing your browser or Jira configuration.

**Where:** Board toolbar → **Jira Helper** button (gear icon on the right side of the board toolbar, near the Jira sidebar toggle) → **Local Settings** tab.

**How it works:**
- A dropdown selector offers three choices: Auto, English, Russian
- **Auto** follows the browser's `navigator.language` setting (the language you set in your browser preferences)
- Changes apply immediately — no save button required
- The setting is stored in `localStorage` per browser profile, not synced to Jira
- Only the extension's own UI labels change; Jira's built-in menus and system language are unaffected

<!-- SCREENSHOT: Local Settings tab in the Jira Helper board settings panel — UI language dropdown set to "English", with the extension UI visible in English on the settings page itself -->

---

## Auto Mode Fallback

When **Auto** is selected, the extension matches the browser's primary language:

| Browser Language | Extension UI Language |
|---|---|
| `en` / `en-US` / `en-GB` / etc. | English |
| `ru` / `ru-RU` | Russian |
| Any other language (e.g., `fr`, `de`, `zh`) | English (fallback) |

The fallback to English for unsupported languages ensures the UI is always in a known language rather than showing missing translation keys.

---

## What Gets Translated

The language setting affects the following extension UI elements:

| Element | Examples |
|---|---|
| Settings tab names | "Column Limits", "Sub-tasks Progress", "Local Settings", "Gantt Chart" |
| Tooltips and hover text | "Save", "Add limit", "Configure WIP Limits" |
| Button labels | "OK", "Cancel", "Save", "Discard", "Export templates" |
| Settings labels and descriptions | Field labels, section headers, explanatory text in settings panels |
| Status badges and counters | "over limit", "done", "in progress", count labels |
| Context menu items | "Blur secret data" |
| Notifications and messages | Error messages, success toasts, warning banners |

Jira's own interface, issue fields, and board configuration are **not** affected — only the extension's injected UI elements change language.

---

## Usage

### Open Local Settings

**Goal:** Access the language preference panel.

1. Open any Jira board.
2. Click the **Jira Helper** button in the board toolbar — it's a gear icon, located on the right side of the toolbar (next to the Jira sidebar toggle and board filter controls).
3. In the board settings popup, navigate to the **Local Settings** tab.

### Choose language: Auto / English / Russian

**Goal:** Switch the extension interface to your preferred language.

1. In the **Local Settings** tab, find the **UI language** selector.
2. Choose one of:
   - **Auto** — follows the browser's language setting (with English fallback for unsupported languages)
   - **English** — forces the extension UI to English regardless of browser settings
   - **Russian** — forces the extension UI to Russian regardless of browser settings
3. The change applies immediately — no Save button needed. All extension UI labels (tab names, tooltips, button text, settings labels, badges, and notifications) switch instantly.
4. The setting is stored in `localStorage` — personal to your browser, not visible or changeable by other Jira users (see [Settings: Local Storage](/docs/settings#local-storage-personal)).
5. Only the extension's own labels and messages change; Jira's menus, system language, and page content are unaffected.

---

## Troubleshooting

### Language doesn't change when I select a different option

- The change applies immediately without a save action. If it doesn't, switch to a different tab in the settings panel and back, or close and reopen the settings popup.
- If you selected **Auto** and see English, your browser language is likely not Russian — the fallback is English. To force Russian, select **Russian** explicitly.
- If you selected **Auto** and see Russian but expected English, check your browser's language settings at `chrome://settings/languages` (Chrome) or `about:preferences#general` (Firefox).

### Language selection resets after clearing browser data

- The setting is stored in `localStorage`. Clearing browsing data (cookies, site data, localStorage) for the Jira domain will reset the language to **Auto**. Re-select your preferred language after clearing data.

---

## See Also

- [Settings: Local Storage](/docs/settings#local-storage-personal)
- [Data Blurring](/docs/features/data-blurring) — privacy mode for presentations
- [Installation](/docs/getting-started/installation) — browser setup and requirements
- [FAQ](/docs/advanced/faq)

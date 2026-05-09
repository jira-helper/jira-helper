---
sidebar_position: 1
---

# Comment Templates

## Overview

Comment Templates let you save, manage, and reuse frequently used comment text directly in the Jira issue editor. Instead of retyping the same status updates, meeting notes, or handoff messages, you insert a pre-written template with one click from the editor toolbar. Templates support watcher presets (auto-add colleagues), per-template colors for visual grouping, and JSON import/export for sharing with your team.

**Why:** Teams that follow structured communication patterns (daily standup updates, release notes, code review checklists) waste time copying and pasting the same text. Comment Templates reduce this friction to a single click.

**Where:** The **Templates** button appears in the comment editor toolbar on every Jira issue. Templates are stored in your browser's `localStorage` — personal, not shared via Jira.

<!-- SCREENSHOT: Jira issue comment editor with the Templates dropdown open — list of 5 colored templates visible, "Manage templates" link at the bottom -->

---

## Prerequisites

- No board permissions required — templates are stored in `localStorage` (see [Settings: Local Storage](/docs/settings#local-storage-personal))
- The Jira Helper extension must be active on the page
- Comment editor must be open (click **Comment** on any issue)

---

## User Jobs

### Manage templates: add, edit, delete

**Goal:** Create and maintain your library of reusable comment templates.

1. Open a Jira issue → click the **Templates** button in the comment editor toolbar.
2. Select **Manage templates** to open the settings panel.
3. **Add template:** Fill in **Label** (shown in dropdown), **Text** (the comment body — supports plain text and a subset of Jira wiki markup, see below), optionally add **Watchers** (search and select Jira users by name), and pick a **Color** for visual grouping.
4. **Edit template:** Click an existing template row and modify any field.
5. **Delete template:** Click the delete icon (trash) next to a template row. Confirm to remove it.
6. Templates are stored in `localStorage` under the Jira domain. Draft changes are indicated by an **Unsaved changes** banner.
7. Click **Save** to persist all draft changes, or **Discard** to revert.

<!-- SCREENSHOT: Manage templates panel — list of 4 templates with colored labels, one template expanded showing Text field with wiki markup, Watchers field with 2 selected users, Color picker open -->

**Supported wiki markup:**

- **Text formatting:** `*bold*`, `_italic_`, `+underline+`, `-strikethrough-`
- **Headings:** `h1.`, `h2.`, `h3.`, `h4.`
- **Lists:** `* ` for bullets, `# ` for numbered lists
- **Links:** `[text|url]`
- **Code:** `{{inline code}}`, `{code}...{code}` block
- **Quotes:** `{quote}...{quote}`
- **Horizontal rule:** `----`
- **Line breaks:** a blank line separates paragraphs

**Not supported:** `{panel}` macros, `{noformat}` blocks, images, attachments, mentions (`[~username]`), tables, and other Jira plugin macros. HTML tags are stripped.

### Import/export templates as JSON

**Goal:** Transfer templates between browsers, share with teammates, or back up your library.

1. Open **Manage templates**.
2. **Export:** Click **Export templates** to download a JSON file containing all current templates.
3. **Import:** Click **Import JSON file**, select a `.json` file. If the file format is invalid, an **Import error** notification is shown with details.
4. Imported templates are added as draft changes — review the list and click **Save** to persist.

**Import JSON structure:**

```json
[
  {
    "label": "Standup Update",
    "text": "*Yesterday:* ...\n*Today:* ...\n*Blockers:* ...",
    "watchers": ["user1", "user2"],
    "color": "#1890ff"
  }
]
```

- `label` (required, string) — display name in dropdown
- `text` (required, string) — comment body (Jira wiki markup supported, see supported markup list above)
- `watchers` (optional, string[]) — array of Jira usernames (not display names)
- `color` (optional, hex string) — CSS color for the template entry

### Insert a template from the editor toolbar

**Goal:** Paste a pre-written comment with one click.

1. While editing a comment on any issue, locate the **Templates** dropdown in the editor toolbar.
2. Click a template name — its content is inserted at the cursor position.
3. If the template has **Watchers** configured, the extension attempts to add them after insertion. Status is shown in a notification:
   - *Watchers added* — all added successfully
   - *Some watchers not added* — partial success (hover to see which ones failed)
   - *Watchers not added* — all failed (likely due to permission restrictions or invalid usernames)
4. If the issue key is unavailable (e.g., editor on a non-issue page), the template is inserted but watchers are skipped with a notification.

---

## Limitations

- **Local only:** Templates are stored in `localStorage`. They do **not** sync across browsers or devices. Use Export/Import to transfer between machines.
- **Max count:** Up to 50 templates are displayed in the dropdown. Beyond 50, the dropdown becomes difficult to navigate. Consider exporting and archiving unused templates rather than keeping them in the dropdown.
- **No cross-browser sync:** Each browser profile has its own independent template store.
- **No rich text:** Template content is plain text with the Jira wiki markup subset listed above. HTML, images, and attachments are not supported.
- **Watcher permissions:** Adding watchers requires the **Manage Watchers** project permission in Jira. If you lack this permission, a notification is shown indicating watchers could not be added.

---

## Troubleshooting

### Templates button missing from editor toolbar

- Ensure the Jira Helper extension is enabled and active on the page
- The comment editor must be **focused** or **populated** for the toolbar to fully render — click into the editor field first
- On very old Jira Server versions, the toolbar DOM structure may differ — update to the latest extension version

### Import fails with "Import error"

- Verify the JSON file is valid — open it in a text editor and check for syntax errors (trailing commas, unquoted keys)
- Ensure the file contains an **array** of template objects, not a single object: `[...]` not `{...}`
- Required fields: each object must have a `label` and `text` property
- Jira usernames in `watchers` must be exact (case-sensitive). Use Jira's user picker to verify usernames

### Templates lost after clearing browser data

- Templates are stored in `localStorage`. If you or your IT policy clears `localStorage` (e.g., on browser close or via endpoint management), all templates are erased
- **Prevent data loss:** export templates regularly via **Export templates** and store the JSON file in a safe location

### Watchers not added after template insertion

- Verify you have the **Manage Watchers** project permission in Jira for the target project
- The usernames in templates must match Jira's exact username format (not display names). Use the user picker in **Manage templates** to add users — it queries Jira's API for exact usernames
- If watcher addition fails, a notification appears in the comment editor. Check the notification for details on which users failed.

---

## See Also

- [Settings: Local Storage](/docs/settings#local-storage-personal)
- [FAQ](/docs/advanced/faq)

# Comment Templates

## Overview

Save, manage, and reuse comment templates directly in the Jira issue editor. Supports template text, watcher presets, per-template colors, import/export as JSON, and insertion from the editor toolbar.

---

## User Jobs

### Manage templates: add, edit, delete

**Goal:** Create and maintain your library of reusable comment templates.

1. Open a Jira issue → click the **Templates** button in the comment editor toolbar.
2. Select **Manage templates** to open the settings panel.
3. **Add template:** Fill in **Label**, **Text** (the comment body), optionally add **Watchers** (search and select Jira users), and pick a **Color** for visual grouping.
4. **Edit template:** Click an existing template row and modify any field.
5. **Delete template:** Click the delete icon (trash) next to a template row. Confirm to remove it.
6. Templates are stored locally in the browser. Draft changes are indicated by an **Unsaved changes** banner.
7. Click **Save** to persist all draft changes, or **Discard** to revert.

### Import/export templates as JSON

**Goal:** Transfer templates between browsers, share with teammates, or back up your library.

1. Open **Manage templates**.
2. **Export:** Click **Export templates** to download a JSON file of all current templates.
3. **Import:** Click **Import JSON file**, select a `.json` file. If the file format is invalid, an **Import error** notification is shown.
4. Imported templates are added as draft changes — review and click **Save** to persist.

### Insert a template from the editor toolbar

**Goal:** Paste a pre-written comment with one click.

1. While editing a comment on any issue, locate the **Templates** dropdown in the editor toolbar.
2. Click a template name — its content is inserted at the cursor position.
3. If the template has **Watchers** configured, the extension attempts to add them after insertion. Status is shown in a notification:
   - *Watchers added* — all added successfully.
   - *Some watchers not added* — partial success (hover to see details).
   - *Watchers not added* — all failed.
4. If the issue key is unavailable, the template is inserted but watchers are skipped with a notification.

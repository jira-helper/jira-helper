# Comment Templates

| | |
|---|---|
| Где настраивается | Board Settings → Comment templates tab or Issue Settings → Comment templates tab |
| Где видно | Issue Page (comment editor toolbar) |
| Settings apply to | Only for you |(`jira_helper_comment_templates`) |

## Цель

Provide reusable comment templates that can be inserted with one click from the comment editor toolbar, with optional automatic watcher assignment.

## Как настроить

### Where to find settings

The comment templates settings can be opened in two ways:

**Via the board:**

1. Open your board and click **Jira Helper** next to the sidebar.
2. Select the **Comment templates** tab.

**Via an issue:**

1. Open any issue and click **Helper** in the issue toolbar.
2. Select the **Comment templates** tab.

Both methods open the same settings panel.

### How to configure

- **Add a template**: click **Add template** and set up:
  - **Label** — a short name shown on the toolbar button.
  - **Color** — a preset or custom hex color for the button.
  - **Text** — the comment body to insert.
  - **Watchers** (optional) — Jira users to add as watchers when the template is inserted.
- **Edit, reorder, or delete templates** as needed.
- **Import / Export**: use **Import JSON file** and **Export templates** to transfer templates between browsers.
- **Reset to defaults**: restore the built-in template set.

Click **Save** to persist changes to browser local storage. Templates are personal and stored in your browser, not on the Jira server.

## Как использовать

- In the **comment editor** on any issue page, a toolbar appears with labeled, color-coded template buttons.
- Click a template button to **insert** its text into the comment field.
- If the template has watchers configured, they are automatically added to the issue.
- A transient notification confirms insertion success or reports watcher errors.
- Click **Manage templates** in the toolbar to open the settings panel.

## Сценарии использования

- **Standard responses:** Create templates for common replies (e.g., "Will investigate", "Merged to master", "Needs review").
- **Onboarding:** Share a JSON export with new team members so they have the same templates.
- **Watcher automation:** Include watchers in templates to automatically notify relevant people.
- **Multi-language teams:** Create templates in different languages for cross-team communication.

## Устранение неполадок

- **Templates not appearing:** Ensure templates are saved (click **Save** in settings). The toolbar only appears on issue pages with a comment editor.
- **Insertion failed:** The comment editor might not be fully loaded. Wait for the page to finish loading and try again.
- **Watchers not added:** Check that the watcher usernames are valid Jira users. Some watchers may fail if the user doesn't have permission.
- **Import error:** Ensure the JSON file matches the expected template format. Use **Export templates** to see the correct structure.
- **Templates lost after clearing browser data:** Templates are stored in localStorage. Clearing browser data will remove them — export regularly as backup.

## См. также

- [Local Settings](/docs/features/local-settings)

# Data Blurring

| | |
|---|---|
| Где настраивается | Right-click context menu → Blur secret data (checkbox toggle) |
| Где видно | All Jira pages (boards, issues, search, backlog, settings) |
| Хранилище | localStorage (`blurSensitive`) |

## Цель

Hide readable text and blur images across Jira for screen sharing, presentations, or demos — layout stays intact while content becomes illegible.

## Как настроить

1. On any Jira page where the extension is active, **right-click** the page (or use the browser's page context menu).
2. Find the extension entry **Blur secret data** and toggle it: checked = blur on, unchecked = blur off.

There is no switch in the board settings panel. The setting persists across page loads and new tabs.

## Как использовать

- When enabled, text on Jira pages is replaced with a smudge effect — content is unreadable but layout remains unchanged.
- Images are blurred to prevent visual information disclosure.
- The effect applies to boards, backlogs, issue views, search results, and parts of settings screens.
- Turn blur off from the same context menu item when you are done presenting or sharing your screen.

## Сценарии использования

- **Screen sharing:** Share your Jira board during meetings without exposing sensitive issue titles, keys, or descriptions.
- **Presentations:** Present workflow or process information while keeping specific issue details confidential.
- **Demo recordings:** Record product demos with real data but without revealing actual content.
- **Public displays:** Use Jira on a projector or shared screen without compromising data privacy.

## Устранение неполадок

- **Blur not applying:** Ensure the context menu checkbox is checked. Try toggling it off and on again. Reload the page if needed.
- **Some text still readable:** The blur effect is applied via CSS. Some Jira elements rendered in iframes or shadow DOM may not be fully covered.
- **Blur persists after disabling:** Reload the page. The setting is read from localStorage on page load.
- **Images not blurred:** The feature targets commonly blurred image elements. Some dynamically loaded images may not be immediately affected.

## См. также

- [Flag on Issue](/docs/features/flag-issue)

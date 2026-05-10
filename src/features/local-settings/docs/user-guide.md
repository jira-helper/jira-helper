# Local Settings

| | |
|---|---|
| Где настраивается | Board → «Jira Helper» → «Local Settings» tab |
| Где видно | All Jira pages (extension UI only) |
| Settings apply to | Only for you ||

## Purpose

Set the language used by the Jira Helper extension for its own interface labels and messages in your browser.

## How to configure

### Where to find settings

1. Open your board and click **«Jira Helper»** next to the sidebar.
2. Open the **«Local Settings»** tab.

### How to configure

- **UI language**: select one of:
  - **«Auto»** — follows the browser's language preference.
  - **«English»** — force English for extension UI.
  - **«Russian»** — force Russian for extension UI.

The change applies immediately after selection. No separate save step is needed. This setting is personal and saved locally in your browser — it does not affect Jira's own language settings.

## How to use

- After setting a language, all extension UI elements (settings popup, feature labels, tooltips) display in the selected language.
- When **«Auto»** is selected, the extension matches the browser's preferred language if supported, falling back to English.
- Jira's menus and system language are not affected.

## Usage scenarios

- **Non-English speakers:** Switch the extension UI to Russian for easier configuration.
- **Mixed teams:** Each team member sets their preferred language independently — no impact on others.
- **Browser language mismatch:** If your browser is in one language but you prefer the extension in another, choose explicitly.

## Troubleshooting

- **Language not changing:** The setting applies immediately. If not, try closing and reopening the settings popup.
- **Auto not matching browser language:** The extension supports English and Russian. If your browser is set to another language, Auto falls back to English.
- **Setting not persisting:** The setting is stored in localStorage. If you clear browser data, the setting will be lost.

## See also

- [Comment Templates](/docs/features/issue-templates/comment-templates)

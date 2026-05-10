# Flag on Issue

| | |
|---|---|
| Где настраивается | No configuration required |
| Где видно | Issue Page, Board issue panel, Search results |
| Settings apply to | Not required |

## Цель

Visually highlight flagged issues in the issue hierarchy and on the issue detail page, making it easy to spot flagged work at a glance.

<div class="feature-mockup">
  <div class="mockup-board">
    <div style="font-size:0.67rem;">
      <div style="background:#fffae6;padding:6px 8px;border-radius:4px;margin-bottom:6px;display:flex;align-items:center;gap:6px;">
        <span style="font-size:0.8rem;">🚩</span> <strong>TASK-99</strong> API authentication
      </div>
      <div style="color:#5e6c84;font-size:0.62rem;margin-bottom:4px;">Issue links — flagged</div>
      <div class="mockup-card" style="background:#fffae6;margin-bottom:3px;"><span style="font-size:0.7rem;">🚩</span> PROJ-12 Config service</div>
      <div class="mockup-card" style="background:#fffae6;margin-bottom:3px;"><span style="font-size:0.7rem;">🚩</span> PROJ-34 Auth service</div>
    </div>
  </div>
</div>

## Как настроить

### Where to find settings

No configuration required. The feature runs automatically on issue pages, in the board's issue detail panel, and in search results.

### How to configure

There are no settings to configure for this feature.

## Как использовать

- In the **issue hierarchy** (linked issues, sub-tasks, epic children), rows for flagged issues are highlighted with a yellow background and show a flag icon.
- On the **issue you have open**, if it is flagged, a flag icon appears near the header area (priority/type region) in the classic issue view.
- In the board's **side detail panel**, flagged related items are highlighted and marked with the flag icon.
- The feature also adds a **collapse/expand toggle** for the right sidebar on the classic issue page, letting you reclaim horizontal space.

## Сценарии использования

- **Quick triage:** During sprint review, spot flagged issues that need immediate attention.
- **Dependency awareness:** See when linked or child issues are flagged, indicating potential blockers.
- **Space optimization:** Collapse the right sidebar to focus on the main issue content.

## Устранение неполадок

- **Flag icon not showing:** Ensure the issue is actually flagged in Jira. The feature only highlights Jira-flagged issues.
- **Right sidebar toggle missing:** The toggle is only available in the classic issue view, not in the new Jira issue view.
- **Highlight color not visible:** Check for CSS conflicts with custom Jira themes or other extensions.

## См. также

- [Data Blurring](/docs/features/data-blurring)

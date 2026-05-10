# Handoff: Landing Page & Documentation Site

**Date**: 2026-05-10
**Status**: site live at https://jira-helper.github.io/jira-helper/; user-guide system in place; iterate on content
**Feature folder**: `.agents/tasks/landing-page/`

## What Exists

### Website

Docusaurus 3 site in `website/` — builds to GitHub Pages via `.github/workflows/website.yml`.

- **Landing page**: `website/src/pages/index.tsx` — two-column hero with board mockup, features grid, stats, CTA
- **Docs**: 25 markdown pages in `website/docs/features/...` (synced from source modules, see below)
- **i18n**: EN + RU. Translations in `website/i18n/ru/`
- **Custom CSS**: `website/src/css/custom.css`
- **Logo**: jira-helper PNG icons in `website/static/img/`

Live at https://jira-helper.github.io/jira-helper/ (EN) and https://jira-helper.github.io/jira-helper/ru/ (RU).

### User-Doc System (source of truth in feature modules)

Each feature has `docs/user-guide.md` (EN) + `docs/user-guide.ru.md` (RU) inside its module:

```
src/features/<module>/docs/
├── user-guide.md      # EN
└── user-guide.ru.md   # RU
```

Format: table (Где настраивается | Где видно | Настройки действуют) + fixed sections (Цель, Как настроить, Как использовать, Сценарии использования, См. также).

### Sync Mechanism

`website/scripts/sync-docs.js` copies user-guide files from `src/features/*/docs/` into `website/docs/features/` (EN) and `website/i18n/ru/.../features/` (RU) before each Docusaurus build. Mappings in `website/scripts/feature-map.json`.

Build command: `npm run sync-docs && docusaurus build`

### Skill

`.agents/skills/user-doc-writer/SKILL.md` — instructs agents on writing user-guide.md + user-guide.ru.md following the fixed template.

## What Is NOT Done

- Landing page content is NOT translated (React component, needs `translate()` API or separate page)
- No actual screenshots — all SCREENSHOT placeholders need real images
- No custom domain — site is at jira-helper.github.io/jira-helper/
- RU translation quality not reviewed by native speaker
- Lighthouse / a11y not audited
- Social card (OG image) not created

## Key Decisions

1. **User-docs live in feature modules**, not in website. Sync copies them at build time.
2. **Troubleshooting sections removed** from all user-guides (user request).
3. **Table format**: Where configured | Where visible | Settings apply to (Настройки действуют)
4. **Settings apply to values**: "Для всей команды" (Jira Board Property) / "Только для вас" (localStorage)
5. **Deploy trigger**: `website/**` changes on `main` branch only. Feature branch deploys require manual workflow edit.
6. **No blog, no changelog, no contributing page**.
7. **No Code** (testing, Lighthouse) requirements for website content.

## Feature Modules with User-Docs

| Module | Website Path | Table |
|--------|-------------|-------|
| column-limits-module | wip-limits/column-limits | Board Settings + Jira Helper panel |
| swimlane-wip-limits-module | wip-limits/swimlane-limits | Board Settings → Swimlanes |
| person-limits-module | wip-limits/personal-limits | Board Settings → Columns |
| field-limits-module | wip-limits/field-limits | Board Settings → Card layout |
| wiplimit-on-cells | wip-limits/cell-limits | Board Settings |
| card-colors-module | board-visualization/card-colors | Board Settings → Card Colors |
| swimlane-histogram-module | board-visualization/swimlane-histogram | Zero-config |
| additional-card-elements/docs/days-in-column/ | card-information/days-in-column | Board Settings |
| additional-card-elements/docs/days-to-deadline/ | card-information/days-to-deadline | Board Settings |
| additional-card-elements/docs/issue-links-display/ | card-information/issue-links-display | Board Settings |
| additional-card-elements/docs/issue-condition-checks/ | card-information/issue-condition-checks | Board Settings |
| sub-tasks-progress | sub-tasks-progress | Board Settings |
| gantt-chart | gantt-chart | Issue Page → gear |
| charts/docs/sla-line/ | control-chart/sla-line | Reports → Control Chart |
| charts/docs/scale-ruler/ | control-chart/scale-ruler | Reports → Control Chart |
| issue/docs/flag-issue/ | flag-issue | Zero-config |
| jira-comment-templates-module | issue-templates/comment-templates | Jira Helper panel |
| blur-for-sensitive | data-blurring | Context menu |
| local-settings | local-settings | Jira Helper → Local Settings |

## How to Iterate

### Update a user-guide

1. Edit `src/features/<module>/docs/user-guide.md` and `.ru.md`
2. Run `cd website && npm run sync-docs` to test locally
3. Run `cd website && npm run build` to verify
4. Commit → push → deploy (via main branch or manual trigger)

### Add a new feature doc

1. Create module with `docs/user-guide.md` + `user-guide.ru.md` following the skill template
2. Add entry to `website/scripts/feature-map.json`
3. Update `website/sidebars.ts` if new sidebar category needed
4. Sync → build → deploy

### Deploy from feature branch

Edit `.github/workflows/website.yml`:
- Add branch to `branches: [main, <branch>]`
- Remove `environment:` block
- Push a change in `website/` directory
- Revert after deploy

## Related Files

- `website/docusaurus.config.ts` — site config, i18n, navbar, footer
- `website/sidebars.ts` — doc sidebar structure
- `website/src/pages/index.tsx` — landing page React component
- `website/src/css/custom.css` — custom styles
- `website/scripts/sync-docs.js` — copy script
- `website/scripts/feature-map.json` — module → doc path mapping
- `.agents/skills/user-doc-writer/SKILL.md` — writing skill
- `.github/workflows/website.yml` — CI/CD deploy to GitHub Pages
- `.github/workflows/nodejs.yml` — extension CI (unrelated to website)

# TASK-73: DI Wiring And Verification

**Status**: VERIFICATION
**Type**: di-wiring

**Parent**: [EPIC-4](./EPIC-4-clickable-epic-links.md)

---

## Описание

Подключить DOM utility к board/backlog обработке карточек и провести финальную проверку. Задача зависит от TASK-72.

## Файлы

```text
src/features/additional-card-elements/
├── BoardPage.ts
└── BoardBacklogPage.ts
```

## Что сделать

1. Вызвать DOM utility для каждой найденной board card.
2. Вызвать DOM utility для каждой найденной backlog card.
3. Запустить targeted tests, ESLint и build.

## Критерии приёмки

- [ ] Linkify вызывается на board cards.
- [ ] Linkify вызывается на backlog cards.
- [ ] Проверки проходят: `npm test`, `npm run lint:eslint -- --fix`, `npm run build:dev`.

## Зависимости

- Зависит от: [TASK-72](./TASK-72-clickable-epic-link-badges.md)

---

## Результаты

**Дата**: 2026-04-29

**Агент**: Coder

**Статус**: VERIFICATION

**Что сделано**:

- `linkifyEpicLinkBadges` подключен в `AdditionalCardElementsBoardPage`.
- `linkifyEpicLinkBadges` подключен в `AdditionalCardElementsBoardBacklogPage`.
- Запущены ESLint, Vitest и dev build.

**Проблемы и решения**:

Проблем не обнаружено.

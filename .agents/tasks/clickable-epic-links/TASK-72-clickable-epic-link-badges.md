# TASK-72: Clickable Epic Link Badges

**Status**: VERIFICATION
**Type**: page-object / view

**Parent**: [EPIC-4](./EPIC-4-clickable-epic-links.md)

---

## Описание

Реализовать кликабельность для встроенного Jira `Epic Link` badge и jira-helper issue link badge. Встроенный badge обрабатывается DOM utility, jira-helper badge должен рендерить настоящую ссылку.

## Файлы

```text
src/features/additional-card-elements/
├── IssueLinkBadge/IssueLinkBadge.tsx
├── IssueLinkBadge/IssueLinkBadge.module.css
└── utils/linkifyEpicLinkBadges.ts
```

## Что сделать

1. Добавить тесты на извлечение epic key из `Epic Link` extra field и idempotent wrapping в `<a href="/browse/{KEY}">`.
2. Добавить тест на `IssueLinkBadge`, проверяющий наличие anchor href и stopPropagation.
3. Реализовать минимальный код по TDD.

## Критерии приёмки

- [ ] DOM utility превращает `Epic Link` extra field в ссылку.
- [ ] DOM utility не меняет поле, если ключ эпика неизвестен.
- [ ] DOM utility не оборачивает уже обработанное поле повторно.
- [ ] `IssueLinkBadge` содержит семантический anchor.
- [ ] Тесты проходят: `npm test -- <targeted tests>`.
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`.

## Зависимости

- `src/features/additional-card-elements/IssueLinkBadge/IssueLinkBadge.tsx`
- `src/features/additional-card-elements/BoardPage.ts`
- `src/features/additional-card-elements/BoardBacklogPage.ts`

---

## Результаты

**Дата**: 2026-04-29

**Агент**: Coder

**Статус**: VERIFICATION

**Что сделано**:

- Добавлен `linkifyEpicLinkBadges`, который превращает Jira `Epic Link` extra field в ссылку на `/browse/{EPIC_KEY}`.
- Добавлена поддержка Jira highlighted epic label: `.ghx-highlighted-field .aui-label[data-epickey]`.
- `IssueLinkBadge` теперь рендерит semantic `<a>` и сохраняет открытие ссылки в новой вкладке.
- Добавлены настройки `clickableEpicLinks` и `clickableIssueLinks` с default `true`.
- Добавлены чекбоксы в `Additional Card Elements` и `Issue Link Configurations`.
- Добавлены тесты на ссылку, idempotency, отсутствие ключа и stopPropagation.

**Проблемы и решения**:

Проблема: исходный `IssueLinkBadge` был кликабельным `Tag`, но не HTML-ссылкой и не имел link role.

Решение: обернул `Tag` в anchor с `href`, `target="_blank"` и обработчиком, который сохраняет прежнее поведение открытия в новой вкладке и не пропускает клик в карточку Jira.

Проблема: на live board встроенный Epic Link оказался не extra field с tooltip `Epic Link`, а highlighted label с `data-epickey`.

Решение: расширил selector DOM utility и добавил regression test на `data-epickey`.

Проблема: при привязке Epic Link к общему `enabled` настройки Additional Card Elements старые доски теряли кликабельность, хотя новое поведение должно быть включено по умолчанию.

Решение: Epic Link зависит только от собственного `clickableEpicLinks` и виден отдельным чекбоксом в настройках; default `true` сохраняет поведение на старых board properties.

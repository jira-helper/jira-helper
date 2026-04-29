# Requirements: Clickable Epic Links

**Status**: agreed

## 1. Цель

Сократить лишние действия при переходе к эпикам с Jira-доски: epic label на карточке и epic issue links должны быть ссылками на соответствующую задачу.

## 2. Пользователи

Пользователи jira-helper, работающие с задачами на Jira board/backlog и просматривающие связанные задачи на карточках.

## 3. Функциональные требования

- Встроенный Jira `Epic Link` extra field на карточке должен превращаться в HTML-ссылку, если из DOM можно извлечь ключ эпика.
- Jira-helper `IssueLinkBadge` должен рендериться как настоящая ссылка на issue key, а не только как кликабельный `Tag` с обработчиком.
- Ссылка должна иметь формат `${window.location.origin}/browse/{ISSUE_KEY}`.
- Клик по ссылке не должен проваливаться в обработчики карточки Jira.
- Если ключ эпика невозможно извлечь из DOM, поле остается без изменений.
- Кликабельность встроенных `Epic Link` должна управляться чекбоксом в `Additional Card Elements`; по умолчанию включено.
- Кликабельность jira-helper `IssueLinkBadge` должна управляться чекбоксом в настройках issue links; по умолчанию включено.

## 4. Acceptance Criteria

- [ ] Название эпика в задаче отображается как гиперссылка.
- [ ] При клике на название эпика происходит переход к задаче-эпику.
- [ ] Работает для встроенного функционала Jira (`Epic Link` badge).
- [ ] Работает для issue links из jira-helper.
- [ ] Ссылка имеет визуальный индикатор кликабельности.
- [ ] Кликабельность Epic Link можно выключить в настройках Additional Card Elements.
- [ ] Кликабельность Issue Link можно выключить в настройках Issue Link Configurations.
- [ ] Новое поведение покрыто unit/component-level tests.

## 5. Out Of Scope

- Изменение настроек issue links.
- Загрузка недостающих данных эпика из Jira API, если ключ не присутствует в DOM/issue data.
- Изменение поведения не-epic issue links за пределами того, что они остаются настоящими ссылками.

## 6. UI Wireframe

```text
Card
┌──────────────────────────┐
│ TASK-1                   │
│ Summary                  │
│ Epic: Platform Migration │  <- anchor /browse/EPIC-1
│ Linked: Platform Epic    │  <- jira-helper badge anchor
└──────────────────────────┘
```

## Changelog

- **2026-04-29** — создано из issue #20. Затронуто: TASK-72, TASK-73.
- **2026-04-29** — live-тест показал, что Jira board рендерит встроенный Epic Link как `.ghx-highlighted-field .aui-label[data-epickey]`; требование уточнено без изменения scope.
- **2026-04-29** — добавлены требования на настраиваемую кликабельность Epic Link и Issue Link; по умолчанию оба включены.
